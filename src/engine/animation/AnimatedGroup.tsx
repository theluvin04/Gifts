import React from 'react';

import type {
  AnimationConfig,
  StaggerConfig,
} from './types';

import {
  getStaggerDelayMs,
} from './presets';

import {
  AnimatedElement,
} from './AnimatedElement';

interface AnimatedGroupProps {
  children:
    React.ReactNode;

  animation?:
    Partial<
      AnimationConfig
    >;

  stagger?:
    StaggerConfig;

  className?: string;

  itemClassName?: string;

  disabled?: boolean;
}

export const AnimatedGroup:
React.FC<
  AnimatedGroupProps
> = ({
  children,
  animation,
  stagger,
  className = '',
  itemClassName = '',
  disabled = false,
}) => {
  const items =
    React.Children.toArray(
      children
    );

  return (
    <div
      className={
        className
      }
    >
      {items.map(
        (
          child,
          index
        ) => (
          <AnimatedElement
            key={
              index
            }
            disabled={
              disabled
            }
            className={
              itemClassName
            }
            animation={{
              ...(animation || {}),
              delayMs:
                (
                  animation
                    ?.delayMs ||
                  0
                ) +
                getStaggerDelayMs(
                  index,
                  stagger
                ),
            }}
          >
            {child}
          </AnimatedElement>
        )
      )}
    </div>
  );
};
