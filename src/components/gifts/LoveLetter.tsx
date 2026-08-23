import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Heart, ChevronLeft, Sparkles, Send, Stamp, CheckCircle2 } from 'lucide-react';
import { LoveConfig } from '../../types';
import { sfx } from '../../utils/soundEffects';
import { triggerLoveConfetti } from '../../utils/confetti';

interface LoveLetterProps {
  letterData: LoveConfig['gifts']['gift3']['letter'];
  senderName: string;
  receiverName: string;
  onBack: () => void;
}

export const LoveLetter: React.FC<LoveLetterProps> = ({
  letterData,
  senderName,
  receiverName,
  onBack,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [kissCount, setKissCount] = useState(0);
  const [showKissToast, setShowKissToast] = useState(false);

  const handleOpenEnvelope = () => {
    if (isOpen) return;
    sfx.playLetterOpen();
    setIsOpen(true);
    triggerLoveConfetti();
  };

  const handleSendKiss = () => {
    sfx.playSuccessChime();
    triggerLoveConfetti();
    setKissCount((prev) => prev + 1);
    setShowKissToast(true);
    setTimeout(() => setShowKissToast(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="relative z-10 w-full max-w-3xl mx-auto px-4 py-6 flex flex-col items-center min-h-[85vh]"
      id="love-letter-view"
    >
      {/* Top Back Navigation */}
      <div className="w-full flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-rose-700 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-rose-200 hover:bg-rose-50 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quay lại 3 món quà</span>
        </button>

        {isOpen && (
          <button
            onClick={() => setIsOpen(false)}
            className="text-xs font-semibold text-rose-600 bg-white/80 px-3 py-1.5 rounded-full border border-rose-200 hover:bg-rose-50 transition cursor-pointer"
          >
            Đóng thư lại
          </button>
        )}
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 text-xs font-bold text-rose-600 bg-rose-100/90 rounded-full border border-rose-200 mb-2">
          <Mail className="w-3.5 h-3.5" />
          <span>MÓN QUÀ SỐ 3</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 font-heading">
          Bức Thư Tay Gửi Cậu 💌
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          {isOpen ? "Những lời tâm sự từ tận đáy trái tim" : "Chạm vào dấu niêm phong để mở bức thư bí mật"}
        </p>
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-xl flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!isOpen ? (
            /* ENVELOPE CLOSED VIEW */
            <motion.div
              key="closed-envelope"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={handleOpenEnvelope}
              className="relative w-full max-w-md aspect-[16/11] bg-gradient-to-br from-rose-100 via-pink-100 to-rose-200 rounded-2xl shadow-2xl border-2 border-rose-300 flex flex-col items-center justify-center cursor-pointer group hover:scale-[1.02] transition-transform duration-300 p-6 overflow-hidden select-none"
            >
              {/* Envelope Flap Lines */}
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <polygon points="0,0 50,48 100,0" fill="rgba(244, 63, 94, 0.08)" stroke="rgba(244, 63, 94, 0.25)" strokeWidth="0.8" />
                  <polygon points="0,100 50,50 100,100" fill="rgba(244, 63, 94, 0.05)" stroke="rgba(244, 63, 94, 0.2)" strokeWidth="0.8" />
                </svg>
              </div>

              {/* Stamp in Top Right */}
              <div className="absolute top-4 right-4 w-12 h-14 bg-white/90 border-2 border-dashed border-rose-400 rounded-md shadow-sm flex flex-col items-center justify-center p-1 rotate-3">
                <Stamp className="w-4 h-4 text-rose-500 mb-0.5" />
                <span className="text-[9px] font-bold text-rose-600">LOVE</span>
              </div>

              {/* Front Label */}
              <div className="relative z-10 text-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-rose-200 shadow-sm max-w-[220px]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Người nhận</p>
                <p className="font-handwriting text-2xl text-slate-800 font-bold truncate">{receiverName}</p>
              </div>

              {/* Red Wax Seal Button */}
              <motion.div
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(225, 29, 72, 0.4)',
                    '0 0 0 14px rgba(225, 29, 72, 0)',
                  ],
                }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                className="relative z-20 mt-4 w-16 h-16 rounded-full bg-gradient-to-br from-rose-600 via-red-600 to-rose-800 shadow-xl border-2 border-rose-400/60 flex items-center justify-center text-white"
              >
                <Heart className="w-8 h-8 fill-rose-100 text-rose-100 drop-shadow" />
              </motion.div>

              <p className="mt-4 text-xs font-semibold text-rose-600 tracking-wide flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                <span>Nhấn để mở thư</span>
              </p>
            </motion.div>
          ) : (
            /* OPENED LETTER STATIONERY VIEW */
            <motion.div
              key="opened-letter"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="relative w-full bg-[#fdfbf7] rounded-2xl p-6 sm:p-10 shadow-2xl border-2 border-amber-200/80 overflow-hidden"
              style={{
                backgroundImage: 'radial-gradient(#f0e6d2 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            >
              {/* Vintage Corner Ornaments */}
              <div className="absolute top-3 left-3 text-rose-300/40 text-xl font-serif">❦</div>
              <div className="absolute top-3 right-3 text-rose-300/40 text-xl font-serif">❦</div>
              <div className="absolute bottom-3 left-3 text-rose-300/40 text-xl font-serif">❦</div>
              <div className="absolute bottom-3 right-3 text-rose-300/40 text-xl font-serif">❦</div>

              {/* Salutation */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6 border-b border-rose-200/60 pb-3"
              >
                <h3 className="font-handwriting text-3xl sm:text-4xl text-rose-800 font-bold">
                  {letterData.salutation || `Gửi ${receiverName},`}
                </h3>
              </motion.div>

              {/* Letter Paragraphs */}
              <div className="space-y-4 text-slate-800 font-handwriting text-2xl sm:text-3xl leading-relaxed sm:leading-loose">
                {letterData.paragraphs.map((p, idx) => (
                  <motion.p
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.15 }}
                  >
                    {p}
                  </motion.p>
                ))}
              </div>

              {/* Closing and Signature */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mt-8 pt-6 border-t border-rose-200/60 flex flex-col items-end text-right"
              >
                <p className="font-handwriting text-2xl text-slate-600">
                  {letterData.closing}
                </p>
                <p className="font-handwriting text-3xl sm:text-4xl text-rose-700 font-bold mt-1">
                  {senderName || letterData.signature}
                </p>
                <p className="text-xs font-semibold text-rose-500 mt-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{letterData.date}</span>
                </p>
              </motion.div>

              {/* Interactive Heart / Kiss Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="mt-8 pt-6 border-t border-rose-200/60 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <p className="text-xs text-slate-500 font-medium">
                  Đã gửi: <span className="font-bold text-rose-600">{kissCount}</span> nụ hôn yêu thương
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendKiss}
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-sm rounded-full shadow-lg shadow-rose-500/30 flex items-center gap-2 cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Gửi thêm nụ hôn 💋</span>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating kiss feedback popup */}
      <AnimatePresence>
        {showKissToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-6 z-50 px-5 py-2.5 bg-rose-600 text-white font-bold text-sm rounded-full shadow-2xl flex items-center gap-2 border border-rose-400"
          >
            <CheckCircle2 className="w-4 h-4 text-rose-200" />
            <span>Đã gửi ngàn nụ hôn ngọt ngào đến cậu! 💕</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
