import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  SceneActionContext,
} from './actions';

import {
  executeSceneActions,
} from './actions';

import type {
  SceneCanvasDefinition,
  SceneElement,
} from './elementTypes';

import {
  useSceneElementRuntime,
} from './useSceneElementRuntime';

import {
  SceneElementView,
} from './SceneElementView';

interface SceneCanvasProps {
  scene:
    SceneCanvasDefinition;

  actionContext:
    Pick<
      SceneActionContext,
      | 'goToScene'
      | 'backScene'
      | 'resetScene'
    >;

  className?: string;

  renderCustomElement?: (
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

const useMobileCanvas =
  () => {
    const [
      mobile,
      setMobile,
    ] =
      useState(
        () =>
          typeof window !==
            'undefined' &&
          window.matchMedia(
            '(max-width: 639px)'
          ).matches
      );

    useEffect(() => {
      const media =
        window.matchMedia(
          '(max-width: 639px)'
        );

      const update =
        () =>
          setMobile(
            media.matches
          );

      update();

      media.addEventListener(
        'change',
        update
      );

      return () =>
        media.removeEventListener(
          'change',
          update
        );
    }, []);

    return mobile;
  };

export const SceneCanvas:
React.FC<
  SceneCanvasProps
> = ({
  scene,
  actionContext,
  className = '',
  renderCustomElement,
}) => {
  const mobile =
    useMobileCanvas();

  const runtime =
    useSceneElementRuntime(
      scene.elements
    );

  const completeActionContext:
    SceneActionContext =
    useMemo(
      () => ({
        ...actionContext,

        setElementVisible:
          runtime
            .setElementVisible,

        toggleElement:
          runtime
            .toggleElement,

        replayElementAnimation:
          runtime
            .replayElementAnimation,
      }),
      [
        actionContext,
        runtime
          .setElementVisible,
        runtime
          .toggleElement,
        runtime
          .replayElementAnimation,
      ]
    );

  const background =
    scene.background ||
    {};

  const overlayOpacity =
    Math.max(
      0,
      Math.min(
        1,
        background
          .overlayOpacity ||
          0
      )
    );

  const aspectRatio =
    scene.aspectRatio ||
    9 / 16;

  return (
    <div
      style={{
        maxWidth:
          scene.maxWidth ||
          1280,
      }}
      className={[
        'relative mx-auto w-full min-w-0',
        className,
      ].join(' ')}
    >
      <div
        style={{
          aspectRatio:
            String(
              aspectRatio
            ),
          minHeight:
            scene.minHeight,
          overflow:
            scene.overflow ||
            'hidden',
          backgroundColor:
            background.color,
        }}
        className="relative isolate w-full"
      >
        {background
          .imageUrl && (
          <img
            src={
              background
                .imageUrl
            }
            alt=""
            draggable={
              false
            }
            style={{
              objectFit:
                background
                  .imageFit ||
                'cover',
              filter:
                [
                  background
                    .blurPx
                    ? `blur(${background.blurPx}px)`
                    : '',
                  typeof background
                    .brightness ===
                    'number'
                    ? `brightness(${background.brightness})`
                    : '',
                ]
                  .filter(
                    Boolean
                  )
                  .join(' ') ||
                undefined,
              transform:
                background
                  .blurPx
                  ? 'scale(1.04)'
                  : undefined,
            }}
            className="absolute inset-0 h-full w-full select-none"
          />
        )}

        {background
          .overlayColor &&
          overlayOpacity >
            0 && (
          <div
            style={{
              background:
                background
                  .overlayColor,
              opacity:
                overlayOpacity,
            }}
            className="pointer-events-none absolute inset-0"
          />
        )}

        {scene.elements.map(
          (element) => (
            <SceneElementView
              key={
                element.id
              }
              element={
                element
              }
              mobile={
                mobile
              }
              visible={
                runtime
                  .visibility[
                  element.id
                ] ??
                element.visible !==
                  false
              }
              animationVersion={
                runtime
                  .animationVersions[
                  element.id
                ] ||
                0
              }
              onClick={() =>
                executeSceneActions(
                  element.actions,
                  completeActionContext
                )
              }
              renderCustom={
                renderCustomElement
              }
            />
          )
        )}
      </div>
    </div>
  );
};
