import React, {
  useState,
} from 'react';

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  Search,
  ShoppingBag,
} from 'lucide-react';

import {
  BrandLogo,
} from './BrandLogo';

import {
  PublicOrderLookupRecord,
  searchPublicOrders,
} from '../services/orderLookupService';

interface TrackOrderPageProps {
  onBackHome: () => void;
}

const formatVnd = (
  amount: number
) => {
  return new Intl.NumberFormat(
    'vi-VN',
    {
      style: 'currency',
      currency: 'VND',
    }
  ).format(amount);
};

const formatDate = (
  value: number
) => {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    'vi-VN',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  ).format(
    new Date(value)
  );
};

const getStatusInfo = (
  order:
    PublicOrderLookupRecord
) => {
  if (
    order.status ===
      'published'
  ) {
    return {
      label:
        'Món quà đã hoàn tất',
      description:
        'Thanh toán đã được xác nhận và món quà đã được xuất bản.',
      className:
        'bg-emerald-50 text-emerald-700',
      icon:
        CheckCircle2,
    };
  }

  if (
    order.paymentStatus ===
      'paid' ||
    order.paymentStatus ===
      'paid_test'
  ) {
    return {
      label:
        'Đã thanh toán',
      description:
        'Dearly đã nhận thanh toán và đang hoàn tất món quà.',
      className:
        'bg-blue-50 text-blue-700',
      icon:
        CheckCircle2,
    };
  }

  if (
    order.paymentStatus ===
      'waiting_bank_transfer'
  ) {
    return {
      label:
        'Chờ xác nhận chuyển khoản',
      description:
        'Đơn đã được tạo và đang chờ Dearly xác nhận thanh toán.',
      className:
        'bg-amber-50 text-amber-700',
      icon:
        Clock3,
    };
  }

  return {
    label:
      'Chưa thanh toán',
    description:
      'Đơn chưa có xác nhận thanh toán.',
    className:
      'bg-slate-100 text-slate-600',
    icon:
      Clock3,
  };
};

export const TrackOrderPage:
React.FC<
  TrackOrderPageProps
> = ({
  onBackHome,
}) => {
  const [
    keyword,
    setKeyword,
  ] = useState('');

  const [
    orders,
    setOrders,
  ] = useState<
    PublicOrderLookupRecord[]
  >([]);

  const [
    hasSearched,
    setHasSearched,
  ] = useState(false);

  const [
    isSearching,
    setIsSearching,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const handleSearch =
    async (
      event:
        React.FormEvent
    ) => {
      event.preventDefault();

      setIsSearching(true);
      setError('');

      try {
        const result =
          await searchPublicOrders(
            keyword
          );

        setOrders(result);
        setHasSearched(true);
      } catch (
        searchError: any
      ) {
        setOrders([]);
        setHasSearched(true);
        setError(
          searchError?.message ||
          'Không thể tra cứu đơn.'
        );
      } finally {
        setIsSearching(false);
      }
    };

  return (
    <div className="min-h-[100svh] w-full overflow-x-hidden bg-[#fffaf8] text-[#1d1d1d]">
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-[#fffaf8]/92 backdrop-blur-xl">
        <div className="mx-auto grid h-[64px] w-full max-w-4xl grid-cols-[44px_minmax(0,1fr)_44px] items-center px-3 sm:h-[72px] sm:grid-cols-[1fr_auto_1fr] sm:px-6">
          <button
            type="button"
            onClick={
              onBackHome
            }
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-black/55 transition hover:bg-black/[0.04] hover:text-[#c9435d] sm:w-fit sm:justify-start sm:gap-2"
          >
            <ArrowLeft className="h-4 w-4" />

            <span className="hidden text-sm font-bold sm:inline">
              Trang chủ
            </span>
          </button>

          <BrandLogo
            onClick={
              onBackHome
            }
            imageClassName="h-10 w-auto sm:h-11"
          />

          <div />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-3 py-7 sm:px-6 sm:py-12">
        <section className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9435d]">
            Dearly order tracking
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-[-0.05em] sm:text-4xl">
            Tra cứu đơn hàng
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-black/45">
            Nhập số điện thoại đã đặt hàng hoặc mã đơn dạng Dearly8888.
          </p>
        </section>

        <form
          onSubmit={
            handleSearch
          }
          className="mx-auto mt-7 max-w-2xl rounded-[24px] border border-black/[0.06] bg-white p-3 shadow-[0_18px_55px_rgba(60,25,35,0.06)] sm:flex sm:gap-2 sm:p-2"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[16px] bg-[#faf8f7] px-4">
            <Search className="h-4 w-4 shrink-0 text-black/28" />

            <input
              value={
                keyword
              }
              onChange={(
                event
              ) =>
                setKeyword(
                  event.target
                    .value
                )
              }
              placeholder="SĐT hoặc Dearly8888"
              className="min-w-0 flex-1 bg-transparent py-3.5 text-sm font-semibold text-black/70 outline-none placeholder:font-medium placeholder:text-black/25"
            />
          </div>

          <button
            type="submit"
            disabled={
              isSearching
            }
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#c9435d] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#b83951] disabled:opacity-60 sm:mt-0 sm:w-auto"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}

            Tra cứu
          </button>
        </form>

        <p className="mx-auto mt-3 max-w-2xl text-center text-[10px] leading-5 text-black/30">
          Trang tra cứu không hiển thị tên, email, số điện thoại hoặc link riêng của món quà.
        </p>

        {error && (
          <div className="mx-auto mt-6 max-w-2xl rounded-[18px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {hasSearched &&
          !error &&
          orders.length ===
            0 && (
          <section className="mx-auto mt-7 max-w-2xl rounded-[24px] border border-black/[0.06] bg-white px-5 py-12 text-center">
            <ShoppingBag className="mx-auto h-6 w-6 text-black/22" />

            <h2 className="mt-4 text-base font-black">
              Không tìm thấy đơn
            </h2>

            <p className="mt-2 text-sm leading-6 text-black/42">
              Kiểm tra lại số điện thoại hoặc mã Dearly#### rồi thử lại.
            </p>
          </section>
        )}

        {orders.length >
          0 && (
          <div className="mx-auto mt-7 grid max-w-2xl gap-4">
            {orders.map(
              (
                order,
                index
              ) => {
                const status =
                  getStatusInfo(
                    order
                  );

                const StatusIcon =
                  status.icon;

                return (
                  <article
                    key={`${order.orderCode}-${order.createdAtMs}-${index}`}
                    className="rounded-[24px] border border-black/[0.06] bg-white p-5 shadow-[0_14px_45px_rgba(60,25,35,0.045)] sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-black/30">
                          Mã đơn
                        </p>

                        <h2 className="mt-1 font-mono text-lg font-black text-[#c9435d]">
                          {
                            order.orderCode
                          }
                        </h2>
                      </div>

                      <span
                        className={[
                          'inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-bold',
                          status.className,
                        ].join(' ')}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />

                        {
                          status.label
                        }
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 border-y border-black/[0.055] py-4 text-sm">
                      <div>
                        <p className="text-[10px] font-semibold text-black/30">
                          Template
                        </p>

                        <p className="mt-1 font-bold text-black/68">
                          {
                            order.templateName
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold text-black/30">
                          Tổng tiền
                        </p>

                        <p className="mt-1 font-bold text-black/68">
                          {formatVnd(
                            order.price
                          )}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-[10px] font-semibold text-black/30">
                          Tạo lúc
                        </p>

                        <p className="mt-1 font-semibold text-black/55">
                          {formatDate(
                            order.createdAtMs
                          )}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-xs leading-5 text-black/42">
                      {
                        status.description
                      }
                    </p>
                  </article>
                );
              }
            )}
          </div>
        )}
      </main>
    </div>
  );
};
