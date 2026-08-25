import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Check,
  Copy,
  Loader2,
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

interface Props {
  templateId: string;
  onBack: () => void;
  onBackHome: () => void;
}

const POLL_INTERVAL_MS =
  5000;

const draftKey = (
  templateId: string
) =>
  `dearly:visual-customer-draft:${templateId}`;

const clone = <T,>(
  value: T
): T =>
  JSON.parse(
    JSON.stringify(value)
  );

const readSavedDraft = (
  templateId: string,
  fallback:
    TemplateVisualEditorConfig
) => {
  try {
    const raw =
      window.localStorage.getItem(
        draftKey(templateId)
      );

    if (!raw) {
      return clone(fallback);
    }

    const parsed =
      JSON.parse(raw);

    const config =
      parsed?.config ||
      parsed;

    if (
      config &&
      Array.isArray(
        config.scenes
      ) &&
      typeof config
        .initialSceneId ===
        'string'
    ) {
      return config as
        TemplateVisualEditorConfig;
    }
  } catch {
    // fallback below
  }

  return clone(fallback);
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
    value.replace(
      /\s+/g,
      ''
    )
  );

const formatVnd = (
  amount: number
) =>
  new Intl.NumberFormat(
    'vi-VN'
  ).format(amount) +
  'đ';

export const DynamicVisualCheckoutPage:
React.FC<Props> = ({
  templateId,
  onBack,
  onBackHome,
}) => {
  const [template, setTemplate] =
    useState<TemplateConfig | null>(
      null
    );

  const [draft, setDraft] =
    useState<TemplateVisualEditorConfig | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [customer, setCustomer] =
    useState<CheckoutCustomer>({
      fullName: '',
      email: '',
      phone: '',
    });

  const [creating, setCreating] =
    useState(false);

  const [giftId, setGiftId] =
    useState('');

  const [orderNumber, setOrderNumber] =
    useState('');

  const [orderCode, setOrderCode] =
    useState('');

  const [checkoutPrice, setCheckoutPrice] =
    useState(0);

  const [paymentReady, setPaymentReady] =
    useState(false);

  const [paidAndPublished, setPaidAndPublished] =
    useState(false);

  const [copied, setCopied] =
    useState('');

  const preparedRef =
    useRef(false);

  useEffect(() => {
    let active = true;

    void getPublicTemplateConfigById(
      templateId
    )
      .then((next) => {
        if (!active) return;

        if (
          !next.visible ||
          next.status !==
            'available' ||
          !next.visualEditor
            ?.enabled
        ) {
          throw new Error(
            'Template này hiện chưa mở bán.'
          );
        }

        setTemplate(next);
        setCheckoutPrice(
          getEffectiveTemplatePrice(
            next
          )
        );
        setDraft(
          readSavedDraft(
            templateId,
            next.visualEditor
          )
        );
      })
      .catch((loadError: any) => {
        if (!active) return;

        setError(
          loadError?.message ||
          'Không tải được trang thanh toán.'
        );
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [templateId]);

  useEffect(() => {
    if (
      !giftId ||
      !paymentReady ||
      paidAndPublished
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
            setPaidAndPublished(
              true
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
  ]);

  const paymentReference =
    useMemo(
      () =>
        orderNumber
          ? buildPaymentReference(
              orderNumber
            )
          : '',
      [orderNumber]
    );

  const giftUrl =
    giftId
      ? `${window.location.origin}/gift/${giftId}`
      : '';

  const copyText = async (
    key: string,
    value: string
  ) => {
    try {
      await navigator.clipboard.writeText(
        value
      );
      setCopied(key);
      window.setTimeout(
        () => setCopied(''),
        1400
      );
    } catch {
      // ignore clipboard failure
    }
  };

  const validate = () => {
    if (!customer.fullName.trim()) {
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
        setError(validationError);
        return;
      }

      preparedRef.current = true;
      setCreating(true);
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
        setPaymentReady(true);
      } catch (
        paymentError: any
      ) {
        preparedRef.current = false;
        setError(
          paymentError?.message ||
          'Không thể tạo yêu cầu thanh toán.'
        );
      } finally {
        setCreating(false);
      }
    };

  if (loading) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#f7f4f2] text-sm font-bold text-black/40">
        Đang tải thanh toán...
      </main>
    );
  }

  if (
    !template ||
    !draft
  ) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#f7f4f2] px-5">
        <div className="w-full max-w-md rounded-[24px] bg-white p-6 text-center">
          <p className="text-lg font-black">
            Không mở được thanh toán
          </p>
          <p className="mt-2 text-sm text-black/40">
            {error ||
              'Template không tồn tại.'}
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-5 rounded-[12px] bg-black px-5 py-3 text-sm font-black text-white"
          >
            Quay lại chỉnh sửa
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-[100svh] bg-[#f7f4f2] text-[#191919]">
      <header className="border-b border-black/6 bg-white">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-8">
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-black text-black/45"
          >
            ← Chỉnh sửa
          </button>

          <BrandLogo
            onClick={onBackHome}
            imageClassName="h-10 w-auto"
          />

          <span className="text-xs font-black">
            {formatVnd(
              checkoutPrice
            )}
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-8 lg:grid-cols-[minmax(0,1.1fr)_420px] lg:py-10">
        <section className="min-w-0">
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#b83e57]">
              Đơn hàng
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">
              {template.name}
            </h1>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-black/7 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
            <VisualSceneExperience
              scenes={draft.scenes}
              initialSceneId={draft.initialSceneId}
            />
          </div>
        </section>

        <aside className="h-fit rounded-[24px] border border-black/7 bg-white p-5 shadow-[0_18px_50px_rgba(0,0,0,0.05)] lg:sticky lg:top-5">
          {!paymentReady ? (
            <>
              <h2 className="text-lg font-black">
                Thông tin thanh toán
              </h2>
              <p className="mt-1 text-xs leading-5 text-black/38">
                Kiểm tra mẫu bên trái rồi nhập thông tin để tạo mã chuyển khoản.
              </p>

              <div className="mt-5 space-y-3">
                <Field
                  label="Họ tên"
                  value={customer.fullName}
                  onChange={(fullName) =>
                    setCustomer((current) => ({
                      ...current,
                      fullName,
                    }))
                  }
                />
                <Field
                  label="Email"
                  type="email"
                  value={customer.email}
                  onChange={(email) =>
                    setCustomer((current) => ({
                      ...current,
                      email,
                    }))
                  }
                />
                <Field
                  label="Số điện thoại"
                  type="tel"
                  value={customer.phone}
                  onChange={(phone) =>
                    setCustomer((current) => ({
                      ...current,
                      phone,
                    }))
                  }
                />
              </div>

              {error && (
                <div className="mt-4 rounded-[12px] bg-red-50 px-3 py-2.5 text-[11px] font-bold leading-5 text-red-600">
                  {error}
                </div>
              )}

              <div className="mt-5 flex items-center justify-between border-t border-black/7 pt-4">
                <span className="text-xs font-bold text-black/40">
                  Tổng cộng
                </span>
                <span className="text-xl font-black">
                  {formatVnd(
                    checkoutPrice
                  )}
                </span>
              </div>

              <button
                type="button"
                disabled={creating}
                onClick={() =>
                  void createPayment()
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#191919] px-5 py-3.5 text-sm font-black text-white disabled:opacity-45"
              >
                {creating && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Tạo mã thanh toán
              </button>
            </>
          ) : (
            <>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#b83e57]">
                  Chuyển khoản ngân hàng
                </p>
                <h2 className="mt-2 text-xl font-black">
                  {paidAndPublished
                    ? 'Thanh toán hoàn tất'
                    : 'Quét QR để thanh toán'}
                </h2>
              </div>

              {!paidAndPublished && (
                <img
                  src={buildVietQrImageUrl(
                    orderNumber,
                    checkoutPrice
                  )}
                  alt="QR thanh toán"
                  className="mx-auto mt-4 w-full max-w-[270px] rounded-[16px] border border-black/7"
                />
              )}

              <div className="mt-5 space-y-2 rounded-[14px] bg-[#faf8f7] p-3">
                <PaymentRow
                  label="Ngân hàng"
                  value={BANK_TRANSFER_CONFIG.bankName}
                />
                <PaymentRow
                  label="Số tài khoản"
                  value={BANK_TRANSFER_CONFIG.accountNo}
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
                />
                <PaymentRow
                  label="Nội dung"
                  value={paymentReference}
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
                <PaymentRow
                  label="Mã đơn"
                  value={orderCode}
                />
              </div>

              {paidAndPublished ? (
                <div className="mt-4 rounded-[14px] bg-emerald-50 p-4 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-black text-emerald-800">
                    Món quà đã được xuất bản
                  </p>
                  <a
                    href={giftUrl}
                    className="mt-3 inline-flex rounded-[11px] bg-[#191919] px-4 py-2.5 text-xs font-black text-white"
                  >
                    Mở món quà
                  </a>
                </div>
              ) : (
                <p className="mt-4 text-center text-[10px] leading-5 text-black/35">
                  Trang sẽ tự cập nhật sau khi Admin xác nhận thanh toán.
                </p>
              )}
            </>
          )}
        </aside>
      </main>
    </div>
  );
};

const Field:
React.FC<{
  label: string;
  value: string;
  type?: string;
  onChange: (
    value: string
  ) => void;
}> = ({
  label,
  value,
  type = 'text',
  onChange,
}) => (
  <label className="block">
    <span className="text-[10px] font-black text-black/45">
      {label}
    </span>
    <input
      type={type}
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      className="mt-1.5 w-full rounded-[11px] border border-black/9 bg-white px-3 py-3 text-sm outline-none focus:border-[#b83e57]/45"
    />
  </label>
);

const PaymentRow:
React.FC<{
  label: string;
  value: string;
  onCopy?: () => void;
  copied?: boolean;
}> = ({
  label,
  value,
  onCopy,
  copied,
}) => (
  <div className="flex items-center justify-between gap-3 rounded-[9px] bg-white px-3 py-2.5">
    <div className="min-w-0">
      <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-black/28">
        {label}
      </p>
      <p className="mt-0.5 truncate text-xs font-black">
        {value}
      </p>
    </div>

    {onCopy && (
      <button
        type="button"
        onClick={onCopy}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-black/7"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    )}
  </div>
);
