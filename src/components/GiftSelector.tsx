import React from 'react';

import {
  motion,
} from 'motion/react';

import type {
  AppStage,
  LoveConfig,
} from '../types';

import type {
  TemplateDesignConfig,
} from '../templates/design';

import {
  sfx,
} from '../utils/soundEffects';

import {
  LOVE_ASSET_SLOT_IDS,
} from '../templates/assets';

interface GiftSelectorProps {
  config: LoveConfig;
  design: TemplateDesignConfig;
  onSelectGift: (
    stage: AppStage
  ) => void;
  onReset: () => void;
}

export const GiftSelector:
React.FC<
  GiftSelectorProps
> = ({
  config,
  design,
  onSelectGift,
}) => {
  const gifts = [
    {
      stage:
        'gift1' as AppStage,
      image:
        config
          .resolvedAssets?.[
            LOVE_ASSET_SLOT_IDS
              .giftBox1
          ] ||
        '/images/gifts/gift-1.png',
    },
    {
      stage:
        'gift2' as AppStage,
      image:
        config
          .resolvedAssets?.[
            LOVE_ASSET_SLOT_IDS
              .giftBox2
          ] ||
        '/images/gifts/gift-2.png',
    },
    {
      stage:
        'gift3' as AppStage,
      image:
        config
          .resolvedAssets?.[
            LOVE_ASSET_SLOT_IDS
              .giftBox3
          ] ||
        '/images/gifts/gift-3.png',
    },
  ];

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
      style={{
        color:
          design.colors.text,
        fontFamily:
          design.fonts.body,
      }}
      className="flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-4 py-10 text-center"
    >
      <motion.h1
        initial={{
          opacity: 0,
          y: -10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        style={{
          color:
            design.gifts
              .headingColor,
          fontFamily:
            design.fonts.heading,
          fontSize:
            `clamp(24px, 5vw, ${design.gifts.headingSize}px)`,
        }}
        className="mb-3 font-bold"
      >
        {config.proposal
          .successHeading ||
          "I knew you'd say yes 💕"}
      </motion.h1>

      <motion.img
        src={
          config
            .resolvedAssets?.[
              LOVE_ASSET_SLOT_IDS
                .proposalSuccess
            ] ||
          config.proposal
            .successGif ||
          '/images/gifts/success.gif'
        }
        alt="Happy cat"
        initial={{
          opacity: 0,
          scale: 0.85,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
        className="mb-8 h-auto w-[140px] object-contain sm:w-[220px]"
      />

      <div className="grid w-full max-w-[340px] grid-cols-3 gap-3 sm:max-w-[720px] sm:gap-8">
        {gifts.map(
          (
            gift,
            index
          ) => (
            <motion.button
              key={
                gift.stage
              }
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
                delay:
                  0.15 +
                  index *
                    0.12,
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

                onSelectGift(
                  gift.stage
                );
              }}
              style={{
                background:
                  design.gifts
                    .cardBackground,
              }}
              className="flex aspect-square min-w-0 flex-col items-center justify-center overflow-hidden rounded-2xl p-2 shadow-md sm:rounded-3xl sm:p-5"
            >
              <img
                src={
                  gift.image
                }
                alt="Gift box"
                className="h-[82%] w-[82%] object-contain"
              />
            </motion.button>
          )
        )}
      </div>
    </motion.section>
  );
};
