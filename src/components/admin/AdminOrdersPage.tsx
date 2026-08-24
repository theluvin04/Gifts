import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ArrowLeft,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  Gift,
  Loader2,
  LockKeyhole,
  LogIn,
  LogOut,
  Mail,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
  WalletCards,
} from 'lucide-react';

import {
  AdminOrderRecord,
  AdminSession,
  getAdminSession,
  listAdminOrders,
  loginAdminWithGoogle,
  logoutAdmin,
} from '../../services/adminService';

interface AdminOrdersPageProps {
  onBackHome: () => void;
  onOpenOrder: (
    giftId: string
  ) => void;
}

type PaymentFilter =
  | 'all'
  | 'paid'
  | 'unpaid';

type GiftFilter =
  | 'all'
  | 'draft'
  | 'published';

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

const getAuthErrorMessage = (
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
    'auth/operation-not-allowed'
  ) {
    return 'Google Sign-In chưa được bật trong Firebase Authentication.';
  }

  if (
    code ===
    'auth/unauthorized-domain'
  ) {
    return 'Domain hiện tại chưa được thêm vào Firebase Authentication → Settings → Authorized domains.';
  }

  if (
    code ===
    'permission-denied' ||
    code ===
    'firestore/permission-denied'
  ) {
    return 'Firestore đang chặn quyền. Hãy publish file firestore.rules mới vào đúng database.';
  }

  return (
    error?.message ||
    'Không thể đăng nhập Admin.'
  );
};

export const AdminOrdersPage: React.FC<
  AdminOrdersPageProps
> = ({
  onBackHome,
  onOpenOrder,
}) => {
  const [orders, setOrders] = useState<
    AdminOrderRecord[]
  >([]);

  const [session, setSession] =
    useState<AdminSession>(
      EMPTY_SESSION
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSigningIn, setIsSigningIn] =
    useState(false);

  const [error, setError] =
    useState('');

  const [copiedEmail, setCopiedEmail] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const [
    paymentFilter,
    setPaymentFilter,
  ] = useState<PaymentFilter>('all');

  const [giftFilter, setGiftFilter] =
    useState<GiftFilter>('all');

  const loadAdmin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const nextSession =
        await getAdminSession();

      setSession(nextSession);

      if (!nextSession.isAdmin) {
        setOrders([]);
        return;
      }

      const result =
        await listAdminOrders();

      setOrders(result);
    } catch (loadError: any) {
      console.error(loadError);

      setError(
        getAuthErrorMessage(
          loadError
        )
      );

      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAdmin();
  }, []);

  const handleGoogleLogin =
    async () => {
      setIsSigningIn(true);
      setError('');

      try {
        const nextSession =
          await loginAdminWithGoogle();

        setSession(nextSession);

        if (
          !nextSession.isAdmin
        ) {
          setOrders([]);
          return;
        }

        const result =
          await listAdminOrders();

        setOrders(result);
      } catch (loginError: any) {
        console.error(loginError);

        setError(
          getAuthErrorMessage(
            loginError
          )
        );
      } finally {
        setIsSigningIn(false);
      }
    };

  const handleLogout = async () => {
    setError('');

    try {
      await logoutAdmin();
    } catch (logoutError) {
      console.error(logoutError);
    }

    setSession(
      EMPTY_SESSION
    );
    setOrders([]);
  };

  const handleSwitchAccount =
    async () => {
      await handleLogout();

      await handleGoogleLogin();
    };

  const filteredOrders =
    useMemo(() => {
      const keyword =
        search.trim().toLowerCase();

      return orders.filter(
        (order) => {
          const paid =
            isPaidOrder(order);

          if (
            paymentFilter === 'paid' &&
            !paid
          ) {
            return false;
          }

          if (
            paymentFilter ===
              'unpaid' &&
            paid
          ) {
            return false;
          }

          if (
            giftFilter !== 'all' &&
            order.status !== giftFilter
          ) {
            return false;
          }

          if (!keyword) {
            return true;
          }

          const customer =
            order.customer;

          const haystack = [
            order.id,
            order.senderName,
            order.receiverName,
            customer?.fullName,
            customer?.email,
            customer?.phone,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          return haystack.includes(
            keyword
          );
        }
      );
    }, [
      orders,
      search,
      paymentFilter,
      giftFilter,
    ]);

  const paidOrders =
    orders.filter(isPaidOrder);

  const revenue =
    paidOrders.reduce(
      (sum, order) =>
        sum +
        (typeof order.price ===
        'number'
          ? order.price
          : 0),
      0
    );

  const publishedCount =
    orders.filter(
      (order) =>
        order.status === 'published'
    ).length;

  const copyEmail = async () => {
    if (!session.email) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        session.email
      );

      setCopiedEmail(true);

      window.setTimeout(
        () => setCopiedEmail(false),
        2000
      );
    } catch {
      // Email vẫn hiển thị để copy thủ công.
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#f7f8fb] px-5">
        <div className="text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-rose-500" />

          <p className="mt-3 text-sm font-semibold text-slate-500">
            Đang mở Admin...
          </p>
        </div>
      </main>
    );
  }

  if (
    !session.isGoogleUser
  ) {
    return (
      <main className="min-h-[100svh] bg-[#f7f8fb] px-4 py-8 text-slate-800 sm:px-7">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-rose-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Về trang chủ
          </button>

          <div className="mt-6 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <LockKeyhole className="h-5 w-5" />
            </span>

            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-400">
              Gifts Admin
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-900">
              Đăng nhập Admin bằng Google
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Khách tạo quà vẫn dùng Anonymous Auth.
              Riêng khu vực Admin sẽ yêu cầu tài khoản
              Google đã được cấp quyền trong Firestore.
            </p>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold leading-5 text-red-600">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={isSigningIn}
              onClick={() =>
                void handleGoogleLogin()
              }
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose-500 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-rose-100 transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Đăng nhập với Google
                </>
              )}
            </button>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-500">
              Nếu Firebase báo{' '}
              <strong>unauthorized-domain</strong>,
              thêm domain{' '}
              <strong>
                gifts-flame.vercel.app
              </strong>{' '}
              vào Authentication → Settings →
              Authorized domains.
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!session.isAdmin) {
    return (
      <main className="min-h-[100svh] bg-[#f7f8fb] px-4 py-8 text-slate-800 sm:px-7">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-rose-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Về trang chủ
          </button>

          <div className="mt-6 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Mail className="h-5 w-5" />
            </span>

            <h1 className="mt-5 text-2xl font-bold tracking-[-0.04em] text-slate-900">
              Gmail này chưa có quyền Admin
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Bạn đã đăng nhập Google thành công.
              Bây giờ chỉ cần cấp quyền cho đúng Gmail
              này trong Firestore.
            </p>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Gmail đang đăng nhập
              </p>

              <div className="mt-2 flex items-center gap-2">
                <code className="min-w-0 flex-1 break-all text-xs font-semibold text-slate-700">
                  {session.email}
                </code>

                <button
                  type="button"
                  onClick={copyEmail}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Đã chép
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
              <p className="text-xs font-bold text-slate-800">
                Cấp quyền:
              </p>

              <p className="mt-2 text-xs leading-6 text-slate-600">
                Firestore → collection{' '}
                <code className="rounded bg-white px-1.5 py-0.5 font-bold text-rose-600">
                  admins
                </code>
                {' '}→ Document ID = chính Gmail ở
                trên → field{' '}
                <code className="rounded bg-white px-1.5 py-0.5 font-bold text-rose-600">
                  enabled
                </code>
                {' '}kiểu Boolean ={' '}
                <strong>true</strong>.
              </p>
            </div>

            {error && (
              <p className="mt-4 text-xs font-semibold leading-5 text-red-500">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  void loadAdmin()
                }
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-rose-500 px-5 py-3 text-xs font-bold text-white shadow-md shadow-rose-100 transition hover:bg-rose-600"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Kiểm tra lại quyền
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleSwitchAccount()
                }
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-600 transition hover:border-rose-200 hover:text-rose-500"
              >
                <LogIn className="h-3.5 w-3.5" />
                Đổi Gmail
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-[100svh] bg-[#f7f8fb] text-slate-800">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1500px] items-center justify-between px-4 sm:px-7">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-rose-500"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">
              Gifts
            </span>
          </button>

          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-400">
              Admin
            </p>

            <p className="text-sm font-bold text-slate-900">
              Orders
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                void loadAdmin()
              }
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-600 transition hover:border-rose-200 hover:text-rose-500"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                void handleLogout()
              }
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-rose-500"
              title={session.email}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                Đăng xuất
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-7">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-400">
              Order management
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-slate-900">
              Đơn hàng
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Hiện tối đa 200 gift gần nhất từ
              Firestore.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs shadow-sm">
            <p className="font-bold text-slate-800">
              {session.displayName ||
                'Google Admin'}
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              {session.email}
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={ShoppingBag}
            label="Tổng đơn"
            value={String(
              orders.length
            )}
          />

          <MetricCard
            icon={WalletCards}
            label="Đã thanh toán"
            value={String(
              paidOrders.length
            )}
          />

          <MetricCard
            icon={Gift}
            label="Đã publish"
            value={String(
              publishedCount
            )}
          />

          <MetricCard
            icon={Sparkles}
            label="Doanh thu test"
            value={formatVnd(revenue)}
          />
        </div>

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5">
              <Search className="h-4 w-4 text-slate-300" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Tìm mã gift, tên, email, SĐT..."
                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-300"
              />
            </label>

            <select
              value={paymentFilter}
              onChange={(event) =>
                setPaymentFilter(
                  event.target
                    .value as PaymentFilter
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-600 outline-none"
            >
              <option value="all">
                Tất cả thanh toán
              </option>

              <option value="paid">
                Đã thanh toán
              </option>

              <option value="unpaid">
                Chưa thanh toán
              </option>
            </select>

            <select
              value={giftFilter}
              onChange={(event) =>
                setGiftFilter(
                  event.target
                    .value as GiftFilter
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-600 outline-none"
            >
              <option value="all">
                Tất cả gift
              </option>

              <option value="draft">
                Draft
              </option>

              <option value="published">
                Published
              </option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse text-left">
              <thead className="bg-slate-50">
                <tr className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  <th className="px-5 py-4">
                    Gift
                  </th>

                  <th className="px-5 py-4">
                    Khách hàng
                  </th>

                  <th className="px-5 py-4">
                    Người nhận
                  </th>

                  <th className="px-5 py-4">
                    Thanh toán
                  </th>

                  <th className="px-5 py-4">
                    Gift status
                  </th>

                  <th className="px-5 py-4">
                    Giá
                  </th>

                  <th className="px-5 py-4">
                    Thời gian
                  </th>

                  <th className="px-5 py-4 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map(
                  (order) => {
                    const paid =
                      isPaidOrder(
                        order
                      );

                    return (
                      <tr
                        key={order.id}
                        className="border-t border-slate-100 text-xs text-slate-600 transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <p className="font-mono font-bold text-slate-800">
                            {order.id}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {order.templateId ||
                              'love-01'}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800">
                            {order.customer
                              ?.fullName ||
                              '—'}
                          </p>

                          <p className="mt-1 max-w-[220px] truncate text-[10px] text-slate-400">
                            {order.customer
                              ?.email ||
                              order.customer
                                ?.phone ||
                              'Chưa có thông tin checkout'}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-700">
                            {order.receiverName ||
                              '—'}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            từ{' '}
                            {order.senderName ||
                              '—'}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            active={paid}
                            activeLabel={
                              order.paymentStatus ||
                              'paid'
                            }
                            inactiveLabel={
                              order.paymentStatus ||
                              'unpaid'
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            active={
                              order.status ===
                              'published'
                            }
                            activeLabel="published"
                            inactiveLabel="draft"
                          />
                        </td>

                        <td className="px-5 py-4 font-bold text-slate-800">
                          {typeof order.price ===
                          'number'
                            ? formatVnd(
                                order.price
                              )
                            : '—'}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-600">
                            {formatDateTime(
                              order.createdAtMs
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                onOpenOrder(
                                  order.id
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-700 transition hover:border-rose-200 hover:text-rose-500"
                            >
                              Chi tiết
                              <ChevronRight className="h-3 w-3" />
                            </button>

                            {order.status ===
                            'published' ? (
                              <a
                                href={`/gift/${order.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-bold text-white transition hover:bg-rose-500"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Gift
                              </a>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>

          {filteredOrders.length ===
            0 && (
            <div className="px-6 py-14 text-center">
              <ShoppingBag className="mx-auto h-7 w-7 text-slate-200" />

              <p className="mt-3 text-sm font-bold text-slate-500">
                Chưa có đơn phù hợp
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Thử đổi bộ lọc hoặc tạo một
                checkout test mới.
              </p>
            </div>
          )}
        </div>

        <p className="mt-4 text-right text-[10px] font-medium text-slate-400">
          Hiển thị {filteredOrders.length}/
          {orders.length} đơn
        </p>
      </main>
    </div>
  );
};

interface MetricCardProps {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: string;
}

const MetricCard: React.FC<
  MetricCardProps
> = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
        <Icon className="h-4 w-4" />
      </span>

      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">
        Gifts
      </span>
    </div>

    <p className="mt-5 text-2xl font-black tracking-[-0.04em] text-slate-900">
      {value}
    </p>

    <p className="mt-1 text-xs font-semibold text-slate-400">
      {label}
    </p>
  </div>
);

interface StatusBadgeProps {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}

const StatusBadge: React.FC<
  StatusBadgeProps
> = ({
  active,
  activeLabel,
  inactiveLabel,
}) => (
  <span
    className={[
      'inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold',
      active
        ? 'bg-emerald-50 text-emerald-600'
        : 'bg-amber-50 text-amber-600',
    ].join(' ')}
  >
    {active
      ? activeLabel
      : inactiveLabel}
  </span>
);
