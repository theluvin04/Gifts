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
    visibleIds.length > 0 &&
    visibleIds.every(
      (id) =>
        selectedSet.has(id)
    );

  return (
    <div className="space-y-4">
      <section className="rounded-[16px] border border-black/8 bg-white p-3 sm:p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <input
            value={
              search
            }
            onChange={(
              event
            ) =>
              onSearch(
                event.target.value
              )
            }
            placeholder="Tìm mã đơn, tên, SĐT hoặc email..."
            className="w-full min-w-0 rounded-[11px] border border-black/10 bg-[#faf9f8] px-4 py-3 text-sm outline-none focus:border-[#cf5068] xl:flex-1"
          />

          <div className="grid grid-cols-3 gap-1 rounded-[11px] bg-[#f3f1f0] p-1 xl:w-[330px]">
            <FilterButton
              active={
                paymentFilter ===
                'all'
              }
              label={`Tất cả ${totalOrders}`}
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
              label={`Chờ ${pendingCount}`}
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
              label={`Đã trả ${paidCount}`}
              onClick={() =>
                onPaymentFilter(
                  'paid'
                )
              }
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-black/6 pt-3 text-[10px] text-black/38">
          <p>
            Hiển thị <strong className="text-black/65">{orders.length}</strong> đơn · Doanh thu đã trả <strong className="text-black/65">{formatVnd(revenue)}</strong>
          </p>

          {orders.length > 0 && (
            <button
              type="button"
              disabled={
                deleting
              }
              onClick={
                onToggleAllVisible
              }
              className="font-bold text-[#b83e57] disabled:opacity-40"
            >
              {allVisibleSelected
                ? 'Bỏ chọn tất cả đang hiện'
                : 'Chọn tất cả đang hiện'}
            </button>
          )}
        </div>
      </section>

      {selectedOrderIds.length > 0 && (
        <section className="sticky top-3 z-30 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#cf5068]/15 bg-white px-4 py-3 shadow-[0_10px_32px_rgba(0,0,0,0.08)]">
          <p className="text-xs font-black text-black/70">
            {selectedOrderIds.length} đơn đã chọn
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={deleting}
              onClick={
                onClearSelection
              }
              className="rounded-[9px] border border-black/10 px-3 py-2 text-[10px] font-bold text-black/45 disabled:opacity-40"
            >
              Bỏ chọn
            </button>

            <button
              type="button"
              disabled={deleting}
              onClick={
                onDeleteSelected
              }
              className="rounded-[9px] bg-red-500 px-3.5 py-2 text-[10px] font-bold text-white disabled:opacity-50"
            >
              {deleting
                ? 'Đang xóa...'
                : `Xóa ${selectedOrderIds.length} đơn`}
            </button>
          </div>
        </section>
      )}

      <div className="hidden overflow-hidden rounded-[18px] border border-black/8 bg-white md:block">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#faf9f8]">
            <tr className="text-[10px] font-bold uppercase tracking-[0.08em] text-black/35">
              <th className="w-12 px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={
                    allVisibleSelected
                  }
                  disabled={
                    deleting ||
                    orders.length === 0
                  }
                  onChange={
                    onToggleAllVisible
                  }
                  aria-label="Chọn tất cả đơn đang hiển thị"
                  className="h-4 w-4 accent-[#b83e57]"
                />
              </th>
              <th className="px-4 py-3.5">Mã đơn</th>
              <th className="px-4 py-3.5">Khách hàng</th>
              <th className="px-4 py-3.5">Thanh toán</th>
              <th className="px-4 py-3.5">Tổng</th>
              <th className="px-4 py-3.5">Ngày tạo</th>
              <th className="w-24 px-4 py-3.5 text-right">Thao tác</th>
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
                      className="px-4 py-4"
                      onClick={(
                        event
                      ) =>
                        event.stopPropagation()
                      }
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        disabled={deleting}
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
                        {getOrderCode(order)}
                      </p>
                      <p className="mt-1 text-[10px] text-black/30">
                        {order.templateId || 'love-01'}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-bold text-black/75">
                        {order.customer?.fullName || 'Chưa có tên'}
                      </p>
                      <p className="mt-1 text-[11px] text-black/40">
                        {order.customer?.phone || order.customer?.email || 'Chưa có liên hệ'}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <PaymentBadge
                        order={order}
                      />
                      <p className="mt-1.5 text-[10px] font-semibold text-black/32">
                        {getGiftLabel(order)}
                      </p>
                    </td>

                    <td className="px-4 py-4 font-black text-black/70">
                      {typeof order.price === 'number'
                        ? formatVnd(order.price)
                        : '—'}
                    </td>

                    <td className="px-4 py-4 text-[11px] text-black/40">
                      {formatDateTime(order.createdAtMs)}
                    </td>

                    <td
                      className="px-4 py-4"
                      onClick={(
                        event
                      ) =>
                        event.stopPropagation()
                      }
                    >
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onOpenOrder(order.id)
                          }
                          className="rounded-[8px] bg-[#191919] px-3 py-2 text-[10px] font-bold text-white"
                        >
                          Xem
                        </button>
                        <button
                          type="button"
                          disabled={deleting}
                          onClick={() =>
                            onDeleteOne(order)
                          }
                          className="rounded-[8px] border border-red-100 px-2.5 py-2 text-[10px] font-bold text-red-500 disabled:opacity-40"
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

        {orders.length === 0 && (
          <EmptyOrders />
        )}
      </div>

      <div className="grid gap-3 md:hidden">
        {orders.map(
          (order) => {
            const selected =
              selectedSet.has(
                order.id
              );

            return (
              <article
                key={
                  order.id
                }
                className={[
                  'rounded-[16px] border bg-white p-4',
                  selected
                    ? 'border-[#cf5068]/30 bg-[#fff8fa]'
                    : 'border-black/8',
                ].join(' ')}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={deleting}
                    onChange={() =>
                      onToggleOrder(
                        order.id
                      )
                    }
                    className="mt-1 h-4 w-4 accent-[#b83e57]"
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
                      <div>
                        <p className="font-mono text-sm font-black text-[#b83e57]">
                          {getOrderCode(order)}
                        </p>
                        <p className="mt-1 text-xs font-bold text-black/70">
                          {order.customer?.fullName || 'Chưa có tên'}
                        </p>
                      </div>

                      <p className="text-xs font-black text-black/70">
                        {typeof order.price === 'number'
                          ? formatVnd(order.price)
                          : '—'}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <PaymentBadge order={order} />
                      <span className="text-[10px] font-semibold text-black/35">
                        {getGiftLabel(order)}
                      </span>
                    </div>

                    <p className="mt-3 text-[10px] text-black/35">
                      {formatDateTime(order.createdAtMs)}
                    </p>
                  </button>
                </div>

                <div className="mt-3 flex justify-end border-t border-black/6 pt-3">
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() =>
                      onDeleteOne(order)
                    }
                    className="text-[10px] font-bold text-red-500 disabled:opacity-40"
                  >
                    Xóa đơn
                  </button>
                </div>
              </article>
            );
          }
        )}

        {orders.length === 0 && (
          <div className="rounded-[16px] border border-black/8 bg-white p-8 text-center text-xs text-black/35">
            Không có đơn phù hợp.
          </div>
        )}
      </div>
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
    onClick={
      onClick
    }
    className={[
      'rounded-[8px] px-3 py-2.5 text-[10px] font-bold transition',
      active
        ? 'bg-white text-[#b83e57] shadow-sm'
        : 'text-black/38 hover:text-black/65',
    ].join(' ')}
  >
    {label}
  </button>
);

const PaymentBadge:
React.FC<{
  order: AdminOrderRecord;
}> = ({ order }) => {
  const paid =
    isPaidOrder(order);

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
      {getPaymentLabel(order)}
    </span>
  );
};

const EmptyOrders = () => (
  <div className="px-5 py-14 text-center text-xs text-black/35">
    Không có đơn phù hợp với bộ lọc hiện tại.
  </div>
);
