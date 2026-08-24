import React from 'react';

import {
  motion,
} from 'motion/react';

import type {
  AnimationConfig,
} from './types';

import {
  getAnimationMotionDefinition,
  normalizeAnimationConfig,
} from './presets';

interface AnimatedElementProps {
  animation?:
    Partial<
      AnimationConfig
    >;

  children:
    React.ReactNode;

  className?: string;

  style?:
    React.CSSProperties;

  disabled?: boolean;

  replayKey?:
    string |
    number;

  onAnimationComplete?:
    () => void;
}

export const AnimatedElement:
React.FC<
  AnimatedElementProps
> = ({
  animation,
  children,
  className = '',
  style,
  disabled = false,
  replayKey,
  onAnimationComplete,
}) => {
  if (disabled) {
    return (
      <div
        className={
          className
        }
        style={style}
      >
        {children}
      </div>
    );
  }

  const config =
    normalizeAnimationConfig(
      animation
    );

  const definition =
    getAnimationMotionDefinition(
      config
    );

  if (
    config.trigger ===
    'viewport'
  ) {
    return (
      <motion.div
        key={
          replayKey
        }
        initial={
          definition.initial as any
        }
        whileInView={
          definition.animate as any
        }
        exit={
          definition.exit as any
        }
        transition={
          definition.transition as any
        }
        viewport={{
          once: true,
          amount:
            config.viewportAmount ??
            0.2,
        }}
        onAnimationComplete={
          onAnimationComplete
        }
        className={
          className
        }
        style={style}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      key={
        replayKey
      }
      initial={
        definition.initial as any
      }
      animate={
        definition.animate as any
      }
      exit={
        definition.exit as any
      }
      transition={
        definition.transition as any
      }
      onAnimationComplete={
        onAnimationComplete
      }
      className={
        className
      }
      style={style}
    >
      {children}
    </motion.div>
  );
};
