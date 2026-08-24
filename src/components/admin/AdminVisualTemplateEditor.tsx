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
} from '../../engine';

import type {
  TemplateVisualEditorConfig,
} from '../../templates/visualEditor';

import {
  createButtonElement,
  createDecorElement,
  createImageElement,
  createPolaroidElement,
  createShapeElement,
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
  CanvasQuickBar,
} from './visual-editor/CanvasQuickBar';

import {
  AssetLibraryModal,
} from './visual-editor/AssetLibraryModal';

import {
  EditorToolbar,
} from './visual-editor/EditorToolbar';

import {
  InspectorPanel,
} from './visual-editor/InspectorPanel';

import {
  KeyboardShortcutsModal,
} from './visual-editor/KeyboardShortcutsModal';

import {
  LayersPanel,
} from './visual-editor/LayersPanel';

import {
  PreviewOverlay,
} from './visual-editor/PreviewOverlay';

import {
  AlignAction,
  CanvasAlignAction,
  cloneValue,
  DeviceMode,
  getEffectiveFrame,
  getElementLabel,
  getFrameBounds,
  getSelectionBounds,
  LayerAction,
  makeId,
  moveFrameToBounds,
  normalizeSelectionIds,
  setElementFrameForDevice,
} from './visual-editor/editorUtils';

import {
  useEditorHistory,
} from './visual-editor/useEditorHistory';

import {
  useEditorShortcuts,
} from './visual-editor/useEditorShortcuts';

interface Props {
  config:
    TemplateVisualEditorConfig;

  onChange: (
    config:
      TemplateVisualEditorConfig
  ) => void;
}

type ChangeMode =
  | 'commit'
  | 'replace';

type AssetPickerTarget =
  | {
      kind:
        'insert';
    }
  | {
      kind:
        'background';
    }
  | {
      kind:
        'element';
      elementId:
        string;
    };

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
    selectedElementIds,
    setSelectedElementIds,
  ] =
    useState<string[]>(
      []
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

  const [
    shortcutsOpen,
    setShortcutsOpen,
  ] =
    useState(false);

  const [
    gridEnabled,
    setGridEnabled,
  ] =
    useState(false);

  const [
    snapEnabled,
    setSnapEnabled,
  ] =
    useState(true);

  const [
    zoom,
    setZoom,
  ] =
    useState(100);

  const [
    fullscreen,
    setFullscreen,
  ] =
    useState(false);

  const [
    layersOpen,
    setLayersOpen,
  ] =
    useState(true);

  const [
    inspectorOpen,
    setInspectorOpen,
  ] =
    useState(true);

  const [
    compactViewport,
    setCompactViewport,
  ] =
    useState(
      () =>
        typeof window !==
          'undefined' &&
        window.matchMedia(
          '(max-width: 1199px)'
        ).matches
    );

  useEffect(() => {
    const media =
      window.matchMedia(
        '(max-width: 1199px)'
      );

    const update =
      () => {
        setCompactViewport(
          media.matches
        );
      };

    update();

    media.addEventListener(
      'change',
      update
    );

    return () =>
      media.removeEventListener(
        'change',
        update
      );
  }, []);

  const [
    assetPickerTarget,
    setAssetPickerTarget,
  ] =
    useState<
      AssetPickerTarget |
      null
    >(
      null
    );

  const clipboardRef =
    useRef<
      SceneElement[]
    >([]);

  const history =
    useEditorHistory({
      config,
      onChange,
    });

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

    setSelectedElementIds(
      []
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

  useEffect(() => {
    if (!scene) {
      setSelectedElementIds(
        []
      );
      return;
    }

    setSelectedElementIds(
      (current) =>
        normalizeSelectionIds(
          scene,
          current
        )
    );
  }, [
    scene?.id,
    scene?.elements,
  ]);

  const selectedElements =
    useMemo(
      () => {
        if (!scene) {
          return [];
        }

        const selected =
          new Set(
            selectedElementIds
          );

        return scene.elements.filter(
          (element) =>
            selected.has(
              element.id
            )
        );
      },
      [
        scene,
        selectedElementIds,
      ]
    );

  const groupedSelection =
    useMemo(
      () => {
        if (
          selectedElements.length ===
          0
        ) {
          return false;
        }

        const groupIds =
          new Set(
            selectedElements.map(
              (element) =>
                element.groupId ||
                ''
            )
          );

        return (
          groupIds.size ===
            1 &&
          !groupIds.has('')
        );
      },
      [
        selectedElements,
      ]
    );

  const applyConfig = (
    next:
      TemplateVisualEditorConfig,
    mode:
      ChangeMode =
      'commit'
  ) => {
    if (
      mode ===
      'replace'
    ) {
      history.replace(
        next
      );
      return;
    }

    history.commit(
      next
    );
  };

  const updateConfig = (
    patch:
      Partial<
        TemplateVisualEditorConfig
      >,
    mode:
      ChangeMode =
      'commit'
  ) => {
    applyConfig(
      {
        ...config,
        ...patch,
      },
      mode
    );
  };

  const updateScene = (
    nextScene:
      SceneCanvasDefinition,
    mode:
      ChangeMode =
      'commit'
  ) => {
    applyConfig(
      {
        ...config,

        scenes:
          config.scenes.map(
            (item) =>
              item.id ===
              nextScene.id
                ? nextScene
                : item
          ),
      },
      mode
    );
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
    updater: (
      element:
        SceneElement
    ) =>
      SceneElement,
    mode:
      ChangeMode =
      'commit'
  ) => {
    if (!scene) {
      return;
    }

    updateScene(
      {
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
      },
      mode
    );
  };

  const updateElementFrame = (
    elementId:
      string,
    nextFrame:
      SceneElementFrame,
    mode:
      ChangeMode =
      'commit'
  ) => {
    updateElement(
      elementId,
      (element) =>
        setElementFrameForDevice(
          element,
          device,
          nextFrame
        ),
      mode
    );
  };

  const updateFrames = (
    frames:
      Record<
        string,
        SceneElementFrame
      >,
    mode:
      ChangeMode =
      'replace'
  ) => {
    if (!scene) {
      return;
    }

    updateScene(
      {
        ...scene,

        elements:
          scene.elements.map(
            (element) => {
              const frame =
                frames[
                  element.id
                ];

              if (!frame) {
                return element;
              }

              return setElementFrameForDevice(
                element,
                device,
                frame
              );
            }
          ),
      },
      mode
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

      setSelectedElementIds(
        []
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

      setSelectedElementIds(
        []
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
          `Xóa trang "${scene.title || scene.id}"?`
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

      history.commit({
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

      setSelectedElementIds(
        []
      );
    };

  const addElement = (
    type:
      | 'text'
      | 'image'
      | 'button'
      | 'decor'
      | 'shape'
      | 'photo-frame'
  ) => {
    if (!scene) {
      return null;
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
            : type ===
                'shape'
              ? createShapeElement(
                  count
                )
              : type ===
                  'photo-frame'
                ? createPolaroidElement(
                    count
                  )
                : createDecorElement(
                    count
                  );

    const maxZ =
      Math.max(
        0,
        ...scene.elements.map(
          (item) =>
            item.frame
              .zIndex ||
            0
        )
      );

    element.frame = {
      ...element.frame,
      zIndex:
        maxZ +
        1,
    };

    updateScene({
      ...scene,

      elements: [
        ...scene.elements,
        element,
      ],
    });

    setSelectedElementIds([
      element.id,
    ]);

    return element.id;
  };

  const addPolaroid =
    () => {
      const elementId =
        addElement(
          'photo-frame'
        );

      if (
        elementId
      ) {
        setAssetPickerTarget({
          kind:
            'element',
          elementId,
        });
      }
    };

  const addAssetElement =
    (
      assetUrl: string,
      assetName: string
    ) => {
      if (!scene) {
        return;
      }

      const count =
        scene.elements
          .length +
        1;

      const element =
        createImageElement(
          count
        );

      element.src =
        assetUrl;

      element.name =
        assetName;

      if (
        element.type ===
        'image'
      ) {
        element.alt =
          assetName;

        element.imageStyle = {
          ...element.imageStyle,
          objectFit:
            'contain',
        };
      }

      const maxZ =
        Math.max(
          0,
          ...scene.elements.map(
            (
              item
            ) =>
              item.frame
                .zIndex ||
              0
          )
        );

      element.frame = {
        ...element.frame,
        zIndex:
          maxZ +
          1,
      };

      updateScene({
        ...scene,
        elements: [
          ...scene.elements,
          element,
        ],
      });

      setSelectedElementIds([
        element.id,
      ]);
    };

  const handleAssetSelected =
    (
      asset: {
        url: string;
        name: string;
      }
    ) => {
      if (
        !assetPickerTarget
      ) {
        return;
      }

      if (
        assetPickerTarget.kind ===
        'insert'
      ) {
        addAssetElement(
          asset.url,
          asset.name
        );
      }

      if (
        assetPickerTarget.kind ===
        'background' &&
        scene
      ) {
        updateScene({
          ...scene,
          background: {
            ...scene.background,
            imageUrl:
              asset.url,
          },
        });
      }

      if (
        assetPickerTarget.kind ===
        'element'
      ) {
        updateElement(
          assetPickerTarget
            .elementId,
          (
            element
          ) => {
            if (
              element.type !==
                'image' &&
              element.type !==
                'decor' &&
              element.type !==
                'photo-frame'
            ) {
              return element;
            }

            return {
              ...element,
              src:
                asset.url,
              name:
                element.name ||
                asset.name,
              alt:
                asset.name,
            } as
              SceneElement;
          }
        );
      }

      setAssetPickerTarget(
        null
      );
    };

  const deleteSelected =
    () => {
      if (
        !scene ||
        selectedElementIds
          .length ===
          0
      ) {
        return;
      }

      const selected =
        new Set(
          selectedElementIds
        );

      updateScene({
        ...scene,

        elements:
          scene.elements.filter(
            (element) =>
              !selected.has(
                element.id
              )
          ),
      });

      setSelectedElementIds(
        []
      );
  };

  const copySelected =
    () => {
      if (
        selectedElements.length ===
        0
      ) {
        return;
      }

      clipboardRef.current =
        cloneValue(
          selectedElements
        );
    };

  const createCopies = (
    source:
      SceneElement[]
  ) => {
    if (
      !scene ||
      source.length ===
      0
    ) {
      return;
    }

    const idMap =
      new Map<
        string,
        string
      >();

    const groupMap =
      new Map<
        string,
        string
      >();

    source.forEach(
      (element) => {
        idMap.set(
          element.id,
          makeId(
            element.type
          )
        );

        if (
          element.groupId &&
          !groupMap.has(
            element.groupId
          )
        ) {
          groupMap.set(
            element.groupId,
            makeId(
              'group'
            )
          );
        }
      }
    );

    const maxZ =
      Math.max(
        0,
        ...scene.elements.map(
          (element) =>
            element.frame
              .zIndex ||
            0
        )
      );

    const copies =
      source.map(
        (
          element,
          index
        ) => {
          const copy =
            cloneValue(
              element
            );

          copy.id =
            idMap.get(
              element.id
            )!;

          copy.groupId =
            element.groupId
              ? groupMap.get(
                  element.groupId
                )
              : undefined;

          const sourceFrame =
            copy.frame;

          copy.frame = {
            ...sourceFrame,
            x:
              sourceFrame.x +
              3,
            y:
              sourceFrame.y +
              3,
            zIndex:
              maxZ +
              index +
              1,
          };

          if (
            copy.mobileFrame
          ) {
            copy.mobileFrame = {
              ...copy.mobileFrame,
              x:
                (
                  copy.mobileFrame
                    .x ??
                  sourceFrame.x
                ) +
                3,
              y:
                (
                  copy.mobileFrame
                    .y ??
                  sourceFrame.y
                ) +
                3,
            };
          }

          copy.actions =
            (
              copy.actions ||
              []
            ).map(
              (action) => {
                if (
                  (
                    action.type ===
                      'show-element' ||
                    action.type ===
                      'hide-element' ||
                    action.type ===
                      'toggle-element' ||
                    action.type ===
                      'replay-animation'
                  ) &&
                  idMap.has(
                    action.elementId
                  )
                ) {
                  return {
                    ...action,
                    elementId:
                      idMap.get(
                        action.elementId
                      )!,
                  } as any;
                }

                return action;
              }
            );

          return copy;
        }
      );

    updateScene({
      ...scene,
      elements: [
        ...scene.elements,
        ...copies,
      ],
    });

    setSelectedElementIds(
      copies.map(
        (element) =>
          element.id
      )
    );
  };

  const paste =
    () => {
      createCopies(
        clipboardRef.current
      );
    };

  const duplicateSelected =
    () => {
      createCopies(
        selectedElements
      );
    };

  const groupSelected =
    () => {
      if (
        !scene ||
        selectedElementIds
          .length <
          2
      ) {
        return;
      }

      const selected =
        new Set(
          selectedElementIds
        );

      const groupId =
        makeId(
          'group'
        );

      updateScene({
        ...scene,

        elements:
          scene.elements.map(
            (element) =>
              selected.has(
                element.id
              )
                ? {
                    ...element,
                    groupId,
                  }
                : element
          ),
      });
    };

  const ungroupSelected =
    () => {
      if (
        !scene ||
        selectedElementIds
          .length ===
          0
      ) {
        return;
      }

      const selectedGroupIds =
        new Set(
          selectedElements
            .map(
              (element) =>
                element.groupId
            )
            .filter(
              Boolean
            ) as
            string[]
        );

      if (
        selectedGroupIds.size ===
        0
      ) {
        return;
      }

      updateScene({
        ...scene,

        elements:
          scene.elements.map(
            (element) =>
              element.groupId &&
              selectedGroupIds.has(
                element.groupId
              )
                ? {
                    ...element,
                    groupId:
                      undefined,
                  }
                : element
          ),
      });
    };

  const nudgeSelection = (
    dx: number,
    dy: number
  ) => {
    if (
      !scene ||
      selectedElements.length ===
      0
    ) {
      return;
    }

    const nextFrames:
      Record<
        string,
        SceneElementFrame
      > = {};

    selectedElements.forEach(
      (element) => {
        if (
          element.locked
        ) {
          return;
        }

        const frame =
          getEffectiveFrame(
            element,
            device
          );

        nextFrames[
          element.id
        ] = {
          ...frame,
          x:
            frame.x +
            dx,
          y:
            frame.y +
            dy,
        };
      }
    );

    if (
      Object.keys(
        nextFrames
      ).length ===
      0
    ) {
      return;
    }

    if (!scene) {
      return;
    }

    updateFrames(
      nextFrames,
      'commit'
    );
  };

  const alignSelection = (
    action:
      AlignAction
  ) => {
    if (
      !scene ||
      selectedElements.length <
      2
    ) {
      return;
    }

    const unlocked =
      selectedElements.filter(
        (element) =>
          !element.locked
      );

    if (
      unlocked.length <
      2
    ) {
      return;
    }

    const selectionBounds =
      getSelectionBounds(
        unlocked,
        device
      );

    if (
      !selectionBounds
    ) {
      return;
    }

    const nextFrames:
      Record<
        string,
        SceneElementFrame
      > = {};

    if (
      action ===
        'distribute-x' ||
      action ===
        'distribute-y'
    ) {
      if (
        unlocked.length <
        3
      ) {
        return;
      }

      const items =
        unlocked
          .map(
            (element) => {
              const frame =
                getEffectiveFrame(
                  element,
                  device
                );

              return {
                element,
                frame,
                bounds:
                  getFrameBounds(
                    frame
                  ),
              };
            }
          )
          .sort(
            (
              left,
              right
            ) =>
              action ===
              'distribute-x'
                ? left.bounds
                    .centerX -
                  right.bounds
                    .centerX
                : left.bounds
                    .centerY -
                  right.bounds
                    .centerY
          );

      const first =
        action ===
        'distribute-x'
          ? items[0]
              .bounds
              .centerX
          : items[0]
              .bounds
              .centerY;

      const last =
        action ===
        'distribute-x'
          ? items[
              items.length -
                1
            ].bounds
              .centerX
          : items[
              items.length -
                1
            ].bounds
              .centerY;

      const step =
        (
          last -
          first
        ) /
        (
          items.length -
          1
        );

      items.forEach(
        (
          item,
          index
        ) => {
          const target =
            first +
            step *
              index;

          nextFrames[
            item.element.id
          ] =
            action ===
            'distribute-x'
              ? moveFrameToBounds(
                  item.frame,
                  {
                    centerX:
                      target,
                  }
                )
              : moveFrameToBounds(
                  item.frame,
                  {
                    centerY:
                      target,
                  }
                );
        }
      );
    } else {
      unlocked.forEach(
        (element) => {
          const frame =
            getEffectiveFrame(
              element,
              device
            );

          const target =
            action ===
            'left'
              ? {
                  left:
                    selectionBounds.left,
                }
              : action ===
                  'center-x'
                ? {
                    centerX:
                      selectionBounds.centerX,
                  }
                : action ===
                    'right'
                  ? {
                      right:
                        selectionBounds.right,
                    }
                  : action ===
                      'top'
                    ? {
                        top:
                          selectionBounds.top,
                      }
                    : action ===
                        'center-y'
                      ? {
                          centerY:
                            selectionBounds.centerY,
                        }
                      : {
                          bottom:
                            selectionBounds.bottom,
                        };

          nextFrames[
            element.id
          ] =
            moveFrameToBounds(
              frame,
              target
            );
        }
      );
    }

    updateFrames(
      nextFrames,
      'commit'
    );
  };

  const alignSelectionToCanvas =
    (
      action:
        CanvasAlignAction
    ) => {
      if (
        !scene ||
        selectedElements.length ===
        0
      ) {
        return;
      }

      const unlocked =
        selectedElements.filter(
          (
            element
          ) =>
            !element.locked
        );

      if (
        unlocked.length ===
        0
      ) {
        return;
      }

      const escapeSelector =
        (
          value: string
        ) => {
          if (
            typeof CSS !==
              'undefined' &&
            typeof CSS.escape ===
              'function'
          ) {
            return CSS.escape(
              value
            );
          }

          return value.replace(
            /["\\]/g,
            '\\$&'
          );
        };

      const domElements =
        unlocked
          .map(
            (
              element
            ) =>
              document.querySelector(
                `[data-editor-element-id="${escapeSelector(element.id)}"]`
              ) as
                HTMLElement |
                null
          )
          .filter(
            (
              element
            ):
              element is
              HTMLElement =>
                Boolean(
                  element
                )
          );

      const canvasElement =
        domElements[0]
          ?.offsetParent as
          HTMLElement |
          null;

      let bounds:
        {
          left: number;
          top: number;
          right: number;
          bottom: number;
          centerX: number;
          centerY: number;
        } |
        null = null;

      if (
        canvasElement &&
        domElements.length ===
          unlocked.length
      ) {
        const canvasRect =
          canvasElement
            .getBoundingClientRect();

        if (
          canvasRect.width >
            0 &&
          canvasRect.height >
            0
        ) {
          const rects =
            domElements.map(
              (
                element
              ) =>
                element
                  .getBoundingClientRect()
            );

          const leftPx =
            Math.min(
              ...rects.map(
                (
                  rect
                ) =>
                  rect.left
              )
            );

          const topPx =
            Math.min(
              ...rects.map(
                (
                  rect
                ) =>
                  rect.top
              )
            );

          const rightPx =
            Math.max(
              ...rects.map(
                (
                  rect
                ) =>
                  rect.right
              )
            );

          const bottomPx =
            Math.max(
              ...rects.map(
                (
                  rect
                ) =>
                  rect.bottom
              )
            );

          const left =
            (
              leftPx -
              canvasRect.left
            ) /
            canvasRect.width *
            100;

          const top =
            (
              topPx -
              canvasRect.top
            ) /
            canvasRect.height *
            100;

          const right =
            (
              rightPx -
              canvasRect.left
            ) /
            canvasRect.width *
            100;

          const bottom =
            (
              bottomPx -
              canvasRect.top
            ) /
            canvasRect.height *
            100;

          bounds = {
            left,
            top,
            right,
            bottom,
            centerX:
              (
                left +
                right
              ) /
              2,
            centerY:
              (
                top +
                bottom
              ) /
              2,
          };
        }
      }

      if (
        !bounds
      ) {
        const fallback =
          getSelectionBounds(
            unlocked,
            device
          );

        if (
          !fallback
        ) {
          return;
        }

        bounds =
          fallback;
      }

      let dx = 0;
      let dy = 0;

      if (
        action ===
        'left'
      ) {
        dx =
          -bounds.left;
      }

      if (
        action ===
        'center-x'
      ) {
        dx =
          50 -
          bounds.centerX;
      }

      if (
        action ===
        'right'
      ) {
        dx =
          100 -
          bounds.right;
      }

      if (
        action ===
        'top'
      ) {
        dy =
          -bounds.top;
      }

      if (
        action ===
        'center-y'
      ) {
        dy =
          50 -
          bounds.centerY;
      }

      if (
        action ===
        'bottom'
      ) {
        dy =
          100 -
          bounds.bottom;
      }

      const nextFrames:
        Record<
          string,
          SceneElementFrame
        > = {};

      unlocked.forEach(
        (
          element
        ) => {
          const frame =
            getEffectiveFrame(
              element,
              device
            );

          nextFrames[
            element.id
          ] = {
            ...frame,
            x:
              frame.x +
              dx,
            y:
              frame.y +
              dy,
          };
        }
      );

      updateFrames(
        nextFrames,
        'commit'
      );
    };

  const rotateSelection =
    (
      action:
        'left' |
        'reset' |
        'right'
    ) => {
      if (
        !scene ||
        selectedElements.length ===
        0
      ) {
        return;
      }

      const nextFrames:
        Record<
          string,
          SceneElementFrame
        > = {};

      selectedElements.forEach(
        (
          element
        ) => {
          if (
            element.locked
          ) {
            return;
          }

          const frame =
            getEffectiveFrame(
              element,
              device
            );

          const current =
            frame.rotate ||
            0;

          nextFrames[
            element.id
          ] = {
            ...frame,
            rotate:
              action ===
              'reset'
                ? 0
                : action ===
                    'left'
                  ? current -
                    90
                  : current +
                    90,
          };
        }
      );

      updateFrames(
        nextFrames,
        'commit'
      );
    };

  const moveLayer = (
    action:
      LayerAction
  ) => {
    if (
      !scene ||
      selectedElements.length ===
      0
    ) {
      return;
    }

    const selected =
      new Set(
        selectedElementIds
      );

    const allZ =
      scene.elements.map(
        (element) =>
          getEffectiveFrame(
            element,
            device
          ).zIndex ||
          0
      );

    const maxZ =
      Math.max(
        0,
        ...allZ
      );

    const minZ =
      Math.min(
        0,
        ...allZ
      );

    let order =
      0;

    const nextFrames:
      Record<
        string,
        SceneElementFrame
      > = {};

    scene.elements.forEach(
      (element) => {
        if (
          !selected.has(
            element.id
          ) ||
          element.locked
        ) {
          return;
        }

        const frame =
          getEffectiveFrame(
            element,
            device
          );

        order += 1;

        const zIndex =
          action ===
          'forward'
            ? (
                frame.zIndex ||
                0
              ) +
              1
            : action ===
                'backward'
              ? (
                  frame.zIndex ||
                  0
                ) -
                1
              : action ===
                  'front'
                ? maxZ +
                  order
                : minZ -
                  order;

        nextFrames[
          element.id
        ] = {
          ...frame,
          zIndex,
        };
      }
    );

    updateFrames(
      nextFrames,
      'commit'
    );
  };

  const toggleSelectedLock =
    () => {
      if (
        !scene ||
        selectedElements.length ===
        0
      ) {
        return;
      }

      const shouldLock =
        selectedElements.some(
          (element) =>
            !element.locked
        );

      const selected =
        new Set(
          selectedElementIds
        );

      updateScene({
        ...scene,

        elements:
          scene.elements.map(
            (element) =>
              selected.has(
                element.id
              )
                ? {
                    ...element,
                    locked:
                      shouldLock,
                  }
                : element
          ),
      });
    };

  const toggleElementVisible =
    (
      elementId:
        string
    ) => {
      updateElement(
        elementId,
        (element) => ({
          ...element,
          visible:
            element.visible ===
            false,
        } as
          SceneElement)
      );
    };

  const toggleElementLock =
    (
      elementId:
        string
    ) => {
      updateElement(
        elementId,
        (element) => ({
          ...element,
          locked:
            !element.locked,
        } as
          SceneElement)
      );
    };

  const selectAll =
    () => {
      if (!scene) {
        return;
      }

      setSelectedElementIds(
        scene.elements.map(
          (element) =>
            element.id
        )
      );
    };

  const changeZoom = (
    next:
      number
  ) => {
    setZoom(
      Math.max(
        25,
        Math.min(
          200,
          Math.round(
            next
          )
        )
      )
    );
  };

  useEditorShortcuts({
    undo:
      history.undo,

    redo:
      history.redo,

    copy:
      copySelected,

    paste,

    duplicate:
      duplicateSelected,

    remove:
      deleteSelected,

    selectAll,

    clearSelection:
      () =>
        setSelectedElementIds(
          []
        ),

    group:
      groupSelected,

    ungroup:
      ungroupSelected,

    nudge:
      nudgeSelection,

    layerForward:
      () =>
        moveLayer(
          'forward'
        ),

    layerBackward:
      () =>
        moveLayer(
          'backward'
        ),

    layerFront:
      () =>
        moveLayer(
          'front'
        ),

    layerBack:
      () =>
        moveLayer(
          'back'
        ),

    toggleLock:
      toggleSelectedLock,

    zoomIn:
      () =>
        changeZoom(
          zoom +
            10
        ),

    zoomOut:
      () =>
        changeZoom(
          zoom -
            10
        ),

    zoomReset:
      () =>
        changeZoom(
          100
        ),

    openShortcutHelp:
      () =>
        setShortcutsOpen(
          true
        ),
  });

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
          Tạo trang đầu tiên
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className={[
          'min-w-0 bg-[#f4f3f1]',
          fullscreen
            ? 'fixed inset-0 z-[110] overflow-hidden p-2 sm:p-3'
            : 'rounded-[14px] border border-black/8 p-2 sm:p-3',
        ].join(' ')}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[11px] border border-black/7 bg-white px-3 py-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-xs font-black sm:text-sm">
                Trình thiết kế
              </h3>

              <span className="rounded-full bg-[#f4e9ec] px-2 py-1 text-[8px] font-black text-[#a63550]">
                CANVA MINI
              </span>
            </div>

            <p className="mt-0.5 hidden truncate text-[9px] text-black/30 md:block">
              {scene.title || scene.id}
              {' · '}
              {selectedElements.length} đối tượng đã chọn
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <TogglePill
              active={
                device ===
                'desktop'
              }
              label="Máy tính"
              onClick={() => {
                setDevice(
                  'desktop'
                );

                setSelectedElementIds(
                  []
                );
              }}
            />

            <TogglePill
              active={
                device ===
                'mobile'
              }
              label="Điện thoại"
              onClick={() => {
                setDevice(
                  'mobile'
                );

                setSelectedElementIds(
                  []
                );
              }}
            />

            <button
              type="button"
              onClick={() =>
                setLayersOpen(
                  (value) =>
                    !value
                )
              }
              className={[
                'rounded-[8px] border px-2.5 py-2 text-[9px] font-black',
                layersOpen
                  ? 'border-[#cf5068]/20 bg-[#f9eef1] text-[#a63550]'
                  : 'border-black/8 bg-white text-black/35',
              ].join(' ')}
            >
              Lớp
            </button>

            <button
              type="button"
              onClick={() =>
                setInspectorOpen(
                  (value) =>
                    !value
                )
              }
              className={[
                'rounded-[8px] border px-2.5 py-2 text-[9px] font-black',
                inspectorOpen
                  ? 'border-[#cf5068]/20 bg-[#f9eef1] text-[#a63550]'
                  : 'border-black/8 bg-white text-black/35',
              ].join(' ')}
            >
              Thuộc tính
            </button>

            <button
              type="button"
              onClick={() =>
                setFullscreen(
                  (value) =>
                    !value
                )
              }
              className="rounded-[8px] border border-black/8 bg-white px-2.5 py-2 text-[9px] font-black text-black/45"
            >
              {fullscreen
                ? 'Thu nhỏ'
                : 'Toàn màn hình'}
            </button>

            <button
              type="button"
              onClick={() =>
                setPreviewOpen(
                  true
                )
              }
              className="rounded-[8px] bg-[#191919] px-3 py-2 text-[9px] font-black text-white"
            >
              Xem thử
            </button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-black/7 bg-white p-2">
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

                setSelectedElementIds(
                  []
                );
              }}
              className="min-w-[150px] max-w-[260px] rounded-[8px] border border-black/10 bg-[#faf9f8] px-2.5 py-2 text-[9px] font-black outline-none"
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
              className="rounded-[8px] border border-black/9 bg-white px-2.5 py-2 text-[9px] font-black text-black/45"
            >
              + Trang
            </button>

            <button
              type="button"
              onClick={
                duplicateScene
              }
              className="rounded-[8px] border border-black/9 bg-white px-2.5 py-2 text-[9px] font-black text-black/45"
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
              className="rounded-[8px] border border-red-100 bg-white px-2.5 py-2 text-[9px] font-black text-red-500 disabled:opacity-30"
            >
              Xóa
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
                ? 'Trang đầu ✓'
                : 'Đặt làm trang đầu'}
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

            Bật hiển thị động
          </label>
        </div>

        <EditorToolbar
          selectionCount={
            selectedElements.length
          }
          groupedSelection={
            groupedSelection
          }
          canUndo={
            history.canUndo
          }
          canRedo={
            history.canRedo
          }
          gridEnabled={
            gridEnabled
          }
          snapEnabled={
            snapEnabled
          }
          zoom={
            zoom
          }
          onUndo={
            history.undo
          }
          onRedo={
            history.redo
          }
          onCopy={
            copySelected
          }
          onPaste={
            paste
          }
          onNhân bản={
            duplicateSelected
          }
          onDelete={
            deleteSelected
          }
          onGroup={
            groupSelected
          }
          onUngroup={
            ungroupSelected
          }
          onAlign={
            alignSelection
          }
          onLayer={
            moveLayer
          }
          onToggleLock={
            toggleSelectedLock
          }
          onToggleGrid={() =>
            setGridEnabled(
              (value) =>
                !value
            )
          }
          onToggleSnap={() =>
            setSnapEnabled(
              (value) =>
                !value
            )
          }
          onZoomChange={
            changeZoom
          }
          onOpenShortcuts={() =>
            setShortcutsOpen(
              true
            )
          }
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <AddElementButton
            label="+ Chữ"
            onClick={() =>
              addElement(
                'text'
              )
            }
          />

          <button
            type="button"
            onClick={() =>
              setAssetPickerTarget({
                kind:
                  'insert',
              })
            }
            className="rounded-[9px] bg-[#191919] px-3 py-2 text-[10px] font-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
          >
            Tài nguyên
          </button>

          <AddElementButton
            label="+ Ảnh"
            onClick={() =>
              setAssetPickerTarget({
                kind:
                  'insert',
              })
            }
          />

          <AddElementButton
            label="+ Khung Polaroid"
            onClick={
              addPolaroid
            }
          />

          <AddElementButton
            label="+ Hình"
            onClick={() =>
              addElement(
                'shape'
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
            label="+ Trang trí"
            onClick={() =>
              addElement(
                'decor'
              )
            }
          />
        </div>

        <div
          className="mt-2 grid min-w-0 gap-2 overflow-hidden"
          style={{
            gridTemplateColumns:
              compactViewport
                ? 'minmax(0, 1fr)'
                : [
                    layersOpen
                      ? fullscreen
                        ? '190px'
                        : '175px'
                      : '',
                    'minmax(0, 1fr)',
                    inspectorOpen
                      ? fullscreen
                        ? '280px'
                        : '260px'
                      : '',
                  ]
                    .filter(
                      Boolean
                    )
                    .join(' '),
          }}
        >
          {layersOpen && (
          <LayersPanel
            scene={
              scene
            }
            selectedElementIds={
              selectedElementIds
            }
            onSelectionChange={
              setSelectedElementIds
            }
            onToggleVisible={
              toggleElementVisible
            }
            onToggleLock={
              toggleElementLock
            }
          />
          )}

          <div className="min-w-0">
            <EditorCanvas
              scene={
                scene
              }
              device={
                device
              }
              selectedElementIds={
                selectedElementIds
              }
              zoom={
                zoom
              }
              gridEnabled={
                gridEnabled
              }
              snapEnabled={
                snapEnabled
              }
              onSelectionChange={
                setSelectedElementIds
              }
              onTransformStart={
                history.checkpoint
              }
              onFramesChange={
                updateFrames
              }
            />

            <CanvasQuickBar
              selectionCount={
                selectedElements.length
              }
              onAlignCanvas={
                alignSelectionToCanvas
              }
              onRotate={
                rotateSelection
              }
              onLayer={
                moveLayer
              }
              onDuplicate={
                duplicateSelected
              }
              onToggleLock={
                toggleSelectedLock
              }
            />
          </div>

          {inspectorOpen && (
          <InspectorPanel
            scene={
              scene
            }
            elements={
              selectedElements
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
            onElementChange={
              updateElement
            }
            onFrameChange={
              updateElementFrame
            }
            onNhân bản={
              duplicateSelected
            }
            onDelete={
              deleteSelected
            }
            onLayerUp={() =>
              moveLayer(
                'forward'
              )
            }
            onLayerDown={() =>
              moveLayer(
                'backward'
              )
            }
            onToggleLock={
              toggleSelectedLock
            }
            onOpenAssetLibrary={(
              target
            ) =>
              setAssetPickerTarget(
                target.kind ===
                  'background'
                  ? {
                      kind:
                        'background',
                    }
                  : {
                      kind:
                        'element',
                      elementId:
                        target.elementId,
                    }
              )
            }
          />
          )}
        </div>

        {!fullscreen && (
        <div className="mt-2 rounded-[9px] border border-[#cf5068]/10 bg-[#fff9fa] px-3 py-2 text-[9px] leading-4 text-black/35">
          Thiết kế trong Admin → Lưu thay đổi. Dùng Toàn màn hình khi cần không gian khung vẽ lớn hơn.
        </div>
        )}
      </div>

      {assetPickerTarget && (
        <AssetLibraryModal
          title={
            assetPickerTarget.kind ===
              'insert'
              ? 'Chọn tài nguyên để thêm vào khung vẽ'
              : assetPickerTarget.kind ===
                  'background'
                ? 'Chọn ảnh nền'
                : 'Thay ảnh từ kho tài nguyên'
          }
          onClose={() =>
            setAssetPickerTarget(
              null
            )
          }
          onSelect={
            handleAssetSelected
          }
        />
      )}

      {previewOpen && (
        <PreviewOverlay
          config={
            config
          }
          initialDevice={
            device
          }
          onClose={() =>
            setPreviewOpen(
              false
            )
          }
        />
      )}

      {shortcutsOpen && (
        <KeyboardShortcutsModal
          onClose={() =>
            setShortcutsOpen(
              false
            )
          }
        />
      )}
    </>
  );
};
