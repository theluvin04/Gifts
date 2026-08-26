import type {
  AnimationPreset,
  SceneButtonElement,
  SceneCanvasDefinition,
  SceneElement,
  SceneElementAction,
  SceneElementFrame,
  SceneImageElement,
  ScenePhotoFrameElement,
  SceneYoutubeElement,
  SceneShapeElement,
  SceneTextElement,
  SceneTransitionPreset,
} from '../engine';

export interface TemplateVisualEditorConfig {
  enabled: boolean;

  initialSceneId: string;

  scenes:
    SceneCanvasDefinition[];
}

export const VISUAL_EDITOR_ANIMATION_PRESETS:
Array<{
  value: AnimationPreset;
  label: string;
}> = [
  {
    value: 'none',
    label: 'Không hiệu ứng',
  },
  {
    value: 'fade',
    label: 'Mờ dần',
  },
  {
    value: 'fade-up',
    label: 'Mờ dần từ dưới',
  },
  {
    value: 'fade-down',
    label: 'Mờ dần từ trên',
  },
  {
    value: 'slide-left',
    label: 'Bay từ phải vào',
  },
  {
    value: 'slide-right',
    label: 'Bay từ trái vào',
  },
  {
    value: 'slide-up',
    label: 'Bay từ dưới lên',
  },
  {
    value: 'slide-down',
    label: 'Bay từ trên xuống',
  },
  {
    value: 'zigzag-left',
    label: 'Zic-zac từ trái',
  },
  {
    value: 'zigzag-right',
    label: 'Zic-zac từ phải',
  },
  {
    value: 'zoom-in',
    label: 'Phóng to vào',
  },
  {
    value: 'zoom-out',
    label: 'Thu nhỏ ra',
  },
  {
    value: 'pop',
    label: 'Bật nảy',
  },
  {
    value: 'bounce-in',
    label: 'Nảy vào',
  },
  {
    value: 'rotate-in',
    label: 'Xoay xuất hiện',
  },
  {
    value: 'flip-in',
    label: 'Lật vào',
  },
  {
    value: 'blur-reveal',
    label: 'Mờ → rõ',
  },
  {
    value: 'wipe-left',
    label: 'Quét từ trái sang',
  },
  {
    value: 'wipe-up',
    label: 'Quét từ dưới lên',
  },
  {
    value: 'spin',
    label: 'Xoay thuận liên tục',
  },
  {
    value: 'spin-reverse',
    label: 'Xoay ngược liên tục',
  },
  {
    value: 'float',
    label: 'Bay nhẹ liên tục',
  },
  {
    value: 'swing',
    label: 'Lắc nhẹ liên tục',
  },
  {
    value: 'shake',
    label: 'Rung liên tục',
  },
  {
    value: 'pulse',
    label: 'Nhịp thở liên tục',
  },
];

export const VISUAL_EDITOR_TEXT_ANIMATION_PRESETS:
Array<{
  value: AnimationPreset;
  label: string;
}> = [
  ...VISUAL_EDITOR_ANIMATION_PRESETS,
  {
    value: 'typewriter',
    label: 'Đánh chữ từng ký tự',
  },
  {
    value: 'word-reveal',
    label: 'Hiện từng từ',
  },
  {
    value: 'line-reveal',
    label: 'Hiện từng dòng',
  },
];

export const TEXT_REVEAL_ANIMATION_PRESETS:
AnimationPreset[] = [
  'typewriter',
  'word-reveal',
  'line-reveal',
];

export const VISUAL_EDITOR_TRANSITION_PRESETS:
Array<{
  value:
    SceneTransitionPreset;
  label: string;
}> = [
  {
    value: 'none',
    label: 'Không chuyển cảnh',
  },
  {
    value: 'fade',
    label: 'Mờ dần',
  },
  {
    value: 'crossfade',
    label: 'Mờ chéo',
  },
  {
    value: 'slide-left',
    label: 'Trượt trái',
  },
  {
    value: 'slide-right',
    label: 'Trượt phải',
  },
  {
    value: 'slide-up',
    label: 'Trượt lên',
  },
  {
    value: 'slide-down',
    label: 'Trượt xuống',
  },
  {
    value: 'zoom',
    label: 'Phóng to',
  },
  {
    value: 'blur',
    label: 'Mờ → rõ',
  },
];

const DEFAULT_FRAME:
SceneElementFrame = {
  x: 50,
  y: 50,
  width: 28,
  anchor: 'center',
  rotate: 0,
  scale: 1,
  opacity: 1,
  zIndex: 1,
};

const clone = <T,>(
  value: T
): T =>
  JSON.parse(
    JSON.stringify(
      value
    )
  );

const createId = (
  prefix: string
) => {
  const random =
    typeof crypto !==
      'undefined' &&
    typeof crypto
      .randomUUID ===
      'function'
      ? crypto
          .randomUUID()
          .slice(0, 8)
      : Math.random()
          .toString(36)
          .slice(2, 10);

  return `${prefix}-${random}`;
};

export const createVisualScene = (
  index = 1
):
  SceneCanvasDefinition => ({
  id:
    createId(
      'scene'
    ),

  title:
    `Trang ${index}`,

  transition: {
    preset: 'fade',
    durationMs: 420,
    easing: 'easeOut',
  },

  aspectRatio:
    16 / 9,

  maxWidth: 1200,

  overflow:
    'hidden',

  background: {
    color:
      '#fff4f7',
    imageFit:
      'cover',
    overlayColor:
      '#000000',
    overlayOpacity: 0,
    blurPx: 0,
    brightness: 1,
  },

  elements: [],
});

export const createTextElement =
  (
    index = 1
  ):
    SceneTextElement => ({
    id:
      createId(
        'text'
      ),

    type: 'text',

    text:
      `Dòng chữ ${index}`,

    frame: {
      ...DEFAULT_FRAME,
      width: 42,
      zIndex: 2,
    },

    mobileFrame: {
      width: 76,
    },

    textStyle: {
      color:
        '#c73757',
      fontSize: 36,
      fontWeight: 700,
      lineHeight: 1.15,
      textAlign:
        'center',
      whiteSpace:
        'pre-line',
    },

    animation: {
      preset:
        'fade-up',
      durationMs: 520,
      delayMs: 0,
      easing:
        'easeOut',
    },

    actions: [],
  });

export const createImageElement =
  (
    index = 1
  ):
    SceneImageElement => ({
    id:
      createId(
        'image'
      ),

    type: 'image',

    name:
      `Ảnh ${index}`,

    src:
      '',

    alt:
      `Ảnh ${index}`,

    frame: {
      ...DEFAULT_FRAME,
      width: 24,
      zIndex: 1,
    },

    mobileFrame: {
      width: 42,
    },

    imageStyle: {
      objectFit:
        'contain',
      borderRadius: 0,
    },

    animation: {
      preset:
        'zoom-in',
      durationMs: 520,
      delayMs: 0,
      easing:
        'easeOut',
    },

    actions: [],
  });

export const createDecorElement =
  (
    index = 1
  ):
    SceneImageElement => ({
    ...createImageElement(
      index
    ),

    id:
      createId(
        'decor'
      ),

    type: 'decor',

    frame: {
      ...DEFAULT_FRAME,
      x: 72,
      y: 28,
      width: 12,
      rotate: 8,
      zIndex: 0,
    },

    mobileFrame: {
      x: 78,
      y: 24,
      width: 20,
    },

    animation: {
      preset:
        'float',
      durationMs:
        1800,
      delayMs: 0,
      easing:
        'easeInOut',
    },
  });

export const createButtonElement =
  (
    index = 1
  ):
    SceneButtonElement => ({
    id:
      createId(
        'button'
      ),

    type: 'button',

    label:
      `Nút ${index}`,

    frame: {
      ...DEFAULT_FRAME,
      y: 72,
      width: 22,
      height: 10,
      zIndex: 3,
    },

    mobileFrame: {
      y: 75,
      width: 58,
      height: 8,
    },

    buttonStyle: {
      color:
        '#ffffff',
      background:
        '#ff245a',
      fontSize: 16,
      fontWeight: 700,
      textAlign:
        'center',
      borderRadius: 999,
      paddingX: 18,
      paddingY: 10,
      boxShadow:
        '0 10px 28px rgba(255,36,90,0.18)',
    },

    animation: {
      preset:
        'fade-up',
      durationMs: 440,
      delayMs: 140,
      easing:
        'easeOut',
    },

    actions: [],
  });

export const createShapeElement =
  (
    index = 1
  ):
    SceneShapeElement => ({
    id:
      createId(
        'shape'
      ),

    type: 'shape',

    name:
      `Shape ${index}`,

    frame: {
      ...DEFAULT_FRAME,
      width: 24,
      height: 18,
      zIndex: 1,
    },

    mobileFrame: {
      width: 40,
      height: 14,
    },

    shapeStyle: {
      kind:
        'rectangle',
      fill:
        '#f4b8c4',
      borderColor:
        '#cf5068',
      borderWidth: 0,
      borderRadius: 18,
      lineStyle:
        'solid',
    },

    animation: {
      preset:
        'fade',
      durationMs: 420,
      delayMs: 0,
      easing:
        'easeOut',
    },

    actions: [],
  });

export const createPolaroidElement =
  (
    index = 1
  ):
    ScenePhotoFrameElement => ({
    id:
      createId(
        'polaroid'
      ),

    type:
      'photo-frame',

    name:
      `Khung Polaroid ${index}`,

    src:
      '',

    alt:
      `Ảnh Polaroid ${index}`,

    caption:
      '',

    frame: {
      ...DEFAULT_FRAME,
      width: 26,
      height: 39,
      zIndex: 2,
    },

    mobileFrame: {
      width: 52,
      height: 25,
    },

    frameStyle: {
      preset:
        'polaroid',
      background:
        '#fffdf8',
      imageFit:
        'cover',
      innerRadius: 2,
      outerRadius: 4,
      paddingPercent: 6,
      captionAreaPercent: 22,
      boxShadow:
        '0 18px 38px rgba(40,25,25,0.18)',
      captionColor:
        '#34302f',
      captionFontSize: 16,
      captionFontWeight: 600,
      captionAlign:
        'center',
    },

    animation: {
      preset:
        'fade-up',
      durationMs: 520,
      delayMs: 0,
      easing:
        'easeOut',
    },

    actions: [],
  });

export const createYoutubeElement = (
  index = 1
): SceneYoutubeElement => ({
  id: createId('youtube'),

  type: 'youtube',

  name: `Nhạc YouTube ${index}`,

  youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',

  title: 'Nhạc nền tình yêu',

  frame: {
    ...DEFAULT_FRAME,
    width: 36,
    height: 24,
    zIndex: 2,
  },

  mobileFrame: {
    width: 78,
    height: 22,
  },

  youtubeStyle: {
    borderRadius: 16,
    borderWidth: 0,
    borderColor: '#ffffff',
    borderStyle: 'solid',
    boxShadow: '0 16px 36px rgba(0,0,0,0.22)',
    autoplay: false,
    loop: true,
    mute: false,
    controls: true,
    frameTheme: 'youtube',
    showTitle: true,
  },

  animation: {
    preset: 'zoom-in',
    durationMs: 500,
    delayMs: 0,
    easing: 'easeOut',
  },

  actions: [],
});


const introScene:
SceneCanvasDefinition = {
  id:
    'visual-intro',

  title:
    'Intro',

  transition: {
    preset: 'fade',
    durationMs: 420,
    easing: 'easeOut',
  },

  aspectRatio:
    16 / 9,

  maxWidth: 1200,

  overflow:
    'hidden',

  background: {
    color:
      '#fff4f7',
    overlayColor:
      '#000000',
    overlayOpacity: 0,
    blurPx: 0,
    brightness: 1,
  },

  elements: [
    {
      ...createImageElement(
        1
      ),

      id:
        'visual-intro-cat',

      src:
        '/images/cat-default.gif',

      frame: {
        x: 50,
        y: 39,
        width: 20,
        anchor:
          'center',
        zIndex: 1,
      },

      mobileFrame: {
        y: 38,
        width: 44,
      },
    },

    {
      ...createTextElement(
        1
      ),

      id:
        'visual-intro-title',

      text:
        'Do you love me? 💗',

      frame: {
        x: 50,
        y: 63,
        width: 54,
        anchor:
          'center',
        zIndex: 2,
      },

      mobileFrame: {
        y: 62,
        width: 88,
      },

      textStyle: {
        color:
          '#111827',
        fontSize: 42,
        fontWeight: 700,
        lineHeight: 1.1,
        textAlign:
          'center',
      },
    },

    {
      ...createButtonElement(
        1
      ),

      id:
        'visual-intro-button',

      label:
        'YES 💕',

      frame: {
        x: 50,
        y: 76,
        width: 18,
        height: 9,
        anchor:
          'center',
        zIndex: 3,
      },

      mobileFrame: {
        y: 75,
        width: 52,
        height: 8,
      },

      actions: [
        {
          type:
            'go-to-scene',
          sceneId:
            'visual-success',
        },
      ],
    },
  ],
};

const successScene:
SceneCanvasDefinition = {
  id:
    'visual-success',

  title:
    'Success',

  transition: {
    preset: 'zoom',
    durationMs: 460,
    easing: 'easeOut',
  },

  aspectRatio:
    16 / 9,

  maxWidth: 1200,

  overflow:
    'hidden',

  background: {
    color:
      '#fff0f5',
    overlayColor:
      '#000000',
    overlayOpacity: 0,
    blurPx: 0,
    brightness: 1,
  },

  elements: [
    {
      ...createTextElement(
        1
      ),

      id:
        'visual-success-title',

      text:
        "I knew you'd say yes 💕",

      frame: {
        x: 50,
        y: 28,
        width: 62,
        anchor:
          'center',
        zIndex: 2,
      },

      mobileFrame: {
        y: 28,
        width: 90,
      },

      textStyle: {
        color:
          '#ff245a',
        fontSize: 42,
        fontWeight: 700,
        lineHeight: 1.1,
        textAlign:
          'center',
      },

      animation: {
        preset:
          'fade-down',
        durationMs: 480,
        delayMs: 0,
        easing:
          'easeOut',
      },
    },

    {
      ...createImageElement(
        1
      ),

      id:
        'visual-success-gif',

      src:
        '/images/gifts/success.gif',

      frame: {
        x: 50,
        y: 52,
        width: 24,
        anchor:
          'center',
        zIndex: 1,
      },

      mobileFrame: {
        y: 50,
        width: 48,
      },
    },

    {
      ...createButtonElement(
        1
      ),

      id:
        'visual-success-back',

      label:
        'Quay lại',

      frame: {
        x: 50,
        y: 77,
        width: 18,
        height: 9,
        anchor:
          'center',
        zIndex: 3,
      },

      mobileFrame: {
        y: 76,
        width: 52,
        height: 8,
      },

      buttonStyle: {
        color:
          '#1f2937',
        background:
          '#ffffff',
        fontSize: 15,
        fontWeight: 700,
        textAlign:
          'center',
        borderRadius: 999,
        paddingX: 18,
        paddingY: 10,
        borderColor:
          '#f8b8c7',
        borderWidth: 1,
      },

      actions: [
        {
          type:
            'back-scene',
        },
      ],
    },
  ],
};

export const DEFAULT_LOVE_VISUAL_EDITOR_CONFIG:
TemplateVisualEditorConfig = {
  enabled: false,

  initialSceneId:
    'visual-intro',

  scenes: [
    introScene,
    successScene,
  ],
};


export const createBlankVisualEditorConfig =
  ():
    TemplateVisualEditorConfig => {
    const firstScene =
      createVisualScene(
        1
      );

    firstScene.title =
      'Scene 1';

    firstScene.background = {
      color:
        '#ffffff',
      imageFit:
        'cover',
      overlayColor:
        '#000000',
      overlayOpacity: 0,
      blurPx: 0,
      brightness: 1,
    };

    return {
      enabled: true,
      initialSceneId:
        firstScene.id,
      scenes: [
        firstScene,
      ],
    };
  };

const safeNumber = (
  value: unknown,
  fallback: number,
  min = -1000,
  max = 1000
) => {
  if (
    typeof value !==
      'number' ||
    !Number.isFinite(
      value
    )
  ) {
    return fallback;
  }

  return Math.min(
    max,
    Math.max(
      min,
      value
    )
  );
};

const safeString = (
  value: unknown,
  fallback: string,
  max = 4000
) => {
  if (
    typeof value !==
    'string'
  ) {
    return fallback;
  }

  return value.slice(
    0,
    max
  );
};

const normalizeFrame = (
  value: unknown,
  fallback:
    SceneElementFrame
):
  SceneElementFrame => {
  const data =
    value &&
    typeof value ===
      'object'
      ? value as any
      : {};

  return {
    ...fallback,

    x:
      safeNumber(
        data.x,
        fallback.x,
        -100,
        200
      ),

    y:
      safeNumber(
        data.y,
        fallback.y,
        -100,
        200
      ),

    width:
      safeNumber(
        data.width,
        fallback.width,
        1,
        200
      ),

    height:
      typeof data.height ===
        'number'
        ? safeNumber(
            data.height,
            fallback.height ||
              10,
            1,
            200
          )
        : fallback.height,

    rotate:
      safeNumber(
        data.rotate,
        fallback.rotate ||
          0,
        -720,
        720
      ),

    scale:
      safeNumber(
        data.scale,
        fallback.scale ||
          1,
        0.05,
        10
      ),

    opacity:
      safeNumber(
        data.opacity,
        fallback.opacity ??
          1,
        0,
        1
      ),

    zIndex:
      Math.round(
        safeNumber(
          data.zIndex,
          fallback.zIndex ||
            0,
          -100,
          1000
        )
      ),

    anchor:
      typeof data.anchor ===
        'string'
        ? data.anchor
        : fallback.anchor,
  } as
    SceneElementFrame;
};

const normalizeActions = (
  value: unknown
):
  SceneElementAction[] => {
  if (
    !Array.isArray(
      value
    )
  ) {
    return [];
  }

  return value
    .filter(
      (
        item
      ) =>
        item &&
        typeof item ===
          'object' &&
        typeof item.type ===
          'string'
    )
    .slice(
      0,
      12
    ) as
    SceneElementAction[];
};

const normalizeElement = (
  value: unknown,
  index: number
):
  SceneElement | null => {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return null;
  }

  const data =
    value as any;

  const type =
    data.type ===
      'text' ||
    data.type ===
      'image' ||
    data.type ===
      'button' ||
    data.type ===
      'decor' ||
    data.type ===
      'shape' ||
    data.type ===
      'photo-frame' ||
    data.type ===
      'youtube'
      ? data.type
      : null;

  if (!type) {
    return null;
  }

  const baseFrame =
    normalizeFrame(
      data.frame,
      {
        ...DEFAULT_FRAME,
      }
    );

  const base = {
    id:
      safeString(
        data.id,
        `element-${index}`,
        120
      ),

    type,

    name:
      safeString(
        data.name,
        '',
        160
      ) ||
      undefined,

    groupId:
      safeString(
        data.groupId,
        '',
        160
      ) ||
      undefined,

    frame:
      baseFrame,

    mobileFrame:
      data.mobileFrame &&
      typeof data
        .mobileFrame ===
        'object'
        ? normalizeFrame(
            {
              ...baseFrame,
              ...data.mobileFrame,
            },
            baseFrame
          )
        : undefined,

    animation:
      data.animation &&
      typeof data
        .animation ===
        'object'
        ? {
            ...data.animation,
          }
        : {
            preset:
              'fade',
            durationMs:
              500,
          },

    visible:
      data.visible !==
      false,

    desktopVisible:
      typeof data.desktopVisible === 'boolean'
        ? data.desktopVisible
        : undefined,

    mobileVisible:
      typeof data.mobileVisible === 'boolean'
        ? data.mobileVisible
        : undefined,

    locked:
      data.locked ===
      true,

    className:
      safeString(
        data.className,
        '',
        500
      ),

    ariaLabel:
      safeString(
        data.ariaLabel,
        '',
        300
      ),

    actions:
      normalizeActions(
        data.actions
      ),
  };

  if (
    type ===
    'text'
  ) {
    return {
      ...base,

      type: 'text',

      text:
        safeString(
          data.text,
          `Dòng chữ ${index + 1}`
        ),

      textStyle:
        data.textStyle &&
        typeof data
          .textStyle ===
          'object'
          ? {
              ...data.textStyle,
            }
          : {},

      mobileTextStyle:
        data.mobileTextStyle &&
        typeof data
          .mobileTextStyle ===
          'object'
          ? {
              ...data.mobileTextStyle,
            }
          : data.textStyle?.mobile &&
              typeof data.textStyle
                .mobile ===
                'object'
            ? {
                ...data.textStyle.mobile,
              }
            : undefined,
    };
  }

  if (
    type ===
      'image' ||
    type ===
      'decor'
  ) {
    return {
      ...base,

      type,

      src:
        safeString(
          data.src,
          '',
          2000
        ),

      mobileSrc:
        safeString(
          data.mobileSrc,
          '',
          2000
        ) || undefined,

      alt:
        safeString(
          data.alt,
          '',
          300
        ),

      imageStyle:
        data.imageStyle &&
        typeof data
          .imageStyle ===
          'object'
          ? {
              ...data.imageStyle,
            }
          : {},
    };
  }

  if (
    type ===
    'photo-frame'
  ) {
    return {
      ...base,

      type:
        'photo-frame',

      src:
        safeString(
          data.src,
          '',
          2000
        ),

      mobileSrc:
        safeString(
          data.mobileSrc,
          '',
          2000
        ) || undefined,

      alt:
        safeString(
          data.alt,
          '',
          300
        ),

      caption:
        safeString(
          data.caption,
          '',
          500
        ),

      mobileCaption:
        typeof data.mobileCaption === 'string'
          ? safeString(
              data.mobileCaption,
              '',
              500
            )
          : undefined,

      frameStyle:
        data.frameStyle &&
        typeof data
          .frameStyle ===
          'object'
          ? {
              ...data.frameStyle,
            }
          : {
              preset:
                'polaroid',
              background:
                '#fffdf8',
              imageFit:
                'cover',
              paddingPercent:
                6,
              captionAreaPercent:
                22,
            },

      mobileFrameStyle:
        data.mobileFrameStyle &&
        typeof data.mobileFrameStyle === 'object'
          ? {
              ...data.mobileFrameStyle,
            }
          : undefined,
    };
  }

  if (
    type ===
    'shape'
  ) {
    return {
      ...base,

      type: 'shape',

      shapeStyle:
        data.shapeStyle &&
        typeof data
          .shapeStyle ===
          'object'
          ? {
              ...data.shapeStyle,
            }
          : {
              kind:
                'rectangle',
              fill:
                '#f4b8c4',
              borderRadius:
                18,
            },
    };
  }

  if (
    type ===
    'youtube'
  ) {
    return {
      ...base,

      type: 'youtube',

      youtubeUrl:
        safeString(
          data.youtubeUrl,
          'https://www.youtube.com/watch?v=jfKfPfyJRdk',
          2000
        ),

      mobileYoutubeUrl:
        safeString(
          data.mobileYoutubeUrl,
          '',
          2000
        ) || undefined,

      title:
        safeString(
          data.title,
          'Nhạc nền',
          300
        ),

      mobileTitle:
        typeof data.mobileTitle === 'string'
          ? safeString(
              data.mobileTitle,
              '',
              300
            )
          : undefined,

      youtubeStyle:
        data.youtubeStyle &&
        typeof data.youtubeStyle === 'object'
          ? {
              ...data.youtubeStyle,
            }
          : {
              borderRadius: 16,
              borderWidth: 0,
              borderColor: '#ffffff',
              borderStyle: 'solid',
              boxShadow: '0 16px 36px rgba(0,0,0,0.22)',
              autoplay: false,
              loop: true,
              mute: false,
              controls: true,
              frameTheme: 'youtube',
              showTitle: true,
            },

      mobileYoutubeStyle:
        data.mobileYoutubeStyle &&
        typeof data.mobileYoutubeStyle === 'object'
          ? {
              ...data.mobileYoutubeStyle,
            }
          : undefined,
    };
  }

  return {
    ...base,

    type: 'button',

    label:
      safeString(
        data.label,
        `Nút ${index + 1}`,
        500
      ),

    buttonStyle:
      data.buttonStyle &&
      typeof data
        .buttonStyle ===
        'object'
        ? {
            ...data.buttonStyle,
          }
        : {},

    mobileButtonStyle:
      data.mobileButtonStyle &&
      typeof data
        .mobileButtonStyle ===
        'object'
        ? {
            ...data.mobileButtonStyle,
          }
        : data.buttonStyle?.mobile &&
            typeof data.buttonStyle
              .mobile ===
              'object'
          ? {
              ...data.buttonStyle.mobile,
            }
          : undefined,
  };
};

const normalizeScene = (
  value: unknown,
  index: number
):
  SceneCanvasDefinition | null => {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return null;
  }

  const data =
    value as any;

  const elements =
    Array.isArray(
      data.elements
    )
      ? data.elements
          .map(
            normalizeElement
          )
          .filter(
            Boolean
          ) as
          SceneElement[]
      : [];

  return {
    id:
      safeString(
        data.id,
        `scene-${index + 1}`,
        120
      ),

    pageMode:
      data.pageMode ===
        'long-page' ||
      data.pageMode ===
        'screen'
        ? data.pageMode
        : undefined,

    title:
      safeString(
        data.title,
        `Trang ${index + 1}`,
        160
      ),

    transition: {
      preset:
        typeof data
          .transition
          ?.preset ===
          'string'
          ? data.transition
              .preset
          : 'fade',

      durationMs:
        safeNumber(
          data
            .transition
            ?.durationMs,
          420,
          0,
          5000
        ),

      easing:
        typeof data
          .transition
          ?.easing ===
          'string'
          ? data.transition
              .easing
          : 'easeOut',
    } as any,

    aspectRatio:
      safeNumber(
        data.aspectRatio,
        16 / 9,
        0.2,
        5
      ),

    minHeight:
      typeof data
        .minHeight ===
        'number'
        ? safeNumber(
            data.minHeight,
            0,
            0,
            Number.MAX_SAFE_INTEGER
          )
        : undefined,

    mobileMinHeight:
      typeof data
        .mobileMinHeight ===
        'number'
        ? safeNumber(
            data.mobileMinHeight,
            data.minHeight || 0,
            0,
            Number.MAX_SAFE_INTEGER
          )
        : typeof data
            .minHeight ===
            'number'
          ? safeNumber(
              data.minHeight,
              0,
              0,
              Number.MAX_SAFE_INTEGER
            )
          : undefined,

    maxWidth:
      safeNumber(
        data.maxWidth,
        1200,
        240,
        4000
      ),

    overflow:
      data.overflow ===
      'visible'
        ? 'visible'
        : 'hidden',

    background: {
      color:
        safeString(
          data.background
            ?.color,
          '#fff4f7',
          100
        ),

      imageUrl:
        safeString(
          data.background
            ?.imageUrl,
          '',
          2000
        ) ||
        undefined,

      imageFit:
        data.background
          ?.imageFit ===
        'contain'
          ? 'contain'
          : 'cover',

      overlayColor:
        safeString(
          data.background
            ?.overlayColor,
          '#000000',
          100
        ),

      overlayOpacity:
        safeNumber(
          data.background
            ?.overlayOpacity,
          0,
          0,
          1
        ),

      blurPx:
        safeNumber(
          data.background
            ?.blurPx,
          0,
          0,
          100
        ),

      brightness:
        safeNumber(
          data.background
            ?.brightness,
          1,
          0,
          3
        ),
    },

    elements:
      elements.slice(
        0,
        120
      ),
  };
};

export const cloneVisualEditorConfig =
  (
    config:
      TemplateVisualEditorConfig
  ):
    TemplateVisualEditorConfig =>
    clone(
      config
    );

export const normalizeVisualEditorConfig =
  (
    value: unknown,
    fallback:
      TemplateVisualEditorConfig =
        DEFAULT_LOVE_VISUAL_EDITOR_CONFIG
  ):
    TemplateVisualEditorConfig => {
    const data =
      value &&
      typeof value ===
        'object'
        ? value as any
        : {};

    const scenes =
      Array.isArray(
        data.scenes
      )
        ? data.scenes
            .map(
              normalizeScene
            )
            .filter(
              Boolean
            ) as
            SceneCanvasDefinition[]
        : clone(
            fallback.scenes
          );

    const normalizedScenes =
      scenes.length >
      0
        ? scenes
        : clone(
            fallback.scenes
          );

    const requestedInitial =
      safeString(
        data.initialSceneId,
        fallback.initialSceneId,
        120
      );

    const initialSceneId =
      normalizedScenes.some(
        (scene) =>
          scene.id ===
          requestedInitial
      )
        ? requestedInitial
        : normalizedScenes[0]
            .id;

    return {
      enabled:
        typeof data.enabled ===
        'boolean'
          ? data.enabled
          : fallback.enabled,

      initialSceneId,

      scenes:
        normalizedScenes.slice(
          0,
          40
        ),
    };
  };

export const duplicateVisualScene =
  (
    scene:
      SceneCanvasDefinition,
    index: number
  ):
    SceneCanvasDefinition => {
    const copy =
      clone(
        scene
      );

    const oldId =
      copy.id;

    const newId =
      createId(
        'scene'
      );

    copy.id =
      newId;

    copy.title =
      `${copy.title || `Scene ${index}`} copy`;

    copy.elements =
      copy.elements.map(
        (element) => {
          const newElement = {
            ...clone(
              element
            ),

            id:
              createId(
                element.type
              ),
          } as
            SceneElement;

          newElement.actions =
            (
              newElement.actions ||
              []
            ).map(
              (action) => {
                if (
                  action.type ===
                    'go-to-scene' &&
                  action.sceneId ===
                    oldId
                ) {
                  return {
                    ...action,
                    sceneId:
                      newId,
                  };
                }

                return action;
              }
            );

          return newElement;
        }
      );

    return copy;
  };
