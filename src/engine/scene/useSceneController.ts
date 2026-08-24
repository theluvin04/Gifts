import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import type {
  GoToSceneOptions,
} from './types';

export const useSceneController =
  <
    TSceneId extends string
  >(
    initialScene:
      TSceneId
  ) => {
    const [
      history,
      setHistory,
    ] =
      useState<
        TSceneId[]
      >([
        initialScene,
      ]);

    const scene =
      history[
        history.length - 1
      ];

    const previousScene =
      history.length >
      1
        ? history[
            history.length -
              2
          ]
        : null;

    const goToScene =
      useCallback(
        (
          next:
            TSceneId,
          options?:
            GoToSceneOptions
        ) => {
          setHistory(
            (current) => {
              const currentScene =
                current[
                  current.length -
                    1
                ];

              if (
                currentScene ===
                next
              ) {
                return current;
              }

              if (
                options
                  ?.replace
              ) {
                return [
                  ...current.slice(
                    0,
                    -1
                  ),
                  next,
                ];
              }

              return [
                ...current,
                next,
              ];
            }
          );
        },
        []
      );

    const back =
      useCallback(
        () => {
          setHistory(
            (current) =>
              current.length >
              1
                ? current.slice(
                    0,
                    -1
                  )
                : current
          );
        },
        []
      );

    const reset =
      useCallback(
        (
          next:
            TSceneId =
              initialScene
        ) => {
          setHistory([
            next,
          ]);
        },
        [
          initialScene,
        ]
      );

    const canGoBack =
      history.length >
      1;

    return useMemo(
      () => ({
        scene,
        previousScene,
        history,
        canGoBack,
        goToScene,
        back,
        reset,
      }),
      [
        scene,
        previousScene,
        history,
        canGoBack,
        goToScene,
        back,
        reset,
      ]
    );
  };
