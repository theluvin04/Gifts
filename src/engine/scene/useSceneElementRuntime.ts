import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  SceneElement,
} from './elementTypes';

export const useSceneElementRuntime =
  (
    elements:
      SceneElement[]
  ) => {
    const [
      visibility,
      setVisibility,
    ] =
      useState<
        Record<
          string,
          boolean
        >
      >({});

    const [
      animationVersions,
      setAnimationVersions,
    ] =
      useState<
        Record<
          string,
          number
        >
      >({});

    useEffect(() => {
      const nextVisibility:
        Record<
          string,
          boolean
        > = {};

      const nextVersions:
        Record<
          string,
          number
        > = {};

      elements.forEach(
        (element) => {
          nextVisibility[
            element.id
          ] =
            element.visible !==
            false;

          nextVersions[
            element.id
          ] =
            animationVersions[
              element.id
            ] ||
            0;
        }
      );

      setVisibility(
        nextVisibility
      );

      setAnimationVersions(
        nextVersions
      );
    }, [
      elements,
    ]);

    const setElementVisible =
      useCallback(
        (
          elementId:
            string,
          visible:
            boolean
        ) => {
          setVisibility(
            (current) => ({
              ...current,
              [elementId]:
                visible,
            })
          );
        },
        []
      );

    const toggleElement =
      useCallback(
        (
          elementId:
            string
        ) => {
          setVisibility(
            (current) => ({
              ...current,
              [elementId]:
                !(
                  current[
                    elementId
                  ] ??
                  true
                ),
            })
          );
        },
        []
      );

    const replayElementAnimation =
      useCallback(
        (
          elementId:
            string
        ) => {
          setAnimationVersions(
            (current) => ({
              ...current,
              [elementId]:
                (
                  current[
                    elementId
                  ] ||
                  0
                ) +
                1,
            })
          );
        },
        []
      );

    const resetElements =
      useCallback(
        () => {
          setVisibility(
            Object.fromEntries(
              elements.map(
                (element) => [
                  element.id,
                  element.visible !==
                    false,
                ]
              )
            )
          );

          setAnimationVersions(
            Object.fromEntries(
              elements.map(
                (element) => [
                  element.id,
                  (
                    animationVersions[
                      element.id
                    ] ||
                    0
                  ) +
                    1,
                ]
              )
            )
          );
        },
        [
          elements,
          animationVersions,
        ]
      );

    return useMemo(
      () => ({
        visibility,
        animationVersions,
        setElementVisible,
        toggleElement,
        replayElementAnimation,
        resetElements,
      }),
      [
        visibility,
        animationVersions,
        setElementVisible,
        toggleElement,
        replayElementAnimation,
        resetElements,
      ]
    );
  };
