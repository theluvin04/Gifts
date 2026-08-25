import React, {
  useMemo,
} from 'react';

import type {
  SceneCanvasDefinition,
  SceneElement,
  SceneElementAction,
} from '../../../engine';

interface Props {
  elements: SceneElement[];
  scenes: SceneCanvasDefinition[];
  currentSceneId: string;
  onActionChange: (
    action: SceneElementAction | null
  ) => void;
  onUngroup: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const serializeAction = (
  action?: SceneElementAction
) =>
  action
    ? JSON.stringify(action)
    : '';

export const GroupInspector:
React.FC<Props> = ({
  elements,
  scenes,
  currentSceneId,
  onActionChange,
  onUngroup,
  onDuplicate,
  onDelete,
}) => {
  const firstAction =
    elements[0]
      ?.actions?.[0];

  const sameAction =
    elements.length > 0 &&
    elements.every(
      (element) =>
        serializeAction(
          element.actions?.[0]
        ) ===
        serializeAction(
          firstAction
        )
    );

  const action =
    sameAction
      ? firstAction
      : undefined;

  const actionType =
    sameAction
      ? action?.type ||
        'none'
      : 'mixed';

  const nextScene =
    useMemo(
      () => {
        const index =
          scenes.findIndex(
            (scene) =>
              scene.id ===
              currentSceneId
          );

        if (
          index < 0 ||
          index >=
            scenes.length - 1
        ) {
          return null;
        }

        return scenes[
          index + 1
        ];
      },
      [
        scenes,
        currentSceneId,
      ]
    );

  const otherScenes =
    scenes.filter(
      (scene) =>
        scene.id !==
        currentSceneId
    );

  const setActionType = (
    type: string
  ) => {
    if (
      type === 'none'
    ) {
      onActionChange(
        null
      );
      return;
    }

    if (
      type ===
      'go-to-scene'
    ) {
      const target =
        nextScene ||
        otherScenes[0] ||
        scenes[0];

      if (!target) {
        return;
      }

      onActionChange({
        type:
          'go-to-scene',
        sceneId:
          target.id,
      });
      return;
    }

    if (
      type ===
      'back-scene'
    ) {
      onActionChange({
        type:
          'back-scene',
      });
      return;
    }

    if (
      type ===
      'reset-scene'
    ) {
      onActionChange({
        type:
          'reset-scene',
      });
      return;
    }

    if (
      type ===
      'open-url'
    ) {
      onActionChange({
        type:
          'open-url',
        url: 'https://',
        newTab: true,
      });
    }
  };

  return (
    <aside className="max-h-[calc(100svh-330px)] min-w-0 overflow-y-auto rounded-[11px] border border-black/8 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-black text-black/75">
            Nhóm
          </p>
          <p className="mt-1 text-[9px] leading-4 text-black/35">
            {elements.length} thành phần · được xử lý như một khối.
          </p>
        </div>

        <span className="rounded-full bg-[#fff0f4] px-2 py-1 text-[8px] font-black text-[#b83e57]">
          GROUP
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onUngroup}
          className="rounded-[9px] border border-black/8 bg-[#faf9f8] px-2 py-2 text-[8px] font-black text-black/50"
        >
          Bỏ nhóm
        </button>

        <button
          type="button"
          onClick={onDuplicate}
          className="rounded-[9px] border border-black/8 bg-[#faf9f8] px-2 py-2 text-[8px] font-black text-black/50"
        >
          Nhân bản
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="rounded-[9px] border border-red-100 bg-red-50 px-2 py-2 text-[8px] font-black text-red-500"
        >
          Xóa
        </button>
      </div>

      <div className="mt-4 border-t border-black/6 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-black text-black/55">
              Khi bấm vào nhóm
            </p>
            <p className="mt-1 text-[8px] leading-4 text-black/30">
              Action này được gắn đồng thời cho toàn bộ thành phần trong group.
            </p>
          </div>
        </div>

        {nextScene && (
          <button
            type="button"
            onClick={() =>
              onActionChange({
                type:
                  'go-to-scene',
                sceneId:
                  nextScene.id,
              })
            }
            className="mt-3 w-full rounded-[9px] bg-[#191919] px-3 py-2.5 text-[9px] font-black text-white"
          >
            → Bấm để sang trang tiếp theo
          </button>
        )}

        <label className="mt-3 block">
          <span className="mb-1 block text-[8px] font-black text-black/35">
            Hành động
          </span>

          <select
            value={actionType}
            onChange={(event) =>
              setActionType(
                event.target.value
              )
            }
            className="w-full rounded-[9px] border border-black/10 bg-[#faf9f8] px-2.5 py-2.5 text-[9px] font-bold text-black/60 outline-none"
          >
            {actionType ===
              'mixed' && (
              <option value="mixed">
                Nhiều hành động khác nhau
              </option>
            )}
            <option value="none">
              Không làm gì
            </option>
            <option value="go-to-scene">
              Chuyển sang trang
            </option>
            <option value="back-scene">
              Quay lại trang trước
            </option>
            <option value="reset-scene">
              Quay về trang đầu
            </option>
            <option value="open-url">
              Mở đường dẫn
            </option>
          </select>
        </label>

        {action?.type ===
          'go-to-scene' && (
          <label className="mt-3 block">
            <span className="mb-1 block text-[8px] font-black text-black/35">
              Trang đích
            </span>

            <select
              value={
                action.sceneId
              }
              onChange={(event) =>
                onActionChange({
                  ...action,
                  sceneId:
                    event.target.value,
                })
              }
              className="w-full rounded-[9px] border border-black/10 bg-[#faf9f8] px-2.5 py-2.5 text-[9px] font-bold text-black/60 outline-none"
            >
              {scenes.map(
                (scene) => (
                  <option
                    key={scene.id}
                    value={scene.id}
                  >
                    {scene.title ||
                      scene.id}
                  </option>
                )
              )}
            </select>
          </label>
        )}

        {action?.type ===
          'open-url' && (
          <label className="mt-3 block">
            <span className="mb-1 block text-[8px] font-black text-black/35">
              Đường dẫn
            </span>

            <input
              value={action.url}
              onChange={(event) =>
                onActionChange({
                  ...action,
                  url:
                    event.target.value,
                })
              }
              className="w-full rounded-[9px] border border-black/10 bg-[#faf9f8] px-2.5 py-2.5 text-[9px] text-black/60 outline-none"
              placeholder="https://..."
            />
          </label>
        )}
      </div>

      <div className="mt-4 rounded-[10px] bg-[#faf7f6] px-3 py-2.5 text-[8px] leading-4 text-black/35">
        Khi chuyển sang điện thoại, group chỉ được scale và di chuyển nguyên khối; tỉ lệ và khoảng cách giữa các thành phần được giữ nguyên.
      </div>
    </aside>
  );
};
