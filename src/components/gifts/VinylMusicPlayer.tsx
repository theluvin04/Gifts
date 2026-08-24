import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

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

import { motion } from 'motion/react';

import { SongTrack } from '../../types';

import {
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  getYouTubeVideoId,
} from '../../utils/youtube';

import { sfx } from '../../utils/soundEffects';

interface VinylMusicPlayerProps {
  playlist: SongTrack[];
  onBack: () => void;
}

const formatTime = (
  seconds: number
) => {
  if (
    !seconds ||
    Number.isNaN(seconds)
  ) {
    return '0:00';
  }

  const minutes =
    Math.floor(seconds / 60);

  const remaining =
    Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');

  return `${minutes}:${remaining}`;
};

const getTrackCover = (
  track: SongTrack
) => {
  return (
    getYouTubeThumbnailUrl(
      track.youtubeUrl
    ) ||
    track.coverUrl
  );
};

export const VinylMusicPlayer:
React.FC<
  VinylMusicPlayerProps
> = ({
  playlist,
  onBack,
}) => {
  const [
    currentTrackIndex,
    setCurrentTrackIndex,
  ] = useState(0);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(0);

  const [isMuted, setIsMuted] =
    useState(false);

  const [showPlaylist, setShowPlaylist] =
    useState(false);

  const audioRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  const currentTrack =
    playlist[
      Math.min(
        currentTrackIndex,
        Math.max(
          0,
          playlist.length - 1
        )
      )
    ] ?? null;

  const youtubeId =
    getYouTubeVideoId(
      currentTrack?.youtubeUrl
    );

  const youtubeEmbedUrl =
    getYouTubeEmbedUrl(
      currentTrack?.youtubeUrl
    );

  const usesYouTube =
    Boolean(
      youtubeId &&
      youtubeEmbedUrl
    );

  const cover =
    currentTrack
      ? getTrackCover(
          currentTrack
        )
      : '';

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.volume =
      isMuted ? 0 : 0.85;
  }, [isMuted]);

  useEffect(() => {
    const audio =
      audioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }, [
    currentTrackIndex,
    usesYouTube,
  ]);

  if (!currentTrack) {
    return null;
  }

  const handleNext = () => {
    sfx.playPop();

    setCurrentTrackIndex(
      (previous) =>
        (previous + 1) %
        playlist.length
    );
  };

  const handlePrev = () => {
    sfx.playPop();

    setCurrentTrackIndex(
      (previous) =>
        (
          previous -
          1 +
          playlist.length
        ) % playlist.length
    );
  };

  const togglePlay = () => {
    sfx.playPop();

    const audio =
      audioRef.current;

    if (
      !audio ||
      usesYouTube ||
      !currentTrack?.audioUrl
    ) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    audio
      .play()
      .then(() =>
        setIsPlaying(true)
      )
      .catch(() =>
        setIsPlaying(false)
      );
  };

  const handleTimeUpdate = () => {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    setCurrentTime(
      audio.currentTime
    );

    if (
      audio.duration &&
      !Number.isNaN(
        audio.duration
      )
    ) {
      setDuration(
        audio.duration
      );
    }
  };

  const handleSeek = (
    event:
      React.ChangeEvent<HTMLInputElement>
  ) => {
    const time =
      Number(
        event.target.value
      );

    setCurrentTime(time);

    if (audioRef.current) {
      audioRef.current.currentTime =
        time;
    }
  };

  const selectTrack = (
    index: number
  ) => {
    sfx.playPop();
    setCurrentTrackIndex(index);
    setShowPlaylist(false);
  };

  const handleBack = () => {
    sfx.playPop();
    audioRef.current?.pause();
    onBack();
  };

  return (
    <motion.section
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="relative mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-8"
    >
      {!usesYouTube && (
        <audio
          ref={audioRef}
          src={
            currentTrack?.audioUrl || ''
          }
          onTimeUpdate={
            handleTimeUpdate
          }
          onLoadedMetadata={
            handleTimeUpdate
          }
          onEnded={handleNext}
        />
      )}

      <motion.h1
        initial={{
          opacity: 0,
          y: -12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="mb-6 text-center font-handwriting text-[28px] font-bold text-rose-600 sm:mb-8 sm:text-[40px]"
      >
        A song that reminds me of us ♡
      </motion.h1>

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
        className="w-full max-w-[920px] rounded-[28px] border border-pink-200/70 bg-white/55 p-3 shadow-[0_20px_60px_rgba(244,114,182,0.15)] backdrop-blur-sm sm:p-5 lg:p-6"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.82fr_1.35fr] lg:gap-5">
          <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-[22px] bg-[#f8a9c4] px-5 py-8 sm:min-h-[380px] lg:min-h-[430px]">
            <motion.div
              animate={
                usesYouTube ||
                isPlaying
                  ? {
                      rotate: 360,
                    }
                  : {
                      rotate: 0,
                    }
              }
              transition={
                usesYouTube ||
                isPlaying
                  ? {
                      duration: 9,
                      repeat: Infinity,
                      ease: 'linear',
                    }
                  : {
                      duration: 0.35,
                    }
              }
              className="relative flex aspect-square w-[210px] items-center justify-center rounded-full bg-black shadow-[0_18px_35px_rgba(0,0,0,0.24)] sm:w-[280px] lg:w-[300px]"
              style={{
                backgroundImage:
                  'repeating-radial-gradient(circle at center, #111 0px, #111 4px, #191919 5px, #191919 7px)',
              }}
            >
              <div className="absolute inset-[8%] rounded-full border border-white/5" />
              <div className="absolute inset-[21%] rounded-full border border-white/5" />

              <div className="relative h-[82px] w-[82px] overflow-hidden rounded-full border-2 border-pink-200 bg-[#2a171d] shadow-inner sm:h-[102px] sm:w-[102px]">
                <img
                  src={cover}
                  alt={
                    currentTrack.title
                  }
                  className="absolute inset-0 h-full w-full scale-[1.32] object-cover object-center"
                />

                <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/20" />

                <div className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-white shadow" />
              </div>
            </motion.div>

            <span className="absolute right-[13%] top-[15%] text-lg text-pink-50">
              ✦
            </span>

            <span className="absolute bottom-[18%] left-[12%] text-sm text-pink-50">
              ✦
            </span>
          </div>

          <div className="flex min-h-[430px] flex-col overflow-hidden rounded-[22px] bg-[#e874a1]">
            {usesYouTube &&
            youtubeEmbedUrl ? (
              <>
                <div className="relative aspect-video w-full bg-black lg:flex-1">
                  <iframe
                    key={
                      youtubeEmbedUrl
                    }
                    src={
                      youtubeEmbedUrl
                    }
                    title={
                      currentTrack.title ||
                      'YouTube video'
                    }
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>

                <div className="px-5 py-5 text-white sm:px-7 sm:py-6">
                  <p className="text-lg font-bold sm:text-xl">
                    {
                      currentTrack.title
                    }
                  </p>

                  <p className="mt-1 text-xs text-white/75 sm:text-sm">
                    {
                      currentTrack.artist
                    }
                  </p>

                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
                    YouTube video
                  </p>

                  <div className="mt-5 grid grid-cols-[48px_1fr_48px] items-center">
                    <div />

                    <div className="flex items-center justify-center gap-5">
                      <button
                        type="button"
                        onClick={
                          handlePrev
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10"
                      >
                        <SkipBack className="h-5 w-5 fill-current" />
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleNext
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10"
                      >
                        <SkipForward className="h-5 w-5 fill-current" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowPlaylist(
                          (previous) =>
                            !previous
                        )
                      }
                      className="flex h-10 w-10 items-center justify-center justify-self-end rounded-full text-white/80 transition hover:bg-white/10"
                    >
                      <ListMusic className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="relative aspect-[16/8.5] w-full overflow-hidden bg-pink-300 sm:aspect-[16/7] lg:flex-1">
                  <motion.img
                    key={cover}
                    initial={{
                      opacity: 0,
                      scale: 1.04,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    src={cover}
                    alt={
                      currentTrack.title
                    }
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

                  <div className="absolute bottom-3 left-4 right-4 text-left text-white sm:bottom-5 sm:left-6">
                    <p className="line-clamp-1 text-lg font-bold drop-shadow sm:text-2xl">
                      {
                        currentTrack.title
                      }
                    </p>

                    <p className="mt-0.5 text-xs text-white/80 sm:text-sm">
                      {
                        currentTrack.artist
                      }
                    </p>
                  </div>
                </div>

                <div className="px-5 py-5 sm:px-7 sm:py-6">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="w-9 text-[10px] text-white/75">
                      {formatTime(
                        currentTime
                      )}
                    </span>

                    <input
                      type="range"
                      min={0}
                      max={
                        duration || 100
                      }
                      value={
                        currentTime
                      }
                      onChange={
                        handleSeek
                      }
                      disabled={
                        !currentTrack?.audioUrl
                      }
                      className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/35 accent-white disabled:cursor-not-allowed disabled:opacity-40"
                    />

                    <span className="w-9 text-right text-[10px] text-white/75">
                      {formatTime(
                        duration
                      )}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-[48px_1fr_48px] items-center">
                    <button
                      type="button"
                      onClick={() =>
                        setIsMuted(
                          (previous) =>
                            !previous
                        )
                      }
                      disabled={
                        !currentTrack?.audioUrl
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 disabled:opacity-35"
                    >
                      {isMuted ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-5">
                      <button
                        type="button"
                        onClick={
                          handlePrev
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10"
                      >
                        <SkipBack className="h-5 w-5 fill-current" />
                      </button>

                      <motion.button
                        type="button"
                        whileTap={{
                          scale: 0.9,
                        }}
                        onClick={
                          togglePlay
                        }
                        disabled={
                          !currentTrack?.audioUrl
                        }
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-pink-500 shadow-[0_8px_20px_rgba(0,0,0,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isPlaying ? (
                          <Pause className="h-7 w-7 fill-current" />
                        ) : (
                          <Play className="ml-1 h-7 w-7 fill-current" />
                        )}
                      </motion.button>

                      <button
                        type="button"
                        onClick={
                          handleNext
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10"
                      >
                        <SkipForward className="h-5 w-5 fill-current" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowPlaylist(
                          (previous) =>
                            !previous
                        )
                      }
                      className="flex h-10 w-10 items-center justify-center justify-self-end rounded-full text-white/80 transition hover:bg-white/10"
                    >
                      <ListMusic className="h-5 w-5" />
                    </button>
                  </div>

                  {!currentTrack.audioUrl && (
                    <p className="mt-4 text-center text-[10px] font-medium text-white/55">
                      Bài này chưa có Audio URL.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {showPlaylist && (
          <motion.div
            initial={{
              opacity: 0,
              y: -6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mt-4 overflow-hidden rounded-[20px] border border-pink-100 bg-white/85 p-3"
          >
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-xs font-bold text-rose-600">
                Our playlist
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowPlaylist(
                    false
                  )
                }
                className="text-rose-400"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              {playlist.map(
                (
                  track,
                  index
                ) => {
                  const thumbnail =
                    getTrackCover(
                      track
                    );

                  const isCurrent =
                    index ===
                    currentTrackIndex;

                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() =>
                        selectTrack(
                          index
                        )
                      }
                      className={[
                        'flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left transition',
                        isCurrent
                          ? 'bg-rose-50'
                          : 'hover:bg-pink-50/60',
                      ].join(' ')}
                    >
                      <img
                        src={
                          thumbnail
                        }
                        alt=""
                        className="h-10 w-10 rounded-xl object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-slate-700">
                          {
                            track.title
                          }
                        </p>

                        <p className="mt-0.5 truncate text-[10px] text-slate-400">
                          {
                            track.artist
                          }
                        </p>
                      </div>

                      {getYouTubeVideoId(
                        track.youtubeUrl
                      ) && (
                        <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-red-500">
                          YouTube
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      <button
        type="button"
        onClick={handleBack}
        className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white/75 px-5 py-2.5 text-xs font-semibold text-rose-500 shadow-sm"
      >
        <ChevronLeft className="h-4 w-4" />
        Quay lại 3 món quà
      </button>
    </motion.section>
  );
};
