import React from 'react';

import {
  motion,
} from 'motion/react';

import {
  AnimatedElement,
} from '../animation/AnimatedElement';

import type {
  SceneElement,
  SceneElementFrame,
} from './elementTypes';

const getAnchorTransform = (
  anchor:
    SceneElementFrame[
      'anchor'
    ]
) => {
  switch (
    anchor
  ) {
    case 'top-center':
      return '-50% 0%';

    case 'top-right':
      return '-100% 0%';

    case 'center-left':
      return '0% -50%';

    case 'center':
      return '-50% -50%';

    case 'center-right':
      return '-100% -50%';

    case 'bottom-left':
      return '0% -100%';

    case 'bottom-center':
      return '-50% -100%';

    case 'bottom-right':
      return '-100% -100%';

    case 'top-left':
    default:
      return '0% 0%';
  }
};

const getFrameStyle = (
  frame:
    SceneElementFrame
): React.CSSProperties => {
  const anchor =
    getAnchorTransform(
      frame.anchor
    );

  return {
    position:
      'absolute',

    left:
      `${frame.x}%`,

    top:
      `${frame.y}%`,

    width:
      `${frame.width}%`,

    height:
      typeof frame.height ===
      'number'
        ? `${frame.height}%`
        : undefined,

    zIndex:
      frame.zIndex ??
      1,

    opacity:
      frame.opacity ??
      1,

    transformOrigin:
      'center',

    translate:
      anchor,

    rotate:
      `${frame.rotate || 0}deg`,

    scale:
      frame.scale ??
      1,
  };
};

const mergeFrames = (
  desktop:
    SceneElementFrame,
  mobile:
    Partial<
      SceneElementFrame
    > |
    undefined,
  useMobile:
    boolean
):
  SceneElementFrame => {
  if (
    !useMobile ||
    !mobile
  ) {
    return desktop;
  }

  return {
    ...desktop,
    ...mobile,
  };
};

interface SceneElementViewProps {
  element:
    SceneElement;

  mobile:
    boolean;

  visible:
    boolean;

  animationVersion:
    number;

  onClick:
    () => void;

  renderCustom?: (
    element:
      Extract<
        SceneElement,
        {
          type:
            'custom';
        }
      >
  ) =>
    React.ReactNode;
}

export const SceneElementView:
React.FC<
  SceneElementViewProps
> = ({
  element,
  mobile,
  visible,
  animationVersion,
  onClick,
  renderCustom,
}) => {
  if (!visible) {
    return null;
  }

  const frame =
    mergeFrames(
      element.frame,
      element.mobileFrame,
      mobile
    );

  const clickable =
    Boolean(
      element.actions
        ?.length
    );

  const wrapperStyle =
    getFrameStyle(
      frame
    );

  const pointerClass =
    clickable
      ? 'cursor-pointer'
      : 'pointer-events-none';

  const renderContent =
    () => {
      if (
        element.type ===
        'text'
      ) {
        const style =
          element.textStyle ||
          {};

        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              color:
                style.color,
              fontFamily:
                style.fontFamily,
              fontSize:
                style.fontSize,
              fontWeight:
                style.fontWeight,
              lineHeight:
                style.lineHeight,
              letterSpacing:
                style.letterSpacing,
              textAlign:
                style.textAlign ||
                'left',
              textTransform:
                style.textTransform ===
                'none'
                  ? undefined
                  : style.textTransform,
              fontStyle:
                style.fontStyle,
              whiteSpace:
                style.whiteSpace ||
                'pre-line',
            }}
            className="break-words"
          >
            {element.text}
          </div>
        );
      }

      if (
        element.type ===
          'image' ||
        element.type ===
          'decor'
      ) {
        const style =
          element.imageStyle ||
          {};

        return (
          <img
            src={
              element.src
            }
            alt={
              element.alt ||
              ''
            }
            draggable={
              false
            }
            style={{
              objectFit:
                style.objectFit ||
                'contain',
              borderRadius:
                style.borderRadius,
              boxShadow:
                style.boxShadow,
              background:
                style.background,
            }}
            className="h-full w-full select-none"
          />
        );
      }

      if (
        element.type ===
        'button'
      ) {
        const style =
          element.buttonStyle ||
          {};

        return (
          <motion.button
            type="button"
            whileTap={{
              scale: 0.97,
            }}
            style={{
              width: '100%',
              height: '100%',
              color:
                style.color,
              fontFamily:
                style.fontFamily,
              fontSize:
                style.fontSize,
              fontWeight:
                style.fontWeight,
              lineHeight:
                style.lineHeight,
              letterSpacing:
                style.letterSpacing,
              textAlign:
                style.textAlign ||
                'center',
              fontStyle:
                style.fontStyle,
              background:
                style.background,
              borderColor:
                style.borderColor,
              borderWidth:
                style.borderWidth,
              borderStyle:
                style.borderWidth
                  ? 'solid'
                  : undefined,
              borderRadius:
                style.borderRadius,
              paddingLeft:
                style.paddingX,
              paddingRight:
                style.paddingX,
              paddingTop:
                style.paddingY,
              paddingBottom:
                style.paddingY,
              boxShadow:
                style.boxShadow,
            }}
            className="flex items-center justify-center"
          >
            {element.label}
          </motion.button>
        );
      }

      if (
        element.type ===
        'custom'
      ) {
        return (
          renderCustom?.(
            element
          ) ||
          null
        );
      }

      return null;
    };

  return (
    <AnimatedElement
      replayKey={
        `${element.id}-${animationVersion}`
      }
      animation={
        element.animation
      }
      style={
        wrapperStyle
      }
      className={[
        'min-w-0',
        pointerClass,
        element.className ||
          '',
      ].join(' ')}
    >
      <div
        role={
          clickable
            ? 'button'
            : undefined
        }
        tabIndex={
          clickable
            ? 0
            : undefined
        }
        aria-label={
          element.ariaLabel
        }
        onClick={
          clickable
            ? onClick
            : undefined
        }
        onKeyDown={
          clickable
            ? (
                event
              ) => {
                if (
                  event.key ===
                    'Enter' ||
                  event.key ===
                    ' '
                ) {
                  event.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        className="h-full w-full"
      >
        {renderContent()}
      </div>
    </AnimatedElement>
  );
};
