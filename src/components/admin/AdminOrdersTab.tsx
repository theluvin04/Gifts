import React from 'react';

import {
  AdminOrderRecord,
} from '../../services/adminService';

import {
  GiftFilter,
  PaymentFilter,
  formatDateTime,
  formatVnd,
  isPaidOrder,
} from './adminUi';

interface Props {
  orders: AdminOrderRecord[];
  totalOrders: number;
  search: string;
  paymentFilter: PaymentFilter;
  giftFilter: GiftFilter;
  onSearch: (value: string) => void;
  onPaymentFilter: (
    value: PaymentFilter
  ) => void;
  onGiftFilter: (
    value: GiftFilter
  ) => void;
  onOpenOrder: (
    id: string
  ) => void;
}

export const AdminOrdersTab:
React.FC<Props> = ({
  orders,
  totalOrders,
  search,
  paymentFilter,
  giftFilter,
  onSearch,
  onPaymentFilter,
  onGiftFilter,
  onOpenOrder,
}) => (
  <div className="space-y-4">
    <div className="grid gap-3 border border-black/8 bg-white p-3 lg:grid-cols-[1fr_auto_auto]">
      <input
        value={search}
        onChange={(event) =>
          onSearch(
            event.target.value
          )
        }
        placeholder="Tìm mã gift, tên, email, SĐT..."
        className="min-w-0 border border-black/10 px-3.5 py-2.5 text-sm outline-none focus:border-[#cf5068]"
      />

      <select
        value={paymentFilter}
        onChange={(event) =>
          onPaymentFilter(
            event.target
              .value as PaymentFilter
          )
        }
        className="border border-black/10 bg-white px-3 py-2.5 text-xs font-bold outline-none"
      >
        <option value="all">
          Tất cả thanh toán
        </option>
        <option value="paid">
          Đã thanh toán
        </option>
        <option value="unpaid">
          Chưa thanh toán
        </option>
      </select>

      <select
        value={giftFilter}
        onChange={(event) =>
          onGiftFilter(
            event.target
              .value as GiftFilter
          )
        }
        className="border border-black/10 bg-white px-3 py-2.5 text-xs font-bold outline-none"
      >
        <option value="all">
          Tất cả gift
        </option>
        <option value="draft">
          Draft
        </option>
        <option value="published">
          Published
        </option>
      </select>
    </div>

    <div className="overflow-hidden border border-black/8 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead className="bg-[#f7f7f5]">
            <tr className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/35">
              <th className="px-4 py-3.5">Gift</th>
              <th className="px-4 py-3.5">Khách hàng</th>
              <th className="px-4 py-3.5">Người nhận</th>
              <th className="px-4 py-3.5">Thanh toán</th>
              <th className="px-4 py-3.5">Gift</th>
              <th className="px-4 py-3.5">Giá</th>
              <th className="px-4 py-3.5">Tạo lúc</th>
              <th className="px-4 py-3.5 text-right">Mở</th>
            </tr>
          </thead>

          <tbody>
            {orders.map(
              (order) => (
                <tr
                  key={order.id}
                  className="border-t border-black/6 text-xs"
                >
                  <td className="px-4 py-4">
                    <p className="font-mono font-bold">
                      {order.id}
                    </p>
                    <p className="mt-1 text-[10px] text-black/30">
                      {order.templateId ||
                        'love-01'}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <p className="font-bold">
                      {order.customer?.fullName ||
                        '—'}
                    </p>
                    <p className="mt-1 max-w-[210px] truncate text-[10px] text-black/35">
                      {order.customer?.email ||
                        order.customer?.phone ||
                        'Chưa có thông tin'}
                    </p>
                  </td>

                  <td className="px-4 py-4 text-black/55">
                    {order.receiverName ||
                      '—'}
                  </td>

                  <td className="px-4 py-4">
                    <StatusText
                      active={
                        isPaidOrder(order)
                      }
                      text={
                        order.paymentStatus ||
                        'unpaid'
                      }
                    />
                  </td>

                  <td className="px-4 py-4">
                    <StatusText
                      active={
                        order.status ===
                        'published'
                      }
                      text={order.status}
                    />
                  </td>

                  <td className="px-4 py-4 font-bold">
                    {typeof order.price ===
                    'number'
                      ? formatVnd(
                          order.price
                        )
                      : '—'}
                  </td>

                  <td className="px-4 py-4 text-black/45">
                    {formatDateTime(
                      order.createdAtMs
                    )}
                  </td>

                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenOrder(
                          order.id
                        )
                      }
                      className="border-b border-black/35 pb-0.5 font-bold text-black/60 hover:border-[#b83e57] hover:text-[#b83e57]"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div className="px-5 py-12 text-center text-xs text-black/35">
          Chưa có đơn phù hợp.
        </div>
      )}
    </div>

    <p className="text-right text-[10px] text-black/35">
      Hiển thị {orders.length}/{totalOrders} đơn
    </p>
  </div>
);

const StatusText: React.FC<{
  active: boolean;
  text: string;
}> = ({ active, text }) => (
  <span
    className={[
      'text-[10px] font-bold',
      active
        ? 'text-emerald-600'
        : 'text-amber-600',
    ].join(' ')}
  >
    {text}
  </span>
);
