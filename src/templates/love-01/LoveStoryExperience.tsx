import React, {
  useState,
} from 'react';

import {
  AnimatePresence,
} from 'motion/react';

import {
  Sparkles,
} from 'lucide-react';

import type {
  LoveConfig,
} from '../../types';

import {
  AudioPlayer,
} from '../../components/AudioPlayer';

import {
  ProposalScreen,
} from '../../components/ProposalScreen';

import {
  GiftSelector,
} from '../../components/GiftSelector';

import {
  PolaroidGallery,
} from '../../components/gifts/PolaroidGallery';

import {
  VinylMusicPlayer,
} from '../../components/gifts/VinylMusicPlayer';

import {
  LoveLetter,
} from '../../components/gifts/LoveLetter';

import {
  sfx,
} from '../../utils/soundEffects';

interface LoveStoryExperienceProps {
  config: LoveConfig;
  onCreateSimilar: () => void;
}

type ExperienceStage =
  | 'proposal'
  | 'gifts'
  | 'memories'
  | 'music'
  | 'letter';

export const LoveStoryExperience:
React.FC<
  LoveStoryExperienceProps
> = ({
  config,
  onCreateSimilar,
}) => {
  const [stage, setStage] =
    useState<ExperienceStage>(
      'proposal'
    );

  const openGifts = () => {
    sfx.playPop();
    setStage('gifts');
    window.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  };

  return (
    <main className="relative flex min-h-[100svh] flex-col overflow-x-hidden bg-gradient-to-b from-pink-50 via-rose-50 to-pink-100 text-slate-800 selection:bg-pink-300 selection:text-pink-900">
      <AudioPlayer
        musicUrl={
          config.audio
            .backgroundMusicUrl
        }
        musicTitle={
          config.audio
            .backgroundMusicTitle
        }
      />

      <div className="fixed left-4 top-4 z-40">
        <button
          type="button"
          onClick={onCreateSimilar}
          className="inline-flex items-center gap-2 rounded-[14px] border border-black/10 bg-white/90 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur-md transition hover:bg-white"
        >
          <Sparkles className="h-3.5 w-3.5 text-rose-500" />

          <span>
            Tạo quà tương tự
          </span>
        </button>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-2 sm:p-4">
        <AnimatePresence mode="wait">
          {stage ===
            'proposal' && (
            <ProposalScreen
              key="proposal"
              config={config}
              onYesAccepted={
                openGifts
              }
            />
          )}

          {stage ===
            'gifts' && (
            <GiftSelector
              key="gifts"
              config={config}
              onSelectGift={(
                selected
              ) => {
                if (
                  selected ===
                  'gift1'
                ) {
                  setStage(
                    'memories'
                  );
                  return;
                }

                if (
                  selected ===
                  'gift2'
                ) {
                  setStage(
                    'music'
                  );
                  return;
                }

                if (
                  selected ===
                  'gift3'
                ) {
                  setStage(
                    'letter'
                  );
                }
              }}
              onReset={() =>
                setStage(
                  'proposal'
                )
              }
            />
          )}

          {stage ===
            'memories' && (
            <PolaroidGallery
              key="memories"
              photos={
                config.gifts
                  .gift1.photos
              }
              onBack={openGifts}
            />
          )}

          {stage ===
            'music' && (
            <VinylMusicPlayer
              key="music"
              playlist={
                config.gifts
                  .gift2.playlist
              }
              onBack={openGifts}
            />
          )}

          {stage ===
            'letter' && (
            <LoveLetter
              key="letter"
              letterData={
                config.gifts
                  .gift3.letter
              }
              senderName={
                config.couple
                  .senderName
              }
              receiverName={
                config.couple
                  .receiverName
              }
              onBack={openGifts}
            />
          )}
        </AnimatePresence>
      </div>

      <footer className="relative z-10 py-4 text-center text-[11px] font-medium text-rose-800/50">
        Dearly · made for someone special
      </footer>
    </main>
  );
};
