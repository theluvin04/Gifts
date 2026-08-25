import React, {
  useEffect,
  useState,
} from 'react';

import {
  ArrowLeft,
  CreditCard,
  Pencil,
  ShoppingBag,
  Trash2,
} from 'lucide-react';

import {
  BrandLogo,
} from './BrandLogo';

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
) => {
  return new Intl.NumberFormat(
    'vi-VN',
    {
      style: 'currency',
      currency: 'VND',
    }
  ).format(amount);
};

export const CartPage:
React.FC<
  CartPageProps
> = ({
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

    const loadPrices =
      async () => {
        const uniqueIds: string[] =
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
    <div className="min-h-[100svh] w-full overflow-x-hidden bg-[#fffaf8] text-[#1d1d1d]">
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-[#fffaf8]/92 backdrop-blur-xl">
        <div className="mx-auto grid h-[64px] w-full max-w-5xl grid-cols-[44px_minmax(0,1fr)_44px] items-center px-3 sm:h-[72px] sm:grid-cols-[1fr_auto_1fr] sm:px-6">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-black/55 transition hover:bg-black/[0.04] hover:text-[#c9435d] sm:w-fit sm:justify-start sm:gap-2 sm:px-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden text-sm font-bold sm:inline">
              Tiếp tục mua
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

      <main className="mx-auto w-full max-w-5xl px-3 py-5 sm:px-6 sm:py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c9435d]">
              Dearly cart
            </p>

            <h1 className="mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
              Giỏ hàng
            </h1>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-bold text-black/35 transition hover:text-red-500"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <section className="mt-6 rounded-[26px] border border-black/[0.06] bg-white px-5 py-14 text-center shadow-[0_18px_60px_rgba(60,25,35,0.06)]">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fdecef] text-[#c9435d]">
              <ShoppingBag className="h-5 w-5" />
            </span>

            <h2 className="mt-5 text-lg font-black">
              Chưa có món quà nào
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-black/45">
              Cá nhân hoá một template rồi bấm “Thêm vào giỏ”.
            </p>

            <button
              type="button"
              onClick={onBackHome}
              className="mt-6 rounded-[14px] bg-[#c9435d] px-6 py-3 text-sm font-bold text-white"
            >
              Xem template
            </button>
          </section>
        ) : (
          <div className="mt-6 grid gap-4">
            {items.map(
              (item) => (
                <article
                  key={item.id}
                  className="rounded-[24px] border border-black/[0.06] bg-white p-4 shadow-[0_16px_50px_rgba(60,25,35,0.05)] sm:p-5"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] bg-[#fff0f3]">
                      <img
                        src="/images/gifts/gift-1.png"
                        alt=""
                        className="h-12 w-12 object-contain"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#c9435d]">
                        Website gift
                      </p>

                      <h2 className="mt-1 truncate text-base font-black">
                        {item.templateName}
                      </h2>

                      <p className="mt-1 text-xs text-black/40">
                        Nội dung cá nhân hoá đang được giữ trong bản nháp trên trình duyệt.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onRemove(
                          item.id
                        )
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-black/25 transition hover:bg-red-50 hover:text-red-500"
                      aria-label="Xóa khỏi giỏ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-black/[0.06] pt-4">
                    <span className="text-xs font-semibold text-black/40">
                      Giá hiện tại
                    </span>

                    <span className="text-base font-black text-[#c9435d]">
                      {typeof prices[
                        item.templateId
                      ] === 'number'
                        ? formatVnd(
                            prices[
                              item.templateId
                            ]
                          )
                        : 'Đang tải...'}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onEdit(item)
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-black/[0.08] bg-white px-3 py-3 text-xs font-bold text-black/60 transition hover:border-[#c9435d]/25 hover:text-[#c9435d]"
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
                      className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-[#c9435d] px-3 py-3 text-xs font-bold text-white transition hover:bg-[#b83951]"
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
