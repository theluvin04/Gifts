import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Gift,
  Landmark,
  Loader2,
  Mail,
  Phone,
  QrCode,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import { LoveConfig } from '../types';

import {
  CheckoutCustomer,
  fetchCheckoutGiftState,
} from '../services/giftService';

import {
  createBankTransferOrder,
  getCachedCheckoutPricing,
  refreshCheckoutPricing,
} from '../services/checkoutService';

import {
  upsertPublicOrderLookup,
} from '../services/orderLookupService';

import {
  BANK_TRANSFER_CONFIG,
  buildGiftLinkQrUrl,
  buildPaymentReference,
  buildVietQrImageUrl,
  VietQrTemplate,
} from '../config/payment';

interface CheckoutPageProps {
  config: LoveConfig;
  onBack: () => void;
}

const CHECKOUT_GIFT_ID_KEY =
  'gifts:love-01:checkout-gift-id';

const POLL_INTERVAL_MS = 5000;

const formatVnd = (
  amount: number
) => {
  return new Intl.NumberFormat(
    'vi-VN',
    {
      style: 'currency',
      currency: 'VND',
    }
  ).format(amount);
};

const isValidEmail = (
  email: string
) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
};

const isValidPhone = (
  phone: string
) => {
  const normalized =
    phone.replace(/\s+/g, '');

  return /^[+0-9]{9,15}$/.test(
    normalized
  );
};

export const CheckoutPage: React.FC<
  CheckoutPageProps
> = ({
  config,
  onBack,
}) => {
  const [customer, setCustomer] =
    useState<CheckoutCustomer>({
      fullName: '',
      email: '',
      phone: '',
    });

  const [giftId, setGiftId] =
    useState('');

  const [orderNumber, setOrderNumber] =
    useState('');

  const [orderCode, setOrderCode] =
    useState('');

  const [checkoutPrice, setCheckoutPrice] =
    useState(
      () =>
        getCachedCheckoutPricing()
          .price
    );

  const [isRefreshingPrice, setIsRefreshingPrice] =
    useState(true);

  const [isCreatingPayment, setIsCreatingPayment] =
    useState(false);

  const [isPaymentReady, setIsPaymentReady] =
    useState(false);

  const [isPaidAndPublished, setIsPaidAndPublished] =
    useState(false);

  const [error, setError] =
    useState('');

  const [qrTemplate, setQrTemplate] =
    useState<VietQrTemplate>(
      'compact2'
    );

  const [qrImageFailed, setQrImageFailed] =
    useState(false);

  const [copiedField, setCopiedField] =
    useState<
      '' | 'account' | 'content' | 'gift'
    >('');

  const hasPreparedRef =
    useRef(false);

  useEffect(() => {
    if (hasPreparedRef.current) {
      return;
    }

    hasPreparedRef.current = true;

    const prepareCheckout =
      async () => {
        setError('');

        try {
          const storedId =
            window.sessionStorage.getItem(
              CHECKOUT_GIFT_ID_KEY
            );

          const existingId =
            storedId &&
            /^[A-Za-z0-9_-]{16,64}$/.test(
              storedId
            )
              ? storedId
              : null;

          if (
            storedId &&
            !existingId
          ) {
            window.sessionStorage.removeItem(
              CHECKOUT_GIFT_ID_KEY
            );
          }

          if (existingId) {
            const existingState =
              await fetchCheckoutGiftState(
                existingId
              );

            if (
              existingState &&
              existingState.paymentStatus !==
                'unpaid'
            ) {
              setGiftId(existingId);
              setCheckoutPrice(
                existingState.price
              );
              setOrderNumber(
                existingState.orderNumber
              );
              setOrderCode(
                existingState.orderCode
              );

              if (
                existingState.paymentStatus ===
                'waiting_bank_transfer'
              ) {
                setIsPaymentReady(true);
              }

              if (
                (
                  existingState.paymentStatus ===
                    'paid' ||
                  existingState.paymentStatus ===
                    'paid_test'
                ) &&
                (
                  existingState.status ===
                    'published' ||
                  existingState.isPublished
                )
              ) {
                setIsPaidAndPublished(
                  true
                );
              }

              setIsRefreshingPrice(
                false
              );
              return;
            }

            window.sessionStorage.removeItem(
              CHECKOUT_GIFT_ID_KEY
            );
          }

          setIsRefreshingPrice(
            true
          );

          refreshCheckoutPricing()
            .then(
              (pricing) => {
                setCheckoutPrice(
                  pricing.price
                );
              }
            )
            .catch(
              (priceError) => {
                console.warn(
                  'Checkout price refresh:',
                  priceError
                );
              }
            )
            .finally(() => {
              setIsRefreshingPrice(
                false
              );
            });
        } catch (prepareError: any) {
          console.error(
            prepareError
          );

          setError(
            prepareError?.message ||
              'Không thể tải thông tin thanh toán.'
          );

          setIsRefreshingPrice(
            false
          );
        }
      };

    void prepareCheckout();
  }, []);

  useEffect(() => {
    if (
      !giftId ||
      !isPaymentReady ||
      isPaidAndPublished
    ) {
      return;
    }

    let cancelled = false;

    const checkPayment = async () => {
      try {
        const state =
          await fetchCheckoutGiftState(
            giftId
          );

        if (
          !cancelled &&
          state &&
          (
            state.paymentStatus ===
              'paid' ||
            state.paymentStatus ===
              'paid_test'
          ) &&
          (
            state.status ===
              'published' ||
            state.isPublished
          )
        ) {
          setIsPaidAndPublished(true);

          window.sessionStorage.removeItem(
            CHECKOUT_GIFT_ID_KEY
          );
        }
      } catch (pollError) {
        console.warn(
          'Payment status poll:',
          pollError
        );
      }
    };

    void checkPayment();

    const timer =
      window.setInterval(
        () => {
          void checkPayment();
        },
        POLL_INTERVAL_MS
      );

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [
    giftId,
    isPaymentReady,
    isPaidAndPublished,
  ]);

  const updateCustomer = (
    field: keyof CheckoutCustomer,
    value: string
  ) => {
    setCustomer(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  };

  const validateForm = () => {
    if (!customer.fullName.trim()) {
      return 'Nhập tên người mua.';
    }

    if (
      !customer.email.trim() ||
      !isValidEmail(
        customer.email.trim()
      )
    ) {
      return 'Nhập email hợp lệ.';
    }

    if (
      !customer.phone.trim() ||
      !isValidPhone(
        customer.phone.trim()
      )
    ) {
      return 'Nhập số điện thoại hợp lệ.';
    }

    return '';
  };

  const handleCreatePayment =
    async () => {
      const validationError =
        validateForm();

      if (validationError) {
        setError(validationError);
        return;
      }

      setIsCreatingPayment(true);
      setError('');

      try {
        setQrTemplate(
          'compact2'
        );
        setQrImageFailed(
          false
        );

        const result =
          await createBankTransferOrder(
            config,
            {
              fullName:
                customer.fullName.trim(),
              email:
                customer.email.trim(),
              phone:
                customer.phone.trim(),
            }
          );

        setGiftId(
          result.giftId
        );
        setOrderNumber(
          result.orderNumber
        );
        setOrderCode(
          result.orderCode
        );
        setCheckoutPrice(
          result.price
        );

        window.sessionStorage.setItem(
          CHECKOUT_GIFT_ID_KEY,
          result.giftId
        );

        try {
          await upsertPublicOrderLookup({
            orderCode:
              result.orderCode,
            phone:
              customer.phone.trim(),
            templateId:
              'love-01',
            templateName:
              'Love Story 01',
            paymentStatus:
              'waiting_bank_transfer',
            status:
              'draft',
            price:
              result.price,
            currency:
              result.currency,
            createdAtMs:
              Date.now(),
            updatedAtMs:
              Date.now(),
          });
        } catch (
          lookupError
        ) {
          console.warn(
            'Public order lookup sync:',
            lookupError
          );
        }

        setIsPaymentReady(true);
      } catch (paymentError: any) {
        console.error(paymentError);

        setError(
          paymentError?.message ||
            'Không thể tạo yêu cầu thanh toán.'
        );
      } finally {
        setIsCreatingPayment(false);
      }
    };

  const copyText = async (
    field:
      | 'account'
      | 'content'
      | 'gift',
    value: string
  ) => {
    try {
      await navigator.clipboard.writeText(
        value
      );

      setCopiedField(field);

      window.setTimeout(
        () => setCopiedField(''),
        2000
      );
    } catch {
      setError(
        'Không thể tự sao chép.'
      );
    }
  };

  const giftUrl =
    giftId
      ? `${window.location.origin}/gift/${giftId}`
      : '';

  const giftQrUrl =
    giftUrl
      ? buildGiftLinkQrUrl(
          giftUrl
        )
      : '';

  if (isPaidAndPublished) {
    const finalOrderCode =
      orderCode ||
      (
        orderNumber
          ? buildPaymentReference(
              orderNumber
            )
          : ''
      );

    return (
      <div className="min-h-[100svh] w-full overflow-x-hidden bg-[#fffaf8] px-3 py-6 text-[#1d1d1d] sm:px-4 sm:py-14">
        <main className="mx-auto w-full max-w-4xl">
          <section className="overflow-hidden rounded-[32px] border border-black/[0.06] bg-white shadow-[0_28px_80px_rgba(60,25,35,0.08)]">
            <div className="border-b border-black/[0.06] px-6 py-8 text-center sm:px-10 sm:py-10">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f8e9ed] text-[#c9435d]">
                <Check className="h-5 w-5 stroke-[2.2]" />
              </div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9435d]">
                Payment confirmed
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-4xl">
                Món quà đã sẵn sàng.
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/45">
                Link bên dưới là đường dẫn riêng của người nhận.
                Mã đơn và link món quà là hai thông tin hoàn toàn khác nhau.
              </p>
            </div>

            <div className="grid gap-0 lg:grid-cols-[300px_1fr]">
              <div className="border-b border-black/[0.06] bg-[#fff5f6] p-6 lg:border-b-0 lg:border-r lg:p-8">
                <div className="mx-auto max-w-[230px] rounded-[24px] bg-white p-4 shadow-[0_12px_35px_rgba(30,20,22,0.06)]">
                  <img
                    src={giftQrUrl}
                    alt="QR mở món quà"
                    className="aspect-square w-full rounded-[14px] object-contain"
                  />
                </div>

                <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-black/35">
                  QR mở món quà
                </p>

                <p className="mt-1 text-center text-xs text-black/45">
                  Quét bằng camera điện thoại
                </p>
              </div>

              <div className="p-6 sm:p-8">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[18px] bg-[#f7f7f4] px-4 py-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-black/35">
                      Mã đơn
                    </p>

                    <p className="mt-1 font-mono text-base font-black text-[#c9435d]">
                      {finalOrderCode || '—'}
                    </p>
                  </div>

                  <div className="rounded-[18px] bg-[#f7f7f4] px-4 py-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-black/35">
                      Trạng thái
                    </p>

                    <p className="mt-1 text-sm font-bold text-emerald-700">
                      Đã thanh toán
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-[20px] border border-black/[0.07] p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-black/35">
                    Link riêng của món quà
                  </p>

                  <p className="mt-2 break-all text-xs font-semibold leading-5 text-black/65">
                    {giftUrl}
                  </p>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() =>
                        void copyText(
                          'gift',
                          giftUrl
                        )
                      }
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-[14px] border border-black/[0.08] bg-white px-4 py-3 text-xs font-bold text-black/65 transition hover:border-[#c9435d]/25 hover:text-[#c9435d]"
                    >
                      {copiedField ===
                      'gift' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}

                      {copiedField ===
                      'gift'
                        ? 'Đã sao chép'
                        : 'Sao chép link'}
                    </button>

                    <a
                      href={giftUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-[14px] bg-[#1d1d1d] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#c9435d]"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Mở món quà
                    </a>
                  </div>
                </div>

                <p className="mt-4 text-[10px] leading-5 text-black/35">
                  Không dùng mã đơn để suy ra link. Link gift được tạo bằng token random riêng cho từng khách.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (
    isPaymentReady &&
    giftId &&
    orderNumber
  ) {
    const paymentReference =
      orderCode ||
      buildPaymentReference(
        orderNumber
      );

    const qrImageUrl =
      buildVietQrImageUrl(
        orderNumber,
        checkoutPrice,
        qrTemplate
      );

    return (
      <div className="min-h-[100svh] w-full overflow-x-hidden bg-[#fff9fb] text-slate-800">
        <header className="border-b border-rose-100 bg-white/90 backdrop-blur-xl">
          <div className="mx-auto grid min-h-[64px] w-full max-w-5xl grid-cols-[44px_minmax(0,1fr)_44px] items-center px-3 py-2 sm:min-h-[68px] sm:grid-cols-[96px_minmax(0,1fr)_96px] sm:px-7 sm:py-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-rose-500"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">
                Quay lại
              </span>
            </button>

            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-400">
                Bank transfer
              </p>

              <p className="text-sm font-bold text-slate-900">
                Chờ thanh toán
              </p>
            </div>

            <div />
          </div>
        </header>

        <main className="mx-auto grid w-full max-w-[900px] gap-5 px-3 py-5 sm:gap-6 sm:px-6 sm:py-8 lg:grid-cols-[370px_minmax(0,1fr)]">
          <section className="min-w-0 rounded-[24px] border border-rose-100 bg-white p-4 shadow-[0_24px_70px_rgba(190,70,110,0.1)] sm:rounded-[30px] sm:p-5">
            <div className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                <QrCode className="h-5 w-5" />
              </span>

              <h1 className="mt-4 text-xl font-bold text-slate-900">
                Quét QR để thanh toán
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Số tiền và nội dung đã được điền sẵn.
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-[22px] border border-slate-100 bg-white p-2">
              {!qrImageFailed ? (
                <img
                  key={qrImageUrl}
                  src={qrImageUrl}
                  alt="VietQR Techcombank"
                  className="mx-auto w-full max-w-[320px]"
                  onError={() => {
                    if (
                      qrTemplate ===
                      'compact2'
                    ) {
                      setQrTemplate(
                        'qr_only'
                      );
                      return;
                    }

                    setQrImageFailed(
                      true
                    );
                  }}
                />
              ) : (
                <div className="mx-auto flex min-h-[260px] max-w-[320px] flex-col items-center justify-center rounded-[18px] bg-rose-50 px-5 text-center">
                  <QrCode className="h-8 w-8 text-rose-400" />

                  <p className="mt-3 text-sm font-bold text-slate-700">
                    Không tải được ảnh VietQR
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Thông tin chuyển khoản bên phải vẫn chính xác.
                  </p>

                  <a
                    href={qrImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 text-xs font-bold text-rose-500 underline"
                  >
                    Mở QR trực tiếp
                  </a>
                </div>
              )}
            </div>

            <p className="mt-4 text-center text-3xl font-black tracking-[-0.04em] text-rose-500">
              {formatVnd(
                checkoutPrice
              )}
            </p>
          </section>

          <section className="min-w-0 space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <Landmark className="h-5 w-5" />
                </span>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Thông tin chuyển khoản
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Chuyển đúng số tiền và giữ nguyên
                    nội dung để đối soát đơn.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <PaymentRow
                  label="Ngân hàng"
                  value={
                    BANK_TRANSFER_CONFIG.bankName
                  }
                />

                <PaymentRow
                  label="Số tài khoản"
                  value={
                    BANK_TRANSFER_CONFIG.accountNo
                  }
                  actionLabel={
                    copiedField ===
                    'account'
                      ? 'Đã copy'
                      : 'Copy'
                  }
                  onAction={() =>
                    void copyText(
                      'account',
                      BANK_TRANSFER_CONFIG.accountNo
                    )
                  }
                />

                <PaymentRow
                  label="Số tiền"
                  value={formatVnd(
                    checkoutPrice
                  )}
                />

                <PaymentRow
                  label="Nội dung CK"
                  value={
                    paymentReference
                  }
                  highlight
                  actionLabel={
                    copiedField ===
                    'content'
                      ? 'Đã copy'
                      : 'Copy'
                  }
                  onAction={() =>
                    void copyText(
                      'content',
                      paymentReference
                    )
                  }
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-amber-100 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <Loader2 className="mt-0.5 h-5 w-5 animate-spin text-amber-500" />

                <div>
                  <p className="text-sm font-bold text-amber-800">
                    Đang chờ xác nhận thanh toán
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-700/80">
                    Trang này tự kiểm tra trạng thái mỗi
                    5 giây. Khi Admin xác nhận tiền đã
                    vào và publish gift, link món quà sẽ
                    tự xuất hiện.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-4 text-xs leading-6 text-slate-500">
              <p>
                <span className="font-bold text-slate-700">
                  Mã đơn:
                </span>{' '}
                {paymentReference}
              </p>

              <p>
                <span className="font-bold text-slate-700">
                  Trạng thái:
                </span>{' '}
                waiting_bank_transfer
              </p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] w-full overflow-x-hidden bg-[#fff9fb] text-slate-800">
      <header className="sticky top-0 z-50 border-b border-rose-100 bg-[#fff9fb]/90 backdrop-blur-xl">
        <div className="mx-auto grid h-[64px] w-full max-w-7xl grid-cols-[44px_minmax(0,1fr)_44px] items-center px-3 sm:h-[68px] sm:grid-cols-[96px_minmax(0,1fr)_96px] sm:px-7">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-rose-500"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">
              Quay lại cá nhân hóa
            </span>
          </button>

          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-400">
              Checkout
            </p>

            <p className="text-sm font-bold text-slate-900">
              Hoàn tất món quà
            </p>
          </div>

          <div />
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1160px] gap-5 px-3 py-5 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-8">
        <section className="min-w-0">
          <div className="rounded-[24px] border border-rose-100 bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                <UserRound className="h-5 w-5" />
              </span>

              <div className="min-w-0">
                <h1 className="text-lg font-bold tracking-[-0.03em] text-slate-900 min-[360px]:text-xl">
                  Thông tin người mua
                </h1>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Thông tin này được lưu cùng đơn hàng
                  để Admin đối soát thanh toán.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <CheckoutField
                icon={UserRound}
                label="Họ và tên"
                value={customer.fullName}
                onChange={(value) =>
                  updateCustomer(
                    'fullName',
                    value
                  )
                }
                placeholder="Nguyễn Văn A"
              />

              <CheckoutField
                icon={Mail}
                label="Email"
                value={customer.email}
                onChange={(value) =>
                  updateCustomer(
                    'email',
                    value
                  )
                }
                placeholder="hello@example.com"
              />

              <CheckoutField
                icon={Phone}
                label="Số điện thoại"
                value={customer.phone}
                onChange={(value) =>
                  updateCustomer(
                    'phone',
                    value
                  )
                }
                placeholder="09xxxxxxxx"
              />
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-rose-100 bg-white p-4 shadow-sm sm:mt-5 sm:rounded-[28px] sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <CreditCard className="h-5 w-5" />
              </span>

              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-900 min-[360px]:text-lg">
                  Chuyển khoản ngân hàng
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Hệ thống sẽ tạo VietQR theo mã đơn
                  Dearly#### để đối soát.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border-2 border-rose-200 bg-rose-50/60 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white">
                  <Landmark className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">
                    {BANK_TRANSFER_CONFIG.bankName}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-500">
                    STK {BANK_TRANSFER_CONFIG.accountNo}
                  </p>
                </div>

                <QrCode className="h-5 w-5 text-rose-500" />
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold leading-5 text-red-600">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={
                isCreatingPayment
              }
              onClick={() =>
                void handleCreatePayment()
              }
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreatingPayment ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tạo đơn...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4" />
                  Tạo QR thanh toán
                </>
              )}
            </button>

            <div className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-slate-400">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />

              <p>
                Gift vẫn ở trạng thái{' '}
                <strong>draft</strong> cho đến khi
                thanh toán được xác nhận. Khách không
                thể tự publish bằng frontend.
              </p>
            </div>
          </div>
        </section>

        <aside className="min-w-0">
          <div className="overflow-hidden rounded-[24px] border border-rose-100 bg-white shadow-[0_24px_70px_rgba(190,70,110,0.1)] sm:rounded-[28px] lg:sticky lg:top-[92px]">
            <div className="bg-[#fff4f8] p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-sm">
                  <Gift className="h-5 w-5" />
                </span>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-400">
                    Order summary
                  </p>

                  <h2 className="mt-1 text-base font-bold text-slate-900">
                    Love Story 01
                  </h2>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="space-y-3 text-xs text-slate-500">
                <SummaryLine
                  text={`${config.gifts.gift1.photos.length} ảnh kỷ niệm`}
                />

                <SummaryLine
                  text={`${config.gifts.gift2.playlist.length} bài hát`}
                />

                <SummaryLine
                  text={`${config.gifts.gift3.letter.paragraphs.length} đoạn thư`}
                />

                <SummaryLine
                  text="Link riêng /gift/..."
                />

                <SummaryLine
                  text="VietQR theo mã đơn"
                />
              </div>

              <div className="my-5 h-px bg-slate-100" />

              <div className="flex min-w-0 items-center justify-between gap-3">
                <span className="min-w-0 text-sm font-bold text-slate-700">
                  Tổng thanh toán
                </span>

                <span className="shrink-0 text-lg font-black tracking-[-0.03em] text-rose-500 min-[360px]:text-xl">
                  {formatVnd(
                    checkoutPrice
                  )}
                </span>
              </div>

              {isRefreshingPrice && (
                <p className="mt-1 text-right text-[10px] text-slate-400">
                  Đang cập nhật giá mới nhất...
                </p>
              )}

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Gift
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  {config.couple.senderName}
                  {' → '}
                  {config.couple.receiverName}
                </p>

                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                  {config.proposal.question}
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-center">
                <p className="text-[11px] font-bold text-slate-600">
                  Preview đang được khóa
                </p>

                <p className="mt-1 text-[10px] leading-5 text-slate-400">
                  Món quà chỉ mở sau khi thanh toán được xác nhận.
                </p>
              </div>


            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

interface CheckoutFieldProps {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

const CheckoutField: React.FC<
  CheckoutFieldProps
> = ({
  icon: Icon,
  label,
  value,
  placeholder,
  onChange,
}) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-bold text-slate-700">
      {label}
    </span>

    <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100">
      <Icon className="h-4 w-4 shrink-0 text-slate-300" />

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-300"
      />
    </div>
  </label>
);

interface PaymentRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

const PaymentRow: React.FC<
  PaymentRowProps
> = ({
  label,
  value,
  highlight = false,
  actionLabel,
  onAction,
}) => (
  <div
    className={[
      'flex items-center gap-3 rounded-2xl border p-4',
      highlight
        ? 'border-rose-200 bg-rose-50/70'
        : 'border-slate-100 bg-slate-50/60',
    ].join(' ')}
  >
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p
        className={[
          'mt-1 break-all text-sm font-bold',
          highlight
            ? 'text-rose-600'
            : 'text-slate-800',
        ].join(' ')}
      >
        {value}
      </p>
    </div>

    {onAction &&
      actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[10px] font-bold text-slate-600 shadow-sm transition hover:text-rose-500"
        >
          <Copy className="h-3 w-3" />
          {actionLabel}
        </button>
      )}
  </div>
);

const SummaryLine: React.FC<{
  text: string;
}> = ({ text }) => (
  <p className="flex items-center gap-2">
    <Check className="h-3.5 w-3.5 text-rose-500" />
    {text}
  </p>
);
