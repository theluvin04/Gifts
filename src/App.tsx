import React, {
  useEffect,
  useState,
} from 'react';
import {
  AnimatePresence,
  motion,
} from 'motion/react';

import {
  loveConfig as initialConfig,
} from './config/loveConfig';

import {
  AppStage,
  LoveConfig,
} from './types';

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

/* =========================================================
   TEMPLATE ROUTES
========================================================= */

const TEMPLATE_BASE =
  '/templates/love-01';

const ROUTES = {
  proposal: TEMPLATE_BASE,

  gifts:
    `${TEMPLATE_BASE}/gifts`,

  gift1:
    `${TEMPLATE_BASE}/gifts/memories`,

  gift2:
    `${TEMPLATE_BASE}/gifts/music`,

  gift3:
    `${TEMPLATE_BASE}/gifts/letter`,
} as const;

type RoutedStage =
  | 'proposal'
  | 'gifts'
  | 'gift1'
  | 'gift2'
  | 'gift3';

/* =========================================================
   PATH HELPERS
========================================================= */

const cleanPath = (
  pathname: string
) => {
  if (
    pathname.length > 1 &&
    pathname.endsWith('/')
  ) {
    return pathname.slice(0, -1);
  }

  return pathname;
};

const getStageFromPath = (
  pathname: string
): RoutedStage | null => {
  const path =
    cleanPath(pathname);

  if (path === ROUTES.proposal) {
    return 'proposal';
  }

  if (path === ROUTES.gifts) {
    return 'gifts';
  }

  if (path === ROUTES.gift1) {
    return 'gift1';
  }

  if (path === ROUTES.gift2) {
    return 'gift2';
  }

  if (path === ROUTES.gift3) {
    return 'gift3';
  }

  return null;
};

/* =========================================================
   APP
========================================================= */

export default function App() {
  /* =======================================================
     INITIAL ROUTE
  ======================================================= */

  const getInitialStage =
    (): RoutedStage => {
      const pathname =
        window.location.pathname;

      /*
       * Domain gốc
       * /
       *
       * tự chuyển thành
       * /templates/love-01
       */
      if (pathname === '/') {
        window.history.replaceState(
          {},
          '',
          ROUTES.proposal
        );

        return 'proposal';
      }

      const stage =
        getStageFromPath(pathname);

      return stage || 'proposal';
    };

  const initialStage =
    getInitialStage();

  const [
    stage,
    setStage,
  ] =
    useState<AppStage>(
      initialStage
    );

  const [
    invalidRoute,
    setInvalidRoute,
  ] = useState(() => {
    const pathname =
      window.location.pathname;

    if (pathname === '/') {
      return false;
    }

    return (
      getStageFromPath(
        pathname
      ) === null
    );
  });

  const [
    config,
    setConfig,
  ] =
    useState<LoveConfig>(
      initialConfig
    );

  const [
    isConfigOpen,
    setIsConfigOpen,
  ] = useState(false);

  /* =======================================================
     QUICK EDIT STATE
  ======================================================= */

  const [
    editSender,
    setEditSender,
  ] = useState(
    config.couple.senderName
  );

  const [
    editReceiver,
    setEditReceiver,
  ] = useState(
    config.couple.receiverName
  );

  const [
    editQuestion,
    setEditQuestion,
  ] = useState(
    config.proposal.question
  );

  const [
    editYesBtn,
    setEditYesBtn,
  ] = useState(
    config.proposal.yesBtnText
  );

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const navigateTo = (
    nextStage: RoutedStage,
    replace = false
  ) => {
    const nextPath =
      ROUTES[nextStage];

    const currentPath =
      cleanPath(
        window.location.pathname
      );

    setInvalidRoute(false);
    setStage(nextStage);

    /*
     * Không tạo history trùng.
     */
    if (
      currentPath === nextPath
    ) {
      return;
    }

    if (replace) {
      window.history.replaceState(
        {},
        '',
        nextPath
      );
    } else {
      window.history.pushState(
        {},
        '',
        nextPath
      );
    }

    window.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  };

  /* =======================================================
     BROWSER BACK / FORWARD
  ======================================================= */

  useEffect(() => {
    const handlePopState = () => {
      const pathname =
        window.location.pathname;

      const nextStage =
        getStageFromPath(
          pathname
        );

      if (!nextStage) {
        setInvalidRoute(true);
        return;
      }

      setInvalidRoute(false);
      setStage(nextStage);

      window.scrollTo({
        top: 0,
        behavior: 'instant',
      });
    };

    window.addEventListener(
      'popstate',
      handlePopState
    );

    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState
      );
    };
  }, []);

  /* =======================================================
     NORMALIZE TRAILING SLASH
  ======================================================= */

  useEffect(() => {
    const pathname =
      window.location.pathname;

    const cleaned =
      cleanPath(pathname);

    if (
      pathname !== cleaned &&
      getStageFromPath(cleaned)
    ) {
      window.history.replaceState(
        {},
        '',
        cleaned
      );
    }
  }, []);

  /* =======================================================
     SAVE QUICK CONFIG
  ======================================================= */

  const handleSaveConfig =
    () => {
      setConfig((prev) => ({
        ...prev,

        couple: {
          ...prev.couple,

          senderName:
            editSender,

          receiverName:
            editReceiver,
        },

        proposal: {
          ...prev.proposal,

          question:
            editQuestion,

          yesBtnText:
            editYesBtn,
        },

        gifts: {
          ...prev.gifts,

          gift3: {
            ...prev.gifts
              .gift3,

            letter: {
              ...prev.gifts
                .gift3
                .letter,

              salutation:
                `Gửi ${editReceiver},`,

              signature:
                editSender,
            },
          },
        },
      }));

      sfx.playSuccessChime();

      setIsConfigOpen(false);
    };

  /* =======================================================
     RESET
  ======================================================= */

  const handleReset = () => {
    sfx.playPop();

    navigateTo(
      'proposal'
    );
  };

  /* =======================================================
     INVALID URL
  ======================================================= */

  if (invalidRoute) {
    return (
      <main
        className="
          flex
          min-h-[100svh]
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
            rounded-[28px]
            border
            border-rose-200
            bg-white/85
            p-7
            text-center
            shadow-xl
            backdrop-blur-md
          "
        >
          <div
            className="
              mb-3
              text-4xl
            "
          >
            💌
          </div>

          <h1
            className="
              text-xl
              font-bold
              text-slate-800
            "
          >
            Trang này không tồn tại
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-slate-500
            "
          >
            Đường dẫn này không thuộc
            template hiện tại.
          </p>

          <button
            type="button"
            onClick={() => {
              navigateTo(
                'proposal',
                true
              );
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
            Về template
          </button>
        </div>
      </main>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

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
          config.audio
            .backgroundMusicUrl
        }
        musicTitle={
          config.audio
            .backgroundMusicTitle
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
            setIsConfigOpen(
              true
            )
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
        >
          <Settings
            className="
              h-3.5
              w-3.5
            "
          />

          <span
            className="
              hidden
              sm:inline
            "
          >
            Chỉnh sửa nhanh
          </span>
        </button>
      </div>

      {/* =================================================
          PAGE CONTENT
      ================================================= */}

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
        <AnimatePresence
          mode="wait"
        >
          {/* =============================================
              /templates/love-01
          ============================================= */}

          {stage ===
            'proposal' && (
            <ProposalScreen
              key="proposal-stage"
              config={config}
              onYesAccepted={() =>
                navigateTo(
                  'gifts'
                )
              }
            />
          )}

          {/* =============================================
              /templates/love-01/gifts
          ============================================= */}

          {stage ===
            'gifts' && (
            <GiftSelector
              key="gifts-stage"
              config={config}
              onSelectGift={(
                selectedStage
              ) => {
                if (
                  selectedStage ===
                  'gift1'
                ) {
                  navigateTo(
                    'gift1'
                  );
                  return;
                }

                if (
                  selectedStage ===
                  'gift2'
                ) {
                  navigateTo(
                    'gift2'
                  );
                  return;
                }

                if (
                  selectedStage ===
                  'gift3'
                ) {
                  navigateTo(
                    'gift3'
                  );
                }
              }}
              onReset={
                handleReset
              }
            />
          )}

          {/* =============================================
              /templates/love-01/gifts/memories
          ============================================= */}

          {stage ===
            'gift1' && (
            <PolaroidGallery
              key="gift1-stage"
              photos={
                config.gifts
                  .gift1
                  .photos
              }
              onBack={() =>
                navigateTo(
                  'gifts'
                )
              }
            />
          )}

          {/* =============================================
              /templates/love-01/gifts/music
          ============================================= */}

          {stage ===
            'gift2' && (
            <VinylMusicPlayer
              key="gift2-stage"
              playlist={
                config.gifts
                  .gift2
                  .playlist
              }
              onBack={() =>
                navigateTo(
                  'gifts'
                )
              }
            />
          )}

          {/* =============================================
              /templates/love-01/gifts/letter
          ============================================= */}

          {stage ===
            'gift3' && (
            <LoveLetter
              key="gift3-stage"

              letterData={
                config.gifts
                  .gift3
                  .letter
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
                navigateTo(
                  'gifts'
                )
              }
            />
          )}
        </AnimatePresence>
      </div>

      {/* =================================================
          FOOTER
      ================================================= */}

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
          <span>
            Made with
          </span>

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

      {/* =================================================
          CONFIG MODAL
      ================================================= */}

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
              {/* HEADER */}

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
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setIsConfigOpen(
                      false
                    )
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
                  <X
                    className="
                      h-4
                      w-4
                    "
                  />
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
                Hình ảnh, GIF, bài hát
                và nội dung nằm trong{' '}

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
                {/* RECEIVER */}

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
                    value={
                      editReceiver
                    }
                    onChange={(
                      e
                    ) =>
                      setEditReceiver(
                        e.target
                          .value
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

                {/* SENDER */}

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
                    value={
                      editSender
                    }
                    onChange={(
                      e
                    ) =>
                      setEditSender(
                        e.target
                          .value
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

                {/* QUESTION */}

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
                    value={
                      editQuestion
                    }
                    onChange={(
                      e
                    ) =>
                      setEditQuestion(
                        e.target
                          .value
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

                {/* YES */}

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
                    value={
                      editYesBtn
                    }
                    onChange={(
                      e
                    ) =>
                      setEditYesBtn(
                        e.target
                          .value
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

              {/* BUTTONS */}

              <div
                className="
                  flex
                  gap-2
                "
              >
                <button
                  type="button"
                  onClick={() => {
                    setEditSender(
                      initialConfig
                        .couple
                        .senderName
                    );

                    setEditReceiver(
                      initialConfig
                        .couple
                        .receiverName
                    );

                    setEditQuestion(
                      initialConfig
                        .proposal
                        .question
                    );

                    setEditYesBtn(
                      initialConfig
                        .proposal
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
                  onClick={
                    handleSaveConfig
                  }
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