import React, { useMemo, useState } from 'react';

import type { SceneElement } from '../../../engine';
import { getElementLabel } from './editorUtils';

interface Props {
  elements: SceneElement[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onGroup: () => void;
  onUngroup: () => void;
}

export const MultiSelectPopover: React.FC<Props> = ({
  elements,
  selectedIds,
  onChange,
  onGroup,
  onUngroup,
}) => {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  const grouped = selectedIds.length > 0 && selectedIds.every((id) => {
    const item = elements.find((element) => element.id === id);
    return Boolean(item?.groupId);
  });

  const toggle = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={[
          'rounded-[9px] border px-3 py-2 text-[10px] font-black transition',
          selectedIds.length >= 2
            ? 'border-[#cf5068]/25 bg-[#fff1f4] text-[#a73551]'
            : 'border-black/9 bg-white text-black/50',
        ].join(' ')}
      >
        Chọn nhiều{selectedIds.length ? ` (${selectedIds.length})` : ''}
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-[90] w-[300px] overflow-hidden rounded-[13px] border border-black/10 bg-white shadow-[0_22px_60px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between border-b border-black/6 px-3 py-2.5">
            <div>
              <p className="text-[10px] font-black">Chọn nhiều lớp</p>
              <p className="mt-0.5 text-[8px] text-black/30">Tick 2 lớp trở lên rồi bấm Nhóm.</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full bg-[#f4f1f1] px-2 py-1 text-[9px] font-black text-black/40"
            >
              ✕
            </button>
          </div>

          <div className="max-h-[320px] overflow-y-auto p-2">
            {elements
              .slice()
              .sort((a, b) => (b.frame.zIndex || 0) - (a.frame.zIndex || 0))
              .map((element) => {
                const active = selected.has(element.id);
                return (
                  <label
                    key={element.id}
                    className={[
                      'mb-1 flex cursor-pointer items-center gap-2 rounded-[8px] px-2.5 py-2 transition last:mb-0',
                      active ? 'bg-[#fff0f4]' : 'hover:bg-[#faf8f7]',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggle(element.id)}
                      className="h-4 w-4 accent-[#b83e57]"
                    />
                    <span className="min-w-0 flex-1 truncate text-[9px] font-bold text-black/60">
                      {getElementLabel(element)}
                    </span>
                    <span className="shrink-0 text-[7px] uppercase text-black/25">
                      {element.type}
                    </span>
                  </label>
                );
              })}
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-black/6 p-2.5">
            <button
              type="button"
              onClick={() => onChange([])}
              className="rounded-[8px] border border-black/8 px-2 py-2 text-[8px] font-black text-black/40"
            >
              Bỏ chọn
            </button>
            <button
              type="button"
              disabled={selectedIds.length < 2}
              onClick={() => {
                onGroup();
                setOpen(false);
              }}
              className="rounded-[8px] bg-[#191919] px-2 py-2 text-[8px] font-black text-white disabled:opacity-30"
            >
              Nhóm
            </button>
            <button
              type="button"
              disabled={!grouped}
              onClick={() => {
                onUngroup();
                setOpen(false);
              }}
              className="rounded-[8px] border border-[#cf5068]/20 bg-[#fff7f9] px-2 py-2 text-[8px] font-black text-[#a73551] disabled:opacity-30"
            >
              Bỏ nhóm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
