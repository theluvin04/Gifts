import type { SceneYoutubeFrameTheme, SceneYoutubeStyle } from './elementTypes';

export interface YoutubeFrameThemeOption {
  value: SceneYoutubeFrameTheme;
  label: string;
  icon: string;
  description: string;
}

export const YOUTUBE_FRAME_THEMES: YoutubeFrameThemeOption[] = [
  {
    value: 'youtube',
    label: 'YouTube Card',
    icon: '▶️',
    description: 'Thanh tiêu đề YouTube đỏ trắng hiện đại, tinh gọn',
  },
  {
    value: 'minimal',
    label: 'Tối giản không viền',
    icon: '✨',
    description: 'Tràn viền mượt mà với bóng đổ và bo góc tuỳ chỉnh',
  },
  {
    value: 'vinyl',
    label: 'Đĩa than Vinyl',
    icon: '💿',
    description: 'Đĩa than cổ điển xoay mượt cạnh khung phát nhạc',
  },
  {
    value: 'glass',
    label: 'Kính mờ Pha lê',
    icon: '🪞',
    description: 'Hiệu ứng Frosted Glass sang trọng với viền lấp lánh',
  },
  {
    value: 'retro-tv',
    label: 'Tivi Retro',
    icon: '📺',
    description: 'Khung TV hoài niệm với ăng-ten và nút điều khiển',
  },
  {
    value: 'photobooth',
    label: 'Photobooth Music',
    icon: '🎞️',
    description: 'Phong cách dán ảnh photobooth với tem âm nhạc',
  },
];

/**
 * Extracts YouTube Video ID from various URL formats or returns raw 11-char ID
 */
export function extractYoutubeId(input: string = ''): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Matches youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/..., youtube.com/shorts/...
  const match = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)([^"&?\/\s]{11})/i
  );
  if (match && match[1]) {
    return match[1];
  }

  return trimmed;
}

export function buildYoutubeEmbedUrl({
  videoId,
  autoplay = false,
  loop = true,
  mute = false,
  controls = true,
}: {
  videoId: string;
  autoplay?: boolean;
  loop?: boolean;
  mute?: boolean;
  controls?: boolean;
}): string {
  const cleanId = extractYoutubeId(videoId);
  if (!cleanId) return '';

  const params = new URLSearchParams();
  if (autoplay) {
    params.set('autoplay', '1');
    // If autoplay is enabled on mobile/browsers, mute is often required by browser policies
    if (mute) {
      params.set('mute', '1');
    }
  } else if (mute) {
    params.set('mute', '1');
  }

  if (loop) {
    params.set('loop', '1');
    params.set('playlist', cleanId);
  }

  params.set('controls', controls ? '1' : '0');
  params.set('rel', '0');
  params.set('modestbranding', '1');
  params.set('playsinline', '1');
  params.set('enablejsapi', '1');

  return `https://www.youtube-nocookie.com/embed/${cleanId}?${params.toString()}`;
}

export function getYoutubeThumbnailUrl(videoId: string, quality: 'maxresdefault' | 'hqdefault' | 'mqdefault' = 'hqdefault'): string {
  const cleanId = extractYoutubeId(videoId);
  if (!cleanId) return '';
  return `https://img.youtube.com/vi/${cleanId}/${quality}.jpg`;
}
