import {
  AdminOrderRecord,
} from '../../services/adminService';

export type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'templates'
  | 'decorate'
  | 'customers'
  | 'settings';

export type PaymentFilter =
  | 'all'
  | 'waiting'
  | 'paid';

export interface CustomerSummary {
  key: string;
  fullName: string;
  email: string;
  phone: string;
  orderCount: number;
  paidOrders: number;
  totalSpent: number;
  lastOrderAt: number;
}

export const ADMIN_TABS: Array<{
  key: AdminTab;
  label: string;
  description: string;
  path: string;
}> = [
  {
    key: 'dashboard',
    label: 'Tổng quan',
    description: 'Số liệu và việc cần xử lý',
    path: '/admin',
  },
  {
    key: 'orders',
    label: 'Đơn hàng',
    description: 'Tra cứu và xử lý đơn',
    path: '/admin/orders',
  },
  {
    key: 'templates',
    label: 'Templates',
    description: 'Thông tin và sản phẩm',
    path: '/admin/templates',
  },
  {
    key: 'decorate',
    label: 'Trang trí',
    description: 'Mở thẳng trình thiết kế',
    path: '/admin/decorate',
  },
  {
    key: 'customers',
    label: 'Khách hàng',
    description: 'Thông tin từ checkout',
    path: '/admin/customers',
  },
  {
    key: 'settings',
    label: 'Cài đặt',
    description: 'Kiểm tra cấu hình đang chạy',
    path: '/admin/settings',
  },
];

export const getAdminTabFromPath = (
  pathname: string
): AdminTab => {
  if (
    pathname === '/admin/templates'
  ) {
    return 'templates';
  }

  if (
    pathname === '/admin/decorate'
  ) {
    return 'decorate';
  }

  if (
    pathname === '/admin/customers'
  ) {
    return 'customers';
  }

  if (
    pathname === '/admin/settings'
  ) {
    return 'settings';
  }

  if (
    pathname === '/admin/orders'
  ) {
    return 'orders';
  }

  return 'dashboard';
};

export const getAdminPath = (
  tab: AdminTab
) => {
  return (
    ADMIN_TABS.find(
      (item) =>
        item.key === tab
    )?.path || '/admin'
  );
};

export const formatVnd = (
  amount: number
) => {
  return new Intl.NumberFormat(
    'vi-VN',
    {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }
  ).format(amount);
};

export const formatDateTime = (
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
  ).format(
    new Date(timestamp)
  );
};

export const isPaidOrder = (
  order: AdminOrderRecord
) => {
  return (
    order.paymentStatus ===
      'paid_test' ||
    order.paymentStatus ===
      'paid'
  );
};

export const getPaymentLabel = (
  order: AdminOrderRecord
) => {
  if (isPaidOrder(order)) {
    return 'Đã thanh toán';
  }

  if (
    order.paymentStatus ===
    'waiting_bank_transfer'
  ) {
    return 'Chờ chuyển khoản';
  }

  return 'Chưa thanh toán';
};

export const getGiftLabel = (
  order: AdminOrderRecord
) => {
  return order.status ===
    'published'
    ? 'Đã publish'
    : 'Draft';
};

export const getOrderCode = (
  order: AdminOrderRecord
) => {
  return (
    order.orderCode ||
    order.paymentReference ||
    `Dearly${order.orderNumber || order.id.slice(0, 4)}`
  );
};

export const buildCustomerSummaries = (
  orders: AdminOrderRecord[]
): CustomerSummary[] => {
  const map =
    new Map<
      string,
      CustomerSummary
    >();

  orders.forEach((order) => {
    const fullName =
      order.customer?.fullName?.trim() ||
      'Chưa có tên';

    const email =
      order.customer?.email?.trim() ||
      '';

    const phone =
      order.customer?.phone?.trim() ||
      '';

    const key =
      email.toLowerCase() ||
      phone.replace(/\D/g, '') ||
      fullName.toLowerCase() ||
      order.id;

    const current =
      map.get(key) || {
        key,
        fullName,
        email,
        phone,
        orderCount: 0,
        paidOrders: 0,
        totalSpent: 0,
        lastOrderAt: 0,
      };

    current.orderCount += 1;
    current.lastOrderAt =
      Math.max(
        current.lastOrderAt,
        order.createdAtMs || 0
      );

    if (
      isPaidOrder(order)
    ) {
      current.paidOrders += 1;
      current.totalSpent +=
        typeof order.price ===
        'number'
          ? order.price
          : 0;
    }

    if (
      current.fullName ===
        'Chưa có tên' &&
      fullName !== 'Chưa có tên'
    ) {
      current.fullName = fullName;
    }

    current.email =
      current.email || email;
    current.phone =
      current.phone || phone;

    map.set(
      key,
      current
    );
  });

  return Array.from(
    map.values()
  ).sort(
    (left, right) =>
      right.lastOrderAt -
      left.lastOrderAt
  );
};
