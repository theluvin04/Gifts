import React, { useEffect, useMemo, useState } from 'react';

import { BrandLogo } from './BrandLogo';
import { VisualSceneExperience } from '../engine';
import type { SceneElement } from '../engine';
import {
  getEffectiveTemplatePrice,
  getPublicTemplateConfigById,
  getTemplateDiscountPercent,
  type TemplateConfig,
} from '../services/templateService';
import type { TemplateVisualEditorConfig } from '../templates/visualEditor';
import { getCustomerSlot } from '../templates/customerSlots';
import { getTemplatePresentation } from '../templates/templatePresentation';
import {
  loadVisualCustomerDraft,
  saveVisualCustomerDraft,
} from '../services/visualCustomerDraftService';

interface Props {
  templateId: string;
  mode: 'product' | 'create';
  onBackHome: () => void;
  onStartPersonalize: () => void;
  onBackProduct: () => void;
  onCheckout: () => void;
}

const formatVnd = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(value) + 'đ';

const hasUsableVisualEditor = (
  template: TemplateConfig
) =>
  Boolean(
    template.visualEditor &&
      Array.isArray(template.visualEditor.scenes) &&
      template.visualEditor.scenes.length > 0
  );

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
  const [previewMobile, setPreviewMobile] = useState(true);
  const [mobilePanel, setMobilePanel] =
    useState<'content' | 'preview'>('content');

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');

    void getPublicTemplateConfigById(templateId)
      .then((next) => {
        if (!active) return;

        if (
          next.status !== 'available' ||
          !hasUsableVisualEditor(next)
        ) {
          setError('Template này hiện chưa mở bán.');
          return;
        }

        setTemplate(next);
        setDraft(
          loadVisualCustomerDraft(
            templateId,
            next.visualEditor!
          )
        );
      })
      .catch((loadError: any) => {
        if (!active) return;
        setError(loadError?.message || 'Không tải được template.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [templateId]);

  useEffect(() => {
    if (draft && template?.visualEditor) {
      saveVisualCustomerDraft(
        templateId,
        template.visualEditor,
        draft
      );
    }
  }, [draft, template, templateId]);

  const slots = useMemo(() => {
    if (!draft) return [];

    return draft.scenes.flatMap((scene) =>
      scene.elements
        .map((element) => ({
          sceneId: scene.id,
          sceneTitle: scene.title || scene.id,
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
      <main className="flex min-h-[100svh] items-center justify-center bg-[#fbf8f6] text-sm font-semibold text-black/40">
        Đang tải template...
      </main>
    );
  }

  if (error || !template || !draft) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#fbf8f6] px-5">
        <div className="w-full max-w-sm rounded-[24px] border border-black/[0.07] bg-white p-7 text-center shadow-[0_20px_60px_rgba(50,20,30,0.07)]">
          <p className="text-lg font-black">Không mở được template</p>
          <p className="mt-2 text-sm leading-6 text-black/40">
            {error || 'Template không tồn tại.'}
          </p>
          <button
            type="button"
            onClick={onBackHome}
            className="mt-6 rounded-[13px] bg-[#171717] px-5 py-3 text-sm font-bold text-white"
          >
            Về trang chủ
          </button>
        </div>
      </main>
    );
  }

  const price = getEffectiveTemplatePrice(template);
  const discount = getTemplateDiscountPercent(template);
  const presentation = getTemplatePresentation(template);

  if (mode === 'product') {
    return (
      <div className="min-h-[100svh] bg-[#fbf8f6] text-[#171717]">
        <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/95 backdrop-blur-xl">
          <div className="mx-auto grid h-[64px] max-w-[1480px] grid-cols-[88px_minmax(0,1fr)_88px] items-center px-3 sm:h-[68px] sm:grid-cols-[1fr_auto_1fr] sm:px-8">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex min-h-10 items-center justify-start text-xs font-bold text-black/42 transition hover:text-black"
            >
              ← Templates
            </button>

            <BrandLogo
              onClick={onBackHome}
              imageClassName="mx-auto h-9 w-auto sm:h-10"
            />

            <span className="justify-self-end text-[11px] font-black text-black/70 sm:text-xs">
              {formatVnd(price)}
            </span>
          </div>
        </header>

        <main className="mx-auto grid max-w-[1480px] gap-5 px-3 pb-24 pt-4 sm:gap-7 sm:px-8 sm:pt-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start lg:pb-9 lg:pt-9">
          <section className="min-w-0 overflow-hidden rounded-[26px] border border-black/[0.07] bg-white shadow-[0_20px_65px_rgba(45,20,28,0.07)]">
            <VisualSceneExperience
              scenes={template.visualEditor!.scenes}
              initialSceneId={template.visualEditor!.initialSceneId}
            />
          </section>

          <aside className="h-fit rounded-[22px] border border-black/[0.07] bg-white p-5 shadow-[0_20px_65px_rgba(45,20,28,0.06)] sm:rounded-[26px] sm:p-6 lg:sticky lg:top-[92px]">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#c9435d]">
              {presentation.category}
            </p>

            <h1 className="mt-2.5 text-[32px] font-black leading-[1.02] tracking-[-0.045em]">
              {template.name}
            </h1>

            <p className="mt-3 text-sm leading-6 text-black/48">
              {presentation.description}
            </p>

            <div className="mt-5 flex flex-wrap items-end gap-x-2.5 gap-y-1.5">
              <span className="text-[26px] font-black tracking-[-0.035em]">
                {formatVnd(price)}
              </span>

              {discount > 0 && (
                <>
                  <span className="pb-1 text-xs text-black/28 line-through">
                    {formatVnd(template.basePrice)}
                  </span>
                  <span className="mb-1 rounded-full bg-[#fdecef] px-2 py-1 text-[9px] font-black text-[#c9435d]">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {template.promotionLabel && (
              <div className="mt-3 inline-flex rounded-full bg-[#fff4f6] px-3 py-1.5 text-[10px] font-bold text-[#b63c55]">
                {template.promotionLabel}
              </div>
            )}

            <div className="mt-6 border-y border-black/[0.07] py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-black/30">
                Có trong mẫu
              </p>
              <div className="mt-3 space-y-2.5">
                {presentation.highlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2.5 text-xs leading-5 text-black/55"
                  >
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9435d]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={onStartPersonalize}
              className="mt-5 min-h-12 w-full rounded-[14px] bg-[#171717] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#c9435d]"
            >
              Cá nhân hoá mẫu này
            </button>

            <p className="mt-3 text-center text-[10px] leading-4 text-black/30">
              Chỉnh trực tiếp trên web · Thanh toán chuyển khoản · Nhận link riêng
            </p>
          </aside>
        </main>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.07] bg-white/95 px-3 py-3 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-black/30">
                Giá
              </p>
              <p className="truncate text-base font-black">
                {formatVnd(price)}
              </p>
            </div>

            <button
              type="button"
              onClick={onStartPersonalize}
              className="min-h-12 shrink-0 rounded-[14px] bg-[#171717] px-5 text-sm font-black text-white"
            >
              Cá nhân hoá
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-[#f4f1ef] text-[#171717]">
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto grid min-h-[64px] max-w-[1500px] grid-cols-[84px_minmax(0,1fr)_84px] items-center gap-2 px-3 py-2 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
          <button
            type="button"
            onClick={onBackProduct}
            className="inline-flex min-h-10 items-center justify-start text-xs font-bold text-black/45 transition hover:text-black"
          >
            ← Mẫu
          </button>

          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-black">{template.name}</p>
            <p className="mt-0.5 hidden text-[10px] text-black/30 sm:block">
              {slots.length} nội dung có thể thay
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onCheckout}
              className="hidden min-h-11 rounded-[12px] bg-[#171717] px-4 text-[11px] font-black text-white transition hover:bg-[#c9435d] lg:inline-flex lg:items-center"
            >
              Thanh toán · {formatVnd(price)}
            </button>
          </div>
        </div>
      </header>

      <div className="sticky top-[64px] z-30 border-b border-black/[0.06] bg-[#f4f1ef]/95 px-3 py-2 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-2 rounded-[12px] border border-black/[0.07] bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setMobilePanel('content')}
            className={[
              'min-h-10 rounded-[9px] px-3 text-xs font-black transition',
              mobilePanel === 'content'
                ? 'bg-[#171717] text-white'
                : 'text-black/42',
            ].join(' ')}
          >
            Nội dung
          </button>

          <button
            type="button"
            onClick={() => setMobilePanel('preview')}
            className={[
              'min-h-10 rounded-[9px] px-3 text-xs font-black transition',
              mobilePanel === 'preview'
                ? 'bg-[#171717] text-white'
                : 'text-black/42',
            ].join(' ')}
          >
            Xem trước
          </button>
        </div>
      </div>

      <main className="mx-auto grid max-w-[1500px] gap-4 px-3 pb-28 pt-3 sm:px-6 sm:pt-5 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-6 lg:px-8 lg:pb-6">
        <aside
          className={[
            'rounded-[18px] border border-black/[0.07] bg-white p-4 sm:p-5 lg:block lg:max-h-[calc(100svh-105px)] lg:overflow-y-auto',
            mobilePanel === 'content' ? 'block' : 'hidden',
          ].join(' ')}
        >
          <h2 className="text-lg font-black tracking-[-0.02em]">Nội dung của bạn</h2>
          <p className="mt-1 text-xs leading-5 text-black/40">
            Chỉ những nội dung được cho phép thay mới xuất hiện ở đây.
          </p>

          <div className="mt-4 space-y-3">
            {slots.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-black/10 bg-[#faf9f8] p-4 text-xs leading-5 text-black/40">
                Mẫu này chưa có nội dung nào được bật cho khách thay.
              </div>
            ) : (
              slots.map(({ sceneId, sceneTitle, element, slot }, index) => (
                <div
                  key={`${sceneId}-${element.id}`}
                  className="rounded-[14px] border border-black/[0.07] bg-[#faf9f8] p-3.5"
                >
                  <p className="text-[11px] font-black text-black/60">
                    {index + 1}. {slot.label || element.name || element.id}
                  </p>
                  <p className="mt-1 text-[10px] font-medium text-black/30">{sceneTitle}</p>

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
                          if (current.type === 'text') {
                            return { ...current, text: event.target.value };
                          }

                          if (current.type === 'button') {
                            return { ...current, label: event.target.value };
                          }

                          return current;
                        })
                      }
                      className="mt-3 min-h-[96px] w-full resize-y rounded-[11px] border border-black/10 bg-white px-3.5 py-3 text-[16px] leading-6 outline-none transition focus:border-[#cf5068]/45 focus:ring-2 focus:ring-[#cf5068]/10 sm:text-sm"
                    />
                  )}

                  {slot.kind === 'image' && (
                    <div className="mt-2">
                      {(
                        element.type === 'image' ||
                        element.type === 'photo-frame'
                      ) &&
                        element.src && (
                          <img
                            src={element.src}
                            alt=""
                            className="mb-2 h-24 w-full rounded-[9px] bg-white object-contain"
                          />
                        )}

                      <label className="flex min-h-11 cursor-pointer items-center justify-center rounded-[11px] border border-dashed border-[#cf5068]/30 bg-white px-3 py-3 text-center text-xs font-black text-[#a73551] transition hover:bg-[#fff6f8]">
                        Chọn ảnh khác
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;

                            readImage(file, (url) =>
                              updateElement(sceneId, element.id, (current) => {
                                if (
                                  current.type === 'image' ||
                                  current.type === 'photo-frame'
                                ) {
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
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>

        <section
          className={[
            'min-w-0 rounded-[18px] border border-black/[0.07] bg-[#ddd9d6] p-3 sm:p-5 lg:block',
            mobilePanel === 'preview' ? 'block' : 'hidden',
          ].join(' ')}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black text-black/55">
                Bản xem trước
              </p>
              <p className="mt-0.5 text-[10px] text-black/30">
                Chuyển thiết bị để kiểm tra bố cục.
              </p>
            </div>

            <div className="flex shrink-0 rounded-[10px] bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setPreviewMobile(false)}
                className={`min-h-9 rounded-[8px] px-3 py-1.5 text-[10px] font-black ${
                  !previewMobile ? 'bg-black text-white' : 'text-black/40'
                }`}
              >
                Máy tính
              </button>
              <button
                type="button"
                onClick={() => setPreviewMobile(true)}
                className={`min-h-9 rounded-[8px] px-3 py-1.5 text-[10px] font-black ${
                  previewMobile ? 'bg-black text-white' : 'text-black/40'
                }`}
              >
                Điện thoại
              </button>
            </div>
          </div>

          <div
            className={[
              'mx-auto max-h-[calc(100svh-238px)] min-h-[55svh] overflow-y-auto overflow-x-hidden rounded-[16px] border border-black/8 bg-white shadow-[0_22px_70px_rgba(0,0,0,0.12)] lg:max-h-[calc(100svh-165px)] lg:min-h-0 lg:rounded-[18px]',
              previewMobile ? 'max-w-[430px]' : 'max-w-[1000px]',
            ].join(' ')}
          >
            <VisualSceneExperience
              scenes={draft.scenes}
              initialSceneId={draft.initialSceneId}
              mobileOverride={previewMobile}
            />
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.07] bg-white/95 px-3 py-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setMobilePanel(
                mobilePanel === 'content'
                  ? 'preview'
                  : 'content'
              )
            }
            className="min-h-12 rounded-[13px] border border-black/10 bg-white px-4 text-xs font-black text-black/55"
          >
            {mobilePanel === 'content'
              ? 'Xem trước'
              : 'Sửa nội dung'}
          </button>

          <button
            type="button"
            onClick={onCheckout}
            className="min-h-12 min-w-0 flex-1 rounded-[13px] bg-[#171717] px-4 text-sm font-black text-white"
          >
            Thanh toán · {formatVnd(price)}
          </button>
        </div>
      </div>
    </div>
  );
};
