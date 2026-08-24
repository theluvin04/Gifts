import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { sfx } from '../../utils/soundEffects';

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
}> = ({
  photo,
  rotateClass,
  caption,
  animationFrom,
  delay,
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
    <div className="bg-white p-3 shadow-xl">
      <div className="aspect-square w-full overflow-hidden bg-pink-50">
        <img
          src={photo.url}
          alt={photo.caption || 'memory'}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="pt-3 text-center">
        <p className="text-[11px] italic text-rose-700 sm:text-xs">
          {caption || photo.caption || 'memory'}
        </p>
      </div>
    </div>
  </motion.div>
);

const FilmStrip: React.FC<{
  photos: PhotoItem[];
  delay: number;
  rotation: number;
  className?: string;
}> = ({
  photos,
  delay,
  rotation,
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
    }}
    className={[
      'absolute top-0 w-[150px] overflow-hidden border border-pink-200 bg-white shadow-[0_14px_30px_rgba(120,70,90,0.11)]',
      className,
    ].join(' ')}
  >
    {photos.map((photo, idx) => (
      <div
        key={`${photo.id}-${idx}`}
        className="border-b border-pink-200/70 bg-white p-2 last:border-b-0"
      >
        <div className="aspect-square overflow-hidden bg-pink-50">
          <img
            src={photo.url}
            alt={photo.caption || 'memory'}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    ))}
  </motion.div>
);

const CrossedFilmStrips: React.FC<{
  leftPhotos: PhotoItem[];
  rightPhotos: PhotoItem[];
  compact?: boolean;
}> = ({
  leftPhotos,
  rightPhotos,
  compact = false,
}) => (
  <div
    className={
      compact
        ? 'relative mx-auto h-[430px] w-[306px]'
        : 'relative left-1/2 h-[590px] w-[364px] -translate-x-1/2'
    }
  >
    <FilmStrip
      photos={leftPhotos}
      delay={0.1}
      rotation={
        compact ? -2.4 : -3.6
      }
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
        compact ? 2.4 : 3.6
      }
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
  onBack,
}) => {
  const safePhotos = photos.length ? photos : [];

  const leftTop = safePhotos[0];
  const leftBottom = safePhotos[1] || safePhotos[0];
  const rightTop = safePhotos[2] || safePhotos[0];
  const rightBottom = safePhotos[3] || safePhotos[0];

  const stripLeft = Array.from(
    { length: 4 },
    (_, i) => safePhotos[i % safePhotos.length]
  );

  const stripRight = Array.from(
    { length: 4 },
    (_, i) => safePhotos[(i + 2) % safePhotos.length]
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
        <div className="relative overflow-hidden rounded-[28px] bg-pink-50 px-10 py-10">
          {sparklePositions.map((item, index) => (
            <Sparkle key={index} {...item} />
          ))}

          <div className="relative z-10 grid grid-cols-[1fr_1fr_1fr] items-start gap-8">
            <div className="flex flex-col gap-6">
              <div className="w-[220px]">
                <PolaroidCard
                  photo={leftTop}
                  caption="memories with you"
                  rotateClass="-rotate-6"
                  animationFrom={{
                    x: -90,
                    y: -18,
                    rotate: -12,
                    scale: 0.92,
                  }}
                  delay={0.45}
                />
              </div>

              <div className="ml-5 w-[210px]">
                <PolaroidCard
                  photo={leftBottom}
                  caption="our little moments"
                  rotateClass="rotate-2"
                  animationFrom={{
                    x: -70,
                    y: 22,
                    rotate: 8,
                    scale: 0.92,
                  }}
                  delay={0.62}
                />
              </div>
            </div>

            <div className="flex w-full justify-center">
              <CrossedFilmStrips
                leftPhotos={stripLeft}
                rightPhotos={stripRight}
              />
            </div>

            <div className="flex flex-col items-end gap-6">
              <div className="w-[220px]">
                <PolaroidCard
                  photo={rightTop}
                  caption="you make me smile"
                  rotateClass="rotate-6"
                  animationFrom={{
                    x: 90,
                    y: -18,
                    rotate: 12,
                    scale: 0.92,
                  }}
                  delay={0.54}
                />
              </div>

              <div className="mr-4 w-[210px]">
                <PolaroidCard
                  photo={rightBottom}
                  caption="us, in frames"
                  rotateClass="-rotate-2"
                  animationFrom={{
                    x: 70,
                    y: 20,
                    rotate: -8,
                    scale: 0.92,
                  }}
                  delay={0.7}
                />
              </div>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.82 }}
            className="relative z-10 mt-8 text-center text-[34px] font-semibold italic text-rose-700"
          >
            Captured memories
          </motion.p>
        </div>
      </div>

      {/* MOBILE */}
      <div className="mx-auto max-w-[390px] sm:hidden">
        <div className="relative overflow-hidden rounded-[26px] bg-pink-50 px-4 py-6">
          <p className="mb-5 text-center text-2xl font-semibold italic text-rose-700">
            Captured memories
          </p>

          <div className="mb-5 flex justify-center">
            <CrossedFilmStrips
              leftPhotos={stripLeft}
              rightPhotos={stripRight}
              compact
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PolaroidCard
              photo={leftTop}
              caption="memories with you"
              rotateClass="-rotate-3"
              animationFrom={{ x: -40, scale: 0.94 }}
              delay={0.42}
            />

            <PolaroidCard
              photo={rightTop}
              caption="you make me smile"
              rotateClass="rotate-3"
              animationFrom={{ x: 40, scale: 0.94 }}
              delay={0.52}
            />

            <PolaroidCard
              photo={leftBottom}
              caption="our little moments"
              rotateClass="rotate-2"
              animationFrom={{ x: -35, scale: 0.94 }}
              delay={0.62}
            />

            <PolaroidCard
              photo={rightBottom}
              caption="us, in frames"
              rotateClass="-rotate-2"
              animationFrom={{ x: 35, scale: 0.94 }}
              delay={0.72}
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