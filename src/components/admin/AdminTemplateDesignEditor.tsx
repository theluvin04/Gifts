import React from 'react';

import {
  DEFAULT_LOVE_TEMPLATE_DESIGN,
  TEMPLATE_FONT_OPTIONS,
  TemplateDesignConfig,
} from '../../templates/design';

interface AdminTemplateDesignEditorProps {
  design: TemplateDesignConfig;
  onChange: (
    design:
      TemplateDesignConfig
  ) => void;
}

const updateSection = <
  K extends keyof
    TemplateDesignConfig
>(
  design:
    TemplateDesignConfig,
  section: K,
  patch:
    Partial<
      TemplateDesignConfig[K]
    >
) => {
  return {
    ...design,
    [section]: {
      ...design[section],
      ...patch,
    },
  };
};

export const AdminTemplateDesignEditor:
React.FC<
  AdminTemplateDesignEditorProps
> = ({
  design,
  onChange,
}) => {
  const resetDesign =
    () => {
      onChange(
        JSON.parse(
          JSON.stringify(
            DEFAULT_LOVE_TEMPLATE_DESIGN
          )
        )
      );
    };

  return (
    <div className="mt-7 border-t border-black/8 pt-7">
      <div className="flex flex-col gap-3 border-b border-black/8 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b83e57]">
            Template Design
          </p>

          <h3 className="mt-2 text-xl font-black">
            Chỉnh mẫu gốc
          </h3>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-black/40">
            Khách không thấy các control này. Design được snapshot khi checkout nên chỉ đơn mới dùng thay đổi mới.
          </p>
        </div>

        <button
          type="button"
          onClick={
            resetDesign
          }
          className="w-fit border border-black/10 bg-white px-3.5 py-2.5 text-[11px] font-bold text-black/45 transition hover:border-[#cf5068] hover:text-[#b83e57]"
        >
          Reset design mặc định
        </button>
      </div>

      <DesignSection
        title="Toàn bộ template"
        description="Font và màu nền/chữ dùng chung."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FontField
            label="Font chữ thường"
            value={
              design.fonts.body
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'fonts',
                  {
                    body:
                      value,
                  }
                )
              )
            }
          />

          <FontField
            label="Font tiêu đề"
            value={
              design.fonts.heading
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'fonts',
                  {
                    heading:
                      value,
                  }
                )
              )
            }
          />

          <FontField
            label="Font viết tay"
            value={
              design.fonts.script
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'fonts',
                  {
                    script:
                      value,
                  }
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
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'colors',
                  {
                    pageBackground:
                      value,
                  }
                )
              )
            }
          />

          <ColorField
            label="Màu chữ chính"
            value={
              design.colors.text
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'colors',
                  {
                    text:
                      value,
                  }
                )
              )
            }
          />

          <ColorField
            label="Màu nhấn"
            value={
              design.colors.accent
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'colors',
                  {
                    accent:
                      value,
                  }
                )
              )
            }
          />

          <ColorField
            label="Màu card"
            value={
              design.colors.surface
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'colors',
                  {
                    surface:
                      value,
                  }
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
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'colors',
                  {
                    surfaceSoft:
                      value,
                  }
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
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'colors',
                  {
                    mutedText:
                      value,
                  }
                )
              )
            }
          />
        </div>
      </DesignSection>

      <DesignSection
        title="Màn YES / NO"
        description="Style câu hỏi và hai nút tương tác."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ColorField
            label="Màu câu hỏi"
            value={
              design.proposal
                .questionColor
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'proposal',
                  {
                    questionColor:
                      value,
                  }
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
            suffix="px"
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'proposal',
                  {
                    questionSize:
                      value,
                  }
                )
              )
            }
          />

          <ColorField
            label="Nền nút YES"
            value={
              design.proposal
                .yesButtonBackground
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'proposal',
                  {
                    yesButtonBackground:
                      value,
                  }
                )
              )
            }
          />

          <ColorField
            label="Chữ nút YES"
            value={
              design.proposal
                .yesButtonText
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'proposal',
                  {
                    yesButtonText:
                      value,
                  }
                )
              )
            }
          />

          <ColorField
            label="Nền nút NO"
            value={
              design.proposal
                .noButtonBackground
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'proposal',
                  {
                    noButtonBackground:
                      value,
                  }
                )
              )
            }
          />

          <ColorField
            label="Chữ nút NO"
            value={
              design.proposal
                .noButtonText
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'proposal',
                  {
                    noButtonText:
                      value,
                  }
                )
              )
            }
          />
        </div>
      </DesignSection>

      <DesignSection
        title="Màn 3 món quà"
        description="Tiêu đề sau khi bấm YES và màu hộp quà."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ColorField
            label="Màu tiêu đề"
            value={
              design.gifts
                .headingColor
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'gifts',
                  {
                    headingColor:
                      value,
                  }
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
            suffix="px"
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'gifts',
                  {
                    headingSize:
                      value,
                  }
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
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'gifts',
                  {
                    cardBackground:
                      value,
                  }
                )
              )
            }
          />
        </div>
      </DesignSection>

      <DesignSection
        title="Album ảnh"
        description="Chỉnh toàn bộ chữ, caption và màu Polaroid."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TextField
            label="Tiêu đề album"
            value={
              design.memories
                .title
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'memories',
                  {
                    title:
                      value,
                  }
                )
              )
            }
          />

          <FontField
            label="Font tiêu đề album"
            value={
              design.memories
                .titleFont
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'memories',
                  {
                    titleFont:
                      value,
                  }
                )
              )
            }
          />

          <NumberField
            label="Cỡ tiêu đề album"
            value={
              design.memories
                .titleSize
            }
            min={18}
            max={72}
            suffix="px"
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'memories',
                  {
                    titleSize:
                      value,
                  }
                )
              )
            }
          />

          <ColorField
            label="Màu tiêu đề album"
            value={
              design.memories
                .titleColor
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'memories',
                  {
                    titleColor:
                      value,
                  }
                )
              )
            }
          />

          <FontField
            label="Font caption ảnh"
            value={
              design.memories
                .captionFont
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'memories',
                  {
                    captionFont:
                      value,
                  }
                )
              )
            }
          />

          <NumberField
            label="Cỡ caption ảnh"
            value={
              design.memories
                .captionSize
            }
            min={9}
            max={24}
            suffix="px"
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'memories',
                  {
                    captionSize:
                      value,
                  }
                )
              )
            }
          />

          <ColorField
            label="Màu caption ảnh"
            value={
              design.memories
                .captionColor
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'memories',
                  {
                    captionColor:
                      value,
                  }
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
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'memories',
                  {
                    background:
                      value,
                  }
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
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'memories',
                  {
                    polaroidBackground:
                      value,
                  }
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
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'memories',
                  {
                    filmBorder:
                      value,
                  }
                )
              )
            }
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <MemoryCaptionField
            label="Caption trái trên"
            value={
              design.memories
                .captions.leftTop
            }
            onChange={(value) =>
              onChange({
                ...design,
                memories: {
                  ...design.memories,
                  captions: {
                    ...design.memories
                      .captions,
                    leftTop:
                      value,
                  },
                },
              })
            }
          />

          <MemoryCaptionField
            label="Caption phải trên"
            value={
              design.memories
                .captions.rightTop
            }
            onChange={(value) =>
              onChange({
                ...design,
                memories: {
                  ...design.memories,
                  captions: {
                    ...design.memories
                      .captions,
                    rightTop:
                      value,
                  },
                },
              })
            }
          />

          <MemoryCaptionField
            label="Caption trái dưới"
            value={
              design.memories
                .captions.leftBottom
            }
            onChange={(value) =>
              onChange({
                ...design,
                memories: {
                  ...design.memories,
                  captions: {
                    ...design.memories
                      .captions,
                    leftBottom:
                      value,
                  },
                },
              })
            }
          />

          <MemoryCaptionField
            label="Caption phải dưới"
            value={
              design.memories
                .captions.rightBottom
            }
            onChange={(value) =>
              onChange({
                ...design,
                memories: {
                  ...design.memories,
                  captions: {
                    ...design.memories
                      .captions,
                    rightBottom:
                      value,
                  },
                },
              })
            }
          />
        </div>
      </DesignSection>

      <DesignSection
        title="Màn nhạc"
        description="Font tiêu đề và hai mảng màu chính."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FontField
            label="Font tiêu đề nhạc"
            value={
              design.music
                .titleFont
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'music',
                  {
                    titleFont:
                      value,
                  }
                )
              )
            }
          />

          <ColorField
            label="Màu tiêu đề nhạc"
            value={
              design.music
                .titleColor
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'music',
                  {
                    titleColor:
                      value,
                  }
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
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'music',
                  {
                    vinylBackground:
                      value,
                  }
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
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'music',
                  {
                    playerBackground:
                      value,
                  }
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
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'music',
                  {
                    controlAccent:
                      value,
                  }
                )
              )
            }
          />
        </div>
      </DesignSection>

      <DesignSection
        title="Bức thư"
        description="Font viết tay, font nội dung, giấy và màu chữ."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FontField
            label="Font viết tay thư"
            value={
              design.letter
                .scriptFont
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'letter',
                  {
                    scriptFont:
                      value,
                  }
                )
              )
            }
          />

          <FontField
            label="Font nội dung thư"
            value={
              design.letter
                .bodyFont
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'letter',
                  {
                    bodyFont:
                      value,
                  }
                )
              )
            }
          />

          <ColorField
            label="Màu tiêu đề thư"
            value={
              design.letter
                .titleColor
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'letter',
                  {
                    titleColor:
                      value,
                  }
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
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'letter',
                  {
                    paperBackground:
                      value,
                  }
                )
              )
            }
          />

          <ColorField
            label="Màu nội dung thư"
            value={
              design.letter
                .bodyText
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'letter',
                  {
                    bodyText:
                      value,
                  }
                )
              )
            }
          />

          <ColorField
            label="Màu chữ ký / accent"
            value={
              design.letter
                .accent
            }
            onChange={(value) =>
              onChange(
                updateSection(
                  design,
                  'letter',
                  {
                    accent:
                      value,
                  }
                )
              )
            }
          />
        </div>
      </DesignSection>
    </div>
  );
};

const DesignSection:
React.FC<{
  title: string;
  description: string;
  children:
    React.ReactNode;
}> = ({
  title,
  description,
  children,
}) => (
  <section className="border-b border-black/8 py-6 last:border-b-0">
    <div className="mb-4">
      <h4 className="text-sm font-black">
        {title}
      </h4>

      <p className="mt-1 text-[11px] leading-5 text-black/35">
        {description}
      </p>
    </div>

    {children}
  </section>
);

const TextField:
React.FC<{
  label: string;
  value: string;
  onChange:
    (value: string) =>
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
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      className="w-full border border-black/10 px-3.5 py-3 text-sm outline-none focus:border-[#cf5068]"
    />
  </label>
);

const MemoryCaptionField =
  TextField;

const ColorField:
React.FC<{
  label: string;
  value: string;
  onChange:
    (value: string) =>
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

    <div className="flex items-center gap-2 border border-black/10 bg-white p-2">
      <input
        type="color"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="h-9 w-11 cursor-pointer border-0 bg-transparent p-0"
      />

      <input
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="min-w-0 flex-1 bg-transparent px-1 text-xs font-bold uppercase outline-none"
      />
    </div>
  </label>
);

const FontField:
React.FC<{
  label: string;
  value: string;
  onChange:
    (value: string) =>
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
      className="w-full border border-black/10 bg-white px-3.5 py-3 text-sm outline-none focus:border-[#cf5068]"
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

const NumberField:
React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange:
    (value: number) =>
      void;
}> = ({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}) => (
  <label className="block">
    <span className="mb-1.5 block text-[11px] font-bold text-black/55">
      {label}
    </span>

    <div className="flex items-center border border-black/10 bg-white">
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) =>
          onChange(
            Math.min(
              max,
              Math.max(
                min,
                Number(
                  event.target
                    .value
                ) ||
                  min
              )
            )
          )
        }
        className="min-w-0 flex-1 px-3.5 py-3 text-sm font-bold outline-none"
      />

      <span className="pr-3 text-[10px] font-bold text-black/30">
        {suffix}
      </span>
    </div>
  </label>
);
