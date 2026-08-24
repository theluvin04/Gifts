import React, {
  useEffect,
  useState,
} from 'react';

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  Gift,
  Image as ImageIcon,
  Loader2,
  LockKeyhole,
  LogIn,
  Mail,
  Music2,
  RefreshCw,
  Send,
  Trash2,
  UserRound,
  WalletCards,
} from 'lucide-react';

import {
  AdminOrderRecord,
  AdminSession,
  confirmAdminBankPayment,
  deleteAdminOrder,
  getAdminOrderById,
  getAdminSession,
  loginAdminWithGoogle,
  logoutAdmin,
  markAdminOrderPaid,
  setAdminGiftPublished,
} from '../../services/adminService';

interface AdminOrderDetailPageProps {
  giftId: string;
  onBack: () => void;
  onBackHome: () => void;
}

const EMPTY_SESSION: AdminSession = {
  uid: '',
  email: '',
  displayName: '',
  photoURL: '',
  isSignedIn: false,
  isGoogleUser: false,
  isAdmin: false,
};

const formatVnd = (
  amount?: number
) => {
  if (
    typeof amount !== 'number'
  ) {
    return '—';
  }

  return new Intl.NumberFormat(
    'vi-VN',
    {
      style: 'currency',
      currency: 'VND',
    }
  ).format(amount);
};

const formatDateTime = (
  timestamp: number
) => {
  if (!timestamp) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    'vi-VN',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  ).format(new Date(timestamp));
};

const isPaidOrder = (
  order: AdminOrderRecord
) => {
  return (
    order.paymentStatus ===
      'paid_test' ||
    (order.paymentStatus as string) ===
      'paid'
  );
};

const getErrorMessage = (
  error: any
) => {
  const code =
    error?.code || '';

  if (
    code ===
    'auth/popup-closed-by-user'
  ) {
    return 'Bạn đã đóng cửa sổ đăng nhập Google.';
  }

  if (
    code ===
      'permission-denied' ||
    code ===
      'firestore/permission-denied'
  ) {
    return 'Firestore đang chặn quyền Admin. Kiểm tra lại firestore.rules.';
  }

  return (
    error?.message ||
    'Có lỗi xảy ra.'
  );
};

export const AdminOrderDetailPage:
React.FC<
  AdminOrderDetailPageProps
> = ({
  giftId,
  onBack,
  onBackHome,
}) => {
  const [session, setSession] =
    useState<AdminSession>(
      EMPTY_SESSION
    );

  const [order, setOrder] =
    useState<
      AdminOrderRecord | null
    >(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [action, setAction] =
    useState<
      | ''
      | 'paid'
      | 'confirm_bank'
      | 'publish'
      | 'unpublish'
      | 'delete'
    >('');

  const [error, setError] =
    useState('');

  const [copied, setCopied] =
    useState(false);

  const loadPage = async () => {
    setIsLoading(true);
    setError('');

    try {
      const nextSession =
        await getAdminSession();

      setSession(nextSession);

      if (!nextSession.isAdmin) {
        setOrder(null);
        return;
      }

      const nextOrder =
        await getAdminOrderById(
          giftId
        );

      setOrder(nextOrder);
    } catch (loadError: any) {
      console.error(loadError);

      setError(
        getErrorMessage(
          loadError
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const refreshOrder =
    async () => {
      const nextOrder =
        await getAdminOrderById(
          giftId
        );

      setOrder(nextOrder);
    };

  useEffect(() => {
    void loadPage();
  }, [giftId]);

  const handleGoogleLogin =
    async () => {
      setError('');
      setIsLoading(true);

      try {
        await loginAdminWithGoogle();
        await loadPage();
      } catch (loginError: any) {
        console.error(loginError);

        setError(
          getErrorMessage(
            loginError
          )
        );

        setIsLoading(false);
      }
    };

  const handleSwitchGoogle =
    async () => {
      try {
        await logoutAdmin();
      } catch {
        // Vẫn mở popup Google tiếp.
      }

      await handleGoogleLogin();
    };

  const handleConfirmBankPayment =
    async () => {
      if (!order) {
        return;
      }

      setAction(
        'confirm_bank'
      );
      setError('');

      try {
        await confirmAdminBankPayment(
          order.id
        );

        await refreshOrder();
      } catch (actionError: any) {
        setError(
          getErrorMessage(
            actionError
          )
        );
      } finally {
        setAction('');
      }
    };

  const handleMarkPaid =
    async () => {
      if (!order) {
        return;
      }

      setAction('paid');
      setError('');

      try {
        await markAdminOrderPaid(
          order.id
        );

        await refreshOrder();
      } catch (actionError: any) {
        setError(
          getErrorMessage(
            actionError
          )
        );
      } finally {
        setAction('');
      }
    };

  const handlePublish =
    async (
      published: boolean
    ) => {
      if (!order) {
        return;
      }

      setAction(
        published
          ? 'publish'
          : 'unpublish'
      );
      setError('');

      try {
        await setAdminGiftPublished(
          order.id,
          published
        );

        await refreshOrder();
      } catch (actionError: any) {
        setError(
          getErrorMessage(
            actionError
          )
        );
      } finally {
        setAction('');
      }
    };

  const handleDelete =
    async () => {
      if (!order) {
        return;
      }

      const confirmed =
        window.confirm(
          `Xóa vĩnh viễn đơn ${order.id}? Hành động này không thể hoàn tác.`
        );

      if (!confirmed) {
        return;
      }

      setAction('delete');
      setError('');

      try {
        await deleteAdminOrder(
          order.id
        );

        onBack();
      } catch (actionError: any) {
        setError(
          getErrorMessage(
            actionError
          )
        );

        setAction('');
      }
    };

  const copyGiftLink =
    async () => {
      if (!order) {
        return;
      }

      const url =
        `${window.location.origin}/gift/${order.id}`;

      try {
        await navigator.clipboard.writeText(
          url
        );

        setCopied(true);

        window.setTimeout(
          () => setCopied(false),
          2000
        );
      } catch {
        setError(
          'Không thể tự copy link.'
        );
      }
    };

  if (isLoading) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#f7f8fb] px-5">
        <div className="text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-rose-500" />

          <p className="mt-3 text-sm font-semibold text-slate-500">
            Đang tải chi tiết đơn...
          </p>
        </div>
      </main>
    );
  }

  if (!session.isGoogleUser) {
    return (
      <AccessCard
        title="Đăng nhập Admin bằng Google"
        description="Đăng nhập Gmail Admin để xem chi tiết đơn hàng."
        buttonLabel="Đăng nhập với Google"
        onAction={() =>
          void handleGoogleLogin()
        }
        onBackHome={onBackHome}
        error={error}
      />
    );
  }

  if (!session.isAdmin) {
    return (
      <AccessCard
        title="Gmail này chưa có quyền Admin"
        description={`Đang đăng nhập: ${session.email || 'Không xác định'}`}
        buttonLabel="Đổi Gmail"
        onAction={() =>
          void handleSwitchGoogle()
        }
        onBackHome={onBackHome}
        error={error}
      />
    );
  }

  if (!order) {
    return (
      <main className="min-h-[100svh] bg-[#f7f8fb] px-4 py-8 sm:px-7">
        <div className="mx-auto max-w-xl rounded-[28px] border border-slate-200 bg-white p-7 text-center shadow-sm">
          <Gift className="mx-auto h-8 w-8 text-slate-300" />

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Không tìm thấy đơn
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Gift ID: {giftId}
          </p>

          <button
            type="button"
            onClick={onBack}
            className="mt-5 rounded-full bg-slate-900 px-5 py-3 text-xs font-bold text-white"
          >
            Về danh sách đơn
          </button>
        </div>
      </main>
    );
  }

  const paid =
    isPaidOrder(order);

  const giftUrl =
    `/gift/${order.id}`;

  const config =
    order.config;

  return (
    <div className="min-h-[100svh] bg-[#f7f8fb] text-slate-800">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[68px] max-w-[1500px] items-center justify-between gap-3 px-4 py-3 sm:px-7">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-rose-500"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">
              Danh sách đơn
            </span>
          </button>

          <div className="min-w-0 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-400">
              Order detail
            </p>

            <p className="truncate font-mono text-xs font-bold text-slate-800 sm:text-sm">
              {order.id}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void refreshOrder()
            }
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-600 transition hover:border-rose-200 hover:text-rose-500"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              Refresh
            </span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-7">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                label={
                  order.paymentStatus ||
                  'unpaid'
                }
                active={paid}
              />

              <StatusBadge
                label={order.status}
                active={
                  order.status ===
                  'published'
                }
              />
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-slate-900">
              Chi tiết đơn hàng
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {order.senderName}
              {' → '}
              {order.receiverName}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyGiftLink}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:border-rose-200 hover:text-rose-500"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}

              {copied
                ? 'Đã copy'
                : 'Copy link'}
            </button>

            {order.status ===
              'published' && (
              <a
                href={giftUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-rose-500"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Mở gift
              </a>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InfoCard
            icon={UserRound}
            label="Khách hàng"
            title={
              order.customer
                ?.fullName || '—'
            }
            lines={[
              order.customer?.email ||
                'Chưa có email',
              order.customer?.phone ||
                'Chưa có SĐT',
            ]}
          />

          <InfoCard
            icon={Gift}
            label="Món quà"
            title={
              order.templateId ||
              'love-01'
            }
            lines={[
              `${order.senderName} → ${order.receiverName}`,
              giftUrl,
            ]}
          />

          <InfoCard
            icon={WalletCards}
            label="Thanh toán"
            title={formatVnd(
              order.price
            )}
            lines={[
              order.paymentStatus ||
                'unpaid',
              `Paid: ${formatDateTime(order.paidAtMs)}`,
            ]}
          />

          <InfoCard
            icon={CheckCircle2}
            label="Trạng thái"
            title={order.status}
            lines={[
              `Tạo: ${formatDateTime(order.createdAtMs)}`,
              `Cập nhật: ${formatDateTime(order.updatedAtMs)}`,
            ]}
          />
        </div>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-400">
                Admin actions
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Quản lý đơn
              </h2>
            </div>

            <p className="text-xs text-slate-400">
              Admin: {session.email}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {order.paymentStatus ===
            'waiting_bank_transfer' &&
            !paid ? (
              <ActionButton
                icon={WalletCards}
                label="Xác nhận CK & Publish"
                disabled={action !== ''}
                loading={
                  action ===
                  'confirm_bank'
                }
                onClick={() =>
                  void handleConfirmBankPayment()
                }
              />
            ) : (
              <ActionButton
                icon={WalletCards}
                label={
                  paid
                    ? 'Đã thanh toán'
                    : 'Đánh dấu Paid'
                }
                disabled={
                  paid ||
                  action !== ''
                }
                loading={
                  action === 'paid'
                }
                onClick={() =>
                  void handleMarkPaid()
                }
              />
            )}

            {order.status ===
            'published' ? (
              <ActionButton
                icon={Eye}
                label="Unpublish"
                disabled={action !== ''}
                loading={
                  action ===
                  'unpublish'
                }
                onClick={() =>
                  void handlePublish(
                    false
                  )
                }
                secondary
              />
            ) : (
              <ActionButton
                icon={Send}
                label="Publish gift"
                disabled={action !== ''}
                loading={
                  action === 'publish'
                }
                onClick={() =>
                  void handlePublish(
                    true
                  )
                }
              />
            )}

            <button
              type="button"
              onClick={copyGiftLink}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition hover:border-rose-200 hover:text-rose-500"
            >
              <Copy className="h-4 w-4" />
              Copy link
            </button>

            <button
              type="button"
              disabled={action !== ''}
              onClick={() =>
                void handleDelete()
              }
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
            >
              {action === 'delete' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Xóa đơn
            </button>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="space-y-6">
            <ContentCard
              icon={UserRound}
              title="Thông tin cơ bản"
            >
              <DetailRow
                label="Người gửi"
                value={
                  config.couple
                    .senderName
                }
              />

              <DetailRow
                label="Người nhận"
                value={
                  config.couple
                    .receiverName
                }
              />

              <DetailRow
                label="Biệt danh"
                value={
                  config.couple
                    .nickname || '—'
                }
              />

              <DetailRow
                label="Ngày đặc biệt"
                value={
                  config.couple
                    .anniversaryDate ||
                  '—'
                }
              />

              <DetailRow
                label="Câu hỏi"
                value={
                  config.proposal
                    .question
                }
              />

              <DetailRow
                label="Nút YES"
                value={
                  config.proposal
                    .yesBtnText
                }
              />
            </ContentCard>

            <ContentCard
              icon={Music2}
              title="Playlist"
            >
              <div className="space-y-3">
                {config.gifts.gift2.playlist.map(
                  (track, index) => (
                    <div
                      key={track.id}
                      className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3"
                    >
                      <img
                        src={
                          track.coverUrl
                        }
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-xl bg-slate-200 object-cover"
                      />

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-rose-400">
                          Bài {index + 1}
                        </p>

                        <p className="mt-1 truncate text-sm font-bold text-slate-800">
                          {track.title}
                        </p>

                        <p className="truncate text-xs text-slate-400">
                          {track.artist}
                        </p>

                        {track.audioUrl && (
                          <p className="mt-1 truncate text-[10px] text-slate-300">
                            {track.audioUrl}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </ContentCard>
          </section>

          <section className="space-y-6">
            <ContentCard
              icon={ImageIcon}
              title="Ảnh kỷ niệm"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {config.gifts.gift1.photos.map(
                  (photo, index) => (
                    <div
                      key={photo.id}
                      className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50"
                    >
                      <div className="aspect-[4/3] bg-slate-100">
                        <img
                          src={photo.url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-rose-400">
                          Ảnh {index + 1}
                        </p>

                        <p className="mt-1 text-xs font-semibold leading-5 text-slate-700">
                          {photo.caption ||
                            'Không có caption'}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {[
                            photo.date,
                            photo.location,
                          ]
                            .filter(
                              Boolean
                            )
                            .join(' · ') ||
                            '—'}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </ContentCard>

            <ContentCard
              icon={Mail}
              title="Bức thư"
            >
              <div className="rounded-2xl bg-[#fff9fb] p-4">
                <p className="font-bold text-rose-500">
                  {
                    config.gifts
                      .gift3.letter
                      .salutation
                  }
                </p>

                <div className="mt-4 space-y-3">
                  {config.gifts.gift3.letter.paragraphs.map(
                    (
                      paragraph,
                      index
                    ) => (
                      <p
                        key={index}
                        className="text-sm leading-6 text-slate-600"
                      >
                        {paragraph}
                      </p>
                    )
                  )}
                </div>

                <div className="mt-5 border-t border-rose-100 pt-4">
                  <p className="text-sm text-slate-500">
                    {
                      config.gifts
                        .gift3.letter
                        .closing
                    }
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {
                      config.gifts
                        .gift3.letter
                        .signature
                    }
                  </p>
                </div>
              </div>
            </ContentCard>
          </section>
        </div>
      </main>
    </div>
  );
};

interface AccessCardProps {
  title: string;
  description: string;
  buttonLabel: string;
  onAction: () => void;
  onBackHome: () => void;
  error: string;
}

const AccessCard: React.FC<
  AccessCardProps
> = ({
  title,
  description,
  buttonLabel,
  onAction,
  onBackHome,
  error,
}) => (
  <main className="min-h-[100svh] bg-[#f7f8fb] px-4 py-8 sm:px-7">
    <div className="mx-auto max-w-xl">
      <button
        type="button"
        onClick={onBackHome}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-rose-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Về trang chủ
      </button>

      <div className="mt-6 rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <LockKeyhole className="h-5 w-5" />
        </span>

        <h1 className="mt-5 text-2xl font-bold tracking-[-0.04em] text-slate-900">
          {title}
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {description}
        </p>

        {error && (
          <p className="mt-4 text-xs font-semibold leading-5 text-red-500">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose-500 px-5 py-3 text-sm font-bold text-white"
        >
          <LogIn className="h-4 w-4" />
          {buttonLabel}
        </button>
      </div>
    </div>
  </main>
);

interface InfoCardProps {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  title: string;
  lines: string[];
}

const InfoCard: React.FC<
  InfoCardProps
> = ({
  icon: Icon,
  label,
  title,
  lines,
}) => (
  <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
      <Icon className="h-4 w-4" />
    </span>

    <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
      {label}
    </p>

    <p className="mt-1 break-words text-base font-bold text-slate-900">
      {title}
    </p>

    {lines.map(
      (line, index) => (
        <p
          key={`${line}-${index}`}
          className="mt-1 break-words text-[11px] leading-5 text-slate-400"
        >
          {line}
        </p>
      )
    )}
  </div>
);

interface ContentCardProps {
  icon: React.ComponentType<{
    className?: string;
  }>;
  title: string;
  children: React.ReactNode;
}

const ContentCard: React.FC<
  ContentCardProps
> = ({
  icon: Icon,
  title,
  children,
}) => (
  <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
        <Icon className="h-4 w-4" />
      </span>

      <h2 className="text-lg font-bold text-slate-900">
        {title}
      </h2>
    </div>

    <div className="mt-5">
      {children}
    </div>
  </div>
);

const DetailRow: React.FC<{
  label: string;
  value: string;
}> = ({
  label,
  value,
}) => (
  <div className="border-b border-slate-100 py-3 last:border-b-0">
    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
      {label}
    </p>

    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
      {value}
    </p>
  </div>
);

interface ActionButtonProps {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
  secondary?: boolean;
}

const ActionButton: React.FC<
  ActionButtonProps
> = ({
  icon: Icon,
  label,
  disabled,
  loading,
  onClick,
  secondary = false,
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={[
      'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50',
      secondary
        ? 'border border-slate-200 bg-white text-slate-700 hover:border-rose-200 hover:text-rose-500'
        : 'bg-rose-500 text-white shadow-sm shadow-rose-100 hover:bg-rose-600',
    ].join(' ')}
  >
    {loading ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <Icon className="h-4 w-4" />
    )}

    {label}
  </button>
);

const StatusBadge: React.FC<{
  label: string;
  active: boolean;
}> = ({
  label,
  active,
}) => (
  <span
    className={[
      'inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold',
      active
        ? 'bg-emerald-50 text-emerald-600'
        : 'bg-amber-50 text-amber-600',
    ].join(' ')}
  >
    {label}
  </span>
);
