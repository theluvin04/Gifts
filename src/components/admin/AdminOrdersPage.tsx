import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { BRAND } from '../../config/brand';

import {
  AdminOrderRecord,
  AdminSession,
  getAdminSession,
  getAdminTemplateConfig,
  listAdminOrders,
  loginAdminWithGoogle,
  logoutAdmin,
  saveAdminTemplateConfig,
} from '../../services/adminService';

import {
  DEFAULT_LOVE_TEMPLATE_CONFIG,
  TemplateConfig,
} from '../../services/templateService';

import {
  ADMIN_TABS,
  AdminTab,
  GiftFilter,
  PaymentFilter,
  buildCustomers,
  isPaidOrder,
} from './adminUi';

import { AdminDashboardTab } from './AdminDashboardTab';
import { AdminOrdersTab } from './AdminOrdersTab';
import {
  AdminDiscountsTab,
  AdminTemplatesTab,
} from './AdminTemplatesTab';
import { AdminCustomersTab } from './AdminCustomersTab';
import { AdminSettingsTab } from './AdminSettingsTab';

interface AdminOrdersPageProps {
  onBackHome: () => void;
  onOpenOrder: (
    giftId: string
  ) => void;
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

const getInitialTab =
  (): AdminTab => {
    const hash =
      window.location.hash
        .replace('#', '') as AdminTab;

    if (
      ADMIN_TABS.some(
        (item) =>
          item.key === hash
      )
    ) {
      return hash;
    }

    if (
      window.location.pathname ===
      '/admin/orders'
    ) {
      return 'orders';
    }

    return 'dashboard';
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
    code === 'permission-denied' ||
    code ===
      'firestore/permission-denied'
  ) {
    return 'Firestore đang chặn quyền. Hãy publish firestore.rules mới vào đúng database.';
  }

  return (
    error?.message ||
    'Không thể mở Admin.'
  );
};

export const AdminOrdersPage:
React.FC<
  AdminOrdersPageProps
> = ({
  onBackHome,
  onOpenOrder,
}) => {
  const [session, setSession] =
    useState<AdminSession>(
      EMPTY_SESSION
    );

  const [orders, setOrders] =
    useState<AdminOrderRecord[]>([]);

  const [template, setTemplate] =
    useState<TemplateConfig>(
      DEFAULT_LOVE_TEMPLATE_CONFIG
    );

  const [templateDraft, setTemplateDraft] =
    useState<TemplateConfig>(
      DEFAULT_LOVE_TEMPLATE_CONFIG
    );

  const [tab, setTab] =
    useState<AdminTab>(
      getInitialTab
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSigningIn, setIsSigningIn] =
    useState(false);

  const [isSavingTemplate, setIsSavingTemplate] =
    useState(false);

  const [templateSaved, setTemplateSaved] =
    useState(false);

  const [error, setError] =
    useState('');

  const [search, setSearch] =
    useState('');

  const [paymentFilter, setPaymentFilter] =
    useState<PaymentFilter>('all');

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

      const [
        nextOrders,
        nextTemplate,
      ] = await Promise.all([
        listAdminOrders(),
        getAdminTemplateConfig(),
      ]);

      setOrders(nextOrders);
      setTemplate(nextTemplate);
      setTemplateDraft(
        nextTemplate
      );
    } catch (loadError: any) {
      console.error(loadError);
      setError(
        getAuthErrorMessage(
          loadError
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAdmin();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setTab(getInitialTab());
    };

    window.addEventListener(
      'hashchange',
      handleHashChange
    );

    return () => {
      window.removeEventListener(
        'hashchange',
        handleHashChange
      );
    };
  }, []);

  const openTab = (
    nextTab: AdminTab
  ) => {
    setTab(nextTab);
    window.location.hash =
      nextTab;
    window.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  };

  const handleGoogleLogin =
    async () => {
      setIsSigningIn(true);
      setError('');

      try {
        await loginAdminWithGoogle();
        await loadAdmin();
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
    try {
      await logoutAdmin();
    } catch (logoutError) {
      console.error(logoutError);
    }

    setSession(EMPTY_SESSION);
    setOrders([]);
  };

  const handleSaveTemplate =
    async () => {
      setIsSavingTemplate(true);
      setTemplateSaved(false);
      setError('');

      try {
        const saved =
          await saveAdminTemplateConfig(
            templateDraft
          );

        setTemplate(saved);
        setTemplateDraft(saved);
        setTemplateSaved(true);

        window.setTimeout(
          () =>
            setTemplateSaved(false),
          2200
        );
      } catch (saveError: any) {
        console.error(saveError);
        setError(
          getAuthErrorMessage(
            saveError
          )
        );
      } finally {
        setIsSavingTemplate(false);
      }
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
            paymentFilter ===
              'paid' &&
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
            order.status !==
              giftFilter
          ) {
            return false;
          }

          if (!keyword) {
            return true;
          }

          const customer =
            order.customer;

          return [
            order.id,
            order.senderName,
            order.receiverName,
            customer?.fullName,
            customer?.email,
            customer?.phone,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(keyword);
        }
      );
    }, [
      orders,
      search,
      paymentFilter,
      giftFilter,
    ]);

  const customers =
    useMemo(
      () => buildCustomers(orders),
      [orders]
    );

  const paidOrders =
    orders.filter(isPaidOrder);

  const pendingOrders =
    orders.filter(
      (order) =>
        order.paymentStatus ===
        'waiting_bank_transfer'
    );

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

  if (isLoading) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#f5f5f3]">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-black/10 border-t-[#cf5068]" />
      </main>
    );
  }

  if (!session.isGoogleUser) {
    return (
      <AccessScreen
        title="Đăng nhập Dearly Admin"
        description="Khu vực quản trị dành cho tài khoản Google đã được cấp quyền."
        buttonLabel={
          isSigningIn
            ? 'Đang đăng nhập...'
            : 'Đăng nhập với Google'
        }
        disabled={isSigningIn}
        error={error}
        onAction={() =>
          void handleGoogleLogin()
        }
        onBackHome={onBackHome}
      />
    );
  }

  if (!session.isAdmin) {
    return (
      <AccessScreen
        title="Gmail này chưa có quyền Admin"
        description={`Đang đăng nhập: ${session.email || 'Không xác định'}. Tạo admins/{email} với enabled = true trong Firestore.`}
        buttonLabel="Đổi tài khoản Google"
        error={error}
        onAction={() => {
          void logoutAdmin()
            .then(
              handleGoogleLogin
            );
        }}
        onBackHome={onBackHome}
      />
    );
  }

  return (
    <div className="min-h-[100svh] bg-[#f5f5f3] text-[#191919] lg:grid lg:grid-cols-[230px_1fr]">
      <aside className="border-b border-black/8 bg-white lg:sticky lg:top-0 lg:h-[100svh] lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block lg:px-5 lg:py-6">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center"
          >
            <img
              src={BRAND.logoPath}
              alt={`${BRAND.name} Admin`}
              className="h-11 w-auto object-contain"
            />
          </button>

          <p className="hidden text-[9px] font-bold uppercase tracking-[0.18em] text-black/30 lg:mt-2 lg:block">
            Admin workspace
          </p>

          <button
            type="button"
            onClick={() =>
              void handleLogout()
            }
            className="text-xs font-semibold text-black/45 hover:text-[#cf5068] lg:hidden"
          >
            Đăng xuất
          </button>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:px-3 lg:pb-0">
          {ADMIN_TABS.map(
            (item) => (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  openTab(item.key)
                }
                className={[
                  'shrink-0 border px-3.5 py-2.5 text-left text-xs font-bold transition lg:block lg:w-full lg:border-transparent',
                  tab === item.key
                    ? 'border-black/10 bg-[#f3ecee] text-[#b83e57] lg:border-transparent'
                    : 'border-transparent text-black/45 hover:bg-black/[0.03] hover:text-black/75',
                ].join(' ')}
              >
                {item.label}
              </button>
            )
          )}
        </nav>

        <div className="hidden lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:block lg:border-t lg:border-black/8 lg:p-4">
          <p className="truncate text-xs font-bold text-black/65">
            {session.displayName ||
              'Google Admin'}
          </p>
          <p className="mt-1 truncate text-[10px] text-black/35">
            {session.email}
          </p>
          <button
            type="button"
            onClick={() =>
              void handleLogout()
            }
            className="mt-3 text-[11px] font-bold text-[#b83e57]"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-7 lg:px-9 lg:py-8">
        <div className="mx-auto max-w-[1450px]">
          <header className="mb-7 flex flex-col justify-between gap-3 border-b border-black/8 pb-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b83e57]">
                Dearly Admin
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.045em]">
                {ADMIN_TABS.find(
                  (item) =>
                    item.key === tab
                )?.label}
              </h1>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadAdmin()
              }
              className="self-start border border-black/10 bg-white px-3.5 py-2.5 text-xs font-bold text-black/55 transition hover:border-black/25 hover:text-black"
            >
              Làm mới dữ liệu
            </button>
          </header>

          {error && (
            <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
              {error}
            </div>
          )}

          {tab === 'dashboard' && (
            <AdminDashboardTab
              orders={orders}
              customers={customers}
              paidCount={paidOrders.length}
              pendingCount={pendingOrders.length}
              revenue={revenue}
              template={template}
              onOpenOrders={() =>
                openTab('orders')
              }
            />
          )}

          {tab === 'orders' && (
            <AdminOrdersTab
              orders={filteredOrders}
              totalOrders={orders.length}
              search={search}
              paymentFilter={paymentFilter}
              giftFilter={giftFilter}
              onSearch={setSearch}
              onPaymentFilter={setPaymentFilter}
              onGiftFilter={setGiftFilter}
              onOpenOrder={onOpenOrder}
            />
          )}

          {tab === 'templates' && (
            <AdminTemplatesTab
              template={templateDraft}
              saved={templateSaved}
              saving={isSavingTemplate}
              onChange={setTemplateDraft}
              onSave={() =>
                void handleSaveTemplate()
              }
            />
          )}

          {tab === 'customers' && (
            <AdminCustomersTab
              customers={customers}
            />
          )}

          {tab === 'discounts' && (
            <AdminDiscountsTab
              template={templateDraft}
              saved={templateSaved}
              saving={isSavingTemplate}
              onChange={setTemplateDraft}
              onSave={() =>
                void handleSaveTemplate()
              }
            />
          )}

          {tab === 'settings' && (
            <AdminSettingsTab
              session={session}
            />
          )}
        </div>
      </main>
    </div>
  );
};

const AccessScreen: React.FC<{
  title: string;
  description: string;
  buttonLabel: string;
  error: string;
  disabled?: boolean;
  onAction: () => void;
  onBackHome: () => void;
}> = ({
  title,
  description,
  buttonLabel,
  error,
  disabled = false,
  onAction,
  onBackHome,
}) => (
  <main className="min-h-[100svh] bg-[#f5f5f3] px-4 py-10">
    <div className="mx-auto max-w-lg border border-black/8 bg-white p-7 sm:p-9">
      <button
        type="button"
        onClick={onBackHome}
        className="text-xs font-bold text-black/40 hover:text-[#b83e57]"
      >
        ← Về trang chủ
      </button>

      <img
        src={BRAND.logoPath}
        alt={BRAND.name}
        className="mt-8 h-14 w-auto object-contain"
      />

      <h1 className="mt-7 text-2xl font-black tracking-[-0.04em]">
        {title}
      </h1>

      <p className="mt-3 text-sm leading-6 text-black/45">
        {description}
      </p>

      {error && (
        <p className="mt-4 border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={onAction}
        className="mt-7 w-full bg-[#181818] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#b83e57] disabled:opacity-50"
      >
        {buttonLabel}
      </button>
    </div>
  </main>
);
