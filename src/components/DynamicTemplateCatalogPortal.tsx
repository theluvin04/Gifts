import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore';

import { db } from '../config/firebase';
import {
  getEffectiveTemplatePrice,
  getTemplateDiscountPercent,
  normalizeTemplateConfig,
  type TemplateConfig,
} from '../services/templateService';
import { getTemplatePresentation } from '../templates/templatePresentation';

interface Props {
  onOpenTemplate: (templateId: string) => void;
}

const formatVnd = (amount: number) =>
  new Intl.NumberFormat('vi-VN').format(amount) + 'đ';

const findPreviewImage = (
  template: TemplateConfig
) => {
  const scenes = template.visualEditor?.scenes || [];

  for (const scene of scenes) {
    for (const element of scene.elements) {
      if (
        (element.type === 'image' ||
          element.type === 'decor' ||
          element.type === 'photo-frame') &&
        element.src
      ) {
        return element.src;
      }
    }
  }

  return '/images/gifts/success.gif';
};

export const DynamicTemplateCatalogPortal: React.FC<Props> = ({
  onOpenTemplate,
}) => {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [templates, setTemplates] = useState<TemplateConfig[]>([]);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    let attempts = 0;

    const resolveTarget = () => {
      if (cancelled) return;

      const section = document.querySelector<HTMLElement>('#templates');
      const grids = section
        ? Array.from(
            section.querySelectorAll<HTMLElement>(
              ':scope > div > .grid'
            )
          )
        : [];

      const next = grids[grids.length - 1] || null;

      if (next) {
        Array.from(next.children).forEach((child, index) => {
          if (index === 0) return;

          const text = child.textContent || '';
          if (
            text.includes('Sắp ra mắt') ||
            text.includes('Coming soon')
          ) {
            (child as HTMLElement).style.display = 'none';
          }
        });

        setTarget(next);
        return;
      }

      attempts += 1;
      if (attempts < 120) {
        frame = window.requestAnimationFrame(resolveTarget);
      }
    };

    resolveTarget();

    return () => {
      cancelled = true;
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const snapshot = await getDocs(
          query(
            collection(db, 'templates'),
            where('visible', '==', true),
            limit(50)
          )
        );

        if (!active) return;

        const next = snapshot.docs
          .map((item) =>
            normalizeTemplateConfig({
              ...item.data(),
              id: item.id,
            })
          )
          .filter((item) => item.visible && item.id !== 'love-01')
          .sort((left, right) =>
            left.name.localeCompare(right.name, 'vi')
          );

        setTemplates(next);
      } catch (error) {
        console.warn('Public template catalog fallback:', error);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const cards = useMemo(
    () =>
      templates.map((template) => {
        const price = getEffectiveTemplatePrice(template);
        const discount = getTemplateDiscountPercent(template);
        const preview = findPreviewImage(template);
        const presentation = getTemplatePresentation(template);
        const canOpen =
          template.status === 'available' &&
          Boolean(template.visualEditor?.scenes?.length);

        return (
          <button
            key={template.id}
            type="button"
            disabled={!canOpen}
            onClick={() => onOpenTemplate(template.id)}
            className="group overflow-hidden rounded-[30px] border border-black/[0.07] bg-[#fffafb] p-2 text-left shadow-[0_12px_35px_rgba(23,23,23,0.04)] transition hover:-translate-y-1 hover:border-black/[0.12] hover:shadow-[0_24px_55px_rgba(23,23,23,0.08)] disabled:cursor-default disabled:opacity-60"
          >
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[24px] bg-[#f7edf0] p-6">
              <img
                src={preview}
                alt={template.name}
                className="h-[82%] w-[82%] object-contain transition duration-500 group-hover:scale-[1.035]"
              />

              {template.status === 'coming_soon' && (
                <span className="absolute right-4 top-4 rounded-full bg-white/90 px-2.5 py-1.5 text-[8px] font-black uppercase tracking-[0.12em] text-black/38">
                  Sắp ra mắt
                </span>
              )}
            </div>

            <div className="px-4 pb-5 pt-4 sm:px-5 sm:pb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#d94763]">
                    {presentation.category}
                  </p>
                  <h3 className="mt-1.5 truncate text-xl font-black tracking-[-0.035em] text-[#171717]">
                    {template.name}
                  </h3>
                </div>

                {canOpen && (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-black/[0.08] bg-white text-base font-medium text-black/45 transition group-hover:border-[#d94763]/25 group-hover:bg-[#fff1f4] group-hover:text-[#d94763]">
                    →
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-base font-black text-[#171717]">
                  {formatVnd(price)}
                </span>

                {discount > 0 && (
                  <>
                    <span className="text-xs text-black/28 line-through">
                      {formatVnd(template.basePrice)}
                    </span>
                    <span className="rounded-[8px] bg-[#fdecef] px-2 py-1 text-[9px] font-bold text-[#c93f59]">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>

              <p className="mt-3 line-clamp-2 text-sm leading-6 text-black/48">
                {presentation.description}
              </p>
            </div>
          </button>
        );
      }),
    [templates, onOpenTemplate]
  );

  if (!target || cards.length === 0) return null;

  return createPortal(<>{cards}</>, target);
};
