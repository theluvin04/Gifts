import React, { useState } from 'react';
import { motion } from 'motion/react';

import { LoveConfig } from '../types';
import { sfx } from '../utils/soundEffects';

import { ProposalCat } from './proposal/ProposalCat';
import { ProposalActions } from './proposal/ProposalActions';

interface ProposalScreenProps {
  config: LoveConfig;
  onYesAccepted: () => void;
}

export const ProposalScreen: React.FC<ProposalScreenProps> = ({
  config,
  onYesAccepted,
}) => {
  const [rejectCount, setRejectCount] = useState(0);

  const stages = config.proposal.noBtnStages;

  const currentStage =
    stages[Math.min(rejectCount, stages.length - 1)];

  const currentHeading =
    rejectCount === 0
      ? config.proposal.question
      : currentStage.hint ||
        currentStage.text ||
        config.proposal.question;

  const currentGif =
    rejectCount === 0
      ? config.proposal.initialGif
      : currentStage.gifUrl;

  const handleNo = () => {
    sfx.playDodge();
    setRejectCount((prev) => prev + 1);
  };

  const handleYes = () => {
    sfx.playSuccessChime();
    onYesAccepted();
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      className="
        relative
        flex
        min-h-[100svh]
        w-full
        items-center
        justify-center
        overflow-hidden
        px-4
      "
    >
      <div className="
        flex
        w-full
        max-w-[340px]
        flex-col
        items-center
        sm:max-w-[600px]
      ">
        <ProposalCat src={currentGif} />

        <motion.h2
          key={currentHeading}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="
            mt-5
            mb-6
            max-w-[290px]
            text-center
            text-[20px]
            font-bold
            leading-[1.2]
            text-slate-800
            font-heading
            sm:max-w-[520px]
            sm:text-4xl
          "
        >
          {currentHeading}
        </motion.h2>

        <ProposalActions
          rejectCount={rejectCount}
          yesText={config.proposal.yesBtnText}
          noText={
            rejectCount === 0
              ? 'Không nha 😜'
              : currentStage.text
          }
          onYes={handleYes}
          onNo={handleNo}
        />
      </div>
    </motion.section>
  );
};