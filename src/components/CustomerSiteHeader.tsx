import React, {
  useEffect,
  useState,
} from 'react';

import {
  Menu,
  ShoppingCart,
  X,
} from 'lucide-react';

import {
  BrandLogo,
} from './BrandLogo';

type NavKey =
  | 'templates'
  | 'track-order'
  | 'cart';

interface Props {
  active?: NavKey | null;
  cartCount?: number;
  onHome: () => void;
  onTemplates: () => void;
  onTrackOrder: () => void;
  onCart: () => void;
}

const navClass = (
  active: boolean
) =>
  [
    'rounded-[10px] px-3 py-2 text-[13px] font-semibold transition',
    active
      ? 'bg-black/[0.045] text-[#171717]'
      : 'text-black/46 hover:bg-black/[0.035] hover:text-[#171717]',
  ].join(' ');

const CartButton:
React.FC<{
  count: number;
  active?: boolean;
  onClick: () => void;
}> = ({
  count,
  active = false,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'relative flex h-10 w-10 items-center justify-center rounded-[10px] transition',
      active
        ? 'bg-black/[0.055] text-[#171717]'
        : 'text-black/65 hover:bg-black/[0.04] hover:text-[#171717]',
    ].join(' ')}
    aria-label={`Giỏ hàng, ${count} sản phẩm`}
  >
    <ShoppingCart className="h-[20px] w-[20px]" />

    {count > 0 && (
      <span className="absolute -right-0.5 -top-0.5 flex min-h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#e77c91] px-1 text-[9px] font-black leading-none text-white">
        {count > 99 ? '99+' : count}
      </span>
    )}
  </button>
);

export const CustomerSiteHeader:
React.FC<Props> = ({
  active = null,
  cartCount = 0,
  onHome,
  onTemplates,
  onTrackOrder,
  onCart,
}) => {
  const [
    drawerOpen,
    setDrawerOpen,
  ] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      'hidden';

    const onKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false);
      }
    };

    window.addEventListener(
      'keydown',
      onKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        'keydown',
        onKeyDown
      );
    };
  }, [drawerOpen]);

  const go = (
    action: () => void
  ) => {
    setDrawerOpen(false);
    action();
  };

  return (
    <>
      <header className="sticky top-0 z-[70] border-b border-black/[0.065] bg-[#fffaf8]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[62px] w-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:h-[68px] sm:px-8 lg:px-10">
          {/* Logo luôn bên trái, click = Home */}
          <div className="flex shrink-0 items-center">
            <BrandLogo
              onClick={onHome}
              imageClassName="h-9 w-auto max-w-[108px] sm:h-10 sm:max-w-[126px]"
            />
          </div>

          {/* Desktop: chỉ giữ đúng điều hướng cần thiết */}
          <div className="hidden items-center gap-1 lg:flex">
            <button
              type="button"
              onClick={onTemplates}
              className={navClass(
                active === 'templates'
              )}
            >
              Templates
            </button>

            <button
              type="button"
              onClick={onTrackOrder}
              className={navClass(
                active === 'track-order'
              )}
            >
              Tra cứu đơn
            </button>

            <span className="mx-1 h-5 w-px bg-black/[0.08]" />

            <CartButton
              count={cartCount}
              active={
                active === 'cart'
              }
              onClick={onCart}
            />
          </div>

          {/* Mobile/tablet: giỏ + hamburger bên phải */}
          <div className="flex items-center gap-1 lg:hidden">
            <CartButton
              count={cartCount}
              active={
                active === 'cart'
              }
              onClick={onCart}
            />

            <button
              type="button"
              onClick={() =>
                setDrawerOpen(true)
              }
              className="flex h-10 w-10 items-center justify-center rounded-[10px] text-black/70 transition active:bg-black/[0.05]"
              aria-label="Mở menu"
              aria-expanded={drawerOpen}
            >
              <Menu className="h-[22px] w-[22px]" />
            </button>
          </div>
        </div>
      </header>

      <div
        className={[
          'fixed inset-0 z-[100] lg:hidden',
          drawerOpen
            ? 'pointer-events-auto'
            : 'pointer-events-none',
        ].join(' ')}
        aria-hidden={!drawerOpen}
      >
        <button
          type="button"
          onClick={() =>
            setDrawerOpen(false)
          }
          className={[
            'absolute inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity duration-200',
            drawerOpen
              ? 'opacity-100'
              : 'opacity-0',
          ].join(' ')}
          aria-label="Đóng menu"
        />

        {/* Hamburger nằm bên phải nên drawer cũng trượt từ phải */}
        <aside
          className={[
            'absolute inset-y-0 right-0 flex w-[min(84vw,340px)] flex-col border-l border-black/[0.07] bg-[#fffaf8] shadow-[-22px_0_60px_rgba(20,10,14,0.16)] transition-transform duration-300 ease-out',
            drawerOpen
              ? 'translate-x-0'
              : 'translate-x-full',
          ].join(' ')}
        >
          <div className="flex h-[62px] items-center justify-between border-b border-black/[0.065] px-4">
            <BrandLogo
              onClick={() =>
                go(onHome)
              }
              imageClassName="h-9 w-auto max-w-[108px]"
            />

            <button
              type="button"
              onClick={() =>
                setDrawerOpen(false)
              }
              className="flex h-10 w-10 items-center justify-center rounded-[10px] text-black/55 active:bg-black/[0.05]"
              aria-label="Đóng menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4">
            <button
              type="button"
              onClick={() =>
                go(onTemplates)
              }
              className={[
                'flex min-h-12 w-full items-center justify-between rounded-[13px] px-4 text-left text-[15px] font-bold',
                active === 'templates'
                  ? 'bg-[#f6e9ec] text-[#b43d58]'
                  : 'text-black/66 active:bg-black/[0.04]',
              ].join(' ')}
            >
              Templates
            </button>

            <button
              type="button"
              onClick={() =>
                go(onTrackOrder)
              }
              className={[
                'mt-1 flex min-h-12 w-full items-center justify-between rounded-[13px] px-4 text-left text-[15px] font-bold',
                active === 'track-order'
                  ? 'bg-[#f6e9ec] text-[#b43d58]'
                  : 'text-black/66 active:bg-black/[0.04]',
              ].join(' ')}
            >
              Tra cứu đơn
            </button>

            <button
              type="button"
              onClick={() =>
                go(onCart)
              }
              className={[
                'mt-1 flex min-h-12 w-full items-center justify-between rounded-[13px] px-4 text-left text-[15px] font-bold',
                active === 'cart'
                  ? 'bg-[#f6e9ec] text-[#b43d58]'
                  : 'text-black/66 active:bg-black/[0.04]',
              ].join(' ')}
            >
              <span>Giỏ hàng</span>
              <span className="flex min-w-7 items-center justify-center rounded-full bg-black/[0.055] px-2 py-1 text-[10px] font-black text-black/48">
                {cartCount}
              </span>
            </button>
          </nav>
        </aside>
      </div>
    </>
  );
};
