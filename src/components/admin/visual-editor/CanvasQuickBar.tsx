import React from 'react';

import type {
  CanvasAlignAction,
  LayerAction,
} from './editorUtils';

interface Props {
  selectionCount:
    number;

  onAlignCanvas: (
    action:
      CanvasAlignAction
  ) => void;

  onRotate: (
    action:
      'left' |
      'reset' |
      'right'
  ) => void;

  onLayer: (
    action:
      LayerAction
  ) => void;

  onDuplicate:
    () => void;

  onToggleLock:
    () => void;

  groupedSelection:
    boolean;

  onToggleGroup:
    () => void;

  onDelete:
    () => void;
}

export const CanvasQuickBar:
React.FC<Props> = ({
  selectionCount,
  onAlignCanvas,
  onRotate,
  onLayer,
  onDuplicate,
  onToggleLock,
  groupedSelection,
  onToggleGroup,
  onDelete,
}) => {
  if (
    selectionCount ===
    0
  ) {
    return (
      <div className="mt-2 rounded-[10px] border border-black/7 bg-white px-3 py-2 text-center text-[9px] font-semibold text-black/30">
        Chọn một hoặc nhiều đối tượng để căn nhanh theo khung vẽ.
      </div>
    );
  }

  return (
    <div className="sticky bottom-2 z-20 mt-2 flex min-w-0 flex-nowrap items-center justify-start gap-1 overflow-x-auto rounded-[11px] border border-black/10 bg-white/95 p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl">
      <span className="mr-1 hidden text-[8px] font-black uppercase tracking-[0.12em] text-black/25 sm:inline">
        Căn nhanh
      </span>

      <QuickButton
        label="Trái"
        title="Căn sát trái khung vẽ"
        onClick={() =>
          onAlignCanvas(
            'left'
          )
        }
      />

      <QuickButton
        label="Giữa ngang"
        title="Căn giữa theo chiều ngang"
        strong
        onClick={() =>
          onAlignCanvas(
            'center-x'
          )
        }
      />

      <QuickButton
        label="Phải"
        title="Căn sát phải khung vẽ"
        onClick={() =>
          onAlignCanvas(
            'right'
          )
        }
      />

      <Divider />

      <QuickButton
        label="Trên"
        title="Căn sát trên khung vẽ"
        onClick={() =>
          onAlignCanvas(
            'top'
          )
        }
      />

      <QuickButton
        label="Giữa dọc"
        title="Căn giữa theo chiều dọc"
        strong
        onClick={() =>
          onAlignCanvas(
            'center-y'
          )
        }
      />

      <QuickButton
        label="Dưới"
        title="Căn sát dưới khung vẽ"
        onClick={() =>
          onAlignCanvas(
            'bottom'
          )
        }
      />

      <Divider />

      <QuickButton
        label="↶ 90°"
        title="Xoay trái 90 độ"
        onClick={() =>
          onRotate(
            'left'
          )
        }
      />

      <QuickButton
        label="0°"
        title="Đặt góc xoay về 0 độ"
        onClick={() =>
          onRotate(
            'reset'
          )
        }
      />

      <QuickButton
        label="90° ↷"
        title="Xoay phải 90 độ"
        onClick={() =>
          onRotate(
            'right'
          )
        }
      />

      <Divider />

      <QuickButton
        label="Xuống lớp"
        title="Đưa xuống một lớp"
        onClick={() =>
          onLayer(
            'backward'
          )
        }
      />

      <QuickButton
        label="Lên lớp"
        title="Đưa lên một lớp"
        onClick={() =>
          onLayer(
            'forward'
          )
        }
      />

      <Divider />

      <QuickButton
        label="Nhân bản"
        title="Nhân bản đối tượng đang chọn"
        onClick={
          onDuplicate
        }
      />

      <QuickButton
        label="Khóa"
        title="Khóa hoặc mở khóa đối tượng"
        onClick={
          onToggleLock
        }
      />

      <QuickButton
        label={
          groupedSelection
            ? 'Bỏ nhóm'
            : 'Nhóm'
        }
        title="Nhóm hoặc bỏ nhóm · Ctrl/Cmd+G"
        onClick={
          onToggleGroup
        }
      />

      <QuickButton
        label="Xóa"
        title="Xóa trên thiết bị đang chỉnh"
        danger
        onClick={
          onDelete
        }
      />
    </div>
  );
};

const Divider =
  () => (
    <div className="mx-0.5 hidden h-6 w-px bg-black/8 sm:block" />
  );

const QuickButton:
React.FC<{
  label:
    string;

  title:
    string;

  strong?:
    boolean;

  danger?:
    boolean;

  onClick:
    () => void;
}> = ({
  label,
  title,
  strong = false,
  danger = false,
  onClick,
}) => (
  <button
    type="button"
    title={
      title
    }
    onClick={
      onClick
    }
    className={[
      'shrink-0 rounded-[8px] border px-2.5 py-2 text-[8px] font-black transition',
      danger
        ? 'border-red-100 bg-red-50 text-red-600 hover:bg-red-100'
        : strong
        ? 'border-[#cf5068]/25 bg-[#fff5f7] text-[#a73551] hover:bg-[#f8e9ed]'
        : 'border-black/8 bg-white text-black/45 hover:border-[#cf5068]/25 hover:text-[#a73551]',
    ].join(' ')}
  >
    {label}
  </button>
);
