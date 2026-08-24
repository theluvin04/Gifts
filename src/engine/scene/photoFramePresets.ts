import type {
  ScenePhotoFramePreset,
  ScenePhotoFrameStyle,
} from './elementTypes';

export interface PhotoFramePresetDefinition {
  value:
    ScenePhotoFramePreset;

  label: string;

  description:
    string;

  desktop: {
    width: number;
    height: number;
  };

  mobile: {
    width: number;
    height: number;
  };

  style:
    ScenePhotoFrameStyle;
}

export const PHOTO_FRAME_PRESETS:
PhotoFramePresetDefinition[] = [
  {
    value:
      'polaroid',
    label:
      'Cổ điển dọc',
    description:
      'Khung trắng dày, phần chú thích lớn.',
    desktop: {
      width: 26,
      height: 39,
    },
    mobile: {
      width: 52,
      height: 34,
    },
    style: {
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
  },
  {
    value:
      'polaroid-square',
    label:
      'Vuông',
    description:
      'Ảnh vuông cân đối, hợp scrapbook.',
    desktop: {
      width: 28,
      height: 35,
    },
    mobile: {
      width: 58,
      height: 31,
    },
    style: {
      preset:
        'polaroid-square',
      background:
        '#fffdf8',
      imageFit:
        'cover',
      innerRadius: 2,
      outerRadius: 4,
      paddingPercent: 6,
      captionAreaPercent: 18,
      boxShadow:
        '0 16px 34px rgba(40,25,25,0.17)',
      captionColor:
        '#34302f',
      captionFontSize: 15,
      captionFontWeight: 600,
      captionAlign:
        'center',
    },
  },
  {
    value:
      'polaroid-wide',
    label:
      'Ngang',
    description:
      'Khung ngang cho ảnh phong cảnh hoặc couple.',
    desktop: {
      width: 35,
      height: 29,
    },
    mobile: {
      width: 72,
      height: 25,
    },
    style: {
      preset:
        'polaroid-wide',
      background:
        '#fffdf8',
      imageFit:
        'cover',
      innerRadius: 2,
      outerRadius: 4,
      paddingPercent: 5,
      captionAreaPercent: 18,
      boxShadow:
        '0 16px 36px rgba(40,25,25,0.17)',
      captionColor:
        '#34302f',
      captionFontSize: 14,
      captionFontWeight: 600,
      captionAlign:
        'center',
    },
  },
  {
    value:
      'polaroid-mini',
    label:
      'Mini',
    description:
      'Khung nhỏ gọn để xếp nhiều ảnh.',
    desktop: {
      width: 19,
      height: 29,
    },
    mobile: {
      width: 40,
      height: 25,
    },
    style: {
      preset:
        'polaroid-mini',
      background:
        '#ffffff',
      imageFit:
        'cover',
      innerRadius: 1,
      outerRadius: 2,
      paddingPercent: 5,
      captionAreaPercent: 19,
      boxShadow:
        '0 10px 22px rgba(30,20,20,0.15)',
      captionColor:
        '#403a38',
      captionFontSize: 12,
      captionFontWeight: 600,
      captionAlign:
        'center',
    },
  },
  {
    value:
      'polaroid-rounded',
    label:
      'Bo tròn mềm',
    description:
      'Khung hiện đại, góc bo lớn.',
    desktop: {
      width: 27,
      height: 38,
    },
    mobile: {
      width: 54,
      height: 33,
    },
    style: {
      preset:
        'polaroid-rounded',
      background:
        '#fffefe',
      imageFit:
        'cover',
      innerRadius: 14,
      outerRadius: 18,
      paddingPercent: 6,
      captionAreaPercent: 20,
      boxShadow:
        '0 18px 44px rgba(50,30,35,0.14)',
      captionColor:
        '#34302f',
      captionFontSize: 15,
      captionFontWeight: 600,
      captionAlign:
        'center',
    },
  },
  {
    value:
      'polaroid-black',
    label:
      'Film đen',
    description:
      'Khung film tối, hợp ảnh đĩa nhạc và mood tối.',
    desktop: {
      width: 27,
      height: 38,
    },
    mobile: {
      width: 54,
      height: 33,
    },
    style: {
      preset:
        'polaroid-black',
      background:
        '#181818',
      imageFit:
        'cover',
      innerRadius: 2,
      outerRadius: 4,
      paddingPercent: 6,
      captionAreaPercent: 20,
      boxShadow:
        '0 20px 46px rgba(0,0,0,0.28)',
      captionColor:
        '#f7f4ef',
      captionFontSize: 15,
      captionFontWeight: 600,
      captionAlign:
        'center',
    },
  },
  {
    value:
      'polaroid-vintage',
    label:
      'Vintage kem',
    description:
      'Màu giấy kem và bóng đổ nhẹ.',
    desktop: {
      width: 27,
      height: 39,
    },
    mobile: {
      width: 54,
      height: 34,
    },
    style: {
      preset:
        'polaroid-vintage',
      background:
        '#f2eadc',
      imageFit:
        'cover',
      innerRadius: 1,
      outerRadius: 3,
      paddingPercent: 7,
      captionAreaPercent: 23,
      boxShadow:
        '4px 10px 28px rgba(65,45,30,0.19)',
      captionColor:
        '#5d4e42',
      captionFontFamily:
        'Georgia, serif',
      captionFontSize: 15,
      captionFontWeight: 500,
      captionAlign:
        'center',
    },
  },
  {
    value:
      'polaroid-clean',
    label:
      'Trắng tối giản',
    description:
      'Viền mỏng, ít khoảng trắng hơn.',
    desktop: {
      width: 29,
      height: 35,
    },
    mobile: {
      width: 58,
      height: 30,
    },
    style: {
      preset:
        'polaroid-clean',
      background:
        '#ffffff',
      imageFit:
        'cover',
      innerRadius: 0,
      outerRadius: 0,
      paddingPercent: 3.5,
      captionAreaPercent: 14,
      boxShadow:
        '0 12px 28px rgba(25,25,25,0.12)',
      captionColor:
        '#222222',
      captionFontSize: 13,
      captionFontWeight: 500,
      captionAlign:
        'left',
    },
  },
];

export const getPhotoFramePreset =
  (
    preset:
      ScenePhotoFramePreset |
      undefined
  ) => {
    return (
      PHOTO_FRAME_PRESETS.find(
        (
          item
        ) =>
          item.value ===
          preset
      ) ||
      PHOTO_FRAME_PRESETS[0]
    );
  };

export const resolvePhotoFrameStyle =
  (
    style:
      ScenePhotoFrameStyle |
      undefined
  ):
    ScenePhotoFrameStyle => {
    const preset =
      getPhotoFramePreset(
        style?.preset
      );

    return {
      ...preset.style,
      ...(style || {}),
      preset:
        preset.value,
    };
  };
