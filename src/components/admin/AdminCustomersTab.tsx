import React from 'react';

import {
  CustomerSummary,
  formatDateTime,
  formatVnd,
} from './adminUi';

export const AdminCustomersTab:
React.FC<{
  customers: CustomerSummary[];
}> = ({ customers }) => (
  <div className="overflow-hidden border border-black/8 bg-white">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] border-collapse text-left">
        <thead className="bg-[#f7f7f5]">
          <tr className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/35">
            <th className="px-4 py-3.5">Khách hàng</th>
            <th className="px-4 py-3.5">Liên hệ</th>
            <th className="px-4 py-3.5">Số đơn</th>
            <th className="px-4 py-3.5">Đã trả</th>
            <th className="px-4 py-3.5">Tổng chi</th>
            <th className="px-4 py-3.5">Đơn gần nhất</th>
          </tr>
        </thead>

        <tbody>
          {customers.map(
            (customer) => (
              <tr
                key={customer.key}
                className="border-t border-black/6 text-xs"
              >
                <td className="px-4 py-4 font-bold">
                  {customer.fullName}
                </td>
                <td className="px-4 py-4 text-black/50">
                  <p>{customer.email || '—'}</p>
                  <p className="mt-1">{customer.phone || '—'}</p>
                </td>
                <td className="px-4 py-4">{customer.orderCount}</td>
                <td className="px-4 py-4">{customer.paidOrders}</td>
                <td className="px-4 py-4 font-bold">
                  {formatVnd(customer.totalSpent)}
                </td>
                <td className="px-4 py-4 text-black/45">
                  {formatDateTime(customer.lastOrderAt)}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>

    {customers.length === 0 && (
      <div className="px-5 py-12 text-center text-xs text-black/35">
        Chưa có khách hàng từ checkout.
      </div>
    )}
  </div>
);
