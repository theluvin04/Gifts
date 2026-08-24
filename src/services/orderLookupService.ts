import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
} from 'firebase/firestore';

import {
  db,
} from '../config/firebase';

import type {
  GiftStatus,
  PaymentStatus,
  SavedGiftDocument,
} from './giftService';

export interface PublicOrderLookupRecord {
  orderCode: string;
  orderCodeLower: string;
  phoneHash: string;
  templateId: string;
  templateName: string;
  paymentStatus: PaymentStatus;
  status: GiftStatus;
  price: number;
  currency: string;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface PublicOrderLookupInput {
  orderCode: string;
  phone: string;
  templateId?: string;
  templateName?: string;
  paymentStatus?: PaymentStatus;
  status?: GiftStatus;
  price?: number;
  currency?: string;
  createdAtMs?: number;
  updatedAtMs?: number;
}

const LOOKUP_COLLECTION =
  'orderLookupRecords';

const normalizePhone = (
  value: string
) => {
  let digits =
    value.replace(
      /\D/g,
      ''
    );

  if (
    digits.startsWith(
      '0084'
    )
  ) {
    digits =
      `0${digits.slice(4)}`;
  } else if (
    digits.startsWith(
      '84'
    ) &&
    digits.length >= 11
  ) {
    digits =
      `0${digits.slice(2)}`;
  }

  return digits;
};

export const normalizeOrderCode = (
  value: string
) => {
  const trimmed =
    value.trim();

  if (
    /^\d{4}$/.test(
      trimmed
    )
  ) {
    return `Dearly${trimmed}`;
  }

  const match =
    trimmed.match(
      /^dearly\s*[-_]?\s*(\d{4})$/i
    );

  if (!match) {
    return '';
  }

  return `Dearly${match[1]}`;
};

const sha256Hex = async (
  value: string
) => {
  if (
    !crypto?.subtle
  ) {
    throw new Error(
      'Trình duyệt này không hỗ trợ tra cứu bảo mật.'
    );
  }

  const bytes =
    new TextEncoder()
      .encode(value);

  const digest =
    await crypto.subtle.digest(
      'SHA-256',
      bytes
    );

  return Array.from(
    new Uint8Array(
      digest
    )
  )
    .map(
      (byte) =>
        byte
          .toString(16)
          .padStart(2, '0')
    )
    .join('');
};

export const hashPhoneForLookup =
  async (
    phone: string
  ) => {
    const normalized =
      normalizePhone(phone);

    if (
      !/^\d{9,12}$/.test(
        normalized
      )
    ) {
      throw new Error(
        'Số điện thoại không hợp lệ.'
      );
    }

    return sha256Hex(
      normalized
    );
  };

const buildLookupId = async (
  orderCode: string,
  phone: string
) => {
  const normalizedCode =
    normalizeOrderCode(
      orderCode
    );

  const phoneHash =
    await hashPhoneForLookup(
      phone
    );

  if (!normalizedCode) {
    throw new Error(
      'Mã đơn không hợp lệ.'
    );
  }

  return {
    id:
      await sha256Hex(
        `${normalizedCode.toLowerCase()}|${phoneHash}`
      ),
    phoneHash,
    normalizedCode,
  };
};

const templateNameFromId = (
  templateId: string
) => {
  if (
    templateId ===
    'love-01'
  ) {
    return 'Love Story 01';
  }

  return templateId;
};

const timestampToMillis = (
  value: unknown
) => {
  if (!value) {
    return 0;
  }

  if (
    typeof value ===
      'object' &&
    value !== null &&
    'toMillis' in value &&
    typeof (
      value as any
    ).toMillis ===
      'function'
  ) {
    return (
      value as any
    ).toMillis();
  }

  if (
    typeof value ===
      'object' &&
    value !== null &&
    'seconds' in value &&
    typeof (
      value as any
    ).seconds ===
      'number'
  ) {
    return (
      (value as any)
        .seconds *
      1000
    );
  }

  if (
    value instanceof Date
  ) {
    return value.getTime();
  }

  if (
    typeof value ===
      'number'
  ) {
    return value;
  }

  return 0;
};

export const upsertPublicOrderLookup =
  async (
    input:
      PublicOrderLookupInput
  ) => {
    const {
      id,
      phoneHash,
      normalizedCode,
    } =
      await buildLookupId(
        input.orderCode,
        input.phone
      );

    const templateId =
      input.templateId ||
      'love-01';

    const now =
      Date.now();

    const record:
      PublicOrderLookupRecord =
      {
        orderCode:
          normalizedCode,
        orderCodeLower:
          normalizedCode
            .toLowerCase(),
        phoneHash,
        templateId,
        templateName:
          input.templateName ||
          templateNameFromId(
            templateId
          ),
        paymentStatus:
          input.paymentStatus ||
          'waiting_bank_transfer',
        status:
          input.status ||
          'draft',
        price:
          typeof input.price ===
            'number'
            ? input.price
            : 0,
        currency:
          input.currency ||
          'VND',
        createdAtMs:
          input.createdAtMs ||
          now,
        updatedAtMs:
          input.updatedAtMs ||
          now,
      };

    await setDoc(
      doc(
        db,
        LOOKUP_COLLECTION,
        id
      ),
      record,
      {
        merge: true,
      }
    );

    return record;
  };

export const syncPublicOrderLookupFromGift =
  async (
    gift:
      SavedGiftDocument & {
        createdAtMs?:
          number;
        updatedAtMs?:
          number;
      }
  ) => {
    const phone =
      gift.customer?.phone ||
      '';

    const orderCode =
      gift.orderCode ||
      gift.paymentReference ||
      '';

    if (
      !phone ||
      !orderCode
    ) {
      return null;
    }

    const createdAtMs =
      gift.createdAtMs ||
      timestampToMillis(
        gift.createdAt
      ) ||
      Date.now();

    const updatedAtMs =
      gift.updatedAtMs ||
      timestampToMillis(
        gift.updatedAt
      ) ||
      Date.now();

    return upsertPublicOrderLookup({
      orderCode,
      phone,
      templateId:
        gift.templateId ||
        'love-01',
      paymentStatus:
        gift.paymentStatus ||
        'unpaid',
      status:
        gift.status ||
        'draft',
      price:
        typeof gift.price ===
          'number'
          ? gift.price
          : 0,
      currency:
        gift.currency ||
        'VND',
      createdAtMs,
      updatedAtMs,
    });
  };

export const deletePublicOrderLookupFromGift =
  async (
    gift:
      SavedGiftDocument
  ) => {
    const phone =
      gift.customer?.phone ||
      '';

    const orderCode =
      gift.orderCode ||
      gift.paymentReference ||
      '';

    if (
      !phone ||
      !orderCode
    ) {
      return;
    }

    const {
      id,
    } =
      await buildLookupId(
        orderCode,
        phone
      );

    await deleteDoc(
      doc(
        db,
        LOOKUP_COLLECTION,
        id
      )
    );
  };

const mapSnapshot = (
  snapshot:
    Awaited<
      ReturnType<
        typeof getDocs
      >
    >
) => {
  return snapshot.docs
    .map(
      (item) =>
        item.data() as
          PublicOrderLookupRecord
    )
    .sort(
      (left, right) =>
        right.createdAtMs -
        left.createdAtMs
    );
};

export const searchPublicOrders =
  async (
    rawValue: string
  ): Promise<
    PublicOrderLookupRecord[]
  > => {
    const value =
      rawValue.trim();

    if (!value) {
      throw new Error(
        'Nhập số điện thoại hoặc mã đơn.'
      );
    }

    const orderCode =
      normalizeOrderCode(
        value
      );

    if (orderCode) {
      const snapshot =
        await getDocs(
          query(
            collection(
              db,
              LOOKUP_COLLECTION
            ),
            where(
              'orderCodeLower',
              '==',
              orderCode
                .toLowerCase()
            ),
            limit(10)
          )
        );

      return mapSnapshot(
        snapshot
      );
    }

    const phoneHash =
      await hashPhoneForLookup(
        value
      );

    const snapshot =
      await getDocs(
        query(
          collection(
            db,
            LOOKUP_COLLECTION
          ),
          where(
            'phoneHash',
            '==',
            phoneHash
          ),
          limit(20)
        )
      );

    return mapSnapshot(
      snapshot
    );
  };
