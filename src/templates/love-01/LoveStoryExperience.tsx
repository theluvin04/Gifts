import React from 'react';

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
  SceneTransition,
  useSceneController,
} from '../../engine';

import {
  sfx,
} from '../../utils/soundEffects';

import {
  DEFAULT_LOVE_TEMPLATE_DESIGN,
} from '../design';

import {
  LOVE_ASSET_SLOT_IDS,
} from '../assets';

import {
  LOVE01_SCENE_TRANSITIONS,
} from './sceneConfig';

import type {
  Love01SceneId,
} from './sceneConfig';

interface LoveStoryExperienceProps {
  config: LoveConfig;
  onCreateSimilar: () => void;
}

export const LoveStoryExperience:
React.FC<
  LoveStoryExperienceProps
> = ({
  config,
  onCreateSimilar,
}) => {
  const {
    scene: stage,
    goToScene,
    reset,
  } =
    useSceneController<
      Love01SceneId
    >(
      'proposal'
    );

  const design =
    config.design ||
    DEFAULT_LOVE_TEMPLATE_DESIGN;

  const envelopeImage =
    config
      .resolvedAssets?.[
        LOVE_ASSET_SLOT_IDS
          .letterEnvelope
      ] ||
    '/images/letter/envelope-cover.png';

  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  };

  const openGifts = (
    replace = false
  ) => {
    sfx.playPop();

    goToScene(
      'gifts',
      {
        replace,
      }
    );

    scrollTop();
  };

  const openGiftScene = (
    selected:
      string
  ) => {
    if (
      selected ===
      'gift1'
    ) {
      goToScene(
        'memories'
      );
      scrollTop();
      return;
    }

    if (
      selected ===
      'gift2'
    ) {
      goToScene(
        'music'
      );
      scrollTop();
      return;
    }

    if (
      selected ===
      'gift3'
    ) {
      goToScene(
        'letter'
      );
      scrollTop();
    }
  };

  const resetExperience =
    () => {
      reset(
        'proposal'
      );

      scrollTop();
    };

  return (
    <main
      style={{
        background:
          design.colors
            .pageBackground,
        color:
          design.colors.text,
        fontFamily:
          design.fonts.body,
      }}
      className="dearly-love-theme relative flex min-h-[100svh] flex-col overflow-x-hidden"
    >
      <style>{`
        .dearly-stage-music .font-handwriting {
          font-family: ${design.music.titleFont} !important;
          color: ${design.music.titleColor} !important;
        }

        .dearly-stage-music [class*="bg-[#f8a9c4]"] {
          background-color: ${design.music.vinylBackground} !important;
        }

        .dearly-stage-music [class*="bg-[#e874a1]"] {
          background-color: ${design.music.playerBackground} !important;
        }

        .dearly-stage-music [class*="text-pink-500"],
        .dearly-stage-music [class*="text-rose-"] {
          color: ${design.music.controlAccent} !important;
        }

        .dearly-stage-letter [style*="Dancing Script"] {
          font-family: ${design.letter.scriptFont} !important;
        }

        .dearly-stage-letter [style*="Quicksand"] {
          font-family: ${design.letter.bodyFont} !important;
        }

        .dearly-stage-letter [class*="bg-[#fffdf9]"] {
          background-color: ${design.letter.paperBackground} !important;
        }

        .dearly-stage-letter [class*="text-slate-700"] {
          color: ${design.letter.bodyText} !important;
        }

        .dearly-stage-letter [class*="text-rose-600"],
        .dearly-stage-letter [class*="text-rose-500"] {
          color: ${design.letter.accent} !important;
        }

        .dearly-stage-letter button[aria-label="Open letter"] {
          background-image: var(--dearly-envelope-image);
          background-position: center;
          background-repeat: no-repeat;
          background-size: contain;
        }

        .dearly-stage-letter button[aria-label="Open letter"] > img {
          opacity: 0;
        }
      `}</style>

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

      <div className="fixed left-3 top-3 z-40 sm:left-4 sm:top-4">
        <button
          type="button"
          onClick={
            onCreateSimilar
          }
          style={{
            color:
              design.colors.text,
            background:
              design.colors.surface,
          }}
          className="inline-flex items-center gap-1.5 rounded-[14px] border border-black/10 px-3 py-2 text-[11px] font-bold shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur-md transition sm:gap-2 sm:px-4 sm:py-2.5 sm:text-xs"
        >
          <Sparkles
            style={{
              color:
                design.colors.accent,
            }}
            className="h-3.5 w-3.5"
          />

          <span>
            Tạo quà tương tự
          </span>
        </button>
      </div>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col items-center justify-center px-2 pb-2 pt-[78px] sm:p-4">
        <SceneTransition
          sceneKey={
            stage
          }
          transition={
            LOVE01_SCENE_TRANSITIONS[
              stage
            ]
          }
        >
          {stage ===
            'proposal' && (
            <ProposalScreen
              config={config}
              design={design}
              onYesAccepted={() =>
                openGifts(
                  false
                )
              }
            />
          )}

          {stage ===
            'gifts' && (
            <GiftSelector
              config={config}
              design={design}
              onSelectGift={
                openGiftScene
              }
              onReset={
                resetExperience
              }
            />
          )}

          {stage ===
            'memories' && (
            <PolaroidGallery
              photos={
                config.gifts
                  .gift1.photos
              }
              design={design}
              captions={
                config.gifts
                  .gift1
                  .displayCaptions
              }
              onBack={() =>
                openGifts(
                  true
                )
              }
            />
          )}

          {stage ===
            'music' && (
            <div className="dearly-stage-music w-full min-w-0">
              <VinylMusicPlayer
                playlist={
                  config.gifts
                    .gift2.playlist
                }
                onBack={() =>
                  openGifts(
                    true
                  )
                }
              />
            </div>
          )}

          {stage ===
            'letter' && (
            <div
              style={{
                '--dearly-envelope-image':
                  `url("${envelopeImage}")`,
              } as React.CSSProperties}
              className="dearly-stage-letter w-full min-w-0"
            >
              <LoveLetter
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
                onBack={() =>
                  openGifts(
                    true
                  )
                }
              />
            </div>
          )}
        </SceneTransition>
      </div>

      <footer
        style={{
          color:
            design.colors
              .mutedText,
        }}
        className="relative z-10 py-4 text-center text-[11px] font-medium"
      >
        Dearly · made for someone special
      </footer>
    </main>
  );
};
