import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';

import {
  db,
  storage,
} from '../config/firebase';

import codeAssets from 'virtual:dearly-code-assets';

import {
  getAdminSession,
} from './adminService';

export interface AssetLibraryFolder {
  id: string;
  name: string;
  builtIn?: boolean;
}

export type AssetLibrarySource =
  | 'code'
  | 'storage';

export interface AssetLibraryItem {
  id: string;
  name: string;
  url: string;
  storagePath: string;
  sourcePath?: string;
  folderId: string;
  folderName: string;
  mimeType: string;
  size: number;
  tags: string[];
  createdAtMs: number;
  updatedAtMs: number;
  source:
    AssetLibrarySource;
  readOnly?: boolean;
}

export interface UploadAssetLibraryInput {
  files: File[];
  folder:
    AssetLibraryFolder;
}

export interface UpdateAssetLibraryInput {
  name?: string;
  folder?:
    AssetLibraryFolder;
  tags?: string[];
}

export const DEFAULT_ASSET_FOLDERS:
AssetLibraryFolder[] = [
  {
    id:
      'anh-thiep',
    name:
      'Ảnh thiệp',
    builtIn:
      true,
  },
  {
    id:
      'background',
    name:
      'Background',
    builtIn:
      true,
  },
  {
    id:
      'sticker',
    name:
      'Sticker',
    builtIn:
      true,
  },
  {
    id:
      'nhan-vat',
    name:
      'Nhân vật',
    builtIn:
      true,
  },
  {
    id:
      'hoa-cay',
    name:
      'Hoa & cây',
    builtIn:
      true,
  },
  {
    id:
      'banh-sinh-nhat',
    name:
      'Bánh & sinh nhật',
    builtIn:
      true,
  },
  {
    id:
      'tape-scrapbook',
    name:
      'Tape & scrapbook',
    builtIn:
      true,
  },
  {
    id:
      'icon-decor',
    name:
      'Icon & decor',
    builtIn:
      true,
  },
  {
    id:
      'gif',
    name:
      'GIF',
    builtIn:
      true,
  },
  {
    id:
      'gifts',
    name:
      'Quà / Gifts',
    builtIn:
      true,
  },
  {
    id:
      'proposal',
    name:
      'Proposal',
    builtIn:
      true,
  },
  {
    id:
      'brand',
    name:
      'Brand',
    builtIn:
      true,
  },
  {
    id:
      'khac',
    name:
      'Khác',
    builtIn:
      true,
  },
];

const MAX_FILE_SIZE =
  15 *
  1024 *
  1024;

const slugify = (
  value: string
) =>
  value
    .trim()
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
    )
    .slice(
      0,
      72
    );

const makeId =
  (
    prefix: string
  ) => {
    if (
      typeof crypto !==
        'undefined' &&
      typeof crypto
        .randomUUID ===
        'function'
    ) {
      return `${prefix}-${crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  };

const sanitizeFileName =
  (
    fileName: string
  ) => {
    const dot =
      fileName.lastIndexOf(
        '.'
      );

    const extension =
      dot >=
      0
        ? fileName
            .slice(
              dot
            )
            .toLowerCase()
            .replace(
              /[^.a-z0-9]/g,
              ''
            )
        : '';

    const base =
      dot >=
      0
        ? fileName.slice(
            0,
            dot
          )
        : fileName;

    return `${
      slugify(
        base
      ) ||
      'asset'
    }${extension}`;
  };

const assertAdmin =
  async () => {
    const session =
      await getAdminSession();

    if (
      !session.isAdmin
    ) {
      const error =
        new Error(
          'Chỉ Admin mới được quản lý kho tài nguyên.'
        ) as
          Error & {
            code?: string;
          };

      error.code =
        'permission-denied';

      throw error;
    }

    return session;
  };

const normalizeFolder =
  (
    data:
      Partial<
        AssetLibraryFolder
      >
  ):
    AssetLibraryFolder => {
    const name =
      typeof data.name ===
        'string' &&
      data.name.trim()
        ? data.name.trim()
        : 'Khác';

    const id =
      typeof data.id ===
        'string' &&
      data.id.trim()
        ? slugify(
            data.id
          )
        : slugify(
            name
          ) ||
          'khac';

    return {
      id,
      name,
      builtIn:
        Boolean(
          data.builtIn
        ),
    };
  };

const normalizeAsset =
  (
    id: string,
    data:
      Record<
        string,
        any
      >
  ):
    AssetLibraryItem => {
    const folderName =
      typeof data
        .folderName ===
        'string' &&
      data.folderName
        .trim()
        ? data.folderName
            .trim()
        : 'Khác';

    const folderId =
      typeof data
        .folderId ===
        'string' &&
      data.folderId
        .trim()
        ? slugify(
            data.folderId
          )
        : slugify(
            folderName
          ) ||
          'khac';

    return {
      id,

      name:
        typeof data.name ===
          'string' &&
        data.name.trim()
          ? data.name.trim()
          : id,

      url:
        typeof data.url ===
          'string'
          ? data.url
          : '',

      storagePath:
        typeof data
          .storagePath ===
          'string'
          ? data.storagePath
          : '',

      folderId,

      folderName,

      mimeType:
        typeof data
          .mimeType ===
          'string'
          ? data.mimeType
          : 'image/*',

      size:
        typeof data.size ===
          'number' &&
        Number.isFinite(
          data.size
        )
          ? data.size
          : 0,

      tags:
        Array.isArray(
          data.tags
        )
          ? data.tags
              .filter(
                (
                  tag:
                    unknown
                ) =>
                  typeof tag ===
                  'string'
              )
              .map(
                (
                  tag:
                    string
                ) =>
                  tag.trim()
              )
              .filter(
                Boolean
              )
          : [],

      createdAtMs:
        typeof data
          .createdAtMs ===
          'number'
          ? data.createdAtMs
          : 0,

      updatedAtMs:
        typeof data
          .updatedAtMs ===
          'number'
          ? data.updatedAtMs
          : 0,

      source:
        data.source ===
          'code'
          ? 'code'
          : 'storage',

      sourcePath:
        typeof data
          .sourcePath ===
          'string'
          ? data.sourcePath
          : undefined,

      readOnly:
        data.readOnly ===
          true,
    };
  };

export const listAdminAssetFolders =
  async ():
    Promise<
      AssetLibraryFolder[]
    > => {
    const map =
      new Map<
        string,
        AssetLibraryFolder
      >();

    // IMPORTANT:
    // Code assets must never depend on Firestore permissions.
    // Build the local/code folder list first so the editor keeps
    // working even when assetFolders rules have not been deployed.
    codeAssets.forEach(
      (
        asset
      ) => {
        if (
          !map.has(
            asset.folderId
          )
        ) {
          map.set(
            asset.folderId,
            {
              id:
                asset.folderId,
              name:
                asset.folderName,
              builtIn:
                true,
            }
          );
        }
      }
    );

    DEFAULT_ASSET_FOLDERS.forEach(
      (
        folder
      ) =>
        map.set(
          folder.id,
          folder
        )
    );

    try {
      await assertAdmin();

      const snapshot =
        await getDocs(
          collection(
            db,
            'assetFolders'
          )
        );

      const custom =
        snapshot.docs.map(
          (
            folderSnapshot
          ) =>
            normalizeFolder({
              id:
                folderSnapshot.id,
              ...folderSnapshot
                .data(),
            })
        );

      custom.forEach(
        (
          folder
        ) =>
          map.set(
            folder.id,
            folder
          )
      );
    } catch (
      error
    ) {
      // Uploaded/custom folders are optional.
      // Never hide folders generated from public/images/**.
      console.warn(
        'Asset custom folders unavailable; using code/default folders:',
        error
      );
    }

    return Array.from(
      map.values()
    ).sort(
      (
        left,
        right
      ) => {
        if (
          left.builtIn &&
          !right.builtIn
        ) {
          return -1;
        }

        if (
          right.builtIn &&
          !left.builtIn
        ) {
          return 1;
        }

        return left.name.localeCompare(
          right.name,
          'vi'
        );
      }
    );
  };

export const createAdminAssetFolder =
  async (
    name: string
  ):
    Promise<
      AssetLibraryFolder
    > => {
    await assertAdmin();

    const cleanName =
      name.trim();

    const id =
      slugify(
        cleanName
      );

    if (
      !cleanName ||
      !id
    ) {
      throw new Error(
        'Tên thư mục chưa hợp lệ.'
      );
    }

    const folder:
      AssetLibraryFolder = {
      id,
      name:
        cleanName,
      builtIn:
        false,
    };

    await setDoc(
      doc(
        db,
        'assetFolders',
        id
      ),
      {
        id,
        name:
          cleanName,
        createdAtMs:
          Date.now(),
        updatedAtMs:
          Date.now(),
      },
      {
        merge: true,
      }
    );

    return folder;
  };

export const listAdminAssetLibrary =
  async ():
    Promise<
      AssetLibraryItem[]
    > => {
    // public/images/** is compiled into this virtual module.
    // It must be available without any Firestore request.
    const bundled =
      codeAssets
        .map(
          (
            asset
          ) =>
            normalizeAsset(
              asset.id,
              asset
            )
        )
        .filter(
          (
            asset
          ) =>
            Boolean(
              asset.url
            )
        );

    let uploaded:
      AssetLibraryItem[] = [];

    try {
      await assertAdmin();

      const snapshot =
        await getDocs(
          collection(
            db,
            'assetLibrary'
          )
        );

      uploaded =
        snapshot.docs
          .map(
            (
              assetSnapshot
            ) =>
              normalizeAsset(
                assetSnapshot.id,
                assetSnapshot.data()
              )
          )
          .filter(
            (
              asset
            ) =>
              Boolean(
                asset.url
              )
          );
    } catch (
      error
    ) {
      // Firestore metadata is optional for code assets.
      // A missing rule/database must not make public/images disappear.
      console.warn(
        'Uploaded asset library unavailable; showing code assets only:',
        error
      );
    }

    return [
      ...bundled,
      ...uploaded,
    ].sort(
      (
        left,
        right
      ) => {
        if (
          left.source !==
          right.source
        ) {
          return left.source ===
            'code'
            ? -1
            : 1;
        }

        if (
          left.folderName !==
          right.folderName
        ) {
          return left.folderName.localeCompare(
            right.folderName,
            'vi'
          );
        }

        return left.name.localeCompare(
          right.name,
          'vi'
        );
      }
    );
  };

export const uploadAdminAssetLibrary =
  async (
    input:
      UploadAssetLibraryInput,
    onProgress?: (
      completed: number,
      total: number
    ) => void
  ):
    Promise<
      AssetLibraryItem[]
    > => {
    await assertAdmin();

    const folder =
      normalizeFolder(
        input.folder
      );

    const files =
      input.files.filter(
        Boolean
      );

    const uploaded:
      AssetLibraryItem[] = [];

    for (
      let index = 0;
      index <
      files.length;
      index +=
      1
    ) {
      const file =
        files[index];

      if (
        !file.type
          .startsWith(
            'image/'
          )
      ) {
        throw new Error(
          `"${file.name}" không phải file ảnh/GIF.`
        );
      }

      if (
        file.size >
        MAX_FILE_SIZE
      ) {
        throw new Error(
          `"${file.name}" lớn hơn 15MB.`
        );
      }

      const id =
        makeId(
          'asset'
        );

      const storagePath =
        `dearly-assets/${folder.id}/${id}-${sanitizeFileName(file.name)}`;

      const objectRef =
        ref(
          storage,
          storagePath
        );

      await uploadBytes(
        objectRef,
        file,
        {
          contentType:
            file.type,
          cacheControl:
            'public,max-age=31536000,immutable',
          customMetadata: {
            assetId:
              id,
            folderId:
              folder.id,
          },
        }
      );

      const url =
        await getDownloadURL(
          objectRef
        );

      const now =
        Date.now();

      const item:
        AssetLibraryItem = {
        id,

        name:
          file.name
            .replace(
              /\.[^.]+$/,
              ''
            )
            .trim() ||
          'Asset',

        url,

        storagePath,

        folderId:
          folder.id,

        folderName:
          folder.name,

        mimeType:
          file.type,

        size:
          file.size,

        tags: [],

        createdAtMs:
          now,

        updatedAtMs:
          now,

        source:
          'storage',

        readOnly:
          false,
      };

      try {
        await setDoc(
          doc(
            db,
            'assetLibrary',
            id
          ),
          item
        );
      } catch (
        error
      ) {
        try {
          await deleteObject(
            objectRef
          );
        } catch {
          // Best effort cleanup.
        }

        throw error;
      }

      uploaded.push(
        item
      );

      onProgress?.(
        index +
          1,
        files.length
      );
    }

    return uploaded;
  };

export const updateAdminAssetLibraryItem =
  async (
    item:
      AssetLibraryItem,
    patch:
      UpdateAssetLibraryInput
  ):
    Promise<
      AssetLibraryItem
    > => {
    await assertAdmin();

    if (
      item.source ===
        'code' ||
      item.readOnly
    ) {
      throw new Error(
        'Tài nguyên trong code là read-only. Muốn đổi nhóm/tên hãy đổi folder hoặc tên file trong public/images.'
      );
    }

    const folder =
      patch.folder
        ? normalizeFolder(
            patch.folder
          )
        : {
            id:
              item.folderId,
            name:
              item.folderName,
          };

    const next:
      AssetLibraryItem = {
      ...item,

      name:
        typeof patch.name ===
          'string'
          ? patch.name
              .trim() ||
            item.name
          : item.name,

      folderId:
        folder.id,

      folderName:
        folder.name,

      tags:
        Array.isArray(
          patch.tags
        )
          ? patch.tags
              .map(
                (
                  tag
                ) =>
                  tag.trim()
              )
              .filter(
                Boolean
              )
          : item.tags,

      updatedAtMs:
        Date.now(),
    };

    await setDoc(
      doc(
        db,
        'assetLibrary',
        item.id
      ),
      next,
      {
        merge: true,
      }
    );

    return next;
  };

export const deleteAdminAssetLibraryItem =
  async (
    item:
      AssetLibraryItem
  ) => {
    await assertAdmin();

    if (
      item.source ===
        'code' ||
      item.readOnly
    ) {
      throw new Error(
        'Không thể xóa tài nguyên trong code từ Admin. Xóa file trong public/images nếu thật sự muốn bỏ.'
      );
    }

    if (
      item.storagePath
    ) {
      try {
        await deleteObject(
          ref(
            storage,
            item.storagePath
          )
        );
      } catch (
        error: any
      ) {
        if (
          error?.code !==
          'storage/object-not-found'
        ) {
          throw error;
        }
      }
    }

    await deleteDoc(
      doc(
        db,
        'assetLibrary',
        item.id
      )
    );
  };
