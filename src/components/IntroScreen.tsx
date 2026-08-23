import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { LoveConfig } from '../types';
import { sfx } from '../utils/soundEffects';

interface IntroScreenProps {
  config: LoveConfig;
  onOpen: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onOpen }) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpen = () => {
    if (isOpening) return;

    setIsOpening(true);
    sfx.playSuccessChime();

    setTimeout(() => {
      onOpen();
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.15,
        filter: 'blur(8px)',
      }}
      transition={{ duration: 0.5 }}
      className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center bg-pink-50 text-center"
      id="intro-screen"
    >
      <motion.button
        id="open-heart-button"
        onClick={handleOpen}
        whileTap={{ scale: 0.9 }}
        animate={
          isOpening
            ? {
                scale: [1, 1.4, 0],
                opacity: [1, 1, 0],
              }
            : {
                scale: [1, 1.08, 1],
              }
        }
        transition={
          isOpening
            ? { duration: 0.6 }
            : {
                duration: 1.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
        className="flex items-center justify-center bg-transparent border-0 cursor-pointer"
        aria-label="Open gift"
      >
        <Heart
          className="h-24 w-24 sm:h-28 sm:w-28 fill-rose-500 text-rose-500"
          strokeWidth={1.5}
        />
      </motion.button>

      <motion.p
        animate={{ opacity: [0.45, 1, 0.45] }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="mt-6 text-sm font-medium tracking-wide text-rose-500"
      >
        Tap to open
      </motion.p>
    </motion.div>
  );
};