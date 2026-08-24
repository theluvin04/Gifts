export type AnimationPreset =
  | 'none'
  | 'fade'
  | 'fade-up'
  | 'fade-down'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'zoom-in'
  | 'zoom-out'
  | 'pop'
  | 'rotate-in'
  | 'zigzag-left'
  | 'zigzag-right'
  | 'blur-reveal'
  | 'wipe-left'
  | 'wipe-up'
  | 'bounce-in'
  | 'flip-in'
  | 'typewriter'
  | 'word-reveal'
  | 'line-reveal'
  | 'spin'
  | 'spin-reverse'
  | 'float'
  | 'swing'
  | 'shake'
  | 'pulse';

export type AnimationEasing =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'circOut'
  | 'backOut';

export type AnimationTrigger =
  | 'mount'
  | 'viewport';

export interface AnimationConfig {
  preset:
    AnimationPreset;

  durationMs?: number;

  delayMs?: number;

  easing?:
    AnimationEasing;

  repeat?:
    number |
    'infinite';

  repeatDelayMs?: number;

  trigger?:
    AnimationTrigger;

  viewportAmount?: number;

  /**
   * Used by typewriter animation.
   * Defaults to true when preset = typewriter.
   */
  showCursor?: boolean;
}

export interface StaggerConfig {
  enabled?: boolean;

  intervalMs?: number;

  startDelayMs?: number;
}

export interface AnimationMotionDefinition {
  initial:
    Record<
      string,
      unknown
    >;

  animate:
    Record<
      string,
      unknown
    >;

  exit:
    Record<
      string,
      unknown
    >;

  transition:
    Record<
      string,
      unknown
    >;
}

export const DEFAULT_ANIMATION_CONFIG:
AnimationConfig = {
  preset: 'fade',
  durationMs: 500,
  delayMs: 0,
  easing: 'easeOut',
  trigger: 'mount',
  viewportAmount: 0.2,
};

export const DEFAULT_STAGGER_CONFIG:
Required<
  StaggerConfig
> = {
  enabled: true,
  intervalMs: 120,
  startDelayMs: 0,
};
