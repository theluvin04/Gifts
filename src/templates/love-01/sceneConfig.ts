import type {
  SceneTransitionConfig,
} from '../../engine';

export type Love01SceneId =
  | 'proposal'
  | 'gifts'
  | 'memories'
  | 'music'
  | 'letter';

export const LOVE01_SCENE_TRANSITIONS:
Record<
  Love01SceneId,
  SceneTransitionConfig
> = {
  proposal: {
    preset: 'fade',
    durationMs: 360,
    easing: 'easeOut',
  },

  gifts: {
    preset: 'zoom',
    durationMs: 420,
    easing: 'easeOut',
  },

  memories: {
    preset:
      'slide-left',
    durationMs: 480,
    easing: 'easeOut',
  },

  music: {
    preset:
      'slide-left',
    durationMs: 480,
    easing: 'easeOut',
  },

  letter: {
    preset:
      'slide-up',
    durationMs: 500,
    easing: 'easeOut',
  },
};
