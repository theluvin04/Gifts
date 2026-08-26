import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { sfx } from '../../utils/soundEffects';

import type {
  TemplateDesignConfig,
} from '../../templates/design';

import type {
  MemoryDisplayCaptions,
} from '../../types';

interface PhotoItem {
  id: string;
  url: string;
  caption?: string;
  date?: string;
  rotation?: number;
  location?: string;
}

interface PolaroidGalleryProps {
  photos: PhotoItem[];

  design:
    TemplateDesignConfig;

  /**
   * Nội dung khách được sửa.
   * Nếu chưa có thì dùng caption
   * mặc định trong mẫu gốc Admin.
   */
  captions?:
    Partial<
      MemoryDisplayCaptions
    >;

  onBack: () => void;
}

const sparklePositions = [
  { top: '18%', left: '31%', delay: 0.2 },
  { top: '28%', left: '33%', delay: 0.8 },
  { top: '55%', left: '34%', delay: 0.4 },
  { top: '26%', right: '31%', delay: 1.1 },
  { top: '48%', right: '33%', delay: 0.6 },
  { top: '58%', left: '63%', delay: 1.4 },
];

const Sparkle: React.FC<{
  top: string;
  left?: string;
  right?: string;
  delay: number;
  design?: TemplateDesignConfig;
}> = ({ top, left, right, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.6 }}
    animate={{
      opacity: [0.2, 1, 0.2],
      scale: [0.7, 1.1, 0.7],
    }}
    transition={{
      duration: 1.8,
      repeat: Infinity,
      delay,
      ease: 'easeInOut',
    }}
    className="absolute z-0 text-pink-300"
    style={{ top, left, right }}
  >
    ✦
  </motion.div>
);

const PolaroidCard: React.FC<{
  photo: PhotoItem;
  rotateClass: string;
  caption?: string;
  animationFrom: {
    x?: number;
    y?: number;
    rotate?: number;
    scale?: number;
  };
  delay: number;
  design?: TemplateDesignConfig;
}> = ({
  photo,
  rotateClass,
  caption,
  animationFrom,
  delay,
  design,
}) => (
  <motion.div
    initial={{
      opacity: 0,
      ...animationFrom,
    }}
    animate={{
      opacity: 1,
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
    }}
    transition={{
      type: 'spring',
      stiffness: 180,
      damping: 18,
      delay,
    }}
    whileHover={{
      y: -5,
      rotate: 0,
      scale: 1.02,
    }}
    className={rotateClass}
  >
    <div
      style={{
        background:
          design?.memories
            ?.polaroidBackground || '#ffffff',
      }}
      className="p-3 shadow-xl"
    >
      <div className="aspect-square w-full overflow-hidden bg-pink-50">
        <img
          src={photo.url}
          alt={photo.caption || 'memory'}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="pt-3 text-center">
        <p
          style={{
            color:
              design?.memories
                ?.captionColor,
            fontFamily:
              design?.memories
                ?.captionFont,
            fontSize:
              design?.memories?.captionSize ? `${design.memories.captionSize}px` : undefined,
          }}
          className="italic"
        >
          {caption || photo.caption || 'memory'}
        </p>
      </div>
    </div>
  </motion.div>
);

type FilmPhoto =
  PhotoItem |
  null;

const FilmStrip: React.FC<{
  photos: FilmPhoto[];
  delay: number;
  rotation: number;
  compact?: boolean;
  design: TemplateDesignConfig;
  className?: string;
}> = ({
  photos,
  delay,
  rotation,
  compact = false,
  design,
  className = '',
}) => (
  <motion.div
    initial={{
      opacity: 0,
      y: -22,
      scale: 0.94,
      rotate:
        rotation * 1.35,
    }}
    animate={{
      opacity: 1,
      y: 0,
      scale: 1,
      rotate: rotation,
    }}
    transition={{
      type: 'spring',
      stiffness: 170,
      damping: 18,
      delay,
    }}
    style={{
      transformOrigin:
        '50% 0%',
      background:
        design.memories
          .polaroidBackground,
      borderColor:
        design.memories
          .filmBorder,
    }}
    className={[
      'absolute top-0 overflow-hidden border border-pink-200 bg-white shadow-[0_14px_30px_rgba(120,70,90,0.11)]',
      compact
        ? 'w-[96px]'
        : 'w-[150px]',
      className,
    ].join(' ')}
  >
    {photos.map(
      (
        photo,
        idx
      ) => (
        <div
          key={
            photo
              ? `${photo.id}-${idx}`
              : `empty-film-${idx}`
          }
          style={{
            background:
              design.memories
                .polaroidBackground,
            borderColor:
              design.memories
                .filmBorder,
          }}
          className={[
            'border-b last:border-b-0',
            compact
              ? 'p-1.5'
              : 'p-2',
          ].join(' ')}
        >
          <div
            style={{
              background:
                design.colors
                  .surfaceSoft,
            }}
            className="aspect-square overflow-hidden"
          >
            {photo?.url ? (
              <img
                src={
                  photo.url
                }
                alt={
                  photo.caption ||
                  'memory'
                }
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg text-rose-200">
                ♡
              </div>
            )}
          </div>
        </div>
      )
    )}
  </motion.div>
);

const CrossedFilmStrips: React.FC<{
  leftPhotos: FilmPhoto[];
  rightPhotos: FilmPhoto[];
  compact?: boolean;
  design: TemplateDesignConfig;
}> = ({
  leftPhotos,
  rightPhotos,
  compact = false,
  design,
}) => (
  <div
    className={
      compact
        ? 'relative mx-auto h-[220px] w-[218px] max-w-full'
        : 'relative left-1/2 h-[330px] w-[364px] -translate-x-1/2'
    }
  >
    <FilmStrip
      photos={leftPhotos}
      delay={0.1}
      rotation={
        compact ? -2 : -3.6
      }
      compact={compact}
      design={design}
      className={
        compact
          ? 'left-0'
          : 'left-0'
      }
    />

    <FilmStrip
      photos={rightPhotos}
      delay={0.22}
      rotation={
        compact ? 2 : 3.6
      }
      compact={compact}
      design={design}
      className={
        compact
          ? 'right-0'
          : 'right-0'
      }
    />
  </div>
);

export const PolaroidGallery: React.FC<PolaroidGalleryProps> = ({
  photos,
  design,
  captions,
  onBack,
}) => {
  const safePhotos =
    photos.length
      ? photos
      : [];

  const visibleCaptions:
    MemoryDisplayCaptions = {
      ...design.memories
        .captions,
      ...(captions || {}),
    };

  const leftTop = safePhotos[0];
  const leftBottom = safePhotos[1] || safePhotos[0];
  const rightTop = safePhotos[2] || safePhotos[0];
  const rightBottom = safePhotos[3] || safePhotos[0];

  /**
   * Ảnh 1-4 chỉ dùng cho
   * 4 Polaroid lớn bên ngoài.
   *
   * Ảnh 5-8 chỉ dùng cho
   * 2 dãy collage ở giữa.
   *
   * Không modulo / không quay vòng,
   * nên không lấy lại ảnh ngoài.
   */
  const centerPhotos:
    FilmPhoto[] =
    Array.from(
      {
        length: 4,
      },
      (
        _,
        index
      ) =>
        safePhotos[
          index + 4
        ] ||
        null
    );

  const stripLeft =
    centerPhotos.slice(
      0,
      2
    );

  const stripRight =
    centerPhotos.slice(
      2,
      4
    );

  if (!safePhotos.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-[100svh] w-full overflow-hidden px-4 py-8"
    >
      {/* DESKTOP */}
      <div className="mx-auto hidden max-w-6xl sm:block">
        <div
          style={{
            background:
              design.memories
                .background,
          }}
          className="relative overflow-hidden rounded-[28px] px-10 py-10"
        >
          {sparklePositions.map((item, index) => (
            <Sparkle key={index} {...item} />
          ))}

          <div className="relative z-10 grid grid-cols-[1fr_1fr_1fr] items-start gap-8">
            <div className="flex flex-col gap-6">
              <div className="w-[220px]">
                <PolaroidCard
                  photo={leftTop}
                  caption={visibleCaptions.leftTop}
                  rotateClass="-rotate-6"
                  animationFrom={{
                    x: -90,
                    y: -18,
                    rotate: -12,
                    scale: 0.92,
                  }}
                  delay={0.45}
                  design={design}
                />
              </div>

              <div className="ml-5 w-[210px]">
                <PolaroidCard
                  photo={leftBottom}
                  caption={visibleCaptions.leftBottom}
                  rotateClass="rotate-2"
                  animationFrom={{
                    x: -70,
                    y: 22,
                    rotate: 8,
                    scale: 0.92,
                  }}
                  delay={0.62}
                  design={design}
                />
              </div>
            </div>

            <div className="flex w-full justify-center">
              <CrossedFilmStrips
                leftPhotos={stripLeft}
                rightPhotos={stripRight}
                design={design}
              />
            </div>

            <div className="flex flex-col items-end gap-6">
              <div className="w-[220px]">
                <PolaroidCard
                  photo={rightTop}
                  caption={visibleCaptions.rightTop}
                  rotateClass="rotate-6"
                  animationFrom={{
                    x: 90,
                    y: -18,
                    rotate: 12,
                    scale: 0.92,
                  }}
                  delay={0.54}
                  design={design}
                />
              </div>

              <div className="mr-4 w-[210px]">
                <PolaroidCard
                  photo={rightBottom}
                  caption={visibleCaptions.rightBottom}
                  rotateClass="-rotate-2"
                  animationFrom={{
                    x: 70,
                    y: 20,
                    rotate: -8,
                    scale: 0.92,
                  }}
                  delay={0.7}
                  design={design}
                />
              </div>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.82 }}
            style={{
              color:
                design.memories
                  .titleColor,
              fontFamily:
                design.memories
                  .titleFont,
              fontSize:
                `${design.memories.titleSize}px`,
            }}
            className="relative z-10 mt-8 text-center font-semibold italic"
          >
            {design.memories.title}
          </motion.p>
        </div>
      </div>

      {/* MOBILE */}
      <div className="mx-auto w-full min-w-0 max-w-[390px] overflow-hidden sm:hidden">
        <div
          style={{
            background:
              design.memories
                .background,
          }}
          className="relative w-full min-w-0 overflow-hidden rounded-[24px] px-2.5 py-4 min-[360px]:px-3 min-[360px]:py-5"
        >
          <p
            style={{
              color:
                design.memories
                  .titleColor,
              fontFamily:
                design.memories
                  .titleFont,
              fontSize:
                `${Math.max(
                  22,
                  Math.round(
                    design.memories.titleSize * 0.72
                  )
                )}px`,
            }}
            className="mb-5 text-center font-semibold italic"
          >
            {design.memories.title}
          </p>

          <div className="mb-6 min-h-[220px]">
            <CrossedFilmStrips
              leftPhotos={stripLeft}
              rightPhotos={stripRight}
              compact
              design={design}
            />
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-2.5 min-[360px]:gap-3">
            <PolaroidCard
              photo={leftTop}
              caption={visibleCaptions.leftTop}
              rotateClass="-rotate-3"
              animationFrom={{ x: -40, scale: 0.94 }}
              delay={0.42}
              design={design}
            />

            <PolaroidCard
              photo={rightTop}
              caption={visibleCaptions.rightTop}
              rotateClass="rotate-3"
              animationFrom={{ x: 40, scale: 0.94 }}
              delay={0.52}
              design={design}
            />

            <PolaroidCard
              photo={leftBottom}
              caption={visibleCaptions.leftBottom}
              rotateClass="rotate-2"
              animationFrom={{ x: -35, scale: 0.94 }}
              delay={0.62}
              design={design}
            />

            <PolaroidCard
              photo={rightBottom}
              caption={visibleCaptions.rightBottom}
              rotateClass="-rotate-2"
              animationFrom={{ x: 35, scale: 0.94 }}
              delay={0.72}
              design={design}
            />
          </div>
        </div>
      </div>

      {/* BACK - LUÔN Ở CUỐI */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        onClick={() => {
          sfx.playPop();
          onBack();
        }}
        className="
          mx-auto
          mt-10
          flex
          items-center
          justify-center
          gap-1.5
          rounded-full
          border
          border-rose-200
          bg-white/80
          px-5
          py-2.5
          text-xs
          font-semibold
          text-rose-600
          shadow-sm
        "
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Quay lại 3 món quà</span>
      </motion.button>
    </motion.section>
  );
};