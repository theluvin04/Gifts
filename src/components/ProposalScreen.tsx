import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ArrowRight } from 'lucide-react';
import { LoveConfig } from '../types';
import { sfx } from '../utils/soundEffects';

interface ProposalScreenProps {
  config: LoveConfig;
  onYesAccepted: () => void;
}

export const ProposalScreen: React.FC<ProposalScreenProps> = ({ config, onYesAccepted }) => {
  const [rejectCount, setRejectCount] = useState(0);
  const [isAccepted, setIsAccepted] = useState(false);
  const [noButtonPos, setNoButtonPos] = useState<{ x: number; y: number } | null>(null);
  const [dodgeCount, setDodgeCount] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const noBtnRef = useRef<HTMLButtonElement>(null);

  const stages = config.proposal.noBtnStages;
  const currentStageIndex = Math.min(rejectCount, stages.length - 1);
  const currentStage = stages[currentStageIndex];

  // Dynamic heading: replaces "Do you love me?" with cute pleading phrases when NO is clicked
  const currentHeading = rejectCount === 0
    ? config.proposal.question
    : (currentStage.hint || currentStage.text || config.proposal.question);

  // Dynamic Cat GIF based on reject count and success state
  const currentGif = isAccepted
    ? config.proposal.successGif
    : rejectCount === 0
    ? config.proposal.initialGif
    : currentStage.gifUrl;

  // Move the NO button randomly ONLY when user clicks/taps it
  const handleDodge = (e?: React.MouseEvent | React.TouchEvent) => {
    if (isAccepted) return;
    if (e) {
      e.preventDefault();
    }

    sfx.playDodge();

    // Increment rejection count
    setRejectCount((prev) => prev + 1);
    setDodgeCount((prev) => prev + 1);

    // Calculate dynamic random position within container bounds
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // Ensure it stays safely within the visible container area
      const maxX = Math.min(rect.width / 2 - 80, 160);
      const maxY = Math.min(rect.height / 2 - 80, 140);
      
      const randomX = (Math.random() * 2 - 1) * maxX;
      const randomY = (Math.random() * 2 - 1) * maxY;

      setNoButtonPos({ x: randomX, y: randomY });
    } else {
      const randomX = (Math.random() * 200) - 100;
      const randomY = (Math.random() * 160) - 80;
      setNoButtonPos({ x: randomX, y: randomY });
    }
  };

  const handleYes = () => {
    if (isAccepted) return;
    setIsAccepted(true);
    sfx.playSuccessChime();
  };

  // Reset NO button position on window resize for safety
  useEffect(() => {
    const handleResize = () => setNoButtonPos(null);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scale factor for YES button: grows larger with each NO attempt
  const yesScale = Math.min(1 + rejectCount * 0.15, 1.85);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-4 py-8 max-w-2xl mx-auto text-center"
      ref={containerRef}
      id="proposal-screen"
    >
      {/* Cat GIF with Card Frame */}
      <motion.div
        key={currentGif}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative mb-6 rounded-3xl p-3 bg-white/80 backdrop-blur-md shadow-xl border-4 border-pink-200/80 max-w-[280px] sm:max-w-[320px] aspect-square flex items-center justify-center overflow-hidden"
      >
        <img
          src={currentGif}
          alt="Cute cat emotion"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover rounded-2xl pointer-events-none"
        />
        {isAccepted && (
          <div className="absolute inset-0 bg-pink-500/10 flex items-center justify-center pointer-events-none">
            <span className="text-4xl animate-bounce">💖</span>
          </div>
        )}
      </motion.div>

      {/* Question or Success Text */}
      <AnimatePresence mode="wait">
        {!isAccepted ? (
          <motion.div
            key="question-box"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            <motion.h2
              key={currentHeading}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="text-2xl sm:text-4xl font-extrabold text-slate-800 font-heading mb-3 px-2 min-h-[44px] flex items-center justify-center"
            >
              {currentHeading}
            </motion.h2>

            {/* Action Buttons: YES / NO */}
            <div className="relative flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 min-h-[120px] w-full">
              {/* YES Button */}
              <motion.button
                id="proposal-yes-btn"
                whileHover={{ scale: yesScale * 1.06 }}
                whileTap={{ scale: yesScale * 0.94 }}
                animate={{ scale: yesScale }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                onClick={handleYes}
                className="z-20 px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold text-base sm:text-lg rounded-full shadow-lg shadow-pink-500/40 hover:shadow-pink-500/60 border-2 border-white/70 flex items-center gap-2 cursor-pointer transition-colors"
                style={{
                  transformOrigin: 'center center',
                }}
              >
                <Heart className="w-5 h-5 fill-white" />
                <span>{config.proposal.yesBtnText}</span>
              </motion.button>

              {/* NO Runaway Button: moves only when clicked */}
              <motion.button
                id="proposal-no-btn"
                ref={noBtnRef}
                onClick={handleDodge}
                animate={
                  noButtonPos
                    ? {
                        x: noButtonPos.x,
                        y: noButtonPos.y,
                        rotate: rejectCount % 2 === 0 ? 8 : -8,
                      }
                    : {
                        x: 0,
                        y: 0,
                        rotate: 0,
                      }
                }
                transition={{ type: "spring", stiffness: 450, damping: 20 }}
                className="z-10 px-5 sm:px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm sm:text-base rounded-full shadow-md border border-slate-300 transition-colors cursor-pointer select-none active:scale-90"
              >
                <span>{rejectCount === 0 ? "Không nha 😜" : currentStage.text}</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* Success Screen after clicking YES */
          <motion.div
            key="success-box"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-pink-200"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-heading mb-3 flex items-center justify-center gap-2">
              <span>{config.proposal.successHeading}</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-6 font-medium">
              {config.proposal.successSubheading}
            </p>

            <motion.button
              id="continue-to-gifts-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onYesAccepted}
              className="w-full py-4 px-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-base sm:text-lg rounded-2xl shadow-xl shadow-rose-500/30 hover:shadow-rose-500/50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{config.proposal.continueBtnText}</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
