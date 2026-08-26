import React from 'react';
import type { SceneImageShape, SceneImageStyle } from './elementTypes';

export interface ImageShapeDefinition {
  value: SceneImageShape;
  label: string;
  icon: string;
  description: string;
  isPolygon?: boolean;
  clipPath?: string;
  svgPath?: string;
  svgPolygonPoints?: string;
}

export const IMAGE_SHAPE_PRESETS: ImageShapeDefinition[] = [
  {
    value: 'rectangle',
    label: 'Vuông / Chữ nhật',
    icon: '⬛',
    description: 'Góc nhọn phẳng chuẩn 90 độ',
  },
  {
    value: 'rounded',
    label: 'Bo góc mềm',
    icon: '🔲',
    description: 'Bo cong góc theo bán kính tuỳ chỉnh',
  },
  {
    value: 'circle',
    label: 'Tròn / Elip',
    icon: '⭕',
    description: 'Bo tròn tuyệt đối tạo hình tròn hoặc oval',
  },
  {
    value: 'diamond',
    label: 'Hình thoi nhọn',
    icon: '💎',
    description: '4 đỉnh nhọn cân đối',
    isPolygon: true,
    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    svgPolygonPoints: '50,1 99,50 50,99 1,50',
  },
  {
    value: 'hexagon',
    label: 'Lục giác',
    icon: '🔷',
    description: 'Đa giác 6 cạnh đều',
    isPolygon: true,
    clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    svgPolygonPoints: '25,1 75,1 99,50 75,99 25,99 1,50',
  },
  {
    value: 'octagon',
    label: 'Bát giác',
    icon: '🛑',
    description: 'Đa giác 8 cạnh vát đều',
    isPolygon: true,
    clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
    svgPolygonPoints: '30,1 70,1 99,30 99,70 70,99 30,99 1,70 1,30',
  },
  {
    value: 'bevel',
    label: 'Vát 4 góc',
    icon: '🏷️',
    description: 'Vát cạnh nhọn hiện đại',
    isPolygon: true,
    clipPath: 'polygon(12% 0%, 88% 0%, 100% 12%, 100% 88%, 88% 100%, 12% 100%, 0% 88%, 0% 12%)',
    svgPolygonPoints: '12,1 88,1 99,12 99,88 88,99 12,99 1,88 1,12',
  },
  {
    value: 'ticket',
    label: 'Cuống vé / Tem',
    icon: '🎟️',
    description: 'Khuyết 2 bên sườn phong cách vé',
    isPolygon: true,
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 35%, 90% 50%, 100% 65%, 100% 100%, 0% 100%, 0% 65%, 10% 50%, 0% 35%)',
    svgPolygonPoints: '1,1 99,1 99,35 90,50 99,65 99,99 1,99 1,65 10,50 1,35',
  },
  {
    value: 'badge',
    label: 'Huy hiệu',
    icon: '🎖️',
    description: 'Kiểu dáng huy hiệu trang trọng',
    isPolygon: true,
    clipPath: 'polygon(50% 0%, 82% 10%, 100% 35%, 100% 70%, 80% 92%, 50% 100%, 20% 92%, 0% 70%, 0% 35%, 18% 10%)',
    svgPolygonPoints: '50,1 82,10 99,35 99,70 80,92 50,99 20,92 1,70 1,35 18,10',
  },
  {
    value: 'star',
    label: 'Ngôi sao',
    icon: '⭐',
    description: 'Ngôi sao 5 cánh tỏa sáng',
    isPolygon: true,
    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    svgPolygonPoints: '50,1 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35',
  },
  {
    value: 'heart',
    label: 'Trái tim',
    icon: '❤️',
    description: 'Hình trái tim lãng mạn',
    isPolygon: true,
    clipPath: 'polygon(50% 18%, 62% 4%, 80% 4%, 96% 18%, 98% 38%, 88% 62%, 50% 96%, 12% 62%, 2% 38%, 4% 18%, 20% 4%, 38% 4%)',
    svgPolygonPoints: '50,18 62,4 80,4 96,18 98,38 88,62 50,96 12,62 2,38 4,18 20,4 38,4',
  },
  {
    value: 'triangle',
    label: 'Tam giác nhọn',
    icon: '▲',
    description: 'Hình tam giác 3 đỉnh nhọn',
    isPolygon: true,
    clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
    svgPolygonPoints: '50,2 98,98 2,98',
  },
];

export const getImageShapeDefinition = (
  shape?: SceneImageShape
): ImageShapeDefinition => {
  if (!shape) return IMAGE_SHAPE_PRESETS[0];
  const found = IMAGE_SHAPE_PRESETS.find((p) => p.value === shape);
  return found || IMAGE_SHAPE_PRESETS[0];
};

export const getStrokeDashArray = (
  borderStyle?: string,
  strokeWidth: number = 2
): string | undefined => {
  if (borderStyle === 'dashed') {
    return `${Math.max(4, strokeWidth * 2.5)}, ${Math.max(3, strokeWidth * 1.5)}`;
  }
  if (borderStyle === 'dotted') {
    return `${Math.max(2, strokeWidth)}, ${Math.max(2, strokeWidth * 1.2)}`;
  }
  return undefined;
};
