import type {
  TemplateConfig,
} from '../services/templateService';

export interface TemplatePresentation {
  category: string;
  eyebrow: string;
  description: string;
  highlights: string[];
}

const normalize = (
  template: TemplateConfig
) =>
  `${template.id} ${template.name}`
    .toLowerCase();

export const getTemplatePresentation = (
  template: TemplateConfig
): TemplatePresentation => {
  const value = normalize(template);

  if (value.includes('birthday')) {
    return {
      category: 'Birthday',
      eyebrow: 'Quà sinh nhật tương tác',
      description:
        'Biến lời chúc sinh nhật thành một website nhỏ có ảnh, chữ và hiệu ứng riêng dành cho người nhận.',
      highlights: [
        'Thay ảnh và lời nhắn của riêng bạn',
        'Bố cục và hiệu ứng giữ đúng thiết kế mẫu',
        'Nhận link riêng để gửi sau khi hoàn tất',
      ],
    };
  }

  if (
    value.includes('wedding') ||
    value.includes('invitation') ||
    value.includes('wedding-bestie')
  ) {
    return {
      category: 'Wedding',
      eyebrow: 'Thiệp cưới website',
      description:
        'Một thiệp cưới dạng website có thể cuộn, tương tác và cá nhân hoá để gửi cho khách mời bằng một đường link.',
      highlights: [
        'Tối ưu hiển thị trên máy tính và điện thoại',
        'Thay nội dung được chọn mà không phá bố cục',
        'Gửi khách mời bằng link riêng tiện lợi',
      ],
    };
  }

  if (value.includes('anniversary')) {
    return {
      category: 'Anniversary',
      eyebrow: 'Kỷ niệm của hai người',
      description:
        'Gói những bức ảnh, lời nhắn và khoảnh khắc đáng nhớ thành một trải nghiệm riêng dành cho ngày kỷ niệm.',
      highlights: [
        'Cá nhân hoá ảnh và lời nhắn',
        'Hiệu ứng tương tác theo thiết kế mẫu',
        'Mở trực tiếp bằng link, không cần cài app',
      ],
    };
  }

  if (
    value.includes('love') ||
    value.includes('couple')
  ) {
    return {
      category: 'Love',
      eyebrow: 'Một câu chuyện chỉ của hai người',
      description:
        'Một món quà số nhỏ nhưng chứa ảnh, lời nhắn và những chi tiết được làm riêng cho người bạn yêu.',
      highlights: [
        'Thay ảnh và nội dung cá nhân',
        'Giữ nguyên hiệu ứng và thiết kế gốc',
        'Nhận link riêng sau khi hoàn tất',
      ],
    };
  }

  return {
    category: 'Digital Gift',
    eyebrow: 'Template quà tặng cá nhân hoá',
    description:
      'Tạo một website quà tặng từ mẫu có sẵn, sau đó thay ảnh và nội dung của riêng bạn mà vẫn giữ nguyên thiết kế.',
    highlights: [
      'Cá nhân hoá trực tiếp trên web',
      'Bố cục và hiệu ứng được giữ nguyên',
      'Nhận link riêng để gửi cho người nhận',
    ],
  };
};
