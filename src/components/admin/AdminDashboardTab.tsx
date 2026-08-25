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
  linkBusyOrderId: string;
  onToggleLink: (
    order: AdminOrderRecord
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
  linkBusyOrderId,
  onToggleLink,
}) => {
  const recent =
    orders.slice(0, 5);

  const availableTemplates =
    templates.filter(
      (template) =>
        template.status ===
        'available'
    ).length;

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Tổng đơn"
          value={String(
            orders.length
          )}
        />
        <Metric
          label="Đang chờ"
          value={String(
            pendingCount
          )}
          tone="amber"
        />
        <Metric
          label="Đã trả"
          value={String(
            paidCount
          )}
          tone="green"
        />
        <Metric
          label="Doanh thu"
          value={formatVnd(
            revenue
          )}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="overflow-hidden rounded-[18px] border border-black/8 bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-black/7 px-4 py-3.5 sm:px-5">
            <h2 className="text-sm font-black">
              Đơn mới nhất
            </h2>

            <button
              type="button"
              onClick={
                onOpenOrders
              }
              className="text-xs font-bold text-[#b83e57]"
            >
              Xem tất cả
            </button>
          </div>

          {recent.length ===
          0 ? (
            <div className="px-5 py-12 text-center text-xs text-black/35">
              Chưa có đơn.
            </div>
          ) : (
            <div className="divide-y divide-black/6">
              {recent.map(
                (order) => {
                  const published =
                    order.status ===
                      'published' ||
                    order.isPublished ===
                      true;

                  const canToggleLink =
                    published ||
                    order.paymentStatus ===
                      'paid' ||
                    order.paymentStatus ===
                      'paid_test';

                  const busy =
                    linkBusyOrderId ===
                    order.id;

                  return (
                    <div
                      key={
                        order.id
                      }
                      className="grid gap-2 px-4 py-3.5 transition hover:bg-[#fff9fa] sm:grid-cols-[120px_minmax(0,1fr)_120px_150px] sm:items-center sm:px-5"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          onOpenOrder(
                            order.id
                          )
                        }
                        className="text-left"
                      >
                        <p className="font-mono text-xs font-black text-[#b83e57]">
                          {getOrderCode(
                            order
                          )}
                        </p>
                        <p className="mt-1 text-[10px] text-black/28">
                          {formatDateTime(
                            order.createdAtMs
                          )}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onOpenOrder(
                            order.id
                          )
                        }
                        className="min-w-0 text-left"
                      >
                        <p className="truncate text-xs font-bold text-black/70">
                          {order.customer
                            ?.fullName ||
                            'Chưa có tên'}
                        </p>
                        <p className="mt-1 truncate text-[10px] text-black/32">
                          {order.customer
                            ?.phone ||
                            order.customer
                              ?.email ||
                            '—'}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onOpenOrder(
                            order.id
                          )
                        }
                        className="text-left sm:text-right"
                      >
                        <p className="text-xs font-black text-black/65">
                          {typeof order.price ===
                          'number'
                            ? formatVnd(
                                order.price
                              )
                            : '—'}
                        </p>
                        <p className="mt-1 text-[9px] font-bold text-black/30">
                          {getPaymentLabel(
                            order
                          )}
                        </p>
                      </button>

                      <div className="flex items-center gap-1.5 sm:justify-end">
                        {canToggleLink && (
                          <button
                            type="button"
                            disabled={
                              busy
                            }
                            onClick={() =>
                              onToggleLink(
                                order
                              )
                            }
                            className={[
                              'min-h-9 rounded-[9px] px-3 text-[10px] font-black transition disabled:opacity-45',
                              published
                                ? 'border border-black/10 bg-white text-black/45 hover:bg-black/[0.03]'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700',
                            ].join(' ')}
                          >
                            {busy
                              ? 'Đang lưu...'
                              : published
                                ? 'Tắt link'
                                : 'Bật link'}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            onOpenOrder(
                              order.id
                            )
                          }
                          className="min-h-9 rounded-[9px] border border-black/9 bg-white px-3 text-[10px] font-black text-black/45 hover:text-[#b83e57]"
                        >
                          Mở
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <QuickCard
            label="Khách hàng"
            value={String(
              customers.length
            )}
          />

          <button
            type="button"
            onClick={
              onOpenTemplates
            }
            className="rounded-[16px] border border-black/8 bg-white p-4 text-left transition hover:border-[#b83e57]/25"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-black/30">
              Templates
            </p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="text-2xl font-black tracking-[-0.04em] text-black/70">
                {availableTemplates}/
                {templates.length}
              </p>
              <span className="text-xs font-black text-[#b83e57]">
                Quản lý →
              </span>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};

const Metric:
React.FC<{
  label: string;
  value: string;
  tone?:
    | 'default'
    | 'amber'
    | 'green';
}> = ({
  label,
  value,
  tone = 'default',
}) => (
  <div
    className={[
      'rounded-[16px] border p-4',
      tone === 'amber'
        ? 'border-amber-100 bg-amber-50/60'
        : tone === 'green'
          ? 'border-emerald-100 bg-emerald-50/50'
          : 'border-black/8 bg-white',
    ].join(' ')}
  >
    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-black/30">
      {label}
    </p>
    <p
      className={[
        'mt-2 text-2xl font-black tracking-[-0.04em]',
        tone === 'amber'
          ? 'text-amber-800'
          : tone === 'green'
            ? 'text-emerald-700'
            : 'text-black/75',
      ].join(' ')}
    >
      {value}
    </p>
  </div>
);

const QuickCard:
React.FC<{
  label: string;
  value: string;
}> = ({
  label,
  value,
}) => (
  <div className="rounded-[16px] border border-black/8 bg-white p-4">
    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-black/30">
      {label}
    </p>
    <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-black/70">
      {value}
    </p>
  </div>
);
