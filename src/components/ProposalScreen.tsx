import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ArrowRight } from 'lucide-react';
import { LoveConfig } from '../types';
import { sfx } from '../utils/soundEffects';

interface ProposalScreenProps {
  config: LoveConfig;
  onYesAccepted: () => void;
}

export const ProposalScreen: React.FC<ProposalScreenProps> = ({
  config,
  onYesAccepted,
}) => {
  const [rejectCount, setRejectCount] = useState(0);
  const [isAccepted, setIsAccepted] = useState(false);
  const [noButtonPos, setNoButtonPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [dodgeCount, setDodgeCount] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const noBtnRef = useRef<HTMLButtonElement>(null);

  const stages = config.proposal.noBtnStages;

  const currentStageIndex = Math.min(
    rejectCount,
    stages.length - 1
  );

  const currentStage = stages[currentStageIndex];

  const currentHeading =
    rejectCount === 0
      ? config.proposal.question
      : currentStage.hint ||
        currentStage.text ||
        config.proposal.question;

  const currentGif = isAccepted
    ? config.proposal.successGif
    : rejectCount === 0
      ? config.proposal.initialGif
      : currentStage.gifUrl;

  const handleDodge = (
    e?: React.MouseEvent | React.TouchEvent
  ) => {
    if (isAccepted) return;

    if (e) {
      e.preventDefault();
    }

    sfx.playDodge();

    setRejectCount((prev) => prev + 1);
    setDodgeCount((prev) => prev + 1);

    if (containerRef.current) {
      const rect =
        containerRef.current.getBoundingClientRect();

      const maxX = Math.min(rect.width / 2 - 80, 160);
      const maxY = Math.min(rect.height / 2 - 80, 140);

      const randomX =
        (Math.random() * 2 - 1) * maxX;

      const randomY =
        (Math.random() * 2 - 1) * maxY;

      setNoButtonPos({
        x: randomX,
        y: randomY,
      });
    }
  };

  const handleYes = () => {
    if (isAccepted) return;

    setIsAccepted(true);
    sfx.playSuccessChime();
  };

  useEffect(() => {
    const handleResize = () =>
      setNoButtonPos(null);

    window.addEventListener(
      'resize',
      handleResize
    );

    return () =>
      window.removeEventListener(
        'resize',
        handleResize
      );
  }, []);

  const yesScale = Math.min(
    1 + rejectCount * 0.15,
    1.85
  );

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: -20,
      }}
      transition={{
        duration: 0.5,
      }}
      className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-4 py-8 max-w-2xl mx-auto text-center"
      ref={containerRef}
      id="proposal-screen"
    >
      {/* CAT - KHÔNG CÓ KHUNG */}
      <motion.img
        key={currentGif}
        src={currentGif}
        alt="Cute cat"
        initial={{
          scale: 0.85,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
        }}
        className="w-[220px] sm:w-[260px] h-auto object-contain mb-7 pointer-events-none"
      />

      <AnimatePresence mode="wait">
        {!isAccepted ? (
          <motion.div
            key="question-box"
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
            className="w-full"
          >
            <motion.h2
              key={currentHeading}
              initial={{
                opacity: 0,
                y: -6,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.25,
              }}
              className="text-2xl sm:text-4xl font-extrabold text-slate-800 font-heading mb-3 px-2 min-h-[44px] flex items-center justify-center"
            >
              {currentHeading}
            </motion.h2>

            <div className="relative flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 min-h-[120px] w-full">
              <motion.button
                id="proposal-yes-btn"
                whileHover={{
                  scale: yesScale * 1.06,
                }}
                whileTap={{
                  scale: yesScale * 0.94,
                }}
                animate={{
                  scale: yesScale,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 15,
                }}
                onClick={handleYes}
                className="z-20 px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold text-base sm:text-lg rounded-full shadow-lg shadow-pink-500/40 hover:shadow-pink-500/60 border-2 border-white/70 flex items-center gap-2 cursor-pointer"
              >
                <Heart className="w-5 h-5 fill-white" />

                <span>
                  {config.proposal.yesBtnText}
                </span>
              </motion.button>

              <motion.button
                id="proposal-no-btn"
                ref={noBtnRef}
                onClick={handleDodge}
                animate={
                  noButtonPos
                    ? {
                        x: noButtonPos.x,
                        y: noButtonPos.y,
                        rotate:
                          rejectCount % 2 === 0
                            ? 8
                            : -8,
                      }
                    : {
                        x: 0,
                        y: 0,
                        rotate: 0,
                      }
                }
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 20,
                }}
                className="z-10 px-5 sm:px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm sm:text-base rounded-full shadow-md border border-slate-300 cursor-pointer select-none"
              >
                <span>
                  {rejectCount === 0
                    ? 'Không nha 😜'
                    : currentStage.text}
                </span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success-box"
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-pink-200"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-heading mb-3">
              {config.proposal.successHeading}
            </h2>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-6 font-medium">
              {config.proposal.successSubheading}
            </p>

            <motion.button
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              onClick={onYesAccepted}
              className="w-full py-4 px-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2"
            >
              <span>
                {config.proposal.continueBtnText}
              </span>

              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};