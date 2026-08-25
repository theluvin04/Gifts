import React from 'react';

import {
  AdminOrderRecord,
} from '../../services/adminService';

import {
  PaymentFilter,
  formatDateTime,
  formatVnd,
  getGiftLabel,
  getOrderCode,
  getPaymentLabel,
  isPaidOrder,
} from './adminUi';

interface Props {
  orders: AdminOrderRecord[];
  totalOrders: number;
  paidCount: number;
  pendingCount: number;
  revenue: number;
  search: string;
  paymentFilter: PaymentFilter;
  selectedOrderIds: string[];
  deleting: boolean;
  onSearch: (
    value: string
  ) => void;
  onPaymentFilter: (
    value: PaymentFilter
  ) => void;
  onToggleOrder: (
    id: string
  ) => void;
  onToggleAllVisible: () => void;
  onClearSelection: () => void;
  onDeleteOne: (
    order: AdminOrderRecord
  ) => void;
  onDeleteSelected: () => void;
  onOpenOrder: (
    id: string
  ) => void;
  linkBusyOrderId: string;
  onToggleLink: (
    order: AdminOrderRecord
  ) => void;
}

export const AdminOrdersTab:
React.FC<Props> = ({
  orders,
  totalOrders,
  paidCount,
  pendingCount,
  revenue,
  search,
  paymentFilter,
  selectedOrderIds,
  deleting,
  onSearch,
  onPaymentFilter,
  onToggleOrder,
  onToggleAllVisible,
  onClearSelection,
  onDeleteOne,
  onDeleteSelected,
  onOpenOrder,
  linkBusyOrderId,
  onToggleLink,
}) => {
  const selectedSet =
    new Set(
      selectedOrderIds
    );

  const visibleIds =
    orders.map(
      (order) =>
        order.id
    );

  const allVisibleSelected =
    visibleIds.length >
      0 &&
    visibleIds.every(
      (id) =>
        selectedSet.has(
          id
        )
    );

  return (
    <div className="space-y-4">
      <section className="rounded-[18px] border border-black/8 bg-white p-3 sm:p-4">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Tổng đơn"
            value={String(
              totalOrders
            )}
          />
          <StatCard
            label="Chờ thanh toán"
            value={String(
              pendingCount
            )}
            tone="amber"
          />
          <StatCard
            label="Đã thanh toán"
            value={String(
              paidCount
            )}
            tone="green"
          />
          <StatCard
            label="Doanh thu đã trả"
            value={formatVnd(
              revenue
            )}
          />
        </div>

        <div className="mt-3 grid gap-3 border-t border-black/6 pt-3 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-center">
          <div className="relative">
            <input
              value={
                search
              }
              onChange={(
                event
              ) =>
                onSearch(
                  event.target
                    .value
                )
              }
              placeholder="Tìm mã đơn, tên, SĐT hoặc email..."
              className="min-h-12 w-full rounded-[12px] border border-black/10 bg-[#faf9f8] px-4 pr-20 text-[16px] outline-none transition placeholder:text-black/25 focus:border-[#cf5068]/45 focus:bg-white focus:ring-2 focus:ring-[#cf5068]/10 sm:text-sm"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  onSearch('')
                }
                className="absolute right-2 top-1/2 min-h-9 -translate-y-1/2 rounded-[9px] px-3 text-[10px] font-bold text-black/35 hover:bg-black/[0.04] hover:text-black/60"
              >
                Xóa
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1 rounded-[12px] bg-[#f3f1f0] p-1">
            <FilterButton
              active={
                paymentFilter ===
                'all'
              }
              label="Tất cả"
              count={
                totalOrders
              }
              onClick={() =>
                onPaymentFilter(
                  'all'
                )
              }
            />

            <FilterButton
              active={
                paymentFilter ===
                'waiting'
              }
              label="Chờ"
              count={
                pendingCount
              }
              tone="amber"
              onClick={() =>
                onPaymentFilter(
                  'waiting'
                )
              }
            />

            <FilterButton
              active={
                paymentFilter ===
                'paid'
              }
              label="Đã trả"
              count={
                paidCount
              }
              tone="green"
              onClick={() =>
                onPaymentFilter(
                  'paid'
                )
              }
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-black/38">
          <p>
            Đang hiển thị{' '}
            <strong className="text-black/65">
              {orders.length}
            </strong>{' '}
            đơn
          </p>

          {orders.length >
            0 && (
            <button
              type="button"
              disabled={
                deleting
              }
              onClick={
                onToggleAllVisible
              }
              className="min-h-9 rounded-[9px] px-3 font-bold text-[#b83e57] transition hover:bg-[#fff4f7] disabled:opacity-40"
            >
              {allVisibleSelected
                ? 'Bỏ chọn tất cả'
                : 'Chọn tất cả đang hiện'}
            </button>
          )}
        </div>
      </section>

      {selectedOrderIds.length >
        0 && (
        <section className="sticky top-2 z-30 flex flex-col gap-3 rounded-[15px] border border-[#cf5068]/20 bg-white/95 px-4 py-3 shadow-[0_10px_32px_rgba(0,0,0,0.1)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black text-black/75">
              {
                selectedOrderIds.length
              }{' '}
              đơn đã chọn
            </p>
            <p className="mt-0.5 text-[10px] text-black/35">
              Xóa hàng loạt là hành động không thể hoàn tác.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              type="button"
              disabled={
                deleting
              }
              onClick={
                onClearSelection
              }
              className="min-h-10 rounded-[10px] border border-black/10 bg-white px-3 text-[11px] font-bold text-black/45 disabled:opacity-40"
            >
              Bỏ chọn
            </button>

            <button
              type="button"
              disabled={
                deleting
              }
              onClick={
                onDeleteSelected
              }
              className="min-h-10 rounded-[10px] bg-red-500 px-4 text-[11px] font-black text-white disabled:opacity-50"
            >
              {deleting
                ? 'Đang xóa...'
                : `Xóa ${selectedOrderIds.length} đơn`}
            </button>
          </div>
        </section>
      )}

      {/* Table only appears when there is genuinely enough width.
          Laptop-sized admin screens get the easier card layout instead. */}
      <div className="hidden overflow-hidden rounded-[18px] border border-black/8 bg-white xl:block">
        <table className="w-full table-fixed border-collapse text-left">
          <thead className="bg-[#faf9f8]">
            <tr className="text-[9px] font-black uppercase tracking-[0.08em] text-black/35">
              <th className="w-12 px-3 py-3.5">
                <input
                  type="checkbox"
                  checked={
                    allVisibleSelected
                  }
                  disabled={
                    deleting ||
                    orders.length ===
                      0
                  }
                  onChange={
                    onToggleAllVisible
                  }
                  aria-label="Chọn tất cả đơn đang hiển thị"
                  className="h-4 w-4 accent-[#b83e57]"
                />
              </th>
              <th className="w-[16%] px-3 py-3.5">
                Mã đơn
              </th>
              <th className="w-[23%] px-3 py-3.5">
                Khách hàng
              </th>
              <th className="w-[18%] px-3 py-3.5">
                Trạng thái
              </th>
              <th className="w-[14%] px-3 py-3.5">
                Tổng
              </th>
              <th className="w-[17%] px-3 py-3.5">
                Ngày tạo
              </th>
              <th className="w-[12%] px-3 py-3.5 text-right">
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.map(
              (order) => {
                const selected =
                  selectedSet.has(
                    order.id
                  );

                return (
                  <tr
                    key={
                      order.id
                    }
                    onClick={() =>
                      onOpenOrder(
                        order.id
                      )
                    }
                    className={[
                      'cursor-pointer border-t border-black/6 text-xs transition',
                      selected
                        ? 'bg-[#fff5f7]'
                        : 'hover:bg-[#fff9fa]',
                    ].join(' ')}
                  >
                    <td
                      className="px-3 py-4"
                      onClick={(
                        event
                      ) =>
                        event.stopPropagation()
                      }
                    >
                      <input
                        type="checkbox"
                        checked={
                          selected
                        }
                        disabled={
                          deleting
                        }
                        onChange={() =>
                          onToggleOrder(
                            order.id
                          )
                        }
                        aria-label={`Chọn ${getOrderCode(order)}`}
                        className="h-4 w-4 accent-[#b83e57]"
                      />
                    </td>

                    <td className="px-3 py-4">
                      <p className="truncate font-mono text-sm font-black text-[#b83e57]">
                        {getOrderCode(
                          order
                        )}
                      </p>
                      <p className="mt-1 truncate text-[10px] text-black/30">
                        {order.templateId ||
                          'love-01'}
                      </p>
                    </td>

                    <td className="px-3 py-4">
                      <p className="truncate font-bold text-black/75">
                        {order.customer
                          ?.fullName ||
                          'Chưa có tên'}
                      </p>
                      <p className="mt-1 truncate text-[11px] text-black/40">
                        {order.customer
                          ?.phone ||
                          order.customer
                            ?.email ||
                          'Chưa có liên hệ'}
                      </p>
                    </td>

                    <td className="px-3 py-4">
                      <PaymentBadge
                        order={
                          order
                        }
                      />
                      <p className="mt-1.5 truncate text-[10px] font-semibold text-black/32">
                        {getGiftLabel(
                          order
                        )}
                      </p>
                    </td>

                    <td className="px-3 py-4 font-black text-black/70">
                      {typeof order.price ===
                      'number'
                        ? formatVnd(
                            order.price
                          )
                        : '—'}
                    </td>

                    <td className="px-3 py-4 text-[11px] leading-5 text-black/40">
                      {formatDateTime(
                        order.createdAtMs
                      )}
                    </td>

                    <td
                      className="px-3 py-4"
                      onClick={(
                        event
                      ) =>
                        event.stopPropagation()
                      }
                    >
                      <div className="flex justify-end gap-1.5">
                        {(
                          order.status ===
                            'published' ||
                          order.isPublished ===
                            true ||
                          isPaidOrder(
                            order
                          )
                        ) && (
                          <button
                            type="button"
                            disabled={
                              deleting ||
                              linkBusyOrderId ===
                                order.id
                            }
                            onClick={() =>
                              onToggleLink(
                                order
                              )
                            }
                            className={[
                              'min-h-9 rounded-[9px] px-2.5 text-[10px] font-black disabled:opacity-40',
                              order.status ===
                                'published' ||
                              order.isPublished ===
                                true
                                ? 'border border-black/10 bg-white text-black/45'
                                : 'bg-emerald-600 text-white',
                            ].join(' ')}
                          >
                            {linkBusyOrderId ===
                            order.id
                              ? '...'
                              : order.status ===
                                    'published' ||
                                  order.isPublished ===
                                    true
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
                          className="min-h-9 rounded-[9px] bg-[#191919] px-3 text-[10px] font-black text-white"
                        >
                          Mở
                        </button>

                        <button
                          type="button"
                          disabled={
                            deleting
                          }
                          onClick={() =>
                            onDeleteOne(
                              order
                            )
                          }
                          className="min-h-9 rounded-[9px] border border-red-100 bg-white px-2.5 text-[10px] font-bold text-red-500 disabled:opacity-40"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>

        {orders.length ===
          0 && (
          <EmptyOrders />
        )}
      </div>

      {/* Cards are easier to scan on phones and normal laptops. */}
      <div className="grid gap-3 xl:hidden">
        {orders.map(
          (order) => {
            const selected =
              selectedSet.has(
                order.id
              );

            const paid =
              isPaidOrder(
                order
              );

            const waiting =
              order.paymentStatus ===
              'waiting_bank_transfer';

            return (
              <article
                key={
                  order.id
                }
                className={[
                  'overflow-hidden rounded-[17px] border bg-white transition',
                  selected
                    ? 'border-[#cf5068]/30 bg-[#fffafb] shadow-[0_8px_25px_rgba(130,45,65,0.06)]'
                    : waiting
                      ? 'border-amber-200/80'
                      : 'border-black/8',
                ].join(' ')}
              >
                <div className="flex items-start gap-3 p-4">
                  <label
                    className="flex min-h-10 shrink-0 items-start pt-1"
                    onClick={(
                      event
                    ) =>
                      event.stopPropagation()
                    }
                  >
                    <input
                      type="checkbox"
                      checked={
                        selected
                      }
                      disabled={
                        deleting
                      }
                      onChange={() =>
                        onToggleOrder(
                          order.id
                        )
                      }
                      aria-label={`Chọn ${getOrderCode(order)}`}
                      className="h-4 w-4 accent-[#b83e57]"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      onOpenOrder(
                        order.id
                      )
                    }
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-mono text-sm font-black text-[#b83e57]">
                            {getOrderCode(
                              order
                            )}
                          </p>

                          {waiting && (
                            <span className="rounded-full bg-amber-50 px-2 py-1 text-[8px] font-black text-amber-700">
                              CẦN XỬ LÝ
                            </span>
                          )}

                          {paid && (
                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-black text-emerald-700">
                              ĐÃ TRẢ
                            </span>
                          )}
                        </div>

                        <p className="mt-1.5 truncate text-sm font-black text-black/75">
                          {order.customer
                            ?.fullName ||
                            'Chưa có tên'}
                        </p>

                        <p className="mt-1 truncate text-xs text-black/40">
                          {order.customer
                            ?.phone ||
                            order.customer
                              ?.email ||
                            'Chưa có liên hệ'}
                        </p>
                      </div>

                      <p className="shrink-0 text-base font-black text-black/75">
                        {typeof order.price ===
                        'number'
                          ? formatVnd(
                              order.price
                            )
                          : '—'}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <PaymentBadge
                        order={
                          order
                        }
                      />
                      <span className="rounded-full bg-black/[0.035] px-2.5 py-1 text-[9px] font-bold text-black/38">
                        {getGiftLabel(
                          order
                        )}
                      </span>
                      <span className="text-[10px] text-black/28">
                        {order.templateId ||
                          'love-01'}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-black/6 pt-3">
                      <p className="text-[10px] text-black/35">
                        {formatDateTime(
                          order.createdAtMs
                        )}
                      </p>

                      <span className="text-[10px] font-black text-[#b83e57]">
                        Mở chi tiết →
                      </span>
                    </div>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/6 bg-[#fcfbfa] px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    {(
                      paid ||
                      order.status ===
                        'published' ||
                      order.isPublished ===
                        true
                    ) && (
                      <button
                        type="button"
                        disabled={
                          deleting ||
                          linkBusyOrderId ===
                            order.id
                        }
                        onClick={() =>
                          onToggleLink(
                            order
                          )
                        }
                        className={[
                          'min-h-9 rounded-[9px] px-3 text-[10px] font-black disabled:opacity-40',
                          order.status ===
                            'published' ||
                          order.isPublished ===
                            true
                            ? 'border border-black/10 bg-white text-black/45'
                            : 'bg-emerald-600 text-white',
                        ].join(' ')}
                      >
                        {linkBusyOrderId ===
                        order.id
                          ? 'Đang lưu...'
                          : order.status ===
                                'published' ||
                              order.isPublished ===
                                true
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
                      className="min-h-9 rounded-[9px] bg-[#191919] px-3 text-[10px] font-black text-white"
                    >
                      Mở
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={
                      deleting
                    }
                    onClick={() =>
                      onDeleteOne(
                        order
                      )
                    }
                    className="min-h-9 shrink-0 rounded-[9px] px-3 text-[10px] font-bold text-red-500 transition hover:bg-red-50 disabled:opacity-40"
                  >
                    Xóa
                  </button>
                </div>
              </article>
            );
          }
        )}

        {orders.length ===
          0 && (
          <div className="rounded-[17px] border border-black/8 bg-white p-10 text-center">
            <p className="text-sm font-black text-black/55">
              Không có đơn phù hợp
            </p>
            <p className="mt-1 text-xs leading-5 text-black/30">
              Thử đổi từ khóa hoặc bộ lọc thanh toán.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard:
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
      'rounded-[13px] border px-3.5 py-3',
      tone ===
      'amber'
        ? 'border-amber-100 bg-amber-50/60'
        : tone ===
            'green'
          ? 'border-emerald-100 bg-emerald-50/50'
          : 'border-black/6 bg-[#faf9f8]',
    ].join(' ')}
  >
    <p className="text-[9px] font-black uppercase tracking-[0.09em] text-black/30">
      {label}
    </p>
    <p
      className={[
        'mt-1 text-lg font-black tracking-[-0.03em]',
        tone ===
        'amber'
          ? 'text-amber-800'
          : tone ===
              'green'
            ? 'text-emerald-700'
            : 'text-black/70',
      ].join(' ')}
    >
      {value}
    </p>
  </div>
);

const FilterButton:
React.FC<{
  active: boolean;
  label: string;
  count: number;
  tone?:
    | 'default'
    | 'amber'
    | 'green';
  onClick: () => void;
}> = ({
  active,
  label,
  count,
  tone = 'default',
  onClick,
}) => (
  <button
    type="button"
    onClick={
      onClick
    }
    className={[
      'min-h-10 rounded-[9px] px-2 text-[10px] font-black transition',
      active
        ? tone ===
          'amber'
          ? 'bg-amber-50 text-amber-800 shadow-sm'
          : tone ===
              'green'
            ? 'bg-emerald-50 text-emerald-700 shadow-sm'
            : 'bg-white text-[#b83e57] shadow-sm'
        : 'text-black/38 hover:text-black/65',
    ].join(' ')}
  >
    {label}{' '}
    <span className="opacity-55">
      {count}
    </span>
  </button>
);

const PaymentBadge:
React.FC<{
  order:
    AdminOrderRecord;
}> = ({
  order,
}) => {
  const paid =
    isPaidOrder(
      order
    );

  const waiting =
    order.paymentStatus ===
    'waiting_bank_transfer';

  return (
    <span
      className={[
        'inline-flex rounded-full px-2.5 py-1 text-[9px] font-black',
        paid
          ? 'bg-emerald-50 text-emerald-700'
          : waiting
            ? 'bg-amber-50 text-amber-700'
            : 'bg-black/[0.04] text-black/40',
      ].join(' ')}
    >
      {getPaymentLabel(
        order
      )}
    </span>
  );
};

const EmptyOrders =
  () => (
    <div className="px-5 py-14 text-center">
      <p className="text-sm font-black text-black/50">
        Không có đơn phù hợp
      </p>
      <p className="mt-1 text-xs text-black/30">
        Thử thay đổi từ khóa hoặc bộ lọc.
      </p>
    </div>
  );
