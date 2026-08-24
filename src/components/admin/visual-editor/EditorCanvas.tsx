import React, {
  useRef,
} from 'react';

import type {
  SceneCanvasDefinition,
  SceneElement,
  SceneElementFrame,
} from '../../../engine';

import {
  anchorTranslate,
  clamp,
  DeviceMode,
  getEffectiveFrame,
} from './editorUtils';

interface Props {
  scene:
    SceneCanvasDefinition;

  device:
    DeviceMode;

  selectedElementId:
    string;

  onSelect: (
    id: string
  ) => void;

  onClearSelection:
    () => void;

  onFrameChange: (
    id: string,
    frame:
      SceneElementFrame
  ) => void;
}

export const EditorCanvas:
React.FC<Props> = ({
  scene,
  device,
  selectedElementId,
  onSelect,
  onClearSelection,
  onFrameChange,
}) => {
  const canvasRef =
    useRef<HTMLDivElement>(
      null
    );

  const aspectRatio =
    device ===
    'mobile'
      ? 9 / 16
      : scene.aspectRatio ||
        16 / 9;

  const background =
    scene.background ||
    {};

  const startPointerOperation =
    (
      event:
        React.PointerEvent,
      element:
        SceneElement,
      mode:
        | 'drag'
        | 'resize'
        | 'rotate'
    ) => {
      if (
        element.locked
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      onSelect(
        element.id
      );

      const canvas =
        canvasRef.current;

      if (!canvas) {
        return;
      }

      const canvasRect =
        canvas
          .getBoundingClientRect();

      const initialFrame =
        getEffectiveFrame(
          element,
          device
        );

      const startX =
        event.clientX;

      const startY =
        event.clientY;

      const targetRect =
        (
          event.currentTarget
            .closest(
              '[data-editor-element]'
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
          const dxPercent =
            (
              moveEvent.clientX -
              startX
            ) /
            canvasRect.width *
            100;

          const dyPercent =
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
            onFrameChange(
              element.id,
              {
                ...initialFrame,

                x:
                  clamp(
                    initialFrame.x +
                      dxPercent,
                    -50,
                    150
                  ),

                y:
                  clamp(
                    initialFrame.y +
                      dyPercent,
                    -50,
                    150
                  ),
              }
            );

            return;
          }

          if (
            mode ===
            'resize'
          ) {
            onFrameChange(
              element.id,
              {
                ...initialFrame,

                width:
                  clamp(
                    initialFrame.width +
                      dxPercent,
                    2,
                    180
                  ),

                height:
                  typeof initialFrame
                    .height ===
                    'number'
                    ? clamp(
                        initialFrame
                          .height +
                          dyPercent,
                        2,
                        180
                      )
                    : initialFrame
                        .height,
              }
            );

            return;
          }

          const currentAngle =
            Math.atan2(
              moveEvent.clientY -
                centerY,
              moveEvent.clientX -
                centerX
            );

          const delta =
            (
              currentAngle -
              startAngle
            ) *
            180 /
            Math.PI;

          onFrameChange(
            element.id,
            {
              ...initialFrame,

              rotate:
                Math.round(
                  (
                    initialFrame
                      .rotate ||
                    0
                  ) +
                  delta
                ),
            }
          );
        };

      const handleUp =
        () => {
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
    <section className="min-w-0 rounded-[14px] border border-black/8 bg-[#eeeeec] p-3 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-black/30">
          Canvas ·{' '}
          {device ===
          'desktop'
            ? 'Desktop'
            : 'Mobile'}
        </p>

        <p className="text-[9px] text-black/30">
          Click nền để chỉnh scene
        </p>
      </div>

      <div className="flex min-h-[500px] items-center justify-center overflow-auto rounded-[12px] bg-[#deddd9] p-3 sm:p-5">
        <div
          ref={
            canvasRef
          }
          onPointerDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              onClearSelection();
            }
          }}
          style={{
            aspectRatio:
              String(
                aspectRatio
              ),

            width:
              device ===
              'mobile'
                ? 'min(100%, 360px)'
                : 'min(100%, 900px)',

            backgroundColor:
              background.color ||
              '#ffffff',

            backgroundImage:
              background.imageUrl
                ? `url("${background.imageUrl}")`
                : undefined,

            backgroundSize:
              background.imageFit ||
              'cover',

            backgroundPosition:
              'center',

            overflow:
              scene.overflow ||
              'hidden',
          }}
          className="relative shrink-0 select-none shadow-[0_18px_55px_rgba(0,0,0,0.14)]"
        >
          {background
            .imageUrl && (
            <div
              style={{
                background:
                  background
                    .overlayColor ||
                  '#000000',

                opacity:
                  background
                    .overlayOpacity ||
                  0,
              }}
              className="pointer-events-none absolute inset-0 z-0"
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
                  selectedElementId ===
                  element.id
                }
                onSelect={() =>
                  onSelect(
                    element.id
                  )
                }
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

  onSelect:
    () => void;

  onPointerOperation: (
    event:
      React.PointerEvent,
    mode:
      | 'drag'
      | 'resize'
      | 'rotate'
  ) => void;
}> = ({
  element,
  device,
  selected,
  onSelect,
  onPointerOperation,
}) => {
  if (
    element.visible ===
    false
  ) {
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
      data-editor-element
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
        onSelect();
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
      <EditorElementContent
        element={
          element
        }
      />

      {selected &&
      !element.locked && (
        <>
          <div className="pointer-events-none absolute -inset-[5px] border border-dashed border-[#ff245a]/60" />

          <button
            type="button"
            aria-label="Resize"
            onPointerDown={(
              event
            ) =>
              onPointerOperation(
                event,
                'resize'
              )
            }
            className="absolute -bottom-2.5 -right-2.5 z-50 h-5 w-5 cursor-nwse-resize rounded-full border-2 border-white bg-[#ff245a] shadow"
          />

          <div className="pointer-events-none absolute -top-8 left-1/2 h-7 w-px -translate-x-1/2 bg-[#ff245a]/60" />

          <button
            type="button"
            aria-label="Rotate"
            onPointerDown={(
              event
            ) =>
              onPointerOperation(
                event,
                'rotate'
              )
            }
            className="absolute -top-10 left-1/2 z-50 h-5 w-5 -translate-x-1/2 cursor-grab rounded-full border-2 border-white bg-[#191919] shadow active:cursor-grabbing"
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
}> = ({
  element,
}) => {
  if (
    element.type ===
    'text'
  ) {
    const style =
      element.textStyle ||
      {};

    return (
      <div
        style={{
          width: '100%',
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
          fontStyle:
            style.fontStyle,
          whiteSpace:
            style.whiteSpace ||
            'pre-line',
        }}
        className="break-words"
      >
        {element.text}
      </div>
    );
  }

  if (
    element.type ===
      'image' ||
    element.type ===
      'decor'
  ) {
    return (
      <img
        src={
          element.src
        }
        alt=""
        draggable={
          false
        }
        style={{
          objectFit:
            element
              .imageStyle
              ?.objectFit ||
            'contain',

          borderRadius:
            element
              .imageStyle
              ?.borderRadius,

          boxShadow:
            element
              .imageStyle
              ?.boxShadow,

          background:
            element
              .imageStyle
              ?.background,
        }}
        className="h-full w-full select-none"
      />
    );
  }

  if (
    element.type ===
    'button'
  ) {
    const style =
      element
        .buttonStyle ||
      {};

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
        className="flex items-center justify-center text-center"
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
