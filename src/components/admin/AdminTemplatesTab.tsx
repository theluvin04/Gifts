import React, {
  useState,
} from 'react';

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

interface Props {
  template:
    TemplateConfig;
  dirty: boolean;
  saved: boolean;
  saving: boolean;
  onChange: (
    template:
      TemplateConfig
  ) => void;
  onSave: () => void;
}

type TemplateSection =
  | 'selling'
  | 'design'
  | 'assets';

export const AdminTemplatesTab:
React.FC<Props> = ({
  template,
  dirty,
  saved,
  saving,
  onChange,
  onSave,
}) => {
  const [
    section,
    setSection,
  ] =
    useState<TemplateSection>(
      'selling'
    );

  const discount =
    getTemplateDiscountPercent(
      template
    );

  return (
    <div className="pb-24">
      <div className="rounded-[18px] border border-black/8 bg-white p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-lg font-black">
              {template.name}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
              <span className="rounded-full bg-[#f4f1f1] px-2.5 py-1 font-bold text-black/45">
                {template.status}
              </span>

              <span className="font-bold text-[#b83e57]">
                {formatVnd(
                  getEffectiveTemplatePrice(
                    template
                  )
                )}
              </span>

              {discount >
                0 && (
                <span className="text-black/30">
                  giảm{' '}
                  {discount}%
                </span>
              )}
            </div>
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
              'rounded-[12px] px-5 py-3 text-xs font-bold transition',
              dirty
                ? 'bg-[#191919] text-white hover:bg-[#b83e57]'
                : 'bg-[#f4f1f1] text-black/35',
              'disabled:cursor-default disabled:opacity-100',
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

        <div className="mt-5 grid grid-cols-3 gap-1 rounded-[12px] bg-[#f4f1f1] p-1">
          <SectionButton
            active={
              section ===
              'selling'
            }
            label="Giá & bán"
            onClick={() =>
              setSection(
                'selling'
              )
            }
          />

          <SectionButton
            active={
              section ===
              'design'
            }
            label="Giao diện"
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
            label="GIF & ảnh"
            onClick={() =>
              setSection(
                'assets'
              )
            }
          />
        </div>
      </div>

      <div className="mt-4 rounded-[18px] border border-black/8 bg-white p-4 sm:p-6">
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
      </div>

      {(dirty ||
        saving ||
        saved) && (
        <div className="sticky bottom-3 z-40 mx-auto mt-5 max-w-[760px]">
          <div className="flex items-center justify-between gap-4 rounded-[16px] border border-black/10 bg-white/95 px-4 py-3 shadow-[0_14px_45px_rgba(0,0,0,0.14)] backdrop-blur-xl sm:px-5">
            <div className="min-w-0">
              <p
                className={[
                  'text-xs font-black',
                  dirty
                    ? 'text-[#b83e57]'
                    : 'text-emerald-700',
                ].join(' ')}
              >
                {saving
                  ? 'Đang lưu template...'
                  : dirty
                    ? 'Có thay đổi chưa lưu'
                    : 'Đã lưu thay đổi ✓'}
              </p>

              <p className="mt-1 text-[10px] leading-4 text-black/35">
                {dirty
                  ? 'Bấm Lưu để cập nhật giá, giao diện và lựa chọn GIF/ảnh cho khách.'
                  : 'Template mới nhất đã được ghi vào Firestore.'}
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
                'shrink-0 rounded-[11px] px-4 py-2.5 text-[11px] font-bold transition',
                dirty
                  ? 'bg-[#191919] text-white hover:bg-[#b83e57]'
                  : 'bg-emerald-50 text-emerald-700',
                'disabled:cursor-default',
              ].join(' ')}
            >
              {saving
                ? 'Đang lưu...'
                : dirty
                  ? 'Lưu thay đổi'
                  : 'Đã lưu'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SellingEditor:
React.FC<{
  template:
    TemplateConfig;
  discount: number;
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
    <h3 className="text-base font-black">
      Giá & trạng thái bán
    </h3>

    <p className="mt-1 text-xs leading-5 text-black/38">
      Những giá trị này được checkout mới sử dụng.
    </p>

    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <TextField
        label="Tên template"
        value={
          template.name
        }
        onChange={(name) =>
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
        onChange={(status) =>
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

    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <ToggleRow
        title="Bật giá sale"
        description={`Hiện giảm ${discount}%`}
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
        title="Hiển thị trên web"
        description="Tắt nếu muốn ẩn template."
        checked={
          template.visible
        }
        onChange={(visible) =>
          onChange({
            ...template,
            visible,
          })
        }
      />
    </div>

    <div className="mt-4">
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

const SectionButton:
React.FC<{
  active: boolean;
  label: string;
  onClick: () => void;
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
      'rounded-[9px] px-2 py-2.5 text-[11px] font-bold transition',
      active
        ? 'bg-white text-[#b83e57] shadow-sm'
        : 'text-black/40 hover:text-black/65',
    ].join(' ')}
  >
    {label}
  </button>
);

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
    <span className="mb-1.5 block text-[10px] font-bold text-black/45">
      {label}
    </span>

    <input
      value={value}
      placeholder={
        placeholder
      }
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      className="w-full rounded-[10px] border border-black/10 bg-[#faf9f8] px-3 py-3 text-sm outline-none focus:border-[#cf5068]"
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
    <span className="mb-1.5 block text-[10px] font-bold text-black/45">
      {label}
    </span>

    <input
      type="number"
      min="0"
      step="1000"
      value={value}
      onChange={(event) =>
        onChange(
          Math.max(
            0,
            Number(
              event.target.value
            ) || 0
          )
        )
      }
      className="w-full rounded-[10px] border border-black/10 bg-[#faf9f8] px-3 py-3 text-sm font-bold outline-none focus:border-[#cf5068]"
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
    <span className="mb-1.5 block text-[10px] font-bold text-black/45">
      {label}
    </span>

    <select
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      className="w-full rounded-[10px] border border-black/10 bg-[#faf9f8] px-3 py-3 text-sm font-bold outline-none"
    >
      <option value="available">
        Available
      </option>

      <option value="paused">
        Paused
      </option>

      <option value="coming_soon">
        Coming soon
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
  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[12px] border border-black/8 bg-[#faf9f8] p-4">
    <div>
      <p className="text-xs font-bold">
        {title}
      </p>

      <p className="mt-1 text-[10px] text-black/35">
        {description}
      </p>
    </div>

    <input
      type="checkbox"
      checked={
        checked
      }
      onChange={(event) =>
        onChange(
          event.target.checked
        )
      }
      className="h-4 w-4 accent-[#b83e57]"
    />
  </label>
);
