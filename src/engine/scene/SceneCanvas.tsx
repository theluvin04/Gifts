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

  mobileOverride?:
    boolean;

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
  mobileOverride,
  renderCustomElement,
}) => {
  const detectedMobile =
    useMobileCanvas();

  const longPage =
    Boolean(
      (scene.minHeight || 0) >=
        1200 &&
      (scene.maxWidth || 0) >=
        1000
    );

  const mobile =
    typeof mobileOverride ===
      'boolean'
      ? mobileOverride
      : detectedMobile;

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

  const pageHeight =
    Math.max(
      1800,
      scene.minHeight ||
        3200
    );

  const longPageDesktopWidth =
    scene.maxWidth ||
    1366;

  const aspectRatio =
    longPage
      ? (
          mobile
            ? 390 /
              pageHeight
            : longPageDesktopWidth /
              pageHeight
        )
      : mobile
        ? 9 / 16
        : scene.aspectRatio ||
          16 / 9;

  return (
    <div
      style={{
        maxWidth:
          longPage
            ? mobile
              ? 390
              : longPageDesktopWidth
            : scene.maxWidth ||
              1280,
      }}
      data-scene-device={
        mobile
          ? 'mobile'
          : 'desktop'
      }
      data-scene-long-page={
        longPage
          ? 'true'
          : 'false'
      }
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
            longPage
              ? undefined
              : scene.minHeight,
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
