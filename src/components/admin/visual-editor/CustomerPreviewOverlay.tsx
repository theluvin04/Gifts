import React, { useMemo, useState } from 'react';

import { VisualSceneExperience } from '../../../engine';
import type { SceneElement } from '../../../engine';
import type { TemplateVisualEditorConfig } from '../../../templates/visualEditor';
import { cloneValue } from './editorUtils';
import { getCustomerSlot } from '../../../templates/customerSlots';

interface Props {
  config: TemplateVisualEditorConfig;
  onClose: () => void;
}

export const CustomerPreviewOverlay: React.FC<Props> = ({ config, onClose }) => {
  const [draft, setDraft] = useState(() => cloneValue(config));
  const slots = useMemo(() => {
    return draft.scenes.flatMap((scene) =>
      scene.elements
        .map((element) => ({ sceneId: scene.id, element, slot: getCustomerSlot(element) }))
        .filter((item) => item.slot.kind !== 'none')
    );
  }, [draft]);

  const updateElement = (sceneId: string, elementId: string, updater: (element: SceneElement) => SceneElement) => {
    setDraft((current) => ({
      ...current,
      scenes: current.scenes.map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              elements: scene.elements.map((element) =>
                element.id === elementId ? updater(element) : element
              ),
            }
          : scene
      ),
    }));
  };

  const readImage = (file: File, done: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => done(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[190] bg-black/65 p-2 sm:p-4">
      <div className="mx-auto grid h-full max-w-[1320px] overflow-hidden rounded-[18px] bg-[#f5f4f2] shadow-[0_30px_100px_rgba(0,0,0,0.3)] lg:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="min-h-0 overflow-y-auto border-r border-black/7 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black">Mẫu khách sẽ thấy</h3>
              <p className="mt-1 text-[9px] leading-4 text-black/35">Chỉ những lớp đánh dấu “Khách thay” mới hiện ở đây.</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-[9px] border border-black/8 px-3 py-2 text-[9px] font-black text-black/45">Đóng</button>
          </div>

          <div className="mt-4 space-y-3">
            {slots.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-black/10 bg-[#faf9f8] p-4 text-[10px] leading-5 text-black/40">
                Chưa có trường nào cho khách thay. Chọn ảnh/chữ trong editor rồi đặt “Khách thay: Ảnh/Chữ”.
              </div>
            ) : (
              slots.map(({ sceneId, element, slot }, index) => (
                <div key={`${sceneId}-${element.id}`} className="rounded-[12px] border border-black/7 bg-[#faf9f8] p-3">
                  <p className="text-[8px] font-black uppercase tracking-[0.08em] text-black/25">{index + 1}. {slot.label || element.name || element.id}</p>
                  {slot.kind === 'text' && (
                    <textarea
                      value={element.type === 'text' ? element.text : element.type === 'button' ? element.label : ''}
                      onChange={(event) =>
                        updateElement(sceneId, element.id, (current) => {
                          if (current.type === 'text') return { ...current, text: event.target.value };
                          if (current.type === 'button') return { ...current, label: event.target.value };
                          return current;
                        })
                      }
                      className="mt-2 min-h-[78px] w-full rounded-[9px] border border-black/9 bg-white px-3 py-2.5 text-[11px] outline-none focus:border-[#cf5068]/40"
                    />
                  )}
                  {slot.kind === 'image' && (
                    <label className="mt-2 block cursor-pointer rounded-[9px] border border-dashed border-[#cf5068]/25 bg-white p-2.5 text-center text-[9px] font-black text-[#a73551]">
                      Thay ảnh
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
                                return { ...current, src: url, alt: file.name } as SceneElement;
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

        <main className="min-h-0 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-h-[calc(100svh-64px)] w-full max-w-[390px] overflow-y-auto overflow-x-hidden rounded-[26px] border border-black/8 bg-white shadow-[0_24px_70px_rgba(40,20,25,0.12)]">
            <VisualSceneExperience
              scenes={draft.scenes}
              initialSceneId={draft.initialSceneId}
              mobileOverride
            />
          </div>
        </main>
      </div>
    </div>
  );
};
