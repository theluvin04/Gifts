import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Copy,
  Check,
  Share2,
  Sparkles,
  ExternalLink,
  QrCode,
  Heart,
  Loader2,
} from 'lucide-react';
import { LoveConfig } from '../types';
import { saveGiftToFirestore } from '../services/giftService';

interface ShareGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LoveConfig;
  onViewGift?: (giftId: string) => void;
}

export const ShareGiftModal: React.FC<ShareGiftModalProps> = ({
  isOpen,
  onClose,
  config,
  onViewGift,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [giftId, setGiftId] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [showQr, setShowQr] = useState(false);

  const handlePublish = async () => {
    setIsSaving(true);
    setError('');
    try {
      const res = await saveGiftToFirestore(config, giftId || undefined);
      setGiftId(res.id);
      setShareUrl(res.url);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Có lỗi xảy ra khi lưu món quà lên đám mây.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Generate on open if not generated yet
  React.useEffect(() => {
    if (isOpen && !shareUrl && !isSaving) {
      handlePublish();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const qrImageUrl = shareUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=be185d&bgcolor=ffffff&data=${encodeURIComponent(
        shareUrl
      )}`
    : '';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-rose-100 bg-white p-6 shadow-2xl sm:p-8"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 shadow-sm shadow-rose-100">
              <Sparkles className="h-7 w-7 animate-pulse" />
            </div>

            <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Link quà tặng của bạn đã sẵn sàng! 🎁
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
              Món quà từ <span className="font-semibold text-rose-600">{config.couple.senderName || 'Bạn'}</span> gửi đến{' '}
              <span className="font-semibold text-rose-600">{config.couple.receiverName || 'Người ấy'}</span> đã được lưu trữ an toàn trên đám mây.
            </p>
          </div>

          {/* Body */}
          <div className="mt-6">
            {isSaving ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                <p className="mt-3 text-xs font-semibold text-slate-500">
                  Đang khởi tạo liên kết đám mây...
                </p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-xs font-medium text-red-600">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={handlePublish}
                  className="mt-3 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm"
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Link Box */}
                <div className="rounded-2xl border border-rose-100 bg-[#fff9fb] p-3.5 sm:p-4">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                    Đường dẫn chia sẻ trực tiếp
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="w-full bg-transparent text-xs font-medium text-slate-700 outline-none selection:bg-rose-200"
                    />
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-rose-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-rose-100 transition hover:bg-rose-600"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Đã chép!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setShowQr(!showQr)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50/50 hover:text-rose-600"
                  >
                    <QrCode className="h-4 w-4" />
                    {showQr ? 'Ẩn mã QR' : 'Mã QR'}
                  </button>

                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-rose-500"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Mở tab mới
                  </a>
                </div>

                {/* QR Code preview */}
                {showQr && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-[#fff5f8] p-5 text-center"
                  >
                    <div className="overflow-hidden rounded-xl border border-rose-200 bg-white p-2 shadow-sm">
                      <img
                        src={qrImageUrl}
                        alt="QR Code"
                        className="h-36 w-36 object-contain"
                      />
                    </div>
                    <p className="mt-2 text-[11px] font-medium text-slate-500">
                      Quét mã bằng camera điện thoại để mở ngay món quà
                    </p>
                  </motion.div>
                )}

                {/* Instructions */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="flex items-start gap-2.5">
                    <Heart className="mt-0.5 h-4 w-4 shrink-0 fill-rose-400 text-rose-400" />
                    <p className="text-xs leading-relaxed text-slate-600">
                      Gửi link này qua Zalo, Messenger, SMS hoặc thiệp chúc mừng. Người ấy mở link sẽ được trải nghiệm màn cầu hôn và 3 món quà bất ngờ của riêng bạn!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-slate-100 px-6 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-200"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
