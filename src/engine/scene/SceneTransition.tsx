import React from 'react';

import {
  AnimatePresence,
  motion,
} from 'motion/react';

import type {
  SceneTransitionConfig,
  SceneTransitionPreset,
} from './types';

import {
  DEFAULT_SCENE_TRANSITION,
} from './types';

interface MotionState {
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
}

const transitions:
Record<
  SceneTransitionPreset,
  MotionState
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

  crossfade: {
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

  'slide-left': {
    initial: {
      opacity: 0,
      x: 56,
    },
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: -42,
    },
  },

  'slide-right': {
    initial: {
      opacity: 0,
      x: -56,
    },
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: 42,
    },
  },

  'slide-up': {
    initial: {
      opacity: 0,
      y: 64,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -42,
    },
  },

  'slide-down': {
    initial: {
      opacity: 0,
      y: -64,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: 42,
    },
  },

  zoom: {
    initial: {
      opacity: 0,
      scale: 0.96,
    },
    animate: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 1.025,
    },
  },

  blur: {
    initial: {
      opacity: 0,
      filter:
        'blur(14px)',
      scale: 1.015,
    },
    animate: {
      opacity: 1,
      filter:
        'blur(0px)',
      scale: 1,
    },
    exit: {
      opacity: 0,
      filter:
        'blur(10px)',
      scale: 0.99,
    },
  },
};

interface SceneTransitionProps {
  sceneKey:
    string;

  transition?:
    Partial<
      SceneTransitionConfig
    >;

  children:
    React.ReactNode;

  className?: string;
}

export const SceneTransition:
React.FC<
  SceneTransitionProps
> = ({
  sceneKey,
  transition,
  children,
  className = '',
}) => {
  const config:
    SceneTransitionConfig = {
      ...DEFAULT_SCENE_TRANSITION,
      ...(transition || {}),
      preset:
        transition?.preset ||
        DEFAULT_SCENE_TRANSITION
          .preset,
    };

  const definition =
    transitions[
      config.preset
    ] ||
    transitions.fade ||
    transitions.none;

  return (
    <AnimatePresence
      mode="popLayout"
      // Do not suppress the first render. `initial={false}` is inherited by
      // nested Motion elements and makes every entrance effect jump straight
      // to its final state in Preview and on the published first scene.
      initial
    >
      <motion.div
        key={sceneKey}
        initial={
          definition.initial as any
        }
        animate={
          definition.animate as any
        }
        exit={
          definition.exit as any
        }
        transition={{
          duration:
            Math.max(
              0,
              config.durationMs ||
                0
            ) /
            1000,
          ease:
            config.easing ||
            'easeOut',
        }}
        className={[
          'relative w-full min-w-0',
          className,
        ].join(' ')}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
