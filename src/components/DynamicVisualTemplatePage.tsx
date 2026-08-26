import React, { useEffect, useMemo, useState } from 'react';

import { VisualSceneExperience } from '../engine';
import type { SceneElement } from '../engine';
import {
  getCachedTemplateConfigById,
  getEffectiveTemplatePrice,
  getPublicTemplateConfigById,
  type TemplateConfig,
} from '../services/templateService';
import type { TemplateVisualEditorConfig } from '../templates/visualEditor';
import {
  getCustomerImageSources,
  getCustomerSlot,
  replaceCustomerImageSlot,
} from '../templates/customerSlots';
import {
  PersonalizePageShell,
  PersonalizeInput,
  PersonalizeSectionHeader,
  PersonalizeTextarea,
  type PersonalizeTab,
} from './PersonalizePageShell';

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

const mergeCustomerValues = (
  latest: TemplateVisualEditorConfig,
  saved: TemplateVisualEditorConfig
): TemplateVisualEditorConfig => {
  const next = clone(latest);
  const savedScenes = new Map(
    saved.scenes.map((scene) => [scene.id, scene])
  );

  next.scenes = next.scenes.map((scene) => {
    const savedScene = savedScenes.get(scene.id);
    if (!savedScene) return scene;

    const savedElements = new Map(
      savedScene.elements.map((element) => [element.id, element])
    );

    return {
      ...scene,
      elements: scene.elements.map((element) => {
        const slot = getCustomerSlot(element);
        const savedElement = savedElements.get(element.id);

        if (!savedElement || slot.kind === 'none') return element;

        if (
          slot.kind === 'text' &&
          element.type === savedElement.type
        ) {
          if (element.type === 'text' && savedElement.type === 'text') {
            return { ...element, text: savedElement.text };
          }
          if (element.type === 'button' && savedElement.type === 'button') {
            return { ...element, label: savedElement.label };
          }
        }

        if (
          slot.kind === 'image' &&
          (element.type === 'image' || element.type === 'photo-frame') &&
          (savedElement.type === 'image' || savedElement.type === 'photo-frame')
        ) {
          return {
            ...element,
            src: savedElement.src,
            mobileSrc: savedElement.mobileSrc,
            ...(element.type === 'photo-frame' && savedElement.type === 'photo-frame'
              ? {
                  photos: savedElement.photos,
                  mobilePhotos: savedElement.mobilePhotos,
                }
              : {}),
            alt: savedElement.alt,
          } as SceneElement;
        }

        if (
          slot.kind === 'youtube' &&
          element.type === 'custom' &&
          savedElement.type === 'custom'
        ) {
          return {
            ...element,
            data: {
              ...element.data,
              youtubeUrl: savedElement.data?.youtubeUrl || '',
            },
          };
        }

        return element;
      }),
    };
  });

  return next;
};

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
      return mergeCustomerValues(fallback, parsed);
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

const getTemplateKind = (template: TemplateConfig) => {
  const id = template.id.toLowerCase();

  if (
    id.includes('story') ||
    id.includes('letter') ||
    id.includes('invitation') ||
    id.includes('love') ||
    id.includes('birthday')
  ) {
    return 'Website cá nhân hoá';
  }

  return 'Digital template';
};

const getIntroCopy = (
  template: TemplateConfig,
  customizableCount: number
) => {
  const category = getTemplateCategory(template);

  if (category === 'Tình yêu') {
    return 'Một website nhỏ dành riêng cho một người: ảnh, âm nhạc, câu hỏi và lời nhắn được ghép thành một trải nghiệm duy nhất.';
  }

  if (category === 'Sinh nhật') {
    return 'Một mẫu quà sinh nhật dạng website mini. Khách có thể thay ảnh và lời chúc để biến nó thành món quà thật sự dành riêng cho người nhận.';
  }

  if (category === 'Cưới') {
    return 'Một trải nghiệm web tinh gọn để kể câu chuyện, chia sẻ thông tin và tạo cảm giác trang trọng hơn một tấm thiệp tĩnh.';
  }

  if (category === 'Kỷ niệm') {
    return 'Một câu chuyện số được ghép từ ảnh, chữ và tương tác nhỏ để lưu lại một dịp đặc biệt theo cách cảm xúc hơn.';
  }

  return `Mẫu website cá nhân hoá với ${customizableCount} nội dung có thể thay để khách biến nó thành món quà của riêng mình.`;
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

  return Array.from(new Set(items)).slice(0, 6);
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
  const hasYouTube = slots.some((item) => item.slot.kind === 'youtube');
  const sceneCount = draft.scenes.length;
  const category = getTemplateCategory(template);

  const items = [
    {
      index: '01',
      title: sceneCount > 1 ? 'Nhiều phần nội dung' : 'Màn mở đầu tương tác',
      description:
        sceneCount > 1
          ? `Người nhận có thể đi qua ${sceneCount} phần nội dung theo đúng thứ tự bạn thiết kế.`
          : 'Một trang đầu gọn gàng để mở câu chuyện trước khi đi vào nội dung chính.',
    },
    {
      index: '02',
      title: hasImage ? 'Ảnh cá nhân hoá' : 'Bố cục có sẵn',
      description: hasImage
        ? 'Khách thay ảnh trực tiếp trên mẫu mà vẫn giữ nguyên bố cục và hiệu ứng.'
        : 'Mẫu giữ sẵn cấu trúc để khách chỉ cần điền đúng nội dung cần đổi.',
    },
    {
      index: '03',
      title:
        category === 'Tình yêu'
          ? 'Âm nhạc / cảm xúc riêng'
          : 'Nội dung riêng của khách',
      description: hasYouTube
        ? 'Khách có thể thay link YouTube ngay trên mẫu; video mới được cập nhật trực tiếp trong trải nghiệm.'
        : hasText
        ? 'Các đoạn chữ, lời chúc hoặc CTA có thể chỉnh ngay trước khi thanh toán.'
        : 'Nội dung được giữ tinh gọn để tối ưu trải nghiệm xem trên điện thoại.',
    },
    {
      index: '04',
      title: 'Giữ nguyên trải nghiệm mẫu',
      description:
        'Admin khoá bố cục, hiệu ứng và tài nguyên trang trí để khách sửa mà không phá bố cục.',
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
  const [template, setTemplate] = useState<TemplateConfig | null>(
    () => getCachedTemplateConfigById(templateId)
  );
  const [draft, setDraft] = useState<TemplateVisualEditorConfig | null>(() => {
    const cached = getCachedTemplateConfigById(templateId);
    if (cached?.visualEditor) {
      return loadDraft(templateId, cached.visualEditor);
    }
    return null;
  });
  const [loading, setLoading] = useState(
    () => !getCachedTemplateConfigById(templateId)
  );
  const [error, setError] = useState('');
  const [activeSceneId, setActiveSceneId] = useState('');
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const cached = getCachedTemplateConfigById(templateId);
    if (cached) {
      setTemplate(cached);
      if (cached.visualEditor) {
        setDraft((curr) => curr || loadDraft(templateId, cached.visualEditor!));
      }
      setLoading(false);
    } else {
      setLoading(true);
    }
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
        setDraft(loadDraft(templateId, next.visualEditor!));
      })
      .catch((loadError: any) => {
        if (!active) return;
        if (!cached) {
          setError(
            loadError?.message ||
            'Không tải được template.'
          );
        }
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

  const customerScenes = useMemo(() => {
    if (!draft) return [];

    return draft.scenes
      .map((scene, sceneIndex) => ({
        scene,
        label:
          (scene as any).title ||
          (scene as any).name ||
          `Phần ${sceneIndex + 1}`,
        slots: scene.elements
          .map((element) => ({
            sceneId: scene.id,
            element,
            slot: getCustomerSlot(element),
          }))
          .filter((item) => item.slot.kind !== 'none'),
      }))
      .filter((item) => item.slots.length > 0);
  }, [draft]);

  useEffect(() => {
    if (customerScenes.length === 0) {
      setActiveSceneId('');
      return;
    }

    if (
      !customerScenes.some(
        (item) => item.scene.id === activeSceneId
      )
    ) {
      setActiveSceneId(customerScenes[0].scene.id);
    }
  }, [customerScenes, activeSceneId]);

  const personalizeTabs = useMemo<PersonalizeTab[]>(
    () =>
      customerScenes.map((item) => ({
        id: item.scene.id,
        label: item.label,
      })),
    [customerScenes]
  );

  const activeCustomerScene =
    customerScenes.find(
      (item) => item.scene.id === activeSceneId
    ) || customerScenes[0];

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
                <span className="rounded-[10px] border border-black/8 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-black/40">
                  {getTemplateKind(template)}
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

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onStartPersonalize}
                  className="rounded-[14px] bg-[#cf5068] px-7 py-3.5 text-sm font-black text-white shadow-[0_16px_32px_rgba(207,80,104,0.18)] transition hover:-translate-y-0.5"
                >
                  Cá nhân hoá →
                </button>
              </div>

              <p className="mt-4 max-w-[640px] text-[11px] leading-6 text-black/28">
                Nội dung khách tự chỉnh không được mở xem trước toàn bộ. Khi thanh toán xong, khách sẽ tiếp tục chỉnh nội dung ở bước tiếp theo.
              </p>
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
                <div className="aspect-[9/16] w-full max-w-[380px] overflow-hidden rounded-[26px] border-[6px] border-[#181818] bg-white shadow-[0_24px_70px_rgba(70,25,40,0.16)]">
                  <VisualSceneExperience
                    scenes={template.visualEditor!.scenes}
                    initialSceneId={template.visualEditor!.initialSceneId}
                    mobileOverride
                    containViewport
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
                  Không chỉ là một mẫu web.
                </h2>
              </div>

              <div>
                <p className="max-w-[620px] text-[15px] leading-8 text-black/45">
                  {template.name} được thiết kế để người nhận khám phá nội dung theo đúng nhịp mà bạn muốn. Ảnh, chữ và các điểm chạm đều có thể thay mà vẫn giữ nguyên giao diện chung của website.
                </p>
              </div>
            </div>

            <div className="mt-10 grid overflow-hidden rounded-[24px] border border-black/8 bg-white sm:grid-cols-2">
              {highlights.map((item, index) => (
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
    <PersonalizePageShell
      title={template.name}
      tabs={personalizeTabs}
      activeTab={activeCustomerScene?.scene.id || ''}
      onTabChange={setActiveSceneId}
      primaryAction={{
        label: `Tiếp tục · ${formatVnd(price)}`,
        onClick: onCheckout,
      }}
      secondaryActions={[
        {
          label: 'Khôi phục',
          onClick: () =>
            setDraft(
              clone(template.visualEditor!)
            ),
        },
        {
          label: 'Về mẫu',
          onClick: onBackProduct,
        },
      ]}
    >
      {!activeCustomerScene ? (
        <div className="rounded-[14px] border border-dashed border-black/10 bg-[#faf9f8] p-8 text-center">
          <p className="text-sm font-black text-black/55">
            Mẫu này chưa có nội dung cho khách thay.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_370px] lg:items-start">
          <div>
            <PersonalizeSectionHeader
              title={activeCustomerScene.label}
              hint="Điền nội dung bên dưới. Thay đổi được tự lưu và cập nhật ngay trên bản xem trước."
            />

            <button
              type="button"
              onClick={() => setMobilePreviewOpen(true)}
              className="mb-4 flex min-h-12 w-full items-center justify-between rounded-[14px] border border-[#cf5068]/20 bg-[#fff5f7] px-4 text-left lg:hidden"
            >
              <span>
                <span className="block text-xs font-black text-[#a73551]">
                  Xem trước trên điện thoại
                </span>
                <span className="mt-0.5 block text-[10px] font-bold text-black/35">
                  Kiểm tra mẫu sau khi chỉnh
                </span>
              </span>
              <span className="text-lg text-[#c9435d]">→</span>
            </button>

            <div className="grid gap-4">
              {activeCustomerScene.slots.map(
                ({ sceneId, element, slot }, index) => {
                  const imageSources =
                    slot.kind === 'image'
                      ? getCustomerImageSources(element)
                      : [];

                  return (
                    <div
                      key={`${sceneId}-${element.id}`}
                      className="rounded-[16px] border border-black/[0.07] bg-[#faf9f8] p-4 transition-all hover:border-black/15"
                    >
                      {slot.kind === 'text' && (
                        <PersonalizeTextarea
                          label={
                            slot.label ||
                            element.name ||
                            `Nội dung ${index + 1}`
                          }
                          rows={3}
                          value={
                            element.type === 'text'
                              ? element.text
                              : element.type === 'button'
                                ? element.label
                                : ''
                          }
                          onChange={(value) =>
                            updateElement(
                              sceneId,
                              element.id,
                              (current) => {
                                if (current.type === 'text') {
                                  return {
                                    ...current,
                                    text: value,
                                  };
                                }

                                if (current.type === 'button') {
                                  return {
                                    ...current,
                                    label: value,
                                  };
                                }

                                return current;
                              }
                            )
                          }
                        />
                      )}

                      {slot.kind === 'image' && (
                        <div>
                          <p className="mb-2 text-xs font-bold text-black/58">
                            {slot.label ||
                              element.name ||
                              `Ảnh ${index + 1}`}
                          </p>

                          <div className={imageSources.length > 1 ? 'grid grid-cols-2 gap-2.5' : ''}>
                            {imageSources.map((imageSrc, photoIndex) => (
                              <label
                                key={photoIndex}
                                className="flex min-h-[76px] cursor-pointer items-center gap-3 rounded-[11px] border border-dashed border-[#c9435d]/30 bg-white p-2.5 text-xs font-black text-[#b83e57] transition hover:bg-[#fff5f7]"
                              >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-black/[0.04] text-[10px] text-black/25">
                                  {imageSrc ? (
                                    <img
                                      src={imageSrc}
                                      alt={`Ảnh ${photoIndex + 1}`}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    `Ảnh ${photoIndex + 1}`
                                  )}
                                </div>
                                <span className="min-w-0">
                                  {imageSrc ? 'Thay ảnh' : 'Chọn ảnh'} {imageSources.length > 1 ? photoIndex + 1 : ''}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    if (!file) return;

                                    readImage(file, (url) =>
                                      updateElement(
                                        sceneId,
                                        element.id,
                                        (current) =>
                                          replaceCustomerImageSlot(
                                            current,
                                            photoIndex,
                                            url,
                                            file.name
                                          )
                                      )
                                    );
                                  }}
                                />
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {slot.kind === 'youtube' &&
                        element.type === 'custom' && (
                        <PersonalizeInput
                          label={
                            slot.label ||
                            element.name ||
                            `Video YouTube ${index + 1}`
                          }
                          value={
                            String(
                              element.data
                                ?.youtubeUrl ||
                              ''
                            )
                          }
                          placeholder="Dán link YouTube (ví dụ: https://youtu.be/...)"
                          onChange={(youtubeUrl) =>
                            updateElement(
                              sceneId,
                              element.id,
                              (current) =>
                                current.type === 'custom'
                                  ? {
                                      ...current,
                                      data: {
                                        ...current.data,
                                        youtubeUrl,
                                      },
                                    }
                                  : current
                            )
                          }
                        />
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>

          <div className="sticky top-[130px] hidden flex-col items-center lg:flex">
            <div className="mb-2.5 flex w-full items-center justify-between px-1">
              <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#c9435d]">
                Xem trước trang đang chỉnh
              </span>
              <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-[10px] font-bold text-black/50">
                {activeCustomerScene.label}
              </span>
            </div>

            <div className="aspect-[9/16] w-full max-w-[340px] overflow-x-hidden overflow-y-auto rounded-[26px] border-[6px] border-[#181818] bg-white shadow-[0_20px_60px_rgba(70,25,40,0.14)]">
              <VisualSceneExperience
                key={`personalize-preview-${activeCustomerScene.scene.id}`}
                scenes={draft.scenes}
                initialSceneId={activeCustomerScene.scene.id}
                mobileOverride
                containViewport
              />
            </div>
          </div>

          {mobilePreviewOpen && (
            <div className="fixed inset-0 z-[90] flex flex-col items-center bg-[#171717]/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-[calc(0.75rem+env(safe-area-inset-top))] lg:hidden">
              <div className="mx-auto mb-3 flex w-full max-w-[430px] items-center justify-between gap-3 text-white">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                    Xem trước trên điện thoại
                  </p>
                  <p className="mt-0.5 truncate text-sm font-black">
                    {activeCustomerScene.label}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobilePreviewOpen(false)}
                  className="min-h-11 shrink-0 rounded-[12px] bg-white px-4 text-xs font-black text-black"
                >
                  Đóng
                </button>
              </div>

              <div className="aspect-[9/16] min-h-0 w-full max-w-[430px] overflow-x-hidden overflow-y-auto rounded-[24px] border-[5px] border-black bg-white shadow-2xl">
                <VisualSceneExperience
                  key={`mobile-personalize-preview-${activeCustomerScene.scene.id}`}
                  scenes={draft.scenes}
                  initialSceneId={activeCustomerScene.scene.id}
                  mobileOverride
                  containViewport
                />
              </div>
            </div>
          )}
        </div>
      )}
    </PersonalizePageShell>
  );

};
