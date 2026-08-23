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
  ArrowRight,
  Check,
  Gift,
  Heart,
  Image as ImageIcon,
  Music2,
  Settings,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react';

import { sfx } from './utils/soundEffects';

/* =========================================================
   ROUTES
========================================================= */

const TEMPLATE_BASE =
  '/templates/love-01';

const ROUTES = {
  home: '/',

  proposal:
    TEMPLATE_BASE,

  gifts:
    `${TEMPLATE_BASE}/gifts`,

  gift1:
    `${TEMPLATE_BASE}/gifts/memories`,

  gift2:
    `${TEMPLATE_BASE}/gifts/music`,

  gift3:
    `${TEMPLATE_BASE}/gifts/letter`,
} as const;

type TemplateRoute =
  | 'proposal'
  | 'gifts'
  | 'gift1'
  | 'gift2'
  | 'gift3';

type AppRoute =
  | 'home'
  | TemplateRoute;

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

const getRouteFromPath = (
  pathname: string
): AppRoute | null => {
  const path =
    cleanPath(pathname);

  if (path === ROUTES.home) {
    return 'home';
  }

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
   HOME PAGE
   Đặt ngay trong App.tsx để file này copy-paste là chạy,
   không phụ thuộc HomePage.tsx mới.
========================================================= */

interface HomePageProps {
  onOpenTemplate: () => void;
}

const HomePage: React.FC<HomePageProps> = ({
  onOpenTemplate,
}) => {
  const features = [
    {
      icon: ImageIcon,
      title: 'Ảnh của riêng bạn',
      description:
        'Thay ảnh và biến template thành câu chuyện thật của hai người.',
    },
    {
      icon: Music2,
      title: 'Nhạc riêng',
      description:
        'Thêm bài hát gắn với một kỷ niệm, một người hoặc một thời điểm.',
    },
    {
      icon: Wand2,
      title: 'Hiệu ứng tương tác',
      description:
        'Người nhận không chỉ xem mà còn bấm, mở và khám phá từng phần.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Chọn template',
      description:
        'Chọn trải nghiệm phù hợp với dịp và người bạn muốn tặng.',
    },
    {
      number: '02',
      title: 'Cá nhân hoá',
      description:
        'Thay tên, ảnh, nhạc và lời nhắn bằng nội dung của riêng bạn.',
    },
    {
      number: '03',
      title: 'Gửi món quà',
      description:
        'Nhận link riêng để gửi trực tiếp. QR sẽ được thêm ở bước sau.',
    },
  ];

  return (
    <div
      className="
        min-h-[100svh]
        w-full
        bg-[#fff9fb]
        text-slate-800
      "
    >
      {/* =================================================
          NAVIGATION
      ================================================= */}

      <header
        className="
          sticky
          top-0
          z-50
          border-b
          border-rose-100/70
          bg-[#fff9fb]/88
          backdrop-blur-xl
        "
      >
        <div
          className="
            mx-auto
            flex
            h-[68px]
            max-w-7xl
            items-center
            justify-between
            px-5
            sm:px-8
          "
        >
          <button
            type="button"
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              });
            }}
            className="
              flex
              items-center
              gap-2
            "
          >
            <span
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                bg-rose-500
                text-white
                shadow-sm
                shadow-rose-200
              "
            >
              <Heart
                className="
                  h-4
                  w-4
                  fill-current
                "
              />
            </span>

            <span
              className="
                text-lg
                font-bold
                tracking-[-0.04em]
                text-slate-900
              "
            >
              Gifts
            </span>
          </button>

          <nav
            className="
              hidden
              items-center
              gap-7
              text-sm
              font-semibold
              text-slate-500
              md:flex
            "
          >
            <a
              href="#templates"
              className="
                transition
                hover:text-rose-500
              "
            >
              Templates
            </a>

            <a
              href="#how-it-works"
              className="
                transition
                hover:text-rose-500
              "
            >
              Cách hoạt động
            </a>
          </nav>

          <button
            type="button"
            onClick={onOpenTemplate}
            className="
              rounded-full
              bg-slate-900
              px-4
              py-2.5
              text-xs
              font-bold
              text-white
              transition
              hover:bg-rose-500
              sm:px-5
              sm:text-sm
            "
          >
            Xem template
          </button>
        </div>
      </header>

      <main>
        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="
            relative
            overflow-hidden
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-[-260px]
              h-[560px]
              w-[820px]
              -translate-x-1/2
              rounded-full
              bg-rose-200/30
              blur-[110px]
            "
          />

          <div
            className="
              relative
              mx-auto
              grid
              max-w-7xl
              items-center
              gap-12
              px-5
              pb-20
              pt-16
              sm:px-8
              sm:pt-24
              lg:grid-cols-[1fr_0.9fr]
              lg:gap-16
              lg:pb-28
              lg:pt-28
            "
          >
            {/* HERO COPY */}

            <div
              className="
                mx-auto
                max-w-2xl
                text-center
                lg:mx-0
                lg:text-left
              "
            >
              <motion.div
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="
                  mb-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-rose-200
                  bg-white
                  px-3.5
                  py-2
                  text-xs
                  font-bold
                  text-rose-500
                  shadow-sm
                "
              >
                <Sparkles
                  className="
                    h-3.5
                    w-3.5
                  "
                />

                <span>
                  Digital gifts, made personal
                </span>
              </motion.div>

              <motion.h1
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.05,
                }}
                className="
                  text-[43px]
                  font-bold
                  leading-[1.03]
                  tracking-[-0.055em]
                  text-slate-900
                  sm:text-[62px]
                  lg:text-[72px]
                "
              >
                Một món quà
                <br />

                <span
                  className="
                    text-rose-500
                  "
                >
                  có câu chuyện.
                </span>
              </motion.h1>

              <motion.p
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.1,
                }}
                className="
                  mx-auto
                  mt-6
                  max-w-xl
                  text-[15px]
                  leading-7
                  text-slate-500
                  sm:text-[17px]
                  lg:mx-0
                "
              >
                Chọn một template, thêm ảnh,
                nhạc và lời nhắn của riêng bạn.
                Gửi người ấy một đường link nhỏ
                nhưng chứa cả một trải nghiệm.
              </motion.p>

              <motion.div
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.15,
                }}
                className="
                  mt-8
                  flex
                  flex-col
                  items-center
                  gap-3
                  sm:flex-row
                  sm:justify-center
                  lg:justify-start
                "
              >
                <button
                  type="button"
                  onClick={onOpenTemplate}
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-rose-500
                    px-6
                    py-3.5
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                    shadow-rose-200
                    transition
                    hover:-translate-y-0.5
                    hover:bg-rose-600
                    sm:w-auto
                  "
                >
                  Xem Love Template

                  <ArrowRight
                    className="
                      h-4
                      w-4
                    "
                  />
                </button>

                <a
                  href="#how-it-works"
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-slate-200
                    bg-white
                    px-6
                    py-3.5
                    text-sm
                    font-bold
                    text-slate-600
                    transition
                    hover:border-rose-200
                    hover:text-rose-500
                    sm:w-auto
                  "
                >
                  Xem cách hoạt động
                </a>
              </motion.div>

              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 0.25,
                }}
                className="
                  mt-7
                  flex
                  flex-wrap
                  justify-center
                  gap-x-5
                  gap-y-2
                  text-xs
                  font-semibold
                  text-slate-400
                  lg:justify-start
                "
              >
                <span
                  className="
                    flex
                    items-center
                    gap-1.5
                  "
                >
                  <Check
                    className="
                      h-3.5
                      w-3.5
                      text-rose-500
                    "
                  />

                  Không cần cài app
                </span>

                <span
                  className="
                    flex
                    items-center
                    gap-1.5
                  "
                >
                  <Check
                    className="
                      h-3.5
                      w-3.5
                      text-rose-500
                    "
                  />

                  Responsive mobile
                </span>

                <span
                  className="
                    flex
                    items-center
                    gap-1.5
                  "
                >
                  <Check
                    className="
                      h-3.5
                      w-3.5
                      text-rose-500
                    "
                  />

                  Cá nhân hoá
                </span>
              </motion.div>
            </div>

            {/* HERO PREVIEW */}

            <motion.div
              initial={{
                opacity: 0,
                y: 30,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                delay: 0.12,
                type: 'spring',
                stiffness: 120,
                damping: 18,
              }}
              className="
                relative
                mx-auto
                w-full
                max-w-[520px]
              "
            >
              <div
                className="
                  absolute
                  -left-5
                  top-12
                  h-28
                  w-28
                  rounded-full
                  bg-pink-200/50
                  blur-3xl
                "
              />

              <div
                className="
                  absolute
                  -right-7
                  bottom-10
                  h-32
                  w-32
                  rounded-full
                  bg-rose-200/60
                  blur-3xl
                "
              />

              <div
                className="
                  relative
                  overflow-hidden
                  rounded-[34px]
                  border
                  border-rose-100
                  bg-[#fff0f5]
                  p-5
                  shadow-[0_30px_80px_rgba(190,70,110,0.16)]
                  sm:p-7
                "
              >
                <div
                  className="
                    mb-5
                    flex
                    items-center
                    justify-between
                  "
                >
                  <div
                    className="
                      flex
                      gap-1.5
                    "
                  >
                    <span
                      className="
                        h-2.5
                        w-2.5
                        rounded-full
                        bg-rose-300
                      "
                    />

                    <span
                      className="
                        h-2.5
                        w-2.5
                        rounded-full
                        bg-pink-200
                      "
                    />

                    <span
                      className="
                        h-2.5
                        w-2.5
                        rounded-full
                        bg-white
                      "
                    />
                  </div>

                  <span
                    className="
                      rounded-full
                      bg-white/80
                      px-3
                      py-1
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-rose-400
                    "
                  >
                    Live Preview
                  </span>
                </div>

                <div
                  className="
                    flex
                    min-h-[400px]
                    flex-col
                    items-center
                    justify-center
                    rounded-[26px]
                    bg-[#fff7fa]
                    px-5
                    py-8
                    text-center
                    sm:min-h-[460px]
                  "
                >
                  <p
                    className="
                      font-heading
                      text-xl
                      font-semibold
                      text-rose-500
                      sm:text-2xl
                    "
                  >
                    I knew you'd say yes 💕
                  </p>

                  <img
                    src="/images/gifts/success.gif"
                    alt="Love template preview"
                    className="
                      mt-4
                      h-28
                      w-28
                      object-contain
                      sm:h-36
                      sm:w-36
                    "
                  />

                  <div
                    className="
                      mt-6
                      grid
                      w-full
                      grid-cols-3
                      gap-3
                    "
                  >
                    {[
                      '/images/gifts/gift-1.png',
                      '/images/gifts/gift-2.png',
                      '/images/gifts/gift-3.png',
                    ].map((src, index) => (
                      <motion.div
                        key={src}
                        whileHover={{
                          y: -4,
                        }}
                        className="
                          flex
                          aspect-square
                          items-center
                          justify-center
                          rounded-2xl
                          bg-[#fce8f1]
                          p-3
                          shadow-sm
                          sm:p-4
                        "
                      >
                        <img
                          src={src}
                          alt={`Gift ${index + 1}`}
                          className="
                            h-full
                            w-full
                            object-contain
                          "
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <motion.div
                animate={{
                  y: [0, -7, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="
                  absolute
                  -bottom-6
                  -left-3
                  hidden
                  rounded-2xl
                  border
                  border-rose-100
                  bg-white
                  px-4
                  py-3
                  shadow-xl
                  sm:block
                "
              >
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-rose-400
                  "
                >
                  Personal
                </p>

                <p
                  className="
                    mt-0.5
                    text-xs
                    font-semibold
                    text-slate-600
                  "
                >
                  ảnh + nhạc + lời nhắn
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* =================================================
            TEMPLATE CATALOG
        ================================================= */}

        <section
          id="templates"
          className="
            border-y
            border-rose-100
            bg-white
            py-20
            sm:py-24
          "
        >
          <div
            className="
              mx-auto
              max-w-7xl
              px-5
              sm:px-8
            "
          >
            <div
              className="
                mb-10
                flex
                flex-col
                justify-between
                gap-4
                sm:flex-row
                sm:items-end
              "
            >
              <div>
                <p
                  className="
                    mb-2
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-rose-400
                  "
                >
                  Templates
                </p>

                <h2
                  className="
                    text-3xl
                    font-bold
                    tracking-[-0.04em]
                    text-slate-900
                    sm:text-4xl
                  "
                >
                  Chọn câu chuyện của bạn
                </h2>
              </div>

              <p
                className="
                  max-w-md
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Bắt đầu với một mẫu, sau đó
                biến nó thành món quà chỉ thuộc
                về hai người.
              </p>
            </div>

            <div
              className="
                grid
                gap-5
                md:grid-cols-2
                lg:grid-cols-3
              "
            >
              {/* LOVE 01 */}

              <motion.button
                type="button"
                onClick={onOpenTemplate}
                whileHover={{
                  y: -6,
                }}
                className="
                  group
                  overflow-hidden
                  rounded-[28px]
                  border
                  border-rose-100
                  bg-[#fff8fa]
                  text-left
                  shadow-sm
                  transition
                  hover:shadow-xl
                  hover:shadow-rose-100/70
                "
              >
                <div
                  className="
                    relative
                    flex
                    aspect-[4/3]
                    items-center
                    justify-center
                    overflow-hidden
                    bg-[#fdebf2]
                    p-8
                  "
                >
                  <div
                    className="
                      absolute
                      right-4
                      top-4
                      z-10
                      rounded-full
                      bg-white
                      px-3
                      py-1.5
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.15em]
                      text-rose-500
                      shadow-sm
                    "
                  >
                    Available
                  </div>

                  <img
                    src="/images/gifts/success.gif"
                    alt="Love Story 01"
                    className="
                      h-[58%]
                      w-[58%]
                      object-contain
                      transition
                      duration-500
                      group-hover:scale-105
                    "
                  />
                </div>

                <div
                  className="
                    p-5
                    sm:p-6
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-4
                    "
                  >
                    <div>
                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.17em]
                          text-rose-400
                        "
                      >
                        Love
                      </p>

                      <h3
                        className="
                          mt-1.5
                          text-xl
                          font-bold
                          tracking-[-0.03em]
                          text-slate-900
                        "
                      >
                        Love Story 01
                      </h3>
                    </div>

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-rose-500
                        text-white
                        transition
                        group-hover:translate-x-1
                      "
                    >
                      <ArrowRight
                        className="
                          h-4
                          w-4
                        "
                      />
                    </div>
                  </div>

                  <p
                    className="
                      mt-3
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    YES/NO tương tác, album ảnh,
                    đĩa nhạc và một bức thư dành
                    riêng cho người nhận.
                  </p>
                </div>
              </motion.button>

              {/* BIRTHDAY COMING SOON */}

              <div
                className="
                  overflow-hidden
                  rounded-[28px]
                  border
                  border-slate-100
                  bg-slate-50/70
                "
              >
                <div
                  className="
                    flex
                    aspect-[4/3]
                    items-center
                    justify-center
                    bg-[#fff6e8]
                  "
                >
                  <div
                    className="
                      flex
                      h-24
                      w-24
                      items-center
                      justify-center
                      rounded-[28px]
                      bg-white
                      shadow-sm
                    "
                  >
                    <Gift
                      className="
                        h-9
                        w-9
                        text-amber-400
                      "
                    />
                  </div>
                </div>

                <div
                  className="
                    p-5
                    opacity-60
                    sm:p-6
                  "
                >
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.17em]
                      text-slate-400
                    "
                  >
                    Birthday
                  </p>

                  <h3
                    className="
                      mt-1.5
                      text-xl
                      font-bold
                      tracking-[-0.03em]
                      text-slate-700
                    "
                  >
                    Birthday Story
                  </h3>

                  <p
                    className="
                      mt-3
                      text-sm
                      text-slate-400
                    "
                  >
                    Sắp ra mắt
                  </p>
                </div>
              </div>

              {/* ANNIVERSARY COMING SOON */}

              <div
                className="
                  overflow-hidden
                  rounded-[28px]
                  border
                  border-slate-100
                  bg-slate-50/70
                "
              >
                <div
                  className="
                    flex
                    aspect-[4/3]
                    items-center
                    justify-center
                    bg-[#f2efff]
                  "
                >
                  <div
                    className="
                      flex
                      h-24
                      w-24
                      items-center
                      justify-center
                      rounded-[28px]
                      bg-white
                      shadow-sm
                    "
                  >
                    <Sparkles
                      className="
                        h-9
                        w-9
                        text-violet-400
                      "
                    />
                  </div>
                </div>

                <div
                  className="
                    p-5
                    opacity-60
                    sm:p-6
                  "
                >
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.17em]
                      text-slate-400
                    "
                  >
                    Anniversary
                  </p>

                  <h3
                    className="
                      mt-1.5
                      text-xl
                      font-bold
                      tracking-[-0.03em]
                      text-slate-700
                    "
                  >
                    Anniversary Story
                  </h3>

                  <p
                    className="
                      mt-3
                      text-sm
                      text-slate-400
                    "
                  >
                    Sắp ra mắt
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            HOW IT WORKS
        ================================================= */}

        <section
          id="how-it-works"
          className="
            py-20
            sm:py-28
          "
        >
          <div
            className="
              mx-auto
              max-w-7xl
              px-5
              sm:px-8
            "
          >
            <div
              className="
                mx-auto
                max-w-2xl
                text-center
              "
            >
              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-rose-400
                "
              >
                How it works
              </p>

              <h2
                className="
                  mt-3
                  text-3xl
                  font-bold
                  tracking-[-0.045em]
                  text-slate-900
                  sm:text-4xl
                "
              >
                Từ template thành món quà
                của riêng bạn
              </h2>
            </div>

            <div
              className="
                mt-12
                grid
                gap-5
                md:grid-cols-3
              "
            >
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="
                    rounded-[26px]
                    border
                    border-rose-100
                    bg-white
                    p-6
                    sm:p-7
                  "
                >
                  <span
                    className="
                      text-xs
                      font-bold
                      text-rose-400
                    "
                  >
                    {step.number}
                  </span>

                  <h3
                    className="
                      mt-5
                      text-lg
                      font-bold
                      text-slate-900
                    "
                  >
                    {step.title}
                  </h3>

                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =================================================
            FEATURES
        ================================================= */}

        <section
          className="
            px-5
            pb-20
            sm:px-8
            sm:pb-28
          "
        >
          <div
            className="
              mx-auto
              max-w-7xl
              overflow-hidden
              rounded-[34px]
              bg-slate-900
              px-6
              py-10
              text-white
              sm:px-10
              sm:py-14
              lg:px-14
            "
          >
            <div
              className="
                grid
                gap-10
                lg:grid-cols-[0.8fr_1.2fr]
                lg:items-center
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-rose-300
                  "
                >
                  More than a card
                </p>

                <h2
                  className="
                    mt-3
                    max-w-md
                    text-3xl
                    font-bold
                    tracking-[-0.045em]
                    sm:text-4xl
                  "
                >
                  Một website nhỏ dành riêng
                  cho một người.
                </h2>
              </div>

              <div
                className="
                  grid
                  gap-4
                  sm:grid-cols-3
                "
              >
                {features.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className="
                        rounded-2xl
                        bg-white/10
                        p-5
                      "
                    >
                      <Icon
                        className="
                          h-5
                          w-5
                          text-rose-300
                        "
                      />

                      <h3
                        className="
                          mt-4
                          text-sm
                          font-bold
                        "
                      >
                        {feature.title}
                      </h3>

                      <p
                        className="
                          mt-2
                          text-xs
                          leading-5
                          text-white/55
                        "
                      >
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            FINAL CTA
        ================================================= */}

        <section
          className="
            border-t
            border-rose-100
            bg-white
            py-20
            text-center
          "
        >
          <div
            className="
              mx-auto
              max-w-2xl
              px-5
            "
          >
            <img
              src="/images/cat-default.gif"
              alt=""
              className="
                mx-auto
                h-24
                w-24
                object-contain
              "
            />

            <h2
              className="
                mt-5
                text-3xl
                font-bold
                tracking-[-0.045em]
                text-slate-900
                sm:text-4xl
              "
            >
              Thử template đầu tiên?
            </h2>

            <p
              className="
                mx-auto
                mt-3
                max-w-md
                text-sm
                leading-6
                text-slate-500
              "
            >
              Mở Love Story 01 để xem toàn bộ
              trải nghiệm trước khi làm tiếp
              hệ thống cá nhân hoá và QR.
            </p>

            <button
              type="button"
              onClick={onOpenTemplate}
              className="
                mt-7
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-rose-500
                px-6
                py-3.5
                text-sm
                font-bold
                text-white
                shadow-lg
                shadow-rose-200
              "
            >
              Mở Love Story 01

              <ArrowRight
                className="
                  h-4
                  w-4
                "
              />
            </button>
          </div>
        </section>
      </main>

      {/* =================================================
          HOME FOOTER
      ================================================= */}

      <footer
        className="
          border-t
          border-rose-100
          bg-white
          py-7
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-7xl
            flex-col
            items-center
            justify-between
            gap-3
            px-5
            text-xs
            text-slate-400
            sm:flex-row
            sm:px-8
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              font-bold
              text-slate-700
            "
          >
            <Heart
              className="
                h-3.5
                w-3.5
                fill-rose-500
                text-rose-500
              "
            />

            Gifts
          </div>

          <span>
            Digital gifts for special moments.
          </span>
        </div>
      </footer>
    </div>
  );
};

/* =========================================================
   APP
========================================================= */

export default function App() {
  /* =======================================================
     INITIAL ROUTE
  ======================================================= */

  const getInitialRoute =
    (): AppRoute => {
      const route =
        getRouteFromPath(
          window.location.pathname
        );

      return route || 'home';
    };

  const initialRoute =
    getInitialRoute();

  const [
    route,
    setRoute,
  ] =
    useState<AppRoute>(
      initialRoute
    );

  const [
    invalidRoute,
    setInvalidRoute,
  ] = useState(() => {
    return (
      getRouteFromPath(
        window.location.pathname
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
    nextRoute: AppRoute,
    replace = false
  ) => {
    const nextPath =
      ROUTES[nextRoute];

    const currentPath =
      cleanPath(
        window.location.pathname
      );

    setInvalidRoute(false);
    setRoute(nextRoute);

    if (
      currentPath !== nextPath
    ) {
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
    }

    window.scrollTo({
      top: 0,
      behavior: 'auto',
    });
  };

  /* =======================================================
     BROWSER BACK / FORWARD
  ======================================================= */

  useEffect(() => {
    const handlePopState = () => {
      const nextRoute =
        getRouteFromPath(
          window.location.pathname
        );

      if (!nextRoute) {
        setInvalidRoute(true);
        return;
      }

      setInvalidRoute(false);
      setRoute(nextRoute);

      window.scrollTo({
        top: 0,
        behavior: 'auto',
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
      getRouteFromPath(cleaned)
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
            ...prev.gifts.gift3,

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
     RESET TEMPLATE
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
          bg-[#fff9fb]
          px-5
        "
      >
        <div
          className="
            w-full
            max-w-sm
            rounded-[28px]
            border
            border-rose-100
            bg-white
            p-7
            text-center
            shadow-xl
          "
        >
          <div
            className="
              text-4xl
            "
          >
            💌
          </div>

          <h1
            className="
              mt-3
              text-xl
              font-bold
              text-slate-900
            "
          >
            Trang không tồn tại
          </h1>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-500
            "
          >
            Đường dẫn này chưa được tạo trong
            website hiện tại.
          </p>

          <button
            type="button"
            onClick={() =>
              navigateTo(
                'home',
                true
              )
            }
            className="
              mt-5
              rounded-full
              bg-rose-500
              px-5
              py-2.5
              text-sm
              font-bold
              text-white
            "
          >
            Về trang chủ
          </button>
        </div>
      </main>
    );
  }

  /* =======================================================
     HOME ROUTE /
  ======================================================= */

  if (route === 'home') {
    return (
      <HomePage
        onOpenTemplate={() =>
          navigateTo(
            'proposal'
          )
        }
      />
    );
  }

  /* =======================================================
     TEMPLATE ROUTES
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
          title="Tùy chỉnh nhanh"
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
          TEMPLATE CONTENT
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
          {/* /templates/love-01 */}

          {route === 'proposal' && (
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

          {/* /templates/love-01/gifts */}

          {route === 'gifts' && (
            <GiftSelector
              key="gifts-stage"
              config={config}
              onSelectGift={(
                selectedStage: AppStage
              ) => {
                if (
                  selectedStage === 'gift1'
                ) {
                  navigateTo('gift1');
                  return;
                }

                if (
                  selectedStage === 'gift2'
                ) {
                  navigateTo('gift2');
                  return;
                }

                if (
                  selectedStage === 'gift3'
                ) {
                  navigateTo('gift3');
                }
              }}
              onReset={handleReset}
            />
          )}

          {/* /templates/love-01/gifts/memories */}

          {route === 'gift1' && (
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

          {/* /templates/love-01/gifts/music */}

          {route === 'gift2' && (
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

          {/* /templates/love-01/gifts/letter */}

          {route === 'gift3' && (
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
          TEMPLATE FOOTER
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
                Hình ảnh, GIF, bài hát và
                nội dung nằm trong{' '}

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