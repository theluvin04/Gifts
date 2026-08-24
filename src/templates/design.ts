export interface TemplateDesignConfig {
  colors: {
    pageBackground: string;
    surface: string;
    surfaceSoft: string;
    text: string;
    mutedText: string;
    accent: string;
    accentStrong: string;
    buttonText: string;
  };

  fonts: {
    body: string;
    heading: string;
    script: string;
  };

  proposal: {
    questionColor: string;
    questionSize: number;
    yesButtonBackground: string;
    yesButtonText: string;
    noButtonBackground: string;
    noButtonText: string;
  };

  gifts: {
    headingColor: string;
    headingSize: number;
    cardBackground: string;
  };

  memories: {
    title: string;
    titleColor: string;
    titleFont: string;
    titleSize: number;
    captionColor: string;
    captionFont: string;
    captionSize: number;
    background: string;
    polaroidBackground: string;
    filmBorder: string;
    captions: {
      leftTop: string;
      leftBottom: string;
      rightTop: string;
      rightBottom: string;
    };
  };

  music: {
    titleColor: string;
    titleFont: string;
    vinylBackground: string;
    playerBackground: string;
    controlAccent: string;
  };

  letter: {
    titleColor: string;
    scriptFont: string;
    bodyFont: string;
    paperBackground: string;
    bodyText: string;
    accent: string;
  };
}

export const TEMPLATE_FONT_OPTIONS = [
  {
    label: 'Quicksand',
    value:
      "'Quicksand', sans-serif",
  },
  {
    label: 'Comfortaa',
    value:
      "'Comfortaa', sans-serif",
  },
  {
    label: 'Dancing Script',
    value:
      "'Dancing Script', cursive",
  },
  {
    label: 'Caveat',
    value:
      "'Caveat', cursive",
  },
  {
    label: 'Playfair Display',
    value:
      "'Playfair Display', serif",
  },
  {
    label: 'DM Serif Display',
    value:
      "'DM Serif Display', serif",
  },
  {
    label: 'Georgia',
    value:
      "Georgia, serif",
  },
  {
    label: 'Arial',
    value:
      "Arial, sans-serif",
  },
] as const;

export const DEFAULT_LOVE_TEMPLATE_DESIGN:
TemplateDesignConfig = {
  colors: {
    pageBackground:
      '#fff7fb',
    surface:
      '#ffffff',
    surfaceSoft:
      '#fff0f5',
    text:
      '#1e293b',
    mutedText:
      '#64748b',
    accent:
      '#e83e71',
    accentStrong:
      '#cf174f',
    buttonText:
      '#ffffff',
  },

  fonts: {
    body:
      "'Quicksand', sans-serif",
    heading:
      "'Comfortaa', sans-serif",
    script:
      "'Dancing Script', cursive",
  },

  proposal: {
    questionColor:
      '#1e293b',
    questionSize: 36,
    yesButtonBackground:
      '#f43f6e',
    yesButtonText:
      '#ffffff',
    noButtonBackground:
      '#ffffff',
    noButtonText:
      '#475569',
  },

  gifts: {
    headingColor:
      '#e83e71',
    headingSize: 36,
    cardBackground:
      '#fce7f3',
  },

  memories: {
    title:
      'Captured memories',
    titleColor:
      '#be123c',
    titleFont:
      "'Dancing Script', cursive",
    titleSize: 34,
    captionColor:
      '#be123c',
    captionFont:
      "'Quicksand', sans-serif",
    captionSize: 12,
    background:
      '#fff1f6',
    polaroidBackground:
      '#ffffff',
    filmBorder:
      '#f9a8c5',
    captions: {
      leftTop:
        'memories with you',
      leftBottom:
        'our little moments',
      rightTop:
        'you make me smile',
      rightBottom:
        'us, in frames',
    },
  },

  music: {
    titleColor:
      '#e11d5b',
    titleFont:
      "'Dancing Script', cursive",
    vinylBackground:
      '#f8a9c4',
    playerBackground:
      '#e874a1',
    controlAccent:
      '#ec4899',
  },

  letter: {
    titleColor:
      '#e11d5b',
    scriptFont:
      "'Dancing Script', cursive",
    bodyFont:
      "'Quicksand', sans-serif",
    paperBackground:
      '#fffdf9',
    bodyText:
      '#334155',
    accent:
      '#e11d5b',
  },
};

const HEX_COLOR =
  /^#[0-9a-f]{6}$/i;

const safeColor = (
  value: unknown,
  fallback: string
) => {
  return typeof value ===
      'string' &&
    HEX_COLOR.test(
      value.trim()
    )
    ? value.trim()
    : fallback;
};

const safeString = (
  value: unknown,
  fallback: string,
  maxLength = 90
) => {
  if (
    typeof value !==
    'string'
  ) {
    return fallback;
  }

  const trimmed =
    value.trim();

  if (!trimmed) {
    return fallback;
  }

  return trimmed.slice(
    0,
    maxLength
  );
};

const safeSize = (
  value: unknown,
  fallback: number,
  min: number,
  max: number
) => {
  if (
    typeof value !==
      'number' ||
    !Number.isFinite(value)
  ) {
    return fallback;
  }

  return Math.min(
    max,
    Math.max(
      min,
      Math.round(value)
    )
  );
};

const FONT_VALUES =
  new Set(
    TEMPLATE_FONT_OPTIONS.map(
      (item) => item.value
    )
  );

const safeFont = (
  value: unknown,
  fallback: string
) => {
  return typeof value ===
      'string' &&
    FONT_VALUES.has(
      value as any
    )
    ? value
    : fallback;
};

export const cloneTemplateDesign =
  (
    design:
      TemplateDesignConfig
  ): TemplateDesignConfig => {
    return JSON.parse(
      JSON.stringify(
        design
      )
    );
  };

export const normalizeTemplateDesign =
  (
    value: unknown,
    fallback:
      TemplateDesignConfig =
        DEFAULT_LOVE_TEMPLATE_DESIGN
  ): TemplateDesignConfig => {
    const data =
      value &&
      typeof value ===
        'object'
        ? value as any
        : {};

    const colors =
      data.colors || {};
    const fonts =
      data.fonts || {};
    const proposal =
      data.proposal || {};
    const gifts =
      data.gifts || {};
    const memories =
      data.memories || {};
    const memoryCaptions =
      memories.captions ||
      {};
    const music =
      data.music || {};
    const letter =
      data.letter || {};

    return {
      colors: {
        pageBackground:
          safeColor(
            colors.pageBackground,
            fallback.colors
              .pageBackground
          ),
        surface:
          safeColor(
            colors.surface,
            fallback.colors
              .surface
          ),
        surfaceSoft:
          safeColor(
            colors.surfaceSoft,
            fallback.colors
              .surfaceSoft
          ),
        text:
          safeColor(
            colors.text,
            fallback.colors.text
          ),
        mutedText:
          safeColor(
            colors.mutedText,
            fallback.colors
              .mutedText
          ),
        accent:
          safeColor(
            colors.accent,
            fallback.colors
              .accent
          ),
        accentStrong:
          safeColor(
            colors.accentStrong,
            fallback.colors
              .accentStrong
          ),
        buttonText:
          safeColor(
            colors.buttonText,
            fallback.colors
              .buttonText
          ),
      },

      fonts: {
        body:
          safeFont(
            fonts.body,
            fallback.fonts.body
          ),
        heading:
          safeFont(
            fonts.heading,
            fallback.fonts
              .heading
          ),
        script:
          safeFont(
            fonts.script,
            fallback.fonts
              .script
          ),
      },

      proposal: {
        questionColor:
          safeColor(
            proposal.questionColor,
            fallback.proposal
              .questionColor
          ),
        questionSize:
          safeSize(
            proposal.questionSize,
            fallback.proposal
              .questionSize,
            18,
            72
          ),
        yesButtonBackground:
          safeColor(
            proposal.yesButtonBackground,
            fallback.proposal
              .yesButtonBackground
          ),
        yesButtonText:
          safeColor(
            proposal.yesButtonText,
            fallback.proposal
              .yesButtonText
          ),
        noButtonBackground:
          safeColor(
            proposal.noButtonBackground,
            fallback.proposal
              .noButtonBackground
          ),
        noButtonText:
          safeColor(
            proposal.noButtonText,
            fallback.proposal
              .noButtonText
          ),
      },

      gifts: {
        headingColor:
          safeColor(
            gifts.headingColor,
            fallback.gifts
              .headingColor
          ),
        headingSize:
          safeSize(
            gifts.headingSize,
            fallback.gifts
              .headingSize,
            18,
            64
          ),
        cardBackground:
          safeColor(
            gifts.cardBackground,
            fallback.gifts
              .cardBackground
          ),
      },

      memories: {
        title:
          safeString(
            memories.title,
            fallback.memories
              .title,
            70
          ),
        titleColor:
          safeColor(
            memories.titleColor,
            fallback.memories
              .titleColor
          ),
        titleFont:
          safeFont(
            memories.titleFont,
            fallback.memories
              .titleFont
          ),
        titleSize:
          safeSize(
            memories.titleSize,
            fallback.memories
              .titleSize,
            18,
            72
          ),
        captionColor:
          safeColor(
            memories.captionColor,
            fallback.memories
              .captionColor
          ),
        captionFont:
          safeFont(
            memories.captionFont,
            fallback.memories
              .captionFont
          ),
        captionSize:
          safeSize(
            memories.captionSize,
            fallback.memories
              .captionSize,
            9,
            24
          ),
        background:
          safeColor(
            memories.background,
            fallback.memories
              .background
          ),
        polaroidBackground:
          safeColor(
            memories.polaroidBackground,
            fallback.memories
              .polaroidBackground
          ),
        filmBorder:
          safeColor(
            memories.filmBorder,
            fallback.memories
              .filmBorder
          ),
        captions: {
          leftTop:
            safeString(
              memoryCaptions.leftTop,
              fallback.memories
                .captions.leftTop,
              70
            ),
          leftBottom:
            safeString(
              memoryCaptions.leftBottom,
              fallback.memories
                .captions.leftBottom,
              70
            ),
          rightTop:
            safeString(
              memoryCaptions.rightTop,
              fallback.memories
                .captions.rightTop,
              70
            ),
          rightBottom:
            safeString(
              memoryCaptions.rightBottom,
              fallback.memories
                .captions.rightBottom,
              70
            ),
        },
      },

      music: {
        titleColor:
          safeColor(
            music.titleColor,
            fallback.music
              .titleColor
          ),
        titleFont:
          safeFont(
            music.titleFont,
            fallback.music
              .titleFont
          ),
        vinylBackground:
          safeColor(
            music.vinylBackground,
            fallback.music
              .vinylBackground
          ),
        playerBackground:
          safeColor(
            music.playerBackground,
            fallback.music
              .playerBackground
          ),
        controlAccent:
          safeColor(
            music.controlAccent,
            fallback.music
              .controlAccent
          ),
      },

      letter: {
        titleColor:
          safeColor(
            letter.titleColor,
            fallback.letter
              .titleColor
          ),
        scriptFont:
          safeFont(
            letter.scriptFont,
            fallback.letter
              .scriptFont
          ),
        bodyFont:
          safeFont(
            letter.bodyFont,
            fallback.letter
              .bodyFont
          ),
        paperBackground:
          safeColor(
            letter.paperBackground,
            fallback.letter
              .paperBackground
          ),
        bodyText:
          safeColor(
            letter.bodyText,
            fallback.letter
              .bodyText
          ),
        accent:
          safeColor(
            letter.accent,
            fallback.letter
              .accent
          ),
      },
    };
  };
