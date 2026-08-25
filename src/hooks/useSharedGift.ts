import {
  useEffect,
  useState,
} from 'react';

import {
  fetchGiftFromFirestore,
} from '../services/giftService';

import {
  DEFAULT_TEMPLATE_ID,
  getTemplateModule,
} from '../templates/registry';

import type {
  AppLocation,
} from '../routing/appRouter';

import type {
  TemplateVisualEditorConfig,
} from '../templates/visualEditor';

import {
  getGiftSchemaMetadata,
  type GiftConfigType,
} from '../services/giftSchema';

export interface SharedGiftState {
  giftId: string;
  templateId: string;
  config: unknown;
  dynamicVisual: boolean;
  configType:
    GiftConfigType |
    'legacy';
  schemaVersion: number;
  templateRevision: string;
}

const isVisualEditorConfig = (
  value: unknown
): value is
  TemplateVisualEditorConfig => {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return false;
  }

  const data =
    value as any;

  return (
    Array.isArray(
      data.scenes
    ) &&
    data.scenes.length >
      0 &&
    typeof data.initialSceneId ===
      'string'
  );
};

export const useSharedGift = (
  location: AppLocation
) => {
  const [
    sharedGift,
    setSharedGift,
  ] = useState<
    SharedGiftState | null
  >(null);

  const [
    isLoadingGift,
    setIsLoadingGift,
  ] = useState(false);

  const [
    giftError,
    setGiftError,
  ] = useState('');

  useEffect(() => {
    if (
      location.kind !==
      'gift'
    ) {
      setSharedGift(null);
      setGiftError('');
      setIsLoadingGift(
        false
      );
      return;
    }

    let cancelled =
      false;

    const loadGift =
      async () => {
        setIsLoadingGift(
          true
        );
        setGiftError('');
        setSharedGift(null);

        try {
          const gift =
            await fetchGiftFromFirestore(
              location.giftId
            );

          if (cancelled) {
            return;
          }

          if (
            !gift ||
            !gift.config
          ) {
            setGiftError(
              'Món quà này không tồn tại hoặc chưa được xuất bản.'
            );
            return;
          }

          const templateId =
            gift.templateId ||
            DEFAULT_TEMPLATE_ID;

          const template =
            getTemplateModule(
              templateId
            );

          const schema =
            getGiftSchemaMetadata(
              gift
            );

          if (
            schema.kind ===
              'invalid'
          ) {
            setGiftError(
              'Phiên bản dữ liệu món quà không được hỗ trợ.'
            );
            return;
          }

          let dynamicVisual =
            false;

          if (
            schema.kind ===
              'visual-v1'
          ) {
            if (
              !isVisualEditorConfig(
                gift.config
              )
            ) {
              setGiftError(
                'Dữ liệu template động không hợp lệ.'
              );
              return;
            }

            dynamicVisual =
              true;
          } else if (
            schema.kind ===
              'love-v1'
          ) {
            if (
              !template ||
              !template.validateConfig(
                gift.config
              )
            ) {
              setGiftError(
                'Dữ liệu món quà không hợp lệ.'
              );
              return;
            }
          } else {
            // Compatibility for gifts sold before configType/schemaVersion
            // were added. New gifts never use this guessing path.
            if (template) {
              if (
                !template.validateConfig(
                  gift.config
                )
              ) {
                setGiftError(
                  'Dữ liệu món quà không hợp lệ.'
                );
                return;
              }
            } else {
              if (
                !isVisualEditorConfig(
                  gift.config
                )
              ) {
                setGiftError(
                  'Template của món quà này chưa được hỗ trợ.'
                );
                return;
              }

              dynamicVisual =
                true;
            }
          }

          setSharedGift({
            giftId:
              location.giftId,
            templateId,
            config:
              gift.config,
            dynamicVisual,
            configType:
              schema.kind ===
                'legacy'
                ? 'legacy'
                : schema.kind,
            schemaVersion:
              schema.schemaVersion,
            templateRevision:
              schema.templateRevision,
          });

          const cleanPath =
            `/gift/${location.giftId}`;

          if (
            window.location
              .pathname !==
              cleanPath ||
            window.location
              .search
          ) {
            window.history
              .replaceState(
                {},
                '',
                cleanPath
              );
          }
        } catch (error) {
          console.error(error);

          if (!cancelled) {
            setGiftError(
              'Không thể tải món quà. Hãy thử lại.'
            );
          }
        } finally {
          if (!cancelled) {
            setIsLoadingGift(
              false
            );
          }
        }
      };

    void loadGift();

    return () => {
      cancelled = true;
    };
  }, [
    location.kind ===
      'gift'
      ? location.giftId
      : '',
  ]);

  return {
    sharedGift,
    isLoadingGift,
    giftError,
  };
};
