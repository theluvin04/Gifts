import React, { useState } from 'react';
import {
  motion,
  AnimatePresence,
} from 'motion/react';
import {
  Mail,
  Heart,
  ChevronLeft,
  Sparkles,
  Stamp,
  CheckCircle2,
} from 'lucide-react';
import { LoveConfig } from '../../types';
import { sfx } from '../../utils/soundEffects';

interface LoveLetterProps {
  letterData: LoveConfig['gifts']['gift3']['letter'];
  senderName: string;
  receiverName: string;
  onBack: () => void;
}

export const LoveLetter: React.FC<
  LoveLetterProps
> = ({
  letterData,
  senderName,
  receiverName,
  onBack,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [kissCount, setKissCount] =
    useState(0);
  const [showKissToast, setShowKissToast] =
    useState(false);

  const handleOpenEnvelope = () => {
    if (isOpen) return;

    sfx.playLetterOpen();
    setIsOpen(true);
  };

  const handleSendKiss = () => {
    sfx.playSuccessChime();

    setKissCount((prev) => prev + 1);
    setShowKissToast(true);

    setTimeout(() => {
      setShowKissToast(false);
    }, 2500);
  };

  const handleBack = () => {
    sfx.playPop();
    onBack();
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: 20,
      }}
      className="
        relative z-10
        flex
        min-h-[85vh]
        w-full
        max-w-3xl
        flex-col
        items-center
        mx-auto
        px-4
        py-6
      "
      id="love-letter-view"
    >
      {/* ĐÓNG THƯ - CHỈ HIỆN KHI ĐÃ MỞ */}
      {isOpen && (
        <div className="mb-6 flex w-full justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="
              rounded-full
              border
              border-rose-200
              bg-white/80
              px-3
              py-1.5
              text-xs
              font-semibold
              text-rose-600
            "
          >
            Đóng thư lại
          </button>
        </div>
      )}

      {/* TITLE */}
      <div className="mb-6 text-center">
        <div
          className="
            mb-2
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-rose-200
            bg-rose-100/90
            px-3.5
            py-1
            text-xs
            font-bold
            text-rose-600
          "
        >
          <Mail className="h-3.5 w-3.5" />

          <span>MÓN QUÀ SỐ 3</span>
        </div>

        <h2
          className="
            text-2xl
            font-extrabold
            text-slate-800
            font-heading
            sm:text-4xl
          "
        >
          Bức Thư Tay Gửi Cậu 💌
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          {isOpen
            ? 'Những lời tâm sự từ tận đáy trái tim'
            : 'Chạm vào dấu niêm phong để mở bức thư bí mật'}
        </p>
      </div>

      {/* LETTER CONTAINER */}
      <div className="relative flex w-full max-w-xl flex-col items-center">
        <AnimatePresence mode="wait">
          {!isOpen ? (
            /* CLOSED */
            <motion.div
              key="closed-envelope"
              initial={{
                scale: 0.9,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.9,
                opacity: 0,
              }}
              onClick={handleOpenEnvelope}
              className="
                group
                relative
                flex
                aspect-[16/11]
                w-full
                max-w-md
                cursor-pointer
                select-none
                flex-col
                items-center
                justify-center
                overflow-hidden
                rounded-2xl
                border-2
                border-rose-300
                bg-gradient-to-br
                from-rose-100
                via-pink-100
                to-rose-200
                p-6
                shadow-2xl
                transition-transform
                duration-300
                hover:scale-[1.02]
              "
            >
              {/* ENVELOPE LINES */}
              <div className="pointer-events-none absolute inset-0">
                <svg
                  className="h-full w-full"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                >
                  <polygon
                    points="0,0 50,48 100,0"
                    fill="rgba(244,63,94,0.08)"
                    stroke="rgba(244,63,94,0.25)"
                    strokeWidth="0.8"
                  />

                  <polygon
                    points="0,100 50,50 100,100"
                    fill="rgba(244,63,94,0.05)"
                    stroke="rgba(244,63,94,0.2)"
                    strokeWidth="0.8"
                  />
                </svg>
              </div>

              {/* STAMP */}
              <div
                className="
                  absolute
                  right-4
                  top-4
                  flex
                  h-14
                  w-12
                  rotate-3
                  flex-col
                  items-center
                  justify-center
                  rounded-md
                  border-2
                  border-dashed
                  border-rose-400
                  bg-white/90
                  p-1
                  shadow-sm
                "
              >
                <Stamp className="mb-0.5 h-4 w-4 text-rose-500" />

                <span className="text-[9px] font-bold text-rose-600">
                  LOVE
                </span>
              </div>

              {/* RECEIVER */}
              <div
                className="
                  relative z-10
                  max-w-[220px]
                  rounded-xl
                  border
                  border-rose-200
                  bg-white/80
                  px-4
                  py-2
                  text-center
                  shadow-sm
                  backdrop-blur-sm
                "
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
                  Người nhận
                </p>

                <p className="truncate font-handwriting text-2xl font-bold text-slate-800">
                  {receiverName}
                </p>
              </div>

              {/* WAX SEAL */}
              <motion.div
                whileHover={{
                  scale: 1.15,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(225,29,72,0.4)',
                    '0 0 0 14px rgba(225,29,72,0)',
                  ],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.8,
                }}
                className="
                  relative z-20
                  mt-4
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  border-2
                  border-rose-400/60
                  bg-gradient-to-br
                  from-rose-600
                  via-red-600
                  to-rose-800
                  text-white
                  shadow-xl
                "
              >
                <Heart className="h-8 w-8 fill-rose-100 text-rose-100 drop-shadow" />
              </motion.div>

              <p
                className="
                  mt-4
                  flex
                  items-center
                  gap-1
                  text-xs
                  font-semibold
                  tracking-wide
                  text-rose-600
                "
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />

                <span>Nhấn để mở thư</span>
              </p>
            </motion.div>
          ) : (
            /* OPENED */
            <motion.div
              key="opened-letter"
              initial={{
                scale: 0.8,
                y: 50,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                y: 0,
                opacity: 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 220,
                damping: 20,
              }}
              className="
                relative
                w-full
                overflow-hidden
                rounded-2xl
                border-2
                border-amber-200/80
                bg-[#fdfbf7]
                p-6
                shadow-2xl
                sm:p-10
              "
              style={{
                backgroundImage:
                  'radial-gradient(#f0e6d2 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            >
              {/* ORNAMENTS */}
              <div className="absolute left-3 top-3 font-serif text-xl text-rose-300/40">
                ❦
              </div>

              <div className="absolute right-3 top-3 font-serif text-xl text-rose-300/40">
                ❦
              </div>

              <div className="absolute bottom-3 left-3 font-serif text-xl text-rose-300/40">
                ❦
              </div>

              <div className="absolute bottom-3 right-3 font-serif text-xl text-rose-300/40">
                ❦
              </div>

              {/* SALUTATION */}
              <motion.div
                initial={{
                  opacity: 0,
                  x: -20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.2,
                }}
                className="
                  mb-6
                  border-b
                  border-rose-200/60
                  pb-3
                "
              >
                <h3
                  className="
                    font-handwriting
                    text-3xl
                    font-bold
                    text-rose-800
                    sm:text-4xl
                  "
                >
                  {letterData.salutation ||
                    `Gửi ${receiverName},`}
                </h3>
              </motion.div>

              {/* PARAGRAPHS */}
              <div
                className="
                  space-y-4
                  font-handwriting
                  text-2xl
                  leading-relaxed
                  text-slate-800
                  sm:text-3xl
                  sm:leading-loose
                "
              >
                {letterData.paragraphs.map(
                  (paragraph, idx) => (
                    <motion.p
                      key={idx}
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay:
                          0.3 +
                          idx * 0.15,
                      }}
                    >
                      {paragraph}
                    </motion.p>
                  )
                )}
              </div>

              {/* SIGNATURE */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.9,
                }}
                className="
                  mt-8
                  flex
                  flex-col
                  items-end
                  border-t
                  border-rose-200/60
                  pt-6
                  text-right
                "
              >
                <p className="font-handwriting text-2xl text-slate-600">
                  {letterData.closing}
                </p>

                <p
                  className="
                    mt-1
                    font-handwriting
                    text-3xl
                    font-bold
                    text-rose-700
                    sm:text-4xl
                  "
                >
                  {senderName ||
                    letterData.signature}
                </p>

                <p
                  className="
                    mt-2
                    flex
                    items-center
                    gap-1
                    text-xs
                    font-semibold
                    text-rose-500
                  "
                >
                  <Sparkles className="h-3 w-3" />

                  <span>
                    {letterData.date}
                  </span>
                </p>
              </motion.div>

              {/* KISS */}
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 1.1,
                }}
                className="
                  mt-8
                  flex
                  flex-col
                  items-center
                  justify-between
                  gap-4
                  border-t
                  border-rose-200/60
                  pt-6
                  sm:flex-row
                "
              >
                <p className="text-xs font-medium text-slate-500">
                  Đã gửi:{' '}
                  <span className="font-bold text-rose-600">
                    {kissCount}
                  </span>{' '}
                  nụ hôn yêu thương
                </p>

                <motion.button
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  onClick={handleSendKiss}
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-full
                    bg-gradient-to-r
                    from-rose-500
                    to-pink-500
                    px-5
                    py-2.5
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                    shadow-rose-500/30
                  "
                >
                  <Heart className="h-4 w-4 fill-white" />

                  <span>
                    Gửi thêm nụ hôn 💋
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* TOAST */}
      <AnimatePresence>
        {showKissToast && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -20,
              scale: 0.9,
            }}
            className="
              fixed
              bottom-6
              z-50
              flex
              items-center
              gap-2
              rounded-full
              border
              border-rose-400
              bg-rose-600
              px-5
              py-2.5
              text-sm
              font-bold
              text-white
              shadow-2xl
            "
          >
            <CheckCircle2 className="h-4 w-4 text-rose-200" />

            <span>
              Đã gửi ngàn nụ hôn ngọt ngào đến
              cậu! 💕
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BACK - CUỐI CÙNG */}
      <motion.button
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 1.2,
        }}
        onClick={handleBack}
        className="
          mt-10
          inline-flex
          items-center
          gap-1.5
          rounded-full
          border
          border-rose-200
          bg-white/80
          px-5
          py-2.5
          text-xs
          font-semibold
          text-rose-600
          shadow-sm
        "
      >
        <ChevronLeft className="h-4 w-4" />

        <span>Quay lại 3 món quà</span>
      </motion.button>
    </motion.div>
  );
};