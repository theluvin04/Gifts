import {
  doc,
  getDoc,
} from 'firebase/firestore';

import { db } from '../config/firebase';

export type TemplateStatus =
  | 'available'
  | 'coming_soon'
  | 'paused';

export interface TemplateConfig {
  id: string;
  name: string;
  basePrice: number;
  salePrice: number;
  saleEnabled: boolean;
  promotionLabel: string;
  currency: string;
  status: TemplateStatus;
  visible: boolean;
}

export const DEFAULT_LOVE_TEMPLATE_CONFIG:
TemplateConfig = {
  id: 'love-01',
  name: 'Love Story 01',
  basePrice: 119000,
  salePrice: 99000,
  saleEnabled: true,
  promotionLabel: 'Launch offer',
  currency: 'VND',
  status: 'available',
  visible: true,
};

const toSafeNumber = (
  value: unknown,
  fallback: number
) => {
  return typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0
    ? Math.round(value)
    : fallback;
};

export const normalizeTemplateConfig = (
  data?: Record<string, any> | null
): TemplateConfig => {
  const fallback =
    DEFAULT_LOVE_TEMPLATE_CONFIG;

  if (!data) {
    return { ...fallback };
  }

  const status =
    data.status === 'coming_soon' ||
    data.status === 'paused' ||
    data.status === 'available'
      ? data.status
      : fallback.status;

  return {
    id:
      typeof data.id === 'string' &&
      data.id.trim()
        ? data.id.trim()
        : fallback.id,
    name:
      typeof data.name === 'string' &&
      data.name.trim()
        ? data.name.trim()
        : fallback.name,
    basePrice: toSafeNumber(
      data.basePrice,
      fallback.basePrice
    ),
    salePrice: toSafeNumber(
      data.salePrice,
      fallback.salePrice
    ),
    saleEnabled:
      typeof data.saleEnabled === 'boolean'
        ? data.saleEnabled
        : fallback.saleEnabled,
    promotionLabel:
      typeof data.promotionLabel === 'string'
        ? data.promotionLabel
        : fallback.promotionLabel,
    currency:
      typeof data.currency === 'string' &&
      data.currency.trim()
        ? data.currency.trim()
        : fallback.currency,
    status,
    visible:
      typeof data.visible === 'boolean'
        ? data.visible
        : fallback.visible,
  };
};

export const getEffectiveTemplatePrice = (
  template: TemplateConfig
) => {
  if (
    template.saleEnabled &&
    template.salePrice > 0 &&
    template.salePrice < template.basePrice
  ) {
    return template.salePrice;
  }

  return template.basePrice;
};

export const getTemplateDiscountPercent = (
  template: TemplateConfig
) => {
  if (
    !template.saleEnabled ||
    template.basePrice <= 0 ||
    template.salePrice >= template.basePrice
  ) {
    return 0;
  }

  return Math.round(
    (1 -
      template.salePrice /
        template.basePrice) *
      100
  );
};

export const getPublicTemplateConfig =
  async (): Promise<TemplateConfig> => {
    try {
      const snapshot = await getDoc(
        doc(
          db,
          'templates',
          'love-01'
        )
      );

      if (!snapshot.exists()) {
        return {
          ...DEFAULT_LOVE_TEMPLATE_CONFIG,
        };
      }

      return normalizeTemplateConfig(
        snapshot.data()
      );
    } catch (error) {
      console.warn(
        'Template config fallback:',
        error
      );

      return {
        ...DEFAULT_LOVE_TEMPLATE_CONFIG,
      };
    }
  };

export const getRequiredPublicTemplateConfig =
  async (): Promise<TemplateConfig> => {
    const snapshot =
      await getDoc(
        doc(
          db,
          'templates',
          'love-01'
        )
      );

    if (!snapshot.exists()) {
      return {
        ...DEFAULT_LOVE_TEMPLATE_CONFIG,
      };
    }

    return normalizeTemplateConfig(
      snapshot.data()
    );
  };
