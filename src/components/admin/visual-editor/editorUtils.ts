import type {
  SceneElement,
  SceneElementFrame,
} from '../../../engine';

export type DeviceMode =
  | 'desktop'
  | 'mobile';

export const clamp = (
  value: number,
  min: number,
  max: number
) =>
  Math.min(
    max,
    Math.max(
      min,
      value
    )
  );

export const makeId = (
  prefix: string
) => {
  if (
    typeof crypto !==
      'undefined' &&
    typeof crypto
      .randomUUID ===
      'function'
  ) {
    return `${prefix}-${crypto
      .randomUUID()
      .slice(0, 8)}`;
  }

  return `${prefix}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
};

export const getElementLabel = (
  element:
    SceneElement
) => {
  if (
    element.type ===
    'text'
  ) {
    return (
      element.text
        .trim()
        .slice(
          0,
          28
        ) ||
      'Text'
    );
  }

  if (
    element.type ===
    'button'
  ) {
    return (
      element.label
        .trim()
        .slice(
          0,
          28
        ) ||
      'Button'
    );
  }

  if (
    element.type ===
    'decor'
  ) {
    return 'Decor';
  }

  if (
    element.type ===
    'image'
  ) {
    return (
      element.alt ||
      'Image'
    );
  }

  return element.id;
};

export const getEffectiveFrame = (
  element:
    SceneElement,
  device:
    DeviceMode
):
  SceneElementFrame => {
  if (
    device ===
      'mobile' &&
    element.mobileFrame
  ) {
    return {
      ...element.frame,
      ...element.mobileFrame,
    };
  }

  return {
    ...element.frame,
  };
};

export const anchorTranslate =
  (
    anchor:
      SceneElementFrame[
        'anchor'
      ]
  ) => {
    switch (
      anchor
    ) {
      case 'top-center':
        return '-50% 0%';

      case 'top-right':
        return '-100% 0%';

      case 'center-left':
        return '0% -50%';

      case 'center':
        return '-50% -50%';

      case 'center-right':
        return '-100% -50%';

      case 'bottom-left':
        return '0% -100%';

      case 'bottom-center':
        return '-50% -100%';

      case 'bottom-right':
        return '-100% -100%';

      default:
        return '0% 0%';
    }
  };
