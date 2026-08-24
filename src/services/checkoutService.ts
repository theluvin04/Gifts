import {
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import {
  auth,
  db,
  ensureAuth,
} from '../config/firebase';

import type {
  LoveConfig,
} from '../types';

import type {
  CheckoutCustomer,
} from './giftService';

import {
  DEFAULT_LOVE_TEMPLATE_CONFIG,
  getCachedTemplateConfigById,
  getEffectiveTemplatePrice,
  getRequiredPublicTemplateConfigById,
} from './templateService';

import {
  resolveAllTemplateAssetUrls,
} from '../templates/assets';

const TEMPLATE_ID =
  'love-01';

const SECURE_GIFT_ALPHABET =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

const MAX_FIRESTORE_PAYLOAD_BYTES =
  850_000;

export interface CheckoutPricing {
  price: number;
  currency: string;
}

export interface CheckoutIdentity {
  giftId: string;
  orderNumber: string;
  orderCode: string;
}

export interface CreateBankTransferOrderResult
extends CheckoutIdentity {
  price: number;
  currency: string;
  url: string;
}

const getPricingFromTemplate = (
  template:
    typeof DEFAULT_LOVE_TEMPLATE_CONFIG
): CheckoutPricing => {
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
    currency:
      template.currency,
  };
};

export const getCachedCheckoutPricing =
  (): CheckoutPricing => {
    const cached =
      getCachedTemplateConfigById(
        TEMPLATE_ID
      );

    return getPricingFromTemplate(
      cached ||
      DEFAULT_LOVE_TEMPLATE_CONFIG
    );
  };

export const refreshCheckoutPricing =
  async (): Promise<CheckoutPricing> => {
    const template =
      await getRequiredPublicTemplateConfigById(
        TEMPLATE_ID
      );

    return getPricingFromTemplate(
      template
    );
  };

const generateSecureGiftId = (
  length = 24
) => {
  const bytes =
    new Uint8Array(length);

  crypto.getRandomValues(
    bytes
  );

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
  const bytes =
    new Uint32Array(1);

  crypto.getRandomValues(
    bytes
  );

  return String(
    1000 +
      (
        bytes[0] %
        9000
      )
  );
};

const createCheckoutIdentity =
  (): CheckoutIdentity => {
    const orderNumber =
      generateOrderNumber();

    return {
      giftId:
        generateSecureGiftId(),
      orderNumber,
      orderCode:
        `Dearly${orderNumber}`,
    };
  };

const loadImage = (
  src: string
) => {
  return new Promise<
    HTMLImageElement
  >((resolve, reject) => {
    const image =
      new Image();

    image.onload =
      () => resolve(image);

    image.onerror =
      () =>
        reject(
          new Error(
            'Không thể tối ưu ảnh trước khi tạo đơn.'
          )
        );

    image.src = src;
  });
};

const compressDataImage =
  async (
    value: string,
    maxSize = 720,
    quality = 0.62
  ) => {
    if (
      !value.startsWith(
        'data:image/'
      )
    ) {
      return value;
    }

    if (
      value.length <
      90_000
    ) {
      return value;
    }

    const image =
      await loadImage(value);

    const scale =
      Math.min(
        1,
        maxSize /
          Math.max(
            image.width,
            image.height
          )
      );

    const width =
      Math.max(
        1,
        Math.round(
          image.width *
          scale
        )
      );

    const height =
      Math.max(
        1,
        Math.round(
          image.height *
          scale
        )
      );

    const canvas =
      document.createElement(
        'canvas'
      );

    canvas.width = width;
    canvas.height = height;

    const context =
      canvas.getContext('2d');

    if (!context) {
      return value;
    }

    context.drawImage(
      image,
      0,
      0,
      width,
      height
    );

    return canvas.toDataURL(
      'image/jpeg',
      quality
    );
  };

const prepareConfigForFirestore =
  async (
    config: LoveConfig
  ): Promise<LoveConfig> => {
    const clean =
      JSON.parse(
        JSON.stringify(
          config
        )
      ) as LoveConfig;

    clean.gifts.gift1.photos =
      await Promise.all(
        clean.gifts.gift1.photos.map(
          async (photo) => ({
            ...photo,
            url:
              await compressDataImage(
                photo.url
              ),
          })
        )
      );

    clean.gifts.gift2.playlist =
      await Promise.all(
        clean.gifts.gift2.playlist.map(
          async (track) => ({
            ...track,
            coverUrl:
              await compressDataImage(
                track.coverUrl
              ),
          })
        )
      );

    const payloadBytes =
      new Blob([
        JSON.stringify(clean),
      ]).size;

    if (
      payloadBytes >
      MAX_FIRESTORE_PAYLOAD_BYTES
    ) {
      throw new Error(
        'Ảnh trong món quà vẫn quá nặng để lưu. Hãy dùng ảnh nhỏ hơn rồi thử lại.'
      );
    }

    return clean;
  };

const getAuthenticatedUser =
  async () => {
    const current =
      auth.currentUser ||
      await ensureAuth();

    const user =
      current ||
      auth.currentUser;

    if (!user) {
      throw new Error(
        'Không thể xác thực phiên tạo quà. Hãy tải lại trang và thử lại.'
      );
    }

    return user;
  };

const mapFirestoreError = (
  error: any
) => {
  const code =
    error?.code || '';

  if (
    code ===
      'permission-denied' ||
    code ===
      'firestore/permission-denied'
  ) {
    return new Error(
      'Firestore đang chặn tạo đơn. Hãy kiểm tra firestore.rules đã Publish đúng database.'
    );
  }

  const message =
    String(
      error?.message || ''
    ).toLowerCase();

  if (
    code ===
      'resource-exhausted' ||
    code ===
      'invalid-argument' ||
    message.includes(
      'too large'
    ) ||
    message.includes(
      'longer than'
    )
  ) {
    return new Error(
      'Dữ liệu món quà quá nặng để lưu. Hãy giảm dung lượng ảnh rồi thử lại.'
    );
  }

  return error instanceof Error
    ? error
    : new Error(
        'Không thể tạo đơn thanh toán.'
      );
};

export const createBankTransferOrder =
  async (
    config: LoveConfig,
    customer:
      CheckoutCustomer
  ): Promise<
    CreateBankTransferOrderResult
  > => {
    const identity =
      createCheckoutIdentity();

    try {
      const [
        template,
        user,
        cleanConfig,
      ] =
        await Promise.all([
          getRequiredPublicTemplateConfigById(
            TEMPLATE_ID
          ),
          getAuthenticatedUser(),
          prepareConfigForFirestore(
            config
          ),
        ]);

      const pricing =
        getPricingFromTemplate(
          template
        );

      // Snapshot mẫu gốc tại thời điểm thanh toán.
      // Admin đổi template sau này sẽ không làm đổi gift đã bán.
      cleanConfig.design =
        template.design;

      cleanConfig.resolvedAssets =
        resolveAllTemplateAssetUrls(
          template.assets,
          cleanConfig.assetSelections
        );

      const now =
        serverTimestamp();

      await setDoc(
        doc(
          db,
          'gifts',
          identity.giftId
        ),
        {
          id:
            identity.giftId,
          config:
            cleanConfig,
          senderName:
            cleanConfig.couple
              .senderName ||
            'Anonymous',
          receiverName:
            cleanConfig.couple
              .receiverName ||
            'Someone Special',
          creatorId:
            user.uid,
          status:
            'draft',
          isPublished:
            false,
          createdAt:
            now,
          updatedAt:
            now,
          viewCount:
            0,
          templateId:
            TEMPLATE_ID,
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

      return {
        ...identity,
        ...pricing,
        url:
          `${window.location.origin}/gift/${identity.giftId}`,
      };
    } catch (error) {
      throw mapFirestoreError(
        error
      );
    }
  };
