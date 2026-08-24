import React from 'react';

import type {
  SceneCanvasDefinition,
  SceneElement,
  SceneElementAction,
  SceneElementFrame,
} from '../../../engine';

import {
  VISUAL_EDITOR_ANIMATION_PRESETS,
  VISUAL_EDITOR_TRANSITION_PRESETS,
} from '../../../templates/visualEditor';

import {
  DeviceMode,
  getEffectiveFrame,
  getElementLabel,
} from './editorUtils';

import {
  ColorInput,
  InspectorSection,
  InspectorTitle,
  NumberInput,
  RangeInput,
  SelectInput,
  SmallButton,
  TextAreaInput,
  TextInput,
} from './EditorControls';

interface Props {
  scene:
    SceneCanvasDefinition;

  elements:
    SceneElement[];

  device:
    DeviceMode;

  scenes:
    SceneCanvasDefinition[];

  onSceneChange: (
    patch:
      Partial<
        SceneCanvasDefinition
      >
  ) => void;

  onElementChange: (
    elementId: string,
    updater: (
      element:
        SceneElement
    ) =>
      SceneElement
  ) => void;

  onFrameChange: (
    elementId: string,
    frame:
      SceneElementFrame
  ) => void;

  onDuplicate:
    () => void;

  onDelete:
    () => void;

  onLayerUp:
    () => void;

  onLayerDown:
    () => void;

  onToggleLock:
    () => void;
}

export const InspectorPanel:
React.FC<Props> = ({
  scene,
  elements,
  device,
  scenes,
  onSceneChange,
  onElementChange,
  onFrameChange,
  onDuplicate,
  onDelete,
  onLayerUp,
  onLayerDown,
  onToggleLock,
}) => {
  if (
    elements.length ===
    0
  ) {
    return (
      <aside className="max-h-[calc(100svh-330px)] min-w-0 overflow-y-auto rounded-[11px] border border-black/8 bg-white p-3">
        <SceneInspector
          scene={
            scene
          }
          onChange={
            onSceneChange
          }
        />
      </aside>
    );
  }

  if (
    elements.length >
    1
  ) {
    return (
      <aside className="max-h-[calc(100svh-330px)] min-w-0 overflow-y-auto rounded-[11px] border border-black/8 bg-white p-3">
        <MultiInspector
          elements={
            elements
          }
          onDuplicate={
            onDuplicate
          }
          onDelete={
            onDelete
          }
          onLayerUp={
            onLayerUp
          }
          onLayerDown={
            onLayerDown
          }
          onToggleLock={
            onToggleLock
          }
        />
      </aside>
    );
  }

  const element =
    elements[0];

  return (
    <aside className="max-h-[calc(100svh-330px)] min-w-0 overflow-y-auto rounded-[11px] border border-black/8 bg-white p-3">
      <ElementInspector
        element={
          element
        }
        device={
          device
        }
        scene={
          scene
        }
        scenes={
          scenes
        }
        onChange={(
          updater
        ) =>
          onElementChange(
            element.id,
            updater
          )
        }
        onFrameChange={(
          frame
        ) =>
          onFrameChange(
            element.id,
            frame
          )
        }
        onDuplicate={
          onDuplicate
        }
        onDelete={
          onDelete
        }
        onLayerUp={
          onLayerUp
        }
        onLayerDown={
          onLayerDown
        }
        onToggleLock={
          onToggleLock
        }
      />
    </aside>
  );
};

const SceneInspector:
React.FC<{
  scene:
    SceneCanvasDefinition;

  onChange: (
    patch:
      Partial<
        SceneCanvasDefinition
      >
  ) => void;
}> = ({
  scene,
  onChange,
}) => {
  const background =
    scene.background ||
    {};

  return (
    <div>
      <InspectorTitle
        title="Scene"
        description="Không chọn element nào — đang chỉnh canvas."
      />

      <div className="mt-4 space-y-3">
        <TextInput
          label="Tên scene"
          value={
            scene.title ||
            ''
          }
          onChange={(
            title
          ) =>
            onChange({
              title,
            })
          }
        />

        <SelectInput
          label="Tỉ lệ canvas desktop"
          value={
            String(
              scene.aspectRatio ||
              16 / 9
            )
          }
          options={[
            {
              value:
                String(
                  16 / 9
                ),
              label:
                '16:9 · Landscape',
            },
            {
              value:
                String(
                  4 / 3
                ),
              label:
                '4:3',
            },
            {
              value:
                '1',
              label:
                '1:1 · Square',
            },
            {
              value:
                String(
                  4 / 5
                ),
              label:
                '4:5 · Social',
            },
            {
              value:
                String(
                  9 / 16
                ),
              label:
                '9:16 · Story',
            },
          ]}
          onChange={(
            value
          ) =>
            onChange({
              aspectRatio:
                Number(
                  value
                ),
            })
          }
        />

        <SelectInput
          label="Transition"
          value={
            scene.transition
              ?.preset ||
            'fade'
          }
          options={
            VISUAL_EDITOR_TRANSITION_PRESETS
          }
          onChange={(
            preset
          ) =>
            onChange({
              transition: {
                ...scene.transition,
                preset:
                  preset as any,
                durationMs:
                  scene.transition
                    ?.durationMs ||
                  420,
                easing:
                  scene.transition
                    ?.easing ||
                  'easeOut',
              },
            })
          }
        />

        <NumberInput
          label="Transition"
          value={
            scene.transition
              ?.durationMs ||
            420
          }
          min={0}
          max={5000}
          step={20}
          suffix="ms"
          onChange={(
            durationMs
          ) =>
            onChange({
              transition: {
                ...scene.transition,
                preset:
                  scene.transition
                    ?.preset ||
                  'fade',
                durationMs,
                easing:
                  scene.transition
                    ?.easing ||
                  'easeOut',
              },
            })
          }
        />

        <ColorInput
          label="Màu nền"
          value={
            background.color ||
            '#ffffff'
          }
          onChange={(
            color
          ) =>
            onChange({
              background: {
                ...background,
                color,
              },
            })
          }
        />

        <TextInput
          label="Ảnh nền URL / path"
          value={
            background
              .imageUrl ||
            ''
          }
          placeholder="/images/..."
          onChange={(
            imageUrl
          ) =>
            onChange({
              background: {
                ...background,
                imageUrl:
                  imageUrl ||
                  undefined,
              },
            })
          }
        />

        <SelectInput
          label="Ảnh nền fit"
          value={
            background
              .imageFit ||
            'cover'
          }
          options={[
            {
              value:
                'cover',
              label:
                'Cover',
            },
            {
              value:
                'contain',
              label:
                'Contain',
            },
          ]}
          onChange={(
            imageFit
          ) =>
            onChange({
              background: {
                ...background,
                imageFit:
                  imageFit as
                    'cover' |
                    'contain',
              },
            })
          }
        />

        <ColorInput
          label="Overlay"
          value={
            background
              .overlayColor ||
            '#000000'
          }
          onChange={(
            overlayColor
          ) =>
            onChange({
              background: {
                ...background,
                overlayColor,
              },
            })
          }
        />

        <RangeInput
          label="Overlay opacity"
          value={
            background
              .overlayOpacity ||
            0
          }
          min={0}
          max={1}
          step={0.05}
          onChange={(
            overlayOpacity
          ) =>
            onChange({
              background: {
                ...background,
                overlayOpacity,
              },
            })
          }
        />

        <NumberInput
          label="Blur nền"
          value={
            background
              .blurPx ||
            0
          }
          min={0}
          max={80}
          step={1}
          suffix="px"
          onChange={(
            blurPx
          ) =>
            onChange({
              background: {
                ...background,
                blurPx,
              },
            })
          }
        />

        <RangeInput
          label="Brightness"
          value={
            background
              .brightness ??
            1
          }
          min={0.2}
          max={2}
          step={0.05}
          onChange={(
            brightness
          ) =>
            onChange({
              background: {
                ...background,
                brightness,
              },
            })
          }
        />

        <SelectInput
          label="Overflow"
          value={
            scene.overflow ||
            'hidden'
          }
          options={[
            {
              value:
                'hidden',
              label:
                'Ẩn phần tràn',
            },
            {
              value:
                'visible',
              label:
                'Cho phép tràn',
            },
          ]}
          onChange={(
            overflow
          ) =>
            onChange({
              overflow:
                overflow as
                  'hidden' |
                  'visible',
            })
          }
        />
      </div>
    </div>
  );
};

const MultiInspector:
React.FC<{
  elements:
    SceneElement[];

  onDuplicate:
    () => void;

  onDelete:
    () => void;

  onLayerUp:
    () => void;

  onLayerDown:
    () => void;

  onToggleLock:
    () => void;
}> = ({
  elements,
  onDuplicate,
  onDelete,
  onLayerUp,
  onLayerDown,
  onToggleLock,
}) => {
  const grouped =
    elements.some(
      (element) =>
        element.groupId
    );

  return (
    <div>
      <InspectorTitle
        title={`${elements.length} elements`}
        description={
          grouped
            ? 'Đang chọn group / multi-selection.'
            : 'Multi-selection.'
        }
      />

      <div className="mt-4 grid grid-cols-2 gap-2">
        <SmallButton
          label="Nhân bản"
          onClick={
            onDuplicate
          }
        />

        <SmallButton
          label="Khóa/mở"
          onClick={
            onToggleLock
          }
        />

        <SmallButton
          label="Layer +"
          onClick={
            onLayerUp
          }
        />

        <SmallButton
          label="Layer −"
          onClick={
            onLayerDown
          }
        />

        <SmallButton
          label="Xóa"
          danger
          onClick={
            onDelete
          }
        />
      </div>

      <div className="mt-4 rounded-[12px] bg-[#faf7f6] p-3 text-[10px] leading-5 text-black/40">
        Dùng toolbar phía trên để Group/Ungroup, căn trái-phải-giữa, chia đều, đưa lên/xuống layer. Kéo một element đang được chọn để di chuyển cả selection.
      </div>

      <div className="mt-4 space-y-1">
        {elements
          .slice(
            0,
            12
          )
          .map(
            (element) => (
              <div
                key={
                  element.id
                }
                className="flex items-center justify-between gap-3 rounded-[8px] border border-black/6 px-2.5 py-2"
              >
                <span className="truncate text-[9px] font-bold text-black/50">
                  {getElementLabel(
                    element
                  )}
                </span>

                <span className="shrink-0 text-[8px] uppercase text-black/25">
                  {element.type}
                </span>
              </div>
            )
          )}
      </div>
    </div>
  );
};

const ElementInspector:
React.FC<{
  element:
    SceneElement;

  device:
    DeviceMode;

  scene:
    SceneCanvasDefinition;

  scenes:
    SceneCanvasDefinition[];

  onChange: (
    updater: (
      element:
        SceneElement
    ) =>
      SceneElement
  ) => void;

  onFrameChange: (
    frame:
      SceneElementFrame
  ) => void;

  onDuplicate:
    () => void;

  onDelete:
    () => void;

  onLayerUp:
    () => void;

  onLayerDown:
    () => void;

  onToggleLock:
    () => void;
}> = ({
  element,
  device,
  scene,
  scenes,
  onChange,
  onFrameChange,
  onDuplicate,
  onDelete,
  onLayerUp,
  onLayerDown,
  onToggleLock,
}) => {
  const frame =
    getEffectiveFrame(
      element,
      device
    );

  const firstAction =
    element.actions?.[
      0
    ];

  const setAction = (
    action:
      SceneElementAction |
      null
  ) => {
    onChange(
      (current) => ({
        ...current,
        actions:
          action
            ? [
                action,
              ]
            : [],
      } as
        SceneElement)
    );
  };

  const actionTargets =
    scene.elements
      .filter(
        (item) =>
          item.id !==
          element.id
      )
      .map(
        (item) => ({
          value:
            item.id,
          label:
            getElementLabel(
              item
            ),
        })
      );

  return (
    <div>
      <InspectorTitle
        title={
          getElementLabel(
            element
          )
        }
        description={`${element.type} · ${device}${element.groupId ? ' · grouped' : ''}`}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <SmallButton
          label="Nhân bản"
          onClick={
            onDuplicate
          }
        />

        <SmallButton
          label="Layer +"
          onClick={
            onLayerUp
          }
        />

        <SmallButton
          label="Layer −"
          onClick={
            onLayerDown
          }
        />

        <SmallButton
          label={
            element.locked
              ? 'Mở khóa'
              : 'Khóa'
          }
          onClick={
            onToggleLock
          }
        />

        <SmallButton
          label="Xóa"
          danger
          onClick={
            onDelete
          }
        />
      </div>

      <InspectorSection
        title="Layer"
      >
        <TextInput
          label="Tên layer"
          value={
            element.name ||
            ''
          }
          placeholder={
            getElementLabel(
              element
            )
          }
          onChange={(
            name
          ) =>
            onChange(
              (current) => ({
                ...current,
                name:
                  name ||
                  undefined,
              } as
                SceneElement)
            )
          }
        />
      </InspectorSection>

      <InspectorSection
        title="Nội dung"
      >
        {element.type ===
          'text' && (
          <TextControls
            element={
              element
            }
            onChange={
              onChange
            }
          />
        )}

        {(element.type ===
          'image' ||
          element.type ===
          'decor') && (
          <ImageControls
            element={
              element
            }
            onChange={
              onChange
            }
          />
        )}

        {element.type ===
          'shape' && (
          <ShapeControls
            element={
              element
            }
            onChange={
              onChange
            }
          />
        )}

        {element.type ===
          'button' && (
          <ButtonControls
            element={
              element
            }
            onChange={
              onChange
            }
          />
        )}
      </InspectorSection>

      <InspectorSection
        title={`Vị trí · ${device}`}
      >
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label="X"
            value={
              frame.x
            }
            min={-100}
            max={200}
            step={0.5}
            suffix="%"
            onChange={(
              x
            ) =>
              onFrameChange({
                ...frame,
                x,
              })
            }
          />

          <NumberInput
            label="Y"
            value={
              frame.y
            }
            min={-100}
            max={200}
            step={0.5}
            suffix="%"
            onChange={(
              y
            ) =>
              onFrameChange({
                ...frame,
                y,
              })
            }
          />

          <NumberInput
            label="Width"
            value={
              frame.width
            }
            min={1}
            max={200}
            step={0.5}
            suffix="%"
            onChange={(
              width
            ) =>
              onFrameChange({
                ...frame,
                width,
              })
            }
          />

          <NumberInput
            label="Height"
            value={
              frame.height ||
              0
            }
            min={0}
            max={200}
            step={0.5}
            suffix="%"
            onChange={(
              height
            ) =>
              onFrameChange({
                ...frame,
                height:
                  height >
                  0
                    ? height
                    : undefined,
              })
            }
          />

          <NumberInput
            label="Rotate"
            value={
              frame.rotate ||
              0
            }
            min={-720}
            max={720}
            step={1}
            suffix="°"
            onChange={(
              rotate
            ) =>
              onFrameChange({
                ...frame,
                rotate,
              })
            }
          />

          <NumberInput
            label="Z-index"
            value={
              frame.zIndex ||
              0
            }
            min={-100}
            max={1000}
            step={1}
            onChange={(
              zIndex
            ) =>
              onFrameChange({
                ...frame,
                zIndex,
              })
            }
          />
        </div>

        <SelectInput
          label="Anchor"
          value={
            frame.anchor ||
            'center'
          }
          options={[
            {
              value:
                'top-left',
              label:
                'Top left',
            },
            {
              value:
                'top-center',
              label:
                'Top center',
            },
            {
              value:
                'top-right',
              label:
                'Top right',
            },
            {
              value:
                'center-left',
              label:
                'Center left',
            },
            {
              value:
                'center',
              label:
                'Center',
            },
            {
              value:
                'center-right',
              label:
                'Center right',
            },
            {
              value:
                'bottom-left',
              label:
                'Bottom left',
            },
            {
              value:
                'bottom-center',
              label:
                'Bottom center',
            },
            {
              value:
                'bottom-right',
              label:
                'Bottom right',
            },
          ]}
          onChange={(
            anchor
          ) =>
            onFrameChange({
              ...frame,
              anchor:
                anchor as any,
            })
          }
        />

        <RangeInput
          label="Scale"
          value={
            frame.scale ||
            1
          }
          min={0.1}
          max={3}
          step={0.05}
          onChange={(
            scale
          ) =>
            onFrameChange({
              ...frame,
              scale,
            })
          }
        />

        <RangeInput
          label="Opacity"
          value={
            frame.opacity ??
            1
          }
          min={0}
          max={1}
          step={0.05}
          onChange={(
            opacity
          ) =>
            onFrameChange({
              ...frame,
              opacity,
            })
          }
        />
      </InspectorSection>

      <InspectorSection
        title="Animation"
      >
        <SelectInput
          label="Hiệu ứng"
          value={
            element
              .animation
              ?.preset ||
            'none'
          }
          options={
            VISUAL_EDITOR_ANIMATION_PRESETS
          }
          onChange={(
            preset
          ) =>
            onChange(
              (current) => ({
                ...current,
                animation: {
                  ...current
                    .animation,
                  preset:
                    preset as any,
                },
              } as
                SceneElement)
            )
          }
        />

        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label="Delay"
            value={
              element
                .animation
                ?.delayMs ||
              0
            }
            min={0}
            max={10000}
            step={50}
            suffix="ms"
            onChange={(
              delayMs
            ) =>
              onChange(
                (current) => ({
                  ...current,
                  animation: {
                    ...current
                      .animation,
                    preset:
                      current
                        .animation
                        ?.preset ||
                      'fade',
                    delayMs,
                  },
                } as
                  SceneElement)
              )
            }
          />

          <NumberInput
            label="Duration"
            value={
              element
                .animation
                ?.durationMs ||
              500
            }
            min={0}
            max={10000}
            step={50}
            suffix="ms"
            onChange={(
              durationMs
            ) =>
              onChange(
                (current) => ({
                  ...current,
                  animation: {
                    ...current
                      .animation,
                    preset:
                      current
                        .animation
                        ?.preset ||
                      'fade',
                    durationMs,
                  },
                } as
                  SceneElement)
              )
            }
          />
        </div>

        <SelectInput
          label="Easing"
          value={
            element
              .animation
              ?.easing ||
            'easeOut'
          }
          options={[
            {
              value:
                'linear',
              label:
                'Linear',
            },
            {
              value:
                'easeIn',
              label:
                'Ease in',
            },
            {
              value:
                'easeOut',
              label:
                'Ease out',
            },
            {
              value:
                'easeInOut',
              label:
                'Ease in/out',
            },
            {
              value:
                'circOut',
              label:
                'Circ out',
            },
            {
              value:
                'backOut',
              label:
                'Back out',
            },
          ]}
          onChange={(
            easing
          ) =>
            onChange(
              (current) => ({
                ...current,
                animation: {
                  ...current
                    .animation,
                  preset:
                    current
                      .animation
                      ?.preset ||
                    'fade',
                  easing:
                    easing as any,
                },
              } as
                SceneElement)
            )
          }
        />
      </InspectorSection>

      <InspectorSection
        title="Khi click"
      >
        <SelectInput
          label="Hành động"
          value={
            firstAction
              ?.type ||
            'none'
          }
          options={[
            {
              value:
                'none',
              label:
                'Không làm gì',
            },
            {
              value:
                'go-to-scene',
              label:
                'Chuyển scene',
            },
            {
              value:
                'back-scene',
              label:
                'Quay lại scene',
            },
            {
              value:
                'reset-scene',
              label:
                'Reset scene',
            },
            {
              value:
                'show-element',
              label:
                'Hiện element',
            },
            {
              value:
                'hide-element',
              label:
                'Ẩn element',
            },
            {
              value:
                'toggle-element',
              label:
                'Ẩn/hiện element',
            },
            {
              value:
                'replay-animation',
              label:
                'Chạy lại animation',
            },
            {
              value:
                'open-url',
              label:
                'Mở link',
            },
          ]}
          onChange={(
            type
          ) => {
            if (
              type ===
              'none'
            ) {
              setAction(
                null
              );
              return;
            }

            if (
              type ===
              'go-to-scene'
            ) {
              setAction({
                type:
                  'go-to-scene',
                sceneId:
                  scenes[0]
                    ?.id ||
                  '',
              });
              return;
            }

            if (
              type ===
              'reset-scene'
            ) {
              setAction({
                type:
                  'reset-scene',
              });
              return;
            }

            if (
              type ===
              'show-element' ||
              type ===
              'hide-element' ||
              type ===
              'toggle-element' ||
              type ===
              'replay-animation'
            ) {
              setAction({
                type:
                  type as any,
                elementId:
                  actionTargets[0]
                    ?.value ||
                  element.id,
              } as
                SceneElementAction);
              return;
            }

            if (
              type ===
              'open-url'
            ) {
              setAction({
                type:
                  'open-url',
                url:
                  'https://',
                newTab:
                  true,
              });
              return;
            }

            setAction({
              type:
                'back-scene',
            });
          }}
        />

        {firstAction
          ?.type ===
          'go-to-scene' && (
          <SelectInput
            label="Scene đích"
            value={
              firstAction
                .sceneId
            }
            options={
              scenes.map(
                (item) => ({
                  value:
                    item.id,
                  label:
                    item.title ||
                    item.id,
                })
              )
            }
            onChange={(
              sceneId
            ) =>
              setAction({
                ...firstAction,
                sceneId,
              })
            }
          />
        )}

        {(firstAction
          ?.type ===
          'show-element' ||
          firstAction
            ?.type ===
            'hide-element' ||
          firstAction
            ?.type ===
            'toggle-element' ||
          firstAction
            ?.type ===
            'replay-animation') && (
          <SelectInput
            label="Element đích"
            value={
              firstAction
                .elementId
            }
            options={
              actionTargets
                .length
                ? actionTargets
                : [
                    {
                      value:
                        element.id,
                      label:
                        getElementLabel(
                          element
                        ),
                    },
                  ]
            }
            onChange={(
              elementId
            ) =>
              setAction({
                ...firstAction,
                elementId,
              } as
                SceneElementAction)
            }
          />
        )}

        {firstAction
          ?.type ===
          'open-url' && (
          <TextInput
            label="URL"
            value={
              firstAction.url
            }
            onChange={(
              url
            ) =>
              setAction({
                ...firstAction,
                url,
              })
            }
          />
        )}
      </InspectorSection>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <ToggleRow
          label="Visible"
          checked={
            element.visible !==
            false
          }
          onChange={(
            visible
          ) =>
            onChange(
              (current) => ({
                ...current,
                visible,
              } as
                SceneElement)
            )
          }
        />

        <ToggleRow
          label="Locked"
          checked={
            element.locked ===
            true
          }
          onChange={(
            locked
          ) =>
            onChange(
              (current) => ({
                ...current,
                locked,
              } as
                SceneElement)
            )
          }
        />
      </div>
    </div>
  );
};

const TextControls:
React.FC<{
  element:
    Extract<
      SceneElement,
      {
        type:
          'text';
      }
    >;

  onChange: (
    updater: (
      element:
        SceneElement
    ) =>
      SceneElement
  ) => void;
}> = ({
  element,
  onChange,
}) => {
  const style =
    element.textStyle ||
    {};

  const patch = (
    next:
      Record<
        string,
        unknown
      >
  ) =>
    onChange(
      (current) => ({
        ...current,
        textStyle: {
          ...(
            current.type ===
            'text'
              ? current
                  .textStyle
              : {}
          ),
          ...next,
        },
      } as
        SceneElement)
    );

  return (
    <>
      <TextAreaInput
        label="Text"
        value={
          element.text
        }
        onChange={(
          text
        ) =>
          onChange(
            (current) => ({
              ...current,
              text,
            } as
              SceneElement)
          )
        }
      />

      <TextInput
        label="Font family"
        value={
          style.fontFamily ||
          ''
        }
        placeholder='"Quicksand", sans-serif'
        onChange={(
          fontFamily
        ) =>
          patch({
            fontFamily:
              fontFamily ||
              undefined,
          })
        }
      />

      <div className="grid grid-cols-2 gap-2">
        <ColorInput
          label="Màu chữ"
          value={
            style.color ||
            '#111827'
          }
          onChange={(
            color
          ) =>
            patch({
              color,
            })
          }
        />

        <NumberInput
          label="Cỡ chữ"
          value={
            style.fontSize ||
            24
          }
          min={6}
          max={240}
          step={1}
          suffix="px"
          onChange={(
            fontSize
          ) =>
            patch({
              fontSize,
            })
          }
        />

        <SelectInput
          label="Weight"
          value={
            String(
              style.fontWeight ||
              400
            )
          }
          options={[
            {
              value:
                '300',
              label:
                'Light',
            },
            {
              value:
                '400',
              label:
                'Regular',
            },
            {
              value:
                '500',
              label:
                'Medium',
            },
            {
              value:
                '600',
              label:
                'Semi bold',
            },
            {
              value:
                '700',
              label:
                'Bold',
            },
            {
              value:
                '800',
              label:
                'Extra bold',
            },
            {
              value:
                '900',
              label:
                'Black',
            },
          ]}
          onChange={(
            fontWeight
          ) =>
            patch({
              fontWeight:
                Number(
                  fontWeight
                ),
            })
          }
        />

        <SelectInput
          label="Align"
          value={
            style.textAlign ||
            'left'
          }
          options={[
            {
              value:
                'left',
              label:
                'Left',
            },
            {
              value:
                'center',
              label:
                'Center',
            },
            {
              value:
                'right',
              label:
                'Right',
            },
          ]}
          onChange={(
            textAlign
          ) =>
            patch({
              textAlign,
            })
          }
        />

        <NumberInput
          label="Line height"
          value={
            style.lineHeight ||
            1.2
          }
          min={0.6}
          max={4}
          step={0.05}
          onChange={(
            lineHeight
          ) =>
            patch({
              lineHeight,
            })
          }
        />

        <NumberInput
          label="Letter spacing"
          value={
            style.letterSpacing ||
            0
          }
          min={-10}
          max={40}
          step={0.5}
          suffix="px"
          onChange={(
            letterSpacing
          ) =>
            patch({
              letterSpacing,
            })
          }
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <ToggleRow
          label="Italic"
          checked={
            style.fontStyle ===
            'italic'
          }
          onChange={(
            checked
          ) =>
            patch({
              fontStyle:
                checked
                  ? 'italic'
                  : 'normal',
            })
          }
        />

        <ToggleRow
          label="Underline"
          checked={
            style.textDecoration ===
            'underline'
          }
          onChange={(
            checked
          ) =>
            patch({
              textDecoration:
                checked
                  ? 'underline'
                  : 'none',
            })
          }
        />

        <ToggleRow
          label="UPPER"
          checked={
            style.textTransform ===
            'uppercase'
          }
          onChange={(
            checked
          ) =>
            patch({
              textTransform:
                checked
                  ? 'uppercase'
                  : 'none',
            })
          }
        />
      </div>
    </>
  );
};

const ImageControls:
React.FC<{
  element:
    Extract<
      SceneElement,
      {
        type:
          'image' |
          'decor';
      }
    >;

  onChange: (
    updater: (
      element:
        SceneElement
    ) =>
      SceneElement
  ) => void;
}> = ({
  element,
  onChange,
}) => {
  const style =
    element.imageStyle ||
    {};

  const patchStyle = (
    next:
      Record<
        string,
        unknown
      >
  ) =>
    onChange(
      (current) => ({
        ...current,
        imageStyle: {
          ...(
            current.type ===
              'image' ||
            current.type ===
              'decor'
              ? current
                  .imageStyle
              : {}
          ),
          ...next,
        },
      } as
        SceneElement)
    );

  return (
    <>
      <TextInput
        label="URL / path ảnh"
        value={
          element.src
        }
        placeholder="/images/..."
        onChange={(
          src
        ) =>
          onChange(
            (current) => ({
              ...current,
              src,
            } as
              SceneElement)
          )
        }
      />

      <SelectInput
        label="Cách fit"
        value={
          style.objectFit ||
          'contain'
        }
        options={[
          {
            value:
              'contain',
            label:
              'Contain',
          },
          {
            value:
              'cover',
            label:
              'Cover',
          },
          {
            value:
              'fill',
            label:
              'Fill',
          },
        ]}
        onChange={(
          objectFit
        ) =>
          patchStyle({
            objectFit,
          })
        }
      />

      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="Bo góc"
          value={
            style.borderRadius ||
            0
          }
          min={0}
          max={999}
          step={1}
          suffix="px"
          onChange={(
            borderRadius
          ) =>
            patchStyle({
              borderRadius,
            })
          }
        />

        <NumberInput
          label="Viền"
          value={
            style.borderWidth ||
            0
          }
          min={0}
          max={30}
          step={1}
          suffix="px"
          onChange={(
            borderWidth
          ) =>
            patchStyle({
              borderWidth,
            })
          }
        />
      </div>

      <ColorInput
        label="Màu viền"
        value={
          style.borderColor ||
          '#ffffff'
        }
        onChange={(
          borderColor
        ) =>
          patchStyle({
            borderColor,
          })
        }
      />

      <TextInput
        label="Shadow CSS"
        value={
          style.boxShadow ||
          ''
        }
        placeholder="0 12px 30px rgba(...)"
        onChange={(
          boxShadow
        ) =>
          patchStyle({
            boxShadow:
              boxShadow ||
              undefined,
          })
        }
      />
    </>
  );
};

const ShapeControls:
React.FC<{
  element:
    Extract<
      SceneElement,
      {
        type:
          'shape';
      }
    >;

  onChange: (
    updater: (
      element:
        SceneElement
    ) =>
      SceneElement
  ) => void;
}> = ({
  element,
  onChange,
}) => {
  const style =
    element.shapeStyle ||
    {};

  const patch = (
    next:
      Record<
        string,
        unknown
      >
  ) =>
    onChange(
      (current) => ({
        ...current,
        shapeStyle: {
          ...(
            current.type ===
            'shape'
              ? current
                  .shapeStyle
              : {}
          ),
          ...next,
        },
      } as
        SceneElement)
    );

  return (
    <>
      <SelectInput
        label="Shape"
        value={
          style.kind ||
          'rectangle'
        }
        options={[
          {
            value:
              'rectangle',
            label:
              'Rectangle',
          },
          {
            value:
              'circle',
            label:
              'Circle / ellipse',
          },
          {
            value:
              'line',
            label:
              'Line',
          },
        ]}
        onChange={(
          kind
        ) =>
          patch({
            kind,
          })
        }
      />

      <ColorInput
        label="Fill"
        value={
          style.fill ||
          '#f4b8c4'
        }
        onChange={(
          fill
        ) =>
          patch({
            fill,
          })
        }
      />

      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="Viền"
          value={
            style.borderWidth ||
            0
          }
          min={0}
          max={40}
          step={1}
          suffix="px"
          onChange={(
            borderWidth
          ) =>
            patch({
              borderWidth,
            })
          }
        />

        <NumberInput
          label="Bo góc"
          value={
            style.borderRadius ||
            0
          }
          min={0}
          max={999}
          step={1}
          suffix="px"
          onChange={(
            borderRadius
          ) =>
            patch({
              borderRadius,
            })
          }
        />
      </div>

      <ColorInput
        label="Màu viền / line"
        value={
          style.borderColor ||
          '#cf5068'
        }
        onChange={(
          borderColor
        ) =>
          patch({
            borderColor,
          })
        }
      />

      <SelectInput
        label="Kiểu line"
        value={
          style.lineStyle ||
          'solid'
        }
        options={[
          {
            value:
              'solid',
            label:
              'Solid',
          },
          {
            value:
              'dashed',
            label:
              'Dashed',
          },
          {
            value:
              'dotted',
            label:
              'Dotted',
          },
        ]}
        onChange={(
          lineStyle
        ) =>
          patch({
            lineStyle,
          })
        }
      />

      <TextInput
        label="Shadow CSS"
        value={
          style.boxShadow ||
          ''
        }
        onChange={(
          boxShadow
        ) =>
          patch({
            boxShadow:
              boxShadow ||
              undefined,
          })
        }
      />
    </>
  );
};

const ButtonControls:
React.FC<{
  element:
    Extract<
      SceneElement,
      {
        type:
          'button';
      }
    >;

  onChange: (
    updater: (
      element:
        SceneElement
    ) =>
      SceneElement
  ) => void;
}> = ({
  element,
  onChange,
}) => {
  const style =
    element.buttonStyle ||
    {};

  const patch = (
    next:
      Record<
        string,
        unknown
      >
  ) =>
    onChange(
      (current) => ({
        ...current,
        buttonStyle: {
          ...(
            current.type ===
            'button'
              ? current
                  .buttonStyle
              : {}
          ),
          ...next,
        },
      } as
        SceneElement)
    );

  return (
    <>
      <TextInput
        label="Chữ nút"
        value={
          element.label
        }
        onChange={(
          label
        ) =>
          onChange(
            (current) => ({
              ...current,
              label,
            } as
              SceneElement)
          )
        }
      />

      <TextInput
        label="Font family"
        value={
          style.fontFamily ||
          ''
        }
        onChange={(
          fontFamily
        ) =>
          patch({
            fontFamily:
              fontFamily ||
              undefined,
          })
        }
      />

      <div className="grid grid-cols-2 gap-2">
        <ColorInput
          label="Nền"
          value={
            style.background ||
            '#ff245a'
          }
          onChange={(
            background
          ) =>
            patch({
              background,
            })
          }
        />

        <ColorInput
          label="Chữ"
          value={
            style.color ||
            '#ffffff'
          }
          onChange={(
            color
          ) =>
            patch({
              color,
            })
          }
        />

        <NumberInput
          label="Cỡ chữ"
          value={
            style.fontSize ||
            16
          }
          min={6}
          max={120}
          step={1}
          suffix="px"
          onChange={(
            fontSize
          ) =>
            patch({
              fontSize,
            })
          }
        />

        <NumberInput
          label="Bo góc"
          value={
            style.borderRadius ||
            0
          }
          min={0}
          max={999}
          step={1}
          suffix="px"
          onChange={(
            borderRadius
          ) =>
            patch({
              borderRadius,
            })
          }
        />
      </div>
    </>
  );
};

const ToggleRow:
React.FC<{
  label: string;
  checked: boolean;
  onChange: (
    checked: boolean
  ) => void;
}> = ({
  label,
  checked,
  onChange,
}) => (
  <label className="flex cursor-pointer items-center justify-between gap-2 rounded-[9px] bg-[#faf9f8] px-2.5 py-2">
    <span className="text-[9px] font-bold text-black/45">
      {label}
    </span>

    <input
      type="checkbox"
      checked={
        checked
      }
      onChange={(
        event
      ) =>
        onChange(
          event.target
            .checked
        )
      }
      className="h-4 w-4 accent-[#b83e57]"
    />
  </label>
);
