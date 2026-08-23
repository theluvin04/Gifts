import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Check,
  Gift,
  Heart,
  Image,
  Music2,
  Sparkles,
  WandSparkles,
} from 'lucide-react';

interface HomePageProps {
  onOpenLoveTemplate: () => void;
}

const features = [
  {
    icon: Image,
    title: 'Ảnh của riêng bạn',
    description:
      'Thay ảnh, lời nhắn và những kỷ niệm của hai người.',
  },
  {
    icon: Music2,
    title: 'Nhạc riêng',
    description:
      'Thêm bài hát gắn với câu chuyện của bạn.',
  },
  {
    icon: WandSparkles,
    title: 'Hiệu ứng tương tác',
    description:
      'Không chỉ là một tấm thiệp, mà là một trải nghiệm.',
  },
];

export const HomePage: React.FC<HomePageProps> = ({
  onOpenLoveTemplate,
}) => {
  return (
    <div className="min-h-[100svh] w-full bg-[#fff9fb] text-slate-800">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-rose-100/70 bg-[#fff9fb]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              })
            }
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white shadow-sm shadow-rose-200">
              <Heart className="h-4 w-4 fill-current" />
            </div>

            <span className="text-lg font-bold tracking-[-0.04em] text-slate-900">
              Gifts
            </span>
          </button>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-500 md:flex">
            <a
              href="#templates"
              className="transition hover:text-rose-500"
            >
              Templates
            </a>

            <a
              href="#how-it-works"
              className="transition hover:text-rose-500"
            >
              Cách hoạt động
            </a>
          </nav>

          <button
            type="button"
            onClick={onOpenLoveTemplate}
            className="rounded-full bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-rose-500 sm:px-5 sm:text-sm"
          >
            Xem template
          </button>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-1/2 top-[-240px] h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-rose-200/25 blur-[100px]" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1fr_0.9fr] lg:gap-16 lg:pb-28 lg:pt-28">
            {/* HERO TEXT */}
            <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
              <motion.div
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3.5 py-2 text-xs font-bold text-rose-500 shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />

                <span>
                  Digital gifts, made personal
                </span>
              </motion.div>

              <motion.h1
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.05,
                }}
                className="text-[43px] font-bold leading-[1.03] tracking-[-0.055em] text-slate-900 sm:text-[62px] lg:text-[72px]"
              >
                Một món quà
                <br />

                <span className="text-rose-500">
                  có câu chuyện.
                </span>
              </motion.h1>

              <motion.p
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.1,
                }}
                className="mx-auto mt-6 max-w-xl text-[15px] leading-7 text-slate-500 sm:text-[17px] lg:mx-0"
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
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.15,
                }}
                className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
              >
                <button
                  type="button"
                  onClick={onOpenLoveTemplate}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-rose-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:-translate-y-0.5 hover:bg-rose-600 sm:w-auto"
                >
                  Xem Love Template

                  <ArrowRight className="h-4 w-4" />
                </button>

                <a
                  href="#how-it-works"
                  className="flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-600 transition hover:border-rose-200 hover:text-rose-500 sm:w-auto"
                >
                  Xem cách hoạt động
                </a>
              </motion.div>

              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 0.25,
                }}
                className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-400 lg:justify-start"
              >
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-rose-500" />
                  Không cần cài app
                </span>

                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-rose-500" />
                  Mở trên điện thoại
                </span>

                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-rose-500" />
                  Cá nhân hoá
                </span>
              </motion.div>
            </div>

            {/* HERO PREVIEW */}
            <motion.div
              initial={{
                opacity: 0,
                y: 30,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                delay: 0.12,
                type: 'spring',
                stiffness: 120,
                damping: 18,
              }}
              className="relative mx-auto w-full max-w-[520px]"
            >
              <div className="absolute -left-5 top-12 h-28 w-28 rounded-full bg-pink-200/50 blur-3xl" />

              <div className="absolute -right-7 bottom-10 h-32 w-32 rounded-full bg-rose-200/60 blur-3xl" />

              <div className="relative overflow-hidden rounded-[34px] border border-rose-100 bg-[#fff0f5] p-5 shadow-[0_30px_80px_rgba(190,70,110,0.16)] sm:p-7">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-pink-200" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white" />
                  </div>

                  <span className="rounded-full bg-white/80 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-rose-400">
                    Live Preview
                  </span>
                </div>

                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[26px] bg-[#fff7fa] px-5 py-8 text-center sm:min-h-[460px]">
                  <p className="text-xl font-semibold text-rose-500 sm:text-2xl">
                    I knew you'd say yes 💕
                  </p>

                  <img
                    src="/images/gifts/success.gif"
                    alt="Love template preview"
                    className="mt-4 h-28 w-28 object-contain sm:h-36 sm:w-36"
                  />

                  <div className="mt-6 grid w-full grid-cols-3 gap-3">
                    {[
                      '/images/gifts/gift-1.png',
                      '/images/gifts/gift-2.png',
                      '/images/gifts/gift-3.png',
                    ].map((src, index) => (
                      <motion.div
                        key={src}
                        whileHover={{
                          y: -4,
                        }}
                        className="flex aspect-square items-center justify-center rounded-2xl bg-[#fce8f1] p-3 shadow-sm sm:p-4"
                      >
                        <img
                          src={src}
                          alt={`Gift ${
                            index + 1
                          }`}
                          className="h-full w-full object-contain"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <motion.div
                animate={{
                  y: [0, -7, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -bottom-6 -left-3 hidden rounded-2xl border border-rose-100 bg-white px-4 py-3 shadow-xl sm:block"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-400">
                  Personal
                </p>

                <p className="mt-0.5 text-xs font-semibold text-slate-600">
                  ảnh + nhạc + lời nhắn
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* TEMPLATES */}
        <section
          id="templates"
          className="border-y border-rose-100 bg-white py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
                  Templates
                </p>

                <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-900 sm:text-4xl">
                  Chọn câu chuyện của bạn
                </h2>
              </div>

              <p className="max-w-md text-sm leading-6 text-slate-500">
                Bắt đầu với một mẫu, sau đó
                biến nó thành món quà chỉ thuộc
                về hai người.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {/* LOVE TEMPLATE */}
              <motion.button
                type="button"
                onClick={onOpenLoveTemplate}
                whileHover={{
                  y: -6,
                }}
                className="group overflow-hidden rounded-[28px] border border-rose-100 bg-[#fff8fa] text-left shadow-sm transition hover:shadow-xl hover:shadow-rose-100/70"
              >
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#fdebf2] p-8">
                  <div className="absolute right-4 top-4 z-10 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-rose-500 shadow-sm">
                    Available
                  </div>

                  <img
                    src="/images/gifts/success.gif"
                    alt="Love template"
                    className="h-[58%] w-[58%] object-contain transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-rose-400">
                        Love
                      </p>

                      <h3 className="mt-1.5 text-xl font-bold tracking-[-0.03em] text-slate-900">
                        Love Story 01
                      </h3>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white transition group-hover:translate-x-1">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    YES/NO tương tác, album ảnh,
                    đĩa nhạc và một bức thư riêng
                    dành cho người ấy.
                  </p>
                </div>
              </motion.button>

              {/* COMING SOON 1 */}
              <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-slate-50/70">
                <div className="flex aspect-[4/3] items-center justify-center bg-[#fff6e8]">
                  <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-white shadow-sm">
                    <Gift className="h-9 w-9 text-amber-400" />
                  </div>
                </div>

                <div className="p-5 opacity-60 sm:p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-slate-400">
                    Birthday
                  </p>

                  <h3 className="mt-1.5 text-xl font-bold tracking-[-0.03em] text-slate-700">
                    Birthday Story
                  </h3>

                  <p className="mt-3 text-sm text-slate-400">
                    Sắp ra mắt
                  </p>
                </div>
              </div>

              {/* COMING SOON 2 */}
              <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-slate-50/70">
                <div className="flex aspect-[4/3] items-center justify-center bg-[#f2efff]">
                  <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-white shadow-sm">
                    <Sparkles className="h-9 w-9 text-violet-400" />
                  </div>
                </div>

                <div className="p-5 opacity-60 sm:p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-slate-400">
                    Anniversary
                  </p>

                  <h3 className="mt-1.5 text-xl font-bold tracking-[-0.03em] text-slate-700">
                    Anniversary Story
                  </h3>

                  <p className="mt-3 text-sm text-slate-400">
                    Sắp ra mắt
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="py-20 sm:py-28"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
                How it works
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em] text-slate-900 sm:text-4xl">
                Từ template thành món quà của
                riêng bạn
              </h2>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[
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
                  text: 'Nhận một đường link riêng để gửi trực tiếp hoặc sau này tạo QR.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-[26px] border border-rose-100 bg-white p-6 sm:p-7"
                >
                  <span className="text-xs font-bold text-rose-400">
                    {item.step}
                  </span>

                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="px-5 pb-20 sm:px-8 sm:pb-28">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[34px] bg-slate-900 px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-300">
                  More than a card
                </p>

                <h2 className="mt-3 max-w-md text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
                  Một website nhỏ dành riêng cho
                  một người.
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {features.map((feature) => {
                  const Icon =
                    feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className="rounded-2xl bg-white/7 p-5"
                    >
                      <Icon className="h-5 w-5 text-rose-300" />

                      <h3 className="mt-4 text-sm font-bold">
                        {feature.title}
                      </h3>

                      <p className="mt-2 text-xs leading-5 text-white/55">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="border-t border-rose-100 bg-white py-20 text-center">
          <div className="mx-auto max-w-2xl px-5">
            <img
              src="/images/cat-default.gif"
              alt=""
              className="mx-auto h-24 w-24 object-contain"
            />

            <h2 className="mt-5 text-3xl font-bold tracking-[-0.045em] text-slate-900 sm:text-4xl">
              Thử template đầu tiên?
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Mở thử trải nghiệm Love Story 01
              trước khi mình làm tiếp hệ thống
              cá nhân hoá.
            </p>

            <button
              type="button"
              onClick={onOpenLoveTemplate}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-200"
            >
              Mở Love Story 01

              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-rose-100 bg-white py-7">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 text-xs text-slate-400 sm:flex-row sm:px-8">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
            Gifts
          </div>

          <span>
            Digital gifts for special moments.
          </span>
        </div>
      </footer>
    </div>
  );
};