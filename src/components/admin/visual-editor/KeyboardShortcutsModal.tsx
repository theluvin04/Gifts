import React from 'react';

import {
  KEYBOARD_SHORTCUTS,
} from './useEditorShortcuts';

interface Props {
  onClose:
    () => void;
}

export const KeyboardShortcutsModal:
React.FC<Props> = ({
  onClose,
}) => (
  <div
    className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4"
    onMouseDown={(
      event
    ) => {
      if (
        event.target ===
        event.currentTarget
      ) {
        onClose();
      }
    }}
  >
    <section className="w-full max-w-[620px] overflow-hidden rounded-[20px] bg-white shadow-[0_30px_90px_rgba(0,0,0,0.24)]">
      <header className="flex items-center justify-between border-b border-black/7 px-5 py-4">
        <div>
          <h3 className="text-base font-black">
            Phím tắt trình thiết kế
          </h3>

          <p className="mt-1 text-[10px] text-black/35">
            Ctrl trên Windows · Cmd trên macOS
          </p>
        </div>

        <button
          type="button"
          onClick={
            onClose
          }
          className="rounded-full bg-black px-3 py-2 text-[10px] font-black text-white"
        >
          Đóng
        </button>
      </header>

      <div className="grid max-h-[70vh] gap-x-6 overflow-y-auto p-5 sm:grid-cols-2">
        {KEYBOARD_SHORTCUTS.map(
          ([
            shortcut,
            label,
          ]) => (
            <div
              key={
                shortcut
              }
              className="flex items-center justify-between gap-4 border-b border-black/6 py-2.5"
            >
              <span className="text-[10px] font-semibold text-black/45">
                {label}
              </span>

              <kbd className="rounded-[7px] border border-black/10 bg-[#f7f5f3] px-2 py-1 text-[9px] font-black text-black/60">
                {shortcut}
              </kbd>
            </div>
          )
        )}
      </div>
    </section>
  </div>
);
