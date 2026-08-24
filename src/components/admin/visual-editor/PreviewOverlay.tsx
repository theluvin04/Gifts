import React from 'react';

import {
  VisualSceneExperience,
} from '../../../engine';

import type {
  TemplateVisualEditorConfig,
} from '../../../templates/visualEditor';

interface Props {
  config:
    TemplateVisualEditorConfig;

  onClose:
    () => void;
}

export const PreviewOverlay:
React.FC<Props> = ({
  config,
  onClose,
}) => (
  <div className="fixed inset-0 z-[100] overflow-auto bg-black/75 p-3 sm:p-6">
    <div className="mx-auto max-w-[1280px]">
      <div className="mb-3 flex items-center justify-between rounded-[12px] bg-white px-4 py-3">
        <div>
          <p className="text-xs font-black">
            Preview Visual Engine
          </p>

          <p className="mt-0.5 text-[9px] text-black/35">
            Click button có action để test chuyển scene.
          </p>
        </div>

        <button
          type="button"
          onClick={
            onClose
          }
          className="rounded-[9px] bg-black px-3 py-2 text-[10px] font-bold text-white"
        >
          Đóng
        </button>
      </div>

      <div className="overflow-hidden rounded-[16px] bg-white">
        <VisualSceneExperience
          scenes={
            config.scenes
          }
          initialSceneId={
            config.initialSceneId
          }
        />
      </div>
    </div>
  </div>
);
