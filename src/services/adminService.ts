import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import {
  db,
  signInAdminWithGoogle,
  signOutAdmin,
  waitForAuthReady,
} from '../config/firebase';

import {
  SavedGiftDocument,
} from './giftService';

import {
  DEFAULT_LOVE_TEMPLATE_CONFIG,
  TemplateConfig,
  normalizeTemplateConfig,
} from './templateService';

export interface AdminSession {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  isSignedIn: boolean;
  isGoogleUser: boolean;
  isAdmin: boolean;
}

export interface AdminOrderRecord
  extends SavedGiftDocument {
  createdAtMs: number;
  updatedAtMs: number;
  paidAtMs: number;
}

const timestampToMillis = (
  value: unknown
): number => {
  if (!value) {
    return 0;
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'toMillis' in value &&
    typeof (value as any).toMillis ===
      'function'
  ) {
    return (value as any).toMillis();
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'seconds' in value &&
    typeof (value as any).seconds ===
      'number'
  ) {
    return (
      (value as any).seconds * 1000
    );
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  return 0;
};

const buildEmptySession =
  (): AdminSession => ({
    uid: '',
    email: '',
    displayName: '',
    photoURL: '',
    isSignedIn: false,
    isGoogleUser: false,
    isAdmin: false,
  });

export const getAdminSession =
  async (): Promise<AdminSession> => {
    const user =
      await waitForAuthReady();

    if (!user) {
      return buildEmptySession();
    }

    const isGoogleUser =
      user.providerData.some(
        (provider) =>
          provider.providerId ===
          'google.com'
      );

    const email =
      user.email || '';

    if (
      !isGoogleUser ||
      !email
    ) {
      return {
        uid: user.uid,
        email,
        displayName:
          user.displayName || '',
        photoURL:
          user.photoURL || '',
        isSignedIn: true,
        isGoogleUser: false,
        isAdmin: false,
      };
    }

    const candidates = [
      email,
      email.toLowerCase(),
      user.uid,
    ].filter(Boolean);

    let isAdmin = false;

    for (const key of candidates) {
      try {
        const adminRef = doc(
          db,
          'admins',
          key
        );
        const snapshot =
          await getDoc(adminRef);

        if (
          snapshot.exists() &&
          snapshot.data()?.enabled === true
        ) {
          isAdmin = true;
          break;
        }
      } catch (err) {
        console.warn('Admin check candidate failed:', key, err);
      }
    }

    return {
      uid: user.uid,
      email,
      displayName:
        user.displayName || '',
      photoURL:
        user.photoURL || '',
      isSignedIn: true,
      isGoogleUser: true,
      isAdmin,
    };
  };

export const loginAdminWithGoogle =
  async () => {
    await signInAdminWithGoogle();

    return getAdminSession();
  };

export const logoutAdmin =
  async () => {
    await signOutAdmin();
  };

const normalizeOrder = (
  id: string,
  data: SavedGiftDocument
): AdminOrderRecord => {
  return {
    ...data,
    id,
    createdAtMs:
      timestampToMillis(
        data.createdAt
      ),
    updatedAtMs:
      timestampToMillis(
        data.updatedAt
      ),
    paidAtMs:
      timestampToMillis(
        data.paidAt
      ),
  };
};

const assertAdminAccess =
  async () => {
    const session =
      await getAdminSession();

    if (!session.isAdmin) {
      throw new Error(
        'Tài khoản này không có quyền Admin.'
      );
    }

    return session;
  };

export const listAdminOrders =
  async (): Promise<
    AdminOrderRecord[]
  > => {
    await assertAdminAccess();

    const giftsQuery = query(
      collection(db, 'gifts'),
      limit(200)
    );

    const snapshot =
      await getDocs(giftsQuery);

    const orders =
      snapshot.docs.map(
        (giftSnapshot) =>
          normalizeOrder(
            giftSnapshot.id,
            giftSnapshot.data() as SavedGiftDocument
          )
      );

    return orders.sort(
      (left, right) =>
        right.createdAtMs -
        left.createdAtMs
    );
  };

export const getAdminOrderById =
  async (
    giftId: string
  ): Promise<
    AdminOrderRecord | null
  > => {
    await assertAdminAccess();

    const giftRef = doc(
      db,
      'gifts',
      giftId
    );

    const snapshot =
      await getDoc(giftRef);

    if (!snapshot.exists()) {
      return null;
    }

    return normalizeOrder(
      snapshot.id,
      snapshot.data() as SavedGiftDocument
    );
  };

export const markAdminOrderPaid =
  async (
    giftId: string
  ) => {
    await assertAdminAccess();

    const giftRef = doc(
      db,
      'gifts',
      giftId
    );

    await updateDoc(
      giftRef,
      {
        paymentStatus: 'paid',
        paidAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
    );
  };

export const confirmAdminBankPayment =
  async (
    giftId: string
  ) => {
    await assertAdminAccess();

    const giftRef = doc(
      db,
      'gifts',
      giftId
    );

    const now =
      serverTimestamp();

    await updateDoc(
      giftRef,
      {
        paymentStatus: 'paid',
        paidAt: now,
        status: 'published',
        isPublished: true,
        publishedAt: now,
        updatedAt: now,
      }
    );
  };

export const setAdminGiftPublished =
  async (
    giftId: string,
    published: boolean
  ) => {
    await assertAdminAccess();

    const giftRef = doc(
      db,
      'gifts',
      giftId
    );

    await updateDoc(
      giftRef,
      {
        status: published
          ? 'published'
          : 'draft',
        isPublished: published,
        publishedAt: published
          ? serverTimestamp()
          : null,
        updatedAt: serverTimestamp(),
      }
    );
  };

export const deleteAdminOrder =
  async (
    giftId: string
  ) => {
    await assertAdminAccess();

    await deleteDoc(
      doc(
        db,
        'gifts',
        giftId
      )
    );
  };


export const getAdminTemplateConfig =
  async (): Promise<TemplateConfig> => {
    await assertAdminAccess();

    const templateRef = doc(
      db,
      'templates',
      'love-01'
    );

    const snapshot =
      await getDoc(templateRef);

    if (!snapshot.exists()) {
      return {
        ...DEFAULT_LOVE_TEMPLATE_CONFIG,
      };
    }

    return normalizeTemplateConfig(
      snapshot.data()
    );
  };

export const saveAdminTemplateConfig =
  async (
    template: TemplateConfig
  ) => {
    await assertAdminAccess();

    const normalized =
      normalizeTemplateConfig(
        template as unknown as Record<
          string,
          any
        >
      );

    await setDoc(
      doc(
        db,
        'templates',
        'love-01'
      ),
      {
        ...normalized,
        id: 'love-01',
        updatedAt:
          serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    return normalized;
  };
