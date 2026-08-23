import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { sfx } from '../utils/soundEffects';

interface AudioPlayerProps {
  musicUrl: string;
  musicTitle: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ musicUrl, musicTitle }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleMusic = () => {
    sfx.playPop();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
    }
  }, []);

  return (
    <div className="fixed top-4 right-4 z-40">
      <audio ref={audioRef} src={musicUrl} loop />
      <button
        id="bg-music-toggle-btn"
        onClick={toggleMusic}
        className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold shadow-md backdrop-blur-md transition-all duration-300 border cursor-pointer ${
          isPlaying
            ? 'bg-rose-500 text-white border-rose-400 shadow-rose-500/30'
            : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-rose-50'
        }`}
        title={isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền lãng mạn"}
      >
        {isPlaying ? (
          <>
            <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">Nhạc nền đang phát</span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Bật nhạc nền 🎵</span>
          </>
        )}
      </button>
    </div>
  );
};
