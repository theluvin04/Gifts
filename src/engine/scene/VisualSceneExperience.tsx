import React, {
  useMemo,
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
  onSceneChange,
}) => {
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
        />
      </SceneTransition>
    </div>
  );
};
