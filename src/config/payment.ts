export const BANK_TRANSFER_CONFIG = {
  bankName: 'Techcombank',
  bankId: '970407',
  accountNo: '65838666666',
  template: 'compact2',
} as const;

export const buildPaymentReference = (
  giftId: string
) => {
  return `GIFT ${giftId.toUpperCase()}`;
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
