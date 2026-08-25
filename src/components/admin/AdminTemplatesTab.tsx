import React, {
  useMemo,
  useState,
} from 'react';

import type {
  AdminTemplateCreateInput,
} from '../../services/adminService';

import {
  TemplateConfig,
  getEffectiveTemplatePrice,
  getTemplateDiscountPercent,
} from '../../services/templateService';

import {
  DEFAULT_LOVE_VISUAL_EDITOR_CONFIG,
} from '../../templates/visualEditor';

import {
  formatVnd,
} from './adminUi';

import {
  AdminTemplateAssetEditor,
} from './AdminTemplateAssetEditor';

import {
  AdminTemplateDesignEditor,
} from './AdminTemplateDesignEditor';

import {
  AdminVisualTemplateEditor,
} from './AdminVisualTemplateEditor';

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
  onCreateTemplate: (
    input: AdminTemplateCreateInput
  ) => Promise<TemplateConfig>;
  onDeleteTemplate: (
    templateId: string
  ) => Promise<void>;
  onChange: (
    template: TemplateConfig
  ) => void;
  onSave: () => void;
  onDiscardChanges: () => void;
}

type TemplateSection =
  | 'selling'
  | 'visual'
  | 'design'
  | 'assets';

type CreateMode =
  | 'blank'
  | 'duplicate';

const SECTIONS: Array<{
  key: TemplateSection;
  label: string;
  description: string;
}> = [
  {
    key: 'selling',
    label: 'Thông tin',
    description: 'Tên, giá và trạng thái bán',
  },
  {
    key: 'visual',
    label: 'Thiết kế trang',
    description: 'Bố cục kéo thả và hiệu ứng',
  },
  {
    key: 'design',
    label: 'Style',
    description: 'Màu sắc và style chung',
  },
  {
    key: 'assets',
    label: 'Tài nguyên',
    description: 'Ảnh và asset của template',
  },
];

const slugify = (
  value: string
) => {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .replace(/đ/g, 'd')
    .replace(
      /[^a-z0-9]+/g,
      '-'
    )
    .replace(
      /^-+|-+$/g,
      ''
    )
    .slice(0, 60);
};

export const AdminTemplatesTab:
React.FC<Props> = ({
  templates,
  template,
  dirty,
  saved,
  saving,
  catalogBusy,
  onSelectTemplate,
  onCreateTemplate,
  onDeleteTemplate,
  onChange,
  onSave,
  onDiscardChanges,
}) => {
  const [
    section,
    setSection,
  ] =
    useState<TemplateSection>(
      'selling'
    );

  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);

  const [
    createMode,
    setCreateMode,
  ] =
    useState<CreateMode>(
      'blank'
    );

  const [
    createName,
    setCreateName,
  ] = useState('');

  const [
    createId,
    setCreateId,
  ] = useState('');

  const [
    createError,
    setCreateError,
  ] = useState('');

  const [
    creating,
    setCreating,
  ] = useState(false);

  const [
    editorOpen,
    setEditorOpen,
  ] = useState(false);

  const sortedTemplates =
    useMemo(
      () =>
        [...templates].sort(
          (left, right) => {
            if (
              left.id === 'love-01'
            ) {
              return -1;
            }

            if (
              right.id === 'love-01'
            ) {
              return 1;
            }

            return left.name.localeCompare(
              right.name,
              'vi'
            );
          }
        ),
      [templates]
    );

  const discount =
    getTemplateDiscountPercent(
      template
    );

  const openCreate = (
    mode: CreateMode
  ) => {
    setCreateMode(mode);
    setCreateError('');

    if (
      mode === 'duplicate'
    ) {
      const nextName =
        `${template.name} Copy`;

      setCreateName(nextName);
      setCreateId(
        slugify(
          `${template.id}-copy`
        )
      );
    } else {
      setCreateName('');
      setCreateId('');
    }

    setCreateOpen(true);
  };

  const handleCreate =
    async () => {
      const name =
        createName.trim();

      const id =
        slugify(
          createId || name
        );

      if (!name) {
        setCreateError(
          'Nhập tên template.'
        );
        return;
      }

      if (!id) {
        setCreateError(
          'ID template chưa hợp lệ.'
        );
        return;
      }

      if (
        sortedTemplates.some(
          (item) =>
            item.id === id
        )
      ) {
        setCreateError(
          `ID "${id}" đã tồn tại.`
        );
        return;
      }

      setCreating(true);
      setCreateError('');

      try {
        await onCreateTemplate({
          id,
          name,
          mode: createMode,
          source:
            createMode ===
            'duplicate'
              ? template
              : undefined,
        });

        setCreateOpen(false);
        setSection(
          createMode === 'blank'
            ? 'visual'
            : section
        );
        setEditorOpen(true);
      } catch (
        error: any
      ) {
        setCreateError(
          error?.message ||
          'Không tạo được template.'
        );
      } finally {
        setCreating(false);
      }
    };

  const handleDelete =
    async () => {
      if (
        template.id === 'love-01'
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `Xóa template "${template.name}"?\n\nBố cục đã lưu trong Firestore cũng sẽ bị xóa.`
        );

      if (!confirmed) {
        return;
      }

      await onDeleteTemplate(
        template.id
      );
      setEditorOpen(false);
    };

  const openTemplateEditor = (
    templateId: string
  ) => {
    onSelectTemplate(templateId);
    setSection('selling');
    setEditorOpen(true);
  };

  const backToTemplateList = () => {
    if (dirty) {
      const discard =
        window.confirm(
          'Template đang có thay đổi chưa lưu. Bỏ các thay đổi này và quay lại danh sách?'
        );

      if (!discard) {
        return;
      }

      onDiscardChanges();
    }

    setEditorOpen(false);
  };

  if (!editorOpen) {
    return (
      <div className="space-y-4">
        <section className="rounded-[20px] border border-black/8 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#b83e57]">
                Templates
              </p>
              <h2 className="mt-1.5 text-xl font-black tracking-[-0.035em] sm:text-2xl">
                Chọn template để chỉnh sửa
              </h2>
              <p className="mt-2 max-w-[560px] text-xs leading-5 text-black/42">
                Chọn một template có sẵn hoặc tạo template mới. Editor chỉ mở sau khi bạn chọn, tránh chỉnh nhầm sản phẩm.
              </p>
            </div>

            <button
              type="button"
              disabled={catalogBusy}
              onClick={() =>
                openCreate('blank')
              }
              className="shrink-0 rounded-[11px] bg-[#191919] px-4 py-3 text-xs font-black text-white transition hover:bg-[#b83e57] disabled:opacity-40"
            >
              + Tạo template mới
            </button>
          </div>
        </section>

        <section className="rounded-[20px] border border-black/8 bg-white p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-xs font-black text-black/70">
              Template hiện có
            </p>
            <span className="text-[10px] font-semibold text-black/30">
              {sortedTemplates.length} template
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {sortedTemplates.map(
              (item) => {
                const itemDiscount =
                  getTemplateDiscountPercent(
                    item
                  );

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={catalogBusy}
                    onClick={() =>
                      openTemplateEditor(
                        item.id
                      )
                    }
                    className="group rounded-[16px] border border-black/8 bg-[#fcfbfa] p-4 text-left transition hover:border-[#cf5068]/30 hover:bg-[#fff8fa] hover:shadow-[0_10px_30px_rgba(80,30,40,0.06)] disabled:opacity-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-black/80">
                          {item.name}
                        </p>
                        <p className="mt-1 truncate font-mono text-[9px] text-black/30">
                          {item.id}
                        </p>
                      </div>

                      <span className={[
                        'shrink-0 rounded-full px-2 py-1 text-[8px] font-black',
                        item.visible
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-black/[0.04] text-black/35',
                      ].join(' ')}>
                        {item.visible
                          ? 'Đang bán'
                          : 'Đang ẩn'}
                      </span>
                    </div>

                    <div className="mt-5 flex items-end justify-between gap-3 border-t border-black/6 pt-3">
                      <div>
                        <p className="text-[9px] font-semibold text-black/30">
                          Giá hiện tại
                        </p>
                        <p className="mt-1 text-sm font-black text-black/70">
                          {formatVnd(
                            getEffectiveTemplatePrice(
                              item
                            )
                          )}
                        </p>
                        {itemDiscount > 0 && (
                          <p className="mt-0.5 text-[9px] font-bold text-[#b83e57]">
                            Giảm {itemDiscount}%
                          </p>
                        )}
                      </div>

                      <span className="rounded-[9px] bg-white px-3 py-2 text-[10px] font-black text-[#b83e57] shadow-[inset_0_0_0_1px_rgba(184,62,87,0.12)] transition group-hover:bg-[#b83e57] group-hover:text-white">
                        Chỉnh sửa →
                      </span>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </section>

        {createOpen && (
          <CreateTemplateModal
            mode={createMode}
            name={createName}
            id={createId}
            error={createError}
            creating={creating}
            onNameChange={(value) => {
              setCreateName(value);
              setCreateId(
                slugify(value)
              );
            }}
            onIdChange={setCreateId}
            onClose={() =>
              setCreateOpen(false)
            }
            onCreate={() =>
              void handleCreate()
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[18px] border border-black/8 bg-white p-4 sm:p-5">
        <button
          type="button"
          disabled={saving || catalogBusy}
          onClick={backToTemplateList}
          className="mb-4 text-[10px] font-black text-black/38 transition hover:text-[#b83e57] disabled:opacity-40"
        >
          ← Tất cả template
        </button>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/35">
                Template đang chỉnh
              </label>
              <span className="text-[10px] font-semibold text-black/30">
                {sortedTemplates.length} template
              </span>
            </div>

            <select
              value={
                template.id
              }
              disabled={
                catalogBusy ||
                saving
              }
              onChange={(
                event
              ) =>
                onSelectTemplate(
                  event.target.value
                )
              }
              className="w-full rounded-[11px] border border-black/10 bg-[#faf9f8] px-3.5 py-3 text-sm font-bold outline-none focus:border-[#cf5068] disabled:opacity-50 xl:max-w-[520px]"
            >
              {sortedTemplates.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                )
              )}
            </select>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-black/35">
              <span className="font-mono">
                {template.id}
              </span>
              <span>•</span>
              <span className="font-bold text-black/55">
                {formatVnd(
                  getEffectiveTemplatePrice(
                    template
                  )
                )}
              </span>
              {discount > 0 && (
                <>
                  <span>•</span>
                  <span className="font-bold text-[#b83e57]">
                    Giảm {discount}%
                  </span>
                </>
              )}
              <span>•</span>
              <span>
                {template.visible
                  ? 'Đang hiển thị'
                  : 'Đang ẩn'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                window.open(
                  `/products/${template.id}`,
                  '_blank',
                  'noopener,noreferrer'
                )
              }
              className="rounded-[10px] border border-[#cf5068]/20 bg-[#fff7f9] px-3.5 py-2.5 text-[10px] font-black text-[#a73551]"
            >
              Xem mẫu ↗
            </button>

            <button
              type="button"
              disabled={catalogBusy}
              onClick={() =>
                openCreate('blank')
              }
              className="rounded-[10px] border border-black/10 bg-white px-3.5 py-2.5 text-[10px] font-bold text-black/55 disabled:opacity-40"
            >
              + Template mới
            </button>

            <button
              type="button"
              disabled={catalogBusy}
              onClick={() =>
                openCreate(
                  'duplicate'
                )
              }
              className="rounded-[10px] border border-black/10 bg-white px-3.5 py-2.5 text-[10px] font-bold text-black/55 disabled:opacity-40"
            >
              Nhân bản
            </button>

            {template.id !==
              'love-01' && (
              <button
                type="button"
                disabled={catalogBusy}
                onClick={() =>
                  void handleDelete()
                }
                className="rounded-[10px] border border-red-100 bg-white px-3 py-2.5 text-[10px] font-bold text-red-500 disabled:opacity-40"
              >
                Xóa
              </button>
            )}

            <button
              type="button"
              disabled={
                saving ||
                !dirty
              }
              onClick={onSave}
              className={[
                'min-w-[105px] rounded-[10px] px-4 py-2.5 text-[10px] font-black transition disabled:cursor-default',
                dirty
                  ? 'bg-[#191919] text-white hover:bg-[#b83e57]'
                  : saved
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-[#f1efee] text-black/30',
              ].join(' ')}
            >
              {saving
                ? 'Đang lưu...'
                : dirty
                  ? 'Lưu thay đổi'
                  : saved
                    ? 'Đã lưu ✓'
                    : 'Đã lưu'}
            </button>
          </div>
        </div>

        {dirty && (
          <p className="mt-3 text-[10px] font-bold text-amber-600">
            Có thay đổi chưa lưu.
          </p>
        )}
      </section>

      <section className="rounded-[18px] border border-black/8 bg-white p-2">
        <div className="grid gap-1 sm:grid-cols-4">
          {SECTIONS.map(
            (item) => (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  setSection(item.key)
                }
                className={[
                  'rounded-[12px] px-3 py-3 text-left transition',
                  section === item.key
                    ? 'bg-[#f7ecef] text-[#a93650]'
                    : 'text-black/45 hover:bg-black/[0.025] hover:text-black/70',
                ].join(' ')}
              >
                <p className="text-[11px] font-black">
                  {item.label}
                </p>
                <p className="mt-1 hidden text-[9px] leading-4 opacity-65 lg:block">
                  {item.description}
                </p>
              </button>
            )
          )}
        </div>
      </section>

      {section === 'selling' && (
        <SellingEditor
          template={template}
          onChange={onChange}
        />
      )}

      {section === 'visual' && (
        <AdminVisualTemplateEditor
          key={template.id}
          config={
            template.visualEditor ||
            DEFAULT_LOVE_VISUAL_EDITOR_CONFIG
          }
          onChange={(
            visualEditor
          ) =>
            onChange({
              ...template,
              visualEditor,
            })
          }
        />
      )}

      {section === 'design' && (
        <section className="rounded-[18px] border border-black/8 bg-white p-4 sm:p-5">
          <AdminTemplateDesignEditor
            design={template.design}
            onChange={(design) =>
              onChange({
                ...template,
                design,
              })
            }
          />
        </section>
      )}

      {section === 'assets' && (
        <section className="rounded-[18px] border border-black/8 bg-white p-4 sm:p-5">
          <AdminTemplateAssetEditor
            visualEditor={
              template.visualEditor ||
              DEFAULT_LOVE_VISUAL_EDITOR_CONFIG
            }
            onChange={(visualEditor) =>
              onChange({
                ...template,
                visualEditor,
              })
            }
          />
        </section>
      )}

      {createOpen && (
        <CreateTemplateModal
          mode={createMode}
          name={createName}
          id={createId}
          error={createError}
          creating={creating}
          onNameChange={(value) => {
            setCreateName(value);

            if (
              createMode === 'blank'
            ) {
              setCreateId(
                slugify(value)
              );
            }
          }}
          onIdChange={setCreateId}
          onClose={() =>
            setCreateOpen(false)
          }
          onCreate={() =>
            void handleCreate()
          }
        />
      )}
    </div>
  );
};

const SellingEditor:
React.FC<{
  template: TemplateConfig;
  onChange: (
    template: TemplateConfig
  ) => void;
}> = ({
  template,
  onChange,
}) => (
  <section className="rounded-[18px] border border-black/8 bg-white p-5 sm:p-6">
    <div className="mb-6">
      <h2 className="text-sm font-black">
        Thông tin bán hàng
      </h2>
      <p className="mt-1 text-[11px] leading-5 text-black/38">
        Chỉ giữ các trường cần dùng thường xuyên khi quản lý template.
      </p>
    </div>

    <div className="grid gap-5 lg:grid-cols-2">
      <Field
        label="Tên template"
      >
        <input
          value={template.name}
          onChange={(event) =>
            onChange({
              ...template,
              name: event.target.value,
            })
          }
          className={inputClass}
        />
      </Field>

      <Field
        label="Trạng thái"
      >
        <select
          value={template.status}
          onChange={(event) =>
            onChange({
              ...template,
              status:
                event.target.value as
                  TemplateConfig['status'],
            })
          }
          className={inputClass}
        >
          <option value="available">
            Đang bán
          </option>
          <option value="coming_soon">
            Sắp ra mắt
          </option>
          <option value="paused">
            Tạm dừng
          </option>
        </select>
      </Field>

      <Field
        label="Giá gốc"
        hint="VND"
      >
        <input
          type="number"
          min="0"
          value={template.basePrice}
          onChange={(event) =>
            onChange({
              ...template,
              basePrice:
                Number(
                  event.target.value
                ) || 0,
            })
          }
          className={inputClass}
        />
      </Field>

      <Field
        label="Giá khuyến mãi"
        hint="Chỉ dùng khi bật sale"
      >
        <input
          type="number"
          min="0"
          value={template.salePrice}
          disabled={!template.saleEnabled}
          onChange={(event) =>
            onChange({
              ...template,
              salePrice:
                Number(
                  event.target.value
                ) || 0,
            })
          }
          className={`${inputClass} disabled:opacity-45`}
        />
      </Field>

      <Field
        label="Nhãn khuyến mãi"
      >
        <input
          value={template.promotionLabel}
          onChange={(event) =>
            onChange({
              ...template,
              promotionLabel:
                event.target.value,
            })
          }
          placeholder="Ví dụ: Launch offer"
          className={inputClass}
        />
      </Field>

      <div className="space-y-3 rounded-[14px] bg-[#faf9f8] p-4">
        <ToggleRow
          label="Bật giá khuyến mãi"
          description="Storefront sẽ dùng salePrice nếu hợp lệ."
          checked={template.saleEnabled}
          onChange={(checked) =>
            onChange({
              ...template,
              saleEnabled: checked,
            })
          }
        />

        <ToggleRow
          label="Hiển thị trên storefront"
          description="Tắt để ẩn template khỏi khu vực bán hàng."
          checked={template.visible}
          onChange={(checked) =>
            onChange({
              ...template,
              visible: checked,
            })
          }
        />
      </div>
    </div>
  </section>
);

const inputClass =
  'w-full rounded-[11px] border border-black/10 bg-[#faf9f8] px-3.5 py-3 text-sm font-semibold outline-none focus:border-[#cf5068]';

const Field:
React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
}> = ({
  label,
  hint,
  children,
}) => (
  <label className="block">
    <div className="mb-2 flex items-center justify-between gap-3">
      <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-black/38">
        {label}
      </span>
      {hint && (
        <span className="text-[9px] text-black/28">
          {hint}
        </span>
      )}
    </div>
    {children}
  </label>
);

const ToggleRow:
React.FC<{
  label: string;
  description: string;
  checked: boolean;
  onChange: (
    checked: boolean
  ) => void;
}> = ({
  label,
  description,
  checked,
  onChange,
}) => (
  <label className="flex cursor-pointer items-start justify-between gap-4 rounded-[11px] bg-white p-3">
    <span>
      <span className="block text-xs font-bold text-black/70">
        {label}
      </span>
      <span className="mt-1 block text-[10px] leading-4 text-black/35">
        {description}
      </span>
    </span>

    <input
      type="checkbox"
      checked={checked}
      onChange={(event) =>
        onChange(
          event.target.checked
        )
      }
      className="mt-0.5 h-4 w-4 shrink-0 accent-[#b83e57]"
    />
  </label>
);

const CreateTemplateModal:
React.FC<{
  mode: CreateMode;
  name: string;
  id: string;
  error: string;
  creating: boolean;
  onNameChange: (
    value: string
  ) => void;
  onIdChange: (
    value: string
  ) => void;
  onClose: () => void;
  onCreate: () => void;
}> = ({
  mode,
  name,
  id,
  error,
  creating,
  onNameChange,
  onIdChange,
  onClose,
  onCreate,
}) => (
  <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-[20px] bg-white p-5 shadow-2xl sm:p-6">
      <h2 className="text-lg font-black tracking-[-0.03em]">
        {mode === 'duplicate'
          ? 'Nhân bản template'
          : 'Template mới'}
      </h2>

      <p className="mt-2 text-xs leading-5 text-black/40">
        {mode === 'duplicate'
          ? 'Sao chép toàn bộ cấu hình hiện tại sang một ID mới.'
          : 'Tạo template trống để bắt đầu thiết kế.'}
      </p>

      <div className="mt-5 space-y-4">
        <Field label="Tên template">
          <input
            autoFocus
            value={name}
            onChange={(event) =>
              onNameChange(
                event.target.value
              )
            }
            className={inputClass}
          />
        </Field>

        <Field
          label="ID"
          hint="chữ thường, số, dấu -"
        >
          <input
            value={id}
            onChange={(event) =>
              onIdChange(
                slugify(
                  event.target.value
                )
              )
            }
            className={`${inputClass} font-mono`}
          />
        </Field>
      </div>

      {error && (
        <p className="mt-4 rounded-[10px] bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          disabled={creating}
          onClick={onClose}
          className="rounded-[10px] border border-black/10 px-4 py-2.5 text-xs font-bold text-black/45 disabled:opacity-40"
        >
          Hủy
        </button>

        <button
          type="button"
          disabled={creating}
          onClick={onCreate}
          className="rounded-[10px] bg-[#191919] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
        >
          {creating
            ? 'Đang tạo...'
            : 'Tạo template'}
        </button>
      </div>
    </div>
  </div>
);
