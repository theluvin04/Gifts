import type { SceneElement } from '../engine';
import { resolvePhotoFrameStyle } from '../engine/scene/photoFramePresets';

export type CustomerSlotKind = 'none' | 'image' | 'text' | 'youtube';

const SLOT_PREFIX = /^\[customer:(none|image|text|youtube)\]\s*/i;

export const getCustomerSlot = (element: SceneElement): {
  kind: CustomerSlotKind;
  label: string;
} => {
  const aria = element.ariaLabel || '';
  const match = aria.match(SLOT_PREFIX);

  if (!match) {
    if (element.type === 'custom' && element.slot === 'youtube') {
      return {
        kind: 'youtube',
        label: element.name || 'Video YouTube',
      };
    }

    return {
      kind: 'none',
      label: '',
    };
  }

  if (match[1].toLowerCase() === 'none') {
    return {
      kind: 'none',
      label: aria.replace(SLOT_PREFIX, '').trim(),
    };
  }

  return {
    kind: match[1].toLowerCase() as Exclude<CustomerSlotKind, 'none'>,
    label: aria.replace(SLOT_PREFIX, '').trim(),
  };
};

export const getCustomerImageSlotCount = (
  element: SceneElement
) => {
  if (element.type !== 'photo-frame') return 1;

  // The renderer resolves the preset before deciding how many photo cells to
  // draw. Do the same here; otherwise a 4-photo preset without an explicit
  // `layout` is incorrectly exposed to the customer as one upload field.
  const style = resolvePhotoFrameStyle(element.frameStyle || {});
  const layout = style.layout;
  const inferred =
    layout === 'strip-vertical-4' ||
    layout === 'strip-horizontal-4' ||
    layout === 'grid-2x2'
      ? 4
      : layout === 'strip-vertical-3'
        ? 3
        : layout === 'strip-vertical-2'
          ? 2
          : 1;

  return Math.max(
    1,
    Math.min(12, style.photoCount || inferred)
  );
};

export const getCustomerImageSources = (
  element: SceneElement
) => {
  if (element.type !== 'photo-frame') {
    return element.type === 'image' || element.type === 'decor'
      ? [element.src || '']
      : [''];
  }

  const count = getCustomerImageSlotCount(element);
  const photos = element.photos || [];

  return Array.from(
    { length: count },
    (_, index) => photos[index] || (index === 0 ? element.src : '')
  );
};

export const replaceCustomerImageSlot = (
  element: SceneElement,
  slotIndex: number,
  src: string,
  alt?: string
): SceneElement => {
  if (element.type === 'image' || element.type === 'decor') {
    return {
      ...element,
      src,
      mobileSrc: src,
      alt: alt || element.alt,
    };
  }

  if (element.type !== 'photo-frame') return element;

  const count = getCustomerImageSlotCount(element);
  const safeIndex = Math.max(0, Math.min(count - 1, slotIndex));
  const photos = getCustomerImageSources(element);
  photos[safeIndex] = src;

  return {
    ...element,
    src: safeIndex === 0 ? src : element.src,
    mobileSrc: safeIndex === 0 ? src : element.mobileSrc,
    photos,
    mobilePhotos: [...photos],
    alt: alt || element.alt,
  };
};

export const encodeCustomerSlot = (
  element: SceneElement,
  kind: CustomerSlotKind,
  label?: string
): SceneElement => {
  if (kind === 'none') {
    const nextAria = (element.ariaLabel || '').replace(SLOT_PREFIX, '').trim();

    if (element.type === 'custom' && element.slot === 'youtube') {
      return {
        ...element,
        ariaLabel: `[customer:none] ${nextAria || element.name || 'Video YouTube'}`,
      };
    }

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
