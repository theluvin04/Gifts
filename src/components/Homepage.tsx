import React, {
  useEffect,
  useState,
} from 'react';
import { motion } from 'motion/react';

import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore';

import { db } from '../config/firebase';

import {
  DEFAULT_LOVE_TEMPLATE_CONFIG,
  TemplateConfig,
  getEffectiveTemplatePrice,
  getPublicTemplateConfig,
  getTemplateDiscountPercent,
  normalizeTemplateConfig,
} from '../services/templateService';

import {
  getTemplatePresentation,
} from '../templates/templatePresentation';

interface HomePageProps {
  onOpenLoveTemplate: () => void;
  onOpenTemplate: (
    templateId: string
  ) => void;
  onTrackOrder: () => void;
}

const formatVnd = (
  amount: number
) =>
  new Intl.NumberFormat(
    'vi-VN'
  ).format(amount) + 'đ';

const findPreviewImage = (
  template: TemplateConfig
) => {
  const scenes =
    template.visualEditor
      ?.scenes || [];

  for (const scene of scenes) {
    for (
      const element of
        scene.elements
    ) {
      if (
        (
          element.type ===
            'image' ||
          element.type ===
            'decor' ||
          element.type ===
            'photo-frame'
        ) &&
        element.src
      ) {
        return element.src;
      }
    }
  }

  return '/images/gifts/success.gif';
};

const TemplateCard:
React.FC<{
  template: TemplateConfig;
  preview: string;
  category: string;
  description: string;
  onOpen: () => void;
}> = ({
  template,
  preview,
  category,
  description,
  onOpen,
}) => {
  const price =
    getEffectiveTemplatePrice(
      template
    );

  const discount =
    getTemplateDiscountPercent(
      template
    );

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={{ y: -4 }}
      transition={{
        duration: 0.18,
      }}
      className="group overflow-hidden rounded-[22px] border border-black/[0.07] bg-white text-left shadow-[0_12px_35px_rgba(23,23,23,0.035)] transition hover:border-black/[0.12] hover:shadow-[0_20px_50px_rgba(23,23,23,0.07)]"
    >
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#f8edef] p-6">
        <img
          src={preview}
          alt={template.name}
          className="h-[80%] w-[80%] object-contain transition duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#c94861]">
          {category}
        </p>

        <div className="mt-2 flex items-start justify-between gap-4">
          <h3 className="min-w-0 truncate text-xl font-black tracking-[-0.035em]">
            {template.name}
          </h3>

          <span className="shrink-0 text-lg text-black/28 transition group-hover:translate-x-0.5 group-hover:text-[#c94861]">
            →
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-black/42">
          {description}
        </p>

        <div className="mt-4 flex items-center gap-2 border-t border-black/[0.06] pt-4">
          <span className="text-base font-black">
            {formatVnd(price)}
          </span>

          {discount > 0 && (
            <>
              <span className="text-xs text-black/25 line-through">
                {formatVnd(
                  template.basePrice
                )}
              </span>
              <span className="rounded-full bg-[#fdecef] px-2 py-1 text-[9px] font-black text-[#c94861]">
                -{discount}%
              </span>
            </>
          )}
        </div>
      </div>
    </motion.button>
  );
};

export const HomePage:
React.FC<HomePageProps> = ({
  onOpenLoveTemplate,
  onOpenTemplate,
  onTrackOrder,
}) => {
  const [
    loveTemplate,
    setLoveTemplate,
  ] = useState<TemplateConfig>(
    DEFAULT_LOVE_TEMPLATE_CONFIG
  );

  const [
    dynamicTemplates,
    setDynamicTemplates,
  ] = useState<TemplateConfig[]>(
    []
  );

  useEffect(() => {
    void getPublicTemplateConfig()
      .then(setLoveTemplate);
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const snapshot =
          await getDocs(
            query(
              collection(
                db,
                'templates'
              ),
              where(
                'status',
                '==',
                'available'
              ),
              limit(50)
            )
          );

        if (!active) return;

        setDynamicTemplates(
          snapshot.docs
            .map((item) =>
              normalizeTemplateConfig({
                ...item.data(),
                id: item.id,
              })
            )
            .filter(
              (item) =>
                item.id !==
                  'love-01' &&
                item.status ===
                  'available' &&
                Boolean(
                  item.visualEditor
                    ?.scenes
                    ?.length
                )
            )
            .sort((left, right) =>
              left.name.localeCompare(
                right.name,
                'vi'
              )
            )
        );
      } catch (error) {
        console.warn(
          'Public template catalog:',
          error
        );
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const scrollToTemplates = () => {
    document
      .getElementById(
        'templates'
      )
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
  };

  useEffect(() => {
    if (
      window.location.hash ===
      '#templates'
    ) {
      window.setTimeout(
        scrollToTemplates,
        0
      );
    }
  }, []);

  const lovePrice =
    getEffectiveTemplatePrice(
      loveTemplate
    );

  return (
    <div className="min-h-[100svh] bg-[#fffaf8] text-[#171717]">
      <main>
        <section className="border-b border-black/[0.055]">
          <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-16 lg:py-24">
            <div className="max-w-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c94861]">
                Digital gifts
              </p>

              <h1 className="mt-4 text-[44px] font-black leading-[0.98] tracking-[-0.055em] sm:text-[66px] lg:text-[78px]">
                Quà tặng
                <br />
                <span className="font-medium italic text-[#c94861]">
                  có câu chuyện.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-[15px] leading-7 text-black/48 sm:text-base">
                Chọn mẫu, thêm nội dung của riêng bạn và gửi bằng một đường link.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={
                    scrollToTemplates
                  }
                  className="min-h-12 rounded-[13px] bg-[#171717] px-6 text-sm font-black text-white transition hover:bg-[#c94861]"
                >
                  Xem templates
                </button>

                <button
                  type="button"
                  onClick={
                    onTrackOrder
                  }
                  className="min-h-12 rounded-[13px] border border-black/[0.09] bg-white px-5 text-sm font-bold text-black/52 transition hover:text-black/75"
                >
                  Tra cứu đơn
                </button>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-black/35">
                <span>Không cần cài app</span>
                <span>Mở bằng link</span>
                <span>Cá nhân hoá</span>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={
                onOpenLoveTemplate
              }
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="group mx-auto w-full max-w-[520px] overflow-hidden rounded-[28px] border border-black/[0.06] bg-white p-2 text-left shadow-[0_24px_70px_rgba(70,25,40,0.07)]"
            >
              <div className="rounded-[22px] bg-[#fff0f3] p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c94861]">
                    Love Story 01
                  </p>
                  <p className="text-xs font-black text-black/55">
                    {formatVnd(
                      lovePrice
                    )}
                  </p>
                </div>

                <img
                  src="/images/gifts/success.gif"
                  alt="Love Story 01"
                  className="mx-auto my-6 h-36 w-36 object-contain transition duration-500 group-hover:scale-[1.03] sm:h-44 sm:w-44"
                />

                <div className="flex items-center justify-between gap-4 border-t border-[#c94861]/10 pt-4">
                  <p className="text-sm font-bold text-black/55">
                    Ảnh · nhạc · lời nhắn
                  </p>
                  <span className="text-lg text-[#c94861]">
                    →
                  </span>
                </div>
              </div>
            </motion.button>
          </div>
        </section>

        <section
          id="templates"
          className="scroll-mt-20 bg-white"
        >
          <div className="mx-auto max-w-[1320px] px-5 py-14 sm:px-8 sm:py-20">
            <div className="flex flex-col gap-3 border-b border-black/[0.07] pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c94861]">
                  Templates
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-4xl">
                  Chọn mẫu phù hợp
                </h2>
              </div>

              <p className="max-w-sm text-sm leading-6 text-black/38">
                Mỗi mẫu có bố cục riêng, bạn chỉ thay nội dung cần thiết.
              </p>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {loveTemplate.status ===
                'available' && (
                <TemplateCard
                  template={
                    loveTemplate
                  }
                  preview="/images/gifts/success.gif"
                  category="Tình yêu"
                  description="Một website nhỏ với ảnh, nhạc và bức thư riêng."
                  onOpen={
                    onOpenLoveTemplate
                  }
                />
              )}

              {dynamicTemplates.map(
                (template) => {
                  const presentation =
                    getTemplatePresentation(
                      template
                    );

                  return (
                    <TemplateCard
                      key={
                        template.id
                      }
                      template={
                        template
                      }
                      preview={
                        findPreviewImage(
                          template
                        )
                      }
                      category={
                        presentation.category
                      }
                      description={
                        presentation.description
                      }
                      onOpen={() =>
                        onOpenTemplate(
                          template.id
                        )
                      }
                    />
                  );
                }
              )}
            </div>
          </div>
        </section>

        <section className="border-y border-black/[0.055] bg-[#fbf7f5]">
          <div className="mx-auto max-w-[1100px] px-5 py-14 sm:px-8 sm:py-18">
            <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c94861]">
                  Cách hoạt động
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.045em]">
                  3 bước là xong.
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ['01', 'Chọn mẫu'],
                  ['02', 'Thay nội dung'],
                  ['03', 'Thanh toán & gửi link'],
                ].map(
                  ([number, title]) => (
                    <div
                      key={number}
                      className="rounded-[18px] border border-black/[0.07] bg-white p-5"
                    >
                      <p className="text-[10px] font-black text-[#c94861]">
                        {number}
                      </p>
                      <p className="mt-6 text-sm font-black">
                        {title}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-5 py-7 text-xs text-black/30 sm:px-8">
          <span>Dearly</span>
          <span>Digital gifts</span>
        </div>
      </footer>
    </div>
  );
};
