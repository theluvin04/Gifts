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
  orders:
    AdminOrderRecord[];
  totalOrders: number;
  paidCount: number;
  pendingCount: number;
  revenue: number;
  search: string;
  paymentFilter:
    PaymentFilter;
  selectedOrderIds:
    string[];
  deleting: boolean;
  onSearch: (
    value: string
  ) => void;
  onPaymentFilter: (
    value:
      PaymentFilter
  ) => void;
  onToggleOrder: (
    id: string
  ) => void;
  onToggleAllVisible:
    () => void;
  onClearSelection:
    () => void;
  onDeleteOne: (
    order:
      AdminOrderRecord
  ) => void;
  onDeleteSelected:
    () => void;
  onOpenOrder: (
    id: string
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
    <div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Tổng đơn"
          value={String(
            totalOrders
          )}
        />

        <StatCard
          label="Chờ chuyển khoản"
          value={String(
            pendingCount
          )}
          emphasis={
            pendingCount >
            0
          }
        />

        <StatCard
          label="Đã thanh toán"
          value={String(
            paidCount
          )}
        />

        <StatCard
          label="Doanh thu"
          value={formatVnd(
            revenue
          )}
        />
      </div>

      <div className="mt-5 rounded-[18px] border border-black/8 bg-white p-3">
        <div className="sm:flex sm:items-center sm:justify-between sm:gap-3">
          <input
            value={search}
            onChange={(
              event
            ) =>
              onSearch(
                event.target
                  .value
              )
            }
            placeholder="Tìm Dearly8888, tên hoặc SĐT..."
            className="w-full min-w-0 rounded-[12px] border border-black/10 bg-[#faf9f8] px-4 py-3 text-sm outline-none focus:border-[#cf5068] sm:flex-1"
          />

          <div className="mt-3 grid grid-cols-3 gap-1 rounded-[12px] bg-[#f4f1f1] p-1 sm:mt-0 sm:w-[360px]">
            <FilterButton
              active={
                paymentFilter ===
                'all'
              }
              label="Tất cả"
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
              label="Chờ CK"
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
              onClick={() =>
                onPaymentFilter(
                  'paid'
                )
              }
            />
          </div>
        </div>

        {orders.length >
          0 && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-black/6 pt-3">
            <button
              type="button"
              disabled={
                deleting
              }
              onClick={
                onToggleAllVisible
              }
              className="text-[10px] font-bold text-black/42 hover:text-[#b83e57] disabled:opacity-40"
            >
              {allVisibleSelected
                ? `Bỏ chọn ${orders.length} đơn đang hiện`
                : `Chọn tất cả ${orders.length} đơn đang hiện`}
            </button>

            {selectedOrderIds
              .length >
              0 && (
              <p className="text-[10px] font-bold text-[#b83e57]">
                Đã chọn{' '}
                {
                  selectedOrderIds.length
                }{' '}
                đơn
              </p>
            )}
          </div>
        )}
      </div>

      {selectedOrderIds
        .length >
        0 && (
        <div className="sticky top-3 z-30 mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-red-100 bg-white px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div>
            <p className="text-xs font-black text-black/70">
              Đã chọn{' '}
              {
                selectedOrderIds.length
              }{' '}
              đơn
            </p>

            <p className="mt-0.5 text-[9px] text-black/35">
              Có thể đổi bộ lọc mà lựa chọn vẫn được giữ.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={
                deleting
              }
              onClick={
                onClearSelection
              }
              className="rounded-[9px] border border-black/10 px-3 py-2 text-[10px] font-bold text-black/45 disabled:opacity-40"
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
              className="rounded-[9px] bg-red-500 px-3.5 py-2 text-[10px] font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              {deleting
                ? 'Đang xóa...'
                : `Xóa ${selectedOrderIds.length} đơn`}
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 hidden overflow-hidden rounded-[18px] border border-black/8 bg-white md:block">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#faf9f8]">
            <tr className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/35">
              <th className="w-12 px-4 py-3.5">
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

              <th className="px-4 py-3.5">
                Mã đơn
              </th>

              <th className="px-4 py-3.5">
                Khách hàng
              </th>

              <th className="px-4 py-3.5">
                Trạng thái
              </th>

              <th className="px-4 py-3.5">
                Tổng
              </th>

              <th className="px-4 py-3.5">
                Ngày tạo
              </th>

              <th className="px-4 py-3.5 text-right">
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
                        : 'hover:bg-[#fff8fa]',
                    ].join(
                      ' '
                    )}
                  >
                    <td
                      className="px-4 py-4"
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

                    <td className="px-4 py-4">
                      <p className="font-mono text-sm font-black text-[#b83e57]">
                        {getOrderCode(
                          order
                        )}
                      </p>

                      <p className="mt-1 text-[10px] text-black/30">
                        {order.templateId ||
                          'love-01'}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-bold text-black/75">
                        {order.customer
                          ?.fullName ||
                          'Chưa có tên'}
                      </p>

                      <p className="mt-1 text-[11px] text-black/40">
                        {order.customer
                          ?.phone ||
                          'Chưa có SĐT'}
                      </p>

                      <p className="mt-1 text-[10px] text-black/28">
                        Tặng cho{' '}
                        {order.receiverName ||
                          '—'}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-1.5">
                        <PaymentBadge
                          order={
                            order
                          }
                        />

                        <p className="text-[10px] font-semibold text-black/35">
                          {getGiftLabel(
                            order
                          )}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4 font-bold text-black/70">
                      {typeof order.price ===
                      'number'
                        ? formatVnd(
                            order.price
                          )
                        : '—'}
                    </td>

                    <td className="px-4 py-4 text-[11px] text-black/40">
                      {formatDateTime(
                        order.createdAtMs
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <div
                        className="flex items-center justify-end gap-2"
                        onClick={(
                          event
                        ) =>
                          event.stopPropagation()
                        }
                      >
                        <button
                          type="button"
                          disabled={
                            deleting
                          }
                          onClick={() =>
                            onOpenOrder(
                              order.id
                            )
                          }
                          className="rounded-[9px] bg-[#191919] px-3 py-2 text-[10px] font-bold text-white transition hover:bg-[#b83e57] disabled:opacity-40"
                        >
                          Xem
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
                          className="rounded-[9px] border border-red-100 px-3 py-2 text-[10px] font-bold text-red-500 transition hover:bg-red-50 disabled:opacity-40"
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

      <div className="mt-4 grid gap-3 md:hidden">
        {orders.map(
          (order) => {
            const selected =
              selectedSet.has(
                order.id
              );

            return (
              <div
                key={
                  order.id
                }
                className={[
                  'rounded-[18px] border bg-white p-4',
                  selected
                    ? 'border-[#cf5068]/35 bg-[#fff8fa]'
                    : 'border-black/8',
                ].join(
                  ' '
                )}
              >
                <div className="flex items-start gap-3">
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
                    className="mt-1 h-4 w-4 shrink-0 accent-[#b83e57]"
                  />

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
                        <p className="font-mono text-base font-black text-[#b83e57]">
                          {getOrderCode(
                            order
                          )}
                        </p>

                        <p className="mt-1 truncate text-sm font-bold text-black/75">
                          {order.customer
                            ?.fullName ||
                            'Chưa có tên'}
                        </p>

                        <p className="mt-1 text-xs text-black/40">
                          {order.customer
                            ?.phone ||
                            'Chưa có SĐT'}
                        </p>
                      </div>

                      <PaymentBadge
                        order={
                          order
                        }
                      />
                    </div>
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-black/6 pt-3 text-xs">
                  <div>
                    <p className="text-[10px] text-black/30">
                      Tổng
                    </p>

                    <p className="mt-1 font-bold">
                      {typeof order.price ===
                      'number'
                        ? formatVnd(
                            order.price
                          )
                        : '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-black/30">
                      Tạo lúc
                    </p>

                    <p className="mt-1 font-semibold text-black/55">
                      {formatDateTime(
                        order.createdAtMs
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={
                      deleting
                    }
                    onClick={() =>
                      onOpenOrder(
                        order.id
                      )
                    }
                    className="rounded-[9px] bg-[#191919] px-3 py-2 text-[10px] font-bold text-white disabled:opacity-40"
                  >
                    Xem đơn
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
                    className="rounded-[9px] border border-red-100 px-3 py-2 text-[10px] font-bold text-red-500 disabled:opacity-40"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            );
          }
        )}

        {orders.length ===
          0 && (
          <div className="rounded-[18px] border border-black/8 bg-white">
            <EmptyOrders />
          </div>
        )}
      </div>

      <p className="mt-3 text-right text-[10px] text-black/30">
        Hiển thị{' '}
        {orders.length}/
        {totalOrders} đơn
      </p>
    </div>
  );
};

const FilterButton:
React.FC<{
  active: boolean;
  label: string;
  onClick: () => void;
}> = ({
  active,
  label,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'rounded-[9px] px-2 py-2 text-[11px] font-bold transition',
      active
        ? 'bg-white text-[#b83e57] shadow-sm'
        : 'text-black/40 hover:text-black/65',
    ].join(' ')}
  >
    {label}
  </button>
);

const StatCard:
React.FC<{
  label: string;
  value: string;
  emphasis?: boolean;
}> = ({
  label,
  value,
  emphasis = false,
}) => (
  <div className="rounded-[16px] border border-black/8 bg-white p-4">
    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/30">
      {label}
    </p>

    <p
      className={[
        'mt-2 text-xl font-black tracking-[-0.04em]',
        emphasis
          ? 'text-[#b83e57]'
          : 'text-black/75',
      ].join(' ')}
    >
      {value}
    </p>
  </div>
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
        'inline-flex w-fit rounded-full px-2.5 py-1 text-[9px] font-bold',
        paid
          ? 'bg-emerald-50 text-emerald-700'
          : waiting
            ? 'bg-amber-50 text-amber-700'
            : 'bg-slate-100 text-slate-500',
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
    <div className="px-5 py-12 text-center">
      <p className="text-sm font-bold text-black/55">
        Không có đơn phù hợp
      </p>

      <p className="mt-1 text-xs text-black/30">
        Thử đổi từ khóa hoặc bộ lọc.
      </p>
    </div>
  );
