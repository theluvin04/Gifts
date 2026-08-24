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
  deletePublicOrderLookupFromGift,
  syncPublicOrderLookupFromGift,
} from './orderLookupService';

import {
  DEFAULT_LOVE_TEMPLATE_CONFIG,
  TemplateConfig,
  normalizeTemplateConfig,
} from './templateService';

import {
  createBlankVisualEditorConfig,
} from '../templates/visualEditor';

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

const safeSyncPublicLookup =
  async (
    order:
      AdminOrderRecord
  ) => {
    try {
      await syncPublicOrderLookupFromGift(
        order
      );
    } catch (error) {
      console.warn(
        'Public order lookup sync failed:',
        order.id,
        error
      );
    }
  };

const syncPublicLookupByGiftId =
  async (
    giftId: string
  ) => {
    try {
      const snapshot =
        await getDoc(
          doc(
            db,
            'gifts',
            giftId
          )
        );

      if (
        !snapshot.exists()
      ) {
        return;
      }

      await safeSyncPublicLookup(
        normalizeOrder(
          snapshot.id,
          snapshot.data() as SavedGiftDocument
        )
      );
    } catch (error) {
      console.warn(
        'Public order lookup refresh failed:',
        giftId,
        error
      );
    }
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

    const sorted =
      orders.sort(
        (left, right) =>
          right.createdAtMs -
          left.createdAtMs
      );

    // Backfill lookup cho đơn cũ.
    // Không chặn giao diện Admin.
    void Promise.allSettled(
      sorted.map(
        safeSyncPublicLookup
      )
    );

    return sorted;
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

    const order =
      normalizeOrder(
        snapshot.id,
        snapshot.data() as SavedGiftDocument
      );

    void safeSyncPublicLookup(
      order
    );

    return order;
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

    await syncPublicLookupByGiftId(
      giftId
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

    await syncPublicLookupByGiftId(
      giftId
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

    await syncPublicLookupByGiftId(
      giftId
    );
  };

export const deleteAdminOrder =
  async (
    giftId: string
  ) => {
    await assertAdminAccess();

    const giftRef =
      doc(
        db,
        'gifts',
        giftId
      );

    const snapshot =
      await getDoc(
        giftRef
      );

    if (
      snapshot.exists()
    ) {
      try {
        await deletePublicOrderLookupFromGift(
          snapshot.data() as SavedGiftDocument
        );
      } catch (error) {
        console.warn(
          'Public order lookup delete failed:',
          giftId,
          error
        );
      }
    }

    await deleteDoc(
      giftRef
    );
  };


export type AdminTemplateCreateMode =
  | 'blank'
  | 'duplicate';

export interface AdminTemplateCreateInput {
  id: string;
  name: string;
  mode:
    AdminTemplateCreateMode;
  source?:
    TemplateConfig;
}

const TEMPLATE_ID_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const cloneTemplateValue =
  <T,>(
    value: T
  ): T =>
    JSON.parse(
      JSON.stringify(
        value
      )
    );

const normalizeAdminTemplateId =
  (
    templateId: string
  ) => {
    const normalized =
      templateId
        .trim()
        .toLowerCase()
        .replace(
          /[^a-z0-9]+/g,
          '-'
        )
        .replace(
          /^-+|-+$/g,
          ''
        );

    if (
      !normalized ||
      !TEMPLATE_ID_PATTERN
        .test(
          normalized
        )
    ) {
      const error =
        new Error(
          'ID sản phẩm chỉ được dùng chữ thường, số và dấu gạch ngang.'
        ) as
          Error & {
            code?: string;
          };

      error.code =
        'template/invalid-id';

      throw error;
    }

    return normalized;
  };

const buildTemplateFallback =
  (
    templateId: string,
    name?: string
  ):
    TemplateConfig => {
    const fallback =
      cloneTemplateValue(
        DEFAULT_LOVE_TEMPLATE_CONFIG
      );

    fallback.id =
      templateId;

    fallback.name =
      name?.trim() ||
      templateId;

    fallback.status =
      'coming_soon';

    fallback.visible =
      false;

    fallback.saleEnabled =
      false;

    fallback.promotionLabel =
      '';

    fallback.visualEditor =
      createBlankVisualEditorConfig();

    return fallback;
  };

export const buildAdminTemplateDraft =
  (
    input:
      AdminTemplateCreateInput
  ):
    TemplateConfig => {
    const id =
      normalizeAdminTemplateId(
        input.id
      );

    const name =
      input.name
        .trim() ||
      id;

    if (
      input.mode ===
        'duplicate' &&
      input.source
    ) {
      const duplicate =
        cloneTemplateValue(
          input.source
        );

      duplicate.id =
        id;

      duplicate.name =
        name;

      duplicate.status =
        'coming_soon';

      duplicate.visible =
        false;

      duplicate.promotionLabel =
        '';

      return normalizeTemplateConfig(
        duplicate as unknown as
          Record<
            string,
            any
          >,
        buildTemplateFallback(
          id,
          name
        )
      );
    }

    const blank =
      buildTemplateFallback(
        id,
        name
      );

    blank.basePrice =
      99000;

    blank.salePrice =
      79000;

    blank.saleEnabled =
      false;

    blank.visualEditor =
      createBlankVisualEditorConfig();

    return blank;
  };

export const listAdminTemplateConfigs =
  async ():
    Promise<
      TemplateConfig[]
    > => {
    await assertAdminAccess();

    const snapshot =
      await getDocs(
        collection(
          db,
          'templates'
        )
      );

    const templates =
      snapshot.docs.map(
        (
          templateSnapshot
        ) => {
          const data =
            templateSnapshot
              .data();

          const id =
            templateSnapshot.id;

          const fallback =
            buildTemplateFallback(
              id,
              typeof data
                .name ===
                'string'
                ? data.name
                : id
            );

          return normalizeTemplateConfig(
            {
              ...data,
              id,
            },
            fallback
          );
        }
      );

    if (
      templates.length ===
      0
    ) {
      return [
        cloneTemplateValue(
          DEFAULT_LOVE_TEMPLATE_CONFIG
        ),
      ];
    }

    return templates.sort(
      (
        left,
        right
      ) => {
        if (
          left.id ===
          'love-01'
        ) {
          return -1;
        }

        if (
          right.id ===
          'love-01'
        ) {
          return 1;
        }

        return left.name.localeCompare(
          right.name,
          'vi'
        );
      }
    );
  };

export const getAdminTemplateConfig =
  async (
    templateId =
      'love-01'
  ):
    Promise<
      TemplateConfig
    > => {
    await assertAdminAccess();

    const id =
      normalizeAdminTemplateId(
        templateId
      );

    try {
      const templateRef =
        doc(
          db,
          'templates',
          id
        );

      const snapshot =
        await getDoc(
          templateRef
        );

      if (
        !snapshot.exists()
      ) {
        if (
          id ===
          'love-01'
        ) {
          return cloneTemplateValue(
            DEFAULT_LOVE_TEMPLATE_CONFIG
          );
        }

        return buildTemplateFallback(
          id
        );
      }

      const data =
        snapshot.data();

      return normalizeTemplateConfig(
        {
          ...data,
          id,
        },
        buildTemplateFallback(
          id,
          typeof data.name ===
            'string'
            ? data.name
            : id
        )
      );
    } catch (
      error
    ) {
      console.warn(
        'Admin template config fallback:',
        error
      );

      if (
        id ===
        'love-01'
      ) {
        return cloneTemplateValue(
          DEFAULT_LOVE_TEMPLATE_CONFIG
        );
      }

      return buildTemplateFallback(
        id
      );
    }
  };

export const saveAdminTemplateConfig =
  async (
    template:
      TemplateConfig
  ) => {
    await assertAdminAccess();

    const id =
      normalizeAdminTemplateId(
        template.id
      );

    const normalized =
      normalizeTemplateConfig(
        {
          ...template,
          id,
        } as unknown as
          Record<
            string,
            any
          >,
        buildTemplateFallback(
          id,
          template.name
        )
      );

    await setDoc(
      doc(
        db,
        'templates',
        id
      ),
      {
        ...normalized,
        id,
        updatedAt:
          serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    return normalized;
  };

export const createAdminTemplateConfig =
  async (
    input:
      AdminTemplateCreateInput
  ) => {
    await assertAdminAccess();

    const draft =
      buildAdminTemplateDraft(
        input
      );

    const ref =
      doc(
        db,
        'templates',
        draft.id
      );

    const existing =
      await getDoc(
        ref
      );

    if (
      existing.exists()
    ) {
      const error =
        new Error(
          `Sản phẩm "${draft.id}" đã tồn tại.`
        ) as
          Error & {
            code?: string;
          };

      error.code =
        'template/already-exists';

      throw error;
    }

    await setDoc(
      ref,
      {
        ...draft,
        createdAt:
          serverTimestamp(),
        updatedAt:
          serverTimestamp(),
      }
    );

    return draft;
  };

export const duplicateAdminTemplateConfig =
  async (
    source:
      TemplateConfig,
    id: string,
    name: string
  ) => {
    return createAdminTemplateConfig({
      id,
      name,
      mode:
        'duplicate',
      source,
    });
  };

export const deleteAdminTemplateConfig =
  async (
    templateId: string
  ) => {
    await assertAdminAccess();

    const id =
      normalizeAdminTemplateId(
        templateId
      );

    if (
      id ===
      'love-01'
    ) {
      const error =
        new Error(
          'love-01 là template mặc định của hệ thống nên không thể xóa.'
        ) as
          Error & {
            code?: string;
          };

      error.code =
        'template/protected';

      throw error;
    }

    await deleteDoc(
      doc(
        db,
        'templates',
        id
      )
    );
  };
