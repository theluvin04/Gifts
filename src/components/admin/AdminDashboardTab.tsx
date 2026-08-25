import React from 'react';

import {
  AdminOrderRecord,
} from '../../services/adminService';

import {
  TemplateConfig,
} from '../../services/templateService';

import {
  CustomerSummary,
  formatDateTime,
  formatVnd,
  getOrderCode,
  getPaymentLabel,
} from './adminUi';

interface Props {
  orders: AdminOrderRecord[];
  customers: CustomerSummary[];
  paidCount: number;
  pendingCount: number;
  revenue: number;
  templates: TemplateConfig[];
  onOpenOrders: () => void;
  onOpenTemplates: () => void;
  onOpenOrder: (
    id: string
  ) => void;
}

export const AdminDashboardTab:
React.FC<Props> = ({
  orders,
  customers,
  paidCount,
  pendingCount,
  revenue,
  templates,
  onOpenOrders,
  onOpenTemplates,
  onOpenOrder,
}) => {
  const recent =
    orders.slice(0, 5);

  const visibleTemplates =
    templates.filter(
      (template) =>
        template.visible &&
        template.status ===
          'available'
    ).length;

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Đơn checkout"
          value={String(
            orders.length
          )}
          note={`${pendingCount} đơn đang chờ chuyển khoản`}
        />

        <Metric
          label="Đã thanh toán"
          value={String(
            paidCount
          )}
          note="Đơn đã xác nhận thanh toán"
        />

        <Metric
          label="Doanh thu đã trả"
          value={formatVnd(
            revenue
          )}
          note="Chỉ tính đơn đã thanh toán"
        />

        <Metric
          label="Khách hàng"
          value={String(
            customers.length
          )}
          note={`${visibleTemplates}/${templates.length} template đang bán`}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <div className="overflow-hidden rounded-[18px] border border-black/8 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-black/7 px-5 py-4">
            <div>
              <h2 className="text-sm font-black">
                Đơn mới nhất
              </h2>
              <p className="mt-1 text-[11px] text-black/38">
                Bấm vào đơn để xử lý nhanh.
              </p>
            </div>

            <button
              type="button"
              onClick={
                onOpenOrders
              }
              className="text-xs font-bold text-[#b83e57] hover:underline"
            >
              Xem tất cả
            </button>
          </div>

          {recent.length ===
            0 ? (
            <div className="px-5 py-12 text-center text-xs text-black/35">
              Chưa có đơn checkout.
            </div>
          ) : (
            <div className="divide-y divide-black/6">
              {recent.map(
                (order) => (
                  <button
                    key={
                      order.id
                    }
                    type="button"
                    onClick={() =>
                      onOpenOrder(
                        order.id
                      )
                    }
                    className="grid w-full gap-2 px-5 py-4 text-left transition hover:bg-[#fff8fa] sm:grid-cols-[130px_minmax(0,1fr)_150px] sm:items-center"
                  >
                    <div>
                      <p className="font-mono text-xs font-black text-[#b83e57]">
                        {getOrderCode(
                          order
                        )}
                      </p>
                      <p className="mt-1 text-[10px] text-black/30">
                        {formatDateTime(
                          order.createdAtMs
                        )}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-black/75">
                        {order.customer
                          ?.fullName ||
                          'Chưa có tên khách'}
                      </p>
                      <p className="mt-1 truncate text-[11px] text-black/38">
                        {order.customer
                          ?.phone ||
                          order.customer
                            ?.email ||
                          'Chưa có liên hệ'}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xs font-black text-black/70">
                        {typeof order.price ===
                        'number'
                          ? formatVnd(
                              order.price
                            )
                          : '—'}
                      </p>
                      <p className="mt-1 text-[10px] font-bold text-black/35">
                        {getPaymentLabel(
                          order
                        )}
                      </p>
                    </div>
                  </button>
                )
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <ActionCard
            title="Đơn chờ thanh toán"
            value={String(
              pendingCount
            )}
            description="Ưu tiên kiểm tra các đơn đang chờ chuyển khoản."
            buttonLabel="Mở đơn hàng"
            onClick={
              onOpenOrders
            }
          />

          <ActionCard
            title="Templates"
            value={`${visibleTemplates}/${templates.length}`}
            description="Template đang hiển thị / tổng số template."
            buttonLabel="Quản lý template"
            onClick={
              onOpenTemplates
            }
          />
        </div>
      </section>
    </div>
  );
};

const Metric:
React.FC<{
  label: string;
  value: string;
  note: string;
}> = ({
  label,
  value,
  note,
}) => (
  <div className="rounded-[16px] border border-black/8 bg-white p-4 sm:p-5">
    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/32">
      {label}
    </p>
    <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-black/85">
      {value}
    </p>
    <p className="mt-2 text-[10px] leading-4 text-black/35">
      {note}
    </p>
  </div>
);

const ActionCard:
React.FC<{
  title: string;
  value: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
}> = ({
  title,
  value,
  description,
  buttonLabel,
  onClick,
}) => (
  <section className="rounded-[16px] border border-black/8 bg-white p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-black">
          {title}
        </p>
        <p className="mt-2 text-[11px] leading-5 text-black/38">
          {description}
        </p>
      </div>
      <p className="text-2xl font-black tracking-[-0.04em] text-[#b83e57]">
        {value}
      </p>
    </div>

    <button
      type="button"
      onClick={
        onClick
      }
      className="mt-5 w-full rounded-[10px] bg-[#191919] px-4 py-2.5 text-[11px] font-bold text-white transition hover:bg-[#b83e57]"
    >
      {buttonLabel}
    </button>
  </section>
);
