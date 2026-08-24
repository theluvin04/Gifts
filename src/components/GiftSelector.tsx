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
  AnimatedElement,
  AnimatedGroup,
} from '../engine';

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
    <section
      style={{
        color:
          design.colors.text,
        fontFamily:
          design.fonts.body,
      }}
      className="flex min-h-[100svh] w-full min-w-0 flex-col items-center justify-center overflow-hidden px-4 py-10 text-center"
    >
      <AnimatedElement
        animation={{
          preset:
            'fade-down',
          durationMs: 420,
        }}
      >
        <h1
          style={{
            color:
              design.gifts
                .headingColor,
            fontFamily:
              design.fonts
                .heading,
            fontSize:
              `clamp(24px, 5vw, ${design.gifts.headingSize}px)`,
          }}
          className="mb-3 font-bold"
        >
          {config.proposal
            .successHeading ||
            "I knew you'd say yes 💕"}
        </h1>
      </AnimatedElement>

      <AnimatedElement
        animation={{
          preset:
            'zoom-in',
          durationMs: 520,
          delayMs: 80,
          easing:
            'backOut',
        }}
      >
        <img
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
          className="mb-8 h-auto w-[140px] object-contain sm:w-[220px]"
        />
      </AnimatedElement>

      <AnimatedGroup
        animation={{
          preset:
            'fade-up',
          durationMs: 460,
        }}
        stagger={{
          enabled: true,
          startDelayMs: 160,
          intervalMs: 120,
        }}
        className="grid w-full max-w-[340px] grid-cols-3 gap-3 sm:max-w-[720px] sm:gap-8"
        itemClassName="min-w-0"
      >
        {gifts.map(
          (gift) => (
            <motion.button
              key={
                gift.stage
              }
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
              className="flex aspect-square w-full min-w-0 flex-col items-center justify-center overflow-hidden rounded-2xl p-2 shadow-md sm:rounded-3xl sm:p-5"
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
      </AnimatedGroup>
    </section>
  );
};
