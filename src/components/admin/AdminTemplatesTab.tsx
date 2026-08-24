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
  formatVnd,
} from './adminUi';

import {
  AdminTemplateDesignEditor,
} from './AdminTemplateDesignEditor';

import {
  AdminTemplateAssetEditor,
} from './AdminTemplateAssetEditor';

import {
  AdminVisualTemplateEditor,
} from './AdminVisualTemplateEditor';

import {
  DEFAULT_LOVE_VISUAL_EDITOR_CONFIG,
} from '../../templates/visualEditor';

interface Props {
  templates:
    TemplateConfig[];

  template:
    TemplateConfig;

  dirty: boolean;

  saved: boolean;

  saving: boolean;

  catalogBusy:
    boolean;

  onSelectTemplate: (
    templateId:
      string
  ) => void;

  onCreateTemplate: (
    input:
      AdminTemplateCreateInput
  ) =>
    Promise<
      TemplateConfig
    >;

  onDeleteTemplate: (
    templateId:
      string
  ) =>
    Promise<void>;

  onChange: (
    template:
      TemplateConfig
  ) => void;

  onSave:
    () => void;
}

type TemplateSection =
  | 'selling'
  | 'visual'
  | 'design'
  | 'assets';

type CreateMode =
  | 'blank'
  | 'duplicate';

const slugify = (
  value: string
) => {
  return value
    .trim()
    .toLowerCase()
    .normalize(
      'NFD'
    )
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .replace(
      /đ/g,
      'd'
    )
    .replace(
      /[^a-z0-9]+/g,
      '-'
    )
    .replace(
      /^-+|-+$/g,
      ''
    )
    .slice(
      0,
      60
    );
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
}) => {
  const [
    section,
    setSection,
  ] =
    useState<
      TemplateSection
    >(
      'selling'
    );

  const [
    createOpen,
    setCreateOpen,
  ] =
    useState(false);

  const [
    createMode,
    setCreateMode,
  ] =
    useState<
      CreateMode
    >(
      'blank'
    );

  const [
    createName,
    setCreateName,
  ] =
    useState('');

  const [
    createId,
    setCreateId,
  ] =
    useState('');

  const [
    createError,
    setCreateError,
  ] =
    useState('');

  const [
    creating,
    setCreating,
  ] =
    useState(false);

  const discount =
    getTemplateDiscountPercent(
      template
    );

  const sortedTemplates =
    useMemo(
      () =>
        [
          ...templates,
        ].sort(
          (
            left,
            right
          ) => {
            if (
              left.id ===
              'love-01'
            ) {
              return -1;
            }

            if (
              right.id ===
              'love-01'
            ) {
              return 1;
            }

            return left.name.localeCompare(
              right.name,
              'vi'
            );
          }
        ),
      [
        templates,
      ]
    );

  const openCreate = (
    mode:
      CreateMode
  ) => {
    setCreateMode(
      mode
    );

    setCreateError(
      ''
    );

    if (
      mode ===
      'duplicate'
    ) {
      const nextName =
        `${template.name} Copy`;

      setCreateName(
        nextName
      );

      setCreateId(
        slugify(
          `${template.id}-copy`
        )
      );
    } else {
      setCreateName(
        ''
      );

      setCreateId(
        ''
      );
    }

    setCreateOpen(
      true
    );
  };

  const handleCreate =
    async () => {
      const name =
        createName
          .trim();

      const id =
        slugify(
          createId ||
          name
        );

      if (!name) {
        setCreateError(
          'Nhập tên sản phẩm.'
        );
        return;
      }

      if (!id) {
        setCreateError(
          'ID sản phẩm chưa hợp lệ.'
        );
        return;
      }

      if (
        sortedTemplates.some(
          (item) =>
            item.id ===
            id
        )
      ) {
        setCreateError(
          `ID "${id}" đã tồn tại.`
        );
        return;
      }

      setCreating(
        true
      );

      setCreateError(
        ''
      );

      try {
        await onCreateTemplate({
          id,
          name,
          mode:
            createMode,
          source:
            createMode ===
              'duplicate'
              ? template
              : undefined,
        });

        setCreateOpen(
          false
        );

        setSection(
          createMode ===
            'blank'
            ? 'visual'
            : section
        );
      } catch (
        error: any
      ) {
        setCreateError(
          error?.message ||
          'Không tạo được sản phẩm.'
        );
      } finally {
        setCreating(
          false
        );
      }
    };

  const handleDelete =
    async () => {
      if (
        template.id ===
        'love-01'
      ) {
        window.alert(
          'love-01 là template mặc định nên không thể xóa.'
        );
        return;
      }

      const confirmed =
        window.confirm(
          `Xóa sản phẩm "${template.name}" (${template.id})?\n\nTemplate và bố cục trong Firestore sẽ bị xóa.`
        );

      if (!confirmed) {
        return;
      }

      try {
        await onDeleteTemplate(
          template.id
        );
      } catch (
        error: any
      ) {
        window.alert(
          error?.message ||
          'Không xóa được sản phẩm.'
        );
      }
    };

  const isVisual =
    section ===
    'visual';

  return (
    <div
      className={
        isVisual
          ? 'pb-4'
          : 'pb-24'
      }
    >
      <section className="rounded-[14px] border border-black/8 bg-white p-3 sm:p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[9px] font-black uppercase tracking-[0.12em] text-black/28">
                Sản phẩm
              </p>

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
                    event.target
                      .value
                  )
                }
                className="w-full min-w-0 rounded-[10px] border border-black/10 bg-[#faf9f8] px-3 py-2.5 text-xs font-black outline-none focus:border-[#cf5068] disabled:opacity-50 sm:max-w-[360px]"
              >
                {sortedTemplates.map(
                  (
                    item
                  ) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {item.name}
                      {' · '}
                      {item.id}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:self-end">
              <CompactButton
                label="+ Sản phẩm"
                primary
                disabled={
                  catalogBusy
                }
                onClick={() =>
                  openCreate(
                    'blank'
                  )
                }
              />

              <CompactButton
                label="Nhân bản"
                disabled={
                  catalogBusy
                }
                onClick={() =>
                  openCreate(
                    'duplicate'
                  )
                }
              />

              <CompactButton
                label="Xóa"
                danger
                disabled={
                  catalogBusy ||
                  template.id ===
                  'love-01'
                }
                onClick={() =>
                  void handleDelete()
                }
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2 border-t border-black/6 pt-3 xl:border-l xl:border-t-0 xl:pl-4 xl:pt-0">
            <StatusPill
              status={
                template.status
              }
            />

            <span className="text-[10px] font-black text-[#b83e57]">
              {formatVnd(
                getEffectiveTemplatePrice(
                  template
                )
              )}
            </span>

            {discount >
              0 && (
              <span className="text-[9px] font-bold text-black/30">
                −{discount}%
              </span>
            )}

            <span className="hidden max-w-[190px] truncate font-mono text-[9px] text-black/25 sm:inline">
              {template.id}
            </span>

            <button
              type="button"
              disabled={
                saving ||
                !dirty
              }
              onClick={
                onSave
              }
              className={[
                'ml-auto rounded-[10px] px-3.5 py-2.5 text-[10px] font-black transition',
                dirty
                  ? 'bg-[#191919] text-white hover:bg-[#b83e57]'
                  : saved
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-[#f4f1f1] text-black/30',
                'disabled:cursor-default',
              ].join(' ')}
            >
              {saving
                ? 'Đang lưu...'
                : dirty
                  ? 'Lưu'
                  : saved
                    ? 'Đã lưu ✓'
                    : 'Đã lưu'}
            </button>
          </div>
        </div>

        <div className="mt-3 flex gap-1 overflow-x-auto rounded-[10px] bg-[#f4f1f1] p-1">
          <SectionButton
            active={
              section ===
              'selling'
            }
            label="Thông tin"
            onClick={() =>
              setSection(
                'selling'
              )
            }
          />

          <SectionButton
            active={
              section ===
              'visual'
            }
            label="Bố cục"
            onClick={() =>
              setSection(
                'visual'
              )
            }
          />

          <SectionButton
            active={
              section ===
              'design'
            }
            label="Style"
            onClick={() =>
              setSection(
                'design'
              )
            }
          />

          <SectionButton
            active={
              section ===
              'assets'
            }
            label="Asset"
            onClick={() =>
              setSection(
                'assets'
              )
            }
          />
        </div>
      </section>

      {section ===
        'visual' ? (
        <div className="mt-3 min-w-0">
          <AdminVisualTemplateEditor
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
        </div>
      ) : (
        <section className="mt-3 rounded-[14px] border border-black/8 bg-white p-4 sm:p-5">
          {section ===
            'selling' && (
            <SellingEditor
              template={
                template
              }
              discount={
                discount
              }
              onChange={
                onChange
              }
            />
          )}

          {section ===
            'design' && (
            <AdminTemplateDesignEditor
              design={
                template.design
              }
              onChange={(
                design
              ) =>
                onChange({
                  ...template,
                  design,
                })
              }
            />
          )}

          {section ===
            'assets' && (
            <AdminTemplateAssetEditor
              assets={
                template.assets
              }
              onChange={(
                assets
              ) =>
                onChange({
                  ...template,
                  assets,
                })
              }
            />
          )}
        </section>
      )}

      {(dirty ||
        saving ||
        saved) && (
        <div className="sticky bottom-3 z-40 mx-auto mt-3 max-w-[620px]">
          <div className="flex items-center justify-between gap-3 rounded-[13px] border border-black/10 bg-white/95 px-3 py-2.5 shadow-[0_12px_38px_rgba(0,0,0,0.13)] backdrop-blur-xl">
            <div className="min-w-0">
              <p
                className={[
                  'truncate text-[10px] font-black',
                  dirty
                    ? 'text-[#b83e57]'
                    : 'text-emerald-700',
                ].join(' ')}
              >
                {saving
                  ? 'Đang lưu...'
                  : dirty
                    ? 'Có thay đổi chưa lưu'
                    : 'Đã lưu ✓'}
              </p>

              <p className="mt-0.5 hidden truncate text-[9px] text-black/30 sm:block">
                {template.name}
                {' · '}
                {template.id}
              </p>
            </div>

            <button
              type="button"
              disabled={
                saving ||
                !dirty
              }
              onClick={
                onSave
              }
              className={[
                'shrink-0 rounded-[9px] px-3.5 py-2 text-[10px] font-black',
                dirty
                  ? 'bg-[#191919] text-white'
                  : 'bg-emerald-50 text-emerald-700',
              ].join(' ')}
            >
              {saving
                ? 'Đang lưu'
                : dirty
                  ? 'Lưu thay đổi'
                  : 'Đã lưu'}
            </button>
          </div>
        </div>
      )}

      {createOpen && (
        <CreateProductModal
          mode={
            createMode
          }
          name={
            createName
          }
          id={
            createId
          }
          error={
            createError
          }
          creating={
            creating
          }
          sourceName={
            template.name
          }
          onNameChange={(
            value
          ) => {
            const previousAuto =
              slugify(
                createName
              );

            setCreateName(
              value
            );

            if (
              !createId ||
              createId ===
              previousAuto
            ) {
              setCreateId(
                slugify(
                  value
                )
              );
            }
          }}
          onIdChange={(
            value
          ) =>
            setCreateId(
              slugify(
                value
              )
            )
          }
          onClose={() =>
            !creating &&
            setCreateOpen(
              false
            )
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
  template:
    TemplateConfig;

  discount:
    number;

  onChange: (
    template:
      TemplateConfig
  ) => void;
}> = ({
  template,
  discount,
  onChange,
}) => (
  <div>
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h3 className="text-sm font-black">
          Thông tin & bán
        </h3>

        <p className="mt-1 text-[10px] leading-5 text-black/35">
          Tên, giá và trạng thái của sản phẩm.
        </p>
      </div>

      <span className="font-mono text-[9px] text-black/25">
        ID: {template.id}
      </span>
    </div>

    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <TextField
        label="Tên sản phẩm"
        value={
          template.name
        }
        onChange={(
          name
        ) =>
          onChange({
            ...template,
            name,
          })
        }
      />

      <SelectField
        label="Trạng thái"
        value={
          template.status
        }
        onChange={(
          status
        ) =>
          onChange({
            ...template,
            status:
              status as
                TemplateConfig[
                  'status'
                ],
          })
        }
      />

      <NumberField
        label="Giá gốc"
        value={
          template.basePrice
        }
        onChange={(
          basePrice
        ) =>
          onChange({
            ...template,
            basePrice,
          })
        }
      />

      <NumberField
        label="Giá sale"
        value={
          template.salePrice
        }
        onChange={(
          salePrice
        ) =>
          onChange({
            ...template,
            salePrice,
          })
        }
      />
    </div>

    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <ToggleRow
        title="Bật giá sale"
        description={
          discount >
          0
            ? `Đang giảm ${discount}%`
            : 'Chưa có giảm giá.'
        }
        checked={
          template.saleEnabled
        }
        onChange={(
          saleEnabled
        ) =>
          onChange({
            ...template,
            saleEnabled,
          })
        }
      />

      <ToggleRow
        title="Hiển thị"
        description="Ẩn sản phẩm nếu đang thiết kế."
        checked={
          template.visible
        }
        onChange={(
          visible
        ) =>
          onChange({
            ...template,
            visible,
          })
        }
      />
    </div>

    <div className="mt-3">
      <TextField
        label="Nhãn khuyến mãi"
        value={
          template
            .promotionLabel
        }
        placeholder="VD: Launch offer"
        onChange={(
          promotionLabel
        ) =>
          onChange({
            ...template,
            promotionLabel,
          })
        }
      />
    </div>
  </div>
);

const CreateProductModal:
React.FC<{
  mode:
    CreateMode;

  name: string;

  id: string;

  error: string;

  creating:
    boolean;

  sourceName:
    string;

  onNameChange: (
    value: string
  ) => void;

  onIdChange: (
    value: string
  ) => void;

  onClose:
    () => void;

  onCreate:
    () => void;
}> = ({
  mode,
  name,
  id,
  error,
  creating,
  sourceName,
  onNameChange,
  onIdChange,
  onClose,
  onCreate,
}) => (
  <div
    className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4"
    onMouseDown={(
      event
    ) => {
      if (
        event.target ===
        event.currentTarget
      ) {
        onClose();
      }
    }}
  >
    <section className="w-full max-w-[460px] rounded-[18px] bg-white p-5 shadow-[0_30px_90px_rgba(0,0,0,0.24)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-black">
            {mode ===
            'duplicate'
              ? 'Nhân bản sản phẩm'
              : 'Tạo sản phẩm mới'}
          </h3>

          <p className="mt-1 text-[10px] leading-5 text-black/35">
            {mode ===
            'duplicate'
              ? `Copy toàn bộ bố cục từ "${sourceName}".`
              : 'Tạo canvas trắng với một scene đầu tiên.'}
          </p>
        </div>

        <button
          type="button"
          disabled={
            creating
          }
          onClick={
            onClose
          }
          className="rounded-full bg-[#f4f1f1] px-2.5 py-1.5 text-[10px] font-black text-black/45"
        >
          ✕
        </button>
      </div>

      <div className="mt-5 space-y-3">
        <TextField
          label="Tên sản phẩm"
          value={
            name
          }
          placeholder="VD: Birthday Story 01"
          onChange={
            onNameChange
          }
        />

        <TextField
          label="ID / slug"
          value={
            id
          }
          placeholder="birthday-story-01"
          onChange={
            onIdChange
          }
        />

        <div className="rounded-[10px] bg-[#faf8f6] px-3 py-2.5 text-[9px] leading-4 text-black/35">
          ID dùng làm document Firestore và đường dẫn sản phẩm. Sau khi tạo nên giữ nguyên ID.
        </div>

        {error && (
          <p className="rounded-[10px] bg-red-50 px-3 py-2.5 text-[10px] font-bold text-red-600">
            {error}
          </p>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={
            creating
          }
          onClick={
            onClose
          }
          className="rounded-[11px] border border-black/10 px-4 py-3 text-xs font-black text-black/50"
        >
          Hủy
        </button>

        <button
          type="button"
          disabled={
            creating
          }
          onClick={
            onCreate
          }
          className="rounded-[11px] bg-[#191919] px-4 py-3 text-xs font-black text-white disabled:opacity-50"
        >
          {creating
            ? 'Đang tạo...'
            : mode ===
                'duplicate'
              ? 'Nhân bản'
              : 'Tạo sản phẩm'}
        </button>
      </div>
    </section>
  </div>
);

const SectionButton:
React.FC<{
  active: boolean;

  label: string;

  onClick:
    () => void;
}> = ({
  active,
  label,
  onClick,
}) => (
  <button
    type="button"
    onClick={
      onClick
    }
    className={[
      'min-w-[88px] flex-1 whitespace-nowrap rounded-[8px] px-3 py-2 text-[10px] font-black transition',
      active
        ? 'bg-white text-[#b83e57] shadow-sm'
        : 'text-black/38 hover:text-black/65',
    ].join(' ')}
  >
    {label}
  </button>
);

const CompactButton:
React.FC<{
  label: string;

  primary?: boolean;

  danger?: boolean;

  disabled?: boolean;

  onClick:
    () => void;
}> = ({
  label,
  primary = false,
  danger = false,
  disabled = false,
  onClick,
}) => (
  <button
    type="button"
    disabled={
      disabled
    }
    onClick={
      onClick
    }
    className={[
      'rounded-[9px] border px-3 py-2.5 text-[9px] font-black transition disabled:cursor-not-allowed disabled:opacity-35',
      primary
        ? 'border-[#191919] bg-[#191919] text-white'
        : danger
          ? 'border-red-100 bg-white text-red-500 hover:bg-red-50'
          : 'border-black/9 bg-white text-black/45 hover:border-[#cf5068]/25 hover:text-[#b83e57]',
    ].join(' ')}
  >
    {label}
  </button>
);

const StatusPill:
React.FC<{
  status:
    TemplateConfig[
      'status'
    ];
}> = ({
  status,
}) => {
  const label =
    status ===
    'available'
      ? 'Đang bán'
      : status ===
          'paused'
        ? 'Tạm dừng'
        : 'Đang làm';

  return (
    <span
      className={[
        'rounded-full px-2.5 py-1 text-[9px] font-black',
        status ===
        'available'
          ? 'bg-emerald-50 text-emerald-700'
          : status ===
              'paused'
            ? 'bg-amber-50 text-amber-700'
            : 'bg-[#f4f1f1] text-black/40',
      ].join(' ')}
    >
      {label}
    </span>
  );
};

const TextField:
React.FC<{
  label: string;

  value: string;

  placeholder?: string;

  onChange: (
    value: string
  ) => void;
}> = ({
  label,
  value,
  placeholder,
  onChange,
}) => (
  <label className="block">
    <span className="mb-1 block text-[9px] font-bold text-black/40">
      {label}
    </span>

    <input
      value={
        value
      }
      placeholder={
        placeholder
      }
      onChange={(
        event
      ) =>
        onChange(
          event.target
            .value
        )
      }
      className="w-full rounded-[9px] border border-black/10 bg-[#faf9f8] px-3 py-2.5 text-xs outline-none focus:border-[#cf5068]"
    />
  </label>
);

const NumberField:
React.FC<{
  label: string;

  value: number;

  onChange: (
    value: number
  ) => void;
}> = ({
  label,
  value,
  onChange,
}) => (
  <label className="block">
    <span className="mb-1 block text-[9px] font-bold text-black/40">
      {label}
    </span>

    <input
      type="number"
      min="0"
      step="1000"
      value={
        value
      }
      onChange={(
        event
      ) =>
        onChange(
          Math.max(
            0,
            Number(
              event.target
                .value
            ) ||
            0
          )
        )
      }
      className="w-full rounded-[9px] border border-black/10 bg-[#faf9f8] px-3 py-2.5 text-xs font-bold outline-none focus:border-[#cf5068]"
    />
  </label>
);

const SelectField:
React.FC<{
  label: string;

  value: string;

  onChange: (
    value: string
  ) => void;
}> = ({
  label,
  value,
  onChange,
}) => (
  <label className="block">
    <span className="mb-1 block text-[9px] font-bold text-black/40">
      {label}
    </span>

    <select
      value={
        value
      }
      onChange={(
        event
      ) =>
        onChange(
          event.target
            .value
        )
      }
      className="w-full rounded-[9px] border border-black/10 bg-[#faf9f8] px-3 py-2.5 text-xs font-bold outline-none"
    >
      <option value="available">
        Đang bán
      </option>

      <option value="paused">
        Tạm dừng
      </option>

      <option value="coming_soon">
        Đang làm
      </option>
    </select>
  </label>
);

const ToggleRow:
React.FC<{
  title: string;

  description: string;

  checked: boolean;

  onChange: (
    checked: boolean
  ) => void;
}> = ({
  title,
  description,
  checked,
  onChange,
}) => (
  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[11px] border border-black/7 bg-[#faf9f8] p-3">
    <div className="min-w-0">
      <p className="text-[10px] font-black">
        {title}
      </p>

      <p className="mt-0.5 text-[9px] leading-4 text-black/32">
        {description}
      </p>
    </div>

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
      className="h-4 w-4 shrink-0 accent-[#b83e57]"
    />
  </label>
);
