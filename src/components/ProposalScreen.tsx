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

  const proposal = config?.proposal || {
    question: 'Em có yêu anh không?',
    yesBtnText: 'Yêu ơi là yêu 💕',
    noBtnStages: [],
    initialGif: '/images/gifts/proposal-initial.gif',
    successHeading: "Anh biết em sẽ đồng ý mà 💕",
    successGif: '/images/gifts/success.gif',
  };

  const stages = proposal.noBtnStages || [];

  const currentStage =
    stages[
      Math.min(
        rejectCount,
        Math.max(0, stages.length - 1)
      )
    ] || { text: 'Không nha 😜', hint: proposal.question, gifUrl: proposal.initialGif };

  const currentHeading =
    rejectCount === 0
      ? proposal.question
      : currentStage.hint ||
        currentStage.text ||
        proposal.question;

  const currentGif =
    rejectCount === 0
      ? (
          config?.resolvedAssets?.[
            LOVE_ASSET_SLOT_IDS
              .proposalInitial
          ] ||
          proposal.initialGif
        )
      : (
          config?.resolvedAssets?.[
            LOVE_ASSET_SLOT_IDS
              .proposalNo
          ] ||
          currentStage.gifUrl ||
          proposal.initialGif
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

  const textColor = design?.colors?.text || '#191919';
  const bodyFont = design?.fonts?.body || 'sans-serif';
  const headingFont = design?.fonts?.heading || 'sans-serif';
  const questionColor = design?.proposal?.questionColor || '#e11d48';
  const questionSize = design?.proposal?.questionSize || 28;

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
        color: textColor,
        fontFamily: bodyFont,
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
            color: questionColor,
            fontFamily: headingFont,
            fontSize: `clamp(20px, 5vw, ${questionSize}px)`,
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
            proposal.yesBtnText
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
