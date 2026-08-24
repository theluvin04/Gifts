import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

import { BRAND } from '../config/brand';

import {
  DEFAULT_LOVE_TEMPLATE_CONFIG,
  TemplateConfig,
  getEffectiveTemplatePrice,
  getPublicTemplateConfig,
  getTemplateDiscountPercent,
} from '../services/templateService';

interface HomePageProps {
  onOpenLoveTemplate: () => void;
  onTrackOrder: () => void;
}

const features = [
  {
    number: '01',
    title: 'Ảnh của riêng bạn',
    description:
      'Thay ảnh, lời nhắn và những kỷ niệm của hai người.',
  },
  {
    number: '02',
    title: 'Nhạc riêng',
    description:
      'Thêm bài hát gắn với câu chuyện của bạn.',
  },
  {
    number: '03',
    title: 'Hiệu ứng tương tác',
    description:
      'Không chỉ là một tấm thiệp, mà là một trải nghiệm.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Chọn template',
    text: 'Chọn phong cách phù hợp với dịp và người bạn muốn tặng.',
  },
  {
    step: '02',
    title: 'Cá nhân hoá',
    text: 'Thêm ảnh, tên, nhạc, lời nhắn và những chi tiết của riêng hai người.',
  },
  {
    step: '03',
    title: 'Gửi món quà',
    text: 'Nhận một đường link riêng để gửi trực tiếp cho người ấy.',
  },
];

export const HomePage: React.FC<
  HomePageProps
> = ({
  onOpenLoveTemplate,
  onTrackOrder,
}) => {
  const [template, setTemplate] =
    useState<TemplateConfig>(
      DEFAULT_LOVE_TEMPLATE_CONFIG
    );

  useEffect(() => {
    void getPublicTemplateConfig()
      .then(setTemplate);
  }, []);

  const effectivePrice =
    getEffectiveTemplatePrice(
      template
    );

  const discount =
    getTemplateDiscountPercent(
      template
    );

  const formatVnd = (
    amount: number
  ) =>
    new Intl.NumberFormat(
      'vi-VN'
    ).format(amount) + 'đ';

  const scrollToSection = (
    sectionId: string
  ) => {
    document
      .getElementById(
        sectionId
      )
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
  };

  useEffect(() => {
    const legacySection =
      window.location.hash
        .replace('#', '');

    if (
      legacySection ===
        'templates' ||
      legacySection ===
        'how-it-works'
    ) {
      window.history.replaceState(
        {},
        '',
        window.location.pathname +
          window.location.search
      );

      window.setTimeout(
        () =>
          scrollToSection(
            legacySection
          ),
        0
      );
    }
  }, []);

  return (
    <div className="min-h-[100svh] w-full bg-[#fffaf8] text-[#171717]">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[#fffaf8]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              })
            }
            className="flex items-center"
            aria-label="Dearly - về đầu trang"
          >
            <img
              src={BRAND.logoPath}
              alt={BRAND.name}
              className="h-10 w-auto object-contain sm:h-11"
            />
          </button>

          <nav className="hidden items-center gap-8 text-sm font-medium text-black/50 md:flex">
            <button
              type="button"
              onClick={() =>
                scrollToSection(
                  'templates'
                )
              }
              className="transition hover:text-black"
            >
              Templates
            </button>

            <button
              type="button"
              onClick={() =>
                scrollToSection(
                  'how-it-works'
                )
              }
              className="transition hover:text-black"
            >
              Cách hoạt động
            </button>

            <button
              type="button"
              onClick={
                onTrackOrder
              }
              className="transition hover:text-black"
            >
              Tra cứu đơn
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={
                onTrackOrder
              }
              className="rounded-[12px] px-2.5 py-2.5 text-[11px] font-bold text-black/48 transition hover:bg-black/[0.04] hover:text-black sm:px-3 sm:text-xs"
            >
              Tra cứu
            </button>

            <button
              type="button"
              onClick={onOpenLoveTemplate}
              className="rounded-[12px] bg-[#171717] px-3 py-2.5 text-[11px] font-bold text-white transition hover:bg-[#e64a67] sm:px-5 sm:text-sm"
            >
              Xem template
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-black/5">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[1fr_0.92fr] lg:gap-16 lg:pb-28 lg:pt-24">
            <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mb-6 flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d94763] lg:justify-start"
              >
                <span className="h-px w-8 bg-[#d94763]/45" />

                <span>
                  Digital gifts · personal by design
                </span>
              </motion.div>

              <motion.h1
                initial={{
                  opacity: 0,
                  y: 16,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.05,
                }}
                className="text-[44px] font-black leading-[0.98] tracking-[-0.06em] text-[#171717] sm:text-[64px] lg:text-[76px]"
              >
                Một món quà
                <br />

                <span className="font-medium italic text-[#d94763]">
                  có câu chuyện.
                </span>
              </motion.h1>

              <motion.p
                initial={{
                  opacity: 0,
                  y: 16,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.1,
                }}
                className="mx-auto mt-6 max-w-xl text-[15px] leading-7 text-black/52 sm:text-[17px] lg:mx-0"
              >
                Chọn một template, thêm ảnh,
                nhạc và lời nhắn của riêng bạn.
                Sau đó gửi người ấy một đường
                link nhỏ nhưng chứa cả một trải
                nghiệm.
              </motion.p>

              <motion.div
                initial={{
                  opacity: 0,
                  y: 16,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.15,
                }}
                className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
              >
                <button
                  type="button"
                  onClick={onOpenLoveTemplate}
                  className="w-full rounded-[14px] bg-[#d94763] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#c83b56] sm:w-auto"
                >
                  Xem Love Story 01
                </button>

                <button
                  type="button"
                  onClick={() =>
                    scrollToSection(
                      'how-it-works'
                    )
                  }
                  className="border-b border-black/30 pb-1 text-sm font-semibold text-black/60 transition hover:border-black hover:text-black"
                >
                  Xem cách hoạt động
                </button>
              </motion.div>

              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 0.24,
                }}
                className="mt-8 flex flex-wrap justify-center gap-x-3 gap-y-2 text-[11px] font-semibold text-black/38 lg:justify-start"
              >
                <span>
                  Không cần cài app
                </span>

                <span aria-hidden="true">
                  /
                </span>

                <span>
                  Mở trên điện thoại
                </span>

                <span aria-hidden="true">
                  /
                </span>

                <span>
                  Cá nhân hoá
                </span>
              </motion.div>
            </div>

            <motion.div
              initial={{
                opacity: 0,
                y: 24,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.12,
                duration: 0.55,
              }}
              className="mx-auto w-full max-w-[520px]"
            >
              <div className="overflow-hidden rounded-[30px] border border-black/[0.07] bg-white shadow-[0_18px_50px_rgba(23,23,23,0.06)]">
                <div className="flex items-center justify-between border-b border-black/6 px-5 py-3.5">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/35">
                    Love Story 01
                  </span>

                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#d94763]">
                    Preview
                  </span>
                </div>

                <div className="bg-[#fff5f6] px-5 py-8 text-center sm:px-7 sm:py-10">
                  <p className="text-lg font-semibold tracking-[-0.02em] text-[#d94763] sm:text-xl">
                    I knew you'd say yes 💕
                  </p>

                  <img
                    src="/images/gifts/success.gif"
                    alt="Love template preview"
                    className="mx-auto mt-4 h-28 w-28 object-contain sm:h-36 sm:w-36"
                  />

                  <div className="mt-7 grid grid-cols-3 gap-2.5">
                    {[
                      '/images/gifts/gift-1.png',
                      '/images/gifts/gift-2.png',
                      '/images/gifts/gift-3.png',
                    ].map(
                      (
                        src,
                        index
                      ) => (
                        <div
                          key={src}
                          className="aspect-square rounded-[18px] border border-black/5 bg-white/75 p-3 shadow-[0_8px_22px_rgba(23,23,23,0.035)] sm:p-4"
                        >
                          <img
                            src={src}
                            alt={`Gift ${
                              index + 1
                            }`}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[#d94763]/10 pt-4 text-left">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-black/30">
                        Includes
                      </p>

                      <p className="mt-1 text-xs font-semibold text-black/55">
                        ảnh · nhạc · lời nhắn
                      </p>
                    </div>

                    <span className="text-xs font-bold text-[#d94763]">
                      01
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section
          id="templates"
          className="bg-white py-18 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-10 grid gap-4 border-b border-black/8 pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d94763]">
                  Templates
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.045em] text-[#171717] sm:text-4xl">
                  Chọn câu chuyện của bạn
                </h2>
              </div>

              <p className="max-w-md text-sm leading-6 text-black/48">
                Bắt đầu với một mẫu, sau đó
                biến nó thành món quà chỉ thuộc
                về hai người.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <motion.button
                type="button"
                disabled={
                  template.status !==
                  'available'
                }
                style={{
                  display: template.visible
                    ? undefined
                    : 'none',
                }}
                onClick={onOpenLoveTemplate}
                whileHover={{
                  y: -5,
                }}
                transition={{
                  duration: 0.2,
                }}
                className="group overflow-hidden rounded-[30px] border border-black/[0.07] bg-[#fffafb] p-2 text-left shadow-[0_12px_35px_rgba(23,23,23,0.04)] transition hover:border-black/[0.12] hover:shadow-[0_24px_55px_rgba(23,23,23,0.08)]"
              >
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[24px] bg-[#fae8ec] p-8">
                  <span className="absolute right-4 top-4 rounded-[10px] border border-white/70 bg-white/80 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#d94763] backdrop-blur-sm">
                    {template.status ===
                    'available'
                      ? 'Available'
                      : 'Paused'}
                  </span>

                  <img
                    src="/images/gifts/success.gif"
                    alt="Love template"
                    className="h-[66%] w-[66%] object-contain transition duration-500 group-hover:scale-[1.045]"
                  />
                </div>

                <div className="px-4 pb-5 pt-4 sm:px-5 sm:pb-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#d94763]">
                        Love
                      </p>

                      <h3 className="mt-1.5 text-xl font-black tracking-[-0.035em] text-[#171717]">
                        Love Story 01
                      </h3>
                    </div>

                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-black/[0.08] bg-white text-base font-medium text-black/45 transition group-hover:border-[#d94763]/25 group-hover:bg-[#fff1f4] group-hover:text-[#d94763]">
                      →
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-base font-black text-[#171717]">
                      {formatVnd(
                        effectivePrice
                      )}
                    </span>

                    {discount > 0 && (
                      <>
                        <span className="text-xs text-black/28 line-through">
                          {formatVnd(
                            template.basePrice
                          )}
                        </span>

                        <span className="rounded-[8px] bg-[#fdecef] px-2 py-1 text-[9px] font-bold text-[#c93f59]">
                          -{discount}%
                        </span>
                      </>
                    )}
                  </div>

                  <p className="mt-3 max-w-[31ch] text-sm leading-6 text-black/48">
                    YES/NO tương tác, album ảnh,
                    đĩa nhạc và một bức thư riêng
                    dành cho người ấy.
                  </p>
                </div>
              </motion.button>

              <div className="overflow-hidden rounded-[30px] border border-black/[0.06] bg-[#fbfbfa] p-2 shadow-[0_12px_35px_rgba(23,23,23,0.025)]">
                <div className="flex aspect-[4/3] items-end justify-between rounded-[24px] bg-[#fff3dd] p-6">
                  <span className="text-[72px] font-black leading-none tracking-[-0.08em] text-[#bf7c2d]/22">
                    02
                  </span>

                  <span className="pb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-black/28">
                    Coming soon
                  </span>
                </div>

                <div className="px-4 pb-5 pt-4 sm:px-5 sm:pb-6">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-black/28">
                    Birthday
                  </p>

                  <h3 className="mt-1.5 text-xl font-black tracking-[-0.035em] text-black/58">
                    Birthday Story
                  </h3>

                  <p className="mt-3 text-sm text-black/32">
                    Sắp ra mắt
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[30px] border border-black/[0.06] bg-[#fbfbfa] p-2 shadow-[0_12px_35px_rgba(23,23,23,0.025)]">
                <div className="flex aspect-[4/3] items-end justify-between rounded-[24px] bg-[#f1edff] p-6">
                  <span className="text-[72px] font-black leading-none tracking-[-0.08em] text-[#745cb9]/20">
                    03
                  </span>

                  <span className="pb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-black/28">
                    Coming soon
                  </span>
                </div>

                <div className="px-4 pb-5 pt-4 sm:px-5 sm:pb-6">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-black/28">
                    Anniversary
                  </p>

                  <h3 className="mt-1.5 text-xl font-black tracking-[-0.035em] text-black/58">
                    Anniversary Story
                  </h3>

                  <p className="mt-3 text-sm text-black/32">
                    Sắp ra mắt
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-y border-black/5 bg-[#fffaf8] py-20 sm:py-28"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d94763]">
                  How it works
                </p>

                <h2 className="mt-3 max-w-lg text-3xl font-black tracking-[-0.045em] text-[#171717] sm:text-4xl">
                  Từ template thành món quà của
                  riêng bạn
                </h2>
              </div>

              <div className="border-t border-black/10">
                {steps.map(
                  (item) => (
                    <div
                      key={item.step}
                      className="grid gap-3 border-b border-black/10 py-6 sm:grid-cols-[64px_180px_1fr] sm:items-start sm:gap-5"
                    >
                      <span className="text-[11px] font-bold tracking-[0.12em] text-[#d94763]">
                        {item.step}
                      </span>

                      <h3 className="text-base font-bold tracking-[-0.02em] text-[#171717]">
                        {item.title}
                      </h3>

                      <p className="text-sm leading-6 text-black/48">
                        {item.text}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#171717] text-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-18 sm:px-8 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f18a9d]">
                More than a card
              </p>

              <h2 className="mt-3 max-w-md text-3xl font-black tracking-[-0.045em] sm:text-4xl">
                Một website nhỏ dành riêng cho
                một người.
              </h2>
            </div>

            <div className="grid gap-0 border-t border-white/15 sm:grid-cols-3">
              {features.map(
                (feature) => (
                  <div
                    key={feature.title}
                    className="border-b border-white/15 py-6 sm:border-r sm:px-5 sm:last:border-r-0"
                  >
                    <span className="text-[10px] font-bold tracking-[0.15em] text-[#f18a9d]">
                      {feature.number}
                    </span>

                    <h3 className="mt-6 text-sm font-bold">
                      {feature.title}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-white/48">
                      {feature.description}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d94763]">
              Love Story 01
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-[-0.045em] text-[#171717] sm:text-4xl">
              Thử template đầu tiên?
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/48">
              Mở thử trải nghiệm Love Story 01
              và xem món quà sẽ trông như thế
              nào trên điện thoại.
            </p>

            <button
              type="button"
              onClick={onOpenLoveTemplate}
              className="mt-7 rounded-[14px] bg-[#d94763] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#c83b56]"
            >
              Mở Love Story 01
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/6 bg-white py-7">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 text-xs text-black/35 sm:flex-row sm:px-8">
          <img
            src={BRAND.logoPath}
            alt={BRAND.name}
            className="h-9 w-auto object-contain"
          />

          <span>
            Digital gifts for special moments.
          </span>
        </div>
      </footer>
    </div>
  );
};
