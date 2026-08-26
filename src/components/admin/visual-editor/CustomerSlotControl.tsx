import React from 'react';
import type { SceneElement } from '../../../engine';
import {
  CustomerSlotKind,
  encodeCustomerSlot,
  getCustomerSlot,
} from '../../../templates/customerSlots';

interface Props {
  element: SceneElement;
  onChange: (next: SceneElement) => void;
}

export const CustomerSlotControl: React.FC<Props> = ({ element, onChange }) => {
  const slot = getCustomerSlot(element);
  const canImage = element.type === 'image' || element.type === 'photo-frame';
  const canText = element.type === 'text' || element.type === 'button';
  const canYouTube = element.type === 'custom' && element.slot === 'youtube';

  if (!canImage && !canText && !canYouTube) return null;

  const setKind = (kind: CustomerSlotKind) => {
    onChange(encodeCustomerSlot(element, kind, slot.label));
  };

  return (
    <div className="flex items-center gap-1 rounded-[9px] border border-black/8 bg-white p-1">
      <span className="px-1.5 text-[8px] font-black text-black/30">Khách thay</span>
      <button
        type="button"
        onClick={() => setKind('none')}
        className={[
          'rounded-[6px] px-2 py-1.5 text-[8px] font-black',
          slot.kind === 'none' ? 'bg-[#191919] text-white' : 'text-black/35 hover:bg-[#f5f2f1]',
        ].join(' ')}
      >
        Không
      </button>
      {canImage && (
        <button
          type="button"
          onClick={() => setKind('image')}
          className={[
            'rounded-[6px] px-2 py-1.5 text-[8px] font-black',
            slot.kind === 'image' ? 'bg-[#fff0f4] text-[#a73551]' : 'text-black/35 hover:bg-[#f5f2f1]',
          ].join(' ')}
        >
          Ảnh
        </button>
      )}
      {canText && (
        <button
          type="button"
          onClick={() => setKind('text')}
          className={[
            'rounded-[6px] px-2 py-1.5 text-[8px] font-black',
            slot.kind === 'text' ? 'bg-[#fff0f4] text-[#a73551]' : 'text-black/35 hover:bg-[#f5f2f1]',
          ].join(' ')}
        >
          Chữ
        </button>
      )}
      {canYouTube && (
        <button
          type="button"
          onClick={() => setKind('youtube')}
          className={[
            'rounded-[6px] px-2 py-1.5 text-[8px] font-black',
            slot.kind === 'youtube' ? 'bg-[#fff0f4] text-[#a73551]' : 'text-black/35 hover:bg-[#f5f2f1]',
          ].join(' ')}
        >
          YouTube
        </button>
      )}
    </div>
  );
};
