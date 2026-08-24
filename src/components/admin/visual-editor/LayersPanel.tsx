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

  selectedElementId:
    string;

  onSelect: (
    id: string
  ) => void;

  onToggleVisible: (
    id: string
  ) => void;
}

export const LayersPanel:
React.FC<Props> = ({
  scene,
  selectedElementId,
  onSelect,
  onToggleVisible,
}) => {
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

  return (
    <aside className="min-w-0 rounded-[14px] border border-black/8 bg-[#faf9f8] p-2.5">
      <p className="px-1 text-[9px] font-black uppercase tracking-[0.14em] text-black/30">
        Layers
      </p>

      <div className="mt-2 max-h-[480px] space-y-1 overflow-y-auto">
        {sorted.map(
          (element) => (
            <div
              key={
                element.id
              }
              className={[
                'flex items-center gap-2 rounded-[9px] border px-2 py-2',
                selectedElementId ===
                element.id
                  ? 'border-[#cf5068]/30 bg-white'
                  : 'border-transparent',
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
                  'w-5 shrink-0 text-center text-[9px] font-black',
                  element.visible ===
                  false
                    ? 'text-black/20'
                    : 'text-emerald-600',
                ].join(' ')}
                title="Ẩn / hiện"
              >
                {element.visible ===
                false
                  ? '—'
                  : '●'}
              </button>

              <button
                type="button"
                onClick={() =>
                  onSelect(
                    element.id
                  )
                }
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-[10px] font-bold text-black/65">
                  {getElementLabel(
                    element
                  )}
                </p>

                <p className="mt-0.5 text-[8px] uppercase text-black/25">
                  {element.type}{' '}
                  · z
                  {element.frame
                    .zIndex ||
                    0}
                </p>
              </button>
            </div>
          )
        )}

        {sorted.length ===
          0 && (
          <p className="px-2 py-6 text-center text-[10px] text-black/30">
            Chưa có element.
          </p>
        )}
      </div>
    </aside>
  );
};
