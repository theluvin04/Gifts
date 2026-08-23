import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronDown,
  ListMusic,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { SongTrack } from '../../types';
import { sfx } from '../../utils/soundEffects';

interface VinylMusicPlayerProps {
  playlist: SongTrack[];
  onBack: () => void;
}

export const VinylMusicPlayer: React.FC<VinylMusicPlayerProps> = ({
  playlist,
  onBack,
}) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!playlist.length) return null;

  const currentTrack = playlist[currentTrackIndex];

  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.volume = isMuted ? 0 : 0.85;
  }, [isMuted]);

  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.currentTime = 0;
    setCurrentTime(0);

    if (isPlaying) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentTrackIndex]);

  const togglePlay = () => {
    sfx.playPop();

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  const handleNext = () => {
    sfx.playPop();

    setCurrentTrackIndex(
      (prev) => (prev + 1) % playlist.length
    );
  };

  const handlePrev = () => {
    sfx.playPop();

    setCurrentTrackIndex(
      (prev) =>
        (prev - 1 + playlist.length) %
        playlist.length
    );
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;

    setCurrentTime(audioRef.current.currentTime);

    if (
      audioRef.current.duration &&
      !Number.isNaN(audioRef.current.duration)
    ) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const time = Number(e.target.value);

    setCurrentTime(time);

    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || Number.isNaN(seconds)) return '0:00';

    const minute = Math.floor(seconds / 60);
    const second = Math.floor(seconds % 60);

    return `${minute}:${second
      .toString()
      .padStart(2, '0')}`;
  };

  const selectTrack = (index: number) => {
    sfx.playPop();

    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const handleBack = () => {
    sfx.playPop();

    audioRef.current?.pause();

    onBack();
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="
        relative
        mx-auto
        flex
        min-h-[100svh]
        w-full
        max-w-6xl
        flex-col
        items-center
        justify-center
        px-4
        py-10
        sm:px-6
        lg:px-8
      "
    >
      <audio
        ref={audioRef}
        src={currentTrack.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleNext}
      />

      {/* TITLE */}
      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          mb-6
          text-center
          font-handwriting
          text-[28px]
          font-bold
          text-rose-600
          sm:mb-8
          sm:text-[40px]
        "
      >
        A song that reminds me of us ♡
      </motion.h1>

      {/* MAIN PLAYER */}
      <motion.div
        initial={{
          opacity: 0,
          y: 24,
          scale: 0.97,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 160,
          damping: 20,
        }}
        className="
          w-full
          max-w-[920px]
          rounded-[28px]
          border
          border-pink-200/70
          bg-white/55
          p-3
          shadow-[0_20px_60px_rgba(244,114,182,0.15)]
          backdrop-blur-sm
          sm:p-5
          lg:p-6
        "
      >
        <div
          className="
            grid
            grid-cols-1
            gap-4
            lg:grid-cols-[0.82fr_1.35fr]
            lg:gap-5
          "
        >
          {/* VINYL SIDE */}
          <div
            className="
              relative
              flex
              min-h-[300px]
              items-center
              justify-center
              overflow-hidden
              rounded-[22px]
              bg-[#f8a9c4]
              px-5
              py-8
              sm:min-h-[380px]
              lg:min-h-[430px]
            "
          >
            <motion.div
              animate={
                isPlaying
                  ? { rotate: 360 }
                  : { rotate: 0 }
              }
              transition={
                isPlaying
                  ? {
                      duration: 8,
                      repeat: Infinity,
                      ease: 'linear',
                    }
                  : {
                      duration: 0.4,
                    }
              }
              className="
                relative
                flex
                aspect-square
                w-[210px]
                items-center
                justify-center
                rounded-full
                bg-black
                shadow-[0_18px_35px_rgba(0,0,0,0.24)]
                sm:w-[280px]
                lg:w-[300px]
              "
              style={{
                backgroundImage:
                  'repeating-radial-gradient(circle at center, #111 0px, #111 4px, #191919 5px, #191919 7px)',
              }}
            >
              <div
                className="
                  absolute
                  inset-[8%]
                  rounded-full
                  border
                  border-white/5
                "
              />

              <div
                className="
                  absolute
                  inset-[21%]
                  rounded-full
                  border
                  border-white/5
                "
              />

              <div
                className="
                  relative
                  flex
                  h-[76px]
                  w-[76px]
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  border-2
                  border-pink-200
                  sm:h-[94px]
                  sm:w-[94px]
                "
              >
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="h-full w-full object-cover"
                />

                <div className="absolute h-3 w-3 rounded-full bg-white shadow" />
              </div>

              <motion.div
                animate={{
                  opacity: isPlaying
                    ? [0.15, 0.4, 0.15]
                    : 0.12,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  rounded-full
                  bg-gradient-to-tr
                  from-transparent
                  via-white/10
                  to-transparent
                "
              />
            </motion.div>

            <motion.span
              animate={{
                opacity: [0.4, 1, 0.4],
                scale: [0.9, 1.15, 0.9],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="absolute right-[13%] top-[15%] text-lg text-pink-50"
            >
              ✦
            </motion.span>

            <motion.span
              animate={{
                opacity: [1, 0.35, 1],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
              }}
              className="absolute bottom-[18%] left-[12%] text-sm text-pink-50"
            >
              ✦
            </motion.span>
          </div>

          {/* PLAYER SIDE */}
          <div
            className="
              flex
              flex-col
              overflow-hidden
              rounded-[22px]
              bg-[#e874a1]
            "
          >
            {/* COVER */}
            <div
              className="
                relative
                aspect-[16/8.5]
                w-full
                overflow-hidden
                bg-pink-300
                sm:aspect-[16/7]
                lg:flex-1
              "
            >
              <motion.img
                key={currentTrack.coverUrl}
                initial={{
                  opacity: 0,
                  scale: 1.04,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.45,
                }}
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="
                  h-full
                  w-full
                  object-cover
                "
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/30
                  via-transparent
                  to-transparent
                "
              />

              <div
                className="
                  absolute
                  bottom-3
                  left-4
                  right-4
                  text-left
                  text-white
                  sm:bottom-5
                  sm:left-6
                "
              >
                <p
                  className="
                    line-clamp-1
                    text-lg
                    font-bold
                    drop-shadow
                    sm:text-2xl
                  "
                >
                  {currentTrack.title}
                </p>

                <p className="mt-0.5 text-xs text-white/80 sm:text-sm">
                  {currentTrack.artist}
                </p>
              </div>
            </div>

            {/* CONTROLS */}
            <div className="px-5 py-5 sm:px-7 sm:py-6">
              <div className="mb-2 flex items-center gap-3">
                <span className="w-9 text-[10px] text-white/75">
                  {formatTime(currentTime)}
                </span>

                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="
                    h-1
                    min-w-0
                    flex-1
                    cursor-pointer
                    appearance-none
                    rounded-full
                    bg-white/35
                    accent-white
                  "
                />

                <span className="w-9 text-right text-[10px] text-white/75">
                  {formatTime(duration)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-[48px_1fr_48px] items-center">
                <button
                  onClick={() =>
                    setIsMuted((prev) => !prev)
                  }
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    text-white/80
                    transition
                    hover:bg-white/10
                  "
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>

                <div className="flex items-center justify-center gap-5">
                  <button
                    onClick={handlePrev}
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      text-white/80
                      transition
                      hover:bg-white/10
                    "
                  >
                    <SkipBack className="h-5 w-5 fill-current" />
                  </button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={togglePlay}
                    className="
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-full
                      bg-pink-100
                      text-pink-500
                      shadow-[0_8px_20px_rgba(0,0,0,0.12)]
                    "
                  >
                    {isPlaying ? (
                      <Pause className="h-7 w-7 fill-current" />
                    ) : (
                      <Play className="ml-1 h-7 w-7 fill-current" />
                    )}
                  </motion.button>

                  <button
                    onClick={handleNext}
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      text-white/80
                      transition
                      hover:bg-white/10
                    "
                  >
                    <SkipForward className="h-5 w-5 fill-current" />
                  </button>
                </div>

                <button
                  onClick={() =>
                    setShowPlaylist((prev) => !prev)
                  }
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    justify-self-end
                    rounded-full
                    text-white/80
                    transition
                    hover:bg-white/10
                  "
                >
                  <ListMusic className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PLAYLIST */}
        <AnimatePresence>
          {showPlaylist && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
                marginTop: 0,
              }}
              animate={{
                opacity: 1,
                height: 'auto',
                marginTop: 16,
              }}
              exit={{
                opacity: 0,
                height: 0,
                marginTop: 0,
              }}
              className="overflow-hidden"
            >
              <div
                className="
                  rounded-[20px]
                  border
                  border-pink-100
                  bg-white/80
                  p-3
                "
              >
                <div className="mb-2 flex items-center justify-between px-2">
                  <p className="text-xs font-bold text-rose-600">
                    Our playlist
                  </p>

                  <button
                    onClick={() =>
                      setShowPlaylist(false)
                    }
                    className="text-rose-400"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  {playlist.map((track, index) => (
                    <button
                      key={track.id}
                      onClick={() =>
                        selectTrack(index)
                      }
                      className={`
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        p-2.5
                        text-left
                        transition
                        ${
                          index ===
                          currentTrackIndex
                            ? 'bg-pink-100'
                            : 'hover:bg-pink-50'
                        }
                      `}
                    >
                      <img
                        src={track.coverUrl}
                        alt=""
                        className="
                          h-11
                          w-11
                          shrink-0
                          rounded-lg
                          object-cover
                        "
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-700">
                          {track.title}
                        </p>

                        <p className="truncate text-xs text-slate-400">
                          {track.artist}
                        </p>
                      </div>

                      {index ===
                        currentTrackIndex && (
                        <span className="text-xs text-rose-500">
                          ♪
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* BACK - CUỐI CÙNG */}
      <button
        onClick={handleBack}
        className="
          mt-8
          inline-flex
          items-center
          gap-1.5
          rounded-full
          border
          border-rose-200
          bg-white/75
          px-5
          py-2.5
          text-xs
          font-semibold
          text-rose-500
          shadow-sm
        "
      >
        <ChevronLeft className="h-4 w-4" />
        Quay lại 3 món quà
      </button>
    </motion.section>
  );
};