export interface ShadowPreset {
  label: string;
  value: string;
  description?: string;
}

export const TEXT_SHADOW_PRESETS: ShadowPreset[] = [
  {
    label: 'Không bóng',
    value: '',
    description: 'Chữ phẳng bình thường',
  },
  {
    label: 'Bóng mềm tự nhiên',
    value: '0 2px 8px rgba(0, 0, 0, 0.35)',
    description: 'Bóng chữ mịn nhẹ nhàng',
  },
  {
    label: 'Bóng nổi 3D sâu',
    value: '2px 4px 10px rgba(0, 0, 0, 0.65)',
    description: 'Tạo chiều sâu nổi bật cho tiêu đề',
  },
  {
    label: 'Bóng sắc nét (Drop)',
    value: '2px 2px 0px rgba(0, 0, 0, 0.85)',
    description: 'Đổ bóng gắt kiểu retro',
  },
  {
    label: 'Chữ nổi 3D đa tầng',
    value: '1px 1px 0px #000000, 2px 2px 0px #000000, 4px 6px 12px rgba(0, 0, 0, 0.5)',
    description: 'Hiệu ứng chữ 3D nhiều lớp',
  },
  {
    label: 'Phát sáng Đỏ nhung',
    value: '0 0 16px rgba(184, 62, 87, 0.85), 0 0 32px rgba(126, 25, 42, 0.5)',
    description: 'Hào quang đỏ nhung lãng mạn',
  },
  {
    label: 'Phát sáng Gold sang trọng',
    value: '0 0 14px rgba(245, 158, 11, 0.9), 0 0 28px rgba(217, 119, 6, 0.5)',
    description: 'Hào quang vàng hoàng gia',
  },
  {
    label: 'Phát sáng Neon Hồng',
    value: '0 0 16px rgba(244, 63, 94, 0.85), 0 0 32px rgba(225, 29, 72, 0.6)',
    description: 'Ánh sáng neon ngọt ngào',
  },
  {
    label: 'Phát sáng Trắng tinh tế',
    value: '0 0 12px rgba(255, 255, 255, 0.9), 0 0 24px rgba(255, 255, 255, 0.6)',
    description: 'Hào quang trắng phát sáng',
  },
  {
    label: 'Bóng mờ lãng mạn',
    value: '0 4px 20px rgba(80, 20, 35, 0.55)',
    description: 'Bóng mờ tone đỏ đô',
  },
];

export const BOX_SHADOW_PRESETS: ShadowPreset[] = [
  {
    label: 'Không bóng',
    value: '',
    description: 'Không đổ bóng',
  },
  {
    label: 'Bóng 3D Đỏ đô (Photobooth)',
    value: '0 20px 45px -4px rgba(50, 10, 18, 0.45), 0 8px 18px rgba(0, 0, 0, 0.22)',
    description: 'Bóng đổ 3D sâu đa tầng chân thực',
  },
  {
    label: 'Bóng giấy nghiêng (Tilted)',
    value: '6px 16px 36px rgba(35, 10, 15, 0.32), -2px 6px 14px rgba(0, 0, 0, 0.12)',
    description: 'Bóng lệch góc tạo cảm giác đặt nghiêng trên bàn',
  },
  {
    label: 'Bóng nổi 3D đa tầng (Deep Float)',
    value: '0 24px 54px rgba(0, 0, 0, 0.35), 0 8px 16px rgba(0, 0, 0, 0.18)',
    description: 'Bóng đổ cực kỳ nổi khối',
  },
  {
    label: 'Bóng mềm thanh lịch (Soft)',
    value: '0 14px 34px rgba(40, 20, 25, 0.18)',
    description: 'Bóng mịn lan tỏa đều',
  },
  {
    label: 'Phát sáng Gold sang trọng',
    value: '0 0 30px rgba(245, 158, 11, 0.45), 0 12px 28px rgba(0, 0, 0, 0.18)',
    description: 'Hào quang ánh kim gold',
  },
  {
    label: 'Phát sáng Đỏ nhung (Velvet Glow)',
    value: '0 0 32px rgba(184, 62, 87, 0.5), 0 12px 28px rgba(40, 10, 20, 0.25)',
    description: 'Hào quang đỏ nhung lãng mạn',
  },
  {
    label: 'Phát sáng Neon Hồng',
    value: '0 0 28px rgba(244, 63, 94, 0.55), 0 10px 24px rgba(0, 0, 0, 0.15)',
    description: 'Hào quang neon hồng ngọt ngào',
  },
  {
    label: 'Phát sáng Trắng tinh tế',
    value: '0 0 24px rgba(255, 255, 255, 0.7), 0 8px 20px rgba(0, 0, 0, 0.15)',
    description: 'Hào quang trắng sáng',
  },
  {
    label: 'Bóng phẳng tối giản (Minimal)',
    value: '0 4px 12px rgba(0, 0, 0, 0.08)',
    description: 'Bóng nhẹ nhàng',
  },
  {
    label: 'Bóng nâng cao (High Elevation)',
    value: '0 30px 60px -12px rgba(50, 50, 93, 0.25), 0 18px 36px -18px rgba(0, 0, 0, 0.3)',
    description: 'Tạo cảm giác bay bổng trên cao',
  },
];
