import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  BRAND,
} from '../../config/brand';

import {
  AdminOrderRecord,
  AdminSession,
  AdminTemplateCreateInput,
  createAdminTemplateConfig,
  deleteAdminOrder,
  deleteAdminTemplateConfig,
  getAdminSession,
  listAdminOrders,
  listAdminTemplateConfigs,
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
  PaymentFilter,
  buildCustomerSummaries,
  getAdminPath,
  getAdminTabFromPath,
  getOrderCode,
  isPaidOrder,
} from './adminUi';

import {
  AdminCustomersTab,
} from './AdminCustomersTab';

import {
  AdminDashboardTab,
} from './AdminDashboardTab';

import {
  AdminOrdersTab,
} from './AdminOrdersTab';

import {
  AdminSettingsTab,
} from './AdminSettingsTab';

import {
  AdminTemplatesTab,
} from './AdminTemplatesTab';

interface Props {
  onBackHome: () => void;
  onOpenOrder: (
    giftId: string
  ) => void;
}

const EMPTY_SESSION:
AdminSession = {
  uid: '',
  email: '',
  displayName: '',
  photoURL: '',
  isSignedIn: false,
  isGoogleUser: false,
  isAdmin: false,
};

const sortTemplates = (
  templates: TemplateConfig[]
) => {
  return [...templates].sort(
    (left, right) => {
      if (left.id === 'love-01') {
        return -1;
      }

      if (right.id === 'love-01') {
        return 1;
      }

      return left.name.localeCompare(
        right.name,
        'vi'
      );
    }
  );
};

const getTemplateIdFromUrl =
  () => {
    if (
      window.location.pathname !==
      '/admin/templates'
    ) {
      return '';
    }

    return (
      new URLSearchParams(
        window.location.search
      ).get('template') || ''
    );
  };

const setAdminUrl = (
  tab: AdminTab,
  templateId = '',
  replace = false
) => {
  const url =
    new URL(
      window.location.href
    );

  url.pathname =
    getAdminPath(tab);
  url.search = '';

  if (
    tab === 'templates' &&
    templateId
  ) {
    url.searchParams.set(
      'template',
      templateId
    );
  }

  const method =
    replace
      ? 'replaceState'
      : 'pushState';

  window.history[method](
    {},
    '',
    `${url.pathname}${url.search}`
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
    return 'Domain hiện tại chưa được thêm vào Firebase Authentication.';
  }

  if (
    code === 'permission-denied' ||
    code === 'firestore/permission-denied'
  ) {
    return 'Firestore đang chặn quyền Admin. Kiểm tra lại firestore.rules.';
  }

  return (
    error?.message ||
    'Không thể mở Admin.'
  );
};

const TAB_COPY: Record<
  AdminTab,
  {
    title: string;
    description: string;
  }
> = {
  dashboard: {
    title: 'Tổng quan',
    description:
      'Những số liệu và việc cần xử lý trước.',
  },
  orders: {
    title: 'Đơn hàng',
    description:
      'Tìm, kiểm tra và xử lý đơn checkout.',
  },
  templates: {
    title: 'Templates',
    description:
      'Quản lý sản phẩm và thiết kế trải nghiệm.',
  },
  customers: {
    title: 'Khách hàng',
    description:
      'Tổng hợp khách hàng từ dữ liệu checkout.',
  },
  settings: {
    title: 'Cài đặt',
    description:
      'Kiểm tra tài khoản và cấu hình đang chạy.',
  },
};

export const AdminOrdersPage:
React.FC<Props> = ({
  onBackHome,
  onOpenOrder,
}) => {
  const [
    session,
    setSession,
  ] =
    useState<AdminSession>(
      EMPTY_SESSION
    );

  const [
    orders,
    setOrders,
  ] =
    useState<AdminOrderRecord[]>(
      []
    );

  const [
    templateCatalog,
    setTemplateCatalog,
  ] =
    useState<TemplateConfig[]>([
      DEFAULT_LOVE_TEMPLATE_CONFIG,
    ]);

  const [
    templateDraft,
    setTemplateDraft,
  ] =
    useState<TemplateConfig>(
      DEFAULT_LOVE_TEMPLATE_CONFIG
    );

  const [
    tab,
    setTab,
  ] =
    useState<AdminTab>(
      () =>
        getAdminTabFromPath(
          window.location.pathname
        )
    );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSigningIn,
    setIsSigningIn,
  ] = useState(false);

  const [
    isSavingTemplate,
    setIsSavingTemplate,
  ] = useState(false);

  const [
    isTemplateDirty,
    setIsTemplateDirty,
  ] = useState(false);

  const [
    templateSaved,
    setTemplateSaved,
  ] = useState(false);

  const [
    isTemplateCatalogBusy,
    setIsTemplateCatalogBusy,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    paymentFilter,
    setPaymentFilter,
  ] =
    useState<PaymentFilter>(
      'all'
    );

  const [
    selectedOrderIds,
    setSelectedOrderIds,
  ] = useState<string[]>([]);

  const [
    isDeletingOrders,
    setIsDeletingOrders,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const [
    notice,
    setNotice,
  ] = useState('');

  const showNotice = (
    message: string
  ) => {
    setNotice(message);

    window.setTimeout(
      () =>
        setNotice(''),
      2200
    );
  };

  const loadAdmin =
    async () => {
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
          nextTemplates,
        ] =
          await Promise.all([
            listAdminOrders(),
            listAdminTemplateConfigs(),
          ]);

        setOrders(nextOrders);
        setSelectedOrderIds([]);

        const normalizedTemplates =
          sortTemplates(
            nextTemplates.length
              ? nextTemplates
              : [
                  DEFAULT_LOVE_TEMPLATE_CONFIG,
                ]
          );

        setTemplateCatalog(
          normalizedTemplates
        );

        const requestedTemplateId =
          getTemplateIdFromUrl();

        const preferred =
          (
            requestedTemplateId
              ? normalizedTemplates.find(
                  (item) =>
                    item.id ===
                    requestedTemplateId
                )
              : null
          ) ||
          normalizedTemplates.find(
            (item) =>
              item.id ===
              templateDraft.id
          ) ||
          normalizedTemplates[0];

        setTemplateDraft(preferred);
        setIsTemplateDirty(false);
        setTemplateSaved(false);

        if (
          window.location.pathname ===
          '/admin/templates'
        ) {
          setAdminUrl(
            'templates',
            preferred.id,
            true
          );
        }
      } catch (
        loadError: any
      ) {
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
    const onPopState =
      () => {
        const nextTab =
          getAdminTabFromPath(
            window.location.pathname
          );

        setTab(nextTab);

        if (
          nextTab !== 'templates'
        ) {
          return;
        }

        const requestedId =
          getTemplateIdFromUrl();

        const nextTemplate =
          templateCatalog.find(
            (item) =>
              item.id === requestedId
          );

        if (nextTemplate) {
          setTemplateDraft(
            nextTemplate
          );
          setIsTemplateDirty(false);
          setTemplateSaved(false);
        }
      };

    window.addEventListener(
      'popstate',
      onPopState
    );

    return () =>
      window.removeEventListener(
        'popstate',
        onPopState
      );
  }, [templateCatalog]);

  useEffect(() => {
    const handleBeforeUnload = (
      event: BeforeUnloadEvent
    ) => {
      if (!isTemplateDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener(
      'beforeunload',
      handleBeforeUnload
    );

    return () =>
      window.removeEventListener(
        'beforeunload',
        handleBeforeUnload
      );
  }, [isTemplateDirty]);

  const openTab = (
    next: AdminTab
  ) => {
    if (
      tab === 'templates' &&
      next !== 'templates' &&
      isTemplateDirty
    ) {
      const leave =
        window.confirm(
          'Template có thay đổi chưa lưu. Bỏ thay đổi và rời trang?'
        );

      if (!leave) {
        return;
      }
    }

    setTab(next);
    setAdminUrl(
      next,
      next === 'templates'
        ? templateDraft.id
        : ''
    );

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
      } catch (
        loginError: any
      ) {
        setError(
          getAuthErrorMessage(
            loginError
          )
        );
      } finally {
        setIsSigningIn(false);
      }
    };

  const handleLogout =
    async () => {
      try {
        await logoutAdmin();
      } catch (
        logoutError
      ) {
        console.error(logoutError);
      }

      setSession(EMPTY_SESSION);
      setOrders([]);
      setSelectedOrderIds([]);
      setTemplateCatalog([
        DEFAULT_LOVE_TEMPLATE_CONFIG,
      ]);
      setTemplateDraft(
        DEFAULT_LOVE_TEMPLATE_CONFIG
      );
      setIsTemplateDirty(false);
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

        setTemplateDraft(saved);
        setTemplateCatalog(
          (current) =>
            sortTemplates([
              ...current.filter(
                (item) =>
                  item.id !== saved.id
              ),
              saved,
            ])
        );
        setIsTemplateDirty(false);
        setTemplateSaved(true);
        showNotice(
          `Đã lưu ${saved.name}.`
        );

        window.setTimeout(
          () =>
            setTemplateSaved(false),
          1800
        );
      } catch (
        saveError: any
      ) {
        setError(
          getAuthErrorMessage(
            saveError
          )
        );
      } finally {
        setIsSavingTemplate(false);
      }
    };

  const handleDiscardTemplateChanges = () => {
    const original =
      templateCatalog.find(
        (item) =>
          item.id === templateDraft.id
      );

    if (original) {
      setTemplateDraft(original);
    }

    setIsTemplateDirty(false);
    setTemplateSaved(false);
  };

  const handleSelectTemplate = (
    templateId: string
  ) => {
    if (
      templateId ===
      templateDraft.id
    ) {
      return;
    }

    if (isTemplateDirty) {
      const discard =
        window.confirm(
          'Template hiện tại có thay đổi chưa lưu. Bỏ thay đổi và chuyển template?'
        );

      if (!discard) {
        return;
      }
    }

    const next =
      templateCatalog.find(
        (item) =>
          item.id === templateId
      );

    if (!next) {
      return;
    }

    setTemplateDraft(next);
    setIsTemplateDirty(false);
    setTemplateSaved(false);
    setAdminUrl(
      'templates',
      next.id
    );
  };

  const handleCreateTemplate =
    async (
      input: AdminTemplateCreateInput
    ) => {
      setIsTemplateCatalogBusy(true);
      setError('');

      try {
        const created =
          await createAdminTemplateConfig(
            input
          );

        setTemplateCatalog(
          (current) =>
            sortTemplates([
              ...current.filter(
                (item) =>
                  item.id !== created.id
              ),
              created,
            ])
        );
        setTemplateDraft(created);
        setIsTemplateDirty(false);
        setTemplateSaved(true);
        setAdminUrl(
          'templates',
          created.id,
          true
        );
        showNotice(
          `Đã tạo ${created.name}.`
        );

        return created;
      } catch (
        createError: any
      ) {
        setError(
          getAuthErrorMessage(
            createError
          )
        );
        throw createError;
      } finally {
        setIsTemplateCatalogBusy(false);
      }
    };

  const handleDeleteTemplate =
    async (
      templateId: string
    ) => {
      setIsTemplateCatalogBusy(true);
      setError('');

      try {
        await deleteAdminTemplateConfig(
          templateId
        );

        const remaining =
          templateCatalog.filter(
            (item) =>
              item.id !== templateId
          );

        const safeRemaining =
          sortTemplates(
            remaining.length
              ? remaining
              : [
                  DEFAULT_LOVE_TEMPLATE_CONFIG,
                ]
          );

        const next =
          safeRemaining[0];

        setTemplateCatalog(
          safeRemaining
        );
        setTemplateDraft(next);
        setIsTemplateDirty(false);
        setTemplateSaved(false);
        setAdminUrl(
          'templates',
          next.id,
          true
        );
        showNotice(
          `Đã xóa ${templateId}.`
        );
      } catch (
        deleteError: any
      ) {
        setError(
          getAuthErrorMessage(
            deleteError
          )
        );
        throw deleteError;
      } finally {
        setIsTemplateCatalogBusy(false);
      }
    };

  const checkoutOrders =
    useMemo(
      () =>
        orders.filter(
          (order) =>
            Boolean(
              order.customer?.fullName ||
              order.customer?.email ||
              order.customer?.phone ||
              order.paymentReference
            ) ||
            order.paymentStatus ===
              'waiting_bank_transfer' ||
            isPaidOrder(order)
        ),
      [orders]
    );

  const filteredOrders =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return checkoutOrders.filter(
        (order) => {
          if (
            paymentFilter ===
              'waiting' &&
            order.paymentStatus !==
              'waiting_bank_transfer'
          ) {
            return false;
          }

          if (
            paymentFilter ===
              'paid' &&
            !isPaidOrder(order)
          ) {
            return false;
          }

          if (!keyword) {
            return true;
          }

          return [
            order.id,
            order.orderCode,
            order.paymentReference,
            order.customer?.fullName,
            order.customer?.email,
            order.customer?.phone,
            order.senderName,
            order.receiverName,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(keyword);
        }
      );
    }, [
      checkoutOrders,
      search,
      paymentFilter,
    ]);

  const paidOrders =
    useMemo(
      () =>
        checkoutOrders.filter(
          isPaidOrder
        ),
      [checkoutOrders]
    );

  const pendingOrders =
    useMemo(
      () =>
        checkoutOrders.filter(
          (order) =>
            order.paymentStatus ===
            'waiting_bank_transfer'
        ),
      [checkoutOrders]
    );

  const revenue =
    useMemo(
      () =>
        paidOrders.reduce(
          (sum, order) =>
            sum +
            (
              typeof order.price ===
              'number'
                ? order.price
                : 0
            ),
          0
        ),
      [paidOrders]
    );

  const customers =
    useMemo(
      () =>
        buildCustomerSummaries(
          checkoutOrders
        ),
      [checkoutOrders]
    );

  const toggleOrderSelection = (
    orderId: string
  ) => {
    setSelectedOrderIds(
      (current) =>
        current.includes(orderId)
          ? current.filter(
              (id) =>
                id !== orderId
            )
          : [
              ...current,
              orderId,
            ]
    );
  };

  const toggleAllVisibleOrders =
    () => {
      const visibleIds =
        filteredOrders.map(
          (order) =>
            order.id
        );

      setSelectedOrderIds(
        (current) => {
          const selected =
            new Set(current);

          const allSelected =
            visibleIds.length > 0 &&
            visibleIds.every(
              (id) =>
                selected.has(id)
            );

          visibleIds.forEach((id) => {
            if (allSelected) {
              selected.delete(id);
            } else {
              selected.add(id);
            }
          });

          return Array.from(
            selected
          );
        }
      );
    };

  const removeDeletedOrders = (
    deletedIds: string[]
  ) => {
    const deletedSet =
      new Set(deletedIds);

    setOrders(
      (current) =>
        current.filter(
          (order) =>
            !deletedSet.has(
              order.id
            )
        )
    );

    setSelectedOrderIds(
      (current) =>
        current.filter(
          (id) =>
            !deletedSet.has(id)
        )
    );
  };

  const handleDeleteOne =
    async (
      order: AdminOrderRecord
    ) => {
      const extraWarning =
        isPaidOrder(order)
          ? '\n\nĐơn này ĐÃ THANH TOÁN.'
          : order.status ===
              'published'
            ? '\n\nGift này đang được publish.'
            : '';

      const confirmed =
        window.confirm(
          `Xóa vĩnh viễn ${getOrderCode(order)}?${extraWarning}\n\nHành động này không thể hoàn tác.`
        );

      if (!confirmed) {
        return;
      }

      setIsDeletingOrders(true);
      setError('');

      try {
        await deleteAdminOrder(
          order.id
        );
        removeDeletedOrders([
          order.id,
        ]);
        showNotice(
          `Đã xóa ${getOrderCode(order)}.`
        );
      } catch (
        deleteError: any
      ) {
        setError(
          getAuthErrorMessage(
            deleteError
          )
        );
      } finally {
        setIsDeletingOrders(false);
      }
    };

  const handleDeleteSelected =
    async () => {
      const selectedSet =
        new Set(
          selectedOrderIds
        );

      const selectedOrders =
        checkoutOrders.filter(
          (order) =>
            selectedSet.has(
              order.id
            )
        );

      if (
        selectedOrders.length === 0
      ) {
        setSelectedOrderIds([]);
        return;
      }

      const confirmed =
        window.confirm(
          `Xóa vĩnh viễn ${selectedOrders.length} đơn?\n\nHành động này không thể hoàn tác.`
        );

      if (!confirmed) {
        return;
      }

      setIsDeletingOrders(true);
      setError('');

      try {
        const results =
          await Promise.allSettled(
            selectedOrders.map(
              (order) =>
                deleteAdminOrder(
                  order.id
                )
            )
          );

        const deletedIds =
          results
            .map((result, index) =>
              result.status ===
              'fulfilled'
                ? selectedOrders[
                    index
                  ].id
                : ''
            )
            .filter(Boolean);

        removeDeletedOrders(
          deletedIds
        );

        if (
          deletedIds.length !==
          selectedOrders.length
        ) {
          setError(
            `Đã xóa ${deletedIds.length}/${selectedOrders.length} đơn. Một số đơn xóa lỗi, hãy thử lại.`
          );
        } else {
          showNotice(
            `Đã xóa ${deletedIds.length} đơn.`
          );
        }
      } finally {
        setIsDeletingOrders(false);
      }
    };

  if (isLoading) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#f6f5f3]">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-black/10 border-t-[#cf5068]" />
      </main>
    );
  }

  if (!session.isGoogleUser) {
    return (
      <AccessScreen
        title="Đăng nhập Dearly Admin"
        description="Dùng tài khoản Google đã được cấp quyền."
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
        description={`Đang đăng nhập: ${session.email || 'Không xác định'}`}
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

  const tabCopy =
    TAB_COPY[tab];

  return (
    <div className="min-h-[100svh] bg-[#f6f5f3] text-[#191919] lg:grid lg:grid-cols-[228px_minmax(0,1fr)]">
      <aside className="border-b border-black/8 bg-white lg:sticky lg:top-0 lg:h-[100svh] lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-4 lg:block lg:px-5 lg:py-6">
          <button
            type="button"
            onClick={onBackHome}
            className="block"
          >
            <img
              src={BRAND.logoPath}
              alt={BRAND.name}
              className="h-9 w-auto object-contain"
            />
          </button>

          <button
            type="button"
            onClick={() =>
              void handleLogout()
            }
            className="text-[11px] font-bold text-black/35 hover:text-[#b83e57] lg:hidden"
          >
            Đăng xuất
          </button>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible">
          {ADMIN_TABS.map(
            (item) => (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  openTab(item.key)
                }
                className={[
                  'shrink-0 rounded-[10px] px-3.5 py-2.5 text-left transition lg:block lg:w-full',
                  tab === item.key
                    ? 'bg-[#f6ecef] text-[#a93650]'
                    : 'text-black/45 hover:bg-black/[0.03] hover:text-black/70',
                ].join(' ')}
              >
                <span className="block text-xs font-black">
                  {item.label}
                </span>
                <span className="mt-1 hidden text-[9px] leading-4 opacity-60 lg:block">
                  {item.description}
                </span>
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
            className="mt-3 text-[10px] font-bold text-[#b83e57]"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="min-w-0 px-3 py-5 sm:px-6 lg:px-8 lg:py-7">
        <div className="mx-auto max-w-[1320px]">
          <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#b83e57]">
                Dearly Admin
              </p>
              <h1 className="mt-1.5 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                {tabCopy.title}
              </h1>
              <p className="mt-1 text-xs text-black/38">
                {tabCopy.description}
              </p>
            </div>

            {tab !== 'templates' && (
              <button
                type="button"
                onClick={() =>
                  void loadAdmin()
                }
                className="self-start rounded-[10px] border border-black/10 bg-white px-3.5 py-2.5 text-[10px] font-bold text-black/45 hover:text-black/70 sm:self-auto"
              >
                Làm mới dữ liệu
              </button>
            )}
          </header>

          {notice && (
            <div className="mb-4 rounded-[12px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
              {notice}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-[12px] border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
              {error}
            </div>
          )}

          {tab === 'dashboard' && (
            <AdminDashboardTab
              orders={checkoutOrders}
              customers={customers}
              paidCount={paidOrders.length}
              pendingCount={pendingOrders.length}
              revenue={revenue}
              templates={templateCatalog}
              onOpenOrders={() =>
                openTab('orders')
              }
              onOpenTemplates={() =>
                openTab('templates')
              }
              onOpenOrder={onOpenOrder}
            />
          )}

          {tab === 'orders' && (
            <AdminOrdersTab
              orders={filteredOrders}
              totalOrders={checkoutOrders.length}
              paidCount={paidOrders.length}
              pendingCount={pendingOrders.length}
              revenue={revenue}
              search={search}
              paymentFilter={paymentFilter}
              onSearch={setSearch}
              onPaymentFilter={setPaymentFilter}
              selectedOrderIds={selectedOrderIds}
              deleting={isDeletingOrders}
              onToggleOrder={toggleOrderSelection}
              onToggleAllVisible={toggleAllVisibleOrders}
              onClearSelection={() =>
                setSelectedOrderIds([])
              }
              onDeleteOne={(order) =>
                void handleDeleteOne(order)
              }
              onDeleteSelected={() =>
                void handleDeleteSelected()
              }
              onOpenOrder={onOpenOrder}
            />
          )}

          {tab === 'templates' && (
            <AdminTemplatesTab
              templates={templateCatalog}
              template={templateDraft}
              dirty={isTemplateDirty}
              saved={templateSaved}
              saving={isSavingTemplate}
              catalogBusy={isTemplateCatalogBusy}
              onSelectTemplate={handleSelectTemplate}
              onCreateTemplate={handleCreateTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onChange={(nextTemplate) => {
                setTemplateDraft(
                  nextTemplate
                );
                setTemplateSaved(false);
                setIsTemplateDirty(true);
              }}
              onSave={() =>
                void handleSaveTemplate()
              }
              onDiscardChanges={
                handleDiscardTemplateChanges
              }
            />
          )}

          {tab === 'customers' && (
            <AdminCustomersTab
              customers={customers}
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

const AccessScreen:
React.FC<{
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
  <main className="min-h-[100svh] bg-[#f6f5f3] px-4 py-10">
    <div className="mx-auto max-w-md rounded-[20px] border border-black/8 bg-white p-7">
      <button
        type="button"
        onClick={onBackHome}
        className="text-xs font-bold text-black/40"
      >
        ← Về trang chủ
      </button>

      <img
        src={BRAND.logoPath}
        alt={BRAND.name}
        className="mt-7 h-12 w-auto"
      />

      <h1 className="mt-6 text-2xl font-black tracking-[-0.04em]">
        {title}
      </h1>

      <p className="mt-2 text-sm leading-6 text-black/45">
        {description}
      </p>

      {error && (
        <p className="mt-4 rounded-[10px] bg-red-50 p-3 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={onAction}
        className="mt-6 w-full rounded-[12px] bg-[#191919] px-5 py-3.5 text-sm font-bold text-white disabled:opacity-50"
      >
        {buttonLabel}
      </button>
    </div>
  </main>
);
