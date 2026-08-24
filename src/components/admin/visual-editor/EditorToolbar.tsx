import React from 'react';

import type {
  AlignAction,
  LayerAction,
} from './editorUtils';

interface Props {
  selectionCount: number;
  groupedSelection:
    boolean;
  canUndo: boolean;
  canRedo: boolean;
  gridEnabled: boolean;
  snapEnabled: boolean;
  zoom: number;

  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  onAlign: (
    action:
      AlignAction
  ) => void;
  onLayer: (
    action:
      LayerAction
  ) => void;
  onToggleLock: () => void;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onZoomChange: (
    zoom: number
  ) => void;
  onOpenShortcuts: () => void;
}

export const EditorToolbar:
React.FC<Props> = ({
  selectionCount,
  groupedSelection,
  canUndo,
  canRedo,
  gridEnabled,
  snapEnabled,
  zoom,
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  onDuplicate,
  onDelete,
  onGroup,
  onUngroup,
  onAlign,
  onLayer,
  onToggleLock,
  onToggleGrid,
  onToggleSnap,
  onZoomChange,
  onOpenShortcuts,
}) => {
  const hasSelection =
    selectionCount >
    0;

  const multi =
    selectionCount >
    1;

  return (
    <div className="sticky top-2 z-30 mt-2 flex min-w-0 flex-wrap items-center gap-1 rounded-[10px] border border-black/8 bg-white/95 p-1.5 shadow-[0_8px_24px_rgba(20,20,20,0.06)] backdrop-blur-xl">
      <ToolButton
        label="↶"
        title="Undo · Ctrl/Cmd+Z"
        disabled={
          !canUndo
        }
        onClick={
          onUndo
        }
      />

      <ToolButton
        label="↷"
        title="Redo · Ctrl/Cmd+Shift+Z"
        disabled={
          !canRedo
        }
        onClick={
          onRedo
        }
      />

      <Divider />

      <ToolButton
        label="Copy"
        title="Copy · Ctrl/Cmd+C"
        disabled={
          !hasSelection
        }
        onClick={
          onCopy
        }
      />

      <ToolButton
        label="Paste"
        title="Paste · Ctrl/Cmd+V"
        onClick={
          onPaste
        }
      />

      <ToolButton
        label="Duplicate"
        title="Duplicate · Ctrl/Cmd+D"
        disabled={
          !hasSelection
        }
        onClick={
          onDuplicate
        }
      />

      <ToolButton
        label="Delete"
        title="Delete / Backspace"
        danger
        disabled={
          !hasSelection
        }
        onClick={
          onDelete
        }
      />

      <Divider />

      <ToolButton
        label={
          groupedSelection
            ? 'Ungroup'
            : 'Group'
        }
        title={
          groupedSelection
            ? 'Ungroup · Ctrl/Cmd+Shift+G'
            : 'Group · Ctrl/Cmd+G'
        }
        disabled={
          groupedSelection
            ? !hasSelection
            : !multi
        }
        onClick={
          groupedSelection
            ? onUngroup
            : onGroup
        }
      />

      <ToolButton
        label="Lock"
        title="Khóa / mở khóa · L"
        disabled={
          !hasSelection
        }
        onClick={
          onToggleLock
        }
      />

      <Divider />

      <CompactSelect
        label="Căn"
        disabled={
          !multi
        }
        options={[
          ['left', 'Trái'],
          ['center-x', 'Giữa ngang'],
          ['right', 'Phải'],
          ['top', 'Trên'],
          ['center-y', 'Giữa dọc'],
          ['bottom', 'Dưới'],
          ['distribute-x', 'Chia đều ngang'],
          ['distribute-y', 'Chia đều dọc'],
        ]}
        onChange={(
          value
        ) =>
          onAlign(
            value as
              AlignAction
          )
        }
      />

      <CompactSelect
        label="Layer"
        disabled={
          !hasSelection
        }
        options={[
          ['forward', 'Lên 1 lớp ]'],
          ['backward', 'Xuống 1 lớp ['],
          ['front', 'Lên trên cùng'],
          ['back', 'Xuống dưới cùng'],
        ]}
        onChange={(
          value
        ) =>
          onLayer(
            value as
              LayerAction
          )
        }
      />

      <Divider />

      <ToggleButton
        label="Grid"
        active={
          gridEnabled
        }
        onClick={
          onToggleGrid
        }
      />

      <ToggleButton
        label="Snap"
        active={
          snapEnabled
        }
        onClick={
          onToggleSnap
        }
      />

      <Divider />

      <ToolButton
        label="−"
        title="Zoom out · Ctrl/Cmd+-"
        onClick={() =>
          onZoomChange(
            Math.max(
              25,
              zoom -
                10
            )
          )
        }
      />

      <span className="min-w-[46px] text-center text-[9px] font-black text-black/45">
        {zoom}%
      </span>

      <ToolButton
        label="+"
        title="Zoom in · Ctrl/Cmd++"
        onClick={() =>
          onZoomChange(
            Math.min(
              200,
              zoom +
                10
            )
          )
        }
      />

      <ToolButton
        label="100%"
        title="Reset zoom · Ctrl/Cmd+0"
        onClick={() =>
          onZoomChange(
            100
          )
        }
      />

      <div className="ml-auto">
        <ToolButton
          label="⌨ Shortcuts"
          title="Phím tắt · ?"
          onClick={
            onOpenShortcuts
          }
        />
      </div>

      {hasSelection && (
        <div className="w-full border-t border-black/6 pt-2 text-[9px] font-semibold text-black/30">
          Đã chọn{' '}
          {selectionCount}{' '}
          element
          {selectionCount >
          1
            ? 's'
            : ''}
          . Shift-click để chọn thêm · kéo vùng trống để chọn nhiều.
        </div>
      )}
    </div>
  );
};

const Divider =
  () => (
    <div className="mx-0.5 h-6 w-px bg-black/8" />
  );

const ToolButton:
React.FC<{
  label: string;
  title?: string;
  disabled?: boolean;
  danger?: boolean;
  onClick:
    () => void;
}> = ({
  label,
  title,
  disabled = false,
  danger = false,
  onClick,
}) => (
  <button
    type="button"
    title={
      title
    }
    disabled={
      disabled
    }
    onClick={
      onClick
    }
    className={[
      'rounded-[8px] border px-2.5 py-2 text-[9px] font-black transition disabled:cursor-not-allowed disabled:opacity-25',
      danger
        ? 'border-red-100 text-red-500 hover:bg-red-50'
        : 'border-black/8 text-black/50 hover:border-[#cf5068]/30 hover:bg-[#faf6f7] hover:text-[#a32c48]',
    ].join(' ')}
  >
    {label}
  </button>
);

const ToggleButton:
React.FC<{
  label: string;
  active: boolean;
  onClick:
    () => void;
}> = ({
  label,
  active,
  onClick,
}) => (
  <button
    type="button"
    onClick={
      onClick
    }
    className={[
      'rounded-[8px] border px-2.5 py-2 text-[9px] font-black transition',
      active
        ? 'border-[#cf5068]/25 bg-[#f8e9ed] text-[#a32c48]'
        : 'border-black/8 text-black/40',
    ].join(' ')}
  >
    {label}
  </button>
);

const CompactSelect:
React.FC<{
  label: string;
  disabled?: boolean;
  options:
    Array<
      [
        string,
        string,
      ]
    >;
  onChange: (
    value: string
  ) => void;
}> = ({
  label,
  disabled = false,
  options,
  onChange,
}) => (
  <select
    value=""
    disabled={
      disabled
    }
    onChange={(
      event
    ) => {
      if (
        event.target
          .value
      ) {
        onChange(
          event.target
            .value
        );
      }

      event.target
        .value =
        '';
    }}
    className="rounded-[8px] border border-black/8 bg-white px-2 py-2 text-[9px] font-black text-black/45 outline-none disabled:opacity-25"
  >
    <option value="">
      {label}
    </option>

    {options.map(
      ([
        value,
        optionLabel,
      ]) => (
        <option
          key={
            value
          }
          value={
            value
          }
        >
          {optionLabel}
        </option>
      )
    )}
  </select>
);
