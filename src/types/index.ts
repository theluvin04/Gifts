import type {
  TemplateDesignConfig,
} from '../templates/design';

export interface PhotoMemory {
  id: string;
  url: string;
  caption: string;
  date?: string;
  rotation?: number;
  location?: string;
}

export interface MemoryDisplayCaptions {
  leftTop: string;
  leftBottom: string;
  rightTop: string;
  rightBottom: string;
}

export interface SongTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  youtubeUrl?: string;
  duration?: string;
}

export interface LoveConfig {
  /**
   * Snapshot style của template tại thời điểm checkout.
   * Khách không chỉnh field này.
   */
  design?: TemplateDesignConfig;

  /**
   * ID asset khách đã chọn trong các slot Admin cho phép.
   */
  assetSelections?: Record<
    string,
    string
  >;

  /**
   * URL asset đã được snapshot ở checkout.
   * Gift đã bán không phụ thuộc template gốc sau này.
   */
  resolvedAssets?: Record<
    string,
    string
  >;

  couple: {
    senderName: string;
    receiverName: string;
    anniversaryDate?: string;
    nickname?: string;
  };

  intro: {
    title: string;
    subtitle: string;
    heartLabel: string;
  };

  proposal: {
    question: string;
    yesBtnText: string;
    noBtnStages: {
      text: string;
      gifUrl: string;
      hint?: string;
    }[];
    initialGif: string;
    successGif: string;
    successHeading: string;
    successSubheading: string;
    continueBtnText: string;
  };

  gifts: {
    headerTitle: string;
    headerSubtitle: string;

    gift1: {
      id: string;
      title: string;
      tag: string;
      desc: string;
      icon: string;

      /**
       * 4 dòng chữ thật sự hiển thị
       * dưới 4 Polaroid lớn bên ngoài.
       * Admin đặt mặc định/style,
       * khách được sửa nội dung.
       */
      displayCaptions?:
        MemoryDisplayCaptions;

      photos: PhotoMemory[];
    };

    gift2: {
      id: string;
      title: string;
      tag: string;
      desc: string;
      icon: string;
      playlist: SongTrack[];
    };

    gift3: {
      id: string;
      title: string;
      tag: string;
      desc: string;
      icon: string;
      letter: {
        salutation: string;
        paragraphs: string[];
        closing: string;
        signature: string;
        date: string;
      };
    };
  };

  audio: {
    backgroundMusicUrl: string;
    backgroundMusicTitle: string;
  };
}

export type AppStage =
  | 'intro'
  | 'proposal'
  | 'success'
  | 'gifts'
  | 'gift1'
  | 'gift2'
  | 'gift3';
