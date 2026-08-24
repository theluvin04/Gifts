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

  element:
    SceneElement |
    null;

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
    updater:
      (
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
}

export const InspectorPanel:
React.FC<Props> = ({
  scene,
  element,
  device,
  scenes,
  onSceneChange,
  onElementChange,
  onFrameChange,
  onDuplicate,
  onDelete,
  onLayerUp,
  onLayerDown,
}) => (
  <aside className="min-w-0 rounded-[14px] border border-black/8 bg-white p-3.5">
    {element ? (
      <ElementInspector
        element={
          element
        }
        device={
          device
        }
        scenes={
          scenes
        }
        onChange={
          onElementChange
        }
        onFrameChange={
          onFrameChange
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
      />
    ) : (
      <SceneInspector
        scene={
          scene
        }
        onChange={
          onSceneChange
        }
      />
    )}
  </aside>
);

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
        description="Click element để chỉnh element."
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
          label="Transition ms"
          value={
            scene.transition
              ?.durationMs ||
            420
          }
          min={0}
          max={5000}
          step={20}
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
          label="Ảnh nền URL"
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
                imageUrl,
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
              .brightness ||
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

  scenes:
    SceneCanvasDefinition[];

  onChange: (
    updater:
      (
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
}> = ({
  element,
  device,
  scenes,
  onChange,
  onFrameChange,
  onDuplicate,
  onDelete,
  onLayerUp,
  onLayerDown,
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

  return (
    <div>
      <InspectorTitle
        title={
          getElementLabel(
            element
          )
        }
        description={`${element.type} · ${device}`}
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
          label="Xóa"
          danger
          onClick={
            onDelete
          }
        />
      </div>

      <InspectorSection
        title="Nội dung"
      >
        {element.type ===
          'text' && (
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
                  (
                    current
                  ) => ({
                    ...current,
                    text,
                  } as
                    SceneElement)
                )
              }
            />

            <ColorInput
              label="Màu chữ"
              value={
                element
                  .textStyle
                  ?.color ||
                '#111827'
              }
              onChange={(
                color
              ) =>
                onChange(
                  (
                    current
                  ) => ({
                    ...current,
                    textStyle: {
                      ...(
                        current.type ===
                        'text'
                          ? current
                              .textStyle
                          : {}
                      ),
                      color,
                    },
                  } as
                    SceneElement)
                )
              }
            />

            <NumberInput
              label="Cỡ chữ"
              value={
                element
                  .textStyle
                  ?.fontSize ||
                24
              }
              min={6}
              max={200}
              step={1}
              suffix="px"
              onChange={(
                fontSize
              ) =>
                onChange(
                  (
                    current
                  ) => ({
                    ...current,
                    textStyle: {
                      ...(
                        current.type ===
                        'text'
                          ? current
                              .textStyle
                          : {}
                      ),
                      fontSize,
                    },
                  } as
                    SceneElement)
                )
              }
            />
          </>
        )}

        {(element.type ===
          'image' ||
          element.type ===
          'decor') && (
          <>
            <TextInput
              label="URL ảnh"
              value={
                element.src
              }
              placeholder="/images/..."
              onChange={(
                src
              ) =>
                onChange(
                  (
                    current
                  ) => ({
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
                element
                  .imageStyle
                  ?.objectFit ||
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
                onChange(
                  (
                    current
                  ) => ({
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
                      objectFit:
                        objectFit as any,
                    },
                  } as
                    SceneElement)
                )
              }
            />
          </>
        )}

        {element.type ===
          'button' && (
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
                  (
                    current
                  ) => ({
                    ...current,
                    label,
                  } as
                    SceneElement)
                )
              }
            />

            <ColorInput
              label="Nền nút"
              value={
                element
                  .buttonStyle
                  ?.background ||
                '#ff245a'
              }
              onChange={(
                background
              ) =>
                onChange(
                  (
                    current
                  ) => ({
                    ...current,
                    buttonStyle: {
                      ...(
                        current.type ===
                        'button'
                          ? current
                              .buttonStyle
                          : {}
                      ),
                      background,
                    },
                  } as
                    SceneElement)
                )
              }
            />

            <ColorInput
              label="Màu chữ"
              value={
                element
                  .buttonStyle
                  ?.color ||
                '#ffffff'
              }
              onChange={(
                color
              ) =>
                onChange(
                  (
                    current
                  ) => ({
                    ...current,
                    buttonStyle: {
                      ...(
                        current.type ===
                        'button'
                          ? current
                              .buttonStyle
                          : {}
                      ),
                      color,
                    },
                  } as
                    SceneElement)
                )
              }
            />
          </>
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
              (
                current
              ) => ({
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
                (
                  current
                ) => ({
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
                (
                  current
                ) => ({
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
              'toggle-element'
            ) {
              setAction({
                type:
                  'toggle-element',
                elementId:
                  element.id,
              });

              return;
            }

            if (
              type ===
              'replay-animation'
            ) {
              setAction({
                type:
                  'replay-animation',
                elementId:
                  element.id,
              });

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

        {firstAction
          ?.type ===
          'toggle-element' && (
          <TextInput
            label="Element ID"
            value={
              firstAction
                .elementId
            }
            onChange={(
              elementId
            ) =>
              setAction({
                ...firstAction,
                elementId,
              })
            }
          />
        )}

        {firstAction
          ?.type ===
          'replay-animation' && (
          <TextInput
            label="Element ID"
            value={
              firstAction
                .elementId
            }
            onChange={(
              elementId
            ) =>
              setAction({
                ...firstAction,
                elementId,
              })
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

      <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-[10px] bg-[#faf9f8] px-3 py-2.5">
        <span className="text-[10px] font-bold text-black/55">
          Khóa element
        </span>

        <input
          type="checkbox"
          checked={
            element.locked ===
            true
          }
          onChange={(
            event
          ) =>
            onChange(
              (
                current
              ) => ({
                ...current,
                locked:
                  event.target
                    .checked,
              } as
                SceneElement)
            )
          }
          className="h-4 w-4 accent-[#b83e57]"
        />
      </label>
    </div>
  );
};
