import type {
  AnimationConfig,
  AnimationMotionDefinition,
  AnimationPreset,
  StaggerConfig,
} from './types';

import {
  DEFAULT_ANIMATION_CONFIG,
  DEFAULT_STAGGER_CONFIG,
} from './types';

const px = (
  value: number
) => value;

const presetMotion:
Record<
  AnimationPreset,
  Pick<
    AnimationMotionDefinition,
    | 'initial'
    | 'animate'
    | 'exit'
  >
> = {
  none: {
    initial: {},
    animate: {},
    exit: {},
  },

  fade: {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  },

  'fade-up': {
    initial: {
      opacity: 0,
      y: px(24),
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: px(-10),
    },
  },

  'fade-down': {
    initial: {
      opacity: 0,
      y: px(-24),
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: px(10),
    },
  },

  'slide-left': {
    initial: {
      opacity: 0,
      x: px(52),
    },
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: px(-36),
    },
  },

  'slide-right': {
    initial: {
      opacity: 0,
      x: px(-52),
    },
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: px(36),
    },
  },

  'slide-up': {
    initial: {
      opacity: 0,
      y: px(60),
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: px(-36),
    },
  },

  'slide-down': {
    initial: {
      opacity: 0,
      y: px(-60),
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: px(36),
    },
  },

  'zoom-in': {
    initial: {
      opacity: 0,
      scale: 0.88,
    },
    animate: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 1.04,
    },
  },

  'zoom-out': {
    initial: {
      opacity: 0,
      scale: 1.1,
    },
    animate: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 0.96,
    },
  },

  pop: {
    initial: {
      opacity: 0,
      scale: 0.72,
    },
    animate: {
      opacity: [
        0,
        1,
        1,
      ],
      scale: [
        0.72,
        1.08,
        1,
      ],
    },
    exit: {
      opacity: 0,
      scale: 0.9,
    },
  },

  'rotate-in': {
    initial: {
      opacity: 0,
      rotate: -10,
      scale: 0.92,
    },
    animate: {
      opacity: 1,
      rotate: 0,
      scale: 1,
    },
    exit: {
      opacity: 0,
      rotate: 5,
      scale: 0.96,
    },
  },

  float: {
    initial: {
      opacity: 1,
      y: 0,
    },
    animate: {
      opacity: 1,
      y: [
        0,
        -8,
        0,
      ],
    },
    exit: {
      opacity: 0,
    },
  },

  swing: {
    initial: {
      opacity: 1,
      rotate: 0,
    },
    animate: {
      opacity: 1,
      rotate: [
        0,
        -2.5,
        2.5,
        0,
      ],
    },
    exit: {
      opacity: 0,
    },
  },
};

const isLoopPreset = (
  preset:
    AnimationPreset
) => {
  return (
    preset ===
      'float' ||
    preset ===
      'swing'
  );
};

export const normalizeAnimationConfig =
  (
    value?:
      Partial<
        AnimationConfig
      >
  ): AnimationConfig => {
    return {
      ...DEFAULT_ANIMATION_CONFIG,
      ...(value || {}),
      preset:
        value?.preset ||
        DEFAULT_ANIMATION_CONFIG
          .preset,
    };
  };

export const getAnimationMotionDefinition =
  (
    value?:
      Partial<
        AnimationConfig
      >
  ): AnimationMotionDefinition => {
    const config =
      normalizeAnimationConfig(
        value
      );

    const base =
      presetMotion[
        config.preset
      ];

    const repeat =
      config.repeat ===
      'infinite'
        ? Infinity
        : typeof config.repeat ===
            'number'
          ? config.repeat
          : isLoopPreset(
              config.preset
            )
            ? Infinity
            : 0;

    return {
      initial: {
        ...base.initial,
      },

      animate: {
        ...base.animate,
      },

      exit: {
        ...base.exit,
      },

      transition: {
        duration:
          Math.max(
            0,
            config.durationMs ||
              0
          ) /
          1000,

        delay:
          Math.max(
            0,
            config.delayMs ||
              0
          ) /
          1000,

        ease:
          config.easing ||
          'easeOut',

        repeat,

        repeatDelay:
          Math.max(
            0,
            config.repeatDelayMs ||
              0
          ) /
          1000,
      },
    };
  };

export const getStaggerDelayMs =
  (
    index: number,
    stagger?:
      StaggerConfig
  ) => {
    const config = {
      ...DEFAULT_STAGGER_CONFIG,
      ...(stagger || {}),
    };

    if (
      config.enabled ===
      false
    ) {
      return (
        config.startDelayMs ||
        0
      );
    }

    return (
      (
        config.startDelayMs ||
        0
      ) +
      Math.max(
        0,
        index
      ) *
        Math.max(
          0,
          config.intervalMs ||
            0
        )
    );
  };
