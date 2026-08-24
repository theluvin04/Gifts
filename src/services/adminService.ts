import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
} from 'firebase/firestore';

import {
  auth,
  db,
  ensureAuth,
} from '../config/firebase';

import {
  SavedGiftDocument,
} from './giftService';

export interface AdminSession {
  uid: string;
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

export const getAdminSession =
  async (): Promise<AdminSession> => {
    await ensureAuth();

    const uid = auth.currentUser?.uid;

    if (!uid) {
      throw new Error(
        'Không thể xác thực phiên admin.'
      );
    }

    const adminRef = doc(
      db,
      'admins',
      uid
    );

    const snapshot =
      await getDoc(adminRef);

    const isAdmin =
      snapshot.exists() &&
      snapshot.data()?.enabled === true;

    return {
      uid,
      isAdmin,
    };
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
