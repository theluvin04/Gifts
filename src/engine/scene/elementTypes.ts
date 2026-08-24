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
  whiteSpace?:
    'normal' |
    'pre-line' |
    'pre-wrap';
}

export interface SceneImageStyle {
  objectFit?:
    'cover' |
    'contain' |
    'fill';

  borderRadius?: number;

  boxShadow?: string;

  background?: string;
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
}

export interface SceneImageElement
extends BaseSceneElement {
  type:
    'image' |
    'decor';

  src: string;

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

  transition?:
    SceneTransitionConfig;

  aspectRatio?:
    number;

  minHeight?: number;

  maxWidth?: number;

  overflow?:
    'hidden' |
    'visible';

  background?:
    SceneCanvasBackground;

  elements:
    SceneElement[];
}
