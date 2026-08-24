import React from 'react';

import {
  DEFAULT_LOVE_TEMPLATE_DESIGN,
  TEMPLATE_FONT_OPTIONS,
  TemplateDesignConfig,
} from '../../templates/design';

interface Props {
  design:
    TemplateDesignConfig;
  onChange: (
    design:
      TemplateDesignConfig
  ) => void;
}

type SectionKey =
  keyof TemplateDesignConfig;

const updateSection = <
  K extends SectionKey
>(
  design:
    TemplateDesignConfig,
  section: K,
  patch:
    Partial<
      TemplateDesignConfig[K]
    >
) => ({
  ...design,
  [section]: {
    ...design[section],
    ...patch,
  },
});

export const AdminTemplateDesignEditor:
React.FC<Props> = ({
  design,
  onChange,
}) => (
  <div>
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <h3 className="text-base font-black">
          Giao diện mẫu gốc
        </h3>

        <p className="mt-1 text-xs leading-5 text-black/38">
          Admin chỉnh style. Khách chỉ chỉnh nội dung.
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          onChange(
            JSON.parse(
              JSON.stringify(
                DEFAULT_LOVE_TEMPLATE_DESIGN
              )
            )
          )
        }
        className="shrink-0 rounded-[10px] border border-black/10 px-3 py-2 text-[10px] font-bold text-black/45 hover:text-[#b83e57]"
      >
        Reset mặc định
      </button>
    </div>

    <div className="space-y-3">
      <DesignGroup
        title="Font & màu chung"
        description="Nền, chữ và font xuyên suốt template."
        open
      >
        <FieldGrid>
          <FontField
            label="Font chữ thường"
            value={design.fonts.body}
            onChange={(body) =>
              onChange(
                updateSection(
                  design,
                  'fonts',
                  { body }
                )
              )
            }
          />

          <FontField
            label="Font tiêu đề"
            value={design.fonts.heading}
            onChange={(heading) =>
              onChange(
                updateSection(
                  design,
                  'fonts',
                  { heading }
                )
              )
            }
          />

          <FontField
            label="Font viết tay"
            value={design.fonts.script}
            onChange={(script) =>
              onChange(
                updateSection(
                  design,
                  'fonts',
                  { script }
                )
              )
            }
          />

          <ColorField
            label="Nền chính"
            value={
              design.colors
                .pageBackground
            }
            onChange={(pageBackground) =>
              onChange(
                updateSection(
                  design,
                  'colors',
                  { pageBackground }
                )
              )
            }
          />

          <ColorField
            label="Chữ chính"
            value={design.colors.text}
            onChange={(text) =>
              onChange(
                updateSection(
                  design,
                  'colors',
                  { text }
                )
              )
            }
          />

          <ColorField
            label="Màu nhấn"
            value={
              design.colors.accent
            }
            onChange={(accent) =>
              onChange(
                updateSection(
                  design,
                  'colors',
                  { accent }
                )
              )
            }
          />

          <ColorField
            label="Nền card"
            value={
              design.colors.surface
            }
            onChange={(surface) =>
              onChange(
                updateSection(
                  design,
                  'colors',
                  { surface }
                )
              )
            }
          />

          <ColorField
            label="Nền phụ"
            value={
              design.colors
                .surfaceSoft
            }
            onChange={(surfaceSoft) =>
              onChange(
                updateSection(
                  design,
                  'colors',
                  { surfaceSoft }
                )
              )
            }
          />

          <ColorField
            label="Chữ phụ"
            value={
              design.colors
                .mutedText
            }
            onChange={(mutedText) =>
              onChange(
                updateSection(
                  design,
                  'colors',
                  { mutedText }
                )
              )
            }
          />
        </FieldGrid>
      </DesignGroup>

      <DesignGroup
        title="YES / NO"
        description="Câu hỏi và hai nút tương tác."
      >
        <FieldGrid>
          <ColorField
            label="Màu câu hỏi"
            value={
              design.proposal
                .questionColor
            }
            onChange={(questionColor) =>
              onChange(
                updateSection(
                  design,
                  'proposal',
                  { questionColor }
                )
              )
            }
          />

          <NumberField
            label="Cỡ câu hỏi"
            value={
              design.proposal
                .questionSize
            }
            min={18}
            max={72}
            onChange={(questionSize) =>
              onChange(
                updateSection(
                  design,
                  'proposal',
                  { questionSize }
                )
              )
            }
          />

          <ColorField
            label="Nền YES"
            value={
              design.proposal
                .yesButtonBackground
            }
            onChange={(yesButtonBackground) =>
              onChange(
                updateSection(
                  design,
                  'proposal',
                  { yesButtonBackground }
                )
              )
            }
          />

          <ColorField
            label="Chữ YES"
            value={
              design.proposal
                .yesButtonText
            }
            onChange={(yesButtonText) =>
              onChange(
                updateSection(
                  design,
                  'proposal',
                  { yesButtonText }
                )
              )
            }
          />

          <ColorField
            label="Nền NO"
            value={
              design.proposal
                .noButtonBackground
            }
            onChange={(noButtonBackground) =>
              onChange(
                updateSection(
                  design,
                  'proposal',
                  { noButtonBackground }
                )
              )
            }
          />

          <ColorField
            label="Chữ NO"
            value={
              design.proposal
                .noButtonText
            }
            onChange={(noButtonText) =>
              onChange(
                updateSection(
                  design,
                  'proposal',
                  { noButtonText }
                )
              )
            }
          />
        </FieldGrid>
      </DesignGroup>

      <DesignGroup
        title="3 món quà"
        description="Tiêu đề và màu card chọn quà."
      >
        <FieldGrid>
          <ColorField
            label="Màu tiêu đề"
            value={
              design.gifts
                .headingColor
            }
            onChange={(headingColor) =>
              onChange(
                updateSection(
                  design,
                  'gifts',
                  { headingColor }
                )
              )
            }
          />

          <NumberField
            label="Cỡ tiêu đề"
            value={
              design.gifts
                .headingSize
            }
            min={18}
            max={64}
            onChange={(headingSize) =>
              onChange(
                updateSection(
                  design,
                  'gifts',
                  { headingSize }
                )
              )
            }
          />

          <ColorField
            label="Nền card quà"
            value={
              design.gifts
                .cardBackground
            }
            onChange={(cardBackground) =>
              onChange(
                updateSection(
                  design,
                  'gifts',
                  { cardBackground }
                )
              )
            }
          />
        </FieldGrid>
      </DesignGroup>

      <DesignGroup
        title="Album ảnh"
        description="Tiêu đề, caption và màu Polaroid."
      >
        <FieldGrid>
          <TextField
            label="Tiêu đề album"
            value={
              design.memories.title
            }
            onChange={(title) =>
              onChange(
                updateSection(
                  design,
                  'memories',
                  { title }
                )
              )
            }
          />

          <FontField
            label="Font tiêu đề"
            value={
              design.memories
                .titleFont
            }
            onChange={(titleFont) =>
              onChange(
                updateSection(
                  design,
                  'memories',
                  { titleFont }
                )
              )
            }
          />

          <NumberField
            label="Cỡ tiêu đề"
            value={
              design.memories
                .titleSize
            }
            min={18}
            max={72}
            onChange={(titleSize) =>
              onChange(
                updateSection(
                  design,
                  'memories',
                  { titleSize }
                )
              )
            }
          />

          <ColorField
            label="Màu tiêu đề"
            value={
              design.memories
                .titleColor
            }
            onChange={(titleColor) =>
              onChange(
                updateSection(
                  design,
                  'memories',
                  { titleColor }
                )
              )
            }
          />

          <FontField
            label="Font caption"
            value={
              design.memories
                .captionFont
            }
            onChange={(captionFont) =>
              onChange(
                updateSection(
                  design,
                  'memories',
                  { captionFont }
                )
              )
            }
          />

          <NumberField
            label="Cỡ caption"
            value={
              design.memories
                .captionSize
            }
            min={9}
            max={24}
            onChange={(captionSize) =>
              onChange(
                updateSection(
                  design,
                  'memories',
                  { captionSize }
                )
              )
            }
          />

          <ColorField
            label="Màu caption"
            value={
              design.memories
                .captionColor
            }
            onChange={(captionColor) =>
              onChange(
                updateSection(
                  design,
                  'memories',
                  { captionColor }
                )
              )
            }
          />

          <ColorField
            label="Nền album"
            value={
              design.memories
                .background
            }
            onChange={(background) =>
              onChange(
                updateSection(
                  design,
                  'memories',
                  { background }
                )
              )
            }
          />

          <ColorField
            label="Nền Polaroid"
            value={
              design.memories
                .polaroidBackground
            }
            onChange={(polaroidBackground) =>
              onChange(
                updateSection(
                  design,
                  'memories',
                  { polaroidBackground }
                )
              )
            }
          />

          <ColorField
            label="Viền film strip"
            value={
              design.memories
                .filmBorder
            }
            onChange={(filmBorder) =>
              onChange(
                updateSection(
                  design,
                  'memories',
                  { filmBorder }
                )
              )
            }
          />
        </FieldGrid>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(
            [
              [
                'leftTop',
                'Caption trái trên',
              ],
              [
                'leftBottom',
                'Caption trái dưới',
              ],
              [
                'rightTop',
                'Caption phải trên',
              ],
              [
                'rightBottom',
                'Caption phải dưới',
              ],
            ] as const
          ).map(
            ([
              key,
              label,
            ]) => (
              <TextField
                key={key}
                label={label}
                value={
                  design.memories
                    .captions[
                    key
                  ]
                }
                onChange={(value) =>
                  onChange({
                    ...design,
                    memories: {
                      ...design.memories,
                      captions: {
                        ...design
                          .memories
                          .captions,
                        [key]:
                          value,
                      },
                    },
                  })
                }
              />
            )
          )}
        </div>
      </DesignGroup>

      <DesignGroup
        title="Âm nhạc"
        description="Tiêu đề, nền đĩa và player."
      >
        <FieldGrid>
          <FontField
            label="Font tiêu đề"
            value={
              design.music
                .titleFont
            }
            onChange={(titleFont) =>
              onChange(
                updateSection(
                  design,
                  'music',
                  { titleFont }
                )
              )
            }
          />

          <ColorField
            label="Màu tiêu đề"
            value={
              design.music
                .titleColor
            }
            onChange={(titleColor) =>
              onChange(
                updateSection(
                  design,
                  'music',
                  { titleColor }
                )
              )
            }
          />

          <ColorField
            label="Nền đĩa than"
            value={
              design.music
                .vinylBackground
            }
            onChange={(vinylBackground) =>
              onChange(
                updateSection(
                  design,
                  'music',
                  { vinylBackground }
                )
              )
            }
          />

          <ColorField
            label="Nền player"
            value={
              design.music
                .playerBackground
            }
            onChange={(playerBackground) =>
              onChange(
                updateSection(
                  design,
                  'music',
                  { playerBackground }
                )
              )
            }
          />

          <ColorField
            label="Màu control"
            value={
              design.music
                .controlAccent
            }
            onChange={(controlAccent) =>
              onChange(
                updateSection(
                  design,
                  'music',
                  { controlAccent }
                )
              )
            }
          />
        </FieldGrid>
      </DesignGroup>

      <DesignGroup
        title="Bức thư"
        description="Font, giấy và màu chữ."
      >
        <FieldGrid>
          <FontField
            label="Font viết tay"
            value={
              design.letter
                .scriptFont
            }
            onChange={(scriptFont) =>
              onChange(
                updateSection(
                  design,
                  'letter',
                  { scriptFont }
                )
              )
            }
          />

          <FontField
            label="Font nội dung"
            value={
              design.letter
                .bodyFont
            }
            onChange={(bodyFont) =>
              onChange(
                updateSection(
                  design,
                  'letter',
                  { bodyFont }
                )
              )
            }
          />

          <ColorField
            label="Màu tiêu đề"
            value={
              design.letter
                .titleColor
            }
            onChange={(titleColor) =>
              onChange(
                updateSection(
                  design,
                  'letter',
                  { titleColor }
                )
              )
            }
          />

          <ColorField
            label="Màu giấy"
            value={
              design.letter
                .paperBackground
            }
            onChange={(paperBackground) =>
              onChange(
                updateSection(
                  design,
                  'letter',
                  { paperBackground }
                )
              )
            }
          />

          <ColorField
            label="Màu nội dung"
            value={
              design.letter
                .bodyText
            }
            onChange={(bodyText) =>
              onChange(
                updateSection(
                  design,
                  'letter',
                  { bodyText }
                )
              )
            }
          />

          <ColorField
            label="Màu chữ ký"
            value={
              design.letter.accent
            }
            onChange={(accent) =>
              onChange(
                updateSection(
                  design,
                  'letter',
                  { accent }
                )
              )
            }
          />
        </FieldGrid>
      </DesignGroup>
    </div>
  </div>
);

const DesignGroup:
React.FC<{
  title: string;
  description: string;
  open?: boolean;
  children:
    React.ReactNode;
}> = ({
  title,
  description,
  open = false,
  children,
}) => (
  <details
    open={open}
    className="group rounded-[16px] border border-black/8 bg-white"
  >
    <summary className="cursor-pointer list-none px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black">
            {title}
          </p>

          <p className="mt-1 text-[11px] text-black/35">
            {description}
          </p>
        </div>

        <span className="text-lg leading-none text-black/25 transition group-open:rotate-45">
          +
        </span>
      </div>
    </summary>

    <div className="border-t border-black/6 px-4 py-4">
      {children}
    </div>
  </details>
);

const FieldGrid:
React.FC<{
  children:
    React.ReactNode;
}> = ({
  children,
}) => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {children}
  </div>
);

const TextField:
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

    <input
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      className="w-full rounded-[10px] border border-black/10 bg-[#faf9f8] px-3 py-2.5 text-xs outline-none focus:border-[#cf5068]"
    />
  </label>
);

const FontField:
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
      style={{
        fontFamily:
          value,
      }}
      className="w-full rounded-[10px] border border-black/10 bg-[#faf9f8] px-3 py-2.5 text-xs outline-none focus:border-[#cf5068]"
    >
      {TEMPLATE_FONT_OPTIONS.map(
        (font) => (
          <option
            key={
              font.value
            }
            value={
              font.value
            }
          >
            {font.label}
          </option>
        )
      )}
    </select>
  </label>
);

const ColorField:
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

    <div className="flex items-center gap-2 rounded-[10px] border border-black/10 bg-[#faf9f8] p-2">
      <input
        type="color"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="h-8 w-10 cursor-pointer border-0 bg-transparent p-0"
      />

      <input
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="min-w-0 flex-1 bg-transparent font-mono text-[10px] uppercase outline-none"
      />
    </div>
  </label>
);

const NumberField:
React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (
    value: number
  ) => void;
}> = ({
  label,
  value,
  min,
  max,
  onChange,
}) => (
  <label className="block">
    <span className="mb-1.5 block text-[10px] font-bold text-black/45">
      {label}
    </span>

    <div className="flex items-center rounded-[10px] border border-black/10 bg-[#faf9f8]">
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(event) =>
          onChange(
            Math.min(
              max,
              Math.max(
                min,
                Number(
                  event.target.value
                ) || min
              )
            )
          )
        }
        className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-xs font-bold outline-none"
      />

      <span className="pr-3 text-[9px] font-bold text-black/25">
        px
      </span>
    </div>
  </label>
);
