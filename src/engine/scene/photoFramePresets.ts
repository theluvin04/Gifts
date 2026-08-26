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

export const PHOTO_FRAME_PRESETS: PhotoFramePresetDefinition[] = [
  {
    value: 'photobooth-4',
    label: 'Dải 4 ảnh Đỏ đô (Photobooth)',
    description: 'Dải film 4 ảnh dọc viền đỏ nhung sang trọng, bóng đổ 3D như hình mẫu.',
    desktop: {
      width: 15,
      height: 58,
    },
    mobile: {
      width: 36,
      height: 48,
    },
    style: {
      preset: 'photobooth-4',
      layout: 'strip-vertical-4',
      photoCount: 4,
      background: '#7e192a',
      imageFit: 'cover',
      innerRadius: 3,
      outerRadius: 6,
      paddingPercent: 4,
      gapPercent: 2.5,
      captionAreaPercent: 8,
      boxShadow: '0 20px 45px -4px rgba(50, 10, 18, 0.45), 0 8px 18px rgba(0, 0, 0, 0.22)',
      captionColor: '#ffffff',
      captionFontSize: 13,
      captionFontWeight: 600,
      captionAlign: 'center',
    },
  },
  {
    value: 'photobooth-white-4',
    label: 'Dải 4 ảnh Trắng nghệ thuật',
    description: 'Dải 4 ảnh dọc phong cách photobooth Hàn Quốc màu trắng.',
    desktop: {
      width: 15,
      height: 58,
    },
    mobile: {
      width: 36,
      height: 48,
    },
    style: {
      preset: 'photobooth-white-4',
      layout: 'strip-vertical-4',
      photoCount: 4,
      background: '#ffffff',
      imageFit: 'cover',
      innerRadius: 3,
      outerRadius: 6,
      paddingPercent: 4,
      gapPercent: 2.5,
      captionAreaPercent: 8,
      boxShadow: '0 18px 42px rgba(25, 20, 20, 0.22), 0 6px 14px rgba(0, 0, 0, 0.1)',
      captionColor: '#333333',
      captionFontSize: 13,
      captionFontWeight: 600,
      captionAlign: 'center',
    },
  },
  {
    value: 'photobooth-black-4',
    label: 'Dải 4 ảnh Film đen',
    description: 'Dải film 4 ảnh dọc màu đen cinematic cá tính.',
    desktop: {
      width: 15,
      height: 58,
    },
    mobile: {
      width: 36,
      height: 48,
    },
    style: {
      preset: 'photobooth-black-4',
      layout: 'strip-vertical-4',
      photoCount: 4,
      background: '#181818',
      imageFit: 'cover',
      innerRadius: 3,
      outerRadius: 6,
      paddingPercent: 4,
      gapPercent: 2.5,
      captionAreaPercent: 8,
      boxShadow: '0 22px 50px rgba(0, 0, 0, 0.45), 0 8px 18px rgba(0, 0, 0, 0.25)',
      captionColor: '#f5f5f5',
      captionFontSize: 13,
      captionFontWeight: 600,
      captionAlign: 'center',
    },
  },
  {
    value: 'photobooth-pink-4',
    label: 'Dải 4 ảnh Hồng Pastel',
    description: 'Dải film 4 ảnh dọc ngọt ngào cho kỷ niệm couple.',
    desktop: {
      width: 15,
      height: 58,
    },
    mobile: {
      width: 36,
      height: 48,
    },
    style: {
      preset: 'photobooth-pink-4',
      layout: 'strip-vertical-4',
      photoCount: 4,
      background: '#ffd6e0',
      imageFit: 'cover',
      innerRadius: 3,
      outerRadius: 6,
      paddingPercent: 4,
      gapPercent: 2.5,
      captionAreaPercent: 8,
      boxShadow: '0 18px 40px rgba(220, 60, 100, 0.25), 0 6px 14px rgba(0, 0, 0, 0.1)',
      captionColor: '#8a1c36',
      captionFontSize: 13,
      captionFontWeight: 600,
      captionAlign: 'center',
    },
  },
  {
    value: 'photobooth-3',
    label: 'Dải 3 ảnh Photobooth',
    description: 'Dải 3 ảnh dọc phong cách photostrip.',
    desktop: {
      width: 16,
      height: 46,
    },
    mobile: {
      width: 38,
      height: 38,
    },
    style: {
      preset: 'photobooth-3',
      layout: 'strip-vertical-3',
      photoCount: 3,
      background: '#ffffff',
      imageFit: 'cover',
      innerRadius: 3,
      outerRadius: 6,
      paddingPercent: 4.5,
      gapPercent: 3,
      captionAreaPercent: 10,
      boxShadow: '0 18px 40px rgba(0, 0, 0, 0.2), 0 6px 14px rgba(0, 0, 0, 0.1)',
      captionColor: '#333333',
      captionFontSize: 13,
      captionFontWeight: 600,
      captionAlign: 'center',
    },
  },
  {
    value: 'polaroid-grid-4',
    label: 'Lưới 4 ảnh Polaroid (2x2)',
    description: 'Khung Polaroid vuông chứa lưới 4 ảnh xếp 2 hàng 2 cột.',
    desktop: {
      width: 28,
      height: 35,
    },
    mobile: {
      width: 58,
      height: 25,
    },
    style: {
      preset: 'polaroid-grid-4',
      layout: 'grid-2x2',
      photoCount: 4,
      background: '#fffdf8',
      imageFit: 'cover',
      innerRadius: 2,
      outerRadius: 5,
      paddingPercent: 5,
      gapPercent: 3,
      captionAreaPercent: 16,
      boxShadow: '0 20px 44px rgba(40, 25, 25, 0.22), 0 8px 16px rgba(0, 0, 0, 0.1)',
      captionColor: '#34302f',
      captionFontSize: 15,
      captionFontWeight: 600,
      captionAlign: 'center',
    },
  },
  {
    value:
      'polaroid',
    label:
      'Cổ điển dọc (1 ảnh)',
    description:
      'Khung trắng dày, phần chú thích lớn.',
    desktop: {
      width: 26,
      height: 39,
    },
    mobile: {
      width: 52,
      height: 25,
    },
    style: {
      preset:
        'polaroid',
      layout: 'single',
      photoCount: 1,
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
      height: 24,
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
      height: 19.5,
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
      height: 20,
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
      height: 24.5,
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
      height: 24.5,
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
      height: 25.5,
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
      height: 22.5,
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

export const PHOTOBOOTH_SHADOW_PRESETS = [
  {
    label: 'Bóng 3D Đỏ đô sâu (Photobooth chuẩn)',
    value: '0 20px 45px -4px rgba(50, 10, 18, 0.45), 0 8px 18px rgba(0, 0, 0, 0.22)',
    description: 'Bóng đổ 3D sâu đa tầng phù hợp dải film đỏ.',
  },
  {
    label: 'Bóng đổ giấy nghiêng lãng mạn (Tilted Paper)',
    value: '6px 16px 36px rgba(35, 10, 15, 0.32), -2px 6px 14px rgba(0, 0, 0, 0.12)',
    description: 'Tạo hiệu ứng dải ảnh như đang nằm nghiêng trên bàn.',
  },
  {
    label: 'Bóng nổi 3D đa tầng (Deep Float 3D)',
    value: '0 24px 54px rgba(0, 0, 0, 0.35), 0 8px 16px rgba(0, 0, 0, 0.18)',
    description: 'Bóng đổ cực kỳ nổi khối và chân thực.',
  },
  {
    label: 'Bóng mềm thanh lịch (Soft Ambient)',
    value: '0 14px 34px rgba(40, 20, 25, 0.18)',
    description: 'Bóng mịn lan tỏa đều.',
  },
  {
    label: 'Bóng phát sáng Gold sang trọng',
    value: '0 0 30px rgba(245, 158, 11, 0.45), 0 12px 28px rgba(0, 0, 0, 0.18)',
    description: 'Viền sáng ánh kim gold rực rỡ.',
  },
  {
    label: 'Bóng phát sáng Đỏ nhung (Velvet Glow)',
    value: '0 0 32px rgba(184, 62, 87, 0.5), 0 12px 28px rgba(40, 10, 20, 0.25)',
    description: 'Ánh hào quang đỏ nhung lãng mạn.',
  },
  {
    label: 'Bóng phẳng tối giản (Minimal)',
    value: '0 4px 12px rgba(0, 0, 0, 0.08)',
    description: 'Bóng nhẹ sát mặt phẳng.',
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
      layout:
        style?.layout || preset.style.layout || 'single',
      photoCount:
        style?.photoCount || preset.style.photoCount || (preset.value.includes('4') ? 4 : preset.value.includes('3') ? 3 : 1),
    };
  };
