import React from 'react';
import { motion } from 'motion/react';

import { AppStage, LoveConfig } from '../types';
import { sfx } from '../utils/soundEffects';

interface GiftSelectorProps {
  config: LoveConfig;
  onSelectGift: (stage: AppStage) => void;
  onReset: () => void;
}

export const GiftSelector: React.FC<GiftSelectorProps> = ({
  onSelectGift,
}) => {
  const gifts = [
    {
      stage: 'gift1' as AppStage,
      image: '/images/gifts/gift-1.png',
      label: 'GIFT 1',
    },
    {
      stage: 'gift2' as AppStage,
      image: '/images/gifts/gift-2.png',
      label: 'GIFT 2',
    },
    {
      stage: 'gift3' as AppStage,
      image: '/images/gifts/gift-3.png',
      label: 'GIFT 3',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="
        flex
        min-h-[100svh]
        w-full
        flex-col
        items-center
        justify-center
        overflow-hidden
        px-4
        py-10
        text-center
      "
    >
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          mb-3
          text-[24px]
          font-bold
          text-rose-500
          font-heading
          sm:text-4xl
        "
      >
        I knew you'd say yes 💕
      </motion.h1>

      <motion.img
        src="/images/gifts/success.gif"
        alt="Happy cat"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
        className="
          mb-8
          h-auto
          w-[140px]
          object-contain
          sm:w-[220px]
        "
      />

      <div
        className="
          grid
          w-full
          max-w-[340px]
          grid-cols-3
          gap-3
          sm:max-w-[720px]
          sm:gap-8
        "
      >
        {gifts.map((gift, index) => (
          <motion.button
            key={gift.stage}
            initial={{
              opacity: 0,
              y: 25,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              delay: 0.15 + index * 0.12,
            }}
            whileHover={{
              y: -6,
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.94,
            }}
            onClick={() => {
              sfx.playPop();
              onSelectGift(gift.stage);
            }}
            className="
              flex
              aspect-square
              min-w-0
              flex-col
              items-center
              justify-center
              overflow-hidden
              rounded-2xl
              bg-pink-100
              p-2
              shadow-md
              sm:rounded-3xl
              sm:p-5
            "
          >
            <img
              src={gift.image}
              alt={gift.label}
              className="
                h-[68%]
                w-[68%]
                object-contain
              "
            />

            <span
              className="
                mt-1
                text-[11px]
                font-bold
                text-rose-500
                sm:text-lg
              "
            >
              {gift.label}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
};