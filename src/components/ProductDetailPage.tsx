import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  Image as ImageIcon,
  Mail,
  Music2,
  MousePointer2,
  Play,
  Sparkles,
} from 'lucide-react';

interface ProductDetailPageProps {
  onBackHome: () => void;
  onPreview: () => void;
  onPersonalize: () => void;
}

const includedFeatures = [
  {
    icon: MousePointer2,
    title: 'Màn YES / NO tương tác',
    description:
      'Mở đầu bằng một câu hỏi vui để người nhận tự khám phá món quà.',
  },
  {
    icon: ImageIcon,
    title: 'Album kỷ niệm',
    description:
      'Một gallery ảnh theo phong cách polaroid để kể lại những khoảnh khắc riêng.',
  },
  {
    icon: Music2,
    title: 'Playlist riêng',
    description:
      'Thêm những bài hát gắn với câu chuyện, một dịp hoặc một người đặc biệt.',
  },
  {
    icon: Mail,
    title: 'Love Letter',
    description:
      'Một bức thư riêng với hiệu ứng mở thư và nội dung được cá nhân hoá.',
  },
];

const personalizeItems = [
  'Tên người gửi và người nhận',
  'Ảnh kỷ niệm',
  'Bài hát và ảnh bìa',
  'Câu hỏi YES / NO',
  'Nội dung bức thư',
];

export const ProductDetailPage: React.FC<
  ProductDetailPageProps
> = ({
  onBackHome,
  onPreview,
  onPersonalize,
}) => {
  return (
    <div className="min-h-[100svh] w-full bg-[#fff9fb] text-slate-800">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-50 border-b border-rose-100/70 bg-[#fff9fb]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <button
            type="button"
            onClick={onBackHome}
            className="flex items-center gap-2 text-sm font-bold text-slate-700 transition hover:text-rose-500"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Trang chủ</span>
          </button>

          <button
            type="button"
            onClick={onBackHome}
            className="flex items-center gap-2"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white shadow-sm shadow-rose-200">
              <Heart className="h-4 w-4 fill-current" />
            </span>

            <span className="text-lg font-bold tracking-[-0.04em] text-slate-900">
              Gifts
            </span>
          </button>

          <div className="w-8 sm:w-20" />
        </div>
      </header>

      <main>
        {/* =================================================
            PRODUCT HERO
        ================================================= */}

        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-1/2 top-[-260px] h-[560px] w-[820px] -translate-x-1/2 rounded-full bg-rose-200/30 blur-[110px]" />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-20">
            {/* PREVIEW */}

            <motion.div
              initial={{
                opacity: 0,
                y: 24,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="order-2 lg:order-1"
            >
              <div className="overflow-hidden rounded-[34px] border border-rose-100 bg-[#fdebf2] p-4 shadow-[0_30px_90px_rgba(190,70,110,0.14)] sm:p-6">
                <div className="mb-4 flex items-center justify-between px-1">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-pink-200" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white" />
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-rose-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Xem trước tương tác
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onPreview}
                  className="group relative flex min-h-[440px] w-full flex-col items-center justify-center overflow-hidden rounded-[28px] bg-[#fff8fb] px-5 py-8 text-center sm:min-h-[520px]"
                >
                  <div className="absolute right-5 top-5 z-10 flex items-center gap-2 rounded-full bg-slate-900 px-3.5 py-2 text-[10px] font-bold text-white shadow-lg transition group-hover:bg-rose-500">
                    <Play className="h-3 w-3 fill-current" />
                    Xem demo
                  </div>

                  <p className="font-heading text-2xl font-bold text-rose-500 sm:text-3xl">
                    I knew you'd say yes 💕
                  </p>

                  <img
                    src="/images/gifts/success.gif"
                    alt="Love Story 01 preview"
                    className="mt-5 h-28 w-28 object-contain sm:h-36 sm:w-36"
                  />

                  <div className="mt-8 grid w-full max-w-[520px] grid-cols-3 gap-3 sm:gap-4">
                    {[
                      '/images/gifts/gift-1.png',
                      '/images/gifts/gift-2.png',
                      '/images/gifts/gift-3.png',
                    ].map((src) => (
                      <div
                        key={src}
                        className="flex aspect-square items-center justify-center rounded-2xl bg-[#fce8f1] p-3 shadow-sm sm:rounded-3xl sm:p-5"
                      >
                        <img
                          src={src}
                          alt=""
                          className="h-[82%] w-[82%] object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  {
                    image: '/images/gifts/gift-1.png',
                    label: 'Kỷ niệm',
                  },
                  {
                    image: '/images/gifts/gift-2.png',
                    label: 'Âm nhạc',
                  },
                  {
                    image: '/images/gifts/gift-3.png',
                    label: 'Bức thư',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-rose-100 bg-white p-3 text-center"
                  >
                    <img
                      src={item.image}
                      alt=""
                      className="mx-auto h-14 w-14 object-contain sm:h-20 sm:w-20"
                    />

                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 sm:text-xs">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* PRODUCT INFO */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.08,
              }}
              className="order-1 lg:order-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-rose-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-rose-500">
                  Tình yêu
                </span>

                <span className="rounded-full border border-rose-100 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Món quà website tương tác
                </span>
              </div>

              <h1 className="mt-5 text-[42px] font-bold leading-[1.02] tracking-[-0.055em] text-slate-900 sm:text-[58px] lg:text-[64px]">
                Love Story 01
              </h1>

              <p className="mt-5 max-w-xl text-[15px] leading-7 text-slate-500 sm:text-base">
                Một website nhỏ dành riêng cho một người. Người nhận bắt đầu bằng màn YES / NO, sau đó lần lượt mở album ảnh, playlist và bức thư của riêng hai người.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {[
                  'YES / NO',
                  'Album kỷ niệm',
                  'Playlist nhạc',
                  'Bức thư tình',
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-rose-100 bg-white px-3.5 py-2 text-xs font-semibold text-slate-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-8 rounded-[26px] border border-rose-100 bg-white p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-400">
                  Bạn có thể thay đổi
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {personalizeItems.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-2.5 text-sm font-medium text-slate-600"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                        <Check className="h-3 w-3" />
                      </span>

                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onPreview}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-rose-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:-translate-y-0.5 hover:bg-rose-600"
                >
                  Xem demo trực tiếp
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={onPersonalize}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-6 py-3.5 text-sm font-bold text-rose-500 transition hover:-translate-y-0.5 hover:bg-rose-50"
                >
                  Cá nhân hoá
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-3 text-center text-[11px] leading-5 text-slate-400 sm:text-left">
                Cá nhân hoá ảnh, nhạc, tên và nội dung thư trước khi tạo link riêng.
              </p>
            </motion.div>
          </div>
        </section>

        {/* =================================================
            WHAT IS INCLUDED
        ================================================= */}

        <section className="border-y border-rose-100 bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
                Bên trong có gì
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em] text-slate-900 sm:text-4xl">
                Một món quà, nhiều thứ để khám phá
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Love Story 01 được chia thành nhiều phần để người nhận không chỉ mở một trang rồi đọc hết mọi thứ cùng lúc.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {includedFeatures.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <motion.div
                    key={feature.title}
                    initial={{
                      opacity: 0,
                      y: 16,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                      amount: 0.3,
                    }}
                    transition={{
                      delay: index * 0.06,
                    }}
                    className="rounded-[26px] border border-rose-100 bg-[#fffafd] p-6"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="mt-5 text-base font-bold text-slate-900">
                      {feature.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =================================================
            EXPERIENCE FLOW
        ================================================= */}

        <section className="py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
                Hành trình trải nghiệm
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em] text-slate-900 sm:text-4xl">
                Không đưa hết món quà ra ngay từ đầu.
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500">
                Người nhận sẽ tự bấm, mở và khám phá từng phần. Chính quá trình đó làm món quà có cảm giác riêng hơn một landing page tĩnh thông thường.
              </p>

              <button
                type="button"
                onClick={onPreview}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-500"
              >
                Thử ngay trải nghiệm
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-[32px] border border-rose-100 bg-white p-5 shadow-sm sm:p-8">
              <div className="space-y-3">
                {[
                  {
                    number: '01',
                    title: 'YES / NO',
                    text: 'Một câu hỏi mở đầu để tạo sự tò mò.',
                  },
                  {
                    number: '02',
                    title: 'Chọn món quà',
                    text: 'Ba lựa chọn xuất hiện sau khi người nhận bấm YES.',
                  },
                  {
                    number: '03',
                    title: 'Khám phá từng phần',
                    text: 'Album ảnh, playlist và bức thư đều có trang riêng.',
                  },
                  {
                    number: '04',
                    title: 'Quay lại bất cứ lúc nào',
                    text: 'Mỗi phần có URL riêng nên có thể mở lại trực tiếp.',
                  },
                ].map((item) => (
                  <div
                    key={item.number}
                    className="flex gap-4 rounded-2xl bg-[#fff9fb] p-4 sm:p-5"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
                      {item.number}
                    </span>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            FINAL CTA
        ================================================= */}

        <section className="px-5 pb-20 sm:px-8 sm:pb-28">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[34px] bg-slate-900 px-6 py-12 text-center text-white sm:px-10 sm:py-16">
            <Sparkles className="mx-auto h-6 w-6 text-rose-300" />

            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
              Xem thử trước khi biến nó thành câu chuyện của bạn.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/55">
              Xem demo trước hoặc bắt đầu thay ảnh, nhạc, tên và bức thư để tạo phiên bản của riêng bạn.
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onPreview}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/15"
              >
                Xem demo
                <Play className="h-4 w-4 fill-current" />
              </button>

              <button
                type="button"
                onClick={onPersonalize}
                className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-rose-400"
              >
                Cá nhân hoá ngay
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="border-t border-rose-100 bg-white py-7">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 text-xs text-slate-400 sm:flex-row sm:px-8">
          <button
            type="button"
            onClick={onBackHome}
            className="flex items-center gap-2 font-bold text-slate-700"
          >
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
            Gifts
          </button>

          <span>
            Love Story 01 · Món quà website tương tác
          </span>
        </div>
      </footer>
    </div>
  );
};