import type {
  AnimationConfig,
} from '../animation/types';

import type {
  SceneTransitionConfig,
} from './types';

export type SceneElementType =
  | 'text'
  | 'image'
  | 'button'
  | 'decor'
  | 'shape'
  | 'photo-frame'
  | 'custom';

export type SceneElementAnchor =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface SceneElementFrame {
  x: number;
  y: number;
  width: number;
  height?: number;

  rotate?: number;
  scale?: number;
  opacity?: number;
  zIndex?: number;

  anchor?:
    SceneElementAnchor;
}

export interface SceneTextStyle {
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?:
    number |
    string;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?:
    'left' |
    'center' |
    'right';
  textTransform?:
    'none' |
    'uppercase' |
    'lowercase';
  fontStyle?:
    'normal' |
    'italic';
  textDecoration?:
    'none' |
    'underline' |
    'line-through';
  whiteSpace?:
    'normal' |
    'pre-line' |
    'pre-wrap';
  curvature?: number;
}

export type SceneImageShape =
  | 'rectangle'
  | 'rounded'
  | 'circle'
  | 'diamond'
  | 'hexagon'
  | 'octagon'
  | 'bevel'
  | 'ticket'
  | 'badge'
  | 'star'
  | 'heart'
  | 'triangle';

export interface SceneImageStyle {
  objectFit?:
    | 'cover'
    | 'contain'
    | 'fill';

  borderRadius?: number;

  boxShadow?: string;

  background?: string;

  borderColor?: string;

  borderWidth?: number;

  borderStyle?:
    | 'solid'
    | 'dashed'
    | 'dotted'
    | 'double'
    | 'groove'
    | 'ridge'
    | 'none';

  shape?: SceneImageShape;

  clipPath?: string;

  opacity?: number;
}

export interface SceneButtonStyle
extends SceneTextStyle {
  background?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  paddingX?: number;
  paddingY?: number;
  boxShadow?: string;
}

export type SceneShapeKind =
  | 'rectangle'
  | 'square'
  | 'circle'
  | 'line';

export interface SceneShapeStyle {
  kind?:
    SceneShapeKind;

  fill?: string;

  borderColor?: string;

  borderWidth?: number;

  borderRadius?: number;

  boxShadow?: string;

  lineStyle?:
    'solid' |
    'dashed' |
    'dotted';
}

export type ScenePhotoFramePreset =
  | 'polaroid'
  | 'polaroid-square'
  | 'polaroid-wide'
  | 'polaroid-mini'
  | 'polaroid-rounded'
  | 'polaroid-black'
  | 'polaroid-vintage'
  | 'polaroid-clean';

export interface ScenePhotoFrameStyle {
  preset?:
    ScenePhotoFramePreset;

  background?: string;

  imageFit?:
    'cover' |
    'contain';

  innerRadius?: number;

  outerRadius?: number;

  paddingPercent?: number;

  captionAreaPercent?: number;

  boxShadow?: string;

  captionColor?: string;

  captionFontFamily?: string;

  captionFontSize?: number;

  captionFontWeight?:
    number |
    string;

  captionAlign?:
    'left' |
    'center' |
    'right';
}

export type SceneElementAction =
  | {
      type:
        'go-to-scene';
      sceneId: string;
      replace?: boolean;
    }
  | {
      type:
        'back-scene';
    }
  | {
      type:
        'reset-scene';
      sceneId?: string;
    }
  | {
      type:
        'show-element';
      elementId: string;
    }
  | {
      type:
        'hide-element';
      elementId: string;
    }
  | {
      type:
        'toggle-element';
      elementId: string;
    }
  | {
      type:
        'replay-animation';
      elementId: string;
    }
  | {
      type:
        'open-url';
      url: string;
      newTab?: boolean;
    };

interface BaseSceneElement {
  id: string;

  type:
    SceneElementType;

  /**
   * Friendly layer name shown in Admin.
   */
  name?: string;

  /**
   * Elements sharing the same groupId behave as one group
   * inside the visual editor.
   */
  groupId?: string;

  frame:
    SceneElementFrame;

  mobileFrame?:
    Partial<
      SceneElementFrame
    >;

  animation?:
    Partial<
      AnimationConfig
    >;

  visible?:
    boolean;

  /** Device-specific visibility. Falls back to `visible` for older templates. */
  desktopVisible?:
    boolean;

  /** Device-specific visibility. Falls back to `visible` for older templates. */
  mobileVisible?:
    boolean;

  locked?: boolean;

  className?: string;

  ariaLabel?: string;

  actions?:
    SceneElementAction[];
}

export interface SceneTextElement
extends BaseSceneElement {
  type: 'text';

  text: string;

  textStyle?:
    SceneTextStyle;

  /** Typography override used only on phone layouts. */
  mobileTextStyle?:
    Partial<SceneTextStyle>;
}

export interface SceneImageElement
extends BaseSceneElement {
  type:
    'image' |
    'decor';

  src: string;

  mobileSrc?: string;

  alt?: string;

  imageStyle?:
    SceneImageStyle;
}

export interface SceneButtonElement
extends BaseSceneElement {
  type: 'button';

  label: string;

  buttonStyle?:
    SceneButtonStyle;

  /** Button typography/style override used only on phone layouts. */
  mobileButtonStyle?:
    Partial<SceneButtonStyle>;
}

export interface SceneShapeElement
extends BaseSceneElement {
  type: 'shape';

  shapeStyle?:
    SceneShapeStyle;
}

export interface ScenePhotoFrameElement
extends BaseSceneElement {
  type:
    'photo-frame';

  src: string;

  mobileSrc?: string;

  alt?: string;

  caption?: string;

  mobileCaption?: string;

  frameStyle?:
    ScenePhotoFrameStyle;

  mobileFrameStyle?:
    Partial<ScenePhotoFrameStyle>;
}

export interface SceneCustomElement
extends BaseSceneElement {
  type: 'custom';

  slot: string;

  data?:
    Record<
      string,
      unknown
    >;
}

export type SceneElement =
  | SceneTextElement
  | SceneImageElement
  | SceneButtonElement
  | SceneShapeElement
  | ScenePhotoFrameElement
  | SceneCustomElement;

export interface SceneCanvasBackground {
  color?: string;
  imageUrl?: string;
  imageFit?:
    'cover' |
    'contain';
  overlayColor?: string;
  overlayOpacity?: number;
  blurPx?: number;
  brightness?: number;
}

export interface SceneCanvasDefinition {
  id: string;

  title?: string;

  pageMode?:
    'screen' |
    'long-page';

  transition?:
    SceneTransitionConfig;

  aspectRatio?:
    number;

  minHeight?: number;

  /** Long-page height used only by the mobile canvas. */
  mobileMinHeight?: number;

  maxWidth?: number;

  overflow?:
    'hidden' |
    'visible';

  background?:
    SceneCanvasBackground;

  elements:
    SceneElement[];
}
