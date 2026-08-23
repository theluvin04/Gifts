import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronLeft,
  Heart,
  Sparkles,
} from 'lucide-react';

import { LoveConfig } from '../../types';
import { sfx } from '../../utils/soundEffects';

interface LoveLetterProps {
  letterData: LoveConfig['gifts']['gift3']['letter'];
  senderName: string;
  receiverName: string;
  onBack: () => void;
}

const ENVELOPE_IMAGE =
  '/images/letter/envelope-cover.png';

export const LoveLetter: React.FC<LoveLetterProps> = ({
  letterData,
  senderName,
  receiverName,
  onBack,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    if (isOpen) return;

    sfx.playLetterOpen();
    setIsOpen(true);
  };

  const handleBack = () => {
    sfx.playPop();
    onBack();
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="
        relative
        mx-auto
        flex
        min-h-[100svh]
        w-full
        max-w-5xl
        flex-col
        items-center
        justify-center
        overflow-hidden
        px-4
        py-12
        sm:px-6
      "
    >
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="closed"
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.94,
            }}
            transition={{
              type: 'spring',
              stiffness: 170,
              damping: 20,
            }}
            className="
              flex
              w-full
              flex-col
              items-center
            "
          >
            {/* TITLE */}
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.1,
              }}
              className="
                mb-7
                text-center
                sm:mb-9
              "
            >
              <h1
                className="
                  font-handwriting
                  text-[30px]
                  font-bold
                  text-rose-600
                  sm:text-[42px]
                "
              >
                A little letter for you ♡
              </h1>

              <p
                className="
                  mt-1.5
                  text-xs
                  text-slate-500
                  sm:text-sm
                "
              >
                Tap the heart to open
              </p>
            </motion.div>

            {/* ENVELOPE IMAGE */}
            <motion.div
              whileHover={{
                y: -5,
              }}
              className="
                relative
                w-full
                max-w-[620px]
              "
            >
              <img
                src={ENVELOPE_IMAGE}
                alt="Love letter envelope"
                draggable={false}
                className="
                  block
                  h-auto
                  max-h-[430px]
                  w-full
                  select-none
                  object-contain
                  drop-shadow-[0_22px_30px_rgba(190,70,110,0.15)]
                "
              />

              {/* RECEIVER */}
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 0.35,
                }}
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-[45%]
                  z-10
                  w-[65%]
                  -translate-x-1/2
                  -translate-y-1/2
                  text-center
                "
              >
                <p
                  className="
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-[0.25em]
                    text-rose-400
                    sm:text-[10px]
                  "
                >
                  FOR
                </p>

                <p
                  className="
                    mt-1
                    truncate
                    font-handwriting
                    text-xl
                    font-bold
                    text-slate-700
                    sm:text-3xl
                  "
                >
                  {receiverName}
                </p>
              </motion.div>

              {/* OPEN HEART */}
              <motion.button
                type="button"
                onClick={handleOpen}
                whileHover={{
                  scale: 1.1,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                animate={{
                  scale: [1, 1.08, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(244,63,94,0.25)',
                    '0 0 0 18px rgba(244,63,94,0)',
                    '0 0 0 0 rgba(244,63,94,0)',
                  ],
                }}
                transition={{
                  scale: {
                    duration: 1.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                  boxShadow: {
                    duration: 1.8,
                    repeat: Infinity,
                  },
                }}
                className="
                  absolute
                  bottom-[13%]
                  left-1/2
                  z-20
                  flex
                  h-13
                  w-13
                  -translate-x-1/2
                  items-center
                  justify-center
                  rounded-full
                  bg-rose-500
                  text-white
                  shadow-lg
                  sm:h-16
                  sm:w-16
                "
                aria-label="Open letter"
              >
                <Heart
                  className="
                    h-5
                    w-5
                    fill-white
                    text-white
                    sm:h-7
                    sm:w-7
                  "
                />
              </motion.button>

              {/* SPARKLES */}
              <motion.span
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [0.8, 1.15, 0.8],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                }}
                className="
                  pointer-events-none
                  absolute
                  right-[12%]
                  top-[17%]
                  text-lg
                  text-rose-300
                "
              >
                ✦
              </motion.span>

              <motion.span
                animate={{
                  opacity: [1, 0.2, 1],
                  scale: [1, 0.8, 1],
                }}
                transition={{
                  duration: 2.1,
                  repeat: Infinity,
                }}
                className="
                  pointer-events-none
                  absolute
                  bottom-[24%]
                  left-[13%]
                  text-sm
                  text-rose-300
                "
              >
                ✦
              </motion.span>
            </motion.div>
          </motion.div>
        ) : (
          /* OPEN LETTER */
          <motion.article
            key="opened"
            initial={{
              opacity: 0,
              y: 50,
              scale: 0.94,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 30,
              scale: 0.96,
            }}
            transition={{
              type: 'spring',
              stiffness: 160,
              damping: 20,
            }}
            className="
              relative
              w-full
              max-w-[680px]
              overflow-hidden
              rounded-[26px]
              border
              border-[#eadbc4]
              bg-[#fffdf8]
              px-6
              py-8
              shadow-[0_24px_65px_rgba(100,70,40,0.12)]
              sm:px-12
              sm:py-12
            "
          >
            {/* DECORATION */}
            <span
              className="
                absolute
                left-5
                top-5
                text-xl
                text-rose-200
              "
            >
              ❦
            </span>

            <span
              className="
                absolute
                right-5
                top-5
                text-xl
                text-rose-200
              "
            >
              ❦
            </span>

            {/* SALUTATION */}
            <motion.h2
              initial={{
                opacity: 0,
                x: -14,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.15,
              }}
              className="
                mb-7
                font-handwriting
                text-3xl
                font-bold
                text-rose-700
                sm:text-4xl
              "
            >
              {letterData.salutation ||
                `Gửi ${receiverName},`}
            </motion.h2>

            {/* LETTER CONTENT */}
            <div
              className="
                space-y-5
                font-handwriting
                text-[21px]
                leading-[1.65]
                text-slate-700
                sm:text-[26px]
                sm:leading-[1.7]
              "
            >
              {letterData.paragraphs.map(
                (paragraph, index) => (
                  <motion.p
                    key={index}
                    initial={{
                      opacity: 0,
                      y: 14,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay:
                        0.25 +
                        index * 0.12,
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
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay:
                  0.4 +
                  letterData.paragraphs.length *
                    0.12,
              }}
              className="
                mt-10
                border-t
                border-rose-100
                pt-7
                text-right
              "
            >
              <p
                className="
                  font-handwriting
                  text-xl
                  text-slate-500
                  sm:text-2xl
                "
              >
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

              <div
                className="
                  mt-3
                  flex
                  items-center
                  justify-end
                  gap-1
                  text-xs
                  text-rose-400
                "
              >
                <Sparkles className="h-3 w-3" />

                <span>
                  {letterData.date}
                </span>
              </div>
            </motion.div>

            {/* CLOSE */}
            <div
              className="
                mt-9
                flex
                justify-center
              "
            >
              <button
                type="button"
                onClick={() =>
                  setIsOpen(false)
                }
                className="
                  rounded-full
                  bg-rose-50
                  px-5
                  py-2.5
                  text-xs
                  font-semibold
                  text-rose-500
                  transition
                  hover:bg-rose-100
                "
              >
                Đóng thư lại
              </button>
            </div>
          </motion.article>
        )}
      </AnimatePresence>

      {/* BACK */}
      <motion.button
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.8,
        }}
        onClick={handleBack}
        className="
          mt-9
          inline-flex
          items-center
          gap-1.5
          rounded-full
          border
          border-rose-200
          bg-white/75
          px-5
          py-2.5
          text-xs
          font-semibold
          text-rose-500
          shadow-sm
        "
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Quay lại 3 món quà</span>
      </motion.button>
    </motion.section>
  );
};