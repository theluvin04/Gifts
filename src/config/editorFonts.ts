export type EditorFontGroup =
  | 'Hiện đại'
  | 'Thanh lịch'
  | 'Viết tay'
  | 'Bo tròn'
  | 'Font riêng';

export interface EditorFontOption {
  label: string;
  value: string;
  group: EditorFontGroup;
  source: 'google' | 'local';
}

interface CustomFontSource {
  src: string;
  format?: 'woff2' | 'woff' | 'truetype' | 'opentype';
  weight?: number | string;
  style?: 'normal' | 'italic' | 'oblique';
}

interface CustomFontManifestItem {
  label: string;
  family: string;
  group?: EditorFontGroup;
  fallback?: 'sans-serif' | 'serif' | 'cursive' | 'monospace';
  sources: CustomFontSource[];
}

interface CustomFontManifest {
  fonts?: CustomFontManifestItem[];
}

export const BUILT_IN_EDITOR_FONTS: EditorFontOption[] = [
  { label: 'Quicksand', value: '"Quicksand", sans-serif', group: 'Bo tròn', source: 'google' },
  { label: 'Be Vietnam Pro', value: '"Be Vietnam Pro", sans-serif', group: 'Hiện đại', source: 'google' },
  { label: 'Poppins', value: '"Poppins", sans-serif', group: 'Hiện đại', source: 'google' },
  { label: 'Montserrat', value: '"Montserrat", sans-serif', group: 'Hiện đại', source: 'google' },
  { label: 'Nunito', value: '"Nunito", sans-serif', group: 'Bo tròn', source: 'google' },
  { label: 'Inter', value: '"Inter", sans-serif', group: 'Hiện đại', source: 'google' },
  { label: 'Comfortaa', value: '"Comfortaa", sans-serif', group: 'Bo tròn', source: 'google' },
  { label: 'Playfair Display', value: '"Playfair Display", serif', group: 'Thanh lịch', source: 'google' },
  { label: 'DM Serif Display', value: '"DM Serif Display", serif', group: 'Thanh lịch', source: 'google' },
  { label: 'Lora', value: '"Lora", serif', group: 'Thanh lịch', source: 'google' },
  { label: 'Libre Baskerville', value: '"Libre Baskerville", serif', group: 'Thanh lịch', source: 'google' },
  { label: 'Roboto Slab', value: '"Roboto Slab", serif', group: 'Thanh lịch', source: 'google' },
  { label: 'Dancing Script', value: '"Dancing Script", cursive', group: 'Viết tay', source: 'google' },
  { label: 'Caveat', value: '"Caveat", cursive', group: 'Viết tay', source: 'google' },
  { label: 'Great Vibes', value: '"Great Vibes", cursive', group: 'Viết tay', source: 'google' },
  { label: 'Satisfy', value: '"Satisfy", cursive', group: 'Viết tay', source: 'google' },
  { label: 'Pacifico', value: '"Pacifico", cursive', group: 'Viết tay', source: 'google' },
];

const CUSTOM_FONT_STYLE_ID = 'dearly-custom-font-faces';
let editorFontsPromise: Promise<EditorFontOption[]> | null = null;

const cssString = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n|\r/g, ' ');

const cssUrl = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n|\r/g, '');

const isFontGroup = (value: unknown): value is EditorFontGroup =>
  value === 'Hiện đại' ||
  value === 'Thanh lịch' ||
  value === 'Viết tay' ||
  value === 'Bo tròn' ||
  value === 'Font riêng';

const normalizeSource = (source: CustomFontSource) => {
  const format = source.format ? ` format('${cssString(source.format)}')` : '';
  const weight = source.weight ?? 400;
  const style = source.style ?? 'normal';

  return {
    src: `url('${cssUrl(source.src)}')${format}`,
    weight,
    style,
  };
};

const installCustomFontFaces = (fonts: CustomFontManifestItem[]) => {
  if (typeof document === 'undefined') {
    return;
  }

  const rules = fonts.flatMap((font) =>
    (Array.isArray(font.sources) ? font.sources : [])
      .filter((source) => source && typeof source.src === 'string' && source.src.trim())
      .map((source) => {
        const normalized = normalizeSource(source);
        return [
          '@font-face {',
          `  font-family: "${cssString(font.family)}";`,
          `  src: ${normalized.src};`,
          `  font-weight: ${normalized.weight};`,
          `  font-style: ${normalized.style};`,
          '  font-display: swap;',
          '}',
        ].join('\n');
      }),
  );

  const oldStyle = document.getElementById(CUSTOM_FONT_STYLE_ID);
  const style = oldStyle instanceof HTMLStyleElement
    ? oldStyle
    : document.createElement('style');

  style.id = CUSTOM_FONT_STYLE_ID;
  style.textContent = rules.join('\n\n');

  if (!oldStyle) {
    document.head.appendChild(style);
  }
};

const loadCustomManifest = async (): Promise<CustomFontManifestItem[]> => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const response = await fetch('/fonts/manifest.json', { cache: 'no-store' });
    if (!response.ok) {
      return [];
    }

    const manifest = (await response.json()) as CustomFontManifest;
    if (!Array.isArray(manifest.fonts)) {
      return [];
    }

    return manifest.fonts.filter((font) =>
      Boolean(
        font &&
        typeof font.label === 'string' &&
        font.label.trim() &&
        typeof font.family === 'string' &&
        font.family.trim() &&
        Array.isArray(font.sources) &&
        font.sources.length > 0,
      ),
    );
  } catch {
    return [];
  }
};

export const loadEditorFonts = async (): Promise<EditorFontOption[]> => {
  if (editorFontsPromise) {
    return editorFontsPromise;
  }

  editorFontsPromise = (async () => {
    const customFonts = await loadCustomManifest();
    installCustomFontFaces(customFonts);

    const localOptions: EditorFontOption[] = customFonts.map((font) => {
      const fallback = font.fallback || 'sans-serif';
      return {
        label: font.label.trim(),
        value: `"${font.family.trim()}", ${fallback}`,
        group: isFontGroup(font.group) ? font.group : 'Font riêng',
        source: 'local',
      };
    });

    const seen = new Set<string>();
    return [...localOptions, ...BUILT_IN_EDITOR_FONTS].filter((font) => {
      if (seen.has(font.value)) {
        return false;
      }
      seen.add(font.value);
      return true;
    });
  })();

  return editorFontsPromise;
};

export const bootstrapCustomFonts = () => loadEditorFonts();
