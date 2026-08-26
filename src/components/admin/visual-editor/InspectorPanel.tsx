import React, {
  useState,
} from 'react';

import type {
  SceneCanvasDefinition,
  SceneElement,
  SceneElementAction,
  SceneElementFrame,
} from '../../../engine';

import {
  PHOTO_FRAME_PRESETS,
  getPhotoFramePreset,
  resolvePhotoFrameStyle,
} from '../../../engine';

import {
  VISUAL_EDITOR_ANIMATION_PRESETS,
  VISUAL_EDITOR_TEXT_ANIMATION_PRESETS,
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

  onOpenAssetLibrary: (
    target:
      | {
          kind:
            'background';
        }
      | {
          kind:
            'element';
          elementId:
            string;
        }
  ) => void;
}

const getElementTypeLabel =
  (
    element:
      SceneElement
  ) => {
    if (
      element.type ===
      'text'
    ) {
      return 'chữ';
    }

    if (
      element.type ===
      'image'
    ) {
      return 'ảnh';
    }

    if (
      element.type ===
      'decor'
    ) {
      return 'trang trí';
    }

    if (
      element.type ===
      'button'
    ) {
      return 'nút';
    }

    if (
      element.type ===
      'shape'
    ) {
      return 'hình';
    }

    if (
      element.type ===
      'photo-frame'
    ) {
      return 'khung ảnh';
    }

    return 'tùy chỉnh';
  };

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
  onOpenAssetLibrary,
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
          onOpenAssetLibrary={() =>
            onOpenAssetLibrary({
              kind:
                'background',
            })
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
        onOpenAssetLibrary={() =>
          onOpenAssetLibrary({
            kind:
              'element',
            elementId:
              element.id,
          })
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

  onOpenAssetLibrary:
    () => void;
}> = ({
  scene,
  onChange,
  onOpenAssetLibrary,
}) => {
  const background =
    scene.background ||
    {};

  return (
    <div>
      <InspectorTitle
        title="Trang"
        description="Không chọn đối tượng nào — đang chỉnh khung vẽ."
      />

      <div className="mt-4 space-y-3">
        <TextInput
          label="Tên trang"
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
          label="Tỉ lệ khung vẽ máy tính"
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
                '16:9 · Ngang',
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
                '1:1 · Vuông',
            },
            {
              value:
                String(
                  4 / 5
                ),
              label:
                '4:5 · Mạng xã hội',
            },
            {
              value:
                String(
                  9 / 16
                ),
              label:
                '9:16 · Dọc / Story',
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
          label="Chuyển cảnh"
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
          label="Chuyển cảnh"
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
          label="Đường dẫn ảnh nền"
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

        <AssetPickerButton
          label="Chọn ảnh nền từ kho tài nguyên"
          onClick={
            onOpenAssetLibrary
          }
        />

        <SelectInput
          label="Cách hiển thị ảnh nền"
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
                'Phủ kín',
            },
            {
              value:
                'contain',
              label:
                'Vừa khung',
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
          label="Màu lớp phủ"
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
          label="Độ trong lớp phủ"
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
          label="Độ mờ nền"
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
          label="Độ sáng"
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
          label="Nội dung tràn"
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
        title={`${elements.length} đối tượng`}
        description={
          grouped
            ? 'Đang chọn nhóm / nhiều đối tượng.'
            : 'Đang chọn nhiều đối tượng.'
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
          label="Lớp +"
          onClick={
            onLayerUp
          }
        />

        <SmallButton
          label="Lớp −"
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
        Dùng thanh công cụ để Nhóm/Bỏ nhóm, căn trái-phải-giữa, chia đều và đổi lớp. Kéo một đối tượng đang chọn để di chuyển cả nhóm.
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
                  {getElementTypeLabel(
                    element
                  )}
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

  onOpenAssetLibrary:
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
  onOpenAssetLibrary,
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
        description={`${getElementTypeLabel(element)} · ${device === 'desktop' ? 'máy tính' : 'điện thoại'}${element.groupId ? ' · đã nhóm' : ''}`}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <SmallButton
          label="Nhân bản"
          onClick={
            onDuplicate
          }
        />

        <SmallButton
          label="Lớp +"
          onClick={
            onLayerUp
          }
        />

        <SmallButton
          label="Lớp −"
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
        title="Lớp"
      >
        <TextInput
          label="Tên lớp"
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
            device={
              device
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
            onOpenAssetLibrary={
              onOpenAssetLibrary
            }
          />
        )}

        {element.type ===
          'photo-frame' && (
          <PhotoFrameControls
            element={
              element
            }
            device={
              device
            }
            onChange={
              onChange
            }
            onOpenAssetLibrary={
              onOpenAssetLibrary
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
            device={
              device
            }
            onChange={
              onChange
            }
          />
        )}
      </InspectorSection>

      <InspectorSection
        title={`Vị trí · ${device === 'desktop' ? 'máy tính' : 'điện thoại'}`}
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
            label="Chiều rộng"
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
            label="Chiều cao"
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
            label="Góc xoay"
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
            label="Thứ tự lớp"
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
          label="Điểm neo"
          value={
            frame.anchor ||
            'center'
          }
          options={[
            {
              value:
                'top-left',
              label:
                'Trên trái',
            },
            {
              value:
                'top-center',
              label:
                'Trên giữa',
            },
            {
              value:
                'top-right',
              label:
                'Trên phải',
            },
            {
              value:
                'center-left',
              label:
                'Giữa trái',
            },
            {
              value:
                'center',
              label:
                'Chính giữa',
            },
            {
              value:
                'center-right',
              label:
                'Giữa phải',
            },
            {
              value:
                'bottom-left',
              label:
                'Dưới trái',
            },
            {
              value:
                'bottom-center',
              label:
                'Dưới giữa',
            },
            {
              value:
                'bottom-right',
              label:
                'Dưới phải',
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
          label="Tỉ lệ"
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
          label="Độ trong suốt"
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
        title="Hiệu ứng"
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
            element.type ===
            'text'
              ? VISUAL_EDITOR_TEXT_ANIMATION_PRESETS
              : VISUAL_EDITOR_ANIMATION_PRESETS
          }
          onChange={(
            preset
          ) =>
            onChange(
              (current) => {
                const isSpin =
                  preset ===
                    'spin' ||
                  preset ===
                    'spin-reverse';

                const isTypewriter =
                  preset ===
                  'typewriter';

                const isTextReveal =
                  isTypewriter ||
                  preset ===
                    'word-reveal' ||
                  preset ===
                    'line-reveal';

                const isLoop =
                  isSpin ||
                  preset ===
                    'float' ||
                  preset ===
                    'swing' ||
                  preset ===
                    'shake' ||
                  preset ===
                    'pulse';

                return {
                  ...current,
                  animation: {
                    ...current
                      .animation,
                    preset:
                      preset as any,
                    durationMs:
                      isSpin
                        ? 4000
                        : isTypewriter
                          ? 1800
                          : isTextReveal
                            ? 1000
                            : isLoop
                              ? (
                                  current
                                    .animation
                                    ?.durationMs ||
                                  1800
                                )
                              : (
                                  current
                                    .animation
                                    ?.durationMs ||
                                  520
                                ),
                    easing:
                      isSpin
                        ? 'linear'
                        : current
                            .animation
                            ?.easing ||
                          'easeOut',
                    showCursor:
                      isTypewriter
                        ? current
                            .animation
                            ?.showCursor !==
                          false
                        : current
                            .animation
                            ?.showCursor,
                  },
                } as
                  SceneElement;
              }
            )
          }
        />

        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label="Độ trễ"
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
            label={
              element.animation
                ?.preset ===
                'spin' ||
              element.animation
                ?.preset ===
                'spin-reverse'
                ? 'Thời gian 1 vòng'
                : element.animation
                      ?.preset ===
                      'typewriter'
                  ? 'Thời gian gõ xong'
                  : element.animation
                        ?.preset ===
                        'word-reveal' ||
                    element.animation
                        ?.preset ===
                        'line-reveal'
                    ? 'Thời gian hiện xong'
                    : 'Thời lượng'
            }
            value={
              element
                .animation
                ?.durationMs ||
              (
                element.animation
                  ?.preset ===
                  'spin' ||
                element.animation
                  ?.preset ===
                  'spin-reverse'
                  ? 4000
                  : element.animation
                        ?.preset ===
                        'typewriter'
                    ? 1800
                    : element.animation
                          ?.preset ===
                          'word-reveal' ||
                      element.animation
                          ?.preset ===
                          'line-reveal'
                      ? 1000
                      : 500
              )
            }
            min={
              element.animation
                ?.preset ===
                'spin' ||
              element.animation
                ?.preset ===
                'spin-reverse'
                ? 300
                : 0
            }
            max={20000}
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
          label="Độ mượt"
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
                'Đều',
            },
            {
              value:
                'easeIn',
              label:
                'Chậm đầu',
            },
            {
              value:
                'easeOut',
              label:
                'Chậm cuối',
            },
            {
              value:
                'easeInOut',
              label:
                'Chậm đầu & cuối',
            },
            {
              value:
                'circOut',
              label:
                'Mượt tròn',
            },
            {
              value:
                'backOut',
              label:
                'Nảy nhẹ',
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

        {element.type ===
          'text' &&
          element.animation
            ?.preset ===
            'typewriter' && (
          <ToggleRow
            label="Hiện con trỏ khi đánh chữ"
            checked={
              element.animation
                ?.showCursor !==
              false
            }
            onChange={(
              showCursor
            ) =>
              onChange(
                (current) => ({
                  ...current,
                  animation: {
                    ...current
                      .animation,
                    preset:
                      'typewriter',
                    showCursor,
                  },
                } as
                  SceneElement)
              )
            }
          />
        )}
      </InspectorSection>

      <InspectorSection
        title="Khi bấm"
      >
        <SelectInput
          label="Khi bấm"
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
            label="Trang đích"
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
            label="Đối tượng đích"
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
            label="Đường dẫn"
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
          label="Hiển thị"
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
          label="Đã khóa"
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

const FONT_OPTIONS = [
  {
    label:
      'Quicksand',
    value:
      '"Quicksand", sans-serif',
    group:
      'Hiện đại',
  },
  {
    label:
      'Be Vietnam Pro',
    value:
      '"Be Vietnam Pro", sans-serif',
    group:
      'Hiện đại',
  },
  {
    label:
      'Poppins',
    value:
      '"Poppins", sans-serif',
    group:
      'Hiện đại',
  },
  {
    label:
      'Montserrat',
    value:
      '"Montserrat", sans-serif',
    group:
      'Hiện đại',
  },
  {
    label:
      'Nunito',
    value:
      '"Nunito", sans-serif',
    group:
      'Hiện đại',
  },
  {
    label:
      'Inter',
    value:
      '"Inter", sans-serif',
    group:
      'Hiện đại',
  },
  {
    label:
      'Comfortaa',
    value:
      '"Comfortaa", sans-serif',
    group:
      'Bo tròn',
  },
  {
    label:
      'Playfair Display',
    value:
      '"Playfair Display", serif',
    group:
      'Thanh lịch',
  },
  {
    label:
      'DM Serif Display',
    value:
      '"DM Serif Display", serif',
    group:
      'Thanh lịch',
  },
  {
    label:
      'Lora',
    value:
      '"Lora", serif',
    group:
      'Thanh lịch',
  },
  {
    label:
      'Libre Baskerville',
    value:
      '"Libre Baskerville", serif',
    group:
      'Thanh lịch',
  },
  {
    label:
      'Roboto Slab',
    value:
      '"Roboto Slab", serif',
    group:
      'Thanh lịch',
  },
  {
    label:
      'Dancing Script',
    value:
      '"Dancing Script", cursive',
    group:
      'Viết tay',
  },
  {
    label:
      'Caveat',
    value:
      '"Caveat", cursive',
    group:
      'Viết tay',
  },
  {
    label:
      'Great Vibes',
    value:
      '"Great Vibes", cursive',
    group:
      'Viết tay',
  },
  {
    label:
      'Satisfy',
    value:
      '"Satisfy", cursive',
    group:
      'Viết tay',
  },
  {
    label:
      'Pacifico',
    value:
      '"Pacifico", cursive',
    group:
      'Viết tay',
  },
] as const;

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

  device:
    DeviceMode;

  onChange: (
    updater: (
      element:
        SceneElement
    ) =>
      SceneElement
  ) => void;
}> = ({
  element,
  device,
  onChange,
}) => {
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

  const patch = (
    next:
      Record<
        string,
        unknown
      >
  ) =>
    onChange(
      (
        current
      ) => {
        if (
          current.type !==
          'text'
        ) {
          return current;
        }

        const currentStyle =
          current.textStyle ||
          {};

        if (
          device ===
          'mobile'
        ) {
          const currentMobileStyle =
            current.mobileTextStyle ||
            (currentStyle as any).mobile ||
            {};

          return {
            ...current,
            mobileTextStyle: {
              ...currentMobileStyle,
              ...next,
            },
          } as
            SceneElement;
        }

        return {
          ...current,
          textStyle: {
            ...currentStyle,
            ...next,
          },
        } as
          SceneElement;
      }
    );

  return (
    <>
      <TextAreaInput
        label="Nội dung chữ"
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

      <FontPicker
        value={
          style.fontFamily ||
          '"Quicksand", sans-serif'
        }
        onChange={(
          fontFamily
        ) =>
          patch({
            fontFamily,
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
          min={1}
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
          label="Độ đậm"
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
                'Mảnh',
            },
            {
              value:
                '400',
              label:
                'Thường',
            },
            {
              value:
                '500',
              label:
                'Vừa',
            },
            {
              value:
                '600',
              label:
                'Hơi đậm',
            },
            {
              value:
                '700',
              label:
                'Đậm',
            },
            {
              value:
                '800',
              label:
                'Rất đậm',
            },
            {
              value:
                '900',
              label:
                'Đen đậm',
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
          label="Căn chữ"
          value={
            style.textAlign ||
            'left'
          }
          options={[
            {
              value:
                'left',
              label:
                'Trái',
            },
            {
              value:
                'center',
              label:
                'Chính giữa',
            },
            {
              value:
                'right',
              label:
                'Phải',
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
          label="Giãn dòng"
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
          label="Giãn chữ"
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
          label="Nghiêng"
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
          label="Gạch chân"
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
          label="VIẾT HOA"
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

  onOpenAssetLibrary:
    () => void;
}> = ({
  element,
  onChange,
  onOpenAssetLibrary,
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
        label="Ảnh / đường dẫn"
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

      <AssetPickerButton
        label="Chọn từ kho tài nguyên"
        onClick={
          onOpenAssetLibrary
        }
      />

      <SelectInput
        label="Cách hiển thị"
        value={
          style.objectFit ||
          'contain'
        }
        options={[
          {
            value:
              'contain',
            label:
              'Vừa khung',
          },
          {
            value:
              'cover',
            label:
              'Phủ kín',
          },
          {
            value:
              'fill',
            label:
              'Kéo đầy khung',
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
        label="Bóng đổ"
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

const PhotoFrameControls:
React.FC<{
  element:
    Extract<
      SceneElement,
      {
        type:
          'photo-frame';
      }
    >;

  device:
    DeviceMode;

  onChange: (
    updater: (
      element:
        SceneElement
    ) =>
      SceneElement
  ) => void;

  onOpenAssetLibrary:
    () => void;
}> = ({
  element,
  device,
  onChange,
  onOpenAssetLibrary,
}) => {
  const style =
    resolvePhotoFrameStyle(
      device === 'mobile'
        ? {
            ...element.frameStyle,
            ...element.mobileFrameStyle,
          }
        : element.frameStyle
    );

  const source =
    device === 'mobile'
      ? element.mobileSrc || element.src
      : element.src;

  const caption =
    device === 'mobile'
      ? element.mobileCaption ?? element.caption ?? ''
      : element.caption || '';

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
        ...(current.type !== 'photo-frame'
          ? {}
          : device === 'mobile'
            ? {
                mobileFrameStyle: {
                  ...current.mobileFrameStyle,
                  ...next,
                },
              }
            : {
                frameStyle: {
                  ...current.frameStyle,
                  ...next,
                },
              }),
      } as
        SceneElement)
    );

  return (
    <>
      <AssetPickerButton
        label={
          source
            ? 'Thay ảnh trong khung'
            : 'Chọn ảnh cho khung'
        }
        onClick={
          onOpenAssetLibrary
        }
      />

      <button
        type="button"
        onClick={() => {
          const preset =
            getPhotoFramePreset(
              style.preset
            );

          onChange(
            (current) => {
              if (
                current.type !== 'photo-frame'
              ) {
                return current;
              }

              return device === 'mobile'
                ? {
                    ...current,
                    mobileFrame: {
                      ...current.mobileFrame,
                      ...preset.mobile,
                    },
                  }
                : {
                    ...current,
                    frame: {
                      ...current.frame,
                      ...preset.desktop,
                    },
                  };
            }
          );
        }}
        className="mt-2 w-full rounded-[9px] border border-[#cf5068]/20 bg-[#fff5f7] px-3 py-2 text-[9px] font-black text-[#a73551] transition hover:bg-[#f9e9ed]"
      >
        Chuẩn hóa kích thước {device === 'mobile' ? 'Mobile' : 'PC'}
      </button>

      {source && (
        <div className="overflow-hidden rounded-[9px] border border-black/7 bg-[#f4f1ee] p-2">
          <img
            src={
              source
            }
            alt=""
            className="aspect-square w-full rounded-[6px] object-cover"
          />
        </div>
      )}

      <TextInput
        label="Chú thích dưới ảnh"
        value={
          caption
        }
        placeholder="Có thể để trống"
        onChange={(
          caption
        ) =>
          onChange(
            (current) => ({
              ...current,
              ...(device === 'mobile'
                ? { mobileCaption: caption }
                : { caption }),
            } as
              SceneElement)
          )
        }
      />

      <div>
        <p className="mb-2 text-[8px] font-black uppercase tracking-[0.1em] text-black/30">
          Mẫu khung
        </p>

        <div className="grid grid-cols-2 gap-2">
          {PHOTO_FRAME_PRESETS.map(
            (
              preset
            ) => {
              const active =
                style.preset ===
                preset.value;

              return (
                <button
                  key={
                    preset.value
                  }
                  type="button"
                  title={
                    preset.description
                  }
                  onClick={() =>
                    onChange(
                      (
                        current
                      ) => {
                        if (
                          current.type !==
                          'photo-frame'
                        ) {
                          return current;
                        }

                        const selected =
                          getPhotoFramePreset(
                            preset.value
                          );

                        return {
                          ...current,
                          ...(device === 'mobile'
                            ? {
                                mobileFrame: {
                                  ...current.mobileFrame,
                                  ...selected.mobile,
                                },
                                mobileFrameStyle: {
                                  ...selected.style,
                                },
                              }
                            : {
                                frame: {
                                  ...current.frame,
                                  ...selected.desktop,
                                },
                                frameStyle: {
                                  ...selected.style,
                                },
                              }),
                        };
                      }
                    )
                  }
                  className={[
                    'rounded-[9px] border p-2 text-left transition',
                    active
                      ? 'border-[#cf5068]/35 bg-[#fff4f7]'
                      : 'border-black/8 bg-[#faf9f8] hover:border-[#cf5068]/20',
                  ].join(' ')}
                >
                  <div
                    style={{
                      background:
                        preset.style
                          .background,
                      borderRadius:
                        preset.style
                          .outerRadius,
                      boxShadow:
                        '0 5px 12px rgba(30,20,20,0.10)',
                    }}
                    className="mx-auto flex h-14 w-11 flex-col gap-1 p-1"
                  >
                    <div
                      style={{
                        borderRadius:
                          preset.style
                            .innerRadius,
                      }}
                      className="min-h-0 flex-1 bg-[#ded9d4]"
                    />

                    <div
                      style={{
                        background:
                          preset.style
                            .captionColor,
                      }}
                      className="mx-auto h-[2px] w-1/2 rounded-full opacity-35"
                    />
                  </div>

                  <p className="mt-2 text-[8px] font-black text-black/60">
                    {preset.label}
                  </p>
                </button>
              );
            }
          )}
        </div>
      </div>

      <SelectInput
        label="Cách đặt ảnh"
        value={
          style.imageFit ||
          'cover'
        }
        options={[
          {
            value:
              'cover',
            label:
              'Phủ kín khung',
          },
          {
            value:
              'contain',
            label:
              'Hiện toàn bộ ảnh',
          },
        ]}
        onChange={(
          imageFit
        ) =>
          patchStyle({
            imageFit,
          })
        }
      />

      <div className="grid grid-cols-2 gap-2">
        <ColorInput
          label="Màu khung"
          value={
            style.background ||
            '#fffdf8'
          }
          onChange={(
            background
          ) =>
            patchStyle({
              background,
            })
          }
        />

        <ColorInput
          label="Màu chú thích"
          value={
            style.captionColor ||
            '#34302f'
          }
          onChange={(
            captionColor
          ) =>
            patchStyle({
              captionColor,
            })
          }
        />

        <NumberInput
          label="Lề khung"
          value={
            style.paddingPercent ??
            6
          }
          min={0}
          max={20}
          step={0.5}
          suffix="%"
          onChange={(
            paddingPercent
          ) =>
            patchStyle({
              paddingPercent,
            })
          }
        />

        <NumberInput
          label="Khoảng chú thích"
          value={
            style.captionAreaPercent ??
            22
          }
          min={12}
          max={45}
          step={1}
          suffix="%"
          onChange={(
            captionAreaPercent
          ) =>
            patchStyle({
              captionAreaPercent,
            })
          }
        />

        <NumberInput
          label="Cỡ chữ chú thích"
          value={
            style.captionFontSize ||
            16
          }
          min={8}
          max={80}
          step={1}
          suffix="px"
          onChange={(
            captionFontSize
          ) =>
            patchStyle({
              captionFontSize,
            })
          }
        />

        <NumberInput
          label="Bo góc ngoài"
          value={
            style.outerRadius ||
            4
          }
          min={0}
          max={80}
          step={1}
          suffix="px"
          onChange={(
            outerRadius
          ) =>
            patchStyle({
              outerRadius,
            })
          }
        />
      </div>

      <TextInput
        label="Bóng đổ"
        value={
          style.boxShadow ||
          ''
        }
        placeholder="0 18px 38px rgba(...)"
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
        label="Loại hình"
        value={
          style.kind ||
          'rectangle'
        }
        options={[
          {
            value:
              'rectangle',
            label:
              'Hình chữ nhật',
          },
          {
            value:
              'circle',
            label:
              'Hình tròn / elip',
          },
          {
            value:
              'line',
            label:
              'Đường kẻ',
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
        label="Màu nền"
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
        label="Màu viền / đường kẻ"
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
        label="Kiểu nét"
        value={
          style.lineStyle ||
          'solid'
        }
        options={[
          {
            value:
              'solid',
            label:
              'Nét liền',
          },
          {
            value:
              'dashed',
            label:
              'Nét đứt',
          },
          {
            value:
              'dotted',
            label:
              'Nét chấm',
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
        label="Bóng đổ"
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

  device:
    DeviceMode;

  onChange: (
    updater: (
      element:
        SceneElement
    ) =>
      SceneElement
  ) => void;
}> = ({
  element,
  device,
  onChange,
}) => {
  const desktopStyle =
    element.buttonStyle ||
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

  const patch = (
    next:
      Record<
        string,
        unknown
      >
  ) =>
    onChange(
      (
        current
      ) => {
        if (
          current.type !==
          'button'
        ) {
          return current;
        }

        const currentStyle =
          current.buttonStyle ||
          {};

        if (
          device ===
          'mobile'
        ) {
          const currentMobileStyle =
            current.mobileButtonStyle ||
            (currentStyle as any).mobile ||
            {};

          return {
            ...current,
            mobileButtonStyle: {
              ...currentMobileStyle,
              ...next,
            },
          } as
            SceneElement;
        }

        return {
          ...current,
          buttonStyle: {
            ...currentStyle,
            ...next,
          },
        } as
          SceneElement;
      }
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
        label="Phông chữ"
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
          label="Màu nền"
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
          label="Màu chữ"
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
          min={1}
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

const FontPicker:
React.FC<{
  value:
    string;

  onChange: (
    value: string
  ) => void;
}> = ({
  value,
  onChange,
}) => {
  const [
    open,
    setOpen,
  ] =
    useState(false);

  const [
    search,
    setSearch,
  ] =
    useState('');

  const current =
    FONT_OPTIONS.find(
      (
        font
      ) =>
        font.value ===
        value
    );

  const visible =
    FONT_OPTIONS.filter(
      (
        font
      ) => {
        const keyword =
          search
            .trim()
            .toLowerCase();

        if (
          !keyword
        ) {
          return true;
        }

        return (
          font.label
            .toLowerCase()
            .includes(
              keyword
            ) ||
          font.group
            .toLowerCase()
            .includes(
              keyword
            )
        );
      }
    );

  return (
    <div className="relative">
      <p className="mb-1 text-[8px] font-black text-black/35">
        Phông chữ
      </p>

      <button
        type="button"
        onClick={() =>
          setOpen(
            (
              currentOpen
            ) =>
              !currentOpen
          )
        }
        className="flex w-full items-center justify-between gap-3 rounded-[9px] border border-black/10 bg-[#faf9f8] px-3 py-2.5 text-left outline-none transition hover:border-[#cf5068]/30"
      >
        <span
          style={{
            fontFamily:
              value,
          }}
          className="min-w-0 flex-1 truncate text-[15px] text-black/70"
        >
          {current?.label ||
            value ||
            'Chọn phông chữ'}
        </span>

        <span className="shrink-0 text-[9px] text-black/30">
          {open
            ? '▲'
            : '▼'}
        </span>
      </button>

      {open && (
        <div className="mt-2 overflow-hidden rounded-[10px] border border-black/10 bg-white shadow-[0_14px_36px_rgba(0,0,0,0.12)]">
          <div className="border-b border-black/6 p-2">
            <input
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              autoFocus
              placeholder="Tìm phông chữ..."
              className="w-full rounded-[8px] border border-black/8 bg-[#faf9f8] px-2.5 py-2 text-[9px] outline-none focus:border-[#cf5068]/35"
            />
          </div>

          <div className="max-h-[310px] overflow-y-auto p-1.5">
            {visible.map(
              (
                font
              ) => {
                const active =
                  font.value ===
                  value;

                return (
                  <button
                    key={
                      font.value
                    }
                    type="button"
                    onClick={() => {
                      onChange(
                        font.value
                      );

                      setOpen(
                        false
                      );

                      setSearch(
                        ''
                      );
                    }}
                    className={[
                      'flex w-full items-center gap-3 rounded-[8px] px-2.5 py-2 text-left transition',
                      active
                        ? 'bg-[#fff0f4]'
                        : 'hover:bg-[#faf7f7]',
                    ].join(' ')}
                  >
                    <span
                      style={{
                        fontFamily:
                          font.value,
                      }}
                      className="min-w-0 flex-1 truncate text-[16px] text-black/75"
                    >
                      {font.label}
                    </span>

                    <span className="shrink-0 text-[7px] font-bold uppercase tracking-[0.06em] text-black/25">
                      {font.group}
                    </span>

                    {active && (
                      <span className="shrink-0 text-[9px] font-black text-[#b83e57]">
                        ✓
                      </span>
                    )}
                  </button>
                );
              }
            )}

            {visible.length ===
              0 && (
              <p className="px-3 py-5 text-center text-[9px] text-black/30">
                Không tìm thấy phông chữ.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AssetPickerButton:
React.FC<{
  label:
    string;

  onClick:
    () => void;
}> = ({
  label,
  onClick,
}) => (
  <button
    type="button"
    onClick={
      onClick
    }
    className="w-full rounded-[9px] border border-[#cf5068]/20 bg-[#fff7f9] px-3 py-2.5 text-[9px] font-black text-[#a73551] transition hover:bg-[#f7e9ed]"
  >
    ▧ {label}
  </button>
);

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
