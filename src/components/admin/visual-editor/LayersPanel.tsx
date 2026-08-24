import React from 'react';

import type {
  SceneCanvasDefinition,
} from '../../../engine';

import {
  getElementLabel,
} from './editorUtils';

interface Props {
  scene:
    SceneCanvasDefinition;

  selectedElementIds:
    string[];

  onSelectionChange: (
    ids: string[]
  ) => void;

  onToggleVisible: (
    id: string
  ) => void;

  onToggleLock: (
    id: string
  ) => void;
}

export const LayersPanel:
React.FC<Props> = ({
  scene,
  selectedElementIds,
  onSelectionChange,
  onToggleVisible,
  onToggleLock,
}) => {
  const selected =
    new Set(
      selectedElementIds
    );

  const sorted =
    [...scene.elements]
      .sort(
        (
          left,
          right
        ) =>
          (
            right.frame
              .zIndex ||
            0
          ) -
          (
            left.frame
              .zIndex ||
            0
          )
      );

  const selectLayer = (
    elementId: string,
    additive: boolean
  ) => {
    const element =
      scene.elements.find(
        (item) =>
          item.id ===
          elementId
      );

    if (!element) {
      return;
    }

    const nhómIds =
      element.nhómId
        ? scene.elements
            .filter(
              (item) =>
                item.nhómId ===
                element.nhómId
            )
            .map(
              (item) =>
                item.id
            )
        : [
            element.id,
          ];

    if (!additive) {
      onSelectionChange(
        nhómIds
      );
      return;
    }

    const next =
      new Set(
        selectedElementIds
      );

    const allSelected =
      nhómIds.every(
        (id) =>
          next.has(
            id
          )
      );

    nhómIds.forEach(
      (id) => {
        if (
          allSelected
        ) {
          next.delete(
            id
          );
        } else {
          next.add(
            id
          );
        }
      }
    );

    onSelectionChange(
      Array.from(
        next
      )
    );
  };

  return (
    <aside className="min-w-0 overflow-hidden rounded-[11px] border border-black/8 bg-[#faf9f8] p-2">
      <div className="flex items-center justify-between gap-2 px-1">
        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-black/30">
          Lớp
        </p>

        <span className="text-[8px] font-bold text-black/25">
          {scene.elements
            .length}
        </span>
      </div>

      <div className="mt-2 max-h-[calc(100svh-370px)] min-h-[320px] space-y-1 overflow-y-auto pr-0.5">
        {sorted.map(
          (element) => {
            const isSelected =
              selected.has(
                element.id
              );

            return (
              <div
                key={
                  element.id
                }
                className={[
                  'flex items-center gap-1.5 rounded-[9px] border px-1.5 py-1.5 transition',
                  isSelected
                    ? 'border-[#cf5068]/30 bg-white shadow-[0_4px_14px_rgba(120,40,60,0.06)]'
                    : 'border-transparent hover:bg-white/65',
                ].join(' ')}
              >
                <button
                  type="button"
                  onClick={() =>
                    onToggleVisible(
                      element.id
                    )
                  }
                  className={[
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] text-[8px] font-black',
                    element.visible ===
                    false
                      ? 'bg-black/5 text-black/20'
                      : 'bg-emerald-50 text-emerald-600',
                  ].join(' ')}
                  title="Ẩn / hiện"
                >
                  {element.visible ===
                  false
                    ? '○'
                    : '●'}
                </button>

                <button
                  type="button"
                  onClick={(
                    event
                  ) =>
                    selectLayer(
                      element.id,
                      event.shiftKey ||
                        event.metaKey ||
                        event.ctrlKey
                    )
                  }
                  className="min-w-0 flex-1 px-1 py-1 text-left"
                >
                  <div className="flex min-w-0 items-center gap-1.5">
                    <p className="truncate text-[10px] font-bold text-black/65">
                      {getElementLabel(
                        element
                      )}
                    </p>

                    {element.nhómId && (
                      <span className="shrink-0 rounded bg-[#f4e6ea] px-1 py-0.5 text-[7px] font-black uppercase text-[#a2344f]">
                        nhóm
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-[8px] uppercase text-black/25">
                    {element.type ===
                    'text'
                      ? 'CHỮ'
                      : element.type ===
                          'image'
                        ? 'ẢNH'
                        : element.type ===
                            'decor'
                          ? 'TRANG TRÍ'
                          : element.type ===
                              'shape'
                            ? 'HÌNH'
                            : element.type ===
                                'photo-frame'
                              ? 'KHUNG ẢNH'
                              : element.type ===
                                  'button'
                                ? 'NÚT'
                                : 'TÙY CHỈNH'}{' '}
                    · z
                    {element.frame
                      .zIndex ||
                      0}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onToggleLock(
                      element.id
                    )
                  }
                  title="Khóa / mở khóa"
                  className={[
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] text-[9px] font-black',
                    element.locked
                      ? 'bg-amber-50 text-amber-700'
                      : 'text-black/20 hover:bg-black/5 hover:text-black/45',
                  ].join(' ')}
                >
                  {element.locked
                    ? '🔒'
                    : '◇'}
                </button>
              </div>
            );
          }
        )}

        {sorted.length ===
          0 && (
          <p className="px-2 py-6 text-center text-[10px] text-black/30">
            Chưa có element.
          </p>
        )}
      </div>

      <p className="mt-2 px-1 text-[8px] leading-4 text-black/25">
        Shift/Ctrl/Cmd + click để chọn nhiều lớp.
      </p>
    </aside>
  );
};
