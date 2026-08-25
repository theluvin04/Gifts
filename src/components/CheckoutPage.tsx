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

import { BrandLogo } from './BrandLogo';
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
) =>
  new Intl.NumberFormat(
    'vi-VN',
    {
      style: 'currency',
      currency: 'VND',
    }
  ).format(amount);

const isValidEmail = (
  email: string
) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );

const isValidPhone = (
  phone: string
) =>
  /^[+0-9]{9,15}$/.test(
    phone.replace(/\s+/g, '')
  );

export const CheckoutPage:
React.FC<CheckoutPageProps> = ({
  config,
  onBack,
}) => {
  const [
    customer,
    setCustomer,
  ] =
    useState<CheckoutCustomer>({
      fullName: '',
      email: '',
      phone: '',
    });

  const [
    giftId,
    setGiftId,
  ] = useState('');

  const [
    orderNumber,
    setOrderNumber,
  ] = useState('');

  const [
    orderCode,
    setOrderCode,
  ] = useState('');

  const [
    checkoutPrice,
    setCheckoutPrice,
  ] = useState(
    () =>
      getCachedCheckoutPricing()
        .price
  );

  const [
    isRefreshingPrice,
    setIsRefreshingPrice,
  ] = useState(true);

  const [
    isCreatingPayment,
    setIsCreatingPayment,
  ] = useState(false);

  const [
    isPaymentReady,
    setIsPaymentReady,
  ] = useState(false);

  const [
    isPaidAndPublished,
    setIsPaidAndPublished,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const [
    qrTemplate,
    setQrTemplate,
  ] =
    useState<VietQrTemplate>(
      'compact2'
    );

  const [
    qrImageFailed,
    setQrImageFailed,
  ] = useState(false);

  const [
    copiedField,
    setCopiedField,
  ] = useState<
    | ''
    | 'account'
    | 'content'
    | 'gift'
  >('');

  const hasPreparedRef =
    useRef(false);

  useEffect(() => {
    if (
      hasPreparedRef.current
    ) {
      return;
    }

    hasPreparedRef.current =
      true;

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
            const state =
              await fetchCheckoutGiftState(
                existingId
              );

            if (
              state &&
              state.paymentStatus !==
                'unpaid'
            ) {
              setGiftId(
                existingId
              );
              setCheckoutPrice(
                state.price
              );
              setOrderNumber(
                state.orderNumber
              );
              setOrderCode(
                state.orderCode
              );

              if (
                state.paymentStatus ===
                'waiting_bank_transfer'
              ) {
                setIsPaymentReady(
                  true
                );
              }

              if (
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
        } catch (
          prepareError: any
        ) {
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

    const checkPayment =
      async () => {
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
            setIsPaidAndPublished(
              true
            );

            window.sessionStorage.removeItem(
              CHECKOUT_GIFT_ID_KEY
            );
          }
        } catch (
          pollError
        ) {
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
      window.clearInterval(
        timer
      );
    };
  }, [
    giftId,
    isPaymentReady,
    isPaidAndPublished,
  ]);

  const updateCustomer = (
    field:
      keyof CheckoutCustomer,
    value: string
  ) => {
    setCustomer(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  };

  const validateForm =
    () => {
      if (
        !customer.fullName.trim()
      ) {
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
        setError(
          validationError
        );
        return;
      }

      setIsCreatingPayment(
        true
      );
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
            status: 'draft',
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

        setIsPaymentReady(
          true
        );

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      } catch (
        paymentError: any
      ) {
        console.error(
          paymentError
        );

        setError(
          paymentError?.message ||
            'Không thể tạo yêu cầu thanh toán.'
        );
      } finally {
        setIsCreatingPayment(
          false
        );
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

      setCopiedField(
        field
      );

      window.setTimeout(
        () =>
          setCopiedField(
            ''
          ),
        1800
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

  const finalOrderCode =
    orderCode ||
    (
      orderNumber
        ? buildPaymentReference(
            orderNumber
          )
        : ''
    );

  if (
    isPaidAndPublished
  ) {
    return (
      <div className="min-h-[100svh] bg-[#fff9fb] px-3 py-5 text-[#171717] sm:px-5 sm:py-10">
        <main className="mx-auto max-w-3xl">
          <section className="overflow-hidden rounded-[28px] border border-black/[0.07] bg-white shadow-[0_24px_70px_rgba(70,30,40,0.08)] sm:rounded-[32px]">
            <div className="px-5 py-7 text-center sm:px-8 sm:py-9">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">
                Thanh toán đã xác nhận
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-4xl">
                Món quà đã sẵn sàng
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/45">
                Gửi link hoặc QR bên dưới cho người nhận.
              </p>
            </div>

            <div className="grid border-t border-black/[0.06] lg:grid-cols-[280px_minmax(0,1fr)]">
              <div className="border-b border-black/[0.06] bg-[#fff4f7] p-5 lg:border-b-0 lg:border-r lg:p-7">
                <div className="mx-auto max-w-[220px] rounded-[22px] bg-white p-3 shadow-sm">
                  <img
                    src={
                      giftQrUrl
                    }
                    alt="QR mở món quà"
                    className="aspect-square w-full rounded-[14px] object-contain"
                  />
                </div>

                <p className="mt-3 text-center text-xs font-bold text-black/45">
                  Quét QR để mở món quà
                </p>
              </div>

              <div className="p-5 sm:p-7">
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoCard
                    label="Mã đơn"
                    value={
                      finalOrderCode ||
                      '—'
                    }
                  />
                  <InfoCard
                    label="Trạng thái"
                    value="Đã thanh toán"
                    success
                  />
                </div>

                <div className="mt-4 rounded-[18px] border border-black/[0.07] bg-[#fcfbfb] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-black/30">
                    Link riêng của món quà
                  </p>

                  <p className="mt-2 break-all text-sm font-bold leading-6 text-black/65">
                    {giftUrl}
                  </p>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        void copyText(
                          'gift',
                          giftUrl
                        )
                      }
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[13px] border border-black/10 bg-white px-4 text-sm font-bold text-black/60"
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
                      href={
                        giftUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[13px] bg-[#171717] px-4 text-sm font-black text-white"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Mở món quà
                    </a>
                  </div>
                </div>
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
      finalOrderCode;

    const qrImageUrl =
      buildVietQrImageUrl(
        orderNumber,
        checkoutPrice,
        qrTemplate
      );

    return (
      <div className="min-h-[100svh] bg-[#fff9fb] text-[#171717]">
        <CheckoutHeader
          label="Chờ thanh toán"
          onBack={
            onBack
          }
        />

        <main className="mx-auto grid max-w-[980px] gap-4 px-3 pb-8 pt-4 sm:gap-6 sm:px-6 sm:pt-7 lg:grid-cols-[380px_minmax(0,1fr)]">
          <section className="rounded-[24px] border border-rose-100 bg-white p-4 shadow-[0_20px_60px_rgba(100,35,55,0.08)] sm:p-5">
            <StepBar
              active={2}
            />

            <div className="mt-5 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#c9435d]">
                Quét để thanh toán
              </p>

              <p className="mt-2 text-3xl font-black tracking-[-0.045em] text-[#c9435d]">
                {formatVnd(
                  checkoutPrice
                )}
              </p>

              <p className="mt-2 text-xs leading-5 text-black/40">
                QR đã điền sẵn số tiền và nội dung chuyển khoản.
              </p>
            </div>

            <div className="mt-4 overflow-hidden rounded-[20px] border border-black/[0.07] bg-white p-2">
              {!qrImageFailed ? (
                <img
                  key={
                    qrImageUrl
                  }
                  src={
                    qrImageUrl
                  }
                  alt="VietQR thanh toán"
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
                <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[16px] bg-rose-50 p-5 text-center">
                  <QrCode className="h-8 w-8 text-rose-400" />
                  <p className="mt-3 text-sm font-black">
                    Không tải được VietQR
                  </p>
                  <p className="mt-1 text-xs leading-5 text-black/40">
                    Dùng thông tin chuyển khoản bên dưới.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-[24px] border border-black/[0.07] bg-white p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#171717] text-white">
                  <Landmark className="h-5 w-5" />
                </span>
                <div>
                  <h1 className="text-lg font-black">
                    Thông tin chuyển khoản
                  </h1>
                  <p className="mt-1 text-xs leading-5 text-black/40">
                    Quan trọng nhất là chuyển đúng số tiền và đúng nội dung.
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
                  important
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
                  important
                />

                <PaymentRow
                  label="Nội dung chuyển khoản"
                  value={
                    paymentReference
                  }
                  important
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

            <div className="rounded-[20px] border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-amber-600" />
                <div>
                  <p className="text-sm font-black text-amber-900">
                    Đang chờ xác nhận
                  </p>
                  <p className="mt-1 text-xs leading-5 text-amber-800/75">
                    Sau khi chuyển khoản, cứ giữ nguyên trang này. Hệ thống tự kiểm tra mỗi 5 giây và mở link quà khi thanh toán được xác nhận.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[18px] border border-black/[0.06] bg-white px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-black/35">
                  Mã đơn
                </span>
                <span className="font-mono text-sm font-black text-[#c9435d]">
                  {paymentReference}
                </span>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-[#fff9fb] pb-24 text-[#171717] lg:pb-0">
      <CheckoutHeader
        label="Hoàn tất món quà"
        onBack={
          onBack
        }
      />

      <main className="mx-auto grid max-w-[1080px] gap-5 px-3 py-4 sm:px-6 sm:py-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-7">
        <section className="min-w-0">
          <div className="mb-4 rounded-[20px] border border-rose-100 bg-white p-4 lg:hidden">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#c9435d]">
              Love Story 01
            </p>
            <div className="mt-2 flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-black/60">
                Tổng thanh toán
              </p>
              <p className="text-xl font-black text-[#c9435d]">
                {formatVnd(
                  checkoutPrice
                )}
              </p>
            </div>
          </div>

          <form
            onSubmit={(
              event
            ) => {
              event.preventDefault();
              void handleCreatePayment();
            }}
            className="rounded-[24px] border border-rose-100 bg-white p-4 shadow-sm sm:p-6"
          >
            <StepBar
              active={1}
            />

            <div className="mt-5 flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-rose-50 text-[#c9435d]">
                <UserRound className="h-5 w-5" />
              </span>

              <div>
                <h1 className="text-xl font-black tracking-[-0.03em]">
                  Thông tin người mua
                </h1>
                <p className="mt-1 text-xs leading-5 text-black/40">
                  Dùng để đối soát đơn và tra cứu thanh toán.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <CheckoutField
                icon={
                  UserRound
                }
                label="Họ và tên"
                value={
                  customer.fullName
                }
                onChange={(
                  value
                ) =>
                  updateCustomer(
                    'fullName',
                    value
                  )
                }
                placeholder="Nguyễn Văn A"
                autoComplete="name"
              />

              <CheckoutField
                icon={
                  Mail
                }
                label="Email"
                type="email"
                value={
                  customer.email
                }
                onChange={(
                  value
                ) =>
                  updateCustomer(
                    'email',
                    value
                  )
                }
                placeholder="hello@example.com"
                autoComplete="email"
              />

              <CheckoutField
                icon={
                  Phone
                }
                label="Số điện thoại"
                type="tel"
                inputMode="tel"
                value={
                  customer.phone
                }
                onChange={(
                  value
                ) =>
                  updateCustomer(
                    'phone',
                    value
                  )
                }
                placeholder="09xxxxxxxx"
                autoComplete="tel"
              />
            </div>

            {error && (
              <div className="mt-4 rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold leading-5 text-red-600">
                {error}
              </div>
            )}

            <div className="mt-5 rounded-[18px] border border-rose-100 bg-[#fff7f9] p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-[#c9435d] shadow-sm">
                  <Landmark className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-black">
                    Chuyển khoản ngân hàng
                  </p>
                  <p className="mt-0.5 truncate text-xs text-black/40">
                    {BANK_TRANSFER_CONFIG.bankName} · {BANK_TRANSFER_CONFIG.accountNo}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                isCreatingPayment ||
                isRefreshingPrice
              }
              className="mt-5 hidden min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#171717] px-5 text-sm font-black text-white transition hover:bg-[#c9435d] disabled:cursor-not-allowed disabled:opacity-45 lg:flex"
            >
              {isCreatingPayment ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tạo QR...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4" />
                  Tạo QR thanh toán · {formatVnd(checkoutPrice)}
                </>
              )}
            </button>

            <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-black/35">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <p>
                Món quà chỉ được mở sau khi thanh toán được xác nhận.
              </p>
            </div>
          </form>
        </section>

        <aside className="hidden lg:block">
          <div className="sticky top-[92px] overflow-hidden rounded-[24px] border border-rose-100 bg-white shadow-[0_20px_60px_rgba(100,35,55,0.07)]">
            <div className="bg-[#fff4f7] p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-white text-[#c9435d]">
                  <Gift className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#c9435d]">
                    Đơn hàng
                  </p>
                  <p className="mt-1 text-sm font-black">
                    Love Story 01
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="space-y-2.5 text-xs text-black/45">
                <SummaryLine
                  text={`${config?.gifts?.gift1?.photos?.length || 0} ảnh kỷ niệm`}
                />
                <SummaryLine
                  text={`${config?.gifts?.gift2?.playlist?.length || 0} bài hát`}
                />
                <SummaryLine
                  text={`${config?.gifts?.gift3?.letter?.paragraphs?.length || 0} đoạn thư`}
                />
                <SummaryLine
                  text="Link quà riêng sau thanh toán"
                />
              </div>

              <div className="my-5 h-px bg-black/[0.06]" />

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-black/50">
                  Tổng cộng
                </span>
                <span className="text-xl font-black text-[#c9435d]">
                  {formatVnd(
                    checkoutPrice
                  )}
                </span>
              </div>

              {isRefreshingPrice && (
                <p className="mt-1 text-right text-[10px] text-black/30">
                  Đang cập nhật giá...
                </p>
              )}

              <div className="mt-4 rounded-[14px] bg-[#faf9f8] p-3">
                <p className="text-xs font-bold text-black/60">
                  {config?.couple?.senderName || 'Bạn'} → {config?.couple?.receiverName || 'Người ấy'}
                </p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-black/35">
                  {config?.proposal?.question || 'Món quà riêng của hai người'}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/[0.07] bg-white/95 px-3 py-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-black/30">
              Tổng cộng
            </p>
            <p className="truncate text-base font-black text-[#c9435d]">
              {formatVnd(
                checkoutPrice
              )}
            </p>
          </div>

          <button
            type="button"
            disabled={
              isCreatingPayment ||
              isRefreshingPrice
            }
            onClick={() =>
              void handleCreatePayment()
            }
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-[14px] bg-[#171717] px-5 text-sm font-black text-white disabled:opacity-45"
          >
            {isCreatingPayment && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Tạo QR thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

const CheckoutHeader:
React.FC<{
  label: string;
  onBack: () => void;
}> = ({
  label,
  onBack,
}) => (
  <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/95 backdrop-blur-xl">
    <div className="mx-auto grid h-[64px] max-w-5xl grid-cols-[80px_minmax(0,1fr)_80px] items-center px-3 sm:h-[68px] sm:grid-cols-[1fr_auto_1fr] sm:px-6">
      <button
        type="button"
        onClick={
          onBack
        }
        className="inline-flex min-h-10 items-center justify-start gap-1 text-xs font-bold text-black/45"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">
          Quay lại
        </span>
      </button>

      <div className="min-w-0 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#c9435d]">
          Checkout
        </p>
        <p className="truncate text-sm font-black">
          {label}
        </p>
      </div>

      <BrandLogo
        imageClassName="ml-auto h-8 w-auto sm:h-9"
      />
    </div>
  </header>
);

const StepBar:
React.FC<{
  active: 1 | 2;
}> = ({
  active,
}) => (
  <div className="flex items-center gap-2 text-[10px] font-black text-black/35">
    <span
      className={[
        'flex h-7 w-7 items-center justify-center rounded-full',
        active >= 1
          ? 'bg-[#171717] text-white'
          : 'bg-black/5',
      ].join(' ')}
    >
      {active > 1
        ? '✓'
        : '1'}
    </span>
    <span>
      Thông tin
    </span>
    <span className="h-px flex-1 bg-black/[0.08]" />
    <span
      className={[
        'flex h-7 w-7 items-center justify-center rounded-full',
        active === 2
          ? 'bg-[#171717] text-white'
          : 'bg-black/5',
      ].join(' ')}
    >
      2
    </span>
    <span>
      Chuyển khoản
    </span>
  </div>
);

interface CheckoutFieldProps {
  icon:
    React.ComponentType<{
      className?: string;
    }>;
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  inputMode?:
    React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  onChange:
    (value: string) => void;
}

const CheckoutField:
React.FC<CheckoutFieldProps> = ({
  icon: Icon,
  label,
  value,
  placeholder,
  type = 'text',
  inputMode,
  autoComplete,
  onChange,
}) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-bold text-black/55">
      {label}
    </span>

    <div className="flex min-h-12 items-center gap-3 rounded-[12px] border border-black/10 bg-white px-3.5 transition focus-within:border-[#c9435d]/45 focus-within:ring-2 focus-within:ring-[#c9435d]/10">
      <Icon className="h-4 w-4 shrink-0 text-black/25" />

      <input
        type={
          type
        }
        inputMode={
          inputMode
        }
        autoComplete={
          autoComplete
        }
        value={
          value
        }
        placeholder={
          placeholder
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="min-w-0 flex-1 bg-transparent py-3 text-[16px] text-black/70 outline-none placeholder:text-black/25 sm:text-sm"
      />
    </div>
  </label>
);

const PaymentRow:
React.FC<{
  label: string;
  value: string;
  important?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}> = ({
  label,
  value,
  important = false,
  actionLabel,
  onAction,
}) => (
  <div
    className={[
      'flex items-center gap-3 rounded-[14px] border p-3.5',
      important
        ? 'border-rose-200 bg-rose-50/65'
        : 'border-black/[0.06] bg-[#faf9f8]',
    ].join(' ')}
  >
    <div className="min-w-0 flex-1">
      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-black/30">
        {label}
      </p>
      <p
        className={[
          'mt-1 break-all text-[15px] font-black leading-5',
          important
            ? 'text-[#b93651]'
            : 'text-black/70',
        ].join(' ')}
      >
        {value}
      </p>
    </div>

    {onAction &&
      actionLabel && (
        <button
          type="button"
          onClick={
            onAction
          }
          className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-[10px] border border-black/[0.07] bg-white px-3 text-xs font-black text-black/55"
        >
          <Copy className="h-3.5 w-3.5" />
          {actionLabel}
        </button>
      )}
  </div>
);

const SummaryLine:
React.FC<{
  text: string;
}> = ({
  text,
}) => (
  <p className="flex items-center gap-2">
    <Check className="h-3.5 w-3.5 shrink-0 text-[#c9435d]" />
    {text}
  </p>
);

const InfoCard:
React.FC<{
  label: string;
  value: string;
  success?: boolean;
}> = ({
  label,
  value,
  success = false,
}) => (
  <div className="rounded-[15px] bg-[#faf9f8] p-4">
    <p className="text-[9px] font-black uppercase tracking-[0.1em] text-black/30">
      {label}
    </p>
    <p
      className={[
        'mt-1 break-all text-sm font-black',
        success
          ? 'text-emerald-700'
          : 'text-black/70',
      ].join(' ')}
    >
      {value}
    </p>
  </div>
);
