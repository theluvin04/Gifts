import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
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

    const adminRef = doc(
      db,
      'admins',
      email
    );

    const snapshot =
      await getDoc(adminRef);

    const isAdmin =
      snapshot.exists() &&
      snapshot.data()?.enabled === true;

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

export const listAdminOrders =
  async (): Promise<
    AdminOrderRecord[]
  > => {
    const giftsQuery = query(
      collection(db, 'gifts'),
      limit(200)
    );

    const snapshot =
      await getDocs(giftsQuery);

    const orders =
      snapshot.docs.map(
        (giftSnapshot) => {
          const data =
            giftSnapshot.data() as SavedGiftDocument;

          return {
            ...data,
            id: giftSnapshot.id,
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
        }
      );

    return orders.sort(
      (left, right) =>
        right.createdAtMs -
        left.createdAtMs
    );
  };
