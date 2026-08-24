import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import type {
  TemplateVisualEditorConfig,
} from '../../../templates/visualEditor';

import {
  cloneValue,
} from './editorUtils';

interface Options {
  config:
    TemplateVisualEditorConfig;

  onChange: (
    config:
      TemplateVisualEditorConfig
  ) => void;

  limit?: number;
}

export const useEditorHistory =
  ({
    config,
    onChange,
    limit = 80,
  }: Options) => {
    const pastRef =
      useRef<
        TemplateVisualEditorConfig[]
      >([]);

    const futureRef =
      useRef<
        TemplateVisualEditorConfig[]
      >([]);

    const signatureRef =
      useRef(
        JSON.stringify(
          config
        )
      );

    const internalChangeRef =
      useRef(false);

    const [
      historyVersion,
      setHistoryVersion,
    ] =
      useState(0);

    const bump =
      useCallback(
        () =>
          setHistoryVersion(
            (value) =>
              value +
              1
          ),
        []
      );

    useEffect(() => {
      const signature =
        JSON.stringify(
          config
        );

      if (
        internalChangeRef.current
      ) {
        internalChangeRef.current =
          false;
        signatureRef.current =
          signature;
        return;
      }

      if (
        signature !==
        signatureRef.current
      ) {
        pastRef.current =
          [];

        futureRef.current =
          [];

        signatureRef.current =
          signature;

        bump();
      }
    }, [
      config,
      bump,
    ]);

    const emit =
      useCallback(
        (
          next:
            TemplateVisualEditorConfig
        ) => {
          internalChangeRef.current =
            true;

          signatureRef.current =
            JSON.stringify(
              next
            );

          onChange(
            next
          );
        },
        [
          onChange,
        ]
      );

    const checkpoint =
      useCallback(
        () => {
          const currentSignature =
            JSON.stringify(
              config
            );

          const last =
            pastRef.current[
              pastRef.current
                .length -
                1
            ];

          if (
            last &&
            JSON.stringify(
              last
            ) ===
              currentSignature
          ) {
            return;
          }

          pastRef.current = [
            ...pastRef.current,
            cloneValue(
              config
            ),
          ].slice(
            -limit
          );

          futureRef.current =
            [];

          bump();
        },
        [
          config,
          limit,
          bump,
        ]
      );

    const commit =
      useCallback(
        (
          next:
            TemplateVisualEditorConfig
        ) => {
          if (
            JSON.stringify(
              next
            ) ===
            JSON.stringify(
              config
            )
          ) {
            return;
          }

          pastRef.current = [
            ...pastRef.current,
            cloneValue(
              config
            ),
          ].slice(
            -limit
          );

          futureRef.current =
            [];

          emit(
            next
          );

          bump();
        },
        [
          config,
          limit,
          emit,
          bump,
        ]
      );

    const replace =
      useCallback(
        (
          next:
            TemplateVisualEditorConfig
        ) => {
          emit(
            next
          );
        },
        [
          emit,
        ]
      );

    const undo =
      useCallback(
        () => {
          const previous =
            pastRef.current[
              pastRef.current
                .length -
                1
            ];

          if (
            !previous
          ) {
            return;
          }

          pastRef.current =
            pastRef.current.slice(
              0,
              -1
            );

          futureRef.current = [
            cloneValue(
              config
            ),
            ...futureRef.current,
          ].slice(
            0,
            limit
          );

          emit(
            cloneValue(
              previous
            )
          );

          bump();
        },
        [
          config,
          limit,
          emit,
          bump,
        ]
      );

    const redo =
      useCallback(
        () => {
          const next =
            futureRef.current[
              0
            ];

          if (!next) {
            return;
          }

          futureRef.current =
            futureRef.current.slice(
              1
            );

          pastRef.current = [
            ...pastRef.current,
            cloneValue(
              config
            ),
          ].slice(
            -limit
          );

          emit(
            cloneValue(
              next
            )
          );

          bump();
        },
        [
          config,
          limit,
          emit,
          bump,
        ]
      );

    return {
      commit,
      replace,
      checkpoint,
      undo,
      redo,

      canUndo:
        pastRef.current
          .length >
        0,

      canRedo:
        futureRef.current
          .length >
        0,

      historyVersion,
    };
  };
