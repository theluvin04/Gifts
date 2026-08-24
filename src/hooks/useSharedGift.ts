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

export interface SharedGiftState {
  giftId: string;
  templateId: string;
  config: unknown;
}

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

          if (
            !template ||
            !template
              .validateConfig(
                gift.config
              )
          ) {
            setGiftError(
              'Template của món quà này chưa được hỗ trợ.'
            );
            return;
          }

          setSharedGift({
            giftId:
              location.giftId,
            templateId,
            config:
              gift.config,
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
