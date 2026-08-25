import React, {
  useMemo,
  useState,
} from 'react';

import {
  CustomerSummary,
  formatDateTime,
  formatVnd,
} from './adminUi';

export const AdminCustomersTab:
React.FC<{
  customers: CustomerSummary[];
}> = ({ customers }) => {
  const [
    search,
    setSearch,
  ] = useState('');

  const filtered =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return customers;
      }

      return customers.filter(
        (customer) =>
          [
            customer.fullName,
            customer.email,
            customer.phone,
          ]
            .join(' ')
            .toLowerCase()
            .includes(
              keyword
            )
      );
    }, [
      customers,
      search,
    ]);

  return (
    <div className="space-y-4">
      <div className="rounded-[16px] border border-black/8 bg-white p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Tìm tên, email hoặc SĐT..."
            className="w-full rounded-[11px] border border-black/10 bg-[#faf9f8] px-4 py-3 text-sm outline-none focus:border-[#cf5068] sm:max-w-md"
          />

          <p className="px-1 text-[11px] font-bold text-black/35">
            {filtered.length}/{customers.length} khách
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[18px] border border-black/8 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead className="bg-[#faf9f8]">
              <tr className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/35">
                <th className="px-4 py-3.5">Khách hàng</th>
                <th className="px-4 py-3.5">Liên hệ</th>
                <th className="px-4 py-3.5">Đơn</th>
                <th className="px-4 py-3.5">Đã trả</th>
                <th className="px-4 py-3.5">Tổng chi</th>
                <th className="px-4 py-3.5">Gần nhất</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(
                (customer) => (
                  <tr
                    key={
                      customer.key
                    }
                    className="border-t border-black/6 text-xs"
                  >
                    <td className="px-4 py-4 font-bold text-black/75">
                      {customer.fullName}
                    </td>

                    <td className="px-4 py-4 text-black/50">
                      <p>{customer.phone || '—'}</p>
                      <p className="mt-1 text-[10px] text-black/30">
                        {customer.email || '—'}
                      </p>
                    </td>

                    <td className="px-4 py-4 font-bold">
                      {customer.orderCount}
                    </td>

                    <td className="px-4 py-4">
                      {customer.paidOrders}
                    </td>

                    <td className="px-4 py-4 font-black text-black/70">
                      {formatVnd(
                        customer.totalSpent
                      )}
                    </td>

                    <td className="px-4 py-4 text-[11px] text-black/40">
                      {formatDateTime(
                        customer.lastOrderAt
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {filtered.length ===
          0 && (
          <div className="px-5 py-12 text-center text-xs text-black/35">
            Không tìm thấy khách hàng phù hợp.
          </div>
        )}
      </div>
    </div>
  );
};
