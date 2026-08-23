import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { loveConfig as initialConfig } from './config/loveConfig';
import { AppStage, LoveConfig } from './types';

import { ProposalScreen } from './components/ProposalScreen';
import { GiftSelector } from './components/GiftSelector';
import { PolaroidGallery } from './components/gifts/PolaroidGallery';
import { VinylMusicPlayer } from './components/gifts/VinylMusicPlayer';
import { LoveLetter } from './components/gifts/LoveLetter';
import { AudioPlayer } from './components/AudioPlayer';

import {
  Heart,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';

import { sfx } from './utils/soundEffects';

/*
|--------------------------------------------------------------------------
| TEMPLATE ROUTE
|--------------------------------------------------------------------------
|
| Template hiện tại:
| /templates/love-01
|
| Sau này thêm template mới chỉ cần mở rộng hệ thống route/config.
|
*/

const TEMPLATE_PATH = '/templates/love-01';

export default function App() {
  /*
   * Bỏ IntroScreen hoàn toàn.
   * Khi vào template sẽ bắt đầu ngay tại Proposal.
   */
  const [stage, setStage] =
    useState<AppStage>('proposal');

  const [config, setConfig] =
    useState<LoveConfig>(initialConfig);

  const [isConfigOpen, setIsConfigOpen] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
   | URL TEMPLATE
   |--------------------------------------------------------------------------
   */

  const [isValidTemplate, setIsValidTemplate] =
    useState(true);

  useEffect(() => {
    const pathname = window.location.pathname;

    /*
     * Nếu người dùng vào domain gốc:
     *
     * https://domain.com/
     *
     * tự chuyển sang:
     *
     * https://domain.com/templates/love-01
     */
    if (pathname === '/') {
      window.history.replaceState(
        {},
        '',
        TEMPLATE_PATH
      );

      setIsValidTemplate(true);
      return;
    }

    /*
     * Template hiện tại.
     */
    if (pathname === TEMPLATE_PATH) {
      setIsValidTemplate(true);
      return;
    }

    /*
     * Cho phép URL có slash cuối:
     *
     * /templates/love-01/
     */
    if (pathname === `${TEMPLATE_PATH}/`) {
      window.history.replaceState(
        {},
        '',
        TEMPLATE_PATH
      );

      setIsValidTemplate(true);
      return;
    }

    setIsValidTemplate(false);
  }, []);

  /*
  |--------------------------------------------------------------------------
   | QUICK EDIT
   |--------------------------------------------------------------------------
   */

  const [editSender, setEditSender] =
    useState(config.couple.senderName);

  const [editReceiver, setEditReceiver] =
    useState(config.couple.receiverName);

  const [editQuestion, setEditQuestion] =
    useState(config.proposal.question);

  const [editYesBtn, setEditYesBtn] =
    useState(config.proposal.yesBtnText);

  const handleSaveConfig = () => {
    setConfig((prev) => ({
      ...prev,

      couple: {
        ...prev.couple,
        senderName: editSender,
        receiverName: editReceiver,
      },

      proposal: {
        ...prev.proposal,
        question: editQuestion,
        yesBtnText: editYesBtn,
      },

      gifts: {
        ...prev.gifts,

        gift3: {
          ...prev.gifts.gift3,

          letter: {
            ...prev.gifts.gift3.letter,
            salutation: `Gửi ${editReceiver},`,
            signature: editSender,
          },
        },
      },
    }));

    sfx.playSuccessChime();

    setIsConfigOpen(false);
  };

  /*
  |--------------------------------------------------------------------------
   | RESET TEMPLATE
   |--------------------------------------------------------------------------
   */

  const handleReset = () => {
    sfx.playPop();

    /*
     * Không còn Intro.
     * Reset quay về màn YES / NO.
     */
    setStage('proposal');
  };

  /*
  |--------------------------------------------------------------------------
   | INVALID TEMPLATE
   |--------------------------------------------------------------------------
   */

  if (!isValidTemplate) {
    return (
      <main
        className="
          flex
          min-h-[100svh]
          w-full
          items-center
          justify-center
          bg-gradient-to-b
          from-pink-50
          via-rose-50
          to-pink-100
          px-5
        "
      >
        <div
          className="
            w-full
            max-w-sm
            rounded-3xl
            border
            border-rose-200
            bg-white/80
            p-7
            text-center
            shadow-xl
            backdrop-blur
          "
        >
          <div className="mb-3 text-4xl">
            💌
          </div>

          <h1
            className="
              text-xl
              font-bold
              text-slate-800
            "
          >
            Template không tồn tại
          </h1>

          <p
            className="
              mt-2
              text-sm
              leading-relaxed
              text-slate-500
            "
          >
            Đường dẫn template này chưa được
            tạo.
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.href =
                TEMPLATE_PATH;
            }}
            className="
              mt-5
              rounded-full
              bg-rose-500
              px-5
              py-2.5
              text-sm
              font-bold
              text-white
              shadow-lg
              shadow-rose-500/20
            "
          >
            Mở Love Template
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      className="
        relative
        flex
        min-h-screen
        flex-col
        justify-between
        overflow-x-hidden
        bg-gradient-to-b
        from-pink-50
        via-rose-50
        to-pink-100
        text-slate-800
        selection:bg-pink-300
        selection:text-pink-900
      "
    >
      {/* BACKGROUND MUSIC */}
      <AudioPlayer
        musicUrl={
          config.audio.backgroundMusicUrl
        }
        musicTitle={
          config.audio.backgroundMusicTitle
        }
      />

      {/* QUICK CONFIG */}
      <div
        className="
          fixed
          left-4
          top-4
          z-40
        "
      >
        <button
          type="button"
          onClick={() =>
            setIsConfigOpen(true)
          }
          className="
            flex
            cursor-pointer
            items-center
            gap-1.5
            rounded-full
            border
            border-rose-200
            bg-white/80
            px-3
            py-2
            text-xs
            font-bold
            text-rose-700
            shadow-sm
            backdrop-blur-md
            transition
            hover:bg-white
          "
          title="Tùy chỉnh nhanh"
        >
          <Settings className="h-3.5 w-3.5" />

          <span className="hidden sm:inline">
            Chỉnh sửa nhanh
          </span>
        </button>
      </div>

      {/* TEMPLATE CONTENT */}
      <div
        className="
          relative
          z-10
          flex
          flex-1
          flex-col
          items-center
          justify-center
          p-2
          sm:p-4
        "
      >
        <AnimatePresence mode="wait">
          {/* YES / NO */}
          {stage === 'proposal' && (
            <ProposalScreen
              key="proposal-stage"
              config={config}
              onYesAccepted={() =>
                setStage('gifts')
              }
            />
          )}

          {/* 3 GIFTS */}
          {stage === 'gifts' && (
            <GiftSelector
              key="gifts-stage"
              config={config}
              onSelectGift={(
                selectedStage
              ) =>
                setStage(selectedStage)
              }
              onReset={handleReset}
            />
          )}

          {/* GIFT 1 */}
          {stage === 'gift1' && (
            <PolaroidGallery
              key="gift1-stage"
              photos={
                config.gifts.gift1.photos
              }
              onBack={() =>
                setStage('gifts')
              }
            />
          )}

          {/* GIFT 2 */}
          {stage === 'gift2' && (
            <VinylMusicPlayer
              key="gift2-stage"
              playlist={
                config.gifts.gift2
                  .playlist
              }
              onBack={() =>
                setStage('gifts')
              }
            />
          )}

          {/* GIFT 3 */}
          {stage === 'gift3' && (
            <LoveLetter
              key="gift3-stage"
              letterData={
                config.gifts.gift3
                  .letter
              }
              senderName={
                config.couple.senderName
              }
              receiverName={
                config.couple
                  .receiverName
              }
              onBack={() =>
                setStage('gifts')
              }
            />
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <footer
        className="
          relative
          z-10
          py-4
          text-center
          text-xs
          font-medium
          text-rose-800/60
        "
      >
        <p
          className="
            flex
            items-center
            justify-center
            gap-1
          "
        >
          <span>Made with</span>

          <Heart
            className="
              inline
              h-3.5
              w-3.5
              fill-rose-500
              text-rose-500
            "
          />

          <span>
            for someone special
          </span>
        </p>
      </footer>

      {/* CONFIG MODAL */}
      <AnimatePresence>
        {isConfigOpen && (
          <div
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-black/60
              p-4
              backdrop-blur-sm
            "
          >
            <motion.div
              initial={{
                scale: 0.9,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.9,
                opacity: 0,
              }}
              className="
                w-full
                max-w-md
                rounded-3xl
                border-2
                border-rose-200
                bg-white
                p-6
                shadow-2xl
              "
            >
              {/* MODAL HEADER */}
              <div
                className="
                  mb-4
                  flex
                  items-center
                  justify-between
                  border-b
                  border-slate-100
                  pb-2
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <Sparkles
                    className="
                      h-4
                      w-4
                      text-rose-500
                    "
                  />

                  <h3
                    className="
                      text-base
                      font-bold
                      text-slate-800
                    "
                  >
                    Tùy Chỉnh Nhanh
                    Website
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setIsConfigOpen(false)
                  }
                  className="
                    rounded-full
                    p-1.5
                    text-slate-400
                    transition
                    hover:bg-slate-100
                    hover:text-slate-600
                  "
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p
                className="
                  mb-4
                  text-xs
                  leading-relaxed
                  text-slate-500
                "
              >
                Hình ảnh, GIF, bài hát và
                nội dung chính nằm trong{' '}
                <code
                  className="
                    rounded
                    bg-rose-50
                    px-1.5
                    py-0.5
                    font-mono
                    font-bold
                    text-rose-600
                  "
                >
                  src/config/loveConfig.ts
                </code>
              </p>

              {/* FORM */}
              <div
                className="
                  mb-6
                  space-y-3
                  text-left
                "
              >
                <div>
                  <label
                    className="
                      mb-1
                      block
                      text-xs
                      font-bold
                      text-slate-700
                    "
                  >
                    Tên người nhận
                  </label>

                  <input
                    type="text"
                    value={editReceiver}
                    onChange={(e) =>
                      setEditReceiver(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      px-3.5
                      py-2
                      text-sm
                      focus:border-rose-500
                      focus:outline-none
                      focus:ring-2
                      focus:ring-rose-200
                    "
                  />
                </div>

                <div>
                  <label
                    className="
                      mb-1
                      block
                      text-xs
                      font-bold
                      text-slate-700
                    "
                  >
                    Tên người gửi
                  </label>

                  <input
                    type="text"
                    value={editSender}
                    onChange={(e) =>
                      setEditSender(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      px-3.5
                      py-2
                      text-sm
                      focus:border-rose-500
                      focus:outline-none
                      focus:ring-2
                      focus:ring-rose-200
                    "
                  />
                </div>

                <div>
                  <label
                    className="
                      mb-1
                      block
                      text-xs
                      font-bold
                      text-slate-700
                    "
                  >
                    Câu hỏi chính
                  </label>

                  <input
                    type="text"
                    value={editQuestion}
                    onChange={(e) =>
                      setEditQuestion(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      px-3.5
                      py-2
                      text-sm
                      focus:border-rose-500
                      focus:outline-none
                      focus:ring-2
                      focus:ring-rose-200
                    "
                  />
                </div>

                <div>
                  <label
                    className="
                      mb-1
                      block
                      text-xs
                      font-bold
                      text-slate-700
                    "
                  >
                    Nội dung nút YES
                  </label>

                  <input
                    type="text"
                    value={editYesBtn}
                    onChange={(e) =>
                      setEditYesBtn(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      px-3.5
                      py-2
                      text-sm
                      focus:border-rose-500
                      focus:outline-none
                      focus:ring-2
                      focus:ring-rose-200
                    "
                  />
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditSender(
                      initialConfig.couple
                        .senderName
                    );

                    setEditReceiver(
                      initialConfig.couple
                        .receiverName
                    );

                    setEditQuestion(
                      initialConfig.proposal
                        .question
                    );

                    setEditYesBtn(
                      initialConfig.proposal
                        .yesBtnText
                    );
                  }}
                  className="
                    cursor-pointer
                    rounded-xl
                    bg-slate-100
                    px-4
                    py-2.5
                    text-xs
                    font-bold
                    text-slate-600
                    transition
                    hover:bg-slate-200
                  "
                >
                  Mặc định
                </button>

                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="
                    flex-1
                    cursor-pointer
                    rounded-xl
                    bg-rose-500
                    py-2.5
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                    shadow-rose-500/30
                    transition
                    hover:bg-rose-600
                  "
                >
                  Lưu thay đổi ✨
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}