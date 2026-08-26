import React, { useState } from 'react';
import type { SceneYoutubeElement } from './elementTypes';
import { buildYoutubeEmbedUrl, extractYoutubeId, getYoutubeThumbnailUrl } from './youtubeUtils';

interface Props {
  element: SceneYoutubeElement;
  isEditor?: boolean;
  device?: 'desktop' | 'mobile';
  className?: string;
  style?: React.CSSProperties;
}

export const YoutubeFrameRenderer: React.FC<Props> = ({
  element,
  isEditor = false,
  device = 'desktop',
  className = '',
  style = {},
}) => {
  const [editorInteractive, setEditorInteractive] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  const rawUrl = (device === 'mobile' && element.mobileYoutubeUrl)
    ? element.mobileYoutubeUrl
    : element.youtubeUrl;

  const currentTitle = (device === 'mobile' && element.mobileTitle)
    ? element.mobileTitle
    : (element.title || 'Nhạc nền tình yêu');

  const youtubeStyle = (device === 'mobile' && element.mobileYoutubeStyle)
    ? { ...element.youtubeStyle, ...element.mobileYoutubeStyle }
    : (element.youtubeStyle || {});

  const videoId = extractYoutubeId(rawUrl || '');
  const theme = youtubeStyle.frameTheme || 'youtube';
  const borderRadius = youtubeStyle.borderRadius ?? 16;
  const borderWidth = youtubeStyle.borderWidth ?? 0;
  const borderColor = youtubeStyle.borderColor || '#ffffff';
  const borderStyle = youtubeStyle.borderStyle || 'solid';
  const boxShadow = youtubeStyle.boxShadow || '0 16px 36px rgba(0,0,0,0.22)';
  const accentColor = youtubeStyle.accentColor || '#ff0033';
  const showTitle = youtubeStyle.showTitle !== false;
  const autoplay = youtubeStyle.autoplay ?? false;
  const loop = youtubeStyle.loop ?? true;
  const mute = youtubeStyle.mute ?? false;
  const controls = youtubeStyle.controls !== false;

  const embedUrl = videoId
    ? buildYoutubeEmbedUrl({
        videoId,
        autoplay: isEditor ? false : autoplay,
        loop,
        mute: isEditor ? false : mute,
        controls,
      })
    : '';

  // Outer container border radius
  const outerRadius = Math.max(0, borderRadius);
  // Inner player border radius
  const innerRadius = Math.max(0, borderRadius - borderWidth);

  // If no video ID entered yet
  if (!videoId) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center p-3 text-center ${className}`}
        style={{
          borderRadius: `${outerRadius}px`,
          borderWidth: `${borderWidth}px`,
          borderColor,
          borderStyle,
          boxShadow,
          background: 'linear-gradient(135deg, #1c1a1c 0%, #2b1f28 100%)',
          ...style,
        }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600/20 text-red-500 shadow-inner">
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </div>
        <p className="mt-2 text-[11px] font-bold text-white/80">Khung phát YouTube</p>
        <p className="mt-0.5 text-[9px] text-white/40">Dán link video YouTube trong bảng thuộc tính</p>
      </div>
    );
  }

  // Common Video Iframe with optional interaction lock for editor
  const renderIframe = () => (
    <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: `${innerRadius}px` }}>
      <iframe
        src={embedUrl}
        title={currentTitle}
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{
          pointerEvents: isEditor && !editorInteractive ? 'none' : 'auto',
        }}
      />

      {/* Editor overlay for smooth dragging and quick testing toggle */}
      {isEditor && (
        <div className="absolute right-1.5 top-1.5 z-20 flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditorInteractive((v) => !v);
            }}
            className={`rounded-full px-2 py-0.5 text-[8px] font-bold shadow-md transition ${
              editorInteractive
                ? 'bg-emerald-500 text-white'
                : 'bg-black/70 text-white/90 hover:bg-black/90'
            }`}
            title={editorInteractive ? 'Đang bật tương tác' : 'Bật tương tác để thử phát nhạc'}
          >
            {editorInteractive ? '✕ Khóa kéo thả' : '▶ Thử phát'}
          </button>
        </div>
      )}
    </div>
  );

  // 1. YouTube Card Theme
  if (theme === 'youtube') {
    return (
      <div
        className={`flex h-full w-full flex-col overflow-hidden bg-[#0f0f0f] text-white ${className}`}
        style={{
          borderRadius: `${outerRadius}px`,
          borderWidth: `${borderWidth}px`,
          borderColor,
          borderStyle,
          boxShadow,
          ...style,
        }}
      >
        {showTitle && (
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-[#181818] px-2.5 py-1.5">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-red-600 text-white">
                <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="truncate text-[10px] font-bold text-white/90">
                {currentTitle}
              </span>
            </div>
            {/* Equalizer animation */}
            <div className="flex shrink-0 items-end gap-0.5">
              <span className="h-2 w-0.5 animate-pulse rounded-full bg-red-500" style={{ animationDuration: '0.6s' }} />
              <span className="h-3.5 w-0.5 animate-pulse rounded-full bg-red-500" style={{ animationDuration: '0.4s' }} />
              <span className="h-1.5 w-0.5 animate-pulse rounded-full bg-red-500" style={{ animationDuration: '0.8s' }} />
            </div>
          </div>
        )}
        <div className="min-h-0 flex-1">{renderIframe()}</div>
      </div>
    );
  }

  // 2. Vinyl Record Player Theme
  if (theme === 'vinyl') {
    return (
      <div
        className={`relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-br from-[#1a1717] via-[#241e21] to-[#121112] text-white p-2 ${className}`}
        style={{
          borderRadius: `${outerRadius}px`,
          borderWidth: `${borderWidth}px`,
          borderColor,
          borderStyle,
          boxShadow,
          ...style,
        }}
      >
        {/* Top vinyl header */}
        <div className="mb-1.5 flex shrink-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            {/* Mini spinning vinyl disc icon */}
            <div className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-300/30 bg-black shadow-md">
              <div className="h-2 w-2 rounded-full bg-amber-500/80" />
              <div className="absolute inset-0 rounded-full border border-dashed border-white/20 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <span className="truncate text-[10px] font-bold text-amber-200/90">
              {currentTitle}
            </span>
          </div>
          <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-300">
            Music
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden rounded-lg shadow-inner">
          {renderIframe()}
        </div>
      </div>
    );
  }

  // 3. Glassmorphism Crystal Theme
  if (theme === 'glass') {
    return (
      <div
        className={`flex h-full w-full flex-col overflow-hidden backdrop-blur-xl ${className}`}
        style={{
          borderRadius: `${outerRadius}px`,
          borderWidth: `${borderWidth || 1}px`,
          borderColor: borderColor || 'rgba(255, 255, 255, 0.4)',
          borderStyle,
          boxShadow: boxShadow || '0 20px 45px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.4)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)',
          ...style,
        }}
      >
        {showTitle && (
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/20 bg-white/10 px-2.5 py-1.5 backdrop-blur-md">
            <span className="truncate text-[10px] font-bold text-white drop-shadow-sm">
              🎵 {currentTitle}
            </span>
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-400 animate-ping" />
              <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
            </div>
          </div>
        )}
        <div className="min-h-0 flex-1 p-1">
          {renderIframe()}
        </div>
      </div>
    );
  }

  // 4. Retro TV Theme
  if (theme === 'retro-tv') {
    return (
      <div
        className={`flex h-full w-full flex-col overflow-hidden bg-[#e0d6c8] p-2 text-stone-800 shadow-2xl ${className}`}
        style={{
          borderRadius: `${outerRadius}px`,
          borderWidth: `${borderWidth || 2}px`,
          borderColor: borderColor || '#7c6a59',
          borderStyle,
          boxShadow,
          ...style,
        }}
      >
        <div className="flex min-h-0 flex-1 gap-2">
          {/* Main TV Screen with rounded bezel */}
          <div
            className="flex-1 overflow-hidden bg-black shadow-inner"
            style={{
              borderRadius: `${Math.max(4, innerRadius)}px`,
              border: '3px solid #3d352e',
            }}
          >
            {renderIframe()}
          </div>
          {/* TV Control panel side */}
          <div className="flex w-6 shrink-0 flex-col items-center justify-around rounded bg-[#cdbeac] p-1 border border-[#b8a692]">
            <div className="h-3.5 w-3.5 rounded-full border-2 border-[#5c4f42] bg-[#8c7a68] shadow-sm" />
            <div className="h-3.5 w-3.5 rounded-full border-2 border-[#5c4f42] bg-[#8c7a68] shadow-sm" />
            <div className="flex flex-col gap-0.5">
              <div className="h-0.5 w-3 rounded-full bg-[#5c4f42]" />
              <div className="h-0.5 w-3 rounded-full bg-[#5c4f42]" />
              <div className="h-0.5 w-3 rounded-full bg-[#5c4f42]" />
            </div>
          </div>
        </div>
        {showTitle && (
          <div className="mt-1 flex items-center justify-between px-1">
            <span className="truncate text-[9px] font-black text-[#5c4f42]">
              {currentTitle}
            </span>
            <span className="text-[8px] font-bold text-[#8c7a68]">CH-01</span>
          </div>
        )}
      </div>
    );
  }

  // 5. Photobooth Music Theme
  if (theme === 'photobooth') {
    return (
      <div
        className={`flex h-full w-full flex-col overflow-hidden bg-white p-2.5 text-neutral-800 shadow-xl ${className}`}
        style={{
          borderRadius: `${outerRadius}px`,
          borderWidth: `${borderWidth || 1}px`,
          borderColor: borderColor || '#e5e0dc',
          borderStyle,
          boxShadow,
          ...style,
        }}
      >
        <div className="min-h-0 flex-1 overflow-hidden rounded bg-black">
          {renderIframe()}
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-1.5">
          <div className="flex items-center gap-1">
            <span className="text-[10px]">🎶</span>
            <span className="truncate text-[10px] font-bold tracking-tight text-neutral-700">
              {currentTitle}
            </span>
          </div>
          <span className="font-mono text-[8px] font-bold tracking-widest text-neutral-400">
            PLAYLIST
          </span>
        </div>
      </div>
    );
  }

  // 6. Minimal theme (default fallback)
  return (
    <div
      className={`h-full w-full overflow-hidden bg-black ${className}`}
      style={{
        borderRadius: `${outerRadius}px`,
        borderWidth: `${borderWidth}px`,
        borderColor,
        borderStyle,
        boxShadow,
        ...style,
      }}
    >
      {renderIframe()}
    </div>
  );
};
