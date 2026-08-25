import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const files = {
  controls: path.join(
    root,
    'src/components/admin/visual-editor/EditorControls.tsx'
  ),
  inspector: path.join(
    root,
    'src/components/admin/visual-editor/InspectorPanel.tsx'
  ),
  canvas: path.join(
    root,
    'src/components/admin/visual-editor/EditorCanvas.tsx'
  ),
  runtime: path.join(
    root,
    'src/engine/scene/SceneElementView.tsx'
  ),
};

const read = (file) =>
  fs.readFileSync(file, 'utf8');

const write = (file, content) =>
  fs.writeFileSync(file, content, 'utf8');

const replaceOnce = (
  content,
  oldValue,
  newValue,
  label
) => {
  const index =
    content.indexOf(oldValue);

  if (index < 0) {
    if (
      content.includes(
        newValue
      )
    ) {
      return content;
    }

    throw new Error(
      `Không tìm thấy đoạn code cần sửa: ${label}`
    );
  }

  return (
    content.slice(
      0,
      index
    ) +
    newValue +
    content.slice(
      index +
      oldValue.length
    )
  );
};

const replaceBlock = (
  content,
  startMarker,
  endMarker,
  createNext,
  label
) => {
  const start =
    content.indexOf(
      startMarker
    );

  const end =
    content.indexOf(
      endMarker,
      start
    );

  if (
    start < 0 ||
    end < 0
  ) {
    throw new Error(
      `Không tìm thấy block: ${label}`
    );
  }

  const current =
    content.slice(
      start,
      end
    );

  const next =
    createNext(
      current
    );

  return (
    content.slice(
      0,
      start
    ) +
    next +
    content.slice(
      end
    )
  );
};

// ------------------------------------------------------------
// 1) NumberInput: cho phép xóa số cũ rồi gõ số mới bình thường.
// Không clamp ngay lúc ô đang rỗng.
// ------------------------------------------------------------
{
  let source =
    read(
      files.controls
    );

  source =
    replaceOnce(
      source,
      "import React from 'react';",
      `import React, {
  useEffect,
  useRef,
  useState,
} from 'react';`,
      'EditorControls React import'
    );

  const numberInput = `export const NumberInput:
React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (
    value: number
  ) => void;
}> = ({
  label,
  value,
  min,
  max,
  step,
  suffix = '',
  onChange,
}) => {
  const focusedRef =
    useRef(false);

  const formatValue = (
    nextValue: number
  ) =>
    Number.isFinite(
      nextValue
    )
      ? String(
          nextValue
        )
      : '';

  const [
    draft,
    setDraft,
  ] = useState(
    () =>
      formatValue(
        value
      )
  );

  useEffect(() => {
    if (
      !focusedRef.current
    ) {
      setDraft(
        formatValue(
          value
        )
      );
    }
  }, [
    value,
  ]);

  const commit = () => {
    focusedRef.current =
      false;

    const trimmed =
      draft.trim();

    const parsed =
      Number(
        trimmed
      );

    if (
      !trimmed ||
      !Number.isFinite(
        parsed
      )
    ) {
      setDraft(
        formatValue(
          value
        )
      );

      return;
    }

    const next =
      clamp(
        parsed,
        min,
        max
      );

    setDraft(
      String(
        next
      )
    );

    if (
      next !== value
    ) {
      onChange(
        next
      );
    }
  };

  const handleDraftChange = (
    raw: string
  ) => {
    setDraft(
      raw
    );

    const trimmed =
      raw.trim();

    // Cho phép trạng thái trung gian khi đang gõ:
    // rỗng, dấu âm, "1."...
    if (
      !trimmed ||
      trimmed === '-' ||
      trimmed === '+' ||
      trimmed.endsWith(
        '.'
      )
    ) {
      return;
    }

    const parsed =
      Number(
        trimmed
      );

    if (
      Number.isFinite(
        parsed
      ) &&
      parsed >= min &&
      parsed <= max
    ) {
      onChange(
        parsed
      );
    }
  };

  return (
    <label className="block">
      <span className="mb-1 block text-[9px] font-bold text-black/40">
        {label}
      </span>

      <div className="flex items-center rounded-[8px] border border-black/10 bg-[#faf9f8]">
        <input
          type="number"
          inputMode="decimal"
          value={
            draft
          }
          min={min}
          max={max}
          step={step}
          onFocus={() => {
            focusedRef.current =
              true;
          }}
          onChange={(
            event
          ) =>
            handleDraftChange(
              event.target
                .value
            )
          }
          onBlur={
            commit
          }
          onKeyDown={(
            event
          ) => {
            if (
              event.key ===
              'Enter'
            ) {
              event.currentTarget
                .blur();

              return;
            }

            if (
              event.key ===
              'Escape'
            ) {
              setDraft(
                formatValue(
                  value
                )
              );

              event.currentTarget
                .blur();
            }
          }}
          className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-[10px] font-bold outline-none"
        />

        {suffix && (
          <span className="pr-2 text-[8px] font-bold text-black/25">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
};

`;

  source =
    replaceBlock(
      source,
      'export const NumberInput:',
      'export const ColorInput:',
      () =>
        numberInput,
      'NumberInput'
    );

  write(
    files.controls,
    source
  );
}

// ------------------------------------------------------------
// 2) Inspector: PC/Mobile có typography riêng.
// Lưu override mobile lồng trong textStyle.mobile / buttonStyle.mobile.
// normalize hiện tại dùng spread object nên field này được giữ nguyên
// khi save/load Firestore mà không cần migrate schema.
// ------------------------------------------------------------
{
  let source =
    read(
      files.inspector
    );

  source =
    replaceOnce(
      source,
      `<TextControls
            element={
              element
            }
            onChange={
              onChange
            }
          />`,
      `<TextControls
            element={
              element
            }
            device={
              device
            }
            onChange={
              onChange
            }
          />`,
      'TextControls device prop'
    );

  source =
    replaceOnce(
      source,
      `<ButtonControls
            element={
              element
            }
            onChange={
              onChange
            }
          />`,
      `<ButtonControls
            element={
              element
            }
            device={
              device
            }
            onChange={
              onChange
            }
          />`,
      'ButtonControls device prop'
    );

  source =
    replaceBlock(
      source,
      'const TextControls:',
      '\nconst ImageControls:',
      (
        current
      ) => {
        const returnAt =
          current.indexOf(
            '  return ('
          );

        if (
          returnAt < 0
        ) {
          throw new Error(
            'TextControls thiếu return'
          );
        }

        let body =
          current.slice(
            returnAt
          );

        body =
          body.replace(
            '          min={6}',
            '          min={1}'
          );

        const header = `const TextControls:
React.FC<{
  element:
    Extract<
      SceneElement,
      {
        type:
          'text';
      }
    >;

  device:
    DeviceMode;

  onChange: (
    updater: (
      element:
        SceneElement
    ) =>
      SceneElement
  ) => void;
}> = ({
  element,
  device,
  onChange,
}) => {
  const desktopStyle =
    element.textStyle ||
    {};

  const mobileStyle =
    (
      (
        desktopStyle as any
      ).mobile ||
      {}
    ) as
      typeof desktopStyle;

  const style =
    device ===
    'mobile'
      ? {
          ...desktopStyle,
          ...mobileStyle,
        }
      : desktopStyle;

  const patch = (
    next:
      Record<
        string,
        unknown
      >
  ) =>
    onChange(
      (
        current
      ) => {
        if (
          current.type !==
          'text'
        ) {
          return current;
        }

        const currentStyle =
          current.textStyle ||
          {};

        if (
          device ===
          'mobile'
        ) {
          const currentMobileStyle =
            (
              (
                currentStyle as any
              ).mobile ||
              {}
            ) as
              Record<
                string,
                unknown
              >;

          return {
            ...current,
            textStyle: {
              ...currentStyle,
              mobile: {
                ...currentMobileStyle,
                ...next,
              },
            } as any,
          } as
            SceneElement;
        }

        return {
          ...current,
          textStyle: {
            ...currentStyle,
            ...next,
          },
        } as
          SceneElement;
      }
    );

`;

        return (
          header +
          body
        );
      },
      'TextControls'
    );

  source =
    replaceBlock(
      source,
      'const ButtonControls:',
      '\nconst FontPicker:',
      (
        current
      ) => {
        const returnAt =
          current.indexOf(
            '  return ('
          );

        if (
          returnAt < 0
        ) {
          throw new Error(
            'ButtonControls thiếu return'
          );
        }

        let body =
          current.slice(
            returnAt
          );

        body =
          body.replace(
            '          min={6}',
            '          min={1}'
          );

        const header = `const ButtonControls:
React.FC<{
  element:
    Extract<
      SceneElement,
      {
        type:
          'button';
      }
    >;

  device:
    DeviceMode;

  onChange: (
    updater: (
      element:
        SceneElement
    ) =>
      SceneElement
  ) => void;
}> = ({
  element,
  device,
  onChange,
}) => {
  const desktopStyle =
    element.buttonStyle ||
    {};

  const mobileStyle =
    (
      (
        desktopStyle as any
      ).mobile ||
      {}
    ) as
      typeof desktopStyle;

  const style =
    device ===
    'mobile'
      ? {
          ...desktopStyle,
          ...mobileStyle,
        }
      : desktopStyle;

  const patch = (
    next:
      Record<
        string,
        unknown
      >
  ) =>
    onChange(
      (
        current
      ) => {
        if (
          current.type !==
          'button'
        ) {
          return current;
        }

        const currentStyle =
          current.buttonStyle ||
          {};

        if (
          device ===
          'mobile'
        ) {
          const currentMobileStyle =
            (
              (
                currentStyle as any
              ).mobile ||
              {}
            ) as
              Record<
                string,
                unknown
              >;

          return {
            ...current,
            buttonStyle: {
              ...currentStyle,
              mobile: {
                ...currentMobileStyle,
                ...next,
              },
            } as any,
          } as
            SceneElement;
        }

        return {
          ...current,
          buttonStyle: {
            ...currentStyle,
            ...next,
          },
        } as
          SceneElement;
      }
    );

`;

        return (
          header +
          body
        );
      },
      'ButtonControls'
    );

  write(
    files.inspector,
    source
  );
}

// ------------------------------------------------------------
// 3) Admin canvas: preview đúng typography của device đang chọn.
// ------------------------------------------------------------
{
  let source =
    read(
      files.canvas
    );

  source =
    replaceOnce(
      source,
      `<EditorElementContent
          element={
            element
          }
        />`,
      `<EditorElementContent
          element={
            element
          }
          device={
            device
          }
        />`,
      'EditorElementContent device prop'
    );

  source =
    replaceOnce(
      source,
      `const EditorElementContent:
React.FC<{
  element:
    SceneElement;
}> = ({
  element,
}) => {`,
      `const EditorElementContent:
React.FC<{
  element:
    SceneElement;

  device:
    DeviceMode;
}> = ({
  element,
  device,
}) => {`,
      'EditorElementContent props'
    );

  source =
    replaceOnce(
      source,
      `    const style =
      element.textStyle ||
      {};`,
      `    const desktopStyle =
      element.textStyle ||
      {};

    const mobileStyle =
      (
        (
          desktopStyle as any
        ).mobile ||
        {}
      ) as
        typeof desktopStyle;

    const style =
      device ===
      'mobile'
        ? {
            ...desktopStyle,
            ...mobileStyle,
          }
        : desktopStyle;`,
      'EditorCanvas text style'
    );

  source =
    replaceOnce(
      source,
      `    const style =
      element
        .buttonStyle ||
      {};`,
      `    const desktopStyle =
      element
        .buttonStyle ||
      {};

    const mobileStyle =
      (
        (
          desktopStyle as any
        ).mobile ||
        {}
      ) as
        typeof desktopStyle;

    const style =
      device ===
      'mobile'
        ? {
            ...desktopStyle,
            ...mobileStyle,
          }
        : desktopStyle;`,
      'EditorCanvas button style'
    );

  write(
    files.canvas,
    source
  );
}

// ------------------------------------------------------------
// 4) Public runtime: khách PC dùng desktop style,
// khách Mobile merge thêm override mobile.
// ------------------------------------------------------------
{
  let source =
    read(
      files.runtime
    );

  source =
    replaceOnce(
      source,
      `        const style =
          element.textStyle ||
          {};`,
      `        const desktopStyle =
          element.textStyle ||
          {};

        const mobileStyle =
          (
            (
              desktopStyle as any
            ).mobile ||
            {}
          ) as
            typeof desktopStyle;

        const style =
          mobile
            ? {
                ...desktopStyle,
                ...mobileStyle,
              }
            : desktopStyle;`,
      'SceneElementView text style'
    );

  source =
    replaceOnce(
      source,
      `        const style =
          element.buttonStyle ||
          {};`,
      `        const desktopStyle =
          element.buttonStyle ||
          {};

        const mobileStyle =
          (
            (
              desktopStyle as any
            ).mobile ||
            {}
          ) as
            typeof desktopStyle;

        const style =
          mobile
            ? {
                ...desktopStyle,
                ...mobileStyle,
              }
            : desktopStyle;`,
      'SceneElementView button style'
    );

  write(
    files.runtime,
    source
  );
}

console.log(
  [
    'OK: PC/Mobile typography đã tách riêng.',
    'OK: NumberInput cho phép xóa/gõ số mới tự nhiên.',
    'OK: Font size cho text/button cho phép từ 1px.',
  ].join('\n')
);
