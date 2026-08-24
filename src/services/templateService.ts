import {
  doc,
  getDoc,
} from 'firebase/firestore';

import {
  db,
} from '../config/firebase';

import {
  DEFAULT_LOVE_TEMPLATE_DESIGN,
  TemplateDesignConfig,
  cloneTemplateDesign,
  normalizeTemplateDesign,
} from '../templates/design';

import {
  DEFAULT_LOVE_TEMPLATE_ASSETS,
  TemplateAssetLibrary,
  cloneTemplateAssets,
  normalizeTemplateAssets,
} from '../templates/assets';

import {
  DEFAULT_LOVE_VISUAL_EDITOR_CONFIG,
  TemplateVisualEditorConfig,
  cloneVisualEditorConfig,
  normalizeVisualEditorConfig,
} from '../templates/visualEditor';

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
  design:
    TemplateDesignConfig;
  assets:
    TemplateAssetLibrary;

  /**
   * Visual Editor scene data.
   *
   * Admin có thể kéo-thả scene/element và toàn bộ
   * cấu hình được lưu cùng document templates/{id}.
   *
   * enabled=false nghĩa là public template hiện tại
   * vẫn dùng renderer cũ.
   */
  visualEditor?:
    TemplateVisualEditorConfig;
}

const TEMPLATE_CACHE_PREFIX =
  'dearly:template-config:';

const getTemplateCacheKey = (
  templateId: string
) => {
  return (
    TEMPLATE_CACHE_PREFIX +
    templateId
  );
};

const writeTemplateCache = (
  template:
    TemplateConfig
) => {
  try {
    window.localStorage.setItem(
      getTemplateCacheKey(
        template.id
      ),
      JSON.stringify({
        template,
        cachedAt:
          Date.now(),
      })
    );
  } catch {
    // Cache chỉ để tăng tốc UI.
  }
};

export const DEFAULT_LOVE_TEMPLATE_CONFIG:
TemplateConfig = {
  id: 'love-01',
  name: 'Love Story 01',
  basePrice: 119000,
  salePrice: 99000,
  saleEnabled: true,
  promotionLabel:
    'Launch offer',
  currency: 'VND',
  status: 'available',
  visible: true,

  design:
    cloneTemplateDesign(
      DEFAULT_LOVE_TEMPLATE_DESIGN
    ),

  assets:
    cloneTemplateAssets(
      DEFAULT_LOVE_TEMPLATE_ASSETS
    ),

  visualEditor:
    cloneVisualEditorConfig(
      DEFAULT_LOVE_VISUAL_EDITOR_CONFIG
    ),
};

const toSafeNumber = (
  value: unknown,
  fallback: number
) => {
  return (
    typeof value ===
      'number' &&
    Number.isFinite(
      value
    ) &&
    value >= 0
  )
    ? Math.round(
        value
      )
    : fallback;
};

export const normalizeTemplateConfig =
  (
    data?:
      Record<
        string,
        any
      > |
      null,

    fallback:
      TemplateConfig =
        DEFAULT_LOVE_TEMPLATE_CONFIG
  ):
    TemplateConfig => {
    if (!data) {
      return {
        ...fallback,

        design:
          cloneTemplateDesign(
            fallback.design
          ),

        assets:
          cloneTemplateAssets(
            fallback.assets
          ),

        visualEditor:
          cloneVisualEditorConfig(
            fallback
              .visualEditor ||
            DEFAULT_LOVE_VISUAL_EDITOR_CONFIG
          ),
      };
    }

    const status =
      data.status ===
        'coming_soon' ||
      data.status ===
        'paused' ||
      data.status ===
        'available'
        ? data.status
        : fallback.status;

    return {
      id:
        typeof data.id ===
          'string' &&
        data.id.trim()
          ? data.id.trim()
          : fallback.id,

      name:
        typeof data.name ===
          'string' &&
        data.name.trim()
          ? data.name.trim()
          : fallback.name,

      basePrice:
        toSafeNumber(
          data.basePrice,
          fallback.basePrice
        ),

      salePrice:
        toSafeNumber(
          data.salePrice,
          fallback.salePrice
        ),

      saleEnabled:
        typeof data
          .saleEnabled ===
          'boolean'
          ? data.saleEnabled
          : fallback
              .saleEnabled,

      promotionLabel:
        typeof data
          .promotionLabel ===
          'string'
          ? data
              .promotionLabel
          : fallback
              .promotionLabel,

      currency:
        typeof data.currency ===
          'string' &&
        data.currency.trim()
          ? data.currency.trim()
          : fallback.currency,

      status,

      visible:
        typeof data.visible ===
          'boolean'
          ? data.visible
          : fallback.visible,

      design:
        normalizeTemplateDesign(
          data.design,
          fallback.design
        ),

      assets:
        normalizeTemplateAssets(
          data.assets,
          fallback.assets
        ),

      visualEditor:
        normalizeVisualEditorConfig(
          data.visualEditor,
          fallback
            .visualEditor ||
          DEFAULT_LOVE_VISUAL_EDITOR_CONFIG
        ),
    };
  };

export const getEffectiveTemplatePrice =
  (
    template:
      TemplateConfig
  ) => {
    if (
      template.saleEnabled &&
      template.salePrice >
        0 &&
      template.salePrice <
        template.basePrice
    ) {
      return template
        .salePrice;
    }

    return template
      .basePrice;
  };

export const getTemplateDiscountPercent =
  (
    template:
      TemplateConfig
  ) => {
    if (
      !template.saleEnabled ||
      template.basePrice <=
        0 ||
      template.salePrice >=
        template.basePrice
    ) {
      return 0;
    }

    return Math.round(
      (
        1 -
        template.salePrice /
          template.basePrice
      ) *
        100
    );
  };

const getFallbackForTemplate =
  (
    templateId: string
  ):
    TemplateConfig => {
    if (
      templateId ===
      'love-01'
    ) {
      return normalizeTemplateConfig(
        DEFAULT_LOVE_TEMPLATE_CONFIG
      );
    }

    return {
      id:
        templateId,

      name:
        templateId,

      basePrice: 0,

      salePrice: 0,

      saleEnabled:
        false,

      promotionLabel:
        '',

      currency:
        'VND',

      status:
        'coming_soon',

      visible:
        false,

      design:
        cloneTemplateDesign(
          DEFAULT_LOVE_TEMPLATE_DESIGN
        ),

      assets:
        cloneTemplateAssets(
          DEFAULT_LOVE_TEMPLATE_ASSETS
        ),

      visualEditor:
        cloneVisualEditorConfig(
          DEFAULT_LOVE_VISUAL_EDITOR_CONFIG
        ),
    };
  };

export const getCachedTemplateConfigById =
  (
    templateId: string
  ):
    TemplateConfig |
    null => {
    try {
      const raw =
        window.localStorage.getItem(
          getTemplateCacheKey(
            templateId
          )
        );

      if (!raw) {
        return null;
      }

      const parsed =
        JSON.parse(
          raw
        );

      if (
        !parsed ||
        typeof parsed !==
          'object' ||
        !parsed.template
      ) {
        return null;
      }

      return normalizeTemplateConfig(
        parsed.template,
        getFallbackForTemplate(
          templateId
        )
      );
    } catch {
      return null;
    }
  };

export const getPublicTemplateConfigById =
  async (
    templateId: string
  ):
    Promise<
      TemplateConfig
    > => {
    const fallback =
      getFallbackForTemplate(
        templateId
      );

    try {
      const snapshot =
        await getDoc(
          doc(
            db,
            'templates',
            templateId
          )
        );

      if (
        !snapshot.exists()
      ) {
        return fallback;
      }

      const normalized =
        normalizeTemplateConfig(
          snapshot.data(),
          fallback
        );

      writeTemplateCache(
        normalized
      );

      return normalized;
    } catch (
      error
    ) {
      console.warn(
        'Template config fallback:',
        error
      );

      return (
        getCachedTemplateConfigById(
          templateId
        ) ||
        fallback
      );
    }
  };

export const getRequiredPublicTemplateConfigById =
  async (
    templateId: string
  ):
    Promise<
      TemplateConfig
    > => {
    const fallback =
      getFallbackForTemplate(
        templateId
      );

    const snapshot =
      await getDoc(
        doc(
          db,
          'templates',
          templateId
        )
      );

    if (
      !snapshot.exists()
    ) {
      return fallback;
    }

    const normalized =
      normalizeTemplateConfig(
        snapshot.data(),
        fallback
      );

    writeTemplateCache(
      normalized
    );

    return normalized;
  };

export const getPublicTemplateConfig =
  async () => {
    return getPublicTemplateConfigById(
      'love-01'
    );
  };

export const getRequiredPublicTemplateConfig =
  async () => {
    return getRequiredPublicTemplateConfigById(
      'love-01'
    );
  };
