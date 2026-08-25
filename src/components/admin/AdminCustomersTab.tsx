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
      <div className="rounded-[16px] border border-black/8 bg-white p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Tìm tên, email hoặc SĐT..."
            className="min-h-11 w-full rounded-[11px] border border-black/10 bg-[#faf9f8] px-4 text-[16px] outline-none transition focus:border-[#cf5068]/45 focus:bg-white focus:ring-2 focus:ring-[#cf5068]/10 sm:max-w-md sm:text-sm"
          />

          <p className="px-1 text-[11px] font-bold text-black/35">
            {filtered.length}/
            {customers.length} khách
          </p>
        </div>
      </div>

      <div className="grid gap-3 xl:hidden">
        {filtered.map(
          (customer) => (
            <article
              key={customer.key}
              className="rounded-[16px] border border-black/8 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black text-black/75">
                    {customer.fullName}
                  </h2>
                  <p className="mt-1 text-xs text-black/42">
                    {customer.phone || '—'}
                  </p>
                  <p className="mt-1 truncate text-[10px] text-black/28">
                    {customer.email || '—'}
                  </p>
                </div>

                <p className="shrink-0 text-base font-black text-[#b83e57]">
                  {formatVnd(
                    customer.totalSpent
                  )}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-black/6 pt-3">
                <SmallMetric
                  label="Đơn"
                  value={String(
                    customer.orderCount
                  )}
                />
                <SmallMetric
                  label="Đã trả"
                  value={String(
                    customer.paidOrders
                  )}
                />
                <SmallMetric
                  label="Gần nhất"
                  value={formatDateTime(
                    customer.lastOrderAt
                  )}
                  small
                />
              </div>
            </article>
          )
        )}

        {filtered.length === 0 && (
          <div className="rounded-[16px] border border-black/8 bg-white px-5 py-12 text-center text-xs text-black/35">
            Không tìm thấy khách hàng.
          </div>
        )}
      </div>

      <div className="hidden overflow-hidden rounded-[18px] border border-black/8 bg-white xl:block">
        <table className="w-full table-fixed border-collapse text-left">
          <thead className="bg-[#faf9f8]">
            <tr className="text-[9px] font-black uppercase tracking-[0.09em] text-black/32">
              <th className="w-[24%] px-4 py-3.5">Khách hàng</th>
              <th className="w-[24%] px-4 py-3.5">Liên hệ</th>
              <th className="w-[10%] px-4 py-3.5">Đơn</th>
              <th className="w-[10%] px-4 py-3.5">Đã trả</th>
              <th className="w-[14%] px-4 py-3.5">Tổng chi</th>
              <th className="w-[18%] px-4 py-3.5">Gần nhất</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map(
              (customer) => (
                <tr
                  key={customer.key}
                  className="border-t border-black/6 text-xs"
                >
                  <td className="px-4 py-4 font-bold text-black/72">
                    {customer.fullName}
                  </td>
                  <td className="px-4 py-4 text-black/48">
                    <p className="truncate">
                      {customer.phone || '—'}
                    </p>
                    <p className="mt-1 truncate text-[10px] text-black/28">
                      {customer.email || '—'}
                    </p>
                  </td>
                  <td className="px-4 py-4 font-black">
                    {customer.orderCount}
                  </td>
                  <td className="px-4 py-4">
                    {customer.paidOrders}
                  </td>
                  <td className="px-4 py-4 font-black text-black/68">
                    {formatVnd(
                      customer.totalSpent
                    )}
                  </td>
                  <td className="px-4 py-4 text-[11px] text-black/38">
                    {formatDateTime(
                      customer.lastOrderAt
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-xs text-black/35">
            Không tìm thấy khách hàng.
          </div>
        )}
      </div>
    </div>
  );
};

const SmallMetric:
React.FC<{
  label: string;
  value: string;
  small?: boolean;
}> = ({
  label,
  value,
  small = false,
}) => (
  <div className="min-w-0">
    <p className="text-[9px] font-black uppercase tracking-[0.08em] text-black/25">
      {label}
    </p>
    <p
      className={[
        'mt-1 font-black text-black/62',
        small
          ? 'truncate text-[10px]'
          : 'text-sm',
      ].join(' ')}
    >
      {value}
    </p>
  </div>
);
