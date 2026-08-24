import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import {
  auth,
  db,
  ensureAuth,
} from '../config/firebase';

import { LoveConfig } from '../types';

export type GiftStatus =
  | 'draft'
  | 'published';

export type PaymentStatus =
  | 'unpaid'
  | 'waiting_bank_transfer'
  | 'paid_test'
  | 'paid';

export interface CheckoutCustomer {
  fullName: string;
  email: string;
  phone: string;
}

export interface SavedGiftDocument {
  id: string;
  config: LoveConfig;
  createdAt: unknown;
  updatedAt: unknown;
  publishedAt?: unknown;
  paidAt?: unknown;
  creatorId: string;
  senderName: string;
  receiverName: string;
  viewCount: number;
  status: GiftStatus;
  isPublished: boolean;
  templateId?: string;
  price?: number;
  currency?: string;
  paymentStatus?: PaymentStatus;
  paymentMethod?: 'bank_transfer';
  paymentReference?: string;
  customer?: CheckoutCustomer;
}

interface SaveGiftResult {
  id: string;
  url: string;
  status: GiftStatus;
}

export interface CheckoutGiftState {
  id: string;
  status: GiftStatus;
  isPublished: boolean;
  paymentStatus: PaymentStatus;
}

const SAVED_KEYS_STORAGE =
  'gifts:created_ids';

export const LOVE_01_PRICE = 99000;
export const LOVE_01_CURRENCY = 'VND';

const generateGiftId = (
  length = 10
): string => {
  const chars =
    'abcdefghjkmnpqrstuvwxyz23456789';

  let result = '';

  for (
    let index = 0;
    index < length;
    index++
  ) {
    result += chars.charAt(
      Math.floor(
        Math.random() * chars.length
      )
    );
  }

  return result;
};

const buildShareUrl = (
  giftId: string
) => {
  return `${window.location.origin}/gift/${giftId}`;
};

const getAuthenticatedCreatorId =
  async (): Promise<string> => {
    await ensureAuth();

    const creatorId =
      auth.currentUser?.uid;

    if (!creatorId) {
      throw new Error(
        'Không thể xác thực phiên tạo quà. Hãy tải lại trang và thử lại.'
      );
    }

    return creatorId;
  };

export const getMySavedGiftIds =
  (): string[] => {
    try {
      const raw =
        localStorage.getItem(
          SAVED_KEYS_STORAGE
        );

      return raw
        ? JSON.parse(raw)
        : [];
    } catch {
      return [];
    }
  };

export const recordMySavedGiftId = (
  id: string
) => {
  try {
    const current =
      getMySavedGiftIds();

    if (!current.includes(id)) {
      current.unshift(id);

      localStorage.setItem(
        SAVED_KEYS_STORAGE,
        JSON.stringify(
          current.slice(0, 20)
        )
      );
    }
  } catch {
    // Không chặn checkout nếu localStorage lỗi.
  }
};

const saveGift = async (
  config: LoveConfig,
  status: GiftStatus,
  customId?: string,
  extraData: Record<string, unknown> = {}
): Promise<SaveGiftResult> => {
  const creatorId =
    await getAuthenticatedCreatorId();

  const giftId =
    customId ||
    generateGiftId();

  const giftRef = doc(
    db,
    'gifts',
    giftId
  );

  let existingData:
    | Record<string, any>
    | null = null;

  if (customId) {
    const existing =
      await getDoc(giftRef);

    if (existing.exists()) {
      existingData = existing.data();

      if (
        existingData.creatorId !==
        creatorId
      ) {
        throw new Error(
          'Bạn không có quyền sửa món quà này.'
        );
      }
    }
  }

  const now = serverTimestamp();

  const docData: Record<
    string,
    unknown
  > = {
    id: giftId,
    config,
    senderName:
      config.couple.senderName ||
      'Anonymous',
    receiverName:
      config.couple.receiverName ||
      'Someone Special',
    creatorId,
    status,
    isPublished:
      status === 'published',
    updatedAt: now,
    ...extraData,
  };

  if (!existingData) {
    docData.createdAt = now;
    docData.viewCount = 0;
  }

  if (status === 'published') {
    docData.publishedAt = now;
  }

  await setDoc(
    giftRef,
    docData,
    {
      merge: true,
    }
  );

  recordMySavedGiftId(giftId);

  return {
    id: giftId,
    url: buildShareUrl(giftId),
    status,
  };
};

export const saveGiftDraftToFirestore =
  async (
    config: LoveConfig,
    customId?: string
  ) => {
    if (customId) {
      const existingRef = doc(
        db,
        'gifts',
        customId
      );

      const existing =
        await getDoc(existingRef);

      if (existing.exists()) {
        const existingData =
          existing.data() as SavedGiftDocument;

        if (
          existingData.status ===
            'published' ||
          existingData.isPublished === true
        ) {
          return {
            id: customId,
            url: buildShareUrl(
              customId
            ),
            status:
              'published' as const,
          };
        }

        return saveGift(
          config,
          'draft',
          customId,
          {
            templateId:
              existingData.templateId ||
              'love-01',
            price:
              existingData.price ??
              LOVE_01_PRICE,
            currency:
              existingData.currency ||
              LOVE_01_CURRENCY,
            paymentStatus:
              existingData.paymentStatus ||
              'unpaid',
            paymentMethod:
              existingData.paymentMethod,
            paymentReference:
              existingData.paymentReference,
            customer:
              existingData.customer,
          }
        );
      }
    }

    return saveGift(
      config,
      'draft',
      customId,
      {
        templateId: 'love-01',
        price: LOVE_01_PRICE,
        currency:
          LOVE_01_CURRENCY,
        paymentStatus: 'unpaid',
      }
    );
  };

/**
 * Giữ lại hàm publish trực tiếp để tương thích code cũ.
 * UI mới không gọi hàm này trước checkout.
 */
export const publishGiftToFirestore =
  async (
    config: LoveConfig,
    customId?: string
  ) => {
    return saveGift(
      config,
      'published',
      customId,
      {
        templateId: 'love-01',
        price: LOVE_01_PRICE,
        currency:
          LOVE_01_CURRENCY,
      }
    );
  };

export const submitBankTransferCheckout =
  async (
    config: LoveConfig,
    giftId: string,
    customer: CheckoutCustomer,
    paymentReference: string
  ) => {
    if (!giftId) {
      throw new Error(
        'Chưa có mã đơn nháp.'
      );
    }

    return saveGift(
      config,
      'draft',
      giftId,
      {
        templateId: 'love-01',
        price: LOVE_01_PRICE,
        currency:
          LOVE_01_CURRENCY,
        paymentStatus:
          'waiting_bank_transfer',
        paymentMethod:
          'bank_transfer',
        paymentReference,
        customer,
      }
    );
  };

export const fetchCheckoutGiftState =
  async (
    giftId: string
  ): Promise<
    CheckoutGiftState | null
  > => {
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

    const data =
      snapshot.data() as SavedGiftDocument;

    return {
      id: snapshot.id,
      status:
        data.status || 'draft',
      isPublished:
        data.isPublished === true,
      paymentStatus:
        data.paymentStatus ||
        'unpaid',
    };
  };

/**
 * Checkout test:
 * - cập nhật thông tin người mua
 * - đánh dấu đã thanh toán test
 * - chuyển draft -> published
 */
export const publishGiftAfterTestPayment =
  async (
    config: LoveConfig,
    giftId: string,
    customer: CheckoutCustomer
  ) => {
    if (!giftId) {
      throw new Error(
        'Chưa có mã đơn nháp.'
      );
    }

    return saveGift(
      config,
      'published',
      giftId,
      {
        templateId: 'love-01',
        price: LOVE_01_PRICE,
        currency:
          LOVE_01_CURRENCY,
        paymentStatus:
          'paid_test',
        customer,
        paidAt:
          serverTimestamp(),
      }
    );
  };

/**
 * Alias để code cũ không vỡ nếu vẫn còn import tên này.
 */
export const saveGiftToFirestore =
  publishGiftToFirestore;

export const fetchGiftFromFirestore =
  async (
    giftId: string
  ): Promise<SavedGiftDocument | null> => {
    try {
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

      const data =
        snapshot.data() as SavedGiftDocument;

      const isPublished =
        data.status ===
          'published' ||
        data.isPublished === true;

      if (!isPublished) {
        return null;
      }

      return data;
    } catch (error) {
      console.error(
        'Error fetching gift from Firestore:',
        error
      );

      return null;
    }
  };
