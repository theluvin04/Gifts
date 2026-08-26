import type { SceneElement } from '../engine';

export type CustomerSlotKind = 'none' | 'image' | 'text' | 'youtube';

const SLOT_PREFIX = /^\[customer:(image|text|youtube)\]\s*/i;

export const getCustomerSlot = (element: SceneElement): {
  kind: CustomerSlotKind;
  label: string;
} => {
  const aria = element.ariaLabel || '';
  const match = aria.match(SLOT_PREFIX);

  if (!match) {
    return {
      kind: 'none',
      label: '',
    };
  }

  return {
    kind: match[1].toLowerCase() as Exclude<CustomerSlotKind, 'none'>,
    label: aria.replace(SLOT_PREFIX, '').trim(),
  };
};

export const encodeCustomerSlot = (
  element: SceneElement,
  kind: CustomerSlotKind,
  label?: string
): SceneElement => {
  if (kind === 'none') {
    const nextAria = (element.ariaLabel || '').replace(SLOT_PREFIX, '').trim();
    return {
      ...element,
      ariaLabel: nextAria || undefined,
    } as SceneElement;
  }

  const fallback =
    element.name ||
    (element.type === 'text'
      ? element.text
      : element.type === 'button'
        ? element.label
        : element.type === 'photo-frame'
          ? element.caption || 'Ảnh'
          : element.type === 'custom' && element.slot === 'youtube'
            ? 'Video YouTube'
          : element.type === 'image' || element.type === 'decor'
            ? element.alt || 'Ảnh'
            : 'Nội dung');

  return {
    ...element,
    ariaLabel: `[customer:${kind}] ${(label || fallback).trim()}`,
  } as SceneElement;
};
