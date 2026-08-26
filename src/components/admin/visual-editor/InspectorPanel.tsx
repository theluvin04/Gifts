import React, {
  useEffect,
  useState,
} from 'react';

import {
  loadEditorFonts,
  type EditorFontOption,
} from '../../../config/editorFonts';

import type {
  PhotoFrameLayoutKind,
  SceneCanvasDefinition,
  SceneElement,
  SceneElementAction,
  SceneElementFrame,
  SceneImageShape,
} from '../../../engine';

import {
  IMAGE_SHAPE_PRESETS,
  PHOTOBOOTH_SHADOW_PRESETS,
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

      <div className="mt-3 rounded-[9px] border border-black/7 bg-[#faf9f8] p-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[9px] font-bold text-black/50">
            Độ cong của chữ (Curvature)
          </span>
          <span className="font-mono text-[9px] font-bold text-[#b83e57]">
            {style.curvature ? `${style.curvature > 0 ? '+' : ''}${style.curvature}%` : '0% (Thẳng)'}
          </span>
        </div>

        <input
          type="range"
          value={style.curvature || 0}
          min={-100}
          max={100}
          step={1}
          onChange={(event) =>
            patch({
              curvature: Number(event.target.value),
            })
          }
          className="w-full accent-[#b83e57]"
        />

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => patch({ curvature: 0 })}
            className={`rounded-[6px] px-2 py-1 text-[8px] font-bold transition ${
              !style.curvature || style.curvature === 0
                ? 'bg-[#b83e57] text-white shadow-sm'
                : 'border border-black/10 bg-white text-black/50 hover:bg-black/5'
            }`}
          >
            Thẳng (0)
          </button>
          <button
            type="button"
            onClick={() => patch({ curvature: 35 })}
            className={`rounded-[6px] px-2 py-1 text-[8px] font-bold transition ${
              style.curvature === 35
                ? 'bg-[#b83e57] text-white shadow-sm'
                : 'border border-black/10 bg-white text-black/50 hover:bg-black/5'
            }`}
          >
            Vòm nhẹ (+35)
          </button>
          <button
            type="button"
            onClick={() => patch({ curvature: 70 })}
            className={`rounded-[6px] px-2 py-1 text-[8px] font-bold transition ${
              style.curvature === 70
                ? 'bg-[#b83e57] text-white shadow-sm'
                : 'border border-black/10 bg-white text-black/50 hover:bg-black/5'
            }`}
          >
            Vòm cong (+70)
          </button>
          <button
            type="button"
            onClick={() => patch({ curvature: -35 })}
            className={`rounded-[6px] px-2 py-1 text-[8px] font-bold transition ${
              style.curvature === -35
                ? 'bg-[#b83e57] text-white shadow-sm'
                : 'border border-black/10 bg-white text-black/50 hover:bg-black/5'
            }`}
          >
            Uốn cười (-35)
          </button>
          <button
            type="button"
            onClick={() => patch({ curvature: 100 })}
            className={`rounded-[6px] px-2 py-1 text-[8px] font-bold transition ${
              style.curvature === 100
                ? 'bg-[#b83e57] text-white shadow-sm'
                : 'border border-black/10 bg-white text-black/50 hover:bg-black/5'
            }`}
          >
            Vòng tròn (+100)
          </button>
        </div>
      </div>
    </>
  );
};

const ImageControls: React.FC<{
  element: Extract<
    SceneElement,
    {
      type: 'image' | 'decor';
    }
  >;
  onChange: (
    updater: (element: SceneElement) => SceneElement
  ) => void;
  onOpenAssetLibrary: () => void;
}> = ({
  element,
  onChange,
  onOpenAssetLibrary,
}) => {
  const style = element.imageStyle || {};
  const currentShape = style.shape || 'rectangle';

  const patchStyle = (
    next: Record<string, unknown>
  ) =>
    onChange(
      (current) =>
        ({
          ...current,
          imageStyle: {
            ...(current.type === 'image' || current.type === 'decor'
              ? current.imageStyle
              : {}),
            ...next,
          },
        } as SceneElement)
    );

  const BORDER_COLORS = [
    { label: 'Trắng', value: '#ffffff' },
    { label: 'Đen', value: '#191919' },
    { label: 'Đỏ nhung', value: '#b83e57' },
    { label: 'Hồng pastel', value: '#fca5a5' },
    { label: 'Vàng gold', value: '#f59e0b' },
    { label: 'Xanh ngọc', value: '#14b8a6' },
    { label: 'Tím mộng mơ', value: '#a855f7' },
    { label: 'Bạc', value: '#94a3b8' },
  ];

  const BG_COLORS = [
    { label: 'Trong suốt', value: 'transparent' },
    { label: 'Trắng', value: '#ffffff' },
    { label: 'Kem sáng', value: '#fffdf8' },
    { label: 'Đen tối', value: '#191919' },
    { label: 'Hồng phấn', value: '#ffe4e6' },
    { label: 'Đỏ trầm', value: '#450a0a' },
  ];

  const SHADOW_PRESETS = [
    { label: 'Không bóng', value: '' },
    { label: 'Bóng nhẹ', value: '0 4px 14px rgba(0,0,0,0.08)' },
    { label: 'Bóng sâu 3D', value: '0 16px 36px rgba(0,0,0,0.22)' },
    { label: 'Phát sáng Gold', value: '0 0 22px rgba(245,158,11,0.5)' },
    { label: 'Phát sáng Hồng', value: '0 0 22px rgba(244,63,94,0.5)' },
    { label: 'Phát sáng Trắng', value: '0 0 20px rgba(255,255,255,0.7)' },
  ];

  return (
    <>
      <AssetPickerButton
        label={element.src ? 'Thay đổi ảnh từ kho tài nguyên' : 'Chọn ảnh từ kho tài nguyên'}
        onClick={onOpenAssetLibrary}
      />

      <TextInput
        label="Ảnh / đường dẫn URL"
        value={element.src}
        placeholder="/images/... hoặc https://..."
        onChange={(src) =>
          onChange(
            (current) =>
              ({
                ...current,
                src,
              } as SceneElement)
          )
        }
      />

      {/* 1. Kiểu dáng & Loại ô ảnh */}
      <div className="mt-3 rounded-[9px] border border-black/7 bg-[#faf9f8] p-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[9px] font-bold text-black/60">
            Loại ô & Hình dáng ô ảnh
          </span>
          <span className="text-[8px] font-black text-[#b83e57]">
            {IMAGE_SHAPE_PRESETS.find((p) => p.value === currentShape)?.label || 'Vuông'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {IMAGE_SHAPE_PRESETS.map((preset) => {
            const active = currentShape === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                title={preset.description}
                onClick={() => {
                  patchStyle({
                    shape: preset.value,
                    borderRadius:
                      preset.value === 'rounded'
                        ? (style.borderRadius && style.borderRadius > 0 ? style.borderRadius : 16)
                        : preset.value === 'circle'
                          ? 9999
                          : preset.value === 'rectangle'
                            ? 0
                            : style.borderRadius,
                  });
                }}
                className={`flex flex-col items-center justify-center rounded-[8px] border p-1.5 text-center transition ${
                  active
                    ? 'border-[#b83e57] bg-[#fff0f4] text-[#b83e57] shadow-sm ring-1 ring-[#b83e57]/40'
                    : 'border-black/7 bg-white text-black/60 hover:bg-black/5'
                }`}
              >
                <span className="text-[14px] leading-none">{preset.icon}</span>
                <span className="mt-1 line-clamp-1 text-[8px] font-bold">
                  {preset.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Bo góc (hiển thị khi dùng vuông hoặc bo góc) */}
      {(currentShape === 'rounded' || currentShape === 'rectangle') && (
        <div className="mt-2.5 rounded-[9px] border border-black/7 bg-[#faf9f8] p-2.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[9px] font-bold text-black/60">
              Bán kính bo góc (Corner Radius)
            </span>
            <span className="font-mono text-[9px] font-bold text-[#b83e57]">
              {style.borderRadius || 0}px
            </span>
          </div>

          <input
            type="range"
            value={style.borderRadius || 0}
            min={0}
            max={120}
            step={1}
            onChange={(event) =>
              patchStyle({
                borderRadius: Number(event.target.value),
                shape: Number(event.target.value) === 0 ? 'rectangle' : 'rounded',
              })
            }
            className="w-full accent-[#b83e57]"
          />

          <div className="mt-2 flex flex-wrap items-center gap-1">
            {[
              { label: '0px (Nhọn)', value: 0 },
              { label: '8px', value: 8 },
              { label: '16px', value: 16 },
              { label: '24px', value: 24 },
              { label: '36px', value: 36 },
              { label: 'Tròn', value: 9999 },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() =>
                  patchStyle({
                    borderRadius: item.value,
                    shape: item.value === 0 ? 'rectangle' : item.value >= 9999 ? 'circle' : 'rounded',
                  })
                }
                className={`rounded-[6px] px-2 py-1 text-[8px] font-bold transition ${
                  style.borderRadius === item.value
                    ? 'bg-[#b83e57] text-white shadow-sm'
                    : 'border border-black/10 bg-white text-black/50 hover:bg-black/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Viền & Stroke */}
      <div className="mt-2.5 rounded-[9px] border border-black/7 bg-[#faf9f8] p-2.5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[9px] font-bold text-black/60">
            Viền & Stroke (Đường viền ô ảnh)
          </span>
          <span className="font-mono text-[9px] font-bold text-[#b83e57]">
            {style.borderWidth ? `${style.borderWidth}px (${style.borderStyle || 'solid'})` : '0px (Không viền)'}
          </span>
        </div>

        {/* Độ dày viền */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[8px] font-bold text-black/40">
            <span>Độ dày viền (Stroke Width)</span>
            <span>{style.borderWidth || 0}px</span>
          </div>
          <input
            type="range"
            value={style.borderWidth || 0}
            min={0}
            max={30}
            step={1}
            onChange={(event) =>
              patchStyle({
                borderWidth: Number(event.target.value),
                borderStyle: style.borderStyle || 'solid',
              })
            }
            className="w-full accent-[#b83e57]"
          />
          <div className="flex flex-wrap gap-1">
            {[0, 1, 2, 4, 6, 8, 12, 16].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() =>
                  patchStyle({
                    borderWidth: w,
                    borderStyle: style.borderStyle || 'solid',
                  })
                }
                className={`rounded-[5px] px-2 py-0.5 text-[8px] font-bold transition ${
                  (style.borderWidth || 0) === w
                    ? 'bg-[#b83e57] text-white shadow-sm'
                    : 'border border-black/10 bg-white text-black/50 hover:bg-black/5'
                }`}
              >
                {w === 0 ? 'Tắt' : `${w}px`}
              </button>
            ))}
          </div>
        </div>

        {/* Kiểu viền */}
        {(style.borderWidth ?? 0) > 0 && (
          <div className="mt-3 space-y-1">
            <span className="text-[8px] font-bold text-black/40">Kiểu nét viền</span>
            <div className="grid grid-cols-3 gap-1">
              {[
                { value: 'solid', label: 'Nét liền ──' },
                { value: 'dashed', label: 'Nét đứt ╌╌' },
                { value: 'dotted', label: 'Nét chấm •••' },
                { value: 'double', label: 'Nét đôi ══' },
                { value: 'groove', label: 'Rãnh chìm' },
                { value: 'ridge', label: 'Gờ nổi' },
              ].map((st) => (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => patchStyle({ borderStyle: st.value })}
                  className={`rounded-[6px] border py-1 text-center text-[8px] font-bold transition ${
                    (style.borderStyle || 'solid') === st.value
                      ? 'border-[#b83e57] bg-[#fff0f4] text-[#b83e57] shadow-sm'
                      : 'border-black/10 bg-white text-black/50 hover:bg-black/5'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Màu viền */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-bold text-black/40">Màu viền (Stroke Color)</span>
            <div className="flex items-center gap-1.5">
              <span
                className="h-3.5 w-3.5 rounded-full border border-black/20 shadow-sm"
                style={{ backgroundColor: style.borderColor || '#ffffff' }}
              />
              <span className="font-mono text-[8px] font-bold text-black/60">
                {style.borderColor || '#ffffff'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="color"
              value={
                style.borderColor && style.borderColor.startsWith('#')
                  ? style.borderColor.slice(0, 7)
                  : '#ffffff'
              }
              onChange={(e) => patchStyle({ borderColor: e.target.value })}
              className="h-7 w-9 cursor-pointer rounded-[6px] border border-black/10 bg-white p-0.5"
            />
            <input
              type="text"
              value={style.borderColor || '#ffffff'}
              onChange={(e) => patchStyle({ borderColor: e.target.value })}
              placeholder="#ffffff"
              className="w-full rounded-[6px] border border-black/10 bg-white px-2 py-1 font-mono text-[9px] font-bold text-black/80"
            />
          </div>

          <div className="flex flex-wrap gap-1 pt-1">
            {BORDER_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.label}
                onClick={() => patchStyle({ borderColor: c.value })}
                className="flex items-center gap-1 rounded-[5px] border border-black/10 bg-white px-1.5 py-0.5 text-[8px] font-bold text-black/60 hover:bg-black/5"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full border border-black/20"
                  style={{ backgroundColor: c.value }}
                />
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Màu nền ô ảnh & Cách hiển thị */}
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <SelectInput
          label="Cách hiển thị ảnh"
          value={style.objectFit || 'contain'}
          options={[
            { value: 'contain', label: 'Vừa khung (Contain)' },
            { value: 'cover', label: 'Phủ kín (Cover)' },
            { value: 'fill', label: 'Kéo đầy (Fill)' },
          ]}
          onChange={(objectFit) => patchStyle({ objectFit })}
        />

        <div>
          <label className="mb-1 block text-[9px] font-bold text-black/60">
            Màu nền lót ô
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={
                style.background && style.background.startsWith('#')
                  ? style.background.slice(0, 7)
                  : '#ffffff'
              }
              onChange={(e) => patchStyle({ background: e.target.value })}
              className="h-7 w-8 cursor-pointer rounded-[6px] border border-black/10 bg-white p-0.5"
            />
            <input
              type="text"
              value={style.background || ''}
              placeholder="transparent"
              onChange={(e) => patchStyle({ background: e.target.value || undefined })}
              className="w-full rounded-[6px] border border-black/10 bg-white px-2 py-1 font-mono text-[9px] font-bold text-black/80"
            />
          </div>
        </div>
      </div>

      {/* Quick BG Swatches */}
      <div className="flex flex-wrap gap-1">
        {BG_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => patchStyle({ background: c.value === 'transparent' ? undefined : c.value })}
            className="flex items-center gap-1 rounded-[5px] border border-black/10 bg-white px-1.5 py-0.5 text-[8px] font-bold text-black/60 hover:bg-black/5"
          >
            <span
              className="h-2.5 w-2.5 rounded-full border border-black/20"
              style={{ backgroundColor: c.value === 'transparent' ? '#fff' : c.value }}
            />
            {c.label}
          </button>
        ))}
      </div>

      {/* 5. Bóng đổ & Hiệu ứng */}
      <div className="mt-2.5 rounded-[9px] border border-black/7 bg-[#faf9f8] p-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[9px] font-bold text-black/60">
            Bóng đổ & Hiệu ứng phát sáng
          </span>
        </div>

        <TextInput
          label="Mã bóng đổ CSS"
          value={style.boxShadow || ''}
          placeholder="0 12px 30px rgba(0,0,0,0.18)"
          onChange={(boxShadow) => patchStyle({ boxShadow: boxShadow || undefined })}
        />

        <div className="mt-2 flex flex-wrap gap-1">
          {SHADOW_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => patchStyle({ boxShadow: p.value || undefined })}
              className={`rounded-[5px] px-2 py-1 text-[8px] font-bold transition ${
                (style.boxShadow || '') === p.value
                  ? 'bg-[#b83e57] text-white shadow-sm'
                  : 'border border-black/10 bg-white text-black/50 hover:bg-black/5'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

const PHOTO_FRAME_THEMES = [
  { label: 'Đỏ đô sang trọng', value: '#7e192a', text: '#ffffff', border: 'rgba(255,255,255,0.2)' },
  { label: 'Trắng nghệ thuật', value: '#ffffff', text: '#222222', border: 'rgba(0,0,0,0.12)' },
  { label: 'Đen Film cổ điển', value: '#181818', text: '#f3ede2', border: 'rgba(255,255,255,0.15)' },
  { label: 'Kem Vintage', value: '#f4ecd8', text: '#3c3228', border: 'rgba(60,50,40,0.15)' },
  { label: 'Hồng Pastel', value: '#ffd6e0', text: '#70243b', border: 'rgba(112,36,59,0.15)' },
  { label: 'Xanh Navy', value: '#0f172a', text: '#e2e8f0', border: 'rgba(255,255,255,0.15)' },
  { label: 'Xanh Matcha', value: '#e2e8dd', text: '#2d3b2d', border: 'rgba(45,59,45,0.15)' },
];

const PhotoFrameControls: React.FC<{
  element: Extract<SceneElement, { type: 'photo-frame' }>;
  device: DeviceMode;
  onChange: (updater: (element: SceneElement) => SceneElement) => void;
  onOpenAssetLibrary: () => void;
}> = ({
  element,
  device,
  onChange,
  onOpenAssetLibrary,
}) => {
  const [activeSlotForPicker, setActiveSlotForPicker] = useState<number>(0);

  const style = resolvePhotoFrameStyle(
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

  const rawSources =
    device === 'mobile'
      ? element.mobileSources || element.sources
      : element.sources;

  const currentLayout = style.layout || 'strip-vertical-4';
  const slotCount =
    currentLayout === 'strip-vertical-4' || currentLayout === 'strip-horizontal-4' || style.preset === 'polaroid-grid-4'
      ? 4
      : currentLayout === 'strip-vertical-3'
        ? 3
        : currentLayout === 'strip-vertical-2'
          ? 2
          : 1;

  const resolvedSlotImages: string[] = [];
  for (let i = 0; i < slotCount; i++) {
    const s = rawSources?.[i] || (i === 0 ? source : '') || '';
    resolvedSlotImages.push(s);
  }

  const caption =
    device === 'mobile'
      ? element.mobileCaption ?? element.caption ?? ''
      : element.caption || '';

  const patchStyle = (next: Record<string, unknown>) =>
    onChange(
      (current) =>
        ({
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
        }) as SceneElement
    );

  const updateSlotImage = (index: number, newSrc: string) => {
    onChange((current) => {
      if (current.type !== 'photo-frame') return current;
      const curSources = [
        ...(device === 'mobile'
          ? current.mobileSources || current.sources || []
          : current.sources || []),
      ];
      while (curSources.length < slotCount) {
        curSources.push('');
      }
      curSources[index] = newSrc;

      if (device === 'mobile') {
        return {
          ...current,
          mobileSrc: index === 0 ? newSrc : current.mobileSrc || current.src,
          mobileSources: curSources,
        };
      }
      return {
        ...current,
        src: index === 0 ? newSrc : current.src,
        sources: curSources,
      };
    });
  };

  return (
    <>
      {/* 1. Chọn layout & Mẫu khung Polaroid / Photobooth */}
      <div>
        <p className="mb-2 text-[8px] font-black uppercase tracking-[0.1em] text-black/30">
          Mẫu dải ảnh / Khung Polaroid
        </p>

        <div className="grid grid-cols-2 gap-2">
          {PHOTO_FRAME_PRESETS.map((preset) => {
            const active = style.preset === preset.value;

            return (
              <button
                key={preset.value}
                type="button"
                title={preset.description}
                onClick={() =>
                  onChange((current) => {
                    if (current.type !== 'photo-frame') {
                      return current;
                    }

                    const selected = getPhotoFramePreset(preset.value);

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
                  })
                }
                className={[
                  'rounded-[9px] border p-2 text-left transition',
                  active
                    ? 'border-[#cf5068] bg-[#fff4f7] shadow-sm'
                    : 'border-black/8 bg-[#faf9f8] hover:border-[#cf5068]/30',
                ].join(' ')}
              >
                <div
                  style={{
                    background: preset.style.background,
                    borderRadius: preset.style.outerRadius,
                    boxShadow: '0 4px 10px rgba(30,20,20,0.12)',
                  }}
                  className="mx-auto flex h-14 w-10 flex-col gap-0.5 p-1"
                >
                  {preset.value === 'photobooth-4' || preset.value === 'photobooth-white-4' || preset.value === 'photobooth-black-4' || preset.value === 'photobooth-pink-4' ? (
                    <div className="flex flex-1 flex-col gap-0.5">
                      <div className="flex-1 rounded-[1px] bg-[#ded9d4]" />
                      <div className="flex-1 rounded-[1px] bg-[#ded9d4]" />
                      <div className="flex-1 rounded-[1px] bg-[#ded9d4]" />
                      <div className="flex-1 rounded-[1px] bg-[#ded9d4]" />
                    </div>
                  ) : preset.value === 'polaroid-grid-4' ? (
                    <div className="grid flex-1 grid-cols-2 gap-0.5">
                      <div className="rounded-[1px] bg-[#ded9d4]" />
                      <div className="rounded-[1px] bg-[#ded9d4]" />
                      <div className="rounded-[1px] bg-[#ded9d4]" />
                      <div className="rounded-[1px] bg-[#ded9d4]" />
                    </div>
                  ) : (
                    <div
                      style={{ borderRadius: preset.style.innerRadius }}
                      className="min-h-0 flex-1 bg-[#ded9d4]"
                    />
                  )}

                  <div
                    style={{ background: preset.style.captionColor }}
                    className="mx-auto h-[2px] w-1/2 rounded-full opacity-40"
                  />
                </div>

                <p className="mt-1.5 line-clamp-1 text-[8px] font-black text-black/70">
                  {preset.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Button chuẩn hóa kích thước */}
      <button
        type="button"
        onClick={() => {
          const preset = getPhotoFramePreset(style.preset);
          onChange((current) => {
            if (current.type !== 'photo-frame') return current;
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
          });
        }}
        className="w-full rounded-[9px] border border-[#cf5068]/20 bg-[#fff5f7] px-3 py-1.5 text-[9px] font-black text-[#a73551] transition hover:bg-[#f9e9ed]"
      >
        📐 Chuẩn hóa kích thước khung ({device === 'mobile' ? 'Mobile' : 'PC'})
      </button>

      {/* 2. Quản lý từng ô ảnh (Photo Slots) */}
      <div className="mt-2 rounded-[10px] border border-black/8 bg-[#faf9f8] p-2.5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-wider text-black/60">
            {slotCount > 1 ? `Danh sách ${slotCount} ô ảnh trong khung` : 'Ảnh trong khung'}
          </span>
          <span className="rounded bg-black/5 px-1.5 py-0.5 text-[8px] font-bold text-black/50">
            {slotCount} ảnh
          </span>
        </div>

        <div className="space-y-2">
          {resolvedSlotImages.map((imgUrl, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 rounded-[8px] border border-black/8 bg-white p-1.5 shadow-xs"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[6px] border border-black/10 bg-[#eae6e1]">
                {imgUrl ? (
                  <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[7px] font-bold text-black/30">
                    Ô #{idx + 1}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[8px] font-black text-black/70">
                    Ô số {idx + 1}
                  </span>
                  {imgUrl && (
                    <button
                      type="button"
                      onClick={() => updateSlotImage(idx, '')}
                      className="text-[8px] font-bold text-red-500 hover:underline"
                    >
                      Xóa ảnh
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={imgUrl}
                    placeholder="Dán link ảnh ô này..."
                    onChange={(e) => updateSlotImage(idx, e.target.value)}
                    className="w-full rounded-[4px] border border-black/10 bg-[#fafafa] px-1.5 py-0.5 font-mono text-[8px] text-black/80"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSlotForPicker(idx);
                      onOpenAssetLibrary();
                    }}
                    className="shrink-0 rounded-[4px] bg-[#cf5068] px-1.5 py-0.5 text-[8px] font-bold text-white shadow-xs hover:bg-[#b83e57]"
                  >
                    Chọn
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2">
          <AssetPickerButton
            label="Mở kho thư viện ảnh chung"
            onClick={onOpenAssetLibrary}
          />
        </div>
      </div>

      {/* 3. Hiệu ứng Đổ bóng Polaroid / Photobooth */}
      <div className="mt-2 rounded-[10px] border border-black/8 bg-[#faf9f8] p-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-wider text-black/60">
            Hiệu ứng Đổ bóng (Realistic Shadows)
          </span>
        </div>

        <TextInput
          label="Mã bóng đổ CSS"
          value={style.boxShadow || ''}
          placeholder="0 20px 48px rgba(0,0,0,0.22)"
          onChange={(boxShadow) => patchStyle({ boxShadow: boxShadow || undefined })}
        />

        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {PHOTOBOOTH_SHADOW_PRESETS.map((p) => {
            const isCurrent = (style.boxShadow || '') === p.value;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => patchStyle({ boxShadow: p.value || undefined })}
                className={`rounded-[6px] px-2 py-1 text-left text-[8px] font-bold transition ${
                  isCurrent
                    ? 'bg-[#b83e57] text-white shadow-xs'
                    : 'border border-black/10 bg-white text-black/60 hover:bg-black/5'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Màu nền khung & Bảng màu Photobooth chuẩn */}
      <div className="mt-2 rounded-[10px] border border-black/8 bg-[#faf9f8] p-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-wider text-black/60">
            Màu khung & Chú thích
          </span>
        </div>

        {/* Quick Theme Palettes */}
        <div className="mb-2 flex flex-wrap gap-1">
          {PHOTO_FRAME_THEMES.map((theme) => (
            <button
              key={theme.value}
              type="button"
              title={theme.label}
              onClick={() =>
                patchStyle({
                  background: theme.value,
                  captionColor: theme.text,
                })
              }
              className="flex items-center gap-1 rounded-[5px] border border-black/10 bg-white px-1.5 py-0.5 text-[8px] font-bold text-black/70 hover:bg-black/5"
            >
              <span
                className="h-3 w-3 rounded-full border border-black/20"
                style={{ backgroundColor: theme.value }}
              />
              {theme.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <ColorInput
            label="Màu nền khung"
            value={style.background || '#7e192a'}
            onChange={(background) => patchStyle({ background })}
          />

          <ColorInput
            label="Màu chữ chú thích"
            value={style.captionColor || '#ffffff'}
            onChange={(captionColor) => patchStyle({ captionColor })}
          />
        </div>
      </div>

      {/* 5. Chú thích dưới dải ảnh */}
      <div className="mt-2 rounded-[10px] border border-black/8 bg-[#faf9f8] p-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-wider text-black/60">
            Nội dung Chú thích dưới ảnh
          </span>
        </div>

        <TextInput
          label="Nội dung chú thích"
          value={caption}
          placeholder="VD: OUR MEMORIES · 2026"
          onChange={(caption) =>
            onChange(
              (current) =>
                ({
                  ...current,
                  ...(device === 'mobile'
                    ? { mobileCaption: caption }
                    : { caption }),
                }) as SceneElement
            )
          }
        />

        <div className="mt-2 grid grid-cols-2 gap-2">
          <NumberInput
            label="Cỡ chữ chú thích"
            value={style.captionFontSize || 16}
            min={8}
            max={80}
            step={1}
            suffix="px"
            onChange={(captionFontSize) => patchStyle({ captionFontSize })}
          />

          <SelectInput
            label="Căn lề chữ"
            value={style.captionAlign || 'center'}
            options={[
              { value: 'center', label: 'Chính giữa' },
              { value: 'left', label: 'Căn trái' },
              { value: 'right', label: 'Căn phải' },
            ]}
            onChange={(captionAlign) => patchStyle({ captionAlign: captionAlign as any })}
          />

          <NumberInput
            label="Khoảng chú thích"
            value={style.captionAreaPercent ?? 20}
            min={8}
            max={45}
            step={1}
            suffix="%"
            onChange={(captionAreaPercent) => patchStyle({ captionAreaPercent })}
          />

          <SelectInput
            label="Độ đậm chữ"
            value={String(style.captionFontWeight || 600)}
            options={[
              { value: '400', label: 'Bình thường (400)' },
              { value: '600', label: 'Đậm vừa (600)' },
              { value: '700', label: 'Đậm (700)' },
              { value: '800', label: 'Rất đậm (800)' },
            ]}
            onChange={(w) => patchStyle({ captionFontWeight: Number(w) })}
          />
        </div>
      </div>

      {/* 6. Tùy chỉnh chi tiết Bo góc & Viền từng ô ảnh */}
      <div className="mt-2 rounded-[10px] border border-black/8 bg-[#faf9f8] p-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-wider text-black/60">
            Tùy chỉnh Bo góc & Viền ô ảnh
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <SelectInput
            label="Cách đặt ảnh"
            value={style.imageFit || 'cover'}
            options={[
              { value: 'cover', label: 'Phủ kín ô (Cover)' },
              { value: 'contain', label: 'Hiện trọn ảnh (Contain)' },
            ]}
            onChange={(imageFit) => patchStyle({ imageFit })}
          />

          <NumberInput
            label="Khoảng cách ô ảnh"
            value={style.gapPercent ?? 4}
            min={0}
            max={15}
            step={0.5}
            suffix="%"
            onChange={(gapPercent) => patchStyle({ gapPercent })}
          />

          <NumberInput
            label="Lề khung ngoài"
            value={style.paddingPercent ?? 6}
            min={0}
            max={20}
            step={0.5}
            suffix="%"
            onChange={(paddingPercent) => patchStyle({ paddingPercent })}
          />

          <NumberInput
            label="Bo góc ngoài dải"
            value={style.outerRadius ?? 6}
            min={0}
            max={80}
            step={1}
            suffix="px"
            onChange={(outerRadius) => patchStyle({ outerRadius })}
          />

          <NumberInput
            label="Bo góc từng ô ảnh"
            value={style.innerRadius ?? 3}
            min={0}
            max={50}
            step={1}
            suffix="px"
            onChange={(innerRadius) => patchStyle({ innerRadius })}
          />

          <NumberInput
            label="Độ dày viền từng ô"
            value={style.innerBorderWidth ?? 0}
            min={0}
            max={20}
            step={1}
            suffix="px"
            onChange={(innerBorderWidth) => patchStyle({ innerBorderWidth })}
          />
        </div>

        {Boolean(style.innerBorderWidth && style.innerBorderWidth > 0) && (
          <div className="mt-2">
            <ColorInput
              label="Màu viền từng ô ảnh"
              value={style.innerBorderColor || '#ffffff'}
              onChange={(innerBorderColor) => patchStyle({ innerBorderColor })}
            />
          </div>
        )}
      </div>
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
              'square',
            label:
              'Hình vuông',
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

  const [
    fontOptions,
    setFontOptions,
  ] = useState<EditorFontOption[]>(
    () =>
      FONT_OPTIONS.map((font) => ({
        ...font,
        source: 'google' as const,
      }))
  );

  useEffect(() => {
    let alive = true;

    void loadEditorFonts().then((fonts) => {
      if (alive) {
        setFontOptions(fonts);
      }
    });

    return () => {
      alive = false;
    };
  }, []);

  const current =
    fontOptions.find(
      (
        font
      ) =>
        font.value ===
        value
    );

  const visible =
    fontOptions.filter(
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
