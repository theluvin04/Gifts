import type {
  SceneCanvasDefinition,
} from '../../engine';

export const LOVE01_ENGINE_EXAMPLE_SCENE:
SceneCanvasDefinition = {
  id:
    'engine-example',

  aspectRatio:
    16 / 9,

  maxWidth:
    1100,

  background: {
    color:
      '#fff4f7',
  },

  elements: [
    {
      id:
        'floating-heart',

      type:
        'decor',

      src:
        '/images/gifts/gift-1.png',

      frame: {
        x: 50,
        y: 42,
        width: 18,
        anchor:
          'center',
        zIndex: 2,
      },

      animation: {
        preset:
          'float',
        durationMs:
          1800,
      },

      actions: [
        {
          type:
            'replay-animation',
          elementId:
            'headline',
        },
      ],
    },

    {
      id:
        'headline',

      type:
        'text',

      text:
        'Scene Engine ready',

      frame: {
        x: 50,
        y: 72,
        width: 70,
        anchor:
          'center',
        zIndex: 3,
      },

      mobileFrame: {
        width: 88,
        y: 76,
      },

      textStyle: {
        color:
          '#c73757',
        fontSize: 36,
        fontWeight:
          700,
        textAlign:
          'center',
      },

      animation: {
        preset:
          'fade-up',
        durationMs:
          520,
      },
    },
  ],
};
