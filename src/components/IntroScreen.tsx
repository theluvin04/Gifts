import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles, Lock, Unlock } from 'lucide-react';
import { LoveConfig } from '../types';
import { sfx } from '../utils/soundEffects';
import { triggerLoveConfetti } from '../utils/confetti';

interface IntroScreenProps {
  config: LoveConfig;
  onOpen: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ config, onOpen }) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);
    sfx.playSuccessChime();
    triggerLoveConfetti();

    setTimeout(() => {
      onOpen();
    }, 900);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.15, filter: 'blur(10px)' }}
      transition={{ duration: 0.6 }}
      className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center"
      id="intro-screen"
    >
      {/* Decorative Badge */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-semibold text-rose-600 bg-rose-100/90 rounded-full border border-rose-200 shadow-sm backdrop-blur-sm"
      >
        <Sparkles className="w-4 h-4 text-rose-500 animate-spin-slow" />
        <span>{config.couple.receiverName} ơi ✨</span>
      </motion.div>

      {/* Main Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-3xl sm:text-5xl font-bold tracking-tight text-rose-950 font-heading mb-4 leading-tight max-w-lg"
      >
        {config.intro.title}
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-base sm:text-lg text-rose-800/80 max-w-md mb-12 font-medium"
      >
        {config.intro.subtitle}
      </motion.p>

      {/* Interactive Heart / Gift Box Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
        className="relative group cursor-pointer"
        onClick={handleOpen}
      >
        {/* Glowing Aura */}
        <div className="absolute -inset-4 bg-gradient-to-r from-rose-400 via-pink-400 to-red-400 rounded-full blur-xl opacity-60 group-hover:opacity-90 animate-pulse transition duration-500" />

        {/* Heart Container */}
        <motion.button
          id="open-heart-button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          animate={isOpening ? { scale: [1, 1.4, 0], rotate: [0, 15, -15, 0] } : {}}
          transition={{ duration: 0.8 }}
          className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex flex-col items-center justify-center text-white shadow-2xl border-4 border-white/60 hover:shadow-rose-500/50 transition-all focus:outline-none"
        >
          <motion.div
            animate={{
              scale: [1, 1.15, 1, 1.2, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.4,
              ease: "easeInOut",
            }}
            className="flex flex-col items-center"
          >
            <Heart className="w-16 h-16 sm:w-20 sm:h-20 fill-white text-white drop-shadow-md" />
            <span className="text-xs font-bold uppercase tracking-wider mt-1 text-rose-100 flex items-center gap-1">
              {isOpening ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {isOpening ? "Đang mở..." : "Open"}
            </span>
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Tap instruction */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 2, delay: 0.8 }}
        className="mt-8 text-sm font-semibold text-rose-700/90 tracking-wide flex items-center gap-2"
      >
        <span>👆</span>
        <span>{config.intro.heartLabel}</span>
      </motion.p>
    </motion.div>
  );
};
