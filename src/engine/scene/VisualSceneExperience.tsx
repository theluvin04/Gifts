import React, {
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';

import type {
  SceneCanvasDefinition,
} from './elementTypes';

import {
  SceneCanvas,
} from './SceneCanvas';

import {
  SceneTransition,
} from './SceneTransition';

import {
  useSceneController,
} from './useSceneController';

interface VisualSceneExperienceProps {
  scenes:
    SceneCanvasDefinition[];

  initialSceneId:
    string;

  className?: string;

  mobileOverride?:
    boolean;

  containViewport?:
    boolean;

  onSceneChange?: (
    sceneId: string
  ) => void;
}

export const VisualSceneExperience:
React.FC<
  VisualSceneExperienceProps
> = ({
  scenes,
  initialSceneId,
  className = '',
  mobileOverride,
  containViewport = false,
  onSceneChange,
}) => {
  const rootRef =
    useRef<HTMLDivElement>(null);

  const validInitial =
    scenes.some(
      (scene) =>
        scene.id ===
        initialSceneId
    )
      ? initialSceneId
      : scenes[0]?.id ||
        '';

  const controller =
    useSceneController<
      string
    >(
      validInitial
    );

  const sceneMap =
    useMemo(
      () =>
        new Map(
          scenes.map(
            (scene) => [
              scene.id,
              scene,
            ]
          )
        ),
      [
        scenes,
      ]
    );

  const currentScene =
    sceneMap.get(
      controller.scene
    ) ||
    scenes[0];

  useLayoutEffect(() => {
    if (!currentScene) {
      return;
    }

    const resetScroll = () => {
      if (containViewport) {
        let parent =
          rootRef.current
            ?.parentElement ||
          null;

        while (parent) {
          const overflowY =
            window.getComputedStyle(
              parent
            ).overflowY;

          if (
            overflowY ===
              'auto' ||
            overflowY ===
              'scroll'
          ) {
            parent.scrollTop = 0;
            return;
          }

          parent =
            parent.parentElement;
        }
      }

      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    resetScroll();

    const frame =
      window.requestAnimationFrame(
        resetScroll
      );
    const timeout =
      window.setTimeout(
        resetScroll,
        Math.max(
          0,
          currentScene
            .transition
            ?.durationMs ||
            0
        ) + 50
      );

    return () => {
      window.cancelAnimationFrame(
        frame
      );
      window.clearTimeout(
        timeout
      );
    };
  }, [
    containViewport,
    currentScene?.id,
    currentScene?.transition
      ?.durationMs,
  ]);

  if (
    !currentScene
  ) {
    return (
      <div
        className={[
          'flex min-h-[320px] items-center justify-center bg-slate-50 px-6 text-center text-sm text-slate-400',
          className,
        ].join(' ')}
      >
        Chưa có scene để preview.
      </div>
    );
  }

  const goToScene = (
    sceneId: string,
    options?: {
      replace?: boolean;
    }
  ) => {
    if (
      !sceneMap.has(
        sceneId
      )
    ) {
      console.warn(
        'Scene target not found:',
        sceneId
      );
      return;
    }

    controller.goToScene(
      sceneId,
      options
    );

    onSceneChange?.(
      sceneId
    );
  };

  const resetScene = (
    sceneId?: string
  ) => {
    const target =
      sceneId &&
      sceneMap.has(
        sceneId
      )
        ? sceneId
        : validInitial;

    controller.reset(
      target
    );

    onSceneChange?.(
      target
    );
  };

  const backScene =
    () => {
      if (
        !controller.canGoBack
      ) {
        return;
      }

      const previous =
        controller
          .previousScene;

      controller.back();

      if (
        previous
      ) {
        onSceneChange?.(
          previous
        );
      }
    };

  return (
    <div
      ref={rootRef}
      className={[
        'w-full min-w-0',
        className,
      ].join(' ')}
    >
      <SceneTransition
        sceneKey={
          currentScene.id
        }
        transition={
          currentScene
            .transition
        }
      >
        <SceneCanvas
          scene={
            currentScene
          }
          actionContext={{
            goToScene,
            backScene,
            resetScene,
          }}
          mobileOverride={
            mobileOverride
          }
          viewportContained={containViewport}
        />
      </SceneTransition>
    </div>
  );
};
