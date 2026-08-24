import React, {
  useEffect,
  useState,
} from 'react';

import {
  VisualSceneExperience,
} from '../../../engine';

import type {
  TemplateVisualEditorConfig,
} from '../../../templates/visualEditor';

interface Props {
  config:
    TemplateVisualEditorConfig;

  onClose:
    () => void;

  initialDevice?:
    PreviewDevice;
}

type PreviewDevice =
  | 'desktop'
  | 'mobile';

export const PreviewOverlay:
React.FC<Props> = ({
  config,
  onClose,
  initialDevice =
    'desktop',
}) => {
  const [
    device,
    setDevice,
  ] =
    useState<
      PreviewDevice
    >(
      initialDevice
    );

  const [
    replayKey,
    setReplayKey,
  ] =
    useState(0);

  const [
    ready,
    setReady,
  ] =
    useState(false);

  useEffect(() => {
    setReady(
      false
    );

    const timer =
      window.setTimeout(
        () =>
          setReady(
            true
          ),
        220
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, []);

  useEffect(() => {
    const onKeyDown =
      (
        event:
          KeyboardEvent
      ) => {
        if (
          event.key ===
          'Escape'
        ) {
          onClose();
        }
      };

    window.addEventListener(
      'keydown',
      onKeyDown
    );

    const previousOverflow =
      document.body
        .style
        .overflow;

    document.body
      .style
      .overflow =
      'hidden';

    return () => {
      window.removeEventListener(
        'keydown',
        onKeyDown
      );

      document.body
        .style
        .overflow =
        previousOverflow;
    };
  }, [
    onClose,
  ]);

  const replay =
    () => {
      setReady(
        false
      );

      window.setTimeout(
        () => {
          setReplayKey(
            (
              value
            ) =>
              value +
              1
          );

          setReady(
            true
          );
        },
        80
      );
    };

  return (
    <div className="fixed inset-0 z-[260] flex flex-col bg-[#171717]/95 p-2 sm:p-3">
      <header className="mx-auto flex w-full max-w-[1440px] shrink-0 flex-wrap items-center gap-2 rounded-[12px] bg-white px-3 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
        <div className="mr-auto min-w-0">
          <p className="truncate text-xs font-black">
            Xem thử trang động
          </p>

          <p className="mt-0.5 hidden text-[9px] text-black/35 sm:block">
            Đây là bản chạy thật của hiệu ứng, chuyển trang và thao tác bấm.
          </p>
        </div>

        <div className="flex items-center rounded-[8px] bg-[#f2efef] p-0.5">
          <PreviewToggle
            active={
              device ===
              'desktop'
            }
            label="Máy tính"
            onClick={() => {
              setDevice(
                'desktop'
              );
              replay();
            }}
          />

          <PreviewToggle
            active={
              device ===
              'mobile'
            }
            label="Điện thoại"
            onClick={() => {
              setDevice(
                'mobile'
              );
              replay();
            }}
          />
        </div>

        <button
          type="button"
          onClick={
            replay
          }
          className="rounded-[8px] border border-black/8 bg-white px-3 py-2 text-[9px] font-black text-black/45 hover:text-[#a73551]"
        >
          ↻ Chạy lại
        </button>

        <button
          type="button"
          onClick={
            onClose
          }
          className="rounded-[8px] bg-[#191919] px-3 py-2 text-[9px] font-black text-white"
        >
          Đóng
        </button>
      </header>

      <div className="mx-auto mt-2 flex min-h-0 w-full max-w-[1440px] flex-1 items-center justify-center overflow-auto rounded-[14px] bg-[#292929] p-3 sm:p-6">
        <div
          className={[
            'relative shrink-0 overflow-hidden bg-white shadow-[0_24px_80px_rgba(0,0,0,0.4)] transition-all duration-200',
            device ===
            'mobile'
              ? 'w-[min(390px,92vw)] rounded-[26px] border-[8px] border-black'
              : 'w-[min(1180px,96vw)] rounded-[8px]',
          ].join(' ')}
        >
          {ready ? (
            <VisualSceneExperience
              key={
                `${device}-${replayKey}`
              }
              scenes={
                config.scenes
              }
              initialSceneId={
                config.initialSceneId
              }
              mobileOverride={
                device ===
                'mobile'
              }
            />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center bg-white text-[10px] font-black text-black/25">
              Đang khởi chạy hiệu ứng...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PreviewToggle:
React.FC<{
  active:
    boolean;

  label:
    string;

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
      'rounded-[7px] px-2.5 py-1.5 text-[8px] font-black transition',
      active
        ? 'bg-white text-[#a73551] shadow-sm'
        : 'text-black/35',
    ].join(' ')}
  >
    {label}
  </button>
);
