import React, {
  useState,
} from 'react';

import type {
  TemplateConfig,
} from '../../services/templateService';

import {
  DEFAULT_LOVE_VISUAL_EDITOR_CONFIG,
} from '../../templates/visualEditor';

import {
  AdminVisualTemplateEditor,
} from './AdminVisualTemplateEditor';

import {
  PreviewLinkOverlay,
} from './PreviewLinkOverlay';

interface Props {
  templates: TemplateConfig[];
  template: TemplateConfig;
  dirty: boolean;
  saved: boolean;
  saving: boolean;
  catalogBusy: boolean;
  onSelectTemplate: (
    templateId: string
  ) => void;
  onChange: (
    template: TemplateConfig
  ) => void;
  onSave: () => void;
  onDiscardChanges: () => void;
}

export const AdminDecorateTab:
React.FC<Props> = ({
  templates,
  template,
  dirty,
  saved,
  saving,
  catalogBusy,
  onSelectTemplate,
  onChange,
  onSave,
  onDiscardChanges,
}) => {
  const [previewLinkOpen, setPreviewLinkOpen] =
    useState(false);

  return (
    <div className="space-y-3">
      <section className="sticky top-[68px] z-[85] rounded-[15px] border border-black/8 bg-white/96 p-3 shadow-[0_10px_35px_rgba(40,25,28,0.06)] backdrop-blur-xl lg:top-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="min-w-0 flex-1">
            <p className="mb-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-black/30">
              Mẫu đang trang trí
            </p>
            <select
              value={template.id}
              disabled={catalogBusy || saving}
              onChange={(event) =>
                onSelectTemplate(
                  event.target.value
                )
              }
              className="min-h-11 w-full rounded-[10px] border border-black/10 bg-[#faf9f8] px-3 text-sm font-black outline-none focus:border-[#cf5068] xl:max-w-[560px]"
            >
              {templates.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name} · {item.id}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {dirty && (
              <span className="rounded-full bg-amber-50 px-3 py-2 text-[9px] font-black text-amber-700">
                Chưa lưu
              </span>
            )}

            <button
              type="button"
              onClick={() =>
                setPreviewLinkOpen(true)
              }
              className="min-h-10 rounded-[10px] border border-[#cf5068]/20 bg-[#fff6f8] px-3.5 text-[10px] font-black text-[#a73551] hover:bg-[#f8e8ed]"
            >
              Link test cố định
            </button>

            {dirty && (
              <button
                type="button"
                disabled={saving}
                onClick={onDiscardChanges}
                className="min-h-10 rounded-[10px] border border-black/10 bg-white px-3.5 text-[10px] font-bold text-black/45 disabled:opacity-40"
              >
                Bỏ thay đổi
              </button>
            )}

            <button
              type="button"
              disabled={saving || !dirty}
              onClick={onSave}
              className={[
                'min-h-10 min-w-[120px] rounded-[10px] px-4 text-[10px] font-black',
                dirty
                  ? 'bg-[#191919] text-white hover:bg-[#b83e57]'
                  : saved
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-[#efedec] text-black/30',
              ].join(' ')}
            >
              {saving
                ? 'Đang lưu...'
                : dirty
                  ? 'Lưu thiết kế'
                  : saved
                    ? 'Đã lưu ✓'
                    : 'Đã lưu'}
            </button>
          </div>
        </div>
      </section>

      <AdminVisualTemplateEditor
        key={template.id}
        config={
          template.visualEditor ||
          DEFAULT_LOVE_VISUAL_EDITOR_CONFIG
        }
        onChange={(visualEditor) =>
          onChange({
            ...template,
            visualEditor,
          })
        }
        dirty={dirty}
        saving={saving}
        onSave={onSave}
      />

      {previewLinkOpen && (
        <PreviewLinkOverlay
          template={template}
          onClose={() =>
            setPreviewLinkOpen(false)
          }
        />
      )}
    </div>
  );
};
