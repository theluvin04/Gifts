import {
  AdminOrderRecord,
} from '../../services/adminService';

export type AdminTab =
  | 'orders'
  | 'templates';

export type PaymentFilter =
  | 'all'
  | 'waiting'
  | 'paid';

export const ADMIN_TABS: Array<{
  key: AdminTab;
  label: string;
}> = [
  {
    key: 'orders',
    label: 'Đơn hàng',
  },
  {
    key: 'templates',
    label: 'Templates',
  },
];

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
