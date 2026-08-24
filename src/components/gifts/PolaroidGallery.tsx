import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

import type { PhotoMemory } from '../../types';

interface PolaroidGalleryProps {
  photos: PhotoMemory[];
  onBack: () => void;
}

const fallbackCaptions = [
  'memories with you',
  'little happy moments',
  'our sweetest chapter',
  'you make me smile',
  'us, in frames',
  'forever feels soft',
  'just you and me',
  'captured with love',
];

const desktopCardClasses = [
  'left-[6%] top-[7%] w-[28%] rotate-[-6deg]',
  'left-[10%] top-[50%] w-[25%] rotate-[2deg]',
  'right-[9%] top-[8%] w-[28%] rotate-[5deg]',
  'right-[10%] top-[52%] w-[25%] rotate-[-3deg]',
];

const stripRotations = ['rotate-[-4deg]', 'rotate-[4deg]'];

function buildDisplayPhotos(photos: PhotoMemory[]) {
  const safePhotos =
    photos.length > 0
      ? photos
      : [
          {
            id: 'fallback-1',
            url: 'https://images.unsplash.com/photo-1516589091380-5d8e87df6999?auto=format&fit=crop&w=900&q=80',
            caption: 'memories with you',
          },
          {
            id: 'fallback-2',
            url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
            caption: 'our little moments',
          },
          {
            id: 'fallback-3',
            url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80',
            caption: 'you make me smile',
          },
          {
            id: 'fallback-4',
            url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=80',
            caption: 'us, in frames',
          },
        ];

  const needed = 8;
  return Array.from({ length: needed }, (_, index) => {
    const source = safePhotos[index % safePhotos.length];
    return {
      ...source,
      caption:
        source.caption?.trim() ||
        fallbackCaptions[index % fallbackCaptions.length],
    };
  });
}

function PolaroidCard({
  photo,
  className,
  delay,
}: {
  photo: PhotoMemory;
  className: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay }}
      className={`absolute ${className}`}
    >
      <div className="rounded-[2px] bg-white p-4 pb-6 shadow-[0_20px_45px_rgba(86,48,68,0.15)]">
        <div className="aspect-[1/1] overflow-hidden bg-[#f4dfe6]">
          <img
            src={photo.url}
            alt={photo.caption}
            className="h-full w-full object-cover"
          />
        </div>

        <p className="mt-4 text-center font-['DM_Serif_Text'] text-[14px] italic tracking-[0.03em] text-[#cf4569]">
          {photo.caption}
        </p>
      </div>
    </motion.div>
  );
}

function PhotoStrip({
  photos,
  className,
  delay,
}: {
  photos: PhotoMemory[];
  className: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className={`absolute ${className}`}
    >
      <div className="rounded-[2px] border border-[#efbfd0] bg-white px-3 py-4 shadow-[0_18px_35px_rgba(86,48,68,0.12)]">
        <div className="grid gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="aspect-[1/1] overflow-hidden border border-[#f5dde5] bg-[#f6e4ea]"
            >
              <img
                src={photo.url}
                alt={photo.caption}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export const PolaroidGallery: React.FC<PolaroidGalleryProps> = ({
  photos,
  onBack,
}) => {
  const galleryPhotos = useMemo(
    () => buildDisplayPhotos(photos),
    [photos]
  );

  const largeCards = galleryPhotos.slice(0, 4);
  const stripOne = galleryPhotos.slice(4, 6);
  const stripTwo = galleryPhotos.slice(6, 8);

  return (
    <div className="min-h-[100svh] bg-[#fff8fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-5 flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-[20px] border border-[#edd9e1] bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-[0_8px_20px_rgba(86,48,68,0.10)] transition hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Tạo quà tương tự
          </button>

          <div className="hidden sm:block rounded-[20px] border border-[#edd9e1] bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-[0_8px_20px_rgba(86,48,68,0.10)]">
            Bật nhạc nền 🎵
          </div>
        </div>

        <div className="rounded-[38px] bg-[#fbf1f5] px-4 py-8 shadow-[0_18px_50px_rgba(86,48,68,0.08)] sm:px-8 sm:py-10 lg:px-10 lg:py-8">
          {/* mobile */}
          <div className="grid gap-4 lg:hidden">
            <div className="grid grid-cols-2 gap-4">
              {largeCards.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className={index % 2 === 0 ? '-rotate-[4deg]' : 'rotate-[4deg]'}
                >
                  <div className="rounded-[2px] bg-white p-3 pb-5 shadow-[0_12px_26px_rgba(86,48,68,0.14)]">
                    <div className="aspect-square overflow-hidden bg-[#f4dfe6]">
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <p className="mt-3 text-center font-['DM_Serif_Text'] text-[12px] italic text-[#cf4569]">
                      {photo.caption}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[stripOne, stripTwo].map((stripPhotos, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.22 + index * 0.08 }}
                  className={index === 0 ? '-rotate-[2deg]' : 'rotate-[2deg]'}
                >
                  <div className="rounded-[2px] border border-[#efbfd0] bg-white px-2.5 py-3 shadow-[0_12px_26px_rgba(86,48,68,0.12)]">
                    <div className="grid gap-2.5">
                      {stripPhotos.map((photo) => (
                        <div
                          key={photo.id}
                          className="aspect-square overflow-hidden border border-[#f5dde5] bg-[#f6e4ea]"
                        >
                          <img
                            src={photo.url}
                            alt={photo.caption}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.32 }}
              className="pt-2 text-center font-['Pacifico'] text-[30px] leading-none text-[#c81654]"
            >
              Captured memories
            </motion.h2>
          </div>

          {/* desktop */}
          <div className="relative hidden h-[860px] lg:block xl:h-[920px]">
            <div className="pointer-events-none absolute inset-0">
              <span className="absolute left-[35%] top-[18%] text-[#f3abc6]">✦</span>
              <span className="absolute left-[39%] top-[48%] text-[#f3abc6]">✦</span>
              <span className="absolute right-[34%] top-[23%] text-[#f3abc6]">✦</span>
              <span className="absolute right-[29%] top-[51%] text-[#f3abc6]">✦</span>
            </div>

            {largeCards.map((photo, index) => (
              <PolaroidCard
                key={photo.id}
                photo={photo}
                delay={index * 0.06}
                className={desktopCardClasses[index]}
              />
            ))}

            <PhotoStrip
              photos={stripOne}
              className={`left-1/2 top-[9%] w-[13%] -translate-x-[108%] ${stripRotations[0]}`}
              delay={0.16}
            />

            <PhotoStrip
              photos={stripTwo}
              className={`left-1/2 top-[9%] w-[13%] translate-x-[8%] ${stripRotations[1]}`}
              delay={0.22}
            />

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3 }}
              className="absolute bottom-[4%] left-1/2 -translate-x-1/2 text-center font-['Pacifico'] text-[64px] leading-none text-[#c81654]"
            >
              Captured memories
            </motion.h2>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-[#efd2dc] bg-white px-8 py-4 text-lg font-semibold text-[#e1386a] shadow-[0_12px_24px_rgba(86,48,68,0.08)] transition hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-5 w-5" />
            Quay lại 3 món quà
          </button>
        </div>
      </div>
    </div>
  );
};