export type SceneTransitionPreset =
  | 'none'
  | 'fade'
  | 'crossfade'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'zoom'
  | 'blur';

export type SceneTransitionEasing =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'circOut';

export interface SceneTransitionConfig {
  preset:
    SceneTransitionPreset;

  durationMs?: number;

  easing?:
    SceneTransitionEasing;
}

export interface SceneDefinition<
  TSceneId extends
    string = string
> {
  id:
    TSceneId;

  title?: string;

  transition?:
    SceneTransitionConfig;
}

export interface GoToSceneOptions {
  replace?: boolean;
}

export const DEFAULT_SCENE_TRANSITION:
SceneTransitionConfig = {
  preset: 'fade',
  durationMs: 420,
  easing: 'easeOut',
};
