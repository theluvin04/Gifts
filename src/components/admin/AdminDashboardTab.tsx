import React from 'react';

import {
  AdminOrderRecord,
} from '../../services/adminService';

import {
  TemplateConfig,
  getEffectiveTemplatePrice,
} from '../../services/templateService';

import {
  CustomerSummary,
  formatVnd,
} from './adminUi';

interface Props {
  orders: AdminOrderRecord[];
  customers: CustomerSummary[];
  paidCount: number;
  pendingCount: number;
  revenue: number;
  template: TemplateConfig;
  onOpenOrders: () => void;
}

export const AdminDashboardTab:
React.FC<Props> = ({
  orders,
  customers,
  paidCount,
  pendingCount,
  revenue,
  template,
  onOpenOrders,
}) => {
  const recent =
    orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Tổng đơn"
          value={String(
            orders.length
          )}
        />
        <Metric
          label="Đã thanh toán"
          value={String(paidCount)}
        />
        <Metric
          label="Chờ chuyển khoản"
          value={String(
            pendingCount
          )}
        />
        <Metric
          label="Doanh thu"
          value={formatVnd(revenue)}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="border border-black/8 bg-white">
          <div className="flex items-center justify-between border-b border-black/8 px-5 py-4">
            <div>
              <p className="text-xs font-bold">
                Đơn gần đây
              </p>
              <p className="mt-1 text-[11px] text-black/35">
                5 đơn mới nhất
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenOrders}
              className="text-xs font-bold text-[#b83e57]"
            >
              Xem tất cả
            </button>
          </div>

          {recent.length === 0 ? (
            <div className="px-5 py-12 text-center text-xs text-black/35">
              Chưa có đơn hàng.
            </div>
          ) : (
            recent.map(
              (order) => (
                <div
                  key={order.id}
                  className="grid gap-2 border-b border-black/6 px-5 py-4 text-xs last:border-b-0 sm:grid-cols-[1fr_1fr_auto] sm:items-center"
                >
                  <div>
                    <p className="font-mono font-bold">
                      {order.id}
                    </p>
                    <p className="mt-1 text-black/35">
                      {order.customer?.fullName ||
                        'Chưa có tên khách'}
                    </p>
                  </div>

                  <div className="text-black/50">
                    {order.senderName}
                    {' → '}
                    {order.receiverName}
                  </div>

                  <div className="font-bold">
                    {typeof order.price ===
                    'number'
                      ? formatVnd(
                          order.price
                        )
                      : '—'}
                  </div>
                </div>
              )
            )
          )}
        </section>

        <section className="border border-black/8 bg-[#181818] p-5 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#f0a0af]">
            Template đang bán
          </p>

          <h2 className="mt-4 text-2xl font-black tracking-[-0.035em]">
            {template.name}
          </h2>

          <p className="mt-2 text-sm text-white/45">
            {template.status}
            {' · '}
            {template.visible
              ? 'Đang hiển thị'
              : 'Đang ẩn'}
          </p>

          <div className="mt-8 border-t border-white/15 pt-5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">
              Giá hiện tại
            </p>

            <p className="mt-1 text-2xl font-black text-[#f0a0af]">
              {formatVnd(
                getEffectiveTemplatePrice(
                  template
                )
              )}
            </p>
          </div>

          <p className="mt-7 text-xs text-white/35">
            {customers.length} khách hàng đã có thông tin checkout.
          </p>
        </section>
      </div>
    </div>
  );
};

const Metric: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => (
  <div className="border border-black/8 bg-white p-5">
    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/30">
      {label}
    </p>
    <p className="mt-4 text-2xl font-black tracking-[-0.04em]">
      {value}
    </p>
  </div>
);
