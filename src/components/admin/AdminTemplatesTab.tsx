import React from 'react';

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

interface CommonProps {
  template:
    TemplateConfig;
  saved: boolean;
  saving: boolean;
  onChange: (
    template:
      TemplateConfig
  ) => void;
  onSave: () => void;
}

export const AdminTemplatesTab:
React.FC<
  CommonProps
> = ({
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
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0 border border-black/8 bg-white p-5 sm:p-6">
        <div className="border-b border-black/8 pb-4">
          <p className="text-lg font-black">
            {template.name}
          </p>

          <p className="mt-1 text-xs leading-5 text-black/40">
            Đây là mẫu gốc. Giá và design ở đây dùng cho đơn checkout mới.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <AdminField
            label="Tên template"
            value={
              template.name
            }
            onChange={(value) =>
              onChange({
                ...template,
                name: value,
              })
            }
          />

          <AdminSelect
            label="Trạng thái"
            value={
              template.status
            }
            options={[
              [
                'available',
                'Available',
              ],
              [
                'paused',
                'Paused',
              ],
              [
                'coming_soon',
                'Coming soon',
              ],
            ]}
            onChange={(value) =>
              onChange({
                ...template,
                status:
                  value as
                    TemplateConfig[
                      'status'
                    ],
              })
            }
          />

          <AdminNumberField
            label="Giá gốc"
            value={
              template.basePrice
            }
            onChange={(value) =>
              onChange({
                ...template,
                basePrice:
                  value,
              })
            }
          />

          <AdminNumberField
            label="Giá sale"
            value={
              template.salePrice
            }
            onChange={(value) =>
              onChange({
                ...template,
                salePrice:
                  value,
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
                saleEnabled:
                  checked,
              })
            }
          />

          <ToggleRow
            title="Hiển thị template"
            description="Tắt nếu muốn ẩn khỏi storefront."
            checked={
              template.visible
            }
            onChange={(checked) =>
              onChange({
                ...template,
                visible:
                  checked,
              })
            }
          />
        </div>

        <div className="mt-5">
          <AdminField
            label="Nhãn khuyến mãi"
            value={
              template
                .promotionLabel
            }
            onChange={(value) =>
              onChange({
                ...template,
                promotionLabel:
                  value,
              })
            }
            placeholder="VD: Launch offer"
          />
        </div>

        <AdminTemplateDesignEditor
          design={
            template.design
          }
          onChange={(design) =>
            onChange({
              ...template,
              design,
            })
          }
        />

        <AdminTemplateAssetEditor
          assets={
            template.assets
          }
          onChange={(assets) =>
            onChange({
              ...template,
              assets,
            })
          }
        />

        <SaveButton
          saved={saved}
          saving={saving}
          label="Lưu toàn bộ mẫu gốc"
          onSave={onSave}
        />
      </section>

      <aside className="min-w-0 xl:sticky xl:top-5 xl:self-start">
        <TemplatePreview
          template={
            template
          }
          discount={
            discount
          }
        />
      </aside>
    </div>
  );
};

const TemplatePreview:
React.FC<{
  template:
    TemplateConfig;
  discount: number;
}> = ({
  template,
  discount,
}) => {
  const design =
    template.design;

  return (
    <div className="overflow-hidden border border-black/8 bg-white">
      <div className="border-b border-black/8 px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b83e57]">
          Live style preview
        </p>
      </div>

      <div
        style={{
          background:
            design.colors
              .pageBackground,
          color:
            design.colors.text,
          fontFamily:
            design.fonts.body,
        }}
        className="p-5"
      >
        <div
          style={{
            background:
              design.colors
                .surface,
          }}
          className="rounded-[22px] p-5 shadow-sm"
        >
          <p
            style={{
              color:
                design.proposal
                  .questionColor,
              fontFamily:
                design.fonts
                  .heading,
              fontSize:
                '24px',
            }}
            className="text-center font-bold"
          >
            Do you love me? ❤️
          </p>

          <div className="mt-4 flex justify-center gap-2">
            <span
              style={{
                background:
                  design.proposal
                    .yesButtonBackground,
                color:
                  design.proposal
                    .yesButtonText,
              }}
              className="rounded-full px-4 py-2 text-[10px] font-bold"
            >
              YES
            </span>

            <span
              style={{
                background:
                  design.proposal
                    .noButtonBackground,
                color:
                  design.proposal
                    .noButtonText,
              }}
              className="rounded-full border border-black/10 px-4 py-2 text-[10px] font-bold"
            >
              NO
            </span>
          </div>
        </div>

        <div
          style={{
            background:
              design.memories
                .background,
          }}
          className="mt-4 rounded-[22px] p-4"
        >
          <div className="grid grid-cols-2 gap-2">
            {[
              design.memories
                .captions.leftTop,
              design.memories
                .captions.rightTop,
            ].map(
              (
                caption,
                index
              ) => (
                <div
                  key={
                    caption +
                    index
                  }
                  style={{
                    background:
                      design.memories
                        .polaroidBackground,
                  }}
                  className={[
                    'p-2 shadow-sm',
                    index === 0
                      ? '-rotate-2'
                      : 'rotate-2',
                  ].join(' ')}
                >
                  <div
                    style={{
                      background:
                        design.colors
                          .surfaceSoft,
                    }}
                    className="aspect-square"
                  />

                  <p
                    style={{
                      color:
                        design.memories
                          .captionColor,
                      fontFamily:
                        design.memories
                          .captionFont,
                    }}
                    className="mt-2 truncate text-center text-[9px] italic"
                  >
                    {caption}
                  </p>
                </div>
              )
            )}
          </div>

          <p
            style={{
              color:
                design.memories
                  .titleColor,
              fontFamily:
                design.memories
                  .titleFont,
            }}
            className="mt-5 text-center text-2xl"
          >
            {
              design.memories
                .title
            }
          </p>
        </div>
      </div>

      <div className="border-t border-black/8 p-5">
        <h3 className="text-lg font-black">
          {template.name}
        </h3>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-black">
            {formatVnd(
              getEffectiveTemplatePrice(
                template
              )
            )}
          </span>

          {discount >
            0 && (
            <span className="text-xs text-black/35 line-through">
              {formatVnd(
                template.basePrice
              )}
            </span>
          )}
        </div>

        <p className="mt-2 text-xs text-[#b83e57]">
          {discount >
          0
            ? `Giảm ${discount}%`
            : 'Không áp dụng giảm giá'}
        </p>

        <div className="mt-5 border-t border-black/8 pt-4 text-[11px] leading-6 text-black/40">
          <p>
            Body:{' '}
            {
              design.fonts
                .body
            }
          </p>
          <p>
            Heading:{' '}
            {
              design.fonts
                .heading
            }
          </p>
          <p>
            Script:{' '}
            {
              design.fonts
                .script
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export const AdminDiscountsTab:
React.FC<
  CommonProps
> = ({
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
          Khuyến mãi{' '}
          {template.name}
        </p>

        <p className="mt-1 text-xs leading-5 text-black/40">
          Checkout mới sẽ lấy giá sau giảm này.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <AdminNumberField
            label="Giá gốc"
            value={
              template.basePrice
            }
            onChange={(value) =>
              onChange({
                ...template,
                basePrice:
                  value,
              })
            }
          />

          <AdminNumberField
            label="Giá sau giảm"
            value={
              template.salePrice
            }
            onChange={(value) =>
              onChange({
                ...template,
                salePrice:
                  value,
              })
            }
          />
        </div>

        <div className="mt-4">
          <AdminField
            label="Tên chương trình"
            value={
              template
                .promotionLabel
            }
            onChange={(value) =>
              onChange({
                ...template,
                promotionLabel:
                  value,
              })
            }
          />
        </div>

        <div className="mt-4">
          <ToggleRow
            title="Kích hoạt khuyến mãi"
            description={`Mức giảm hiện tại: ${discount}%`}
            checked={
              template.saleEnabled
            }
            onChange={(checked) =>
              onChange({
                ...template,
                saleEnabled:
                  checked,
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
            ? template
                .promotionLabel ||
              'Sale đang bật'
            : 'Sale đang tắt'}
        </p>
      </aside>
    </div>
  );
};

const AdminField:
React.FC<{
  label: string;
  value: string;
  placeholder?: string;
  onChange:
    (value: string) =>
      void;
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
      placeholder={
        placeholder
      }
      onChange={(event) =>
        onChange(
          event.target
            .value
        )
      }
      className="w-full border border-black/10 px-3.5 py-3 text-sm outline-none focus:border-[#cf5068]"
    />
  </label>
);

const AdminNumberField:
React.FC<{
  label: string;
  value: number;
  onChange:
    (value: number) =>
      void;
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
              event.target
                .value
            ) || 0
          )
        )
      }
      className="w-full border border-black/10 px-3.5 py-3 text-sm font-bold outline-none focus:border-[#cf5068]"
    />
  </label>
);

const AdminSelect:
React.FC<{
  label: string;
  value: string;
  options:
    Array<
      [string, string]
    >;
  onChange:
    (value: string) =>
      void;
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
        onChange(
          event.target
            .value
        )
      }
      className="w-full border border-black/10 bg-white px-3.5 py-3 text-sm font-bold outline-none focus:border-[#cf5068]"
    >
      {options.map(
        ([
          optionValue,
          optionLabel,
        ]) => (
          <option
            key={
              optionValue
            }
            value={
              optionValue
            }
          >
            {optionLabel}
          </option>
        )
      )}
    </select>
  </label>
);

const ToggleRow:
React.FC<{
  title: string;
  description: string;
  checked: boolean;
  onChange:
    (checked: boolean) =>
      void;
}> = ({
  title,
  description,
  checked,
  onChange,
}) => (
  <label className="flex cursor-pointer items-center justify-between gap-4 border border-black/8 p-4">
    <div>
      <p className="text-xs font-bold">
        {title}
      </p>

      <p className="mt-1 text-[11px] leading-5 text-black/35">
        {description}
      </p>
    </div>

    <input
      type="checkbox"
      checked={checked}
      onChange={(event) =>
        onChange(
          event.target
            .checked
        )
      }
      className="h-4 w-4 accent-[#b83e57]"
    />
  </label>
);

const SaveButton:
React.FC<{
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
