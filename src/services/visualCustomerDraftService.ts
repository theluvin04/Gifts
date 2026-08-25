import type {
  TemplateVisualEditorConfig,
} from '../templates/visualEditor';

interface StoredVisualCustomerDraft {
  version: 2;
  fingerprint: string;
  config:
    TemplateVisualEditorConfig;
}

const DRAFT_PREFIX =
  'dearly:visual-customer-draft:';

const clone = <T,>(
  value: T
): T =>
  JSON.parse(
    JSON.stringify(value)
  );

const draftKey = (
  templateId: string
) =>
  `${DRAFT_PREFIX}${templateId}`;

/**
 * Draft versioning intentionally fingerprints the template layout/content
 * that affects rendering, while ignoring heavy image payload fields for now.
 * Image persistence/storage is handled separately later.
 */
const serializeTemplateForFingerprint = (
  config:
    TemplateVisualEditorConfig
) =>
  JSON.stringify(
    config,
    (key, value) => {
      if (
        key === 'src' ||
        key === 'imageUrl' ||
        key === 'coverUrl'
      ) {
        return undefined;
      }

      return value;
    }
  );

const hashString = (
  value: string
) => {
  let hash =
    2166136261;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    hash ^=
      value.charCodeAt(index);

    hash =
      Math.imul(
        hash,
        16777619
      );
  }

  return (
    hash >>> 0
  )
    .toString(36)
    .padStart(7, '0');
};

export const getVisualTemplateFingerprint = (
  config:
    TemplateVisualEditorConfig
) =>
  `v2-${hashString(
    serializeTemplateForFingerprint(
      config
    )
  )}`;

const isUsableConfig = (
  value: unknown
): value is
  TemplateVisualEditorConfig => {
  if (
    !value ||
    typeof value !== 'object'
  ) {
    return false;
  }

  const config =
    value as
      TemplateVisualEditorConfig;

  return (
    Array.isArray(
      config.scenes
    ) &&
    config.scenes.length > 0 &&
    typeof config.initialSceneId ===
      'string'
  );
};

export const loadVisualCustomerDraft = (
  templateId: string,
  templateConfig:
    TemplateVisualEditorConfig
): TemplateVisualEditorConfig => {
  const fingerprint =
    getVisualTemplateFingerprint(
      templateConfig
    );

  try {
    const raw =
      window.localStorage.getItem(
        draftKey(templateId)
      );

    if (!raw) {
      return clone(
        templateConfig
      );
    }

    const parsed =
      JSON.parse(raw) as
        Partial<
          StoredVisualCustomerDraft
        >;

    if (
      parsed.version === 2 &&
      parsed.fingerprint ===
        fingerprint &&
      isUsableConfig(
        parsed.config
      )
    ) {
      return clone(
        parsed.config
      );
    }

    // Old draft or draft from an older template layout.
    window.localStorage.removeItem(
      draftKey(templateId)
    );
  } catch {
    try {
      window.localStorage.removeItem(
        draftKey(templateId)
      );
    } catch {
      // Ignore storage cleanup failure.
    }
  }

  return clone(
    templateConfig
  );
};

export const saveVisualCustomerDraft = (
  templateId: string,
  templateConfig:
    TemplateVisualEditorConfig,
  customerConfig:
    TemplateVisualEditorConfig
) => {
  try {
    const payload:
      StoredVisualCustomerDraft = {
        version: 2,
        fingerprint:
          getVisualTemplateFingerprint(
            templateConfig
          ),
        config:
          customerConfig,
      };

    window.localStorage.setItem(
      draftKey(templateId),
      JSON.stringify(payload)
    );
  } catch {
    // Local draft remains best-effort. Image persistence is fixed separately.
  }
};

export const clearVisualCustomerDraft = (
  templateId: string
) => {
  try {
    window.localStorage.removeItem(
      draftKey(templateId)
    );
  } catch {
    // Ignore storage cleanup failure.
  }
};
