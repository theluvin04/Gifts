import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  AssetLibraryFolder,
  AssetLibraryItem,
  listAdminAssetFolders,
  listAdminAssetLibrary,
} from '../../../services/assetLibraryService';

import {
  AssetLibraryModal,
} from './AssetLibraryModal';

interface Props {
  title?: string;

  onClose:
    () => void;

  onSelect: (
    asset:
      AssetLibraryItem
  ) => void;
}

const RECENT_ID =
  '__recent__';

const ALL_ID =
  '__all__';

const getAssetTime = (
  asset:
    AssetLibraryItem
) =>
  Math.max(
    asset.updatedAtMs || 0,
    asset.createdAtMs || 0
  );

export const QuickAssetPickerModal:
React.FC<Props> = ({
  title = 'Chọn tài nguyên',
  onClose,
  onSelect,
}) => {
  const [
    assets,
    setAssets,
  ] =
    useState<AssetLibraryItem[]>(
      []
    );

  const [
    folders,
    setFolders,
  ] =
    useState<AssetLibraryFolder[]>(
      []
    );

  const [
    activeId,
    setActiveId,
  ] =
    useState(
      RECENT_ID
    );

  const [
    search,
    setSearch,
  ] =
    useState('');

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState('');

  const [
    manageOpen,
    setManageOpen,
  ] =
    useState(false);

  const searchRef =
    useRef<HTMLInputElement>(
      null
    );

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const [
        nextAssets,
        nextFolders,
      ] = await Promise.all([
        listAdminAssetLibrary(),
        listAdminAssetFolders(),
      ]);

      setAssets(nextAssets);
      setFolders(nextFolders);
    } catch (
      loadError: any
    ) {
      setError(
        loadError?.message ||
        'Không tải được tài nguyên.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();

    window.setTimeout(
      () =>
        searchRef.current
          ?.focus(),
      50
    );
  }, []);

  useEffect(() => {
    const handleKeyDown = (
      event:
        KeyboardEvent
    ) => {
      if (
        event.key ===
          'Escape' &&
        !manageOpen
      ) {
        onClose();
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
  }, [
    manageOpen,
    onClose,
  ]);

  const folderCounts =
    useMemo(() => {
      const counts =
        new Map<
          string,
          number
        >();

      assets.forEach(
        (asset) => {
          counts.set(
            asset.folderId,
            (
              counts.get(
                asset.folderId
              ) || 0
            ) + 1
          );
        }
      );

      return counts;
    }, [assets]);

  const recentAssets =
    useMemo(() => {
      const sorted = [
        ...assets,
      ].sort(
        (
          left,
          right
        ) =>
          getAssetTime(right) -
          getAssetTime(left)
      );

      return sorted.slice(
        0,
        30
      );
    }, [assets]);

  const visibleAssets =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      const source =
        activeId ===
        RECENT_ID
          ? recentAssets
          : assets;

      return source.filter(
        (asset) => {
          if (
            activeId !==
              RECENT_ID &&
            activeId !==
              ALL_ID &&
            asset.folderId !==
              activeId
          ) {
            return false;
          }

          if (!keyword) {
            return true;
          }

          const haystack = [
            asset.name,
            asset.folderName,
            asset.mimeType,
            ...asset.tags,
          ]
            .join(' ')
            .toLowerCase();

          return haystack.includes(
            keyword
          );
        }
      );
    }, [
      activeId,
      assets,
      recentAssets,
      search,
    ]);

  const selectAsset = (
    asset:
      AssetLibraryItem
  ) => {
    onSelect(asset);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[150] flex items-center justify-center bg-black/55 p-2 sm:p-4"
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
        <section className="flex max-h-[88svh] w-full max-w-[1080px] flex-col overflow-hidden rounded-[18px] bg-[#f6f5f3] shadow-[0_30px_100px_rgba(0,0,0,0.3)]">
          <header className="shrink-0 border-b border-black/7 bg-white p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-black text-[#191919]">
                  {title}
                </h3>

                <p className="mt-0.5 text-[9px] text-black/35">
                  Click ảnh để dùng ngay · tìm theo tên hoặc tag
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setManageOpen(true)
                }
                className="rounded-[9px] border border-black/10 bg-white px-3 py-2 text-[9px] font-black text-black/50 hover:border-[#cf5068]/30 hover:text-[#ad3853]"
              >
                Quản lý kho
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[#f3f1ef] text-sm font-black text-black/45 hover:bg-[#ece8e5]"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-black/25">
                  ⌕
                </span>

                <input
                  ref={searchRef}
                  value={search}
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Tìm hoa, sinh nhật, sticker, pink..."
                  className="w-full rounded-[11px] border border-black/10 bg-[#faf9f8] py-3 pl-8 pr-9 text-xs font-semibold outline-none transition focus:border-[#cf5068]/50 focus:bg-white"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      searchRef.current
                        ?.focus();
                    }}
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-[7px] text-[10px] font-black text-black/35 hover:bg-black/5"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5">
              <FilterChip
                active={
                  activeId ===
                  RECENT_ID
                }
                label="Gần đây"
                count={
                  recentAssets.length
                }
                onClick={() =>
                  setActiveId(
                    RECENT_ID
                  )
                }
              />

              <FilterChip
                active={
                  activeId ===
                  ALL_ID
                }
                label="Tất cả"
                count={assets.length}
                onClick={() =>
                  setActiveId(
                    ALL_ID
                  )
                }
              />

              {folders.map(
                (folder) => (
                  <FilterChip
                    key={folder.id}
                    active={
                      activeId ===
                      folder.id
                    }
                    label={folder.name}
                    count={
                      folderCounts.get(
                        folder.id
                      ) || 0
                    }
                    onClick={() =>
                      setActiveId(
                        folder.id
                      )
                    }
                  />
                )
              )}
            </div>
          </header>

          {error && (
            <div className="shrink-0 border-b border-red-100 bg-red-50 px-4 py-2.5 text-[10px] font-bold text-red-600">
              {error}
            </div>
          )}

          <main className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black text-black/60">
                  {activeId ===
                  RECENT_ID
                    ? 'Dùng gần đây'
                    : activeId ===
                        ALL_ID
                      ? 'Tất cả tài nguyên'
                      : folders.find(
                          (folder) =>
                            folder.id ===
                            activeId
                        )?.name ||
                        'Tài nguyên'}
                </p>

                <p className="mt-0.5 text-[8px] text-black/28">
                  {visibleAssets.length} kết quả
                </p>
              </div>

              {activeId !==
                RECENT_ID && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveId(
                      RECENT_ID
                    )
                  }
                  className="text-[9px] font-black text-[#ad3853]"
                >
                  ← Gần đây
                </button>
              )}
            </div>

            {loading ? (
              <QuickEmpty
                title="Đang tải tài nguyên..."
                description=""
              />
            ) : visibleAssets.length ===
              0 ? (
              <QuickEmpty
                title="Không tìm thấy ảnh"
                description={
                  search
                    ? 'Thử từ khóa khác hoặc chọn Tất cả.'
                    : 'Thư mục này chưa có tài nguyên.'
                }
              />
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {visibleAssets.map(
                  (asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() =>
                        selectAsset(asset)
                      }
                      title={`${asset.name} · ${asset.folderName}`}
                      className="group min-w-0 overflow-hidden rounded-[11px] border border-black/7 bg-white text-left transition hover:-translate-y-0.5 hover:border-[#cf5068]/30 hover:shadow-[0_8px_24px_rgba(80,30,45,0.1)] focus:outline-none focus:ring-2 focus:ring-[#cf5068]/25"
                    >
                      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[linear-gradient(45deg,#f2f1ef_25%,transparent_25%,transparent_75%,#f2f1ef_75%),linear-gradient(45deg,#f2f1ef_25%,#fff_25%,#fff_75%,#f2f1ef_75%)] bg-[length:14px_14px] bg-[position:0_0,7px_7px] p-2">
                        <img
                          src={asset.url}
                          alt={asset.name}
                          loading="lazy"
                          className="max-h-full max-w-full object-contain transition duration-150 group-hover:scale-[1.04]"
                        />

                        <span className="absolute bottom-1.5 right-1.5 rounded-[6px] bg-black/70 px-1.5 py-1 text-[7px] font-black text-white opacity-0 transition group-hover:opacity-100">
                          Chọn
                        </span>
                      </div>

                      <div className="p-2">
                        <p className="truncate text-[8px] font-black text-black/65">
                          {asset.name}
                        </p>

                        <p className="mt-0.5 truncate text-[7px] text-black/28">
                          {asset.folderName}
                        </p>
                      </div>
                    </button>
                  )
                )}
              </div>
            )}
          </main>
        </section>
      </div>

      {manageOpen && (
        <AssetLibraryModal
          title="Quản lý kho tài nguyên"
          onClose={() => {
            setManageOpen(false);
            void load();
          }}
          onSelect={(asset) => {
            setManageOpen(false);
            onSelect(asset);
          }}
        />
      )}
    </>
  );
};

const FilterChip:
React.FC<{
  active:
    boolean;
  label:
    string;
  count:
    number;
  onClick:
    () => void;
}> = ({
  active,
  label,
  count,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'flex shrink-0 items-center gap-1.5 rounded-[9px] border px-3 py-2 text-[9px] font-black transition',
      active
        ? 'border-[#cf5068]/20 bg-[#f8e9ed] text-[#a73551]'
        : 'border-black/7 bg-white text-black/42 hover:border-black/12 hover:text-black/65',
    ].join(' ')}
  >
    <span>{label}</span>
    <span
      className={[
        'rounded-full px-1.5 py-0.5 text-[7px]',
        active
          ? 'bg-white text-[#a73551]'
          : 'bg-[#f3f1ef] text-black/28',
      ].join(' ')}
    >
      {count}
    </span>
  </button>
);

const QuickEmpty:
React.FC<{
  title:
    string;
  description:
    string;
}> = ({
  title,
  description,
}) => (
  <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[14px] border border-dashed border-black/10 bg-white/55 px-4 text-center">
    <div className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#f5e8eb] text-lg">
      ▧
    </div>

    <p className="mt-3 text-xs font-black text-black/55">
      {title}
    </p>

    {description && (
      <p className="mt-1 max-w-[280px] text-[9px] leading-5 text-black/30">
        {description}
      </p>
    )}
  </div>
);
