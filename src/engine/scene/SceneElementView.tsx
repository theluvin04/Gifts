import React from 'react';

import {
  motion,
} from 'motion/react';

import {
  AnimatedElement,
} from '../animation/AnimatedElement';

import {
  AnimatedTextContent,
  isTextRevealPreset,
} from '../animation/AnimatedTextContent';

import type {
  SceneElement,
  SceneElementFrame,
} from './elementTypes';

import {
  resolvePhotoFrameStyle,
} from './photoFramePresets';

import {
  CurvedText,
} from './CurvedText';

import {
  ImageShapeRenderer,
} from './ImageShapeRenderer';

import {
  PhotoFrameRenderer,
} from './PhotoFrameRenderer';

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
        const desktopStyle =
          element.textStyle ||
          {};

        const mobileStyle =
          element.mobileTextStyle ||
          (desktopStyle as any).mobile ||
          {};

        const style =
          mobile
            ? {
                ...desktopStyle,
                ...mobileStyle,
              }
            : desktopStyle;

        if (style.curvature && Math.abs(style.curvature) > 0) {
          return (
            <CurvedText
              text={element.text}
              style={style}
              pathId={`scene-curved-text-${element.id}-${animationVersion}`}
            />
          );
        }

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
              textDecoration:
                style.textDecoration,
              whiteSpace:
                style.whiteSpace ||
                'pre-line',
            }}
            className="break-words"
          >
            <AnimatedTextContent
              text={
                element.text
              }
              animation={
                element.animation
              }
              replayKey={
                `${element.id}-${animationVersion}`
              }
            />
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
        const source =
          mobile
            ? element.mobileSrc || element.src
            : element.src;

        if (
          !source
        ) {
          return null;
        }

        return (
          <ImageShapeRenderer
            src={source}
            alt={element.alt || ''}
            style={style}
          />
        );
      }

      if (
        element.type ===
        'photo-frame'
      ) {
        return (
          <PhotoFrameRenderer
            element={element}
            device={
              mobile
                ? 'mobile'
                : 'desktop'
            }
          />
        );
      }

      if (
        element.type ===
        'shape'
      ) {
        const style =
          element.shapeStyle ||
          {};

        const kind =
          style.kind ||
          'rectangle';

        if (
          kind ===
          'line'
        ) {
          return (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  borderTopColor:
                    style.borderColor ||
                    style.fill ||
                    '#111827',
                  borderTopWidth:
                    Math.max(
                      1,
                      style.borderWidth ||
                        2
                    ),
                  borderTopStyle:
                    style.lineStyle ||
                    'solid',
                  boxShadow:
                    style.boxShadow,
                }}
              />
            </div>
          );
        }

        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              background:
                style.fill ||
                '#f4b8c4',
              borderColor:
                style.borderColor,
              borderWidth:
                style.borderWidth,
              borderStyle:
                style.borderWidth
                  ? style.lineStyle ||
                    'solid'
                  : undefined,
              borderRadius:
                kind ===
                'circle'
                  ? '9999px'
                  : style.borderRadius,
              boxShadow:
                style.boxShadow,
            }}
          />
        );
      }

      if (
        element.type ===
        'button'
      ) {
        const desktopStyle =
          element.buttonStyle ||
          {};

        const mobileStyle =
          element.mobileButtonStyle ||
          (desktopStyle as any).mobile ||
          {};

        const style =
          mobile
            ? {
                ...desktopStyle,
                ...mobileStyle,
              }
            : desktopStyle;

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

  const outerAnimation =
    element.type ===
      'text' &&
    isTextRevealPreset(
      element.animation
        ?.preset
    )
      ? {
          ...element.animation,
          preset:
            'none' as const,
          delayMs: 0,
          durationMs: 0,
        }
      : element.animation;

  return (
    <div
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
      <AnimatedElement
        replayKey={
          `${element.id}-${animationVersion}`
        }
        animation={
          outerAnimation
        }
        style={{
          width:
            '100%',
          height:
            '100%',
          transformOrigin:
            'center center',
        }}
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
    </div>
  );
};
