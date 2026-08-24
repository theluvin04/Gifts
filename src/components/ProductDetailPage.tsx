import React from 'react';

import {
  motion,
} from 'motion/react';

import {
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

import {
  BrandLogo,
} from './BrandLogo';

interface ProductDetailPageProps {
  onBackHome: () => void;
  onPersonalize: () => void;
}

const customFields = [
  'Tên người gửi và người nhận',
  'Ảnh kỷ niệm',
  'Video / nhạc YouTube',
  'Câu hỏi YES / NO',
  'Nội dung bức thư',
];

const included = [
  {
    number: '01',
    title:
      'Màn mở đầu tương tác',
    text:
      'Một câu hỏi nhỏ trước khi người nhận bước vào món quà.',
  },
  {
    number: '02',
    title:
      'Album kỷ niệm',
    text:
      'Ảnh được sắp theo phong cách polaroid và photo strip.',
  },
  {
    number: '03',
    title:
      'Âm nhạc riêng',
    text:
      'Thêm video YouTube hoặc bài hát gắn với câu chuyện.',
  },
  {
    number: '04',
    title:
      'Bức thư riêng',
    text:
      'Lời nhắn được cá nhân hoá chỉ dành cho người nhận.',
  },
];

const scrollToIncluded =
  () => {
    document
      .getElementById(
        'included'
      )
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
  };

export const ProductDetailPage:
React.FC<
  ProductDetailPageProps
> = ({
  onBackHome,
  onPersonalize,
}) => {
  return (
    <div className="min-h-[100svh] bg-[#fffaf8] text-[#191919]">
      <header className="sticky top-0 z-50 border-b border-black/[0.055] bg-[#fffaf8]/90 backdrop-blur-xl">
        <div className="mx-auto grid h-[72px] max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex w-fit items-center gap-2 text-sm font-bold text-black/55 transition hover:text-[#c9435d]"
          >
            <ArrowLeft className="h-4 w-4" />
            Trang chủ
          </button>

          <BrandLogo
            onClick={
              onBackHome
            }
            imageClassName="h-11 w-auto sm:h-12"
          />

          <div />
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-black/[0.055] bg-[radial-gradient(circle_at_72%_30%,rgba(244,200,210,0.36),transparent_32%)]">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16 lg:pb-28">
            <motion.div
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >
              <div className="flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-[0.17em]">
                <span className="rounded-[9px] bg-[#fdecef] px-3 py-2 text-[#c9435d]">
                  Tình yêu
                </span>

                <span className="rounded-[9px] border border-black/[0.07] bg-white/70 px-3 py-2 text-black/38">
                  Website cá nhân hoá
                </span>
              </div>

              <h1 className="mt-6 text-[48px] font-black leading-[0.98] tracking-[-0.065em] sm:text-[66px]">
                Love Story 01
              </h1>

              <p className="mt-6 max-w-xl text-[15px] leading-7 text-black/50 sm:text-base">
                Một website nhỏ dành riêng cho một người:
                ảnh, âm nhạc, câu hỏi và lời nhắn được
                ghép thành một trải nghiệm duy nhất.
              </p>

              <div className="mt-8 grid border-y border-black/[0.08] sm:grid-cols-2">
                {customFields.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={item}
                      className={[
                        'flex items-center gap-3 py-3.5 text-sm font-semibold text-black/58',
                        index %
                          2 ===
                        0
                          ? 'sm:border-r sm:border-black/[0.08] sm:pr-5'
                          : 'sm:pl-5',
                      ].join(' ')}
                    >
                      <span className="text-[10px] font-black text-[#c9435d]">
                        0
                        {index + 1}
                      </span>

                      {item}
                    </div>
                  )
                )}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={
                    onPersonalize
                  }
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-[15px] bg-[#c9435d] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(201,67,93,0.18)] transition hover:-translate-y-0.5 hover:bg-[#b83951]"
                >
                  Cá nhân hoá
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={
                    scrollToIncluded
                  }
                  className="inline-flex flex-1 items-center justify-center rounded-[15px] border border-black/[0.09] bg-white/75 px-6 py-3.5 text-sm font-bold text-black/58 transition hover:bg-white hover:text-black"
                >
                  Xem bên trong
                </button>
              </div>

              <p className="mt-4 text-[11px] leading-5 text-black/35">
                Nội dung khách tự chỉnh không được mở xem trước.
                Món quà riêng chỉ mở sau khi thanh toán được xác nhận.
              </p>
            </motion.div>

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
                delay: 0.08,
              }}
            >
              <div className="overflow-hidden rounded-[32px] border border-black/[0.06] bg-white p-2 shadow-[0_26px_70px_rgba(60,25,35,0.08)]">
                <div className="rounded-[26px] bg-[#fff1f3] px-5 py-8 sm:px-8 sm:py-10">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#c9435d]">
                      Love Story 01
                    </p>

                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-black/25">
                      3 phần quà
                    </p>
                  </div>

                  <div className="mt-8 text-center">
                    <p className="text-xl font-semibold tracking-[-0.03em] text-[#c9435d] sm:text-2xl">
                      Một câu chuyện chỉ dành cho hai người.
                    </p>

                    <img
                      src="/images/gifts/success.gif"
                      alt=""
                      className="mx-auto mt-5 h-28 w-28 object-contain sm:h-36 sm:w-36"
                    />
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-3">
                    {[
                      {
                        image:
                          '/images/gifts/gift-1.png',
                        label:
                          'Kỷ niệm',
                      },
                      {
                        image:
                          '/images/gifts/gift-2.png',
                        label:
                          'Âm nhạc',
                      },
                      {
                        image:
                          '/images/gifts/gift-3.png',
                        label:
                          'Bức thư',
                      },
                    ].map(
                      (item) => (
                        <div
                          key={
                            item.label
                          }
                          className="rounded-[20px] bg-white/80 p-3 text-center shadow-[0_8px_20px_rgba(60,25,35,0.04)] sm:p-4"
                        >
                          <img
                            src={
                              item.image
                            }
                            alt=""
                            className="mx-auto aspect-square w-full max-w-[100px] object-contain"
                          />

                          <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-black/32">
                            {
                              item.label
                            }
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section
          id="included"
          className="scroll-mt-24 bg-white py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-8 border-b border-black/[0.08] pb-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.19em] text-[#c9435d]">
                  Bên trong có gì
                </p>

                <h2 className="mt-3 max-w-md text-3xl font-black tracking-[-0.05em] sm:text-4xl">
                  Không phải một tấm thiệp tĩnh.
                </h2>
              </div>

              <p className="max-w-xl text-sm leading-7 text-black/45">
                Love Story 01 được chia thành từng phần để
                người nhận khám phá lần lượt thay vì nhìn
                thấy toàn bộ nội dung ngay từ đầu.
              </p>
            </div>

            <div className="grid md:grid-cols-2">
              {included.map(
                (item) => (
                  <div
                    key={
                      item.number
                    }
                    className="grid grid-cols-[54px_1fr] gap-4 border-b border-black/[0.08] py-7 md:odd:border-r md:odd:pr-8 md:even:pl-8"
                  >
                    <span className="text-xs font-black text-[#c9435d]">
                      {
                        item.number
                      }
                    </span>

                    <div>
                      <h3 className="text-base font-black tracking-[-0.025em]">
                        {
                          item.title
                        }
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-black/43">
                        {
                          item.text
                        }
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <section className="bg-[#181818] px-5 py-16 text-white sm:px-8 sm:py-20">
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0a0af]">
              Love Story 01
            </p>

            <h2 className="mt-4 max-w-2xl text-3xl font-black tracking-[-0.05em] sm:text-4xl">
              Biến template thành câu chuyện của riêng bạn.
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-7 text-white/48">
              Chỉnh ảnh, nhạc và lời nhắn. Thanh toán xong,
              Dearly mới tạo link riêng để gửi người nhận.
            </p>

            <button
              type="button"
              onClick={
                onPersonalize
              }
              className="mt-7 rounded-[15px] bg-[#f0a0af] px-7 py-3.5 text-sm font-black text-[#181818] transition hover:-translate-y-0.5 hover:bg-white"
            >
              Bắt đầu cá nhân hoá
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/[0.06] bg-white py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <BrandLogo
            onClick={
              onBackHome
            }
            imageClassName="h-9 w-auto"
          />

          <span className="text-[10px] font-semibold text-black/30">
            Digital gifts for special moments.
          </span>
        </div>
      </footer>
    </div>
  );
};
