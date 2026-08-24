export const BANK_TRANSFER_CONFIG = {
  bankName: 'Techcombank',
  bankId: '970407',
  accountNo: '65838666666',
  template: 'compact2',
} as const;

export const buildPaymentReference = (
  giftId: string
) => {
  const digits =
    giftId.replace(
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

export const buildVietQrImageUrl = (
  giftId: string,
  amount: number
) => {
  const reference =
    buildPaymentReference(giftId);

  const params =
    new URLSearchParams({
      amount: String(amount),
      addInfo: reference,
    });

  const {
    bankId,
    accountNo,
    template,
  } = BANK_TRANSFER_CONFIG;

  return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?${params.toString()}`;
};
