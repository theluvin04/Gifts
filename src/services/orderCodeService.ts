import {
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import {
  db,
} from '../config/firebase';

const MAX_ORDER_CODE_ATTEMPTS =
  24;

export interface ReservedOrderCode {
  orderNumber: string;
  orderCode: string;
}

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

const isPermissionDenied = (
  error: unknown
) => {
  if (
    typeof error !==
      'object' ||
    error === null
  ) {
    return false;
  }

  const code =
    'code' in error
      ? String(
          (
            error as {
              code?: unknown;
            }
          ).code ||
            ''
        )
      : '';

  return (
    code === 'permission-denied' ||
    code === 'firestore/permission-denied'
  );
};

/**
 * Claim a human-friendly 4-digit order number before the gift document
 * is created. /orderCodes/{orderNumber} is create-only for customers,
 * so an already-used number is rejected atomically by Firestore and we
 * simply try another number.
 */
export const reserveUniqueOrderCode =
  async ({
    giftId,
    creatorId,
  }: {
    giftId: string;
    creatorId: string;
  }): Promise<
    ReservedOrderCode
  > => {
    if (!giftId || !creatorId) {
      throw new Error(
        'Không thể tạo mã đơn cho phiên thanh toán này.'
      );
    }

    let lastError:
      unknown = null;

    for (
      let attempt = 0;
      attempt <
      MAX_ORDER_CODE_ATTEMPTS;
      attempt += 1
    ) {
      const orderNumber =
        generateOrderNumber();

      const orderCode =
        `Dearly${orderNumber}`;

      try {
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
          orderNumber,
          orderCode,
        };
      } catch (error) {
        lastError = error;

        // Existing reservations are intentionally not readable by the
        // storefront. Firestore therefore reports the collision as a
        // rejected write. Retry with another number.
        if (
          isPermissionDenied(
            error
          )
        ) {
          continue;
        }

        throw error;
      }
    }

    const code =
      typeof lastError ===
        'object' &&
      lastError !== null &&
      'code' in lastError
        ? String(
            (
              lastError as {
                code?: unknown;
              }
            ).code ||
              ''
          )
        : '';

    if (
      code === 'permission-denied' ||
      code === 'firestore/permission-denied'
    ) {
      throw new Error(
        'Không thể giữ mã đơn duy nhất. Kiểm tra firestore.rules của /orderCodes đã được Publish.'
      );
    }

    throw new Error(
      'Không thể tạo mã đơn duy nhất. Hãy thử lại.'
    );
  };
