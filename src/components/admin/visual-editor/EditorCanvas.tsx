import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type {
  SceneCanvasDefinition,
  SceneElement,
  SceneElementFrame,
} from '../../../engine';

import {
  AnimatedElement,
  AnimatedTextContent,
  CurvedText,
  ImageShapeRenderer,
  PhotoFrameRenderer,
  isTextRevealPreset,
  resolvePhotoFrameStyle,
} from '../../../engine';

import {
  anchorTranslate,
  clamp,
  DeviceMode,
  getAnchorFactors,
  getEffectiveFrame,
  getGroupedSelectionIds,
} from './editorUtils';

interface Props {
  scene:
    SceneCanvasDefinition;

  device:
    DeviceMode;

  selectedElementIds:
    string[];

  zoom: number;

  gridEnabled: boolean;

  snapEnabled: boolean;

  onSelectionChange: (
    ids: string[]
  ) => void;

  onTransformStart:
    () => void;

  onFramesChange: (
    frames:
      Record<
        string,
        SceneElementFrame
      >
  ) => void;
}

interface MarqueeState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startClientX: number;
  startClientY: number;
  currentClientX: number;
  currentClientY: number;
  additive: boolean;
}

interface Guides {
  x?: number;
  y?: number;
}

const SNAP_THRESHOLD =
  1.15;

export const EditorCanvas:
React.FC<Props> = ({
  scene,
  device,
  selectedElementIds,
  zoom,
  gridEnabled,
  snapEnabled,
  onSelectionChange,
  onTransformStart,
  onFramesChange,
}) => {
  const canvasRef =
    useRef<HTMLDivElement>(
      null
    );

  const viewportRef =
    useRef<HTMLDivElement>(
      null
    );

  const [
    viewportWidth,
    setViewportWidth,
  ] = useState(900);

  useEffect(() => {
    const viewport =
      viewportRef.current;

    if (!viewport) {
      return;
    }

    const update = () =>
      setViewportWidth(
        viewport.clientWidth
      );

    update();

    const observer =
      new ResizeObserver(
        update
      );

    observer.observe(
      viewport
    );

    return () =>
      observer.disconnect();
  }, []);

  const [
    guides,
    setGuides,
  ] =
    useState<Guides>(
      {}
    );

  const [
    marquee,
    setMarquee,
  ] =
    useState<
      MarqueeState |
      null
    >(
      null
    );

  const selectedSet =
    useMemo(
      () =>
        new Set(
          selectedElementIds
        ),
      [
        selectedElementIds,
      ]
    );

  const primaryId =
    selectedElementIds[
      selectedElementIds
        .length -
        1
    ] ||
    '';

  const longPage =
    Boolean(
      scene.pageMode ===
        'long-page' ||
      (
        scene.pageMode !==
          'screen' &&
        (scene.minHeight || 0) >=
          1200 &&
        (scene.maxWidth || 0) >=
          1000
      )
    );

  const longPageHeight =
    Math.max(
      600,
      device === 'mobile'
        ? scene.mobileMinHeight ||
            scene.minHeight ||
            3200
        : scene.minHeight || 3200
    );

  const aspectRatio =
    longPage
      ? (
          device === 'mobile'
            ? 390 /
              longPageHeight
            : (scene.maxWidth ||
                1200) /
              longPageHeight
        )
      : device ===
          'mobile'
        ? 9 / 16
        : scene.aspectRatio ||
          16 / 9;

  const designWidth =
    device === 'mobile'
      ? 390
      : scene.maxWidth || 1200;

  const fitScale =
    Math.min(
      1,
      Math.max(
        0.1,
        (viewportWidth - 48) /
          designWidth
      )
    );

  const displayScale =
    fitScale *
    (zoom / 100);

  const designHeight =
    longPage
      ? longPageHeight
      : designWidth /
        aspectRatio;

  const background =
    scene.background ||
    {};

  const resolveClickSelection =
    (
      element:
        SceneElement,
      additive:
        boolean
    ) => {
      const grouped =
        getGroupedSelectionIds(
          scene,
          element.id
        );

      if (!additive) {
        return grouped;
      }

      const next =
        new Set(
          selectedElementIds
        );

      const allSelected =
        grouped.every(
          (id) =>
            next.has(
              id
            )
        );

      grouped.forEach(
        (id) => {
          if (
            allSelected
          ) {
            next.delete(
              id
            );
          } else {
            next.add(
              id
            );
          }
        }
      );

      return Array.from(
        next
      );
    };

  const snapDelta = (
    element:
      SceneElement,
    initialFrame:
      SceneElementFrame,
    dx: number,
    dy: number,
    activeIds:
      Set<string>,
    disableSnap:
      boolean
  ) => {
    if (
      !snapEnabled ||
      disableSnap
    ) {
      return {
        dx,
        dy,
        guides: {},
      };
    }

    const xCandidates = [
      0,
      50,
      100,
    ];

    const yCandidates = [
      0,
      50,
      100,
    ];

    scene.elements
      .filter(
        (item) =>
          !activeIds.has(
            item.id
          )
      )
      .forEach(
        (item) => {
          const frame =
            getEffectiveFrame(
              item,
              device
            );

          xCandidates.push(
            frame.x
          );

          yCandidates.push(
            frame.y
          );
        }
      );

    const proposedX =
      initialFrame.x +
      dx;

    const proposedY =
      initialFrame.y +
      dy;

    const threshold =
      SNAP_THRESHOLD *
      (
        100 /
        Math.max(
          25,
          zoom
        )
      );

    const nearestX =
      xCandidates
        .map(
          (value) => ({
            value,
            distance:
              Math.abs(
                value -
                proposedX
              ),
          })
        )
        .sort(
          (
            left,
            right
          ) =>
            left.distance -
            right.distance
        )[0];

    const nearestY =
      yCandidates
        .map(
          (value) => ({
            value,
            distance:
              Math.abs(
                value -
                proposedY
              ),
          })
        )
        .sort(
          (
            left,
            right
          ) =>
            left.distance -
            right.distance
        )[0];

    let nextDx =
      dx;

    let nextDy =
      dy;

    const nextGuides:
      Guides = {};

    if (
      nearestX &&
      nearestX.distance <=
        threshold
    ) {
      nextDx =
        nearestX.value -
        initialFrame.x;

      nextGuides.x =
        nearestX.value;
    }

    if (
      nearestY &&
      nearestY.distance <=
        threshold
    ) {
      nextDy =
        nearestY.value -
        initialFrame.y;

      nextGuides.y =
        nearestY.value;
    }

    return {
      dx: nextDx,
      dy: nextDy,
      guides:
        nextGuides,
    };
  };

  const startPointerOperation =
    (
      event:
        React.PointerEvent,
      element:
        SceneElement,
      mode:
        | 'drag'
        | 'resize'
        | 'resize-nw'
        | 'resize-ne'
        | 'resize-sw'
        | 'resize-se'
        | 'resize-top'
        | 'resize-bottom'
        | 'resize-left'
        | 'resize-right'
        | 'rotate'
    ) => {
      if (
        element.locked
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const canvas =
        canvasRef.current;

      if (!canvas) {
        return;
      }

      const additive =
        event.shiftKey ||
        event.metaKey ||
        event.ctrlKey;

      let nextSelection =
        selectedElementIds;

      if (
        !selectedSet.has(
          element.id
        )
      ) {
        nextSelection =
          resolveClickSelection(
            element,
            additive
          );

        onSelectionChange(
          nextSelection
        );
      }

      const activeIds =
        mode ===
        'drag'
          ? new Set<string>(
              nextSelection.length
                ? nextSelection
                : [
                    element.id,
                  ]
            )
          : new Set<string>([
              element.id,
            ]);

      const activeElements =
        scene.elements.filter(
          (item) =>
            activeIds.has(
              item.id
            ) &&
            !item.locked
        );

      if (
        activeElements.length ===
        0
      ) {
        return;
      }

      onTransformStart();

      const canvasRect =
        canvas
          .getBoundingClientRect();

      const startX =
        event.clientX;

      const startY =
        event.clientY;

      const initialFrames =
        new Map<
          string,
          SceneElementFrame
        >(
          activeElements.map(
            (item) => [
              item.id,
              getEffectiveFrame(
                item,
                device
              ),
            ]
          )
        );

      const primary =
        activeElements.find(
          (item) =>
            item.id ===
            element.id
        ) ||
        activeElements[0];

      const primaryFrame =
        initialFrames.get(
          primary.id
        )!;

      const targetRect =
        (
          event.currentTarget
            .closest(
              '[data-editor-element-id]'
            ) as
            HTMLElement |
            null
        )
          ?.getBoundingClientRect();

      const centerX =
        targetRect
          ? targetRect.left +
            targetRect.width /
              2
          : startX;

      const centerY =
        targetRect
          ? targetRect.top +
            targetRect.height /
              2
          : startY;

      const startAngle =
        Math.atan2(
          startY -
            centerY,
          startX -
            centerX
        );

      const handleMove =
        (
          moveEvent:
            PointerEvent
        ) => {
          let dxPercent =
            (
              moveEvent.clientX -
              startX
            ) /
            canvasRect.width *
            100;

          let dyPercent =
            (
              moveEvent.clientY -
              startY
            ) /
            canvasRect.height *
            100;

          if (
            mode ===
            'drag'
          ) {
            if (
              moveEvent.shiftKey
            ) {
              if (
                Math.abs(
                  dxPercent
                ) >
                Math.abs(
                  dyPercent
                )
              ) {
                dyPercent = 0;
              } else {
                dxPercent = 0;
              }
            }

            const snapped =
              snapDelta(
                primary,
                primaryFrame,
                dxPercent,
                dyPercent,
                activeIds,
                moveEvent.altKey
              );

            dxPercent =
              snapped.dx;

            dyPercent =
              snapped.dy;

            setGuides(
              snapped.guides
            );

            const nextFrames:
              Record<
                string,
                SceneElementFrame
              > = {};

            activeElements.forEach(
              (item) => {
                const frame =
                  initialFrames.get(
                    item.id
                  );

                if (!frame) {
                  return;
                }

                nextFrames[
                  item.id
                ] = {
                  ...frame,

                  x:
                    clamp(
                      frame.x +
                        dxPercent,
                      -100,
                      200
                    ),

                  y:
                    clamp(
                      frame.y +
                        dyPercent,
                      -100,
                      200
                    ),
                };
              }
            );

            onFramesChange(
              nextFrames
            );

            return;
          }

          const frame =
            initialFrames.get(
              element.id
            );

          if (!frame) {
            return;
          }

          const initialHeight =
            typeof frame.height === 'number' && frame.height > 0
              ? frame.height
              : targetRect && canvasRect.height > 0
                ? (targetRect.height / canvasRect.height) * 100
                : Math.max(8, frame.width * 0.4);

          const factors = getAnchorFactors(frame.anchor);

          // Horizontal edge: Left
          if (mode === 'resize-left') {
            const requestedWidth = frame.width - dxPercent;
            const width = clamp(requestedWidth, 1, 200);
            const widthDelta = width - frame.width;
            const x = frame.x - (1 - factors.x) * widthDelta;

            onFramesChange({
              [element.id]: {
                ...frame,
                x: clamp(x, -100, 200),
                width,
              },
            });
            return;
          }

          // Horizontal edge: Right
          if (mode === 'resize-right') {
            const requestedWidth = frame.width + dxPercent;
            const width = clamp(requestedWidth, 1, 200);
            const widthDelta = width - frame.width;
            const x = frame.x + factors.x * widthDelta;

            onFramesChange({
              [element.id]: {
                ...frame,
                x: clamp(x, -100, 200),
                width,
              },
            });
            return;
          }

          // Vertical edge: Top
          if (mode === 'resize-top') {
            const requestedHeight = initialHeight - dyPercent;
            const height = clamp(requestedHeight, 1, 200);
            const heightDelta = height - initialHeight;
            const y = frame.y - (1 - factors.y) * heightDelta;

            onFramesChange({
              [element.id]: {
                ...frame,
                y: clamp(y, -100, 200),
                height,
              },
            });
            return;
          }

          // Vertical edge: Bottom
          if (mode === 'resize-bottom') {
            const requestedHeight = initialHeight + dyPercent;
            const height = clamp(requestedHeight, 1, 200);
            const heightDelta = height - initialHeight;
            const y = frame.y + factors.y * heightDelta;

            onFramesChange({
              [element.id]: {
                ...frame,
                y: clamp(y, -100, 200),
                height,
              },
            });
            return;
          }

          // Corner: Top-Left (NW)
          if (mode === 'resize-nw') {
            let width: number;
            let height: number;
            if (moveEvent.shiftKey) {
              const scaleDelta =
                Math.abs(-dxPercent / frame.width) > Math.abs(-dyPercent / initialHeight)
                  ? -dxPercent / frame.width
                  : -dyPercent / initialHeight;
              width = clamp(frame.width * (1 + scaleDelta), 1, 200);
              height = clamp(initialHeight * (1 + scaleDelta), 1, 200);
            } else {
              width = clamp(frame.width - dxPercent, 1, 200);
              height = clamp(initialHeight - dyPercent, 1, 200);
            }
            const widthDelta = width - frame.width;
            const heightDelta = height - initialHeight;
            const x = frame.x - (1 - factors.x) * widthDelta;
            const y = frame.y - (1 - factors.y) * heightDelta;

            onFramesChange({
              [element.id]: {
                ...frame,
                x: clamp(x, -100, 200),
                y: clamp(y, -100, 200),
                width,
                height,
              },
            });
            return;
          }

          // Corner: Top-Right (NE)
          if (mode === 'resize-ne') {
            let width: number;
            let height: number;
            if (moveEvent.shiftKey) {
              const scaleDelta =
                Math.abs(dxPercent / frame.width) > Math.abs(-dyPercent / initialHeight)
                  ? dxPercent / frame.width
                  : -dyPercent / initialHeight;
              width = clamp(frame.width * (1 + scaleDelta), 1, 200);
              height = clamp(initialHeight * (1 + scaleDelta), 1, 200);
            } else {
              width = clamp(frame.width + dxPercent, 1, 200);
              height = clamp(initialHeight - dyPercent, 1, 200);
            }
            const widthDelta = width - frame.width;
            const heightDelta = height - initialHeight;
            const x = frame.x + factors.x * widthDelta;
            const y = frame.y - (1 - factors.y) * heightDelta;

            onFramesChange({
              [element.id]: {
                ...frame,
                x: clamp(x, -100, 200),
                y: clamp(y, -100, 200),
                width,
                height,
              },
            });
            return;
          }

          // Corner: Bottom-Left (SW)
          if (mode === 'resize-sw') {
            let width: number;
            let height: number;
            if (moveEvent.shiftKey) {
              const scaleDelta =
                Math.abs(-dxPercent / frame.width) > Math.abs(dyPercent / initialHeight)
                  ? -dxPercent / frame.width
                  : dyPercent / initialHeight;
              width = clamp(frame.width * (1 + scaleDelta), 1, 200);
              height = clamp(initialHeight * (1 + scaleDelta), 1, 200);
            } else {
              width = clamp(frame.width - dxPercent, 1, 200);
              height = clamp(initialHeight + dyPercent, 1, 200);
            }
            const widthDelta = width - frame.width;
            const heightDelta = height - initialHeight;
            const x = frame.x - (1 - factors.x) * widthDelta;
            const y = frame.y + factors.y * heightDelta;

            onFramesChange({
              [element.id]: {
                ...frame,
                x: clamp(x, -100, 200),
                y: clamp(y, -100, 200),
                width,
                height,
              },
            });
            return;
          }

          // Corner: Bottom-Right (SE or default resize)
          if (mode === 'resize-se' || mode === 'resize') {
            let width: number;
            let height: number;
            if (moveEvent.shiftKey) {
              const scaleDelta =
                Math.abs(dxPercent / frame.width) > Math.abs(dyPercent / initialHeight)
                  ? dxPercent / frame.width
                  : dyPercent / initialHeight;
              width = clamp(frame.width * (1 + scaleDelta), 1, 200);
              height = clamp(initialHeight * (1 + scaleDelta), 1, 200);
            } else {
              width = clamp(frame.width + dxPercent, 1, 200);
              height = clamp(initialHeight + dyPercent, 1, 200);
            }
            const widthDelta = width - frame.width;
            const heightDelta = height - initialHeight;
            const x = frame.x + factors.x * widthDelta;
            const y = frame.y + factors.y * heightDelta;

            onFramesChange({
              [element.id]: {
                ...frame,
                x: clamp(x, -100, 200),
                y: clamp(y, -100, 200),
                width,
                height,
              },
            });
            return;
          }

          const currentAngle =
            Math.atan2(
              moveEvent.clientY -
                centerY,
              moveEvent.clientX -
                centerX
            );

          let rotate =
            (
              frame.rotate ||
              0
            ) +
            (
              currentAngle -
              startAngle
            ) *
              180 /
              Math.PI;

          if (
            moveEvent.shiftKey
          ) {
            rotate =
              Math.round(
                rotate /
                  15
              ) *
              15;
          }

          onFramesChange({
            [element.id]: {
              ...frame,
              rotate:
                Math.round(
                  rotate
                ),
            },
          });
        };

      const handleUp =
        () => {
          setGuides(
            {}
          );

          window.removeEventListener(
            'pointermove',
            handleMove
          );

          window.removeEventListener(
            'pointerup',
            handleUp
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

  const beginMarquee =
    (
      event:
        React.PointerEvent<
          HTMLDivElement
        >
    ) => {
      if (
        event.button !==
        0 ||
        event.target !==
        event.currentTarget
      ) {
        return;
      }

      const canvas =
        canvasRef.current;

      if (!canvas) {
        return;
      }

      event.preventDefault();

      const rect =
        canvas
          .getBoundingClientRect();

      const percentX =
        clamp(
          (
            event.clientX -
            rect.left
          ) /
            rect.width *
            100,
          0,
          100
        );

      const percentY =
        clamp(
          (
            event.clientY -
            rect.top
          ) /
            rect.height *
            100,
          0,
          100
        );

      const additive =
        event.shiftKey ||
        event.metaKey ||
        event.ctrlKey;

      const start:
        MarqueeState = {
        startX:
          percentX,
        startY:
          percentY,
        currentX:
          percentX,
        currentY:
          percentY,
        startClientX:
          event.clientX,
        startClientY:
          event.clientY,
        currentClientX:
          event.clientX,
        currentClientY:
          event.clientY,
        additive,
      };

      setMarquee(
        start
      );

      const handleMove =
        (
          moveEvent:
            PointerEvent
        ) => {
          const nextX =
            clamp(
              (
                moveEvent.clientX -
                rect.left
              ) /
                rect.width *
                100,
              0,
              100
            );

          const nextY =
            clamp(
              (
                moveEvent.clientY -
                rect.top
              ) /
                rect.height *
                100,
              0,
              100
            );

          setMarquee(
            (current) =>
              current
                ? {
                    ...current,
                    currentX:
                      nextX,
                    currentY:
                      nextY,
                    currentClientX:
                      moveEvent.clientX,
                    currentClientY:
                      moveEvent.clientY,
                  }
                : current
          );
        };

      const handleUp =
        (
          upEvent:
            PointerEvent
        ) => {
          const endClientX =
            upEvent.clientX;

          const endClientY =
            upEvent.clientY;

          const moved =
            Math.hypot(
              endClientX -
                start.startClientX,
              endClientY -
                start.startClientY
            );

          if (
            moved <
            4
          ) {
            if (
              !start.additive
            ) {
              onSelectionChange(
                []
              );
            }
          } else {
            const selectionRect = {
              left:
                Math.min(
                  start.startClientX,
                  endClientX
                ),
              right:
                Math.max(
                  start.startClientX,
                  endClientX
                ),
              top:
                Math.min(
                  start.startClientY,
                  endClientY
                ),
              bottom:
                Math.max(
                  start.startClientY,
                  endClientY
                ),
            };

            const hits =
              new Set<
                string
              >();

            canvas
              .querySelectorAll<
                HTMLElement
              >(
                '[data-editor-element-id]'
              )
              .forEach(
                (
                  node
                ) => {
                  const itemRect =
                    node.getBoundingClientRect();

                  const intersects =
                    itemRect.right >=
                      selectionRect.left &&
                    itemRect.left <=
                      selectionRect.right &&
                    itemRect.bottom >=
                      selectionRect.top &&
                    itemRect.top <=
                      selectionRect.bottom;

                  if (!intersects) {
                    return;
                  }

                  const id =
                    node.dataset
                      .editorElementId;

                  if (!id) {
                    return;
                  }

                  getGroupedSelectionIds(
                    scene,
                    id
                  ).forEach(
                    (
                      groupId
                    ) =>
                      hits.add(
                        groupId
                      )
                  );
                }
              );

            const next =
              start.additive
                ? Array.from(
                    new Set([
                      ...selectedElementIds,
                      ...hits,
                    ])
                  )
                : Array.from(
                    hits
                  );

            onSelectionChange(
              next
            );
          }

          setMarquee(
            null
          );

          window.removeEventListener(
            'pointermove',
            handleMove
          );

          window.removeEventListener(
            'pointerup',
            handleUp
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

  return (
    <section className="min-w-0 overflow-hidden rounded-[11px] border border-black/8 bg-[#eeeeec] p-2 sm:p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-black/30">
          Khung vẽ ·{' '}
          {device ===
          'desktop'
            ? 'Máy tính'
            : 'Điện thoại'}
        </p>

        <p className="text-[9px] text-black/30">
          Shift + kéo = khóa trục · Alt + kéo = tắt bắt dính · Co giãn luôn giữ tỉ lệ · Alt + co giãn = tự do
        </p>
      </div>

      <div
        ref={viewportRef}
        className={[
          'relative flex h-[calc(100svh-330px)] min-h-[420px] max-h-[760px] justify-center overflow-auto rounded-[9px] bg-[#deddd9] p-3 sm:p-5',
          longPage
            ? 'items-start'
            : 'items-center',
        ].join(' ')}
      >
        <div
          style={{
            width:
              `${designWidth * displayScale}px`,
            height:
              `${designHeight * displayScale}px`,
          }}
          className={[
            'relative shrink-0',
            longPage
              ? 'items-start'
              : 'items-center',
          ].join(' ')}
        >
          <div
            ref={
              canvasRef
            }
            onPointerDown={
              beginMarquee
            }
            style={{
              aspectRatio:
                String(
                  aspectRatio
                ),

              width:
                `${designWidth}px`,

              transform:
                `scale(${displayScale})`,

              transformOrigin:
                'top left',

              backgroundColor:
                background.color ||
                '#ffffff',

              overflow:
                scene.overflow ||
                'hidden',
            }}
            className="absolute left-0 top-0 isolate shrink-0 select-none shadow-[0_18px_55px_rgba(0,0,0,0.14)]"
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

                  filter: [
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

                  zIndex:
                    -1000,
                }}
                className="pointer-events-none absolute inset-0 h-full w-full select-none"
              />
            )}

            {background
              .overlayColor &&
              (
                background
                  .overlayOpacity ||
                0
              ) >
                0 && (
              <div
                style={{
                  background:
                    background
                      .overlayColor,
                  opacity:
                    background
                      .overlayOpacity ||
                    0,
                  zIndex:
                    -999,
                }}
                className="pointer-events-none absolute inset-0"
              />
            )}

            {gridEnabled && (
              <div
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(174,45,76,.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(174,45,76,.12) 1px, transparent 1px)',
                  backgroundSize:
                    '5% 5%',
                  zIndex:
                    20000,
                }}
                className="pointer-events-none absolute inset-0"
              />
            )}

            {longPage && (
              <div
                style={{
                  top: `${Math.min(
                    99,
                    ((device === 'mobile'
                      ? 390 / (9 / 16)
                      : (scene.maxWidth || 1200) / (16 / 9)) /
                      longPageHeight) *
                      100
                  )}%`,
                  zIndex: 21000,
                }}
                className="pointer-events-none absolute left-0 right-0 border-t-2 border-dashed border-sky-500"
              >
                <span className="absolute right-2 top-1 rounded bg-sky-600 px-2 py-1 text-[8px] font-black text-white shadow-sm">
                  Hết màn hình đầu · phần dưới cần cuộn
                </span>
              </div>
            )}

            {typeof guides.x ===
              'number' && (
              <div
                style={{
                  left:
                    `${guides.x}%`,
                  zIndex:
                    22000,
                }}
                className="pointer-events-none absolute bottom-0 top-0 w-px bg-[#ff245a]"
              />
            )}

            {typeof guides.y ===
              'number' && (
              <div
                style={{
                  top:
                    `${guides.y}%`,
                  zIndex:
                    22000,
                }}
                className="pointer-events-none absolute left-0 right-0 h-px bg-[#ff245a]"
              />
            )}

            {scene.elements.map(
              (
                element
              ) => (
                <EditableCanvasElement
                  key={
                    element.id
                  }
                  element={
                    element
                  }
                  device={
                    device
                  }
                  selected={
                    selectedSet.has(
                      element.id
                    )
                  }
                  primary={
                    primaryId ===
                    element.id
                  }
                  multiSelection={
                    selectedElementIds
                      .length >
                    1
                  }
                  onClickSelect={(
                    event
                  ) => {
                    const additive =
                      event.shiftKey ||
                      event.metaKey ||
                      event.ctrlKey;

                    onSelectionChange(
                      resolveClickSelection(
                        element,
                        additive
                      )
                    );
                  }}
                  onPointerOperation={(
                    event,
                    mode
                  ) =>
                    startPointerOperation(
                      event,
                      element,
                      mode
                    )
                  }
                />
              )
            )}

            {marquee && (
              <div
                style={{
                  left:
                    `${Math.min(
                      marquee.startX,
                      marquee.currentX
                    )}%`,
                  top:
                    `${Math.min(
                      marquee.startY,
                      marquee.currentY
                    )}%`,
                  width:
                    `${Math.abs(
                      marquee.currentX -
                        marquee.startX
                    )}%`,
                  height:
                    `${Math.abs(
                      marquee.currentY -
                        marquee.startY
                    )}%`,
                  zIndex:
                    30000,
                }}
                className="pointer-events-none absolute border border-[#ff245a] bg-[#ff245a]/10"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const EditableCanvasElement:
React.FC<{
  element:
    SceneElement;

  device:
    DeviceMode;

  selected:
    boolean;

  primary:
    boolean;

  multiSelection:
    boolean;

  onClickSelect: (
    event:
      React.MouseEvent
  ) => void;

  onPointerOperation: (
    event:
      React.PointerEvent,
    mode:
      | 'drag'
      | 'resize'
      | 'resize-nw'
      | 'resize-ne'
      | 'resize-sw'
      | 'resize-se'
      | 'resize-top'
      | 'resize-bottom'
      | 'resize-left'
      | 'resize-right'
      | 'rotate'
  ) => void;
}> = ({
  element,
  device,
  selected,
  primary,
  multiSelection,
  onClickSelect,
  onPointerOperation,
}) => {
  const visible =
    device === 'mobile'
      ? element.mobileVisible ?? element.visible !== false
      : element.desktopVisible ?? element.visible !== false;

  if (!visible) {
    return null;
  }

  const frame =
    getEffectiveFrame(
      element,
      device
    );

  const translate =
    anchorTranslate(
      frame.anchor
    );

  return (
    <div
      data-editor-element-id={
        element.id
      }
      onPointerDown={(
        event
      ) =>
        onPointerOperation(
          event,
          'drag'
        )
      }
      onClick={(
        event
      ) => {
        event.stopPropagation();

        const additive =
          event.shiftKey ||
          event.metaKey ||
          event.ctrlKey;

        if (
          selected &&
          !additive
        ) {
          return;
        }

        onClickSelect(
          event
        );
      }}
      style={{
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
          frame.zIndex ||
          1,

        opacity:
          frame.opacity ??
          1,

        transform:
          `translate(${translate}) rotate(${frame.rotate || 0}deg) scale(${frame.scale || 1})`,
      }}
      className={[
        'touch-none',
        element.locked
          ? 'cursor-not-allowed'
          : 'cursor-move',
        selected
          ? 'outline outline-2 outline-[#ff245a] outline-offset-2'
          : 'hover:outline hover:outline-1 hover:outline-[#ff245a]/35',
      ].join(' ')}
    >
      <AnimatedElement
        replayKey={
          [
            element.id,
            element.animation
              ?.preset ||
              'none',
            element.animation
              ?.durationMs ||
              0,
            element.animation
              ?.delayMs ||
              0,
            element.animation
              ?.easing ||
              '',
          ].join('-')
        }
        animation={
          element.type ===
            'text' &&
          isTextRevealPreset(
            element.animation
              ?.preset
          )
            ? {
                ...element.animation,
                preset:
                  'none',
                delayMs: 0,
                durationMs: 0,
              }
            : element.animation
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
        <EditorElementContent
          element={
            element
          }
          device={
            device
          }
        />
      </AnimatedElement>

      {element.locked &&
      selected && (
        <div className="pointer-events-none absolute -right-2 -top-2 z-[60] rounded-full bg-amber-500 px-1.5 py-1 text-[7px] font-black text-white shadow">
          🔒
        </div>
      )}

      {selected &&
      primary &&
      !multiSelection &&
      !element.locked && (
        <>
          {/* Dashed selection border outline */}
          <div className="pointer-events-none absolute -inset-[5px] border border-dashed border-[#ff245a]/60" />

          {/* 4 Corner resize handles (NW, NE, SW, SE) */}
          <button
            type="button"
            aria-label="Kéo góc trên trái"
            title="Kéo co giãn cả 2 chiều (Góc trên trái)"
            onPointerDown={(event) =>
              onPointerOperation(event, 'resize-nw')
            }
            className="absolute -left-2 -top-2 z-50 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-white bg-[#ff245a] shadow transition-transform hover:scale-125"
          />

          <button
            type="button"
            aria-label="Kéo góc trên phải"
            title="Kéo co giãn cả 2 chiều (Góc trên phải)"
            onPointerDown={(event) =>
              onPointerOperation(event, 'resize-ne')
            }
            className="absolute -right-2 -top-2 z-50 h-4 w-4 cursor-nesw-resize rounded-full border-2 border-white bg-[#ff245a] shadow transition-transform hover:scale-125"
          />

          <button
            type="button"
            aria-label="Kéo góc dưới trái"
            title="Kéo co giãn cả 2 chiều (Góc dưới trái)"
            onPointerDown={(event) =>
              onPointerOperation(event, 'resize-sw')
            }
            className="absolute -bottom-2 -left-2 z-50 h-4 w-4 cursor-nesw-resize rounded-full border-2 border-white bg-[#ff245a] shadow transition-transform hover:scale-125"
          />

          <button
            type="button"
            aria-label="Kéo góc dưới phải"
            title="Kéo co giãn cả 2 chiều (Góc dưới phải)"
            onPointerDown={(event) =>
              onPointerOperation(event, 'resize-se')
            }
            className="absolute -bottom-2 -right-2 z-50 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-white bg-[#ff245a] shadow transition-transform hover:scale-125"
          />

          {/* 4 Edge resize handles (Top, Bottom, Left, Right) */}
          <button
            type="button"
            aria-label="Kéo chiều dọc phía trên"
            title="Kéo riêng chiều dọc (Trên)"
            onPointerDown={(event) =>
              onPointerOperation(event, 'resize-top')
            }
            className="absolute left-1/2 -top-2 z-50 h-3.5 w-8 -translate-x-1/2 cursor-ns-resize rounded-full border-2 border-white bg-[#ff245a] shadow transition-transform hover:scale-110"
          />

          <button
            type="button"
            aria-label="Kéo chiều dọc phía dưới"
            title="Kéo riêng chiều dọc (Dưới)"
            onPointerDown={(event) =>
              onPointerOperation(event, 'resize-bottom')
            }
            className="absolute left-1/2 -bottom-2 z-50 h-3.5 w-8 -translate-x-1/2 cursor-ns-resize rounded-full border-2 border-white bg-[#ff245a] shadow transition-transform hover:scale-110"
          />

          <button
            type="button"
            aria-label="Kéo rộng sang trái"
            title="Kéo riêng chiều ngang (Trái)"
            onPointerDown={(event) =>
              onPointerOperation(event, 'resize-left')
            }
            className="absolute -left-2 top-1/2 z-50 h-8 w-3.5 -translate-y-1/2 cursor-ew-resize rounded-full border-2 border-white bg-[#ff245a] shadow transition-transform hover:scale-110"
          />

          <button
            type="button"
            aria-label="Kéo rộng sang phải"
            title="Kéo riêng chiều ngang (Phải)"
            onPointerDown={(event) =>
              onPointerOperation(event, 'resize-right')
            }
            className="absolute -right-2 top-1/2 z-50 h-8 w-3.5 -translate-y-1/2 cursor-ew-resize rounded-full border-2 border-white bg-[#ff245a] shadow transition-transform hover:scale-110"
          />

          {/* Rotation Handle */}
          <div className="pointer-events-none absolute -top-8 left-1/2 h-7 w-px -translate-x-1/2 bg-[#ff245a]/60" />

          <button
            type="button"
            aria-label="Xoay"
            title="Xoay đối tượng (Giữ Shift để bước xoay 15°)"
            onPointerDown={(event) =>
              onPointerOperation(event, 'rotate')
            }
            className="absolute -top-10 left-1/2 z-50 h-5 w-5 -translate-x-1/2 cursor-grab rounded-full border-2 border-white bg-[#191919] shadow transition-transform hover:scale-125 active:cursor-grabbing"
          />
        </>
      )}
    </div>
  );
};

const EditorElementContent:
React.FC<{
  element:
    SceneElement;

  device:
    DeviceMode;
}> = ({
  element,
  device,
}) => {
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
      device ===
      'mobile'
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
          pathId={`editor-curved-text-${element.id}-${device}`}
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
            `${element.id}-${element.animation?.preset || 'none'}-${element.animation?.durationMs || 0}-${element.animation?.delayMs || 0}`
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
      device === 'mobile'
        ? element.mobileSrc || element.src
        : element.src;

    return (
      <ImageShapeRenderer
        src={source}
        alt=""
        style={style}
        isEditor={true}
        placeholder={
          <div className="flex h-full min-h-16 w-full items-center justify-center border border-dashed border-black/15 bg-white/70 px-2 text-center text-[9px] font-bold text-black/30">
            Chọn ảnh từ kho tài nguyên
          </div>
        }
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
        device={device}
        isEditor
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
        <div className="flex h-full w-full items-center">
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
      element
        .buttonStyle ||
      {};

    const mobileStyle =
      element.mobileButtonStyle ||
      (desktopStyle as any).mobile ||
      {};

    const style =
      device ===
      'mobile'
        ? {
            ...desktopStyle,
            ...mobileStyle,
          }
        : desktopStyle;

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
            'center',
          fontStyle:
            style.fontStyle,
          textDecoration:
            style.textDecoration,
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
          boxShadow:
            style.boxShadow,
        }}
        className="flex items-center justify-center"
      >
        {element.label}
      </div>
    );
  }

  return (
    <div className="flex min-h-10 items-center justify-center bg-white/60 text-[10px] text-black/40">
      Custom
    </div>
  );
};
