import type {
  SceneCanvasDefinition,
  SceneElement,
  SceneElementFrame,
} from '../../../engine';

export type DeviceMode =
  | 'desktop'
  | 'mobile';

export type AlignAction =
  | 'left'
  | 'center-x'
  | 'right'
  | 'top'
  | 'center-y'
  | 'bottom'
  | 'distribute-x'
  | 'distribute-y'
  | 'match-width'
  | 'match-height'
  | 'match-size';

export type CanvasAlignAction =
  | 'left'
  | 'center-x'
  | 'right'
  | 'top'
  | 'center-y'
  | 'bottom';

export type LayerAction =
  | 'forward'
  | 'backward'
  | 'front'
  | 'back';

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

export const cloneValue =
  <T,>(
    value: T
  ): T =>
    JSON.parse(
      JSON.stringify(
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
    element.name
      ?.trim()
  ) {
    return element
      .name
      .trim()
      .slice(
        0,
        36
      );
  }

  if (
    element.type ===
    'text'
  ) {
    return (
      element.text
        .trim()
        .slice(
          0,
          36
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
          36
        ) ||
      'Button'
    );
  }

  if (
    element.type ===
    'decor'
  ) {
    return 'Trang trí';
  }

  if (
    element.type ===
    'image'
  ) {
    return (
      element.alt ||
      'Ảnh'
    );
  }

  if (
    element.type ===
    'photo-frame'
  ) {
    return (
      element.caption
        ?.trim() ||
      'Khung Polaroid'
    );
  }

  if (
    element.type ===
    'shape'
  ) {
    const kind =
      element
        .shapeStyle
        ?.kind;

    if (
      kind ===
      'circle'
    ) {
      return 'Hình tròn';
    }

    if (
      kind ===
      'line'
    ) {
      return 'Đường kẻ';
    }

    return 'Hình chữ nhật';
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

export const setElementFrameForDevice =
  (
    element:
      SceneElement,
    device:
      DeviceMode,
    frame:
      SceneElementFrame
  ):
    SceneElement => {
    if (
      device ===
      'mobile'
    ) {
      return {
        ...element,

        mobileFrame: {
          ...element
            .mobileFrame,
          ...frame,
        },
      } as
        SceneElement;
    }

    return {
      ...element,
      frame,
    } as
      SceneElement;
  };

const getAnchorFactors = (
  anchor:
    SceneElementFrame[
      'anchor'
    ]
) => {
  switch (
    anchor
  ) {
    case 'top-center':
      return {
        x: 0.5,
        y: 0,
      };

    case 'top-right':
      return {
        x: 1,
        y: 0,
      };

    case 'center-left':
      return {
        x: 0,
        y: 0.5,
      };

    case 'center':
      return {
        x: 0.5,
        y: 0.5,
      };

    case 'center-right':
      return {
        x: 1,
        y: 0.5,
      };

    case 'bottom-left':
      return {
        x: 0,
        y: 1,
      };

    case 'bottom-center':
      return {
        x: 0.5,
        y: 1,
      };

    case 'bottom-right':
      return {
        x: 1,
        y: 1,
      };

    default:
      return {
        x: 0,
        y: 0,
      };
  }
};

export const getFrameBounds = (
  frame:
    SceneElementFrame
) => {
  const factors =
    getAnchorFactors(
      frame.anchor
    );

  const width =
    frame.width *
    (
      frame.scale ||
      1
    );

  const height =
    (
      frame.height ??
      Math.min(
        frame.width,
        12
      )
    ) *
    (
      frame.scale ||
      1
    );

  const left =
    frame.x -
    width *
      factors.x;

  const top =
    frame.y -
    height *
      factors.y;

  return {
    left,
    top,
    right:
      left +
      width,
    bottom:
      top +
      height,
    centerX:
      left +
      width /
        2,
    centerY:
      top +
      height /
        2,
    width,
    height,
    anchorX:
      factors.x,
    anchorY:
      factors.y,
  };
};

export const moveFrameToBounds =
  (
    frame:
      SceneElementFrame,
    target:
      Partial<{
        left: number;
        right: number;
        centerX: number;
        top: number;
        bottom: number;
        centerY: number;
      }>
  ):
    SceneElementFrame => {
    const bounds =
      getFrameBounds(
        frame
      );

    let nextX =
      frame.x;

    let nextY =
      frame.y;

    if (
      typeof target.left ===
      'number'
    ) {
      nextX +=
        target.left -
        bounds.left;
    }

    if (
      typeof target.right ===
      'number'
    ) {
      nextX +=
        target.right -
        bounds.right;
    }

    if (
      typeof target.centerX ===
      'number'
    ) {
      nextX +=
        target.centerX -
        bounds.centerX;
    }

    if (
      typeof target.top ===
      'number'
    ) {
      nextY +=
        target.top -
        bounds.top;
    }

    if (
      typeof target.bottom ===
      'number'
    ) {
      nextY +=
        target.bottom -
        bounds.bottom;
    }

    if (
      typeof target.centerY ===
      'number'
    ) {
      nextY +=
        target.centerY -
        bounds.centerY;
    }

    return {
      ...frame,
      x: nextX,
      y: nextY,
    };
  };

export const getSelectionBounds =
  (
    elements:
      SceneElement[],
    device:
      DeviceMode
  ) => {
    if (
      elements.length ===
      0
    ) {
      return null;
    }

    const bounds =
      elements.map(
        (element) =>
          getFrameBounds(
            getEffectiveFrame(
              element,
              device
            )
          )
      );

    const left =
      Math.min(
        ...bounds.map(
          (item) =>
            item.left
        )
      );

    const top =
      Math.min(
        ...bounds.map(
          (item) =>
            item.top
        )
      );

    const right =
      Math.max(
        ...bounds.map(
          (item) =>
            item.right
        )
      );

    const bottom =
      Math.max(
        ...bounds.map(
          (item) =>
            item.bottom
        )
      );

    return {
      left,
      top,
      right,
      bottom,
      centerX:
        (
          left +
          right
        ) /
        2,
      centerY:
        (
          top +
          bottom
        ) /
        2,
      width:
        right -
        left,
      height:
        bottom -
        top,
    };
  };

export const getGroupedSelectionIds =
  (
    scene:
      SceneCanvasDefinition,
    elementId:
      string
  ) => {
    const element =
      scene.elements.find(
        (item) =>
          item.id ===
          elementId
      );

    if (
      !element
    ) {
      return [];
    }

    if (
      !element.groupId
    ) {
      return [
        element.id,
      ];
    }

    return scene.elements
      .filter(
        (item) =>
          item.groupId ===
          element.groupId
      )
      .map(
        (item) =>
          item.id
      );
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
        return '-50%, 0%';

      case 'top-right':
        return '-100%, 0%';

      case 'center-left':
        return '0%, -50%';

      case 'center':
        return '-50%, -50%';

      case 'center-right':
        return '-100%, -50%';

      case 'bottom-left':
        return '0%, -100%';

      case 'bottom-center':
        return '-50%, -100%';

      case 'bottom-right':
        return '-100%, -100%';

      default:
        return '0%, 0%';
    }
  };

export const isTypingTarget = (
  target:
    EventTarget |
    null
) => {
  const element =
    target as
      HTMLElement |
      null;

  if (!element) {
    return false;
  }

  const tag =
    element.tagName
      ?.toLowerCase();

  return (
    tag ===
      'input' ||
    tag ===
      'textarea' ||
    tag ===
      'select' ||
    element.isContentEditable
  );
};

export const normalizeSelectionIds =
  (
    scene:
      SceneCanvasDefinition,
    ids:
      string[]
  ) => {
    const valid =
      new Set(
        scene.elements.map(
          (element) =>
            element.id
        )
      );

    return Array.from(
      new Set(
        ids.filter(
          (id) =>
            valid.has(
              id
            )
        )
      )
    );
  };
