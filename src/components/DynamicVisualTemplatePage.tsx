import React, { useEffect, useMemo, useState } from 'react';

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

const formatVnd = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(value) + 'đ';

const getTemplateCategory = (template: TemplateConfig) => {
  const id = template.id.toLowerCase();

  if (id.includes('birthday')) return 'Sinh nhật';
  if (id.includes('wedding') || id.includes('invitation')) return 'Cưới';
  if (id.includes('anniversary')) return 'Kỷ niệm';
  if (id.includes('graduation')) return 'Tốt nghiệp';
  if (id.includes('love')) return 'Tình yêu';
  return 'Template';
};

const getIntroCopy = (
  template: TemplateConfig,
  customizableCount: number
) => {
  const category = getTemplateCategory(template);

  if (category === 'Tình yêu') {
    return 'Ảnh, nhạc và lời nhắn trong một website nhỏ dành riêng cho người nhận.';
  }

  if (category === 'Sinh nhật') {
    return 'Website quà sinh nhật để thay ảnh và lời chúc của riêng bạn.';
  }

  if (category === 'Cưới') {
    return 'Một website tinh gọn để kể câu chuyện và chia sẻ thông tin ngày cưới.';
  }

  if (category === 'Kỷ niệm') {
    return 'Ảnh và lời nhắn được ghép thành một câu chuyện nhỏ cho dịp kỷ niệm.';
  }

  return `Website cá nhân hoá với ${customizableCount} nội dung có thể thay.`;
};

const buildHeroChecklist = (
  draft: TemplateVisualEditorConfig
) => {
  const items = draft.scenes
    .flatMap((scene) =>
      scene.elements
        .map((element) => getCustomerSlot(element))
        .filter((slot) => slot.kind !== 'none')
        .map((slot) => slot.label || 'Nội dung tuỳ chỉnh')
    )
    .filter(Boolean);

  return Array.from(new Set(items)).slice(0, 4);
};

const buildHighlights = (
  template: TemplateConfig,
  draft: TemplateVisualEditorConfig
) => {
  const slots = draft.scenes.flatMap((scene) =>
    scene.elements
      .map((element) => ({
        element,
        slot: getCustomerSlot(element),
      }))
      .filter((item) => item.slot.kind !== 'none')
  );

  const hasImage = slots.some((item) => item.slot.kind === 'image');
  const hasText = slots.some((item) => item.slot.kind === 'text');
  const sceneCount = draft.scenes.length;
  const category = getTemplateCategory(template);

  const items = [
    {
      index: '01',
      title: sceneCount > 1 ? 'Nhiều phần nội dung' : 'Màn mở đầu tương tác',
      description:
        sceneCount > 1
          ? `${sceneCount} phần nội dung được mở theo đúng thứ tự.`
          : 'Màn mở đầu gọn trước khi vào nội dung chính.',
    },
    {
      index: '02',
      title: hasImage ? 'Ảnh cá nhân hoá' : 'Bố cục có sẵn',
      description: hasImage
        ? 'Thay ảnh mà không làm vỡ bố cục.'
        : 'Bố cục được giữ sẵn, chỉ cần thay nội dung.',
    },
    {
      index: '03',
      title:
        category === 'Tình yêu'
          ? 'Âm nhạc / cảm xúc riêng'
          : 'Nội dung riêng của khách',
      description: hasText
        ? 'Thay lời chúc và nội dung cần thiết.'
        : 'Tối ưu để xem gọn trên điện thoại.',
    },
    {
      index: '04',
      title: 'Giữ nguyên trải nghiệm mẫu',
      description:
        'Bố cục và hiệu ứng được giữ nguyên khi khách chỉnh.',
    },
  ];

  return items;
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

  if (mode === 'product') {
    const heroChecklist = buildHeroChecklist(draft);
    const highlights = buildHighlights(template, draft);
    const customizableCount = slots.length;
    const sceneCount = draft.scenes.length;

    return (
      <div className="min-h-[100svh] bg-[#fffaf8] text-[#191919]">
        <main className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
          <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(460px,560px)] lg:items-center lg:gap-14">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-[10px] bg-[#fdecef] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#c9455f]">
                  {getTemplateCategory(template)}
                </span>
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-[-0.05em] sm:text-5xl lg:text-[60px]">
                {template.name}
              </h1>

              <p className="mt-5 max-w-[640px] text-[15px] leading-8 text-black/45">
                {getIntroCopy(template, customizableCount)}
              </p>

              <div className="mt-8 grid gap-x-6 gap-y-0 border-y border-black/8 py-3 sm:grid-cols-2">
                {heroChecklist.length > 0 ? (
                  heroChecklist.map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex items-start gap-3 border-b border-black/6 py-3 text-sm text-black/65 sm:border-b-0"
                    >
                      <span className="w-6 shrink-0 text-[10px] font-black text-[#c9455f]">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      <span className="leading-6">{item}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-3 text-sm text-black/45">
                    Mẫu này giữ sẵn bố cục để khách thay nội dung nhanh hơn.
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onStartPersonalize}
                  className="min-h-12 rounded-[13px] bg-[#171717] px-6 text-sm font-black text-white transition hover:bg-[#cf5068]"
                >
                  Cá nhân hoá
                </button>
                <span className="text-lg font-black text-[#c94861]">
                  {formatVnd(price)}
                </span>
              </div>
            </div>

            <div className="rounded-[34px] border border-black/[0.06] bg-[#f8edf0] p-4 shadow-[0_22px_55px_rgba(72,22,38,0.07)] sm:p-6">
              <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#c9455f]">
                <span>{template.name}</span>
                <span className="text-black/28">{sceneCount} phần quà</span>
              </div>

              <p className="mt-7 text-center text-2xl font-medium tracking-[-0.03em] text-[#d94e68] sm:text-[34px]">
                Một câu chuyện chỉ dành cho người nhận.
              </p>

              <div className="mt-8 flex justify-center">
                <div className="max-h-[760px] w-full max-w-[400px] overflow-y-auto overflow-x-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_30px_80px_rgba(70,25,40,0.12)]">
                  <VisualSceneExperience
                    scenes={template.visualEditor!.scenes}
                    initialSceneId={template.visualEditor!.initialSceneId}
                    mobileOverride
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-16 border-t border-black/8 pt-14 sm:mt-20 sm:pt-16">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c9455f]">
                  Bên trong có gì
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] sm:text-5xl">
                  Có gì trong mẫu
                </h2>
              </div>

              <div className="flex items-end lg:justify-end">
                <p className="max-w-[520px] text-sm leading-7 text-black/40">
                  Chỉ thay nội dung cần thiết, bố cục và hiệu ứng vẫn được giữ nguyên.
                </p>
              </div>
            </div>

            <div className="mt-10 grid overflow-hidden rounded-[24px] border border-black/8 bg-white sm:grid-cols-2">
              {highlights.slice(0, 4).map((item, index) => (
                <div
                  key={item.index}
                  className={[
                    'px-6 py-6 sm:px-8 sm:py-7',
                    index % 2 === 0 ? 'sm:border-r sm:border-black/8' : '',
                    index < 2 ? 'border-b border-black/8' : '',
                  ].join(' ')}
                >
                  <div className="grid gap-3 sm:grid-cols-[34px_1fr] sm:gap-4">
                    <span className="text-[11px] font-black text-[#c9455f]">{item.index}</span>
                    <div>
                      <h3 className="text-lg font-black tracking-[-0.03em] text-[#171717]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-black/42">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-[#f5f3f2] text-[#191919]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 pb-1 pt-5 sm:px-6 sm:pt-7">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#c94861]">
            Cá nhân hoá
          </p>
          <h1 className="mt-1 truncate text-xl font-black tracking-[-0.035em] sm:text-2xl">
            {template.name}
          </h1>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={onBackProduct}
            className="min-h-11 rounded-[11px] border border-black/[0.09] bg-white px-4 text-xs font-bold text-black/50"
          >
            Về mẫu
          </button>
          <button
            type="button"
            onClick={onCheckout}
            className="min-h-11 rounded-[11px] bg-[#171717] px-4 text-xs font-black text-white"
          >
            Thanh toán · {formatVnd(price)}
          </button>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl gap-4 px-4 pb-24 pt-4 sm:px-6 sm:pb-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-6">
        <aside className="rounded-[18px] border border-black/7 bg-white p-4 lg:max-h-[calc(100svh-105px)] lg:overflow-y-auto">
          <h2 className="text-base font-black">Nội dung</h2>
          <p className="mt-1 text-xs text-black/35">Chỉ những mục bên dưới có thể thay.</p>

          <div className="mt-4 space-y-3">
            {slots.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-black/10 bg-[#faf9f8] p-4 text-xs leading-5 text-black/40">
                Template này chưa có trường nào được Admin đánh dấu cho khách thay.
              </div>
            ) : (
              slots.map(({ sceneId, element, slot }, index) => (
                <div key={`${sceneId}-${element.id}`} className="rounded-[14px] border border-black/7 bg-[#faf9f8] p-3.5">
                  <p className="text-[11px] font-black text-black/60">{index + 1}. {slot.label || element.name || element.id}</p>

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
                      className="mt-2 min-h-[96px] w-full rounded-[11px] border border-black/9 bg-white px-3.5 py-3 text-[16px] leading-6 outline-none transition focus:border-[#cf5068]/40 focus:ring-2 focus:ring-[#cf5068]/10 sm:text-sm"
                    />
                  )}

                  {slot.kind === 'image' && (
                    <label className="mt-2 flex min-h-11 cursor-pointer items-center justify-center rounded-[11px] border border-dashed border-[#cf5068]/30 bg-white p-3 text-center text-xs font-black text-[#a73551]">
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

        <section className="flex min-h-[620px] items-center justify-center rounded-[18px] border border-black/7 bg-[#dedbd8] p-3 sm:p-6">
          <div className="max-h-[calc(100svh-120px)] w-full max-w-[390px] overflow-y-auto overflow-x-hidden rounded-[28px] border border-black/8 bg-white shadow-[0_26px_80px_rgba(0,0,0,0.14)]">
            <VisualSceneExperience
              scenes={draft.scenes}
              initialSceneId={draft.initialSceneId}
              mobileOverride
            />
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.07] bg-white/95 p-3 backdrop-blur-xl sm:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-[auto_1fr] gap-2">
          <button
            type="button"
            onClick={onBackProduct}
            className="min-h-12 rounded-[13px] border border-black/[0.09] bg-white px-4 text-xs font-bold text-black/55"
          >
            Về mẫu
          </button>
          <button
            type="button"
            onClick={onCheckout}
            className="min-h-12 rounded-[13px] bg-[#171717] px-4 text-sm font-black text-white"
          >
            Thanh toán · {formatVnd(price)}
          </button>
        </div>
      </div>
    </div>
  );
};
