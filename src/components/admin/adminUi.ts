import {
  AdminOrderRecord,
} from '../../services/adminService';

export type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'templates'
  | 'customers'
  | 'discounts'
  | 'settings';

export type PaymentFilter =
  | 'all'
  | 'paid'
  | 'unpaid';

export type GiftFilter =
  | 'all'
  | 'draft'
  | 'published';

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
}> = [
  ['dashboard', 'Dashboard'],
  ['orders', 'Đơn hàng'],
  ['templates', 'Templates'],
  ['customers', 'Khách hàng'],
  ['discounts', 'Khuyến mãi'],
  ['settings', 'Cài đặt'],
].map(([key, label]) => ({
  key: key as AdminTab,
  label,
}));

export const formatVnd = (
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
  ).format(new Date(timestamp));
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

export const buildCustomers = (
  orders: AdminOrderRecord[]
): CustomerSummary[] => {
  const map = new Map<
    string,
    CustomerSummary
  >();

  for (const order of orders) {
    const customer =
      order.customer;

    if (!customer) {
      continue;
    }

    const email =
      customer.email
        ?.trim()
        .toLowerCase() || '';

    const phone =
      customer.phone?.trim() || '';

    const key = email || phone;

    if (!key) {
      continue;
    }

    const current =
      map.get(key) || {
        key,
        fullName:
          customer.fullName || '—',
        email:
          customer.email || '',
        phone,
        orderCount: 0,
        paidOrders: 0,
        totalSpent: 0,
        lastOrderAt: 0,
      };

    current.orderCount += 1;

    if (isPaidOrder(order)) {
      current.paidOrders += 1;
      current.totalSpent +=
        typeof order.price ===
        'number'
          ? order.price
          : 0;
    }

    current.lastOrderAt =
      Math.max(
        current.lastOrderAt,
        order.createdAtMs
      );

    map.set(key, current);
  }

  return Array.from(
    map.values()
  ).sort(
    (left, right) =>
      right.lastOrderAt -
      left.lastOrderAt
  );
};
