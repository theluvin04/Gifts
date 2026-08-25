import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  AssetLibraryFolder,
  AssetLibraryItem,
  DEFAULT_ASSET_FOLDERS,
  createAdminAssetFolder,
  deleteAdminAssetLibraryItem,
  getAdminAssetLibraryRemoteState,
  listAdminAssetFolders,
  listAdminAssetLibrary,
  updateAdminAssetLibraryItem,
  uploadAdminAssetLibrary,
} from '../../../services/assetLibraryService';

interface Props {
  title?: string;

  onClose:
    () => void;

  onSelect: (
    asset:
      AssetLibraryItem
  ) => void;
}

const ALL_FOLDER_ID =
  '__all__';

export const AssetLibraryModal:
React.FC<Props> = ({
  title =
    'Kho tài nguyên',
  onClose,
  onSelect,
}) => {
  const [
    assets,
    setAssets,
  ] =
    useState<
      AssetLibraryItem[]
    >([]);

  const [
    folders,
    setFolders,
  ] =
    useState<
      AssetLibraryFolder[]
    >(
      DEFAULT_ASSET_FOLDERS
    );

  const [
    activeFolderId,
    setActiveFolderId,
  ] =
    useState(
      ALL_FOLDER_ID
    );

  const [
    uploadFolderId,
    setUploadFolderId,
  ] =
    useState(
      DEFAULT_ASSET_FOLDERS[0]
        .id
    );

  const [
    search,
    setSearch,
  ] =
    useState('');

  const [
    sourceFilter,
    setSourceFilter,
  ] =
    useState<
      'all' |
      'code' |
      'storage'
    >(
      'all'
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    uploading,
    setUploading,
  ] =
    useState(false);

  const [
    uploadProgress,
    setUploadProgress,
  ] =
    useState('');

  const [
    error,
    setError,
  ] =
    useState('');

  const [
    remoteAvailable,
    setRemoteAvailable,
  ] =
    useState(true);

  const [
    remoteMessage,
    setRemoteMessage,
  ] =
    useState('');

  const [
    editing,
    setEditing,
  ] =
    useState<
      AssetLibraryItem |
      null
    >(
      null
    );

  const inputRef =
    useRef<HTMLInputElement>(
      null
    );

  const refresh =
    async () => {
      setLoading(
        true
      );

      setError(
        ''
      );

      try {
        const [
          nextAssets,
          nextFolders,
        ] =
          await Promise.all([
            listAdminAssetLibrary(),
            listAdminAssetFolders(),
          ]);

        setAssets(
          nextAssets
        );

        setFolders(
          nextFolders
        );

        const remote =
          getAdminAssetLibraryRemoteState();

        setRemoteAvailable(
          remote.available
        );

        setRemoteMessage(
          remote.message
        );

        if (
          !nextFolders.some(
            (
              folder
            ) =>
              folder.id ===
              uploadFolderId
          ) &&
          nextFolders[0]
        ) {
          setUploadFolderId(
            nextFolders[0]
              .id
          );
        }
      } catch (
        loadError: any
      ) {
        setError(
          loadError?.message ||
          'Không tải được kho tài nguyên.'
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    const onKeyDown =
      (
        event:
          KeyboardEvent
      ) => {
        if (
          event.key ===
          'Escape'
        ) {
          onClose();
        }
      };

    window.addEventListener(
      'keydown',
      onKeyDown
    );

    return () =>
      window.removeEventListener(
        'keydown',
        onKeyDown
      );
  }, [
    onClose,
  ]);

  const counts =
    useMemo(
      () => {
        const map =
          new Map<
            string,
            number
          >();

        assets.forEach(
          (
            asset
          ) =>
            map.set(
              asset.folderId,
              (
                map.get(
                  asset.folderId
                ) ||
                0
              ) +
              1
            )
        );

        return map;
      },
      [
        assets,
      ]
    );

  const visibleAssets =
    useMemo(
      () => {
        const keyword =
          search
            .trim()
            .toLowerCase();

        return assets.filter(
          (
            asset
          ) => {
            if (
              activeFolderId !==
                ALL_FOLDER_ID &&
              asset.folderId !==
                activeFolderId
            ) {
              return false;
            }

            if (
              sourceFilter !==
                'all' &&
              asset.source !==
                sourceFilter
            ) {
              return false;
            }

            if (
              !keyword
            ) {
              return true;
            }

            const haystack =
              [
                asset.name,
                asset.folderName,
                asset.mimeType,
                ...asset.tags,
              ]
                .join(
                  ' '
                )
                .toLowerCase();

            return haystack.includes(
              keyword
            );
          }
        );
      },
      [
        assets,
        activeFolderId,
        search,
        sourceFilter,
      ]
    );

  const uploadFolder =
    folders.find(
      (
        folder
      ) =>
        folder.id ===
        uploadFolderId
    ) ||
    folders[0] ||
    DEFAULT_ASSET_FOLDERS[0];

  const handleFiles =
    async (
      files:
        File[]
    ) => {
      if (
        files.length ===
        0
      ) {
        return;
      }

      if (
        !remoteAvailable
      ) {
        setError(
          remoteMessage ||
          'Kho upload chưa được cấp quyền.'
        );
        return;
      }

      setUploading(
        true
      );

      setError(
        ''
      );

      setUploadProgress(
        `0/${files.length}`
      );

      try {
        const uploaded =
          await uploadAdminAssetLibrary(
            {
              files,
              folder:
                uploadFolder,
            },
            (
              completed,
              total
            ) =>
              setUploadProgress(
                `${completed}/${total}`
              )
          );

        setAssets(
          (
            current
          ) => [
            ...uploaded,
            ...current,
          ]
        );

        setActiveFolderId(
          uploadFolder.id
        );
      } catch (
        uploadError: any
      ) {
        setError(
          uploadError?.message ||
          'Upload tài nguyên thất bại.'
        );
      } finally {
        setUploading(
          false
        );

        setUploadProgress(
          ''
        );
      }
    };

  const handleCreateFolder =
    async () => {
      if (
        !remoteAvailable
      ) {
        setError(
          remoteMessage ||
          'Kho upload chưa được cấp quyền.'
        );
        return;
      }

      const name =
        window.prompt(
          'Tên thư mục mới\nVD: Thiệp sinh nhật'
        );

      if (
        !name?.trim()
      ) {
        return;
      }

      setError(
        ''
      );

      try {
        const folder =
          await createAdminAssetFolder(
            name
          );

        setFolders(
          (
            current
          ) => {
            const exists =
              current.some(
                (
                  item
                ) =>
                  item.id ===
                  folder.id
              );

            return exists
              ? current.map(
                  (
                    item
                  ) =>
                    item.id ===
                    folder.id
                      ? folder
                      : item
                )
              : [
                  ...current,
                  folder,
                ];
          }
        );

        setUploadFolderId(
          folder.id
        );

        setActiveFolderId(
          folder.id
        );
      } catch (
        folderError: any
      ) {
        setError(
          folderError?.message ||
          'Không tạo được thư mục.'
        );
      }
    };

  const handleDelete =
    async (
      asset:
        AssetLibraryItem
    ) => {
      const confirmed =
        window.confirm(
          `Xóa "${asset.name}" khỏi kho tài nguyên?\n\nNếu asset này đang được dùng trong template cũ thì ảnh đó có thể bị mất.`
        );

      if (!confirmed) {
        return;
      }

      setError(
        ''
      );

      try {
        await deleteAdminAssetLibraryItem(
          asset
        );

        setAssets(
          (
            current
          ) =>
            current.filter(
              (
                item
              ) =>
                item.id !==
                asset.id
            )
        );
      } catch (
        deleteError: any
      ) {
        setError(
          deleteError?.message ||
          'Không xóa được tài nguyên.'
        );
      }
    };

  const handleUpdated =
    (
      asset:
        AssetLibraryItem
    ) => {
      setAssets(
        (
          current
        ) =>
          current.map(
            (
              item
            ) =>
              item.id ===
              asset.id
                ? asset
                : item
          )
      );

      setEditing(
        null
      );
    };

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/55 p-2 sm:p-4"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section className="mx-auto flex h-full max-h-[920px] w-full max-w-[1320px] flex-col overflow-hidden rounded-[18px] bg-[#f5f4f2] shadow-[0_30px_100px_rgba(0,0,0,0.28)]">
        <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-black/7 bg-white px-3 py-3 sm:px-4">
          <div className="mr-auto min-w-0">
            <h3 className="truncate text-sm font-black">
              {title}
            </h3>

            <p className="mt-0.5 text-[9px] text-black/30">
              {assets.length}{' '}
              tài nguyên · code + upload · phân thư mục để tìm nhanh
            </p>
          </div>

          <div className="order-3 flex w-full min-w-0 items-center gap-2 sm:order-none sm:w-auto">
            <input
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="Tìm ảnh, sticker, thiệp..."
              className="min-w-0 flex-1 rounded-[9px] border border-black/10 bg-[#faf9f8] px-3 py-2.5 text-[10px] outline-none focus:border-[#cf5068] sm:w-[250px]"
            />

            <button
              type="button"
              onClick={
                onClose
              }
              className="shrink-0 rounded-[9px] border border-black/8 px-3 py-2.5 text-[10px] font-black text-black/45"
            >
              Đóng
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[190px_minmax(0,1fr)]">
          <aside className="shrink-0 overflow-x-auto border-b border-black/7 bg-white p-2 lg:overflow-y-auto lg:border-b-0 lg:border-r">
            <div className="flex gap-1.5 lg:flex-col">
              <FolderButton
                active={
                  activeFolderId ===
                  ALL_FOLDER_ID
                }
                name="Tất cả"
                count={
                  assets.length
                }
                onClick={() =>
                  setActiveFolderId(
                    ALL_FOLDER_ID
                  )
                }
              />

              {folders.map(
                (
                  folder
                ) => (
                  <FolderButton
                    key={
                      folder.id
                    }
                    active={
                      activeFolderId ===
                      folder.id
                    }
                    name={
                      folder.name
                    }
                    count={
                      counts.get(
                        folder.id
                      ) ||
                      0
                    }
                    onClick={() =>
                      setActiveFolderId(
                        folder.id
                      )
                    }
                  />
                )
              )}
            </div>

            <button
              type="button"
              disabled={
                !remoteAvailable
              }
              onClick={() =>
                void handleCreateFolder()
              }
              className="mt-2 whitespace-nowrap rounded-[8px] border border-dashed border-black/15 px-3 py-2 text-[9px] font-black text-black/40 hover:border-[#cf5068]/30 hover:text-[#b83e57] disabled:cursor-not-allowed disabled:opacity-35 lg:w-full"
            >
              + Thư mục
            </button>
          </aside>

          <main className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-black/7 bg-white px-3 py-2.5">
              <span className="text-[9px] font-black text-black/35">
                Upload vào
              </span>

              <select
                value={
                  uploadFolder.id
                }
                disabled={
                  uploading ||
                  !remoteAvailable
                }
                onChange={(
                  event
                ) =>
                  setUploadFolderId(
                    event.target
                      .value
                  )
                }
                className="max-w-[220px] rounded-[8px] border border-black/10 bg-[#faf9f8] px-2.5 py-2 text-[9px] font-black outline-none"
              >
                {folders.map(
                  (
                    folder
                  ) => (
                    <option
                      key={
                        folder.id
                      }
                      value={
                        folder.id
                      }
                    >
                      {folder.name}
                    </option>
                  )
                )}
              </select>

              <button
                type="button"
                disabled={
                  uploading ||
                  !remoteAvailable
                }
                onClick={() =>
                  inputRef.current
                    ?.click()
                }
                className="rounded-[8px] bg-[#191919] px-3 py-2 text-[9px] font-black text-white disabled:opacity-40"
              >
                {uploading
                  ? `Đang up ${uploadProgress}`
                  : '+ Upload ảnh / GIF'}
              </button>

              <input
                ref={
                  inputRef
                }
                type="file"
                accept="image/*,.gif"
                multiple
                className="hidden"
                onChange={(
                  event
                ) => {
                  const files: File[] =
                    event.target.files
                      ? Array.from(
                          event.target.files
                        )
                      : [];

                  event.target.value =
                    '';

                  void handleFiles(
                    files
                  );
                }}
              />

              <div className="flex items-center rounded-[8px] bg-[#f4f1f1] p-0.5">
                <SourceButton
                  active={
                    sourceFilter ===
                    'all'
                  }
                  label="Tất cả"
                  onClick={() =>
                    setSourceFilter(
                      'all'
                    )
                  }
                />

                <SourceButton
                  active={
                    sourceFilter ===
                    'code'
                  }
                  label="Trong code"
                  onClick={() =>
                    setSourceFilter(
                      'code'
                    )
                  }
                />

                <SourceButton
                  active={
                    sourceFilter ===
                    'storage'
                  }
                  label="Đã upload"
                  onClick={() =>
                    setSourceFilter(
                      'storage'
                    )
                  }
                />
              </div>

              <span className="ml-auto text-[8px] text-black/25">
                PNG · JPG · WEBP · GIF · tối đa 15MB/file
              </span>
            </div>

            {!remoteAvailable && (
              <div className="shrink-0 border-b border-amber-100 bg-amber-50 px-3 py-2.5 text-[9px] font-bold text-amber-700">
                {remoteMessage ||
                  'Kho upload chưa được Firestore cấp quyền. Ảnh trong code vẫn dùng bình thường.'}
              </div>
            )}

            {error && (
              <div className="shrink-0 border-b border-red-100 bg-red-50 px-3 py-2.5 text-[10px] font-bold text-red-600">
                {error}
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black">
                    {activeFolderId ===
                    ALL_FOLDER_ID
                      ? 'Tất cả tài nguyên'
                      : folders.find(
                          (
                            folder
                          ) =>
                            folder.id ===
                            activeFolderId
                        )?.name ||
                        'Tài nguyên'}
                  </p>

                  <p className="mt-0.5 text-[8px] text-black/28">
                    {visibleAssets.length}{' '}
                    kết quả
                  </p>
                </div>
              </div>

              {loading ? (
                <EmptyState
                  title="Đang tải kho tài nguyên..."
                  description="Chờ một chút."
                />
              ) : visibleAssets.length ===
                0 ? (
                <EmptyState
                  title={
                    search
                      ? 'Không tìm thấy tài nguyên'
                      : 'Thư mục này đang trống'
                  }
                  description={
                    search
                      ? 'Thử từ khóa khác.'
                      : `Chọn “Upload ảnh / GIF” để thêm vào ${uploadFolder.name}.`
                  }
                />
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                  {visibleAssets.map(
                    (
                      asset
                    ) => (
                      <AssetCard
                        key={
                          asset.id
                        }
                        asset={
                          asset
                        }
                        onSelect={() =>
                          onSelect(
                            asset
                          )
                        }
                        onEdit={() =>
                          setEditing(
                            asset
                          )
                        }
                        onDelete={() =>
                          void handleDelete(
                            asset
                          )
                        }
                      />
                    )
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </section>

      {editing && (
        <EditAssetModal
          asset={
            editing
          }
          folders={
            folders
          }
          onClose={() =>
            setEditing(
              null
            )
          }
          onUpdated={
            handleUpdated
          }
        />
      )}
    </div>
  );
};

const SourceButton:
React.FC<{
  active:
    boolean;

  label:
    string;

  onClick:
    () => void;
}> = ({
  active,
  label,
  onClick,
}) => (
  <button
    type="button"
    onClick={
      onClick
    }
    className={[
      'rounded-[6px] px-2 py-1.5 text-[8px] font-black transition',
      active
        ? 'bg-white text-[#a73551] shadow-sm'
        : 'text-black/35 hover:text-black/60',
    ].join(' ')}
  >
    {label}
  </button>
);

const FolderButton:
React.FC<{
  active:
    boolean;

  name:
    string;

  count:
    number;

  onClick:
    () => void;
}> = ({
  active,
  name,
  count,
  onClick,
}) => (
  <button
    type="button"
    onClick={
      onClick
    }
    className={[
      'flex shrink-0 items-center justify-between gap-3 rounded-[8px] px-3 py-2.5 text-left text-[9px] font-black transition lg:w-full',
      active
        ? 'bg-[#f7e9ed] text-[#a73551]'
        : 'text-black/45 hover:bg-[#faf8f7]',
    ].join(' ')}
  >
    <span className="whitespace-nowrap">
      {name}
    </span>

    <span
      className={[
        'rounded-full px-1.5 py-0.5 text-[7px]',
        active
          ? 'bg-white text-[#a73551]'
          : 'bg-[#f4f1f1] text-black/30',
      ].join(' ')}
    >
      {count}
    </span>
  </button>
);

const AssetCard:
React.FC<{
  asset:
    AssetLibraryItem;

  onSelect:
    () => void;

  onEdit:
    () => void;

  onDelete:
    () => void;
}> = ({
  asset,
  onSelect,
  onEdit,
  onDelete,
}) => (
  <article className="group min-w-0 overflow-hidden rounded-[11px] border border-black/7 bg-white transition hover:border-[#cf5068]/25 hover:shadow-[0_8px_26px_rgba(80,30,45,0.08)]">
    <button
      type="button"
      onClick={
        onSelect
      }
      className="block w-full"
    >
      <div className="flex aspect-square items-center justify-center overflow-hidden bg-[linear-gradient(45deg,#f2f1ef_25%,transparent_25%,transparent_75%,#f2f1ef_75%),linear-gradient(45deg,#f2f1ef_25%,#fff_25%,#fff_75%,#f2f1ef_75%)] bg-[length:16px_16px] bg-[position:0_0,8px_8px] p-2">
        <img
          src={
            asset.url
          }
          alt={
            asset.name
          }
          loading="lazy"
          className="max-h-full max-w-full object-contain"
        />
      </div>
    </button>

    <div className="min-w-0 p-2">
      <p className="truncate text-[9px] font-black text-black/65">
        {asset.name}
      </p>

      <div className="mt-1 flex items-center gap-1">
        <span className="min-w-0 flex-1 truncate text-[7px] font-bold uppercase tracking-[0.05em] text-black/25">
          {asset.folderName}
        </span>

        {asset.source ===
          'code' && (
          <span className="rounded bg-[#eaf0ff] px-1 py-0.5 text-[6px] font-black text-[#3455a7]">
            CODE
          </span>
        )}

        {asset.mimeType ===
          'image/gif' && (
          <span className="rounded bg-[#f7e9ed] px-1 py-0.5 text-[6px] font-black text-[#a73551]">
            GIF
          </span>
        )}
      </div>

      {asset.sourcePath && (
        <p
          title={
            asset.sourcePath
          }
          className="mt-1 truncate font-mono text-[6px] text-black/20"
        >
          {asset.sourcePath}
        </p>
      )}

      <div
        className={[
          'mt-2 grid gap-1',
          asset.source ===
          'code'
            ? 'grid-cols-1'
            : 'grid-cols-[1fr_auto_auto]',
        ].join(' ')}
      >
        <button
          type="button"
          onClick={
            onSelect
          }
          className="rounded-[7px] bg-[#191919] px-2 py-1.5 text-[8px] font-black text-white"
        >
          Chọn
        </button>

        {asset.source !==
          'code' && (
          <>
            <button
              type="button"
              onClick={
                onEdit
              }
              className="rounded-[7px] border border-black/8 px-2 py-1.5 text-[8px] font-black text-black/40"
            >
              Sửa
            </button>

            <button
              type="button"
              onClick={
                onDelete
              }
              className="rounded-[7px] border border-red-100 px-2 py-1.5 text-[8px] font-black text-red-500"
            >
              ×
            </button>
          </>
        )}
      </div>
    </div>
  </article>
);

const EmptyState:
React.FC<{
  title:
    string;

  description:
    string;
}> = ({
  title,
  description,
}) => (
  <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[14px] border border-dashed border-black/10 bg-white/55 px-4 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#f6e8ec] text-xl">
      ▧
    </div>

    <p className="mt-3 text-xs font-black text-black/55">
      {title}
    </p>

    <p className="mt-1 max-w-[300px] text-[9px] leading-5 text-black/30">
      {description}
    </p>
  </div>
);

const EditAssetModal:
React.FC<{
  asset:
    AssetLibraryItem;

  folders:
    AssetLibraryFolder[];

  onClose:
    () => void;

  onUpdated: (
    asset:
      AssetLibraryItem
  ) => void;
}> = ({
  asset,
  folders,
  onClose,
  onUpdated,
}) => {
  const [
    name,
    setName,
  ] =
    useState(
      asset.name
    );

  const [
    folderId,
    setFolderId,
  ] =
    useState(
      asset.folderId
    );

  const [
    tags,
    setTags,
  ] =
    useState(
      asset.tags.join(
        ', '
      )
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState('');

  const save =
    async () => {
      const folder =
        folders.find(
          (
            item
          ) =>
            item.id ===
            folderId
        );

      if (!folder) {
        setError(
          'Chọn thư mục.'
        );
        return;
      }

      setSaving(
        true
      );

      setError(
        ''
      );

      try {
        const updated =
          await updateAdminAssetLibraryItem(
            asset,
            {
              name,
              folder,
              tags:
                tags
                  .split(
                    ','
                  )
                  .map(
                    (
                      tag
                    ) =>
                      tag.trim()
                  )
                  .filter(
                    Boolean
                  ),
            }
          );

        onUpdated(
          updated
        );
      } catch (
        saveError: any
      ) {
        setError(
          saveError?.message ||
          'Không lưu được tài nguyên.'
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  return (
    <div
      className="fixed inset-0 z-[170] flex items-center justify-center bg-black/45 p-4"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section className="w-full max-w-[420px] rounded-[16px] bg-white p-4 shadow-[0_30px_90px_rgba(0,0,0,0.24)]">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-black">
            Sửa tài nguyên
          </h4>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-full bg-[#f4f1f1] px-2.5 py-1.5 text-[9px] font-black text-black/40"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 grid grid-cols-[90px_minmax(0,1fr)] gap-3">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-[10px] bg-[#f4f2ef] p-2">
            <img
              src={
                asset.url
              }
              alt=""
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="min-w-0 space-y-3">
            <label className="block">
              <span className="mb-1 block text-[8px] font-black text-black/35">
                Tên
              </span>

              <input
                value={
                  name
                }
                onChange={(
                  event
                ) =>
                  setName(
                    event.target
                      .value
                  )
                }
                className="w-full rounded-[8px] border border-black/10 bg-[#faf9f8] px-2.5 py-2 text-[10px] outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[8px] font-black text-black/35">
                Thư mục
              </span>

              <select
                value={
                  folderId
                }
                onChange={(
                  event
                ) =>
                  setFolderId(
                    event.target
                      .value
                  )
                }
                className="w-full rounded-[8px] border border-black/10 bg-[#faf9f8] px-2.5 py-2 text-[10px] font-bold outline-none"
              >
                {folders.map(
                  (
                    folder
                  ) => (
                    <option
                      key={
                        folder.id
                      }
                      value={
                        folder.id
                      }
                    >
                      {folder.name}
                    </option>
                  )
                )}
              </select>
            </label>
          </div>
        </div>

        <label className="mt-3 block">
          <span className="mb-1 block text-[8px] font-black text-black/35">
            Tags tìm kiếm · cách nhau bằng dấu phẩy
          </span>

          <input
            value={
              tags
            }
            onChange={(
              event
            ) =>
              setTags(
                event.target
                  .value
              )
            }
            placeholder="sinh nhật, hoa, pink..."
            className="w-full rounded-[8px] border border-black/10 bg-[#faf9f8] px-2.5 py-2 text-[10px] outline-none"
          />
        </label>

        {error && (
          <p className="mt-3 rounded-[8px] bg-red-50 px-3 py-2 text-[9px] font-bold text-red-600">
            {error}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={
              saving
            }
            onClick={
              onClose
            }
            className="rounded-[9px] border border-black/10 px-3 py-2.5 text-[10px] font-black text-black/45"
          >
            Hủy
          </button>

          <button
            type="button"
            disabled={
              saving
            }
            onClick={() =>
              void save()
            }
            className="rounded-[9px] bg-[#191919] px-3 py-2.5 text-[10px] font-black text-white disabled:opacity-40"
          >
            {saving
              ? 'Đang lưu...'
              : 'Lưu'}
          </button>
        </div>
      </section>
    </div>
  );
};
