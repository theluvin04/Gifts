import React from 'react';

import {
  ArrowRight,
  Image as ImageIcon,
  Mail,
  Music2,
  Sparkles,
} from 'lucide-react';

interface ProductDetailPageProps {
  onBackHome: () => void;
  onPersonalize: () => void;
}

const features = [
  {
    icon: ImageIcon,
    title: 'Ảnh kỷ niệm',
  },
  {
    icon: Music2,
    title: 'Nhạc riêng',
  },
  {
    icon: Mail,
    title: 'Bức thư',
  },
  {
    icon: Sparkles,
    title: 'Tương tác',
  },
];

export const ProductDetailPage:
React.FC<ProductDetailPageProps> = ({
  onPersonalize,
}) => {
  return (
    <div className="min-h-[100svh] bg-[#fffaf8] text-[#171717]">
      <main>
        <section className="border-b border-black/[0.055]">
          <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-12 sm:px-8 sm:py-18 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16 lg:py-20">
            <div className="max-w-xl">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[#fdecef] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#c94861]">
                  Tình yêu
                </span>
                <span className="rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-black/35">
                  Website gift
                </span>
              </div>

              <h1 className="mt-5 text-[44px] font-black leading-[0.98] tracking-[-0.055em] sm:text-[64px]">
                Love Story 01
              </h1>

              <p className="mt-5 max-w-lg text-[15px] leading-7 text-black/46 sm:text-base">
                Ảnh, nhạc và lời nhắn của hai người trong một website nhỏ.
              </p>

              <div className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {features.map(
                  ({
                    icon: Icon,
                    title,
                  }) => (
                    <div
                      key={title}
                      className="rounded-[15px] border border-black/[0.07] bg-white p-3.5"
                    >
                      <Icon className="h-4 w-4 text-[#c94861]" />
                      <p className="mt-4 text-xs font-black text-black/62">
                        {title}
                      </p>
                    </div>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={
                  onPersonalize
                }
                className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-[13px] bg-[#171717] px-6 text-sm font-black text-white transition hover:bg-[#c94861]"
              >
                Cá nhân hoá
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mx-auto w-full max-w-[560px] rounded-[28px] border border-black/[0.06] bg-white p-2 shadow-[0_24px_70px_rgba(60,25,35,0.07)]">
              <div className="rounded-[22px] bg-[#fff0f3] p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c94861]">
                    Love Story 01
                  </p>
                  <p className="text-[10px] font-bold text-black/28">
                    3 phần quà
                  </p>
                </div>

                <p className="mt-8 text-center text-xl font-semibold tracking-[-0.03em] text-[#c94861] sm:text-2xl">
                  Một câu chuyện chỉ dành cho hai người.
                </p>

                <img
                  src="/images/gifts/success.gif"
                  alt="Love Story 01"
                  className="mx-auto my-6 h-32 w-32 object-contain sm:h-40 sm:w-40"
                />

                <div className="grid grid-cols-3 gap-2.5">
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
                        className="rounded-[16px] bg-white/85 p-3 text-center"
                      >
                        <img
                          src={
                            item.image
                          }
                          alt=""
                          className="mx-auto h-14 w-14 object-contain sm:h-16 sm:w-16"
                        />
                        <p className="mt-2 text-[9px] font-black uppercase tracking-[0.12em] text-black/30">
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
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-[1100px] px-5 py-14 sm:px-8 sm:py-18">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c94861]">
                  Có gì bên trong
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.045em]">
                  Đủ để kể một câu chuyện.
                </h2>
              </div>

              <div className="grid overflow-hidden rounded-[20px] border border-black/[0.07] sm:grid-cols-2">
                {[
                  [
                    '01',
                    'Màn mở đầu',
                    'Một điểm chạm nhỏ trước khi mở món quà.',
                  ],
                  [
                    '02',
                    'Album ảnh',
                    'Ảnh kỷ niệm được sắp sẵn theo bố cục.',
                  ],
                  [
                    '03',
                    'Âm nhạc',
                    'Thêm bài hát hoặc video gắn với câu chuyện.',
                  ],
                  [
                    '04',
                    'Bức thư',
                    'Lời nhắn riêng dành cho người nhận.',
                  ],
                ].map(
                  ([
                    number,
                    title,
                    description,
                  ], index) => (
                    <div
                      key={number}
                      className={[
                        'p-5 sm:p-6',
                        index % 2 === 0
                          ? 'sm:border-r sm:border-black/[0.07]'
                          : '',
                        index < 2
                          ? 'border-b border-black/[0.07]'
                          : '',
                      ].join(' ')}
                    >
                      <p className="text-[10px] font-black text-[#c94861]">
                        {number}
                      </p>
                      <h3 className="mt-4 text-base font-black">
                        {title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-6 text-black/40">
                        {
                          description
                        }
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
