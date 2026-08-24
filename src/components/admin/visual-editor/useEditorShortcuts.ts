import {
  useEffect,
} from 'react';

import {
  isTypingTarget,
} from './editorUtils';

export interface EditorShortcutHandlers {
  undo: () => void;
  redo: () => void;
  copy: () => void;
  paste: () => void;
  duplicate: () => void;
  remove: () => void;
  selectAll: () => void;
  clearSelection: () => void;
  group: () => void;
  ungroup: () => void;
  nudge: (
    dx: number,
    dy: number
  ) => void;
  layerForward: () => void;
  layerBackward: () => void;
  layerFront: () => void;
  layerBack: () => void;
  toggleLock: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
  openShortcutHelp: () => void;
}

export const KEYBOARD_SHORTCUTS = [
  ['Ctrl/Cmd + Z', 'Hoàn tác'],
  [
    'Ctrl/Cmd + Shift + Z / Ctrl + Y',
    'Làm lại',
  ],
  ['Ctrl/Cmd + C', 'Sao chép'],
  ['Ctrl/Cmd + V', 'Dán'],
  ['Ctrl/Cmd + D', 'Nhân bản'],
  ['Delete / Backspace', 'Xóa'],
  ['Ctrl/Cmd + A', 'Chọn tất cả'],
  ['Ctrl/Cmd + G', 'Nhóm'],
  ['Ctrl/Cmd + Shift + G', 'Bỏ nhóm'],
  ['Phím mũi tên', 'Di chuyển 0.5%'],
  ['Shift + mũi tên', 'Di chuyển 2%'],
  [']', 'Đưa lên 1 lớp'],
  ['[', 'Đưa xuống 1 lớp'],
  ['Shift + ]', 'Đưa lên trên cùng'],
  ['Shift + [', 'Đưa xuống dưới cùng'],
  ['L', 'Khóa / mở khóa'],
  ['Esc', 'Bỏ chọn'],
  ['Ctrl/Cmd + +', 'Phóng to'],
  ['Ctrl/Cmd + -', 'Thu nhỏ'],
  ['Ctrl/Cmd + 0', 'Đưa độ phóng về 100%'],
  ['?', 'Mở bảng phím tắt'],
] as const;

interface Options
extends EditorShortcutHandlers {
  enabled?: boolean;
}

export const useEditorShortcuts =
  ({
    enabled = true,
    ...handlers
  }: Options) => {
    useEffect(() => {
      if (!enabled) {
        return;
      }

      const onKeyDown =
        (
          event:
            KeyboardEvent
        ) => {
          const typing =
            isTypingTarget(
              event.target
            );

          const command =
            event.metaKey ||
            event.ctrlKey;

          const key =
            event.key;

          const lower =
            key.toLowerCase();

          if (
            command &&
            lower ===
              'z'
          ) {
            event.preventDefault();

            if (
              event.shiftKey
            ) {
              handlers.redo();
            } else {
              handlers.undo();
            }

            return;
          }

          if (
            command &&
            lower ===
              'y'
          ) {
            event.preventDefault();
            handlers.redo();
            return;
          }

          if (typing) {
            return;
          }

          if (
            command &&
            lower ===
              'c'
          ) {
            event.preventDefault();
            handlers.copy();
            return;
          }

          if (
            command &&
            lower ===
              'v'
          ) {
            event.preventDefault();
            handlers.paste();
            return;
          }

          if (
            command &&
            lower ===
              'd'
          ) {
            event.preventDefault();
            handlers.duplicate();
            return;
          }

          if (
            command &&
            lower ===
              'a'
          ) {
            event.preventDefault();
            handlers.selectAll();
            return;
          }

          if (
            command &&
            lower ===
              'g'
          ) {
            event.preventDefault();

            if (
              event.shiftKey
            ) {
              handlers.ungroup();
            } else {
              handlers.group();
            }

            return;
          }

          if (
            command &&
            (
              key ===
                '+' ||
              key ===
                '='
            )
          ) {
            event.preventDefault();
            handlers.zoomIn();
            return;
          }

          if (
            command &&
            key ===
              '-'
          ) {
            event.preventDefault();
            handlers.zoomOut();
            return;
          }

          if (
            command &&
            key ===
              '0'
          ) {
            event.preventDefault();
            handlers.zoomReset();
            return;
          }

          if (
            key ===
              'Delete' ||
            key ===
              'Backspace'
          ) {
            event.preventDefault();
            handlers.remove();
            return;
          }

          if (
            key ===
            'Escape'
          ) {
            handlers.clearSelection();
            return;
          }

          if (
            key ===
              '?' ||
            (
              event.shiftKey &&
              key ===
              '/'
            )
          ) {
            event.preventDefault();
            handlers.openShortcutHelp();
            return;
          }

          if (
            lower ===
            'l'
          ) {
            event.preventDefault();
            handlers.toggleLock();
            return;
          }

          const step =
            event.shiftKey
              ? 2
              : 0.5;

          if (
            key ===
            'ArrowLeft'
          ) {
            event.preventDefault();
            handlers.nudge(
              -step,
              0
            );
            return;
          }

          if (
            key ===
            'ArrowRight'
          ) {
            event.preventDefault();
            handlers.nudge(
              step,
              0
            );
            return;
          }

          if (
            key ===
            'ArrowUp'
          ) {
            event.preventDefault();
            handlers.nudge(
              0,
              -step
            );
            return;
          }

          if (
            key ===
            'ArrowDown'
          ) {
            event.preventDefault();
            handlers.nudge(
              0,
              step
            );
            return;
          }

          if (
            key ===
            ']'
          ) {
            event.preventDefault();

            if (
              event.shiftKey
            ) {
              handlers.layerFront();
            } else {
              handlers.layerForward();
            }

            return;
          }

          if (
            key ===
            '['
          ) {
            event.preventDefault();

            if (
              event.shiftKey
            ) {
              handlers.layerBack();
            } else {
              handlers.layerBackward();
            }
          }
        };

      window.addEventListener(
        'keydown',
        onKeyDown
      );

      return () =>
        window.removeEventListener(
          'keydown',
          onKeyDown
        );
    }, [
      enabled,
      handlers,
    ]);
  };
