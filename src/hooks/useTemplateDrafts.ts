import {
  useState,
} from 'react';

import {
  getAllTemplateModules,
} from '../templates/registry';

import type {
  TemplateModule,
} from '../templates/types';

type DraftMap =
  Record<
    string,
    unknown
  >;

const loadDraft = (
  template:
    TemplateModule<any>
) => {
  const keys = [
    template.draftStorageKey,
    ...(
      template
        .legacyDraftStorageKeys ||
      []
    ),
  ];

  for (const key of keys) {
    try {
      const raw =
        window.localStorage
          .getItem(key);

      if (!raw) {
        continue;
      }

      const parsed =
        JSON.parse(raw);

      if (
        template.validateConfig(
          parsed
        )
      ) {
        if (
          key !==
          template
            .draftStorageKey
        ) {
          window.localStorage
            .setItem(
              template
                .draftStorageKey,
              raw
            );
        }

        return parsed;
      }
    } catch {
      // Draft lỗi thì
      // dùng config mặc định.
    }
  }

  return (
    template.defaultConfig
  );
};

const initialDrafts =
  (): DraftMap => {
    return Object.fromEntries(
      getAllTemplateModules()
        .map(
          (template) => [
            template.id,
            loadDraft(
              template
            ),
          ]
        )
    );
  };

export const useTemplateDrafts =
  () => {
    const [
      drafts,
      setDrafts,
    ] = useState<DraftMap>(
      initialDrafts
    );

    const getDraft = (
      template:
        TemplateModule<any>
    ) => {
      return (
        drafts[
          template.id
        ] ||
        template
          .defaultConfig
      );
    };

    const persistDraft = (
      template:
        TemplateModule<any>,
      config: unknown
    ) => {
      setDrafts(
        (current) => ({
          ...current,
          [template.id]:
            config,
        })
      );

      try {
        window.localStorage
          .setItem(
            template
              .draftStorageKey,
            JSON.stringify(
              config
            )
          );
      } catch {
        // Ảnh base64 có thể
        // vượt localStorage quota.
      }
    };

    const resetDraft = (
      template:
        TemplateModule<any>
    ) => {
      setDrafts(
        (current) => ({
          ...current,
          [template.id]:
            template
              .defaultConfig,
        })
      );

      try {
        window.localStorage
          .removeItem(
            template
              .draftStorageKey
          );

        for (
          const legacy of
          template
            .legacyDraftStorageKeys ||
          []
        ) {
          window.localStorage
            .removeItem(
              legacy
            );
        }
      } catch {
        // Không chặn UI.
      }
    };

    return {
      getDraft,
      persistDraft,
      resetDraft,
    };
  };
