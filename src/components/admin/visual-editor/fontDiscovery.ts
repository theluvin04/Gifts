export type DiscoveredFontGroup =
  | 'Hiện đại'
  | 'Thanh lịch'
  | 'Viết tay'
  | 'Bo tròn'
  | 'Khác';

export interface DiscoveredFontOption {
  label: string;
  value: string;
  group: DiscoveredFontGroup;
}

const IGNORED_FAMILIES = new Set([
  'Arial',
  'BlinkMacSystemFont',
  'Helvetica',
  'sans-serif',
  'serif',
  'cursive',
  'monospace',
  'system-ui',
]);

const cleanFamily = (family: string) =>
  family
    .replace(/["']/g, '')
    .trim();

const classifyFont = (
  family: string
): Pick<DiscoveredFontOption, 'group' | 'value'> => {
  const normalized =
    family.toLowerCase();

  if (
    /(script|hand|caveat|vibes|satisfy|pacifico|dancing)/.test(
      normalized
    )
  ) {
    return {
      group: 'Viết tay',
      value: `"${family}", cursive`,
    };
  }

  if (
    /(serif|baskerville|playfair|lora|slab)/.test(
      normalized
    )
  ) {
    return {
      group: 'Thanh lịch',
      value: `"${family}", serif`,
    };
  }

  if (
    /(round|quicksand|nunito|comfortaa)/.test(
      normalized
    )
  ) {
    return {
      group: 'Bo tròn',
      value: `"${family}", sans-serif`,
    };
  }

  return {
    group: 'Khác',
    value: `"${family}", sans-serif`,
  };
};

const readGoogleFontFamilies = () => {
  const families: string[] = [];

  document
    .querySelectorAll<HTMLLinkElement>(
      'link[href*="fonts.googleapis.com"]'
    )
    .forEach((link) => {
      try {
        const url = new URL(
          link.href,
          window.location.href
        );

        url.searchParams
          .getAll('family')
          .forEach((familyValue) => {
            const family =
              cleanFamily(
                familyValue.split(':')[0] || ''
              );

            if (family) {
              families.push(family);
            }
          });
      } catch {
        // Ignore malformed third-party font links.
      }
    });

  return families;
};

const readRegisteredFontFaces = () => {
  const families: string[] = [];
  const fontSet =
    document.fonts as FontFaceSet & {
      forEach?: (
        callback: (face: FontFace) => void
      ) => void;
    };

  fontSet.forEach?.((face) => {
    const family =
      cleanFamily(face.family);

    if (family) {
      families.push(family);
    }
  });

  return families;
};

export const discoverFontOptions = ():
DiscoveredFontOption[] => {
  if (typeof document === 'undefined') {
    return [];
  }

  const unique = new Map<string, DiscoveredFontOption>();

  [
    ...readGoogleFontFamilies(),
    ...readRegisteredFontFaces(),
  ].forEach((family) => {
    if (
      !family ||
      IGNORED_FAMILIES.has(family)
    ) {
      return;
    }

    unique.set(family.toLowerCase(), {
      label: family,
      ...classifyFont(family),
    });
  });

  return Array.from(unique.values()).sort(
    (a, b) =>
      a.label.localeCompare(b.label, 'vi')
  );
};

export const mergeFontOptions = <T extends DiscoveredFontOption>(
  builtIn: readonly T[]
): DiscoveredFontOption[] => {
  const merged = new Map<string, DiscoveredFontOption>();

  builtIn.forEach((font) =>
    merged.set(font.label.toLowerCase(), font)
  );
  discoverFontOptions().forEach((font) => {
    if (!merged.has(font.label.toLowerCase())) {
      merged.set(font.label.toLowerCase(), font);
    }
  });

  return Array.from(merged.values());
};
