import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Landmark,
  Loader2,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

import {
  BrandLogo,
} from './BrandLogo';

import {
  VisualSceneExperience,
} from '../engine';

import type {
  TemplateVisualEditorConfig,
} from '../templates/visualEditor';

import {
  getEffectiveTemplatePrice,
  getPublicTemplateConfigById,
  getTemplateDiscountPercent,
  type TemplateConfig,
} from '../services/templateService';

import {
  createDynamicBankTransferOrder,
} from '../services/dynamicCheckoutService';

import {
  fetchCheckoutGiftState,
  type CheckoutCustomer,
} from '../services/giftService';

import {
  BANK_TRANSFER_CONFIG,
  buildPaymentReference,
  buildVietQrImageUrl,
} from '../config/payment';

import {
  getTemplatePresentation,
} from '../templates/templatePresentation';

import {
  getVisualTemplateFingerprint,
  loadVisualCustomerDraft,
} from '../services/visualCustomerDraftService';

interface Props {
  templateId: string;
  onBack: () => void;
  onBackHome: () => void;
}

const POLL_INTERVAL_MS =
  5000;

interface PendingDynamicCheckout {
  version: 1;
  giftId: string;
  draftFingerprint: string;
}

const pendingCheckoutKey = (
  templateId: string
) =>
  `dearly:dynamic-checkout:pending:${templateId}`;

const readPendingCheckout = (
  templateId: string,
  draft:
    TemplateVisualEditorConfig
):
  PendingDynamicCheckout |
  null => {
  try {
    const raw =
      window.sessionStorage.getItem(
        pendingCheckoutKey(
          templateId
        )
      );

    if (!raw) {
      return null;
    }

    const parsed =
      JSON.parse(
        raw
      ) as
        Partial<
          PendingDynamicCheckout
        >;

    if (
      parsed.version !==
        1 ||
      typeof parsed.giftId !==
        'string' ||
      !/^[A-Za-z0-9_-]{16,64}$/.test(
        parsed.giftId
      ) ||
      parsed.draftFingerprint !==
        getVisualTemplateFingerprint(
          draft
        )
    ) {
      window.sessionStorage.removeItem(
        pendingCheckoutKey(
          templateId
        )
      );
      return null;
    }

    return parsed as
      PendingDynamicCheckout;
  } catch {
    try {
      window.sessionStorage.removeItem(
        pendingCheckoutKey(
          templateId
        )
      );
    } catch {
      // ignore
    }

    return null;
  }
};

const savePendingCheckout = (
  templateId: string,
  giftId: string,
  draft:
    TemplateVisualEditorConfig
) => {
  try {
    const payload:
      PendingDynamicCheckout = {
        version: 1,
        giftId,
        draftFingerprint:
          getVisualTemplateFingerprint(
            draft
          ),
      };

    window.sessionStorage.setItem(
      pendingCheckoutKey(
        templateId
      ),
      JSON.stringify(
        payload
      )
    );
  } catch {
    // best effort
  }
};

const clearPendingCheckout = (
  templateId: string
) => {
  try {
    window.sessionStorage.removeItem(
      pendingCheckoutKey(
        templateId
      )
    );
  } catch {
    // ignore
  }
};

const isValidEmail = (
  value: string
) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );

const isValidPhone = (
  value: string
) =>
  /^[+0-9]{9,15}$/.test(
    value.replace(/\s+/g, '')
  );

const formatVnd = (
  amount: number
) =>
  new Intl.NumberFormat(
    'vi-VN'
  ).format(amount) +
  'đ';

const hasUsableVisualEditor = (
  template:
    TemplateConfig
) =>
  Boolean(
    template.visualEditor &&
      Array.isArray(
        template.visualEditor
          .scenes
      ) &&
      template.visualEditor
        .scenes.length >
        0
  );

export const DynamicVisualCheckoutPage:
React.FC<Props> = ({
  templateId,
  onBack,
  onBackHome,
}) => {
  const [
    template,
    setTemplate,
  ] =
    useState<
      TemplateConfig |
      null
    >(null);

  const [
    draft,
    setDraft,
  ] =
    useState<
      TemplateVisualEditorConfig |
      null
    >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

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
    creating,
    setCreating,
  ] = useState(false);

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
  ] = useState(0);

  const [
    paymentReady,
    setPaymentReady,
  ] = useState(false);

  const [
    paidAndPublished,
    setPaidAndPublished,
  ] = useState(false);

  const [
    copied,
    setCopied,
  ] = useState('');

  const [
    reviewOpen,
    setReviewOpen,
  ] = useState(false);

  const preparedRef =
    useRef(false);

  useEffect(() => {
    let active =
      true;

    const prepareCheckout =
      async () => {
        try {
          const next =
            await getPublicTemplateConfigById(
              templateId
            );

          if (!active) {
            return;
          }

          if (
            next.status !==
              'available' ||
            !hasUsableVisualEditor(
              next
            )
          ) {
            throw new Error(
              'Template này hiện chưa mở bán.'
            );
          }

          const nextDraft =
            loadVisualCustomerDraft(
              templateId,
              next.visualEditor!
            );

          setTemplate(
            next
          );
          setCheckoutPrice(
            getEffectiveTemplatePrice(
              next
            )
          );
          setDraft(
            nextDraft
          );

          const pending =
            readPendingCheckout(
              templateId,
              nextDraft
            );

          if (!pending) {
            return;
          }

          try {
            const state =
              await fetchCheckoutGiftState(
                pending.giftId
              );

            if (!active) {
              return;
            }

            if (
              !state ||
              state.paymentStatus ===
                'unpaid'
            ) {
              clearPendingCheckout(
                templateId
              );
              return;
            }

            setGiftId(
              state.id
            );
            setOrderNumber(
              state.orderNumber
            );
            setOrderCode(
              state.orderCode
            );
            setCheckoutPrice(
              state.price
            );
            setPaymentReady(
              true
            );
            preparedRef.current =
              true;

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
              setPaidAndPublished(
                true
              );
              clearPendingCheckout(
                templateId
              );
            }
          } catch (
            resumeError
          ) {
            console.warn(
              'Dynamic checkout resume:',
              resumeError
            );
            clearPendingCheckout(
              templateId
            );
            preparedRef.current =
              false;
          }
        } catch (
          loadError: any
        ) {
          if (!active) {
            return;
          }

          setError(
            loadError?.message ||
              'Không tải được trang thanh toán.'
          );
        } finally {
          if (active) {
            setLoading(
              false
            );
          }
        }
      };

    void prepareCheckout();

    return () => {
      active = false;
    };
  }, [
    templateId,
  ]);

  useEffect(() => {
    if (
      !giftId ||
      !paymentReady ||
      paidAndPublished
    ) {
      return;
    }

    let cancelled =
      false;

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
            setPaidAndPublished(
              true
            );
            clearPendingCheckout(
              templateId
            );
          }
        } catch (
          pollError
        ) {
          console.warn(
            'Dynamic payment poll:',
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
    paymentReady,
    paidAndPublished,
    templateId,
  ]);

  const paymentReference =
    useMemo(
      () =>
        orderCode ||
        (
          orderNumber
            ? buildPaymentReference(
                orderNumber
              )
            : ''
        ),
      [
        orderCode,
        orderNumber,
      ]
    );

  const giftUrl =
    giftId
      ? `${window.location.origin}/gift/${giftId}`
      : '';

  const copyText =
    async (
      key: string,
      value: string
    ) => {
      try {
        await navigator.clipboard.writeText(
          value
        );
        setCopied(
          key
        );
        window.setTimeout(
          () =>
            setCopied(
              ''
            ),
          1600
        );
      } catch {
        // ignore clipboard failure
      }
    };

  const validate =
    () => {
      if (
        !customer.fullName.trim()
      ) {
        return 'Nhập tên người mua.';
      }

      if (
        !isValidEmail(
          customer.email.trim()
        )
      ) {
        return 'Nhập email hợp lệ.';
      }

      if (
        !isValidPhone(
          customer.phone.trim()
        )
      ) {
        return 'Nhập số điện thoại hợp lệ.';
      }

      return '';
    };

  const createPayment =
    async () => {
      if (
        preparedRef.current ||
        !draft ||
        !template
      ) {
        return;
      }

      const validationError =
        validate();

      if (validationError) {
        setError(
          validationError
        );
        return;
      }

      preparedRef.current =
        true;
      setCreating(
        true
      );
      setError('');

      try {
        const result =
          await createDynamicBankTransferOrder(
            templateId,
            draft,
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
        setPaymentReady(
          true
        );

        savePendingCheckout(
          templateId,
          result.giftId,
          draft
        );

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      } catch (
        paymentError: any
      ) {
        preparedRef.current =
          false;

        setError(
          paymentError?.message ||
            'Không thể tạo yêu cầu thanh toán.'
        );
      } finally {
        setCreating(
          false
        );
      }
    };

  if (loading) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#fbf8f6] text-sm font-semibold text-black/40">
        Đang tải thanh toán...
      </main>
    );
  }

  if (
    !template ||
    !draft
  ) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#fbf8f6] px-5">
        <div className="w-full max-w-md rounded-[24px] border border-black/[0.07] bg-white p-7 text-center shadow-[0_20px_60px_rgba(50,20,30,0.07)]">
          <p className="text-lg font-black">
            Không mở được thanh toán
          </p>

          <p className="mt-2 text-sm leading-6 text-black/40">
            {error ||
              'Template không tồn tại.'}
          </p>

          <button
            type="button"
            onClick={
              onBack
            }
            className="mt-6 min-h-12 rounded-[13px] bg-[#171717] px-5 text-sm font-bold text-white"
          >
            Quay lại chỉnh sửa
          </button>
        </div>
      </main>
    );
  }

  const presentation =
    getTemplatePresentation(
      template
    );

  const discount =
    getTemplateDiscountPercent(
      template
    );

  return (
    <div
      className={[
        'min-h-[100svh] bg-[#fbf8f6] text-[#171717]',
        !paymentReady
          ? 'pb-24 lg:pb-0'
          : '',
      ].join(' ')}
    >
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto grid h-[64px] max-w-[1480px] grid-cols-[84px_minmax(0,1fr)_84px] items-center px-3 sm:h-[68px] sm:grid-cols-[1fr_auto_1fr] sm:px-8">
          <button
            type="button"
            onClick={
              onBack
            }
            className="inline-flex min-h-10 items-center gap-1 text-xs font-bold text-black/45"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">
              Chỉnh sửa
            </span>
          </button>

          <BrandLogo
            onClick={
              onBackHome
            }
            imageClassName="mx-auto h-9 w-auto sm:h-10"
          />

          <span className="justify-self-end text-[11px] font-black text-[#c9435d] sm:text-xs">
            {formatVnd(
              checkoutPrice
            )}
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1320px] gap-4 px-3 py-4 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-7 lg:px-8 lg:py-8">
        <aside className="order-1 h-fit rounded-[22px] border border-black/[0.07] bg-white p-4 shadow-[0_20px_65px_rgba(45,20,28,0.06)] sm:p-6 lg:order-2 lg:sticky lg:top-[92px] lg:rounded-[26px]">
          {!paymentReady ? (
            <>
              <StepBar
                active={1}
              />

              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.14em] text-[#c9435d]">
                {
                  presentation.category
                }
              </p>

              <h1 className="mt-2 text-[26px] font-black leading-[1.05] tracking-[-0.04em]">
                Thanh toán {template.name}
              </h1>

              <p className="mt-2 text-xs leading-5 text-black/42">
                Điền thông tin người mua. Bản quà bạn vừa chỉnh đã được giữ nguyên.
              </p>

              <div className="mt-4 rounded-[15px] bg-[#faf7f6] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">
                      {template.name}
                    </p>
                    <p className="mt-1 text-[10px] text-black/35">
                      Digital gift · {
                        presentation.category
                      }
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-lg font-black text-[#c9435d]">
                      {formatVnd(
                        checkoutPrice
                      )}
                    </p>

                    {discount >
                      0 && (
                      <p className="mt-0.5 text-[9px] text-black/28 line-through">
                        {formatVnd(
                          template.basePrice
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <Field
                  label="Họ và tên"
                  placeholder="Nguyễn Văn A"
                  value={
                    customer.fullName
                  }
                  autoComplete="name"
                  onChange={(
                    fullName
                  ) =>
                    setCustomer(
                      (
                        current
                      ) => ({
                        ...current,
                        fullName,
                      })
                    )
                  }
                />

                <Field
                  label="Email"
                  type="email"
                  placeholder="email@example.com"
                  value={
                    customer.email
                  }
                  autoComplete="email"
                  onChange={(
                    email
                  ) =>
                    setCustomer(
                      (
                        current
                      ) => ({
                        ...current,
                        email,
                      })
                    )
                  }
                />

                <Field
                  label="Số điện thoại"
                  type="tel"
                  inputMode="tel"
                  placeholder="09xxxxxxxx"
                  value={
                    customer.phone
                  }
                  autoComplete="tel"
                  onChange={(
                    phone
                  ) =>
                    setCustomer(
                      (
                        current
                      ) => ({
                        ...current,
                        phone,
                      })
                    )
                  }
                />
              </div>

              {error && (
                <div className="mt-4 rounded-[13px] border border-red-100 bg-red-50 px-3.5 py-3 text-sm font-semibold leading-5 text-red-600">
                  {error}
                </div>
              )}

              <div className="mt-5 flex items-center justify-between border-t border-black/[0.07] pt-4">
                <span className="text-xs font-bold text-black/40">
                  Tổng cộng
                </span>
                <span className="text-xl font-black text-[#c9435d]">
                  {formatVnd(
                    checkoutPrice
                  )}
                </span>
              </div>

              <button
                type="button"
                disabled={
                  creating
                }
                onClick={() =>
                  void createPayment()
                }
                className="mt-4 hidden min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#171717] px-5 text-sm font-black text-white transition hover:bg-[#c9435d] disabled:opacity-45 lg:flex"
              >
                {creating && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Tạo QR thanh toán
              </button>

              <div className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-black/35">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <p>
                  Link quà chỉ được mở sau khi thanh toán được xác nhận.
                </p>
              </div>
            </>
          ) : (
            <>
              <StepBar
                active={2}
              />

              <div className="mt-5 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#c9435d]">
                  {paidAndPublished
                    ? 'Hoàn tất'
                    : 'Chuyển khoản'}
                </p>

                <h1 className="mt-2 text-[26px] font-black tracking-[-0.04em]">
                  {paidAndPublished
                    ? 'Món quà đã sẵn sàng'
                    : 'Quét QR để thanh toán'}
                </h1>

                {!paidAndPublished && (
                  <>
                    <p className="mt-2 text-3xl font-black tracking-[-0.045em] text-[#c9435d]">
                      {formatVnd(
                        checkoutPrice
                      )}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-black/40">
                      QR đã điền sẵn số tiền và nội dung chuyển khoản.
                    </p>
                  </>
                )}
              </div>

              {!paidAndPublished && (
                <div className="mx-auto mt-4 max-w-[300px] rounded-[18px] border border-black/[0.07] bg-white p-2">
                  <img
                    src={buildVietQrImageUrl(
                      orderNumber,
                      checkoutPrice
                    )}
                    alt="QR thanh toán"
                    className="w-full rounded-[13px]"
                  />
                </div>
              )}

              {!paidAndPublished && (
                <div className="mt-4 space-y-2.5">
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
                    onCopy={() =>
                      void copyText(
                        'account',
                        BANK_TRANSFER_CONFIG.accountNo
                      )
                    }
                    copied={
                      copied ===
                      'account'
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
                    onCopy={() =>
                      void copyText(
                        'reference',
                        paymentReference
                      )
                    }
                    copied={
                      copied ===
                      'reference'
                    }
                  />
                </div>
              )}

              {paidAndPublished ? (
                <div className="mt-5 rounded-[18px] border border-emerald-100 bg-emerald-50 p-4 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-5 w-5" />
                  </div>

                  <p className="mt-3 text-sm font-black text-emerald-800">
                    Thanh toán đã được xác nhận
                  </p>

                  <p className="mt-2 break-all text-xs leading-5 text-emerald-800/65">
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
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[11px] border border-emerald-200 bg-white px-3 text-xs font-black text-emerald-800"
                    >
                      {copied ===
                      'gift' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      Sao chép link
                    </button>

                    <a
                      href={
                        giftUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[11px] bg-[#171717] px-3 text-xs font-black text-white"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Mở món quà
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-[15px] border border-amber-200 bg-amber-50 p-3.5">
                  <div className="flex items-start gap-2.5">
                    <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-amber-600" />
                    <div>
                      <p className="text-xs font-black text-amber-900">
                        Đang chờ xác nhận
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-amber-800/70">
                        Cứ giữ trang này mở. Trạng thái sẽ tự cập nhật mỗi 5 giây.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <p className="mt-3 text-center font-mono text-[10px] font-bold text-black/30">
                Mã đơn · {
                  paymentReference
                }
              </p>
            </>
          )}
        </aside>

        <section className="order-2 min-w-0 lg:order-1">
          <div className="flex items-center justify-between gap-3 rounded-[16px] border border-black/[0.07] bg-white p-3 lg:mb-4 lg:border-0 lg:bg-transparent lg:p-0">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.13em] text-[#c9435d]">
                Bản quà của bạn
              </p>
              <h2 className="mt-1 truncate text-base font-black lg:text-2xl">
                {template.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                setReviewOpen(
                  (
                    current
                  ) =>
                    !current
                )
              }
              className="min-h-10 shrink-0 rounded-[11px] border border-black/[0.08] bg-white px-3 text-xs font-bold text-black/50 lg:hidden"
            >
              {reviewOpen
                ? 'Ẩn preview'
                : 'Xem lại'}
            </button>

            <button
              type="button"
              onClick={
                onBack
              }
              className="hidden min-h-10 rounded-[11px] border border-black/[0.08] bg-white px-3 text-xs font-bold text-black/45 lg:block"
            >
              Chỉnh lại
            </button>
          </div>

          <div
            className={[
              'overflow-hidden rounded-[22px] border border-black/[0.07] bg-white shadow-[0_20px_65px_rgba(45,20,28,0.07)] lg:block lg:rounded-[26px]',
              reviewOpen
                ? 'mt-3 block'
                : 'hidden',
            ].join(' ')}
          >
            <VisualSceneExperience
              scenes={
                draft.scenes
              }
              initialSceneId={
                draft.initialSceneId
              }
            />
          </div>

          <p className="mt-3 hidden text-center text-[11px] leading-5 text-black/30 lg:block">
            Đây là đúng bản quà được giữ lại cho đơn thanh toán này.
          </p>
        </section>
      </main>

      {!paymentReady && (
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
                creating
              }
              onClick={() =>
                void createPayment()
              }
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-[14px] bg-[#171717] px-5 text-sm font-black text-white disabled:opacity-45"
            >
              {creating && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Tạo QR thanh toán
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

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
      {active >
      1
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
        active ===
        2
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

const Field:
React.FC<{
  label: string;
  value: string;
  type?: string;
  inputMode?:
    React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  placeholder?: string;
  onChange:
    (value: string) => void;
}> = ({
  label,
  value,
  type = 'text',
  inputMode,
  autoComplete,
  placeholder,
  onChange,
}) => (
  <label className="block">
    <span className="text-xs font-bold text-black/55">
      {label}
    </span>

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
      className="mt-1.5 min-h-12 w-full rounded-[12px] border border-black/[0.09] bg-[#fdfcfc] px-3.5 py-3 text-[16px] outline-none transition placeholder:text-black/20 focus:border-[#c9435d]/45 focus:bg-white focus:ring-2 focus:ring-[#c9435d]/10 sm:text-sm"
    />
  </label>
);

const PaymentRow:
React.FC<{
  label: string;
  value: string;
  important?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}> = ({
  label,
  value,
  important = false,
  onCopy,
  copied,
}) => (
  <div
    className={[
      'flex items-center gap-3 rounded-[13px] border p-3.5',
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
          'mt-1 break-all text-[14px] font-black leading-5',
          important
            ? 'text-[#b93651]'
            : 'text-black/70',
        ].join(' ')}
      >
        {value}
      </p>
    </div>

    {onCopy && (
      <button
        type="button"
        onClick={
          onCopy
        }
        className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-[10px] border border-black/[0.07] bg-white px-3 text-xs font-black text-black/55"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        {copied
          ? 'Đã copy'
          : 'Copy'}
      </button>
    )}
  </div>
);
