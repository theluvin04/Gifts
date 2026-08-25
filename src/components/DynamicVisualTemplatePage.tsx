import React, { useEffect, useMemo, useState } from 'react';

import { BrandLogo } from './BrandLogo';
import { VisualSceneExperience } from '../engine';
import type { SceneElement } from '../engine';
import {
  getEffectiveTemplatePrice,
  getPublicTemplateConfigById,
  type TemplateConfig,
} from '../services/templateService';
import type { TemplateVisualEditorConfig } from '../templates/visualEditor';
import { getCustomerSlot } from '../templates/customerSlots';

interface Props {
  templateId: string;
  mode: 'product' | 'create';
  onBackHome: () => void;
  onStartPersonalize: () => void;
  onBackProduct: () => void;
  onCheckout: () => void;
}

const clone = <T,>(value: T): T =>
  JSON.parse(JSON.stringify(value));

const draftKey = (templateId: string) =>
  `dearly:visual-customer-draft:${templateId}`;

const loadDraft = (
  templateId: string,
  fallback: TemplateVisualEditorConfig
): TemplateVisualEditorConfig => {
  try {
    const raw = window.localStorage.getItem(
      draftKey(templateId)
    );

    if (!raw) return clone(fallback);

    const parsed = JSON.parse(raw);
    if (
      parsed &&
      Array.isArray(parsed.scenes) &&
      typeof parsed.initialSceneId === 'string'
    ) {
      return parsed;
    }
  } catch {
    // fallback below
  }

  return clone(fallback);
};

const saveDraft = (
  templateId: string,
  config: TemplateVisualEditorConfig
) => {
  try {
    window.localStorage.setItem(
      draftKey(templateId),
      JSON.stringify(config)
    );
  } catch {
    // local draft is best effort
  }
};

export const DynamicVisualTemplatePage: React.FC<Props> = ({
  templateId,
  mode,
  onBackHome,
  onStartPersonalize,
  onBackProduct,
  onCheckout,
}) => {
  const [template, setTemplate] = useState<TemplateConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<TemplateVisualEditorConfig | null>(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');

    void getPublicTemplateConfigById(templateId)
      .then((next) => {
        if (!active) return;

        if (
          !next.visible ||
          next.status !== 'available' ||
          !next.visualEditor?.enabled
        ) {
          setError('Template này chưa được phát hành.');
          return;
        }

        setTemplate(next);
        setDraft(
          loadDraft(
            templateId,
            next.visualEditor
          )
        );
      })
      .catch((loadError: any) => {
        if (!active) return;
        setError(
          loadError?.message ||
          'Không tải được template.'
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [templateId]);

  useEffect(() => {
    if (draft) {
      saveDraft(templateId, draft);
    }
  }, [draft, templateId]);

  const slots = useMemo(() => {
    if (!draft) return [];

    return draft.scenes.flatMap((scene) =>
      scene.elements
        .map((element) => ({
          sceneId: scene.id,
          element,
          slot: getCustomerSlot(element),
        }))
        .filter((item) => item.slot.kind !== 'none')
    );
  }, [draft]);

  const updateElement = (
    sceneId: string,
    elementId: string,
    updater: (element: SceneElement) => SceneElement
  ) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            scenes: current.scenes.map((scene) =>
              scene.id === sceneId
                ? {
                    ...scene,
                    elements: scene.elements.map((element) =>
                      element.id === elementId
                        ? updater(element)
                        : element
                    ),
                  }
                : scene
            ),
          }
        : current
    );
  };

  const readImage = (
    file: File,
    done: (value: string) => void
  ) => {
    const reader = new FileReader();
    reader.onload = () => done(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#fffaf8] text-sm font-bold text-black/45">
        Đang tải template...
      </main>
    );
  }

  if (error || !template || !draft) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#fffaf8] px-5">
        <div className="w-full max-w-sm rounded-[24px] border border-black/7 bg-white p-6 text-center">
          <p className="text-base font-black">Không mở được template</p>
          <p className="mt-2 text-sm text-black/40">{error || 'Template không tồn tại.'}</p>
          <button
            type="button"
            onClick={onBackHome}
            className="mt-5 rounded-[12px] bg-[#191919] px-5 py-3 text-sm font-black text-white"
          >
            Về trang chủ
          </button>
        </div>
      </main>
    );
  }

  const price = getEffectiveTemplatePrice(template);
  const formatVnd = (value: number) =>
    new Intl.NumberFormat('vi-VN').format(value) + 'đ';

  const hasLongPage = draft.scenes.some(
    (scene) =>
      (scene.minHeight || 0) >= 1200 &&
      (scene.maxWidth || 0) >= 1000
  );

  const phonePreviewShellClass = hasLongPage
    ? 'mx-auto max-h-[82svh] w-full max-w-[390px] overflow-y-auto overflow-x-hidden rounded-[28px] border border-black/7 bg-white shadow-[0_28px_80px_rgba(70,25,40,0.12)]'
    : 'mx-auto w-full max-w-[390px] overflow-hidden rounded-[28px] border border-black/7 bg-white shadow-[0_28px_80px_rgba(70,25,40,0.12)]';

  if (mode === 'product') {
    return (
      <div className="min-h-[100svh] bg-[#fffaf8] text-[#191919]">
        <header className="border-b border-black/6 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-8">
            <button type="button" onClick={onBackHome} className="text-xs font-black text-black/45">← Trang chủ</button>
            <BrandLogo onClick={onBackHome} imageClassName="h-10 w-auto" />
            <span className="text-xs font-black text-[#b83e57]">{formatVnd(price)}</span>
          </div>
        </header>

        <main className="mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-8 lg:py-16">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#b83e57]">Template</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-5xl">{template.name}</h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-black/45">
              Đây là mẫu thật được tạo trong Admin. Khách chỉ thay những ảnh/chữ bạn đã đánh dấu “Khách thay”.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={onStartPersonalize}
                className="rounded-[14px] bg-[#191919] px-6 py-3.5 text-sm font-black text-white"
              >
                Cá nhân hoá
              </button>
              <span className="text-sm font-black text-[#b83e57]">{formatVnd(price)}</span>
            </div>
          </div>

          <div className={phonePreviewShellClass}>
            <VisualSceneExperience
              scenes={template.visualEditor!.scenes}
              initialSceneId={template.visualEditor!.initialSceneId}
              mobileOverride
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-[#f5f3f2] text-[#191919]">
      <header className="sticky top-0 z-40 border-b border-black/6 bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[64px] max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-8">
          <button type="button" onClick={onBackProduct} className="text-xs font-black text-black/45">← Mẫu</button>
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-black">{template.name}</p>
            <p className="text-[9px] text-black/30">{slots.length} nội dung có thể thay</p>
          </div>
          <button
            type="button"
            onClick={onCheckout}
            className="rounded-[11px] bg-[#191919] px-4 py-2.5 text-[10px] font-black text-white"
          >
            Tiếp tục · {formatVnd(price)}
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-4 p-4 sm:p-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-6">
        <aside className="rounded-[18px] border border-black/7 bg-white p-4 lg:max-h-[calc(100svh-105px)] lg:overflow-y-auto">
          <h2 className="text-base font-black">Thay nội dung của bạn</h2>
          <p className="mt-1 text-[10px] leading-5 text-black/35">Bố cục, hiệu ứng và tài nguyên trang trí đã được khoá theo mẫu.</p>

          <div className="mt-4 space-y-3">
            {slots.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-black/10 bg-[#faf9f8] p-4 text-[10px] leading-5 text-black/40">
                Template này chưa có trường nào được Admin đánh dấu cho khách thay.
              </div>
            ) : (
              slots.map(({ sceneId, element, slot }, index) => (
                <div key={`${sceneId}-${element.id}`} className="rounded-[12px] border border-black/7 bg-[#faf9f8] p-3">
                  <p className="text-[8px] font-black uppercase tracking-[0.08em] text-black/25">{index + 1}. {slot.label || element.name || element.id}</p>

                  {slot.kind === 'text' && (
                    <textarea
                      value={
                        element.type === 'text'
                          ? element.text
                          : element.type === 'button'
                            ? element.label
                            : ''
                      }
                      onChange={(event) =>
                        updateElement(sceneId, element.id, (current) => {
                          if (current.type === 'text') return { ...current, text: event.target.value };
                          if (current.type === 'button') return { ...current, label: event.target.value };
                          return current;
                        })
                      }
                      className="mt-2 min-h-[82px] w-full rounded-[9px] border border-black/9 bg-white px-3 py-2.5 text-[11px] outline-none focus:border-[#cf5068]/40"
                    />
                  )}

                  {slot.kind === 'image' && (
                    <label className="mt-2 block cursor-pointer rounded-[10px] border border-dashed border-[#cf5068]/30 bg-white p-3 text-center text-[9px] font-black text-[#a73551]">
                      Chọn ảnh của bạn
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;

                          readImage(file, (url) =>
                            updateElement(sceneId, element.id, (current) => {
                              if (current.type === 'image' || current.type === 'photo-frame') {
                                return {
                                  ...current,
                                  src: url,
                                  alt: file.name,
                                } as SceneElement;
                              }

                              return current;
                            })
                          );
                        }}
                      />
                    </label>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>

        <section className="flex min-h-[650px] items-center justify-center rounded-[18px] border border-black/7 bg-[#dedbd8] p-4 sm:p-8">
          <div className={phonePreviewShellClass.replace('border-black/7', 'border-black/8').replace('shadow-[0_28px_80px_rgba(70,25,40,0.12)]', 'shadow-[0_26px_80px_rgba(0,0,0,0.14)]')}>
            <VisualSceneExperience
              scenes={draft.scenes}
              initialSceneId={draft.initialSceneId}
              mobileOverride
            />
          </div>
        </section>
      </main>
    </div>
  );
};
