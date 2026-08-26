import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  clamp,
} from './editorUtils';

export const InspectorTitle:
React.FC<{
  title: string;
  description: string;
}> = ({
  title,
  description,
}) => (
  <div>
    <p className="truncate text-sm font-black">
      {title}
    </p>

    <p className="mt-1 text-[9px] text-black/30">
      {description}
    </p>
  </div>
);

export const InspectorSection:
React.FC<{
  title: string;
  children:
    React.ReactNode;
}> = ({
  title,
  children,
}) => (
  <div className="mt-4 border-t border-black/7 pt-4">
    <p className="mb-3 text-[9px] font-black uppercase tracking-[0.12em] text-black/30">
      {title}
    </p>

    <div className="space-y-3">
      {children}
    </div>
  </div>
);

export const AddElementButton:
React.FC<{
  label: string;
  onClick:
    () => void;
}> = ({
  label,
  onClick,
}) => (
  <button
    type="button"
    onClick={
      onClick
    }
    className="rounded-[9px] border border-black/10 bg-white px-3 py-2 text-[10px] font-bold text-black/55 hover:border-[#cf5068]/35 hover:text-[#b83e57]"
  >
    {label}
  </button>
);

export const TogglePill:
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
      'rounded-full px-3 py-2 text-[10px] font-bold',
      active
        ? 'bg-[#f5ebed] text-[#b83e57]'
        : 'bg-[#f4f1f1] text-black/40',
    ].join(' ')}
  >
    {label}
  </button>
);

export const SmallButton:
React.FC<{
  label: string;
  onClick:
    () => void;
  danger?: boolean;
}> = ({
  label,
  onClick,
  danger = false,
}) => (
  <button
    type="button"
    onClick={
      onClick
    }
    className={[
      'rounded-[8px] border px-2 py-1.5 text-[9px] font-bold',
      danger
        ? 'border-red-100 text-red-500'
        : 'border-black/10 text-black/45',
    ].join(' ')}
  >
    {label}
  </button>
);

export const TextInput:
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
      value={value}
      placeholder={
        placeholder
      }
      onChange={(
        event
      ) =>
        onChange(
          event.target.value
        )
      }
      className="w-full min-w-0 rounded-[8px] border border-black/10 bg-[#faf9f8] px-2.5 py-2 text-[10px] outline-none focus:border-[#cf5068]"
    />
  </label>
);

export const TextAreaInput:
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

    <textarea
      value={value}
      rows={3}
      onChange={(
        event
      ) =>
        onChange(
          event.target.value
        )
      }
      className="w-full resize-y rounded-[8px] border border-black/10 bg-[#faf9f8] px-2.5 py-2 text-[10px] leading-5 outline-none focus:border-[#cf5068]"
    />
  </label>
);

export const SelectInput:
React.FC<{
  label: string;
  value: string;
  options:
    Array<{
      value: string;
      label: string;
    }>;
  onChange: (
    value: string
  ) => void;
}> = ({
  label,
  value,
  options,
  onChange,
}) => (
  <label className="block">
    <span className="mb-1 block text-[9px] font-bold text-black/40">
      {label}
    </span>

    <select
      value={value}
      onChange={(
        event
      ) =>
        onChange(
          event.target.value
        )
      }
      className="w-full min-w-0 rounded-[8px] border border-black/10 bg-[#faf9f8] px-2.5 py-2 text-[10px] outline-none"
    >
      {options.map(
        (option) => (
          <option
            key={
              option.value
            }
            value={
              option.value
            }
          >
            {option.label}
          </option>
        )
      )}
    </select>
  </label>
);

export const NumberInput:
React.FC<{
  label: string;
  value: number;
  min: number;
  max?: number;
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
      typeof max === 'number'
        ? clamp(
            parsed,
            min,
            max
          )
        : Math.max(
            min,
            parsed
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
      (typeof max !== 'number' ||
        parsed <= max)
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

export const ColorInput:
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
}) => {
  const safeValue =
    /^#[0-9A-Fa-f]{6}$/
      .test(
        value
      )
      ? value
      : '#000000';

  return (
    <label className="block">
      <span className="mb-1 block text-[9px] font-bold text-black/40">
        {label}
      </span>

      <div className="flex items-center gap-2 rounded-[8px] border border-black/10 bg-[#faf9f8] p-1.5">
        <input
          type="color"
          value={
            safeValue
          }
          onChange={(
            event
          ) =>
            onChange(
              event.target
                .value
            )
          }
          className="h-7 w-8 cursor-pointer border-0 bg-transparent p-0"
        />

        <input
          value={value}
          onChange={(
            event
          ) =>
            onChange(
              event.target
                .value
            )
          }
          className="min-w-0 flex-1 bg-transparent font-mono text-[9px] uppercase outline-none"
        />
      </div>
    </label>
  );
};

export const RangeInput:
React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (
    value: number
  ) => void;
}> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
}) => (
  <label className="block">
    <span className="mb-1 flex items-center justify-between text-[9px] font-bold text-black/40">
      <span>
        {label}
      </span>

      <span className="font-mono text-black/25">
        {value.toFixed(
          step <
          1
            ? 2
            : 0
        )}
      </span>
    </span>

    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(
        event
      ) =>
        onChange(
          Number(
            event.target
              .value
          )
        )
      }
      className="w-full accent-[#b83e57]"
    />
  </label>
);
