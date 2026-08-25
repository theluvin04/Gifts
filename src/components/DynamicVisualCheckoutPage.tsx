import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, Loader2 } from 'lucide-react';

import { CustomerSiteHeader } from './CustomerSiteHeader';
import { VisualSceneExperience } from '../engine';
import type { TemplateVisualEditorConfig } from '../templates/visualEditor';
import {
  getEffectiveTemplatePrice,
  getPublicTemplateConfigById,
  getTemplateDiscountPercent,
  type TemplateConfig,
} from '../services/templateService';
import { createDynamicBankTransferOrder } from '../services/dynamicCheckoutService';
import {
  fetchCheckoutGiftState,
  type CheckoutCustomer,
} from '../services/giftService';
import {
  BANK_TRANSFER_CONFIG,
  buildPaymentReference,
  buildVietQrImageUrl,
} from '../config/payment';
import { getTemplatePresentation } from '../templates/templatePresentation';

interface Props {
  templateId: string;
  onBack: () => void;
  onBackHome: () => void;
}

const POLL_INTERVAL_MS = 5000;

const draftKey = (templateId: string) =>
  `dearly:visual-customer-draft:${templateId}`;

const clone = <T,>(value: T): T =>
  JSON.parse(JSON.stringify(value));

const readSavedDraft = (
  templateId: string,
  fallback: TemplateVisualEditorConfig
) => {
  try {
    const raw = window.localStorage.getItem(draftKey(templateId));
    if (!raw) return clone(fallback);

    const parsed = JSON.parse(raw);
    const config = parsed?.config || parsed;

    if (
      config &&
      Array.isArray(config.scenes) &&
      typeof config.initialSceneId === 'string'
    ) {
      return config as TemplateVisualEditorConfig;
    }
  } catch {
    // fallback below
  }

  return clone(fallback);
};

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidPhone = (value: string) =>
  /^[+0-9]{9,15}$/.test(value.replace(/\s+/g, ''));

const formatVnd = (amount: number) =>
  new Intl.NumberFormat('vi-VN').format(amount) + 'đ';

const hasUsableVisualEditor = (
  template: TemplateConfig
) =>
  Boolean(
    template.visualEditor &&
      Array.isArray(template.visualEditor.scenes) &&
      template.visualEditor.scenes.length > 0
  );

export const DynamicVisualCheckoutPage: React.FC<Props> = ({
  templateId,
  onBack,
  onBackHome,
}) => {
  const [template, setTemplate] = useState<TemplateConfig | null>(null);
  const [draft, setDraft] = useState<TemplateVisualEditorConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customer, setCustomer] = useState<CheckoutCustomer>({
    fullName: '',
    email: '',
    phone: '',
  });
  const [creating, setCreating] = useState(false);
  const [giftId, setGiftId] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderCode, setOrderCode] = useState('');
  const [checkoutPrice, setCheckoutPrice] = useState(0);
  const [paymentReady, setPaymentReady] = useState(false);
  const [paidAndPublished, setPaidAndPublished] = useState(false);
  const [copied, setCopied] = useState('');
  const preparedRef = useRef(false);

  useEffect(() => {
    let active = true;

    void getPublicTemplateConfigById(templateId)
      .then((next) => {
        if (!active) return;

        if (
          !next.visible ||
          next.status !== 'available' ||
          !hasUsableVisualEditor(next)
        ) {
          throw new Error('Template này hiện chưa mở bán.');
        }

        setTemplate(next);
        setCheckoutPrice(getEffectiveTemplatePrice(next));
        setDraft(readSavedDraft(templateId, next.visualEditor!));
      })
      .catch((loadError: any) => {
        if (!active) return;
        setError(loadError?.message || 'Không tải được trang thanh toán.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [templateId]);

  useEffect(() => {
    if (!giftId || !paymentReady || paidAndPublished) return;

    let cancelled = false;

    const checkPayment = async () => {
      try {
        const state = await fetchCheckoutGiftState(giftId);

        if (
          !cancelled &&
          state &&
          (state.paymentStatus === 'paid' ||
            state.paymentStatus === 'paid_test') &&
          (state.status === 'published' || state.isPublished)
        ) {
          setPaidAndPublished(true);
        }
      } catch (pollError) {
        console.warn('Dynamic payment poll:', pollError);
      }
    };

    void checkPayment();

    const timer = window.setInterval(() => {
      void checkPayment();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [giftId, paymentReady, paidAndPublished]);

  const paymentReference = useMemo(
    () => (orderNumber ? buildPaymentReference(orderNumber) : ''),
    [orderNumber]
  );

  const giftUrl = giftId
    ? `${window.location.origin}/gift/${giftId}`
    : '';

  const copyText = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(''), 1400);
    } catch {
      // ignore clipboard failure
    }
  };

  const validate = () => {
    if (!customer.fullName.trim()) return 'Nhập tên người mua.';
    if (!isValidEmail(customer.email.trim())) return 'Nhập email hợp lệ.';
    if (!isValidPhone(customer.phone.trim())) return 'Nhập số điện thoại hợp lệ.';
    return '';
  };

  const createPayment = async () => {
    if (preparedRef.current || !draft || !template) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    preparedRef.current = true;
    setCreating(true);
    setError('');

    try {
      const result = await createDynamicBankTransferOrder(
        templateId,
        draft,
        {
          fullName: customer.fullName.trim(),
          email: customer.email.trim(),
          phone: customer.phone.trim(),
        }
      );

      setGiftId(result.giftId);
      setOrderNumber(result.orderNumber);
      setOrderCode(result.orderCode);
      setCheckoutPrice(result.price);
      setPaymentReady(true);
    } catch (paymentError: any) {
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
      <main className="flex min-h-[100svh] items-center justify-center bg-[#fbf8f6] text-sm font-semibold text-black/40">
        Đang tải thanh toán...
      </main>
    );
  }

  if (!template || !draft) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#fbf8f6] px-5">
        <div className="w-full max-w-md rounded-[24px] border border-black/[0.07] bg-white p-7 text-center shadow-[0_20px_60px_rgba(50,20,30,0.07)]">
          <p className="text-lg font-black">Không mở được thanh toán</p>
          <p className="mt-2 text-sm leading-6 text-black/40">
            {error || 'Template không tồn tại.'}
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-6 rounded-[13px] bg-[#171717] px-5 py-3 text-sm font-bold text-white"
          >
            Quay lại chỉnh sửa
          </button>
        </div>
      </main>
    );
  }

  const presentation = getTemplatePresentation(template);
  const discount = getTemplateDiscountPercent(template);

  return (
    <div className="min-h-[100svh] bg-[#fbf8f6] text-[#171717]">
      <CustomerSiteHeader
        onHome={onBackHome}
        onTemplates={() => {
          window.location.href = '/#templates';
        }}
        onHowItWorks={() => {
          window.location.href = '/#how-it-works';
        }}
        onTrackOrder={() => {
          window.location.href = '/track-order';
        }}
        active="templates"
        primaryAction={{
          label: 'Chỉnh sửa',
          onClick: onBack,
        }}
      />

      <main className="mx-auto grid max-w-[1480px] gap-7 px-4 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_410px] lg:items-start lg:py-9">
        <section className="min-w-0">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#c9435d]">
                Xem lại mẫu
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-[-0.035em]">
                {template.name}
              </h1>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="rounded-[11px] border border-black/[0.08] bg-white px-3 py-2 text-[10px] font-bold text-black/45"
            >
              Chỉnh lại
            </button>
          </div>

          <div className="overflow-hidden rounded-[26px] border border-black/[0.07] bg-white shadow-[0_20px_65px_rgba(45,20,28,0.07)]">
            <VisualSceneExperience
              scenes={draft.scenes}
              initialSceneId={draft.initialSceneId}
            />
          </div>
        </section>

        <aside className="h-fit rounded-[26px] border border-black/[0.07] bg-white p-6 shadow-[0_20px_65px_rgba(45,20,28,0.06)] lg:sticky lg:top-6">
          {!paymentReady ? (
            <>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.14em] text-black/30">
                <span className="rounded-full bg-[#171717] px-2 py-1 text-white">1</span>
                Thông tin
                <span className="h-px flex-1 bg-black/[0.08]" />
                <span className="rounded-full bg-black/[0.05] px-2 py-1 text-black/35">2</span>
                Chuyển khoản
              </div>

              <p className="mt-5 text-[9px] font-black uppercase tracking-[0.15em] text-[#c9435d]">
                {presentation.category}
              </p>
              <h2 className="mt-2 text-[26px] font-black leading-[1.05] tracking-[-0.04em]">
                Thanh toán {template.name}
              </h2>
              <p className="mt-2.5 text-xs leading-5 text-black/42">
                Điền thông tin người mua để tạo mã chuyển khoản và giữ đúng bản mẫu bạn vừa chỉnh.
              </p>

              <div className="mt-5 rounded-[14px] bg-[#faf7f6] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black">{template.name}</p>
                    <p className="mt-1 text-[10px] text-black/35">
                      Digital gift · {presentation.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black">{formatVnd(checkoutPrice)}</p>
                    {discount > 0 && (
                      <p className="mt-0.5 text-[9px] text-black/28 line-through">
                        {formatVnd(template.basePrice)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3.5">
                <Field
                  label="Họ và tên"
                  placeholder="Nguyễn Văn A"
                  value={customer.fullName}
                  onChange={(fullName) =>
                    setCustomer((current) => ({ ...current, fullName }))
                  }
                />
                <Field
                  label="Email"
                  type="email"
                  placeholder="email@example.com"
                  value={customer.email}
                  onChange={(email) =>
                    setCustomer((current) => ({ ...current, email }))
                  }
                />
                <Field
                  label="Số điện thoại"
                  type="tel"
                  placeholder="09xxxxxxxx"
                  value={customer.phone}
                  onChange={(phone) =>
                    setCustomer((current) => ({ ...current, phone }))
                  }
                />
              </div>

              {error && (
                <div className="mt-4 rounded-[12px] bg-red-50 px-3 py-2.5 text-[11px] font-bold leading-5 text-red-600">
                  {error}
                </div>
              )}

              <div className="mt-5 flex items-center justify-between border-t border-black/[0.07] pt-4">
                <span className="text-xs font-bold text-black/40">Tổng cộng</span>
                <span className="text-xl font-black">{formatVnd(checkoutPrice)}</span>
              </div>

              <button
                type="button"
                disabled={creating}
                onClick={() => void createPayment()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#171717] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#c9435d] disabled:opacity-45"
              >
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                Tiếp tục thanh toán
              </button>

              <p className="mt-3 text-center text-[10px] leading-4 text-black/30">
                Thanh toán bằng chuyển khoản ngân hàng. Link quà sẽ được mở sau khi xác nhận thanh toán.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.14em] text-black/30">
                <span className="rounded-full bg-emerald-500 px-2 py-1 text-white">✓</span>
                Thông tin
                <span className="h-px flex-1 bg-black/[0.08]" />
                <span className="rounded-full bg-[#171717] px-2 py-1 text-white">2</span>
                Chuyển khoản
              </div>

              <div className="mt-5 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#c9435d]">
                  {paidAndPublished ? 'Hoàn tất' : 'Chuyển khoản ngân hàng'}
                </p>
                <h2 className="mt-2 text-[26px] font-black tracking-[-0.04em]">
                  {paidAndPublished
                    ? 'Món quà đã sẵn sàng'
                    : 'Quét QR để thanh toán'}
                </h2>
                {!paidAndPublished && (
                  <p className="mt-2 text-xs leading-5 text-black/40">
                    Chuyển đúng số tiền và giữ nguyên nội dung chuyển khoản bên dưới.
                  </p>
                )}
              </div>

              {!paidAndPublished && (
                <img
                  src={buildVietQrImageUrl(orderNumber, checkoutPrice)}
                  alt="QR thanh toán"
                  className="mx-auto mt-5 w-full max-w-[280px] rounded-[18px] border border-black/[0.07]"
                />
              )}

              <div className="mt-5 space-y-2 rounded-[14px] bg-[#faf7f6] p-3">
                <PaymentRow
                  label="Ngân hàng"
                  value={BANK_TRANSFER_CONFIG.bankName}
                />
                <PaymentRow
                  label="Số tài khoản"
                  value={BANK_TRANSFER_CONFIG.accountNo}
                  onCopy={() =>
                    void copyText('account', BANK_TRANSFER_CONFIG.accountNo)
                  }
                  copied={copied === 'account'}
                />
                <PaymentRow
                  label="Số tiền"
                  value={formatVnd(checkoutPrice)}
                />
                <PaymentRow
                  label="Nội dung"
                  value={paymentReference}
                  onCopy={() =>
                    void copyText('reference', paymentReference)
                  }
                  copied={copied === 'reference'}
                />
                <PaymentRow label="Mã đơn" value={orderCode} />
              </div>

              {paidAndPublished ? (
                <div className="mt-5 rounded-[15px] bg-emerald-50 p-4 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-black text-emerald-800">
                    Thanh toán đã được xác nhận
                  </p>
                  <a
                    href={giftUrl}
                    className="mt-3 inline-flex rounded-[11px] bg-[#171717] px-4 py-2.5 text-xs font-black text-white"
                  >
                    Mở món quà
                  </a>
                </div>
              ) : (
                <p className="mt-4 text-center text-[10px] leading-5 text-black/35">
                  Trang này sẽ tự cập nhật sau khi đơn được xác nhận.
                </p>
              )}
            </>
          )}
        </aside>
      </main>
    </div>
  );
};

const Field: React.FC<{
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}> = ({
  label,
  value,
  type = 'text',
  placeholder,
  onChange,
}) => (
  <label className="block">
    <span className="text-[10px] font-black uppercase tracking-[0.08em] text-black/35">
      {label}
    </span>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="mt-1.5 w-full rounded-[12px] border border-black/[0.09] bg-[#fdfcfc] px-3.5 py-3 text-sm outline-none transition placeholder:text-black/20 focus:border-[#c9435d]/45 focus:bg-white"
    />
  </label>
);

const PaymentRow: React.FC<{
  label: string;
  value: string;
  onCopy?: () => void;
  copied?: boolean;
}> = ({ label, value, onCopy, copied }) => (
  <div className="flex items-center justify-between gap-3 rounded-[10px] bg-white px-3 py-2.5">
    <div className="min-w-0">
      <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-black/28">
        {label}
      </p>
      <p className="mt-0.5 truncate text-xs font-black">{value}</p>
    </div>

    {onCopy && (
      <button
        type="button"
        onClick={onCopy}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-black/[0.07] transition hover:bg-black/[0.03]"
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
