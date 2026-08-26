import React, { useCallback, useEffect, useState } from 'react';

import type { TemplateConfig } from '../../services/templateService';
import { createTemplatePreviewLink } from '../../services/templatePreviewService';
import { DEFAULT_LOVE_VISUAL_EDITOR_CONFIG } from '../../templates/visualEditor';

type PreviewDevice = 'desktop' | 'mobile';

interface Props {
  template: TemplateConfig;
  onClose: () => void;
}

export const PreviewLinkOverlay: React.FC<Props> = ({ template, onClose }) => {
  const [url, setUrl] = useState('');
  const [device, setDevice] = useState<PreviewDevice>('mobile');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState('');

  const generate = useCallback(async () => {
    setLoading(true);
    setError('');
    setCopied(false);

    try {
      const result = await createTemplatePreviewLink({
        templateId: template.id,
        templateName: template.name,
        config:
          template.visualEditor ||
          DEFAULT_LOVE_VISUAL_EDITOR_CONFIG,
      });

      setUrl(result.url);
      setRefreshKey((current) => current + 1);
    } catch (previewError: any) {
      setError(
        previewError?.message ||
          'Không tạo được link test.'
      );
    } finally {
      setLoading(false);
    }
  }, [template]);

  useEffect(() => {
    void generate();
  }, [generate]);

  const copyLink = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
  };

  const shareLink = async () => {
    if (!url) return;

    if (navigator.share) {
      await navigator.share({
        title: `Test ${template.name}`,
        url,
      });
      return;
    }

    await copyLink();
  };

  return (
    <div className="fixed inset-0 z-[280] flex flex-col bg-[#171717]/96 p-2 sm:p-3">
      <header className="mx-auto flex w-full max-w-[1480px] shrink-0 flex-col gap-3 rounded-[14px] bg-white p-3 shadow-[0_15px_50px_rgba(0,0,0,0.28)] xl:flex-row xl:items-center">
        <div className="min-w-0 xl:w-[260px]">
          <p className="truncate text-xs font-black">
            Link test · {template.name}
          </p>
          <p className="mt-0.5 text-[9px] text-black/35">
            Tự lấy đúng bản thiết kế đang làm.
          </p>
        </div>

        <div className="flex min-w-0 flex-1 gap-2">
          <input
            readOnly
            value={loading ? 'Đang tạo link test...' : url}
            className="min-h-10 min-w-0 flex-1 rounded-[10px] border border-black/10 bg-[#faf9f8] px-3 text-[10px] font-semibold text-black/55 outline-none"
          />
          <button
            type="button"
            disabled={!url || loading}
            onClick={() => void copyLink()}
            className="shrink-0 rounded-[10px] border border-black/10 px-3 text-[9px] font-black text-black/55 disabled:opacity-35"
          >
            {copied ? 'Đã chép ✓' : 'Chép link'}
          </button>
          <button
            type="button"
            disabled={!url || loading}
            onClick={() => void shareLink()}
            className="shrink-0 rounded-[10px] bg-[#cf5068] px-3 text-[9px] font-black text-white disabled:opacity-35"
          >
            Gửi sang điện thoại
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-[9px] bg-[#f1eeee] p-1">
            {(['mobile', 'desktop'] as PreviewDevice[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDevice(item)}
                className={[
                  'rounded-[7px] px-3 py-2 text-[9px] font-black',
                  device === item
                    ? 'bg-white text-[#a73551] shadow-sm'
                    : 'text-black/35',
                ].join(' ')}
              >
                {item === 'mobile' ? 'Điện thoại' : 'Máy tính'}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => void generate()}
            className="rounded-[9px] border border-black/10 px-3 py-2 text-[9px] font-black text-black/50 disabled:opacity-35"
          >
            Đồng bộ link
          </button>

          {url && (
            <button
              type="button"
              onClick={() =>
                window.open(url, '_blank', 'noopener,noreferrer')
              }
              className="rounded-[9px] border border-black/10 px-3 py-2 text-[9px] font-black text-black/50"
            >
              Mở tab ↗
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="rounded-[9px] bg-[#191919] px-3 py-2 text-[9px] font-black text-white"
          >
            Đóng
          </button>
        </div>
      </header>

      {error && (
        <p className="mx-auto mt-2 w-full max-w-[1480px] rounded-[10px] bg-red-50 px-3 py-2 text-[10px] font-bold text-red-600">
          {error}
        </p>
      )}

      {url && (
        <p className="mx-auto mt-2 w-full max-w-[1480px] text-center text-[9px] font-semibold text-white/40">
          Đây là link cố định của mẫu. Sau khi chỉnh, bấm “Đồng bộ link”; đường dẫn không thay đổi.
        </p>
      )}

      <main className="mx-auto mt-2 flex min-h-0 w-full max-w-[1480px] flex-1 items-start justify-center overflow-auto rounded-[16px] bg-[#2b2b2b] p-3 sm:p-5">
        {loading ? (
          <div className="m-auto text-xs font-black text-white/55">
            Đang xuất bản test...
          </div>
        ) : url ? (
          <div
            className={[
              'relative shrink-0 overflow-hidden bg-white shadow-[0_25px_90px_rgba(0,0,0,0.45)] transition-[width,border-radius] duration-200',
              device === 'mobile'
                ? 'h-[min(780px,calc(100svh-165px))] w-[min(390px,94vw)] rounded-[28px] border-[8px] border-black'
                : 'h-[min(800px,calc(100svh-165px))] w-[min(1200px,96vw)] rounded-[8px]',
            ].join(' ')}
          >
            <iframe
              key={`${url}-${refreshKey}`}
              src={url}
              title="Bản test template"
              className="h-full w-full border-0 bg-white"
              allow="autoplay; clipboard-write; fullscreen"
            />
          </div>
        ) : null}
      </main>
    </div>
  );
};
