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
  Eye,
  Gift,
  Heart,
  Loader2,
  Mail,
  Phone,
  QrCode,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';

import { LoveConfig } from '../types';

import {
  CheckoutCustomer,
  LOVE_01_PRICE,
  publishGiftAfterTestPayment,
  saveGiftDraftToFirestore,
} from '../services/giftService';

interface CheckoutPageProps {
  config: LoveConfig;
  onBack: () => void;
  onPreview: () => void;
}

const CHECKOUT_GIFT_ID_KEY =
  'gifts:love-01:checkout-gift-id';

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
  onPreview,
}) => {
  const [customer, setCustomer] =
    useState<CheckoutCustomer>({
      fullName: '',
      email: '',
      phone: '',
    });

  const [giftId, setGiftId] =
    useState('');

  const [shareUrl, setShareUrl] =
    useState('');

  const [isPreparing, setIsPreparing] =
    useState(true);

  const [isPaying, setIsPaying] =
    useState(false);

  const [error, setError] =
    useState('');

  const [copied, setCopied] =
    useState(false);

  const [showQr, setShowQr] =
    useState(false);

  const [isPaid, setIsPaid] =
    useState(false);

  const hasPreparedRef =
    useRef(false);

  useEffect(() => {
    if (hasPreparedRef.current) {
      return;
    }

    hasPreparedRef.current = true;

    const prepareDraft = async () => {
      setIsPreparing(true);
      setError('');

      try {
        const existingId =
          window.sessionStorage.getItem(
            CHECKOUT_GIFT_ID_KEY
          ) || undefined;

        const result =
          await saveGiftDraftToFirestore(
            config,
            existingId
          );

        setGiftId(result.id);

        window.sessionStorage.setItem(
          CHECKOUT_GIFT_ID_KEY,
          result.id
        );
      } catch (prepareError: any) {
        console.error(prepareError);

        setError(
          prepareError?.message ||
            'Không thể tạo đơn nháp trên Firestore.'
        );
      } finally {
        setIsPreparing(false);
      }
    };

    prepareDraft();
  }, [config]);

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

    if (!giftId) {
      return 'Đơn nháp chưa sẵn sàng.';
    }

    return '';
  };

  const handleTestPayment =
    async () => {
      const validationError =
        validateForm();

      if (validationError) {
        setError(validationError);
        return;
      }

      setIsPaying(true);
      setError('');

      try {
        const result =
          await publishGiftAfterTestPayment(
            config,
            giftId,
            {
              fullName:
                customer.fullName.trim(),
              email:
                customer.email.trim(),
              phone:
                customer.phone.trim(),
            }
          );

        setShareUrl(result.url);
        setIsPaid(true);

        window.sessionStorage.removeItem(
          CHECKOUT_GIFT_ID_KEY
        );
      } catch (paymentError: any) {
        console.error(paymentError);

        setError(
          paymentError?.message ||
            'Không thể xác nhận thanh toán test.'
        );
      } finally {
        setIsPaying(false);
      }
    };

  const handleCopy = async () => {
    if (!shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        shareUrl
      );

      setCopied(true);

      window.setTimeout(
        () => setCopied(false),
        2200
      );
    } catch {
      setError(
        'Không thể tự sao chép. Hãy copy link thủ công.'
      );
    }
  };

  if (isPaid) {
    const qrImageUrl = shareUrl
      ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=be185d&bgcolor=ffffff&data=${encodeURIComponent(
          shareUrl
        )}`
      : '';

    return (
      <div className="min-h-[100svh] bg-[#fff9fb] px-4 py-10 text-slate-800 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-[32px] border border-rose-100 bg-white shadow-[0_30px_90px_rgba(190,70,110,0.14)]">
            <div className="bg-gradient-to-br from-rose-500 to-pink-500 px-6 py-10 text-center text-white sm:px-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 backdrop-blur">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                Payment test successful
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
                Món quà đã được xuất bản 💕
              </h1>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/75">
                Hiện tại đây là bước thanh toán TEST.
                Sau này nút này sẽ được thay bằng cổng
                thanh toán thật.
              </p>
            </div>

            <div className="p-6 sm:p-8">
              <div className="rounded-[22px] border border-rose-100 bg-[#fff9fb] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-400">
                  Link món quà
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-slate-700 outline-none sm:text-sm"
                  />

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-rose-500 px-3.5 py-2 text-xs font-bold text-white"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Đã chép
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Sao chép
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowQr(
                      (current) => !current
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 transition hover:border-rose-200 hover:text-rose-500"
                >
                  <QrCode className="h-4 w-4" />
                  {showQr
                    ? 'Ẩn QR'
                    : 'Hiện mã QR'}
                </button>

                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-bold text-white transition hover:bg-rose-500"
                >
                  <ExternalLink className="h-4 w-4" />
                  Mở món quà
                </a>
              </div>

              {showQr &&
                qrImageUrl && (
                <div className="mt-4 flex flex-col items-center rounded-[22px] border border-rose-100 bg-rose-50/50 p-5">
                  <div className="rounded-2xl bg-white p-3 shadow-sm">
                    <img
                      src={qrImageUrl}
                      alt="QR món quà"
                      className="h-44 w-44 object-contain"
                    />
                  </div>

                  <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                    Quét QR để mở{' '}
                    <span className="font-bold text-rose-500">
                      /gift/{giftId}
                    </span>
                  </p>
                </div>
              )}

              <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
                <span className="font-bold text-slate-700">
                  Mã đơn test:
                </span>{' '}
                {giftId}
                <br />
                <span className="font-bold text-slate-700">
                  Trạng thái:
                </span>{' '}
                paid_test → published
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-[#fff9fb] text-slate-800">
      <header className="sticky top-0 z-50 border-b border-rose-100 bg-[#fff9fb]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-7">
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

          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-rose-500"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-7 sm:px-7 sm:py-10 lg:grid-cols-[1fr_410px] lg:gap-8">
        <section>
          <div className="rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                <UserRound className="h-5 w-5" />
              </span>

              <div>
                <h1 className="text-xl font-bold tracking-[-0.03em] text-slate-900">
                  Thông tin người mua
                </h1>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Dùng để gắn với đơn hàng.
                  Chưa tích hợp thanh toán thật ở bước này.
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

          <div className="mt-5 rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <CreditCard className="h-5 w-5" />
              </span>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Thanh toán
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Đây là chế độ test để kiểm tra
                  toàn bộ flow trước khi nối VietQR /
                  cổng thanh toán thật.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border-2 border-rose-200 bg-rose-50/60 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-white">
                  <Sparkles className="h-4 w-4" />
                </span>

                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">
                    Thanh toán thử nghiệm
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Không trừ tiền thật
                  </p>
                </div>

                <CheckCircle2 className="h-5 w-5 text-rose-500" />
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
                isPreparing ||
                isPaying ||
                !giftId
              }
              onClick={handleTestPayment}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPreparing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tạo đơn nháp...
                </>
              ) : isPaying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xác nhận...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Xác nhận thanh toán TEST
                </>
              )}
            </button>

            <div className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-slate-400">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />

              <p>
                Trước khi bấm nút này, gift trong
                Firestore ở trạng thái{' '}
                <strong>draft / unpaid</strong>.
                Sau khi test thành công mới chuyển
                thành{' '}
                <strong>published / paid_test</strong>.
              </p>
            </div>
          </div>
        </section>

        <aside>
          <div className="sticky top-[92px] overflow-hidden rounded-[28px] border border-rose-100 bg-white shadow-[0_24px_70px_rgba(190,70,110,0.1)]">
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
                  text="QR chia sẻ món quà"
                />
              </div>

              <div className="my-5 h-px bg-slate-100" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">
                  Tổng thanh toán
                </span>

                <span className="text-xl font-black tracking-[-0.03em] text-rose-500">
                  {formatVnd(
                    LOVE_01_PRICE
                  )}
                </span>
              </div>

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

              <button
                type="button"
                onClick={onPreview}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-600 transition hover:border-rose-200 hover:text-rose-500"
              >
                <Eye className="h-3.5 w-3.5" />
                Xem lại preview
              </button>

              {giftId && (
                <p className="mt-3 text-center text-[10px] font-medium text-slate-400">
                  Draft ID: {giftId}
                </p>
              )}
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

const SummaryLine: React.FC<{
  text: string;
}> = ({ text }) => (
  <p className="flex items-center gap-2">
    <Check className="h-3.5 w-3.5 text-rose-500" />
    {text}
  </p>
);
