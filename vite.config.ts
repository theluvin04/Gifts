import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

const CODE_ASSET_MODULE_ID =
  'virtual:dearly-code-assets';

const RESOLVED_CODE_ASSET_MODULE_ID =
  '\0virtual:dearly-code-assets';

const IMAGE_EXTENSIONS =
  new Set([
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.gif',
    '.svg',
    '.avif',
  ]);

const MIME_BY_EXTENSION:
Record<string, string> = {
  '.png':
    'image/png',
  '.jpg':
    'image/jpeg',
  '.jpeg':
    'image/jpeg',
  '.webp':
    'image/webp',
  '.gif':
    'image/gif',
  '.svg':
    'image/svg+xml',
  '.avif':
    'image/avif',
};

const prettyFolderName = (
  folderPath:
    string,
  fileName:
    string
) => {
  const normalized =
    folderPath
      .replace(
        /\\/g,
        '/'
      )
      .toLowerCase();

  const lowerFile =
    fileName
      .toLowerCase();

  if (
    normalized.includes(
      'anh-thiep'
    ) ||
    normalized.includes(
      '/letter'
    ) ||
    normalized ===
      'letter'
  ) {
    return {
      id:
        'anh-thiep',
      name:
        'Ảnh thiệp',
    };
  }

  if (
    normalized.includes(
      'background'
    ) ||
    normalized.includes(
      'backgrounds'
    )
  ) {
    return {
      id:
        'background',
      name:
        'Background',
    };
  }

  if (
    normalized.includes(
      'sticker'
    ) ||
    lowerFile.includes(
      'sticker'
    )
  ) {
    return {
      id:
        'sticker',
      name:
        'Sticker',
    };
  }

  if (
    normalized.includes(
      'nhan-vat'
    ) ||
    normalized.includes(
      'character'
    ) ||
    normalized.includes(
      'characters'
    )
  ) {
    return {
      id:
        'nhan-vat',
      name:
        'Nhân vật',
    };
  }

  if (
    normalized.includes(
      'hoa-cay'
    ) ||
    normalized.includes(
      'flower'
    ) ||
    normalized.includes(
      'flowers'
    )
  ) {
    return {
      id:
        'hoa-cay',
      name:
        'Hoa & cây',
    };
  }

  if (
    normalized.includes(
      'banh-sinh-nhat'
    ) ||
    normalized.includes(
      'cake'
    ) ||
    normalized.includes(
      'birthday'
    )
  ) {
    return {
      id:
        'banh-sinh-nhat',
      name:
        'Bánh & sinh nhật',
    };
  }

  if (
    normalized.includes(
      'tape'
    ) ||
    normalized.includes(
      'scrapbook'
    )
  ) {
    return {
      id:
        'tape-scrapbook',
      name:
        'Tape & scrapbook',
    };
  }

  if (
    normalized.includes(
      'icon'
    ) ||
    normalized.includes(
      'decor'
    )
  ) {
    return {
      id:
        'icon-decor',
      name:
        'Icon & decor',
    };
  }

  if (
    normalized.includes(
      'gift'
    )
  ) {
    return {
      id:
        'gifts',
      name:
        'Quà / Gifts',
    };
  }

  if (
    normalized.includes(
      'proposal'
    )
  ) {
    return {
      id:
        'proposal',
      name:
        'Proposal',
    };
  }

  if (
    normalized.includes(
      'brand'
    ) ||
    lowerFile.includes(
      'logo'
    )
  ) {
    return {
      id:
        'brand',
      name:
        'Brand',
    };
  }

  if (
    path
      .extname(
        fileName
      )
      .toLowerCase() ===
      '.gif'
  ) {
    return {
      id:
        'gif',
      name:
        'GIF',
    };
  }

  if (
    !folderPath ||
    folderPath ===
      '.'
  ) {
    return {
      id:
        'khac',
      name:
        'Khác',
    };
  }

  const lastFolder =
    folderPath
      .replace(
        /\\/g,
        '/'
      )
      .split(
        '/'
      )
      .filter(
        Boolean
      )
      .pop() ||
    'Khác';

  const id =
    lastFolder
      .toLowerCase()
      .normalize(
        'NFD'
      )
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .replace(
        /đ/g,
        'd'
      )
      .replace(
        /[^a-z0-9]+/g,
        '-'
      )
      .replace(
        /^-+|-+$/g,
        ''
      ) ||
    'khac';

  const name =
    lastFolder
      .replace(
        /[-_]+/g,
        ' '
      )
      .replace(
        /\b\w/g,
        (
          character
        ) =>
          character.toUpperCase()
      );

  return {
    id,
    name,
  };
};

const getCodeAssets = (
  rootDir:
    string
) => {
  const imagesDir =
    path.resolve(
      rootDir,
      'public/images'
    );

  if (
    !fs.existsSync(
      imagesDir
    )
  ) {
    return [];
  }

  const results:
    Array<
      Record<
        string,
        unknown
      >
    > = [];

  const walk = (
    currentDir:
      string
  ) => {
    const entries =
      fs.readdirSync(
        currentDir,
        {
          withFileTypes:
            true,
        }
      );

    entries.forEach(
      (
        entry
      ) => {
        const absolute =
          path.join(
            currentDir,
            entry.name
          );

        if (
          entry.isDirectory()
        ) {
          walk(
            absolute
          );
          return;
        }

        if (
          !entry.isFile()
        ) {
          return;
        }

        const extension =
          path
            .extname(
              entry.name
            )
            .toLowerCase();

        if (
          !IMAGE_EXTENSIONS.has(
            extension
          )
        ) {
          return;
        }

        const relative =
          path
            .relative(
              imagesDir,
              absolute
            )
            .replace(
              /\\/g,
              '/'
            );

        const folderPath =
          path
            .dirname(
              relative
            )
            .replace(
              /\\/g,
              '/'
            );

        const folder =
          prettyFolderName(
            folderPath,
            entry.name
          );

        const stat =
          fs.statSync(
            absolute
          );

        const url =
          `/images/${relative}`;

        const displayName =
          entry.name
            .replace(
              /\.[^.]+$/,
              ''
            )
            .replace(
              /[-_]+/g,
              ' '
            )
            .trim() ||
          entry.name;

        const pathTags =
          relative
            .split(
              '/'
            )
            .slice(
              0,
              -1
            )
            .flatMap(
              (
                segment
              ) =>
                segment
                  .split(
                    /[-_]+/
                  )
            )
            .filter(
              Boolean
            );

        results.push({
          id:
            `code:${relative}`,

          name:
            displayName,

          url,

          storagePath:
            '',

          sourcePath:
            `public/images/${relative}`,

          folderId:
            folder.id,

          folderName:
            folder.name,

          mimeType:
            MIME_BY_EXTENSION[
              extension
            ] ||
            'image/*',

          size:
            stat.size,

          tags: [
            'code',
            'public',
            ...pathTags,
          ],

          createdAtMs:
            stat.birthtimeMs ||
            stat.ctimeMs ||
            0,

          updatedAtMs:
            stat.mtimeMs ||
            0,

          source:
            'code',

          readOnly:
            true,
        });
      }
    );
  };

  walk(
    imagesDir
  );

  return results.sort(
    (
      left,
      right
    ) =>
      String(
        left.sourcePath
      ).localeCompare(
        String(
          right.sourcePath
        ),
        'vi'
      )
  );
};

const codeAssetsPlugin =
  ():
    Plugin => {
    return {
      name:
        'dearly-code-assets',

      resolveId(
        source
      ) {
        if (
          source ===
          CODE_ASSET_MODULE_ID
        ) {
          return RESOLVED_CODE_ASSET_MODULE_ID;
        }

        return null;
      },

      load(
        id
      ) {
        if (
          id !==
          RESOLVED_CODE_ASSET_MODULE_ID
        ) {
          return null;
        }

        const assets =
          getCodeAssets(
            __dirname
          );

        return `export default ${JSON.stringify(assets)};`;
      },
    };
  };

export default defineConfig(() => {
  return {
    plugins: [
      codeAssetsPlugin(),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@':
          path.resolve(
            __dirname,
            '.'
          ),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr:
        process.env
          .DISABLE_HMR !==
        'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch:
        process.env
          .DISABLE_HMR ===
        'true'
          ? null
          : {},
    },
  };
});
