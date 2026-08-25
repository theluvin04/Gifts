export const GIFT_SCHEMA_VERSION = 1 as const;

export type GiftConfigType =
  | 'love-v1'
  | 'visual-v1';

export type GiftSchemaKind =
  | GiftConfigType
  | 'legacy'
  | 'invalid';

export interface GiftSchemaMetadata {
  kind: GiftSchemaKind;
  schemaVersion: number;
  templateRevision: string;
}

const normalizeForRevision = (
  value: unknown
): unknown => {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(
      normalizeForRevision
    );
  }

  if (
    typeof value === 'object'
  ) {
    const source =
      value as Record<
        string,
        unknown
      >;

    const next:
      Record<
        string,
        unknown
      > = {};

    Object.keys(source)
      .sort()
      .forEach((key) => {
        const item =
          source[key];

        if (
          typeof item ===
            'undefined' ||
          typeof item ===
            'function'
        ) {
          return;
        }

        next[key] =
          normalizeForRevision(
            item
          );
      });

    return next;
  }

  return String(value);
};

const fnv1a = (
  value: string
) => {
  let hash =
    0x811c9dc5;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    hash ^=
      value.charCodeAt(
        index
      );

    hash =
      Math.imul(
        hash,
        0x01000193
      ) >>> 0;
  }

  return hash
    .toString(16)
    .padStart(8, '0');
};

/**
 * A compact deterministic revision of the base template snapshot.
 * It is not a security hash; it is only used to identify which
 * template revision created a purchased gift.
 */
export const createTemplateRevision = (
  value: unknown
) => {
  const stable =
    JSON.stringify(
      normalizeForRevision(
        value
      )
    );

  return `r1-${fnv1a(
    stable
  )}`;
};

export const getGiftSchemaMetadata = (
  value: unknown
): GiftSchemaMetadata => {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return {
      kind: 'invalid',
      schemaVersion: 0,
      templateRevision: '',
    };
  }

  const data =
    value as Record<
      string,
      unknown
    >;

  // Old orders created before schema metadata existed.
  // They remain readable through the legacy compatibility path.
  if (
    typeof data.configType ===
      'undefined' &&
    typeof data.schemaVersion ===
      'undefined'
  ) {
    return {
      kind: 'legacy',
      schemaVersion: 0,
      templateRevision: '',
    };
  }

  const configType =
    data.configType;

  const schemaVersion =
    data.schemaVersion;

  const templateRevision =
    typeof data.templateRevision ===
      'string'
      ? data.templateRevision
      : '';

  if (
    (
      configType !==
        'love-v1' &&
      configType !==
        'visual-v1'
    ) ||
    schemaVersion !==
      GIFT_SCHEMA_VERSION ||
    !templateRevision
  ) {
    return {
      kind: 'invalid',
      schemaVersion:
        typeof schemaVersion ===
          'number'
          ? schemaVersion
          : 0,
      templateRevision,
    };
  }

  return {
    kind: configType,
    schemaVersion,
    templateRevision,
  };
};
