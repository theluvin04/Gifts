import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type {
  SceneElement,
  SceneElementFrame,
} from '../../../engine';

import {
  clamp,
  DeviceMode,
  getEffectiveFrame,
  getFrameBounds,
  getSelectionBounds,
  moveFrameToBounds,
} from './editorUtils';

type Corner =
  | 'nw'
  | 'ne'
  | 'sw'
  | 'se';

interface RectState {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Props {
  elements: SceneElement[];
  device: DeviceMode;
  enabled: boolean;
  onTransformStart: () => void;
  onFramesChange: (
    frames: Record<string, SceneElementFrame>
  ) => void;
}

const HANDLE_SIZE = 14;

export const GroupTransformOverlay:
React.FC<Props> = ({
  elements,
  device,
  enabled,
  onTransformStart,
  onFramesChange,
}) => {
  const [rect, setRect] =
    useState<RectState | null>(
      null
    );

  const draggingRef =
    useRef(false);

  const ids =
    useMemo(
      () =>
        new Set(
          elements.map(
            (element) =>
              element.id
          )
        ),
      [elements]
    );

  const refresh =
    useCallback(
      () => {
        if (
          !enabled ||
          elements.length < 2
        ) {
          setRect(null);
          return;
        }

        const nodes =
          Array.from(
            document.querySelectorAll<HTMLElement>(
              '[data-editor-element-id]'
            )
          ).filter(
            (node) => {
              const id =
                node.dataset
                  .editorElementId;

              return Boolean(
                id &&
                ids.has(id)
              );
            }
          );

        if (!nodes.length) {
          setRect(null);
          return;
        }

        const boxes =
          nodes.map(
            (node) =>
              node.getBoundingClientRect()
          );

        const left =
          Math.min(
            ...boxes.map(
              (box) => box.left
            )
          );

        const top =
          Math.min(
            ...boxes.map(
              (box) => box.top
            )
          );

        const right =
          Math.max(
            ...boxes.map(
              (box) => box.right
            )
          );

        const bottom =
          Math.max(
            ...boxes.map(
              (box) => box.bottom
            )
          );

        setRect({
          left,
          top,
          width:
            Math.max(
              1,
              right - left
            ),
          height:
            Math.max(
              1,
              bottom - top
            ),
        });
      },
      [
        enabled,
        elements.length,
        ids,
      ]
    );

  useEffect(() => {
    refresh();

    const handleViewport =
      () => refresh();

    window.addEventListener(
      'resize',
      handleViewport
    );

    window.addEventListener(
      'scroll',
      handleViewport,
      true
    );

    const observer =
      typeof ResizeObserver !==
      'undefined'
        ? new ResizeObserver(
            handleViewport
          )
        : null;

    Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-editor-element-id]'
      )
    )
      .filter((node) => {
        const id =
          node.dataset
            .editorElementId;

        return Boolean(
          id && ids.has(id)
        );
      })
      .forEach(
        (node) =>
          observer?.observe(node)
      );

    return () => {
      window.removeEventListener(
        'resize',
        handleViewport
      );

      window.removeEventListener(
        'scroll',
        handleViewport,
        true
      );

      observer?.disconnect();
    };
  }, [
    refresh,
    ids,
  ]);

  useEffect(() => {
    if (draggingRef.current) {
      return;
    }

    const frame =
      window.requestAnimationFrame(
        refresh
      );

    return () =>
      window.cancelAnimationFrame(
        frame
      );
  }, [
    elements,
    device,
    refresh,
  ]);

  const startScale = (
    event:
      React.PointerEvent,
    corner:
      Corner
  ) => {
    if (
      !rect ||
      elements.length < 2
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const selection =
      getSelectionBounds(
        elements,
        device
      );

    if (
      !selection ||
      selection.width <= 0 ||
      selection.height <= 0
    ) {
      return;
    }

    onTransformStart();
    draggingRef.current = true;

    const initialFrames =
      new Map<
        string,
        SceneElementFrame
      >(
        elements.map(
          (element) => [
            element.id,
            getEffectiveFrame(
              element,
              device
            ),
          ]
        )
      );

    const originClientX =
      corner === 'se' ||
      corner === 'ne'
        ? rect.left
        : rect.left +
          rect.width;

    const originClientY =
      corner === 'se' ||
      corner === 'sw'
        ? rect.top
        : rect.top +
          rect.height;

    const startHandleX =
      corner === 'se' ||
      corner === 'ne'
        ? rect.left +
          rect.width
        : rect.left;

    const startHandleY =
      corner === 'se' ||
      corner === 'sw'
        ? rect.top +
          rect.height
        : rect.top;

    const startVectorX =
      startHandleX -
      originClientX;

    const startVectorY =
      startHandleY -
      originClientY;

    const denominator =
      Math.max(
        1,
        startVectorX *
          startVectorX +
        startVectorY *
          startVectorY
      );

    const originModelX =
      corner === 'se' ||
      corner === 'ne'
        ? selection.left
        : selection.right;

    const originModelY =
      corner === 'se' ||
      corner === 'sw'
        ? selection.top
        : selection.bottom;

    const initialBounds =
      new Map<
        string,
        ReturnType<
          typeof getFrameBounds
        >
      >(
        elements.map(
          (element) => {
            const frame =
              initialFrames.get(
                element.id
              )!;

            return [
              element.id,
              getFrameBounds(
                frame
              ),
            ];
          }
        )
      );

    const handleMove = (
      moveEvent:
        PointerEvent
    ) => {
      const currentVectorX =
        moveEvent.clientX -
        originClientX;

      const currentVectorY =
        moveEvent.clientY -
        originClientY;

      const rawFactor =
        (
          currentVectorX *
            startVectorX +
          currentVectorY *
            startVectorY
        ) /
        denominator;

      const factor =
        clamp(
          rawFactor,
          0.12,
          6
        );

      const nextFrames:
        Record<
          string,
          SceneElementFrame
        > = {};

      elements.forEach(
        (element) => {
          if (element.locked) {
            return;
          }

          const frame =
            initialFrames.get(
              element.id
            );

          const bounds =
            initialBounds.get(
              element.id
            );

          if (
            !frame ||
            !bounds
          ) {
            return;
          }

          const nextScale =
            clamp(
              (frame.scale || 1) *
                factor,
              0.05,
              10
            );

          const targetLeft =
            originModelX +
            (
              bounds.left -
              originModelX
            ) *
              factor;

          const targetTop =
            originModelY +
            (
              bounds.top -
              originModelY
            ) *
              factor;

          const scaledFrame:
            SceneElementFrame = {
            ...frame,
            scale:
              nextScale,
          };

          nextFrames[
            element.id
          ] =
            moveFrameToBounds(
              scaledFrame,
              {
                left:
                  targetLeft,
                top:
                  targetTop,
              }
            );
        }
      );

      onFramesChange(
        nextFrames
      );

      window.requestAnimationFrame(
        refresh
      );
    };

    const handleUp = () => {
      draggingRef.current =
        false;

      window.removeEventListener(
        'pointermove',
        handleMove
      );

      window.removeEventListener(
        'pointerup',
        handleUp
      );

      window.requestAnimationFrame(
        refresh
      );
    };

    window.addEventListener(
      'pointermove',
      handleMove
    );

    window.addEventListener(
      'pointerup',
      handleUp
    );
  };

  if (
    !enabled ||
    !rect ||
    elements.length < 2
  ) {
    return null;
  }

  const handles:
    Array<{
      corner: Corner;
      style:
        React.CSSProperties;
      cursor: string;
    }> = [
    {
      corner: 'nw',
      style: {
        left:
          -HANDLE_SIZE /
          2,
        top:
          -HANDLE_SIZE /
          2,
      },
      cursor:
        'nwse-resize',
    },
    {
      corner: 'ne',
      style: {
        right:
          -HANDLE_SIZE /
          2,
        top:
          -HANDLE_SIZE /
          2,
      },
      cursor:
        'nesw-resize',
    },
    {
      corner: 'sw',
      style: {
        left:
          -HANDLE_SIZE /
          2,
        bottom:
          -HANDLE_SIZE /
          2,
      },
      cursor:
        'nesw-resize',
    },
    {
      corner: 'se',
      style: {
        right:
          -HANDLE_SIZE /
          2,
        bottom:
          -HANDLE_SIZE /
          2,
      },
      cursor:
        'nwse-resize',
    },
  ];

  return (
    <div
      style={{
        position:
          'fixed',
        left:
          rect.left,
        top:
          rect.top,
        width:
          rect.width,
        height:
          rect.height,
        zIndex:
          50000,
        pointerEvents:
          'none',
        border:
          '1.5px solid #ff245a',
        boxShadow:
          '0 0 0 1px rgba(255,255,255,.72)',
      }}
    >
      <div
        style={{
          position:
            'absolute',
          left: 0,
          top:
            -27,
          pointerEvents:
            'none',
        }}
        className="rounded-[6px] bg-[#ff245a] px-2 py-1 text-[8px] font-black text-white shadow"
      >
        GROUP · kéo góc để phóng/thu
      </div>

      {handles.map(
        (
          handle
        ) => (
          <button
            key={
              handle.corner
            }
            type="button"
            aria-label="Phóng to hoặc thu nhỏ cả group"
            onPointerDown={(
              event
            ) =>
              startScale(
                event,
                handle.corner
              )
            }
            style={{
              position:
                'absolute',
              width:
                HANDLE_SIZE,
              height:
                HANDLE_SIZE,
              borderRadius:
                999,
              border:
                '2px solid white',
              background:
                '#ff245a',
              boxShadow:
                '0 2px 8px rgba(0,0,0,.18)',
              pointerEvents:
                'auto',
              touchAction:
                'none',
              cursor:
                handle.cursor,
              ...handle.style,
            }}
          />
        )
      )}
    </div>
  );
};
