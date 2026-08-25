import React, {
  useEffect,
  useState,
} from 'react';

import {
  CreditCard,
  Pencil,
  ShoppingBag,
  Trash2,
} from 'lucide-react';

import type {
  CartItem,
} from '../services/cartService';

import {
  getEffectiveTemplatePrice,
  getPublicTemplateConfigById,
} from '../services/templateService';

interface CartPageProps {
  items: CartItem[];
  onBackHome: () => void;
  onEdit: (item: CartItem) => void;
  onCheckout: (item: CartItem) => void;
  onRemove: (itemId: string) => void;
  onClear: () => void;
}

const formatVnd = (
  amount: number
) =>
  new Intl.NumberFormat(
    'vi-VN'
  ).format(amount) + 'đ';

export const CartPage:
React.FC<CartPageProps> = ({
  items,
  onBackHome,
  onEdit,
  onCheckout,
  onRemove,
  onClear,
}) => {
  const [
    prices,
    setPrices,
  ] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    let cancelled = false;

    const loadPrices = async () => {
      const uniqueIds =
        Array.from(
          new Set(
            items.map(
              (item) =>
                item.templateId
            )
          )
        );

      const entries =
        await Promise.all(
          uniqueIds.map(
            async (
              templateId
            ) => {
              const config =
                await getPublicTemplateConfigById(
                  templateId
                );

              return [
                templateId,
                getEffectiveTemplatePrice(
                  config
                ),
              ] as const;
            }
          )
        );

      if (!cancelled) {
        setPrices(
          Object.fromEntries(
            entries
          )
        );
      }
    };

    void loadPrices();

    return () => {
      cancelled = true;
    };
  }, [items]);

  return (
    <div className="min-h-[100svh] bg-[#fffaf8] text-[#171717]">
      <main className="mx-auto w-full max-w-[1000px] px-4 py-8 sm:px-7 sm:py-12">
        <div className="flex items-end justify-between gap-4 border-b border-black/[0.07] pb-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c94861]">
              Giỏ hàng
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.045em]">
              {items.length > 0
                ? `${items.length} món quà`
                : 'Giỏ hàng trống'}
            </h1>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="min-h-10 rounded-[10px] px-3 text-xs font-bold text-black/35 transition hover:bg-red-50 hover:text-red-500"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <section className="mt-7 rounded-[22px] border border-black/[0.07] bg-white px-5 py-14 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fdecef] text-[#c94861]">
              <ShoppingBag className="h-5 w-5" />
            </span>

            <h2 className="mt-4 text-lg font-black">
              Chưa có template nào
            </h2>

            <button
              type="button"
              onClick={onBackHome}
              className="mt-6 min-h-12 rounded-[13px] bg-[#171717] px-6 text-sm font-black text-white transition hover:bg-[#c94861]"
            >
              Xem templates
            </button>
          </section>
        ) : (
          <div className="mt-7 grid gap-3">
            {items.map(
              (item) => (
                <article
                  key={item.id}
                  className="rounded-[20px] border border-black/[0.07] bg-white p-4 sm:p-5"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[15px] bg-[#fff0f3]">
                      <img
                        src="/images/gifts/gift-1.png"
                        alt=""
                        className="h-10 w-10 object-contain"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-base font-black">
                        {item.templateName}
                      </h2>
                      <p className="mt-1 text-xs text-black/35">
                        Bản nháp đang được lưu trên thiết bị này.
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-black text-[#c94861]">
                        {typeof prices[
                          item.templateId
                        ] === 'number'
                          ? formatVnd(
                              prices[
                                item.templateId
                              ]
                            )
                          : '—'}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          onRemove(
                            item.id
                          )
                        }
                        className="mt-2 inline-flex h-9 w-9 items-center justify-center rounded-[9px] text-black/25 transition hover:bg-red-50 hover:text-red-500"
                        aria-label="Xóa khỏi giỏ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-black/[0.06] pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        onEdit(item)
                      }
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] border border-black/[0.09] bg-white px-3 text-xs font-bold text-black/55 transition hover:text-black/75"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Chỉnh sửa
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onCheckout(
                          item
                        )
                      }
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] bg-[#171717] px-3 text-xs font-black text-white transition hover:bg-[#c94861]"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      Thanh toán
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
};
