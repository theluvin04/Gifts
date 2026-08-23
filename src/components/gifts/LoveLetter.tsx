import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AnimatePresence,
  motion,
} from 'motion/react';
import { ChevronLeft } from 'lucide-react';

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

const TYPING_SPEED = 24;
const PARAGRAPH_GAP = 180;

/* =========================
   VIETNAMESE SAFE TYPEWRITER
========================= */

const splitVietnameseText = (
  input: string
): string[] => {
  const text = input.normalize('NFC');

  try {
    const Segmenter = (Intl as any).Segmenter;

    if (Segmenter) {
      const segmenter = new Segmenter('vi', {
        granularity: 'grapheme',
      });

      return Array.from(
        segmenter.segment(text),
        (item: any) => item.segment
      );
    }
  } catch {
    // fallback below
  }

  return Array.from(text);
};

interface TypewriterTextProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
  showCursor?: boolean;
}

const TypewriterText: React.FC<
  TypewriterTextProps
> = ({
  text,
  delay = 0,
  speed = TYPING_SPEED,
  className = '',
  style,
  as: Tag = 'p',
  showCursor = true,
}) => {
  const characters = useMemo(
    () => splitVietnameseText(text),
    [text]
  );

  const [count, setCount] = useState(0);
  const [started, setStarted] =
    useState(false);

  useEffect(() => {
    setCount(0);
    setStarted(false);

    if (!characters.length) return;

    let interval:
      | ReturnType<typeof setInterval>
      | undefined;

    const timeout = setTimeout(() => {
      setStarted(true);

      let current = 0;

      interval = setInterval(() => {
        current += 1;

        setCount(current);

        if (current >= characters.length) {
          if (interval) {
            clearInterval(interval);
          }
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeout);

      if (interval) {
        clearInterval(interval);
      }
    };
  }, [characters, delay, speed]);

  const finished =
    count >= characters.length;

  return (
    <Tag
      className={className}
      style={style}
    >
      {characters.slice(0, count).join('')}

      {showCursor &&
        started &&
        !finished && (
          <span
            className="
              ml-[2px]
              inline-block
              h-[0.95em]
              w-[1.5px]
              animate-pulse
              bg-current
              align-middle
            "
          />
        )}
    </Tag>
  );
};

/* =========================
   LETTER
========================= */

export const LoveLetter: React.FC<
  LoveLetterProps
> = ({
  letterData,
  senderName,
  receiverName,
  onBack,
}) => {
  const [isOpen, setIsOpen] =
    useState(false);

  const handleOpen = () => {
    if (isOpen) return;

    sfx.playLetterOpen();
    setIsOpen(true);
  };

  const handleBack = () => {
    sfx.playPop();
    onBack();
  };

  const salutation = (
    letterData.salutation ||
    `Gửi ${receiverName},`
  ).normalize('NFC');

  const paragraphs =
    letterData.paragraphs.map((paragraph) =>
      paragraph.normalize('NFC')
    );

  const closing = (
    letterData.closing || ''
  ).normalize('NFC');

  const signature = (
    senderName ||
    letterData.signature ||
    ''
  ).normalize('NFC');

  /* =========================
     TYPEWRITER TIMING
  ========================= */

  let nextDelay = 180;

  const salutationDelay = nextDelay;

  nextDelay +=
    splitVietnameseText(salutation).length *
      TYPING_SPEED +
    220;

  const paragraphSchedule =
    paragraphs.map((paragraph) => {
      const delay = nextDelay;

      nextDelay +=
        splitVietnameseText(paragraph).length *
          TYPING_SPEED +
        PARAGRAPH_GAP;

      return {
        paragraph,
        delay,
      };
    });

  const closingDelay = nextDelay;

  nextDelay +=
    splitVietnameseText(closing).length *
      TYPING_SPEED +
    120;

  const signatureDelay = nextDelay;

  return (
    <motion.section
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
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
        px-4
        py-12
        sm:px-6
      "
    >
      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* =====================
             CLOSED ENVELOPE
          ===================== */

          <motion.div
            key="closed"
            initial={{
              opacity: 0,
              y: 25,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 15,
              scale: 0.97,
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
            <motion.div
              initial={{
                opacity: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="
                mb-7
                text-center
                sm:mb-9
              "
            >
              <h1
                className="
                  text-[30px]
                  font-semibold
                  text-rose-600
                  sm:text-[40px]
                "
                style={{
                  fontFamily:
                    "'Dancing Script', cursive",
                }}
              >
                A little letter for you ♡
              </h1>

              <p
                className="
                  mt-2
                  font-body
                  text-xs
                  text-slate-400
                  sm:text-sm
                "
              >
                Tap the envelope to open
              </p>
            </motion.div>

            <motion.button
              type="button"
              onClick={handleOpen}
              whileHover={{
                y: -6,
                scale: 1.012,
              }}
              whileTap={{
                scale: 0.98,
              }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
              className="
                block
                w-full
                max-w-[620px]
                cursor-pointer
                border-0
                bg-transparent
                p-0
              "
              aria-label="Open letter"
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
            </motion.button>
          </motion.div>
        ) : (
          /* =====================
             OPEN LETTER
          ===================== */

          <motion.article
            key="opened"
            initial={{
              opacity: 0,
              y: 40,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.98,
            }}
            transition={{
              type: 'spring',
              stiffness: 160,
              damping: 20,
            }}
            className="
              relative
              w-full
              max-w-[720px]
              rounded-[28px]
              border
              border-[#eadfce]
              bg-[#fffdf9]
              px-7
              py-9
              shadow-[0_25px_70px_rgba(100,70,40,0.10)]
              sm:px-14
              sm:py-14
            "
          >
            {/* DECORATION */}
            <span
              className="
                absolute
                left-5
                top-4
                text-lg
                text-rose-200
              "
            >
              ❦
            </span>

            <span
              className="
                absolute
                right-5
                top-4
                text-lg
                text-rose-200
              "
            >
              ❦
            </span>

            {/* SALUTATION */}
            <TypewriterText
              as="h2"
              text={salutation}
              delay={salutationDelay}
              className="
                mb-8
                text-[28px]
                font-semibold
                leading-[1.4]
                text-rose-600
                sm:text-[36px]
              "
              style={{
                fontFamily:
                  "'Dancing Script', cursive",
              }}
            />

            {/* BODY */}
            <div
              className="
                space-y-6
                font-body
                text-slate-700
              "
            >
              {paragraphSchedule.map(
                ({
                  paragraph,
                  delay,
                }) => (
                  <TypewriterText
                    key={`${delay}-${paragraph}`}
                    text={paragraph}
                    delay={delay}
                    className="
                      text-[15px]
                      font-medium
                      leading-[1.9]
                      tracking-[-0.01em]
                      sm:text-[17px]
                      sm:leading-[2]
                    "
                    style={{
                      fontFamily:
                        "'Quicksand', sans-serif",
                    }}
                  />
                )
              )}
            </div>

            {/* SIGNATURE */}
            <div
              className="
                mt-10
                border-t
                border-rose-100
                pt-7
                text-right
              "
            >
              <TypewriterText
                text={closing}
                delay={closingDelay}
                className="
                  text-[14px]
                  font-medium
                  text-slate-400
                  sm:text-[15px]
                "
                style={{
                  fontFamily:
                    "'Quicksand', sans-serif",
                }}
              />

              <TypewriterText
                text={signature}
                delay={signatureDelay}
                showCursor={false}
                className="
                  mt-1
                  text-[30px]
                  font-semibold
                  leading-none
                  text-rose-600
                  sm:text-[38px]
                "
                style={{
                  fontFamily:
                    "'Dancing Script', cursive",
                }}
              />
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
          delay: 0.7,
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
          font-body
          text-xs
          font-semibold
          text-rose-500
          shadow-sm
        "
      >
        <ChevronLeft className="h-4 w-4" />

        <span>
          Quay lại 3 món quà
        </span>
      </motion.button>
    </motion.section>
  );
};