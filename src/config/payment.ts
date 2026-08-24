export const BANK_TRANSFER_CONFIG = {
  bankName: 'Techcombank',
  bankId: '970407',
  accountNo: '65838666666',
  template: 'compact2',
} as const;

export const buildPaymentReference = (
  orderNumber: string
) => {
  const digits =
    orderNumber.replace(
      /\D/g,
      ''
    );

  if (!/^\d{4}$/.test(digits)) {
    throw new Error(
      'Mã đơn phải gồm đúng 4 số.'
    );
  }

  return `Dearly${digits}`;
};

export type VietQrTemplate =
  | 'compact2'
  | 'qr_only';

export const buildVietQrImageUrl = (
  orderNumber: string,
  amount: number,
  template:
    VietQrTemplate =
      BANK_TRANSFER_CONFIG.template
) => {
  const reference =
    buildPaymentReference(
      orderNumber
    );

  const params =
    new URLSearchParams({
      amount: String(
        Math.round(amount)
      ),
      addInfo: reference,
    });

  const {
    bankId,
    accountNo,
  } = BANK_TRANSFER_CONFIG;

  return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?${params.toString()}`;
};


export const buildGiftLinkQrUrl = (
  giftUrl: string
) => {
  const params =
    new URLSearchParams({
      size: '260x260',
      data: giftUrl,
      margin: '8',
    });

  return (
    'https://api.qrserver.com/v1/create-qr-code/?' +
    params.toString()
  );
};
