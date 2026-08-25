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

import type { CheckoutCustomer } from './giftService';
import {
  getEffectiveTemplatePrice,
  getRequiredPublicTemplateConfigById,
} from './templateService';
import type { TemplateVisualEditorConfig } from '../templates/visualEditor';
import { upsertPublicOrderLookup } from './orderLookupService';
import { reserveUniqueOrderCode } from './orderCodeService';
import {
  GIFT_SCHEMA_VERSION,
  createTemplateRevision,
} from './giftSchema';

const SECURE_GIFT_ALPHABET =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
const MAX_FIRESTORE_PAYLOAD_BYTES = 850_000;

export interface DynamicCheckoutResult {
  giftId: string;
  orderNumber: string;
  orderCode: string;
  price: number;
  currency: string;
  url: string;
  templateName: string;
}

const generateGiftId = (length = 24) => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  return Array.from(
    bytes,
    (byte) =>
      SECURE_GIFT_ALPHABET[
        byte % SECURE_GIFT_ALPHABET.length
      ]
  ).join('');
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(
        new Error(
          'Không thể tối ưu ảnh trước khi tạo đơn.'
        )
      );
    image.src = src;
  });

const compressDataImage = async (
  value: string,
  maxSize = 1080,
  quality = 0.72
) => {
  if (
    !value.startsWith('data:image/') ||
    value.length < 90_000
  ) {
    return value;
  }

  const image = await loadImage(value);
  const scale = Math.min(
    1,
    maxSize / Math.max(image.width, image.height)
  );
  const width = Math.max(
    1,
    Math.round(image.width * scale)
  );
  const height = Math.max(
    1,
    Math.round(image.height * scale)
  );
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) return value;

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
};

const prepareVisualConfig = async (
  config: TemplateVisualEditorConfig
): Promise<TemplateVisualEditorConfig> => {
  const clean = JSON.parse(
    JSON.stringify(config)
  ) as TemplateVisualEditorConfig;

  clean.scenes = await Promise.all(
    clean.scenes.map(async (scene) => ({
      ...scene,
      elements: await Promise.all(
        scene.elements.map(async (element) => {
          if (
            (
              element.type === 'image' ||
              element.type === 'decor' ||
              element.type === 'photo-frame'
            ) &&
            element.src
          ) {
            return {
              ...element,
              src: await compressDataImage(element.src),
            } as typeof element;
          }

          return element;
        })
      ),
    }))
  );

  const payloadBytes = new Blob([
    JSON.stringify(clean),
  ]).size;

  if (payloadBytes > MAX_FIRESTORE_PAYLOAD_BYTES) {
    throw new Error(
      'Ảnh trong mẫu đang quá nặng. Hãy dùng ảnh nhỏ hơn rồi thử lại.'
    );
  }

  return clean;
};

const getAuthenticatedUser = async () => {
  const current = auth.currentUser || (await ensureAuth());
  const user = current || auth.currentUser;

  if (!user) {
    throw new Error(
      'Không thể xác thực phiên thanh toán. Hãy tải lại trang và thử lại.'
    );
  }

  return user;
};

const mapFirestoreError = (error: any) => {
  const code = error?.code || '';

  if (
    code === 'permission-denied' ||
    code === 'firestore/permission-denied'
  ) {
    return new Error(
      'Firestore đang chặn tạo đơn. Hãy kiểm tra Anonymous Auth và firestore.rules.'
    );
  }

  const message = String(error?.message || '').toLowerCase();

  if (
    code === 'resource-exhausted' ||
    code === 'invalid-argument' ||
    message.includes('too large')
  ) {
    return new Error(
      'Dữ liệu mẫu quá nặng để lưu. Hãy giảm dung lượng ảnh rồi thử lại.'
    );
  }

  return error instanceof Error
    ? error
    : new Error('Không thể tạo đơn thanh toán.');
};

export const createDynamicBankTransferOrder = async (
  templateId: string,
  config: TemplateVisualEditorConfig,
  customer: CheckoutCustomer
): Promise<DynamicCheckoutResult> => {
  const giftId = generateGiftId();

  try {
    const [template, user, cleanConfig] = await Promise.all([
      getRequiredPublicTemplateConfigById(templateId),
      getAuthenticatedUser(),
      prepareVisualConfig(config),
    ]);

    const hasScenes = Boolean(
      template.visualEditor?.scenes?.length
    );

    if (
      template.status !== 'available' ||
      !hasScenes
    ) {
      throw new Error('Template này hiện chưa mở bán.');
    }

    // Claim the human-readable order code before creating the gift.
    // Firestore rejects a code that already exists, then the helper
    // automatically retries with another 4-digit number.
    const {
      orderNumber,
      orderCode,
    } = await reserveUniqueOrderCode({
      giftId,
      creatorId: user.uid,
    });

    const price = getEffectiveTemplatePrice(template);
    const currency = template.currency || 'VND';
    const templateRevision =
      createTemplateRevision({
        templateId,
        visualEditor:
          template.visualEditor,
      });
    const now = serverTimestamp();

    await setDoc(
      doc(db, 'gifts', giftId),
      {
        id: giftId,
        config: cleanConfig,
        configType: 'visual-v1',
        schemaVersion:
          GIFT_SCHEMA_VERSION,
        templateRevision,
        senderName: customer.fullName || 'Anonymous',
        receiverName: 'Someone Special',
        creatorId: user.uid,
        status: 'draft',
        isPublished: false,
        createdAt: now,
        updatedAt: now,
        viewCount: 0,
        templateId,
        templateName: template.name,
        price,
        currency,
        paymentStatus: 'waiting_bank_transfer',
        paymentMethod: 'bank_transfer',
        paymentReference: orderCode,
        orderNumber,
        orderCode,
        customer,
      }
    );

    try {
      await upsertPublicOrderLookup({
        orderCode,
        phone: customer.phone,
        templateId,
        templateName: template.name,
        paymentStatus: 'waiting_bank_transfer',
        status: 'draft',
        price,
        currency,
        createdAtMs: Date.now(),
        updatedAtMs: Date.now(),
      });
    } catch (lookupError) {
      console.warn(
        'Public order lookup sync:',
        lookupError
      );
    }

    return {
      giftId,
      orderNumber,
      orderCode,
      price,
      currency,
      templateName: template.name,
      url: `${window.location.origin}/gift/${giftId}`,
    };
  } catch (error) {
    throw mapFirestoreError(error);
  }
};
