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

import {
  DEFAULT_LOVE_TEMPLATE_CONFIG,
  getEffectiveTemplatePrice,
  getRequiredPublicTemplateConfig,
} from './templateService';

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
  orderNumber?: string;
  orderCode?: string;
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
  price: number;
  currency: string;
  orderNumber: string;
  orderCode: string;
}

const SAVED_KEYS_STORAGE =
  'gifts:created_ids';

export const LOVE_01_PRICE =
  DEFAULT_LOVE_TEMPLATE_CONFIG.salePrice;

export const LOVE_01_CURRENCY =
  DEFAULT_LOVE_TEMPLATE_CONFIG.currency;

const getCurrentLoveTemplatePrice =
  async () => {
    const template =
      await getRequiredPublicTemplateConfig();

    if (
      !template.visible ||
      template.status !==
        'available'
    ) {
      throw new Error(
        'Template này đang tạm ngừng nhận đơn.'
      );
    }

    return {
      price:
        getEffectiveTemplatePrice(
          template
        ),
      currency: template.currency,
    };
  };

export const getCurrentCheckoutPricing =
  async () => {
    return getCurrentLoveTemplatePrice();
  };

const SECURE_GIFT_ALPHABET =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

export interface CheckoutIdentity {
  giftId: string;
  orderNumber: string;
  orderCode: string;
}

export const generateSecureGiftId = (
  length = 24
) => {
  const bytes =
    new Uint8Array(length);

  crypto.getRandomValues(bytes);

  return Array.from(
    bytes,
    (byte) =>
      SECURE_GIFT_ALPHABET[
        byte %
        SECURE_GIFT_ALPHABET.length
      ]
  ).join('');
};

const generateOrderNumber = () => {
  return String(
    1000 +
      Math.floor(
        Math.random() * 9000
      )
  );
};

export const createCheckoutIdentity =
  async (): Promise<CheckoutIdentity> => {
    const creatorId =
      await getAuthenticatedCreatorId();

    const giftId =
      generateSecureGiftId();

    for (
      let attempt = 0;
      attempt < 50;
      attempt++
    ) {
      const orderNumber =
        generateOrderNumber();

      const orderCode =
        `Dearly${orderNumber}`;

      try {
        // /orderCodes/{4 số} chỉ cho phép CREATE.
        // Nếu mã đã tồn tại, Firestore sẽ từ chối update
        // và vòng lặp sẽ thử mã khác.
        await setDoc(
          doc(
            db,
            'orderCodes',
            orderNumber
          ),
          {
            orderNumber,
            orderCode,
            giftId,
            creatorId,
            createdAt:
              serverTimestamp(),
          }
        );

        return {
          giftId,
          orderNumber,
          orderCode,
        };
      } catch (error: any) {
        const code =
          error?.code || '';

        if (
          code ===
            'permission-denied' ||
          code ===
            'firestore/permission-denied'
        ) {
          continue;
        }

        throw error;
      }
    }

    throw new Error(
      'Không thể tạo mã đơn 4 số mới. Hãy thử lại.'
    );
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
    generateSecureGiftId();

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

        const pricing =
          await getCurrentLoveTemplatePrice();

        return saveGift(
          config,
          'draft',
          customId,
          {
            templateId:
              existingData.templateId ||
              'love-01',
            price:
              pricing.price,
            currency:
              pricing.currency,
            paymentStatus:
              existingData.paymentStatus ||
              'unpaid',
            paymentMethod:
              existingData.paymentMethod,
            paymentReference:
              existingData.paymentReference,
            orderNumber:
              existingData.orderNumber,
            orderCode:
              existingData.orderCode,
            customer:
              existingData.customer,
          }
        );
      }
    }

    const pricing =
      await getCurrentLoveTemplatePrice();

    return saveGift(
      config,
      'draft',
      customId,
      {
        templateId: 'love-01',
        price: pricing.price,
        currency:
          pricing.currency,
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
    const pricing =
      await getCurrentLoveTemplatePrice();

    return saveGift(
      config,
      'published',
      customId,
      {
        templateId: 'love-01',
        price: pricing.price,
        currency:
          pricing.currency,
      }
    );
  };

export const submitBankTransferCheckout =
  async (
    config: LoveConfig,
    identity: CheckoutIdentity,
    customer: CheckoutCustomer
  ) => {
    if (
      !identity.giftId ||
      !/^\d{4}$/.test(
        identity.orderNumber
      )
    ) {
      throw new Error(
        'Thông tin đơn hàng không hợp lệ.'
      );
    }

    const pricing =
      await getCurrentLoveTemplatePrice();

    return saveGift(
      config,
      'draft',
      identity.giftId,
      {
        templateId: 'love-01',
        price:
          pricing.price,
        currency:
          pricing.currency,
        paymentStatus:
          'waiting_bank_transfer',
        paymentMethod:
          'bank_transfer',
        paymentReference:
          identity.orderCode,
        orderNumber:
          identity.orderNumber,
        orderCode:
          identity.orderCode,
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

    let price =
      typeof data.price ===
        'number'
        ? data.price
        : null;

    let currency =
      data.currency || '';

    if (
      price === null ||
      !currency
    ) {
      const pricing =
        await getCurrentLoveTemplatePrice();

      price =
        price ??
        pricing.price;

      currency =
        currency ||
        pricing.currency;
    }

    return {
      id: snapshot.id,
      status:
        data.status || 'draft',
      isPublished:
        data.isPublished === true,
      paymentStatus:
        data.paymentStatus ||
        'unpaid',
      price,
      currency,
      orderNumber:
        data.orderNumber || '',
      orderCode:
        data.orderCode ||
        data.paymentReference ||
        '',
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

    const pricing =
      await getCurrentLoveTemplatePrice();

    return saveGift(
      config,
      'published',
      giftId,
      {
        templateId: 'love-01',
        price:
          pricing.price,
        currency:
          pricing.currency,
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
