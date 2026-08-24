import React, {
  useEffect,
  useState,
} from 'react';

import type {
  SceneCanvasDefinition,
  SceneElement,
  SceneElementFrame,
} from '../../engine';

import type {
  TemplateVisualEditorConfig,
} from '../../templates/visualEditor';

import {
  createButtonElement,
  createDecorElement,
  createImageElement,
  createTextElement,
  createVisualScene,
  duplicateVisualScene,
} from '../../templates/visualEditor';

import {
  AddElementButton,
  TogglePill,
} from './visual-editor/EditorControls';

import {
  EditorCanvas,
} from './visual-editor/EditorCanvas';

import {
  InspectorPanel,
} from './visual-editor/InspectorPanel';

import {
  LayersPanel,
} from './visual-editor/LayersPanel';

import {
  PreviewOverlay,
} from './visual-editor/PreviewOverlay';

import {
  DeviceMode,
  getElementLabel,
  makeId,
} from './visual-editor/editorUtils';

interface Props {
  config:
    TemplateVisualEditorConfig;

  onChange: (
    config:
      TemplateVisualEditorConfig
  ) => void;
}

export const AdminVisualTemplateEditor:
React.FC<Props> = ({
  config,
  onChange,
}) => {
  const [
    selectedSceneId,
    setSelectedSceneId,
  ] =
    useState(
      config.initialSceneId ||
      config.scenes[0]
        ?.id ||
      ''
    );

  const [
    selectedElementId,
    setSelectedElementId,
  ] =
    useState<string>(
      ''
    );

  const [
    device,
    setDevice,
  ] =
    useState<DeviceMode>(
      'desktop'
    );

  const [
    previewOpen,
    setPreviewOpen,
  ] =
    useState(false);

  useEffect(() => {
    if (
      config.scenes.some(
        (scene) =>
          scene.id ===
          selectedSceneId
      )
    ) {
      return;
    }

    setSelectedSceneId(
      config.initialSceneId ||
      config.scenes[0]
        ?.id ||
      ''
    );

    setSelectedElementId(
      ''
    );
  }, [
    config,
    selectedSceneId,
  ]);

  const scene =
    config.scenes.find(
      (item) =>
        item.id ===
        selectedSceneId
    ) ||
    config.scenes[0];

  const selectedElement =
    scene?.elements.find(
      (element) =>
        element.id ===
        selectedElementId
    ) ||
    null;

  const updateConfig = (
    patch:
      Partial<
        TemplateVisualEditorConfig
      >
  ) => {
    onChange({
      ...config,
      ...patch,
    });
  };

  const updateScene = (
    nextScene:
      SceneCanvasDefinition
  ) => {
    onChange({
      ...config,

      scenes:
        config.scenes.map(
          (item) =>
            item.id ===
            nextScene.id
              ? nextScene
              : item
        ),
    });
  };

  const updateScenePatch = (
    patch:
      Partial<
        SceneCanvasDefinition
      >
  ) => {
    if (!scene) {
      return;
    }

    updateScene({
      ...scene,
      ...patch,
    });
  };

  const updateElement = (
    elementId:
      string,
    updater:
      (
        element:
          SceneElement
      ) =>
        SceneElement
  ) => {
    if (!scene) {
      return;
    }

    updateScene({
      ...scene,

      elements:
        scene.elements.map(
          (element) =>
            element.id ===
            elementId
              ? updater(
                  element
                )
              : element
        ),
    });
  };

  const updateElementFrame = (
    elementId:
      string,
    nextFrame:
      SceneElementFrame
  ) => {
    updateElement(
      elementId,
      (element) => {
        if (
          device ===
          'mobile'
        ) {
          return {
            ...element,

            mobileFrame: {
              ...element
                .mobileFrame,
              ...nextFrame,
            },
          } as
            SceneElement;
        }

        return {
          ...element,
          frame:
            nextFrame,
        } as
          SceneElement;
      }
    );
  };

  const addScene =
    () => {
      const next =
        createVisualScene(
          config.scenes
            .length +
            1
        );

      updateConfig({
        scenes: [
          ...config.scenes,
          next,
        ],
      });

      setSelectedSceneId(
        next.id
      );

      setSelectedElementId(
        ''
      );
    };

  const duplicateScene =
    () => {
      if (!scene) {
        return;
      }

      const next =
        duplicateVisualScene(
          scene,
          config.scenes
            .length +
            1
        );

      updateConfig({
        scenes: [
          ...config.scenes,
          next,
        ],
      });

      setSelectedSceneId(
        next.id
      );

      setSelectedElementId(
        ''
      );
    };

  const deleteScene =
    () => {
      if (
        !scene ||
        config.scenes
          .length <=
          1
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `Xóa scene "${scene.title || scene.id}"?`
        );

      if (!confirmed) {
        return;
      }

      const remaining =
        config.scenes.filter(
          (item) =>
            item.id !==
            scene.id
        );

      const nextInitial =
        config.initialSceneId ===
        scene.id
          ? remaining[0]
              .id
          : config.initialSceneId;

      onChange({
        ...config,
        initialSceneId:
          nextInitial,
        scenes:
          remaining,
      });

      setSelectedSceneId(
        remaining[0]
          .id
      );

      setSelectedElementId(
        ''
      );
    };

  const addElement = (
    type:
      | 'text'
      | 'image'
      | 'button'
      | 'decor'
  ) => {
    if (!scene) {
      return;
    }

    const count =
      scene.elements
        .length +
      1;

    const element =
      type ===
      'text'
        ? createTextElement(
            count
          )
        : type ===
            'image'
          ? createImageElement(
              count
            )
          : type ===
              'button'
            ? createButtonElement(
                count
              )
            : createDecorElement(
                count
              );

    updateScene({
      ...scene,

      elements: [
        ...scene.elements,
        element,
      ],
    });

    setSelectedElementId(
      element.id
    );
  };

  const deleteElement =
    () => {
      if (
        !scene ||
        !selectedElement
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `Xóa ${getElementLabel(selectedElement)}?`
        );

      if (!confirmed) {
        return;
      }

      updateScene({
        ...scene,

        elements:
          scene.elements.filter(
            (element) =>
              element.id !==
              selectedElement.id
          ),
      });

      setSelectedElementId(
        ''
      );
    };

  const duplicateElement =
    () => {
      if (
        !scene ||
        !selectedElement
      ) {
        return;
      }

      const copy =
        JSON.parse(
          JSON.stringify(
            selectedElement
          )
        ) as
          SceneElement;

      copy.id =
        makeId(
          selectedElement.type
        );

      copy.frame = {
        ...copy.frame,

        x:
          copy.frame.x +
          3,

        y:
          copy.frame.y +
          3,

        zIndex:
          (
            copy.frame
              .zIndex ||
            0
          ) +
          1,
      };

      updateScene({
        ...scene,

        elements: [
          ...scene.elements,
          copy,
        ],
      });

      setSelectedElementId(
        copy.id
      );
    };

  const moveLayer = (
    direction:
      1 |
      -1
  ) => {
    if (
      !selectedElement ||
      !scene
    ) {
      return;
    }

    updateElement(
      selectedElement.id,
      (element) => ({
        ...element,

        frame: {
          ...element.frame,

          zIndex:
            (
              element.frame
                .zIndex ||
              0
            ) +
            direction,
        },
      } as
        SceneElement)
    );
  };

  if (!scene) {
    return (
      <div className="rounded-[16px] bg-slate-50 p-8 text-center">
        <p className="text-sm font-bold text-slate-600">
          Chưa có scene.
        </p>

        <button
          type="button"
          onClick={
            addScene
          }
          className="mt-4 rounded-[10px] bg-black px-4 py-2.5 text-xs font-bold text-white"
        >
          Tạo scene đầu tiên
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="min-w-0">
        <div className="flex flex-col gap-4 border-b border-black/7 pb-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-base font-black">
              Visual Template Editor
            </h3>

            <p className="mt-1 max-w-[720px] text-[11px] leading-5 text-black/38">
              Kéo-thả, resize, xoay, chỉnh layer và animation. Đây là phần Admin dùng để dựng template; khách sẽ không thấy editor này.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <TogglePill
              active={
                device ===
                'desktop'
              }
              label="Desktop"
              onClick={() =>
                setDevice(
                  'desktop'
                )
              }
            />

            <TogglePill
              active={
                device ===
                'mobile'
              }
              label="Mobile"
              onClick={() =>
                setDevice(
                  'mobile'
                )
              }
            />

            <button
              type="button"
              onClick={() =>
                setPreviewOpen(
                  true
                )
              }
              className="rounded-[10px] bg-[#191919] px-3.5 py-2 text-[10px] font-bold text-white"
            >
              Xem preview
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-[14px] bg-[#faf9f8] p-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <select
              value={
                scene.id
              }
              onChange={(
                event
              ) => {
                setSelectedSceneId(
                  event.target
                    .value
                );

                setSelectedElementId(
                  ''
                );
              }}
              className="min-w-[150px] max-w-full rounded-[9px] border border-black/10 bg-white px-3 py-2 text-[11px] font-bold outline-none"
            >
              {config.scenes.map(
                (
                  item,
                  index
                ) => (
                  <option
                    key={
                      item.id
                    }
                    value={
                      item.id
                    }
                  >
                    {index +
                      1}
                    .{' '}
                    {item.title ||
                      item.id}
                  </option>
                )
              )}
            </select>

            <button
              type="button"
              onClick={
                addScene
              }
              className="rounded-[9px] border border-black/10 bg-white px-3 py-2 text-[10px] font-bold text-black/55"
            >
              + Scene
            </button>

            <button
              type="button"
              onClick={
                duplicateScene
              }
              className="rounded-[9px] border border-black/10 bg-white px-3 py-2 text-[10px] font-bold text-black/55"
            >
              Nhân bản
            </button>

            <button
              type="button"
              disabled={
                config.scenes
                  .length <=
                1
              }
              onClick={
                deleteScene
              }
              className="rounded-[9px] border border-red-100 bg-white px-3 py-2 text-[10px] font-bold text-red-500 disabled:opacity-30"
            >
              Xóa scene
            </button>

            <button
              type="button"
              disabled={
                config.initialSceneId ===
                scene.id
              }
              onClick={() =>
                updateConfig({
                  initialSceneId:
                    scene.id,
                })
              }
              className={[
                'rounded-[9px] border px-3 py-2 text-[10px] font-bold',
                config.initialSceneId ===
                scene.id
                  ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                  : 'border-black/10 bg-white text-black/55',
              ].join(' ')}
            >
              {config.initialSceneId ===
              scene.id
                ? 'Scene đầu ✓'
                : 'Đặt làm scene đầu'}
            </button>
          </div>

          <label className="flex shrink-0 items-center gap-2 text-[10px] font-bold text-black/50">
            <input
              type="checkbox"
              checked={
                config.enabled
              }
              onChange={(
                event
              ) =>
                updateConfig({
                  enabled:
                    event.target
                      .checked,
                })
              }
              className="h-4 w-4 accent-[#b83e57]"
            />

            Dùng Visual Engine
          </label>
        </div>

        <div className="mt-3 rounded-[12px] border border-amber-100 bg-amber-50 px-3 py-2.5 text-[10px] leading-5 text-amber-800">
          Editor này lưu scene thật vào Firestore và Preview chạy bằng Scene Engine. Love Story 01 ngoài storefront vẫn dùng renderer cũ; bước kế tiếp sẽ dựng Birthday template mới bằng chính scene này.
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <AddElementButton
            label="+ Text"
            onClick={() =>
              addElement(
                'text'
              )
            }
          />

          <AddElementButton
            label="+ Ảnh"
            onClick={() =>
              addElement(
                'image'
              )
            }
          />

          <AddElementButton
            label="+ Nút"
            onClick={() =>
              addElement(
                'button'
              )
            }
          />

          <AddElementButton
            label="+ Decor"
            onClick={() =>
              addElement(
                'decor'
              )
            }
          />
        </div>

        <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[190px_minmax(0,1fr)_280px]">
          <LayersPanel
            scene={
              scene
            }
            selectedElementId={
              selectedElementId
            }
            onSelect={
              setSelectedElementId
            }
            onToggleVisible={(
              elementId
            ) =>
              updateElement(
                elementId,
                (element) => ({
                  ...element,

                  visible:
                    element.visible ===
                    false,
                } as
                  SceneElement)
              )
            }
          />

          <EditorCanvas
            scene={
              scene
            }
            device={
              device
            }
            selectedElementId={
              selectedElementId
            }
            onSelect={
              setSelectedElementId
            }
            onClearSelection={() =>
              setSelectedElementId(
                ''
              )
            }
            onFrameChange={
              updateElementFrame
            }
          />

          <InspectorPanel
            scene={
              scene
            }
            element={
              selectedElement
            }
            device={
              device
            }
            scenes={
              config.scenes
            }
            onSceneChange={
              updateScenePatch
            }
            onElementChange={(
              updater
            ) => {
              if (
                !selectedElement
              ) {
                return;
              }

              updateElement(
                selectedElement.id,
                updater
              );
            }}
            onFrameChange={(
              frame
            ) => {
              if (
                !selectedElement
              ) {
                return;
              }

              updateElementFrame(
                selectedElement.id,
                frame
              );
            }}
            onDuplicate={
              duplicateElement
            }
            onDelete={
              deleteElement
            }
            onLayerUp={() =>
              moveLayer(1)
            }
            onLayerDown={() =>
              moveLayer(-1)
            }
          />
        </div>
      </div>

      {previewOpen && (
        <PreviewOverlay
          config={
            config
          }
          onClose={() =>
            setPreviewOpen(
              false
            )
          }
        />
      )}
    </>
  );
};
