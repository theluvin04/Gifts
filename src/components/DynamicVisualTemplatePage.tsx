import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  BrandLogo,
} from './BrandLogo';

import {
  VisualSceneExperience,
} from '../engine';

import type {
  SceneElement,
} from '../engine';

import {
  getEffectiveTemplatePrice,
  getPublicTemplateConfigById,
  type TemplateConfig,
} from '../services/templateService';

import type {
  TemplateVisualEditorConfig,
} from '../templates/visualEditor';

import {
  getCustomerSlot,
} from '../templates/customerSlots';

interface Props {
  templateId: string;
  mode: 'product' | 'create';
  onBackHome: () => void;
  onStartPersonalize: () => void;
  onBackProduct: () => void;
  onCheckout: () => void;
}

interface StoredDraft {
  fingerprint: string;
  config:
    TemplateVisualEditorConfig;
}

const clone = <T,>(
  value: T
): T =>
  JSON.parse(
    JSON.stringify(value)
  );

const draftKey = (
  templateId: string
) =>
  `dearly:visual-customer-draft:${templateId}`;

const getTemplateFingerprint = (
  config:
    TemplateVisualEditorConfig
) =>
  JSON.stringify(
    config.scenes.map(
      (scene) => ({
        id: scene.id,
        title:
          scene.title || '',
        elements:
          scene.elements.map(
            (element) => ({
              id: element.id,
              type: element.type,
              ariaLabel:
                element.ariaLabel ||
                '',
            })
          ),
      })
    )
  );

const loadDraft = (
  templateId: string,
  fallback:
    TemplateVisualEditorConfig
): TemplateVisualEditorConfig => {
  const fingerprint =
    getTemplateFingerprint(
      fallback
    );

  try {
    const raw =
      window.localStorage.getItem(
        draftKey(templateId)
      );

    if (!raw) {
      return clone(fallback);
    }

    const parsed =
      JSON.parse(raw) as
        StoredDraft |
        TemplateVisualEditorConfig;

    if (
      parsed &&
      'fingerprint' in parsed &&
      'config' in parsed &&
      parsed.fingerprint ===
        fingerprint &&
      Array.isArray(
        parsed.config?.scenes
      )
    ) {
      return parsed.config;
    }

    // Draft cũ không có fingerprint hoặc template Admin đã đổi.
    // Bỏ draft cũ để không giữ slot/tài nguyên đã lỗi thời.
    window.localStorage.removeItem(
      draftKey(templateId)
    );
  } catch {
    // fallback below
  }

  return clone(fallback);
};

const saveDraft = (
  templateId: string,
  templateConfig:
    TemplateVisualEditorConfig,
  config:
    TemplateVisualEditorConfig
) => {
  try {
    const payload:
      StoredDraft = {
      fingerprint:
        getTemplateFingerprint(
          templateConfig
        ),
      config,
    };

    window.localStorage.setItem(
      draftKey(templateId),
      JSON.stringify(payload)
    );
  } catch {
    // local draft is best effort
  }
};

const formatVnd = (
  value: number
) =>
  new Intl.NumberFormat(
    'vi-VN'
  ).format(value) +
  'đ';

export const DynamicVisualTemplatePage:
React.FC<Props> = ({
  templateId,
  mode,
  onBackHome,
  onStartPersonalize,
  onBackProduct,
  onCheckout,
}) => {
  const [template, setTemplate] =
    useState<TemplateConfig | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [draft, setDraft] =
    useState<TemplateVisualEditorConfig | null>(
      null
    );

  const [previewMobile, setPreviewMobile] =
    useState(true);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');

    void getPublicTemplateConfigById(
      templateId
    )
      .then((next) => {
        if (!active) return;

        if (
          !next.visible ||
          next.status !==
            'available' ||
          !next.visualEditor
            ?.enabled
        ) {
          setError(
            'Template này hiện chưa mở bán.'
          );
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
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [
    templateId,
  ]);

  useEffect(() => {
    if (
      draft &&
      template?.visualEditor
    ) {
      saveDraft(
        templateId,
        template.visualEditor,
        draft
      );
    }
  }, [
    draft,
    template,
    templateId,
  ]);

  const slots =
    useMemo(() => {
      if (!draft) {
        return [];
      }

      return draft.scenes.flatMap(
        (scene) =>
          scene.elements
            .map((element) => ({
              sceneId:
                scene.id,
              sceneTitle:
                scene.title ||
                scene.id,
              element,
              slot:
                getCustomerSlot(
                  element
                ),
            }))
            .filter(
              (item) =>
                item.slot.kind !==
                'none'
            )
      );
    }, [draft]);

  const updateElement = (
    sceneId: string,
    elementId: string,
    updater: (
      element: SceneElement
    ) => SceneElement
  ) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            scenes:
              current.scenes.map(
                (scene) =>
                  scene.id ===
                  sceneId
                    ? {
                        ...scene,
                        elements:
                          scene.elements.map(
                            (element) =>
                              element.id ===
                              elementId
                                ? updater(
                                    element
                                  )
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
    done: (
      value: string
    ) => void
  ) => {
    const reader =
      new FileReader();

    reader.onload = () =>
      done(
        String(
          reader.result ||
          ''
        )
      );

    reader.readAsDataURL(
      file
    );
  };

  if (loading) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#fffaf8] text-sm font-bold text-black/45">
        Đang tải template...
      </main>
    );
  }

  if (
    error ||
    !template ||
    !draft
  ) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#fffaf8] px-5">
        <div className="w-full max-w-sm rounded-[24px] border border-black/7 bg-white p-6 text-center">
          <p className="text-base font-black">
            Không mở được template
          </p>
          <p className="mt-2 text-sm text-black/40">
            {error ||
              'Template không tồn tại.'}
          </p>
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

  const price =
    getEffectiveTemplatePrice(
      template
    );

  if (mode === 'product') {
    return (
      <div className="min-h-[100svh] bg-[#f7f4f2] text-[#191919]">
        <header className="border-b border-black/6 bg-white">
          <div className="mx-auto flex h-[68px] max-w-[1500px] items-center justify-between px-4 sm:px-8">
            <button
              type="button"
              onClick={onBackHome}
              className="text-xs font-black text-black/45"
            >
              ← Templates
            </button>

            <BrandLogo
              onClick={onBackHome}
              imageClassName="h-10 w-auto"
            />

            <span className="text-xs font-black">
              {formatVnd(
                price
              )}
            </span>
          </div>
        </header>

        <main className="mx-auto grid max-w-[1500px] gap-6 px-4 py-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-8">
          <section className="min-w-0 overflow-hidden rounded-[24px] border border-black/7 bg-white shadow-[0_18px_55px_rgba(0,0,0,0.06)]">
            <VisualSceneExperience
              scenes={
                template
                  .visualEditor!
                  .scenes
              }
              initialSceneId={
                template
                  .visualEditor!
                  .initialSceneId
              }
            />
          </section>

          <aside className="h-fit rounded-[24px] border border-black/7 bg-white p-5 shadow-[0_18px_55px_rgba(0,0,0,0.05)] lg:sticky lg:top-5">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#b83e57]">
              Digital template
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-[-0.045em]">
              {template.name}
            </h1>

            <p className="mt-3 text-2xl font-black">
              {formatVnd(
                price
              )}
            </p>

            <div className="mt-5 space-y-2 border-y border-black/7 py-4 text-xs leading-5 text-black/48">
              <p>
                • Mẫu bên trái là đúng thiết kế Admin đã lưu.
              </p>
              <p>
                • Khách chỉ sửa những ảnh/chữ được đánh dấu “Khách thay”.
              </p>
              <p>
                • Bố cục, hiệu ứng và trang trí giữ nguyên.
              </p>
            </div>

            <button
              type="button"
              onClick={
                onStartPersonalize
              }
              className="mt-5 w-full rounded-[14px] bg-[#191919] px-5 py-3.5 text-sm font-black text-white"
            >
              Chỉnh mẫu này
            </button>
          </aside>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-[#f5f3f2] text-[#191919]">
      <header className="sticky top-0 z-40 border-b border-black/6 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[64px] max-w-[1500px] flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-8">
          <button
            type="button"
            onClick={onBackProduct}
            className="text-xs font-black text-black/45"
          >
            ← Mẫu
          </button>

          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-black">
              {template.name}
            </p>
            <p className="text-[9px] text-black/30">
              {slots.length}{' '}
              nội dung được phép thay
            </p>
          </div>

          <button
            type="button"
            onClick={onCheckout}
            className="rounded-[11px] bg-[#191919] px-4 py-2.5 text-[10px] font-black text-white"
          >
            Thanh toán ·{' '}
            {formatVnd(
              price
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] gap-4 p-4 sm:p-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-6">
        <aside className="rounded-[18px] border border-black/7 bg-white p-4 lg:max-h-[calc(100svh-105px)] lg:overflow-y-auto">
          <h2 className="text-base font-black">
            Nội dung của bạn
          </h2>
          <p className="mt-1 text-[10px] leading-5 text-black/35">
            Chỉ các trường Admin đã bật “Khách thay” mới xuất hiện ở đây.
          </p>

          <div className="mt-4 space-y-3">
            {slots.length ===
            0 ? (
              <div className="rounded-[12px] border border-dashed border-black/10 bg-[#faf9f8] p-4 text-[10px] leading-5 text-black/40">
                Chưa có nội dung nào cho khách sửa. Vào Admin → Tài nguyên và bật “Khách thay” cho đúng layer rồi lưu template.
              </div>
            ) : (
              slots.map(
                ({
                  sceneId,
                  sceneTitle,
                  element,
                  slot,
                }, index) => (
                  <div
                    key={`${sceneId}-${element.id}`}
                    className="rounded-[12px] border border-black/7 bg-[#faf9f8] p-3"
                  >
                    <p className="text-[8px] font-black uppercase tracking-[0.08em] text-black/25">
                      {index + 1}.{' '}
                      {slot.label ||
                        element.name ||
                        element.id}
                    </p>
                    <p className="mt-1 text-[8px] text-black/25">
                      {sceneTitle}
                    </p>

                    {slot.kind ===
                      'text' && (
                      <textarea
                        value={
                          element.type ===
                          'text'
                            ? element.text
                            : element.type ===
                              'button'
                              ? element.label
                              : ''
                        }
                        onChange={(event) =>
                          updateElement(
                            sceneId,
                            element.id,
                            (current) => {
                              if (
                                current.type ===
                                'text'
                              ) {
                                return {
                                  ...current,
                                  text:
                                    event.target.value,
                                };
                              }

                              if (
                                current.type ===
                                'button'
                              ) {
                                return {
                                  ...current,
                                  label:
                                    event.target.value,
                                };
                              }

                              return current;
                            }
                          )
                        }
                        className="mt-2 min-h-[82px] w-full rounded-[9px] border border-black/9 bg-white px-3 py-2.5 text-[11px] outline-none focus:border-[#cf5068]/40"
                      />
                    )}

                    {slot.kind ===
                      'image' && (
                      <div className="mt-2">
                        {(
                          element.type ===
                            'image' ||
                          element.type ===
                            'photo-frame'
                        ) &&
                          element.src && (
                            <img
                              src={element.src}
                              alt=""
                              className="mb-2 h-24 w-full rounded-[9px] bg-white object-contain"
                            />
                          )}

                        <label className="block cursor-pointer rounded-[10px] border border-dashed border-[#cf5068]/30 bg-white p-3 text-center text-[9px] font-black text-[#a73551]">
                          Chọn ảnh khác
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => {
                              const file =
                                event.target.files?.[0];

                              if (!file) {
                                return;
                              }

                              readImage(
                                file,
                                (url) =>
                                  updateElement(
                                    sceneId,
                                    element.id,
                                    (current) => {
                                      if (
                                        current.type ===
                                          'image' ||
                                        current.type ===
                                          'photo-frame'
                                      ) {
                                        return {
                                          ...current,
                                          src: url,
                                          alt:
                                            file.name,
                                        } as
                                          SceneElement;
                                      }

                                      return current;
                                    }
                                  )
                              );
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )
              )
            )}
          </div>
        </aside>

        <section className="min-w-0 rounded-[18px] border border-black/7 bg-[#dedbd8] p-3 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-black/30">
              Bản của khách
            </p>

            <div className="flex rounded-[10px] bg-white p-1">
              <button
                type="button"
                onClick={() =>
                  setPreviewMobile(
                    false
                  )
                }
                className={`rounded-[8px] px-3 py-1.5 text-[9px] font-black ${
                  !previewMobile
                    ? 'bg-black text-white'
                    : 'text-black/40'
                }`}
              >
                Máy tính
              </button>
              <button
                type="button"
                onClick={() =>
                  setPreviewMobile(
                    true
                  )
                }
                className={`rounded-[8px] px-3 py-1.5 text-[9px] font-black ${
                  previewMobile
                    ? 'bg-black text-white'
                    : 'text-black/40'
                }`}
              >
                Điện thoại
              </button>
            </div>
          </div>

          <div
            className={[
              'mx-auto max-h-[calc(100svh-165px)] overflow-y-auto overflow-x-hidden rounded-[18px] border border-black/8 bg-white shadow-[0_22px_70px_rgba(0,0,0,0.12)]',
              previewMobile
                ? 'max-w-[430px]'
                : 'max-w-[1000px]',
            ].join(' ')}
          >
            <VisualSceneExperience
              scenes={draft.scenes}
              initialSceneId={draft.initialSceneId}
              mobileOverride={
                previewMobile
              }
            />
          </div>
        </section>
      </main>
    </div>
  );
};
