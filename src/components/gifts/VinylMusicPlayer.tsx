import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Disc,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ChevronLeft,
  Music,
  ListMusic,
  Sparkles,
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
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = playlist[currentTrackIndex] || playlist[0];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);

      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [currentTrackIndex]);

  const togglePlay = () => {
    sfx.playPop();

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
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
      (prev) => (prev - 1 + playlist.length) % playlist.length
    );
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;

    setCurrentTime(audioRef.current.currentTime);

    if (
      audioRef.current.duration &&
      !isNaN(audioRef.current.duration)
    ) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const time = parseFloat(e.target.value);

    setCurrentTime(time);

    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';

    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);

    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleBack = () => {
    sfx.playPop();

    if (audioRef.current) {
      audioRef.current.pause();
    }

    onBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="relative z-10 w-full max-w-2xl mx-auto px-4 py-6 flex flex-col items-center min-h-[85vh]"
      id="vinyl-player"
    >
      <audio
        ref={audioRef}
        src={currentTrack.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleNext}
      />

      {/* Playlist ở trên, bỏ nút quay lại */}
      <div className="w-full flex justify-end mb-6">
        <button
          onClick={() => setShowPlaylist(!showPlaylist)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-rose-700 bg-white/80 rounded-full shadow-sm border border-rose-200"
        >
          <ListMusic className="w-4 h-4" />
          <span>Danh sách bài hát ({playlist.length})</span>
        </button>
      </div>

      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 text-xs font-bold text-rose-600 bg-rose-100/90 rounded-full border border-rose-200 mb-2">
          <Disc className="w-3.5 h-3.5" />
          <span>MÓN QUÀ SỐ 2</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 font-heading">
          Chiếc Đĩa Than Tình Yêu 🎶
        </h2>

        <p className="text-sm text-slate-600 mt-1">
          Giai điệu dịu êm dành cho những khoảnh khắc ngọt ngào của hai đứa.
        </p>
      </div>

      <div className="relative w-full max-w-md bg-amber-950/90 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-900/60 flex flex-col items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-950 via-amber-900 to-amber-950 opacity-90 pointer-events-none" />

        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-stone-900 p-2 shadow-inner border-4 border-amber-700/50 flex items-center justify-center mb-6">
          <div
            className={`relative w-full h-full rounded-full bg-neutral-950 shadow-2xl flex items-center justify-center transition-all duration-700 ${
              isPlaying ? 'animate-spin-slow' : ''
            }`}
            style={{
              backgroundImage:
                'radial-gradient(circle, #1a1a1a 10%, #0a0a0a 15%, #1a1a1a 30%, #0a0a0a 45%, #1a1a1a 60%, #000 70%)',
            }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 via-transparent to-white/10 pointer-events-none" />

            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-amber-400 overflow-hidden shadow-lg relative flex items-center justify-center">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />

              <div className="absolute w-4 h-4 bg-stone-800 rounded-full border-2 border-stone-400 shadow-md" />
            </div>
          </div>

          <div
            className="absolute top-2 right-4 w-12 h-36 origin-top-right transition-transform duration-700 pointer-events-none z-20"
            style={{
              transform: isPlaying
                ? 'rotate(28deg)'
                : 'rotate(0deg)',
            }}
          >
            <div className="w-2.5 h-28 bg-gradient-to-b from-stone-300 to-stone-500 rounded-full mx-auto shadow-md" />

            <div className="w-5 h-7 bg-amber-500 rounded-sm shadow-md mt-[-4px] ml-1 flex items-center justify-center">
              <div className="w-1 h-2 bg-stone-900 rounded-full" />
            </div>
          </div>

          {isPlaying && (
            <div className="absolute -top-4 -left-2 text-rose-300 text-xl animate-bounce">
              🎵
            </div>
          )}

          {isPlaying && (
            <div className="absolute -bottom-2 -right-2 text-pink-300 text-lg animate-pulse">
              ✨
            </div>
          )}
        </div>

        <div className="relative z-10 text-center w-full mb-4 px-2">
          <h3 className="text-lg sm:text-xl font-bold text-white font-heading truncate">
            {currentTrack.title}
          </h3>

          <p className="text-xs sm:text-sm text-amber-200/80 truncate mt-0.5">
            {currentTrack.artist}
          </p>
        </div>

        <div className="relative z-10 w-full mb-4 px-2">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-amber-800/80 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />

          <div className="flex justify-between text-[11px] font-semibold text-amber-200/60 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between w-full px-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-amber-200 p-2"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={handlePrev}
              className="p-2.5 bg-amber-800/80 text-amber-100 rounded-full"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="p-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-white" />
              ) : (
                <Play className="w-6 h-6 fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={handleNext}
              className="p-2.5 bg-amber-800/80 text-amber-100 rounded-full"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-end gap-1 h-5 w-6">
            <div
              className={`w-1 bg-rose-400 rounded-full ${
                isPlaying ? 'h-5 animate-pulse' : 'h-1.5'
              }`}
            />
            <div
              className={`w-1 bg-rose-400 rounded-full ${
                isPlaying ? 'h-3 animate-bounce' : 'h-1.5'
              }`}
            />
            <div
              className={`w-1 bg-rose-400 rounded-full ${
                isPlaying ? 'h-4 animate-pulse' : 'h-1.5'
              }`}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-md mt-4 bg-white/90 rounded-2xl p-4 shadow-xl border border-rose-200 overflow-hidden"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-3 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5" />
              <span>Danh sách bài hát</span>
            </h4>

            <div className="space-y-2">
              {playlist.map((track, idx) => (
                <div
                  key={track.id}
                  onClick={() => {
                    sfx.playPop();
                    setCurrentTrackIndex(idx);
                    setIsPlaying(true);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer ${
                    idx === currentTrackIndex
                      ? 'bg-rose-100 text-rose-800 font-bold border border-rose-300'
                      : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="text-xs text-rose-500 w-4">
                      {idx + 1}
                    </span>

                    <div className="truncate">
                      <p className="text-sm truncate">
                        {track.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  {idx === currentTrackIndex &&
                    isPlaying && (
                      <Sparkles className="w-4 h-4 text-rose-500" />
                    )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUAY LẠI CUỐI TRANG */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        onClick={handleBack}
        className="mt-10 inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-rose-600 bg-white/80 rounded-full shadow-sm border border-rose-200"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Quay lại 3 món quà</span>
      </motion.button>
    </motion.div>
  );
};