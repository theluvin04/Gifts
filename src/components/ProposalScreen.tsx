import React, {
  useState,
} from 'react';

import {
  motion,
} from 'motion/react';

import type {
  LoveConfig,
} from '../types';

import type {
  TemplateDesignConfig,
} from '../templates/design';

import {
  sfx,
} from '../utils/soundEffects';

import {
  ProposalCat,
} from './proposal/ProposalCat';

import {
  ProposalActions,
} from './proposal/ProposalActions';

import {
  LOVE_ASSET_SLOT_IDS,
} from '../templates/assets';

interface ProposalScreenProps {
  config: LoveConfig;
  design: TemplateDesignConfig;
  onYesAccepted: () => void;
}

export const ProposalScreen:
React.FC<
  ProposalScreenProps
> = ({
  config,
  design,
  onYesAccepted,
}) => {
  const [
    rejectCount,
    setRejectCount,
  ] = useState(0);

  const stages =
    config.proposal
      .noBtnStages;

  const currentStage =
    stages[
      Math.min(
        rejectCount,
        stages.length - 1
      )
    ];

  const currentHeading =
    rejectCount === 0
      ? config.proposal
          .question
      : currentStage.hint ||
        currentStage.text ||
        config.proposal
          .question;

  const currentGif =
    rejectCount === 0
      ? (
          config
            .resolvedAssets?.[
              LOVE_ASSET_SLOT_IDS
                .proposalInitial
            ] ||
          config.proposal
            .initialGif
        )
      : (
          config
            .resolvedAssets?.[
              LOVE_ASSET_SLOT_IDS
                .proposalNo
            ] ||
          currentStage.gifUrl
        );

  const handleNo = () => {
    sfx.playDodge();

    setRejectCount(
      (previous) =>
        previous + 1
    );
  };

  const handleYes = () => {
    sfx.playSuccessChime();
    onYesAccepted();
  };

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
        scale: 1.04,
      }}
      style={{
        color:
          design.colors.text,
        fontFamily:
          design.fonts.body,
      }}
      className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden px-4"
    >
      <div className="flex w-full max-w-[340px] flex-col items-center sm:max-w-[600px]">
        <ProposalCat
          src={currentGif}
        />

        <motion.h2
          key={currentHeading}
          initial={{
            opacity: 0,
            y: 5,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          style={{
            color:
              design.proposal
                .questionColor,
            fontFamily:
              design.fonts
                .heading,
            fontSize:
              `clamp(20px, 5vw, ${design.proposal.questionSize}px)`,
          }}
          className="mb-6 mt-5 max-w-[290px] text-center font-bold leading-[1.2] sm:max-w-[520px]"
        >
          {currentHeading}
        </motion.h2>

        <ProposalActions
          rejectCount={
            rejectCount
          }
          yesText={
            config.proposal
              .yesBtnText
          }
          noText={
            rejectCount === 0
              ? 'Không nha 😜'
              : currentStage.text
          }
          design={design}
          onYes={handleYes}
          onNo={handleNo}
        />
      </div>
    </motion.section>
  );
};
