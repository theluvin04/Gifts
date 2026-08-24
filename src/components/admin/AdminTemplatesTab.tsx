import React from 'react';

import {
  TemplateConfig,
  getEffectiveTemplatePrice,
  getTemplateDiscountPercent,
} from '../../services/templateService';

import { formatVnd } from './adminUi';

interface CommonProps {
  template: TemplateConfig;
  saved: boolean;
  saving: boolean;
  onChange: (
    template: TemplateConfig
  ) => void;
  onSave: () => void;
}

export const AdminTemplatesTab:
React.FC<CommonProps> = ({
  template,
  saved,
  saving,
  onChange,
  onSave,
}) => {
  const discount =
    getTemplateDiscountPercent(
      template
    );

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <section className="border border-black/8 bg-white p-5 sm:p-6">
        <div className="border-b border-black/8 pb-4">
          <p className="text-lg font-black">
            Love Story 01
          </p>
          <p className="mt-1 text-xs text-black/40">
            Giá ở đây sẽ được dùng cho đơn checkout mới.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <AdminField
            label="Tên template"
            value={template.name}
            onChange={(value) =>
              onChange({
                ...template,
                name: value,
              })
            }
          />

          <AdminSelect
            label="Trạng thái"
            value={template.status}
            options={[
              ['available', 'Available'],
              ['paused', 'Paused'],
              ['coming_soon', 'Coming soon'],
            ]}
            onChange={(value) =>
              onChange({
                ...template,
                status:
                  value as TemplateConfig['status'],
              })
            }
          />

          <AdminNumberField
            label="Giá gốc"
            value={template.basePrice}
            onChange={(value) =>
              onChange({
                ...template,
                basePrice: value,
              })
            }
          />

          <AdminNumberField
            label="Giá sale"
            value={template.salePrice}
            onChange={(value) =>
              onChange({
                ...template,
                salePrice: value,
              })
            }
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <ToggleRow
            title="Bật giá sale"
            description={`Giảm hiện tại ${discount}%`}
            checked={
              template.saleEnabled
            }
            onChange={(checked) =>
              onChange({
                ...template,
                saleEnabled: checked,
              })
            }
          />

          <ToggleRow
            title="Hiển thị template"
            description="Tắt nếu muốn ẩn khỏi storefront."
            checked={template.visible}
            onChange={(checked) =>
              onChange({
                ...template,
                visible: checked,
              })
            }
          />
        </div>

        <div className="mt-5">
          <AdminField
            label="Nhãn khuyến mãi"
            value={
              template.promotionLabel
            }
            onChange={(value) =>
              onChange({
                ...template,
                promotionLabel: value,
              })
            }
            placeholder="VD: Launch offer"
          />
        </div>

        <SaveButton
          saved={saved}
          saving={saving}
          label="Lưu template"
          onSave={onSave}
        />
      </section>

      <aside className="border border-black/8 bg-[#f3ecee] p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b83e57]">
          Preview giá
        </p>

        <h3 className="mt-4 text-xl font-black">
          {template.name}
        </h3>

        <div className="mt-7 flex items-baseline gap-2">
          <span className="text-3xl font-black">
            {formatVnd(
              getEffectiveTemplatePrice(
                template
              )
            )}
          </span>

          {discount > 0 && (
            <span className="text-sm text-black/35 line-through">
              {formatVnd(
                template.basePrice
              )}
            </span>
          )}
        </div>

        <p className="mt-2 text-xs text-[#b83e57]">
          {discount > 0
            ? `Giảm ${discount}%`
            : 'Không áp dụng giảm giá'}
        </p>

        <div className="mt-8 border-t border-black/10 pt-4 text-xs leading-6 text-black/45">
          <p>Status: {template.status}</p>
          <p>Visible: {template.visible ? 'true' : 'false'}</p>
          <p>Sale: {template.saleEnabled ? 'ON' : 'OFF'}</p>
        </div>
      </aside>
    </div>
  );
};

export const AdminDiscountsTab:
React.FC<CommonProps> = ({
  template,
  saved,
  saving,
  onChange,
  onSave,
}) => {
  const discount =
    getTemplateDiscountPercent(
      template
    );

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <section className="border border-black/8 bg-white p-5 sm:p-6">
        <p className="text-lg font-black">
          Khuyến mãi Love Story 01
        </p>

        <p className="mt-1 text-xs leading-5 text-black/40">
          Giảm giá trực tiếp theo template. Checkout mới sẽ lấy giá sau giảm này.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <AdminNumberField
            label="Giá gốc"
            value={template.basePrice}
            onChange={(value) =>
              onChange({
                ...template,
                basePrice: value,
              })
            }
          />

          <AdminNumberField
            label="Giá sau giảm"
            value={template.salePrice}
            onChange={(value) =>
              onChange({
                ...template,
                salePrice: value,
              })
            }
          />
        </div>

        <div className="mt-4">
          <AdminField
            label="Tên chương trình"
            value={template.promotionLabel}
            onChange={(value) =>
              onChange({
                ...template,
                promotionLabel: value,
              })
            }
          />
        </div>

        <div className="mt-4">
          <ToggleRow
            title="Kích hoạt khuyến mãi"
            description={`Mức giảm hiện tại: ${discount}%`}
            checked={template.saleEnabled}
            onChange={(checked) =>
              onChange({
                ...template,
                saleEnabled: checked,
              })
            }
          />
        </div>

        <SaveButton
          saved={saved}
          saving={saving}
          label="Lưu khuyến mãi"
          onSave={onSave}
        />
      </section>

      <aside className="border border-black/8 bg-[#181818] p-5 text-white">
        <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">
          Discount
        </p>
        <p className="mt-4 text-6xl font-black tracking-[-0.07em] text-[#f0a0af]">
          {discount}%
        </p>
        <p className="mt-4 text-sm text-white/50">
          {template.saleEnabled
            ? template.promotionLabel || 'Sale đang bật'
            : 'Sale đang tắt'}
        </p>
        <div className="mt-8 border-t border-white/15 pt-4 text-xs leading-6 text-white/45">
          <p>Giá gốc: {formatVnd(template.basePrice)}</p>
          <p>Giá sale: {formatVnd(template.salePrice)}</p>
        </div>
      </aside>
    </div>
  );
};

const AdminField: React.FC<{
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}> = ({
  label,
  value,
  placeholder,
  onChange,
}) => (
  <label className="block">
    <span className="mb-1.5 block text-[11px] font-bold text-black/55">
      {label}
    </span>
    <input
      value={value}
      placeholder={placeholder}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="w-full border border-black/10 px-3.5 py-3 text-sm outline-none focus:border-[#cf5068]"
    />
  </label>
);

const AdminNumberField: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
}> = ({
  label,
  value,
  onChange,
}) => (
  <label className="block">
    <span className="mb-1.5 block text-[11px] font-bold text-black/55">
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
      className="w-full border border-black/10 px-3.5 py-3 text-sm font-bold outline-none focus:border-[#cf5068]"
    />
  </label>
);

const AdminSelect: React.FC<{
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}> = ({
  label,
  value,
  options,
  onChange,
}) => (
  <label className="block">
    <span className="mb-1.5 block text-[11px] font-bold text-black/55">
      {label}
    </span>
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="w-full border border-black/10 bg-white px-3.5 py-3 text-sm font-bold outline-none focus:border-[#cf5068]"
    >
      {options.map(
        ([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        )
      )}
    </select>
  </label>
);

const ToggleRow: React.FC<{
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({
  title,
  description,
  checked,
  onChange,
}) => (
  <label className="flex cursor-pointer items-center justify-between gap-4 border border-black/8 p-4">
    <div>
      <p className="text-xs font-bold">{title}</p>
      <p className="mt-1 text-[11px] leading-5 text-black/35">
        {description}
      </p>
    </div>
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) =>
        onChange(event.target.checked)
      }
      className="h-4 w-4 accent-[#b83e57]"
    />
  </label>
);

const SaveButton: React.FC<{
  saved: boolean;
  saving: boolean;
  label: string;
  onSave: () => void;
}> = ({
  saved,
  saving,
  label,
  onSave,
}) => (
  <button
    type="button"
    disabled={saving}
    onClick={onSave}
    className="mt-6 bg-[#181818] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#b83e57] disabled:opacity-50"
  >
    {saving
      ? 'Đang lưu...'
      : saved
        ? 'Đã lưu'
        : label}
  </button>
);
