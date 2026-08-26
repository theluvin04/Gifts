import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  mergeFontOptions,
  type DiscoveredFontGroup,
} from './fontDiscovery';

interface FontOption {
  label: string;
  value: string;
  group:
    DiscoveredFontGroup;
}

interface Props {
  value: string;
  onChange: (
    value: string
  ) => void;
  previewText?: string;
}

const FONT_OPTIONS:
FontOption[] = [
  {
    label: 'Quicksand',
    value:
      '"Quicksand", sans-serif',
    group: 'Bo tròn',
  },
  {
    label: 'Be Vietnam Pro',
    value:
      '"Be Vietnam Pro", sans-serif',
    group: 'Hiện đại',
  },
  {
    label: 'Poppins',
    value:
      '"Poppins", sans-serif',
    group: 'Hiện đại',
  },
  {
    label: 'Montserrat',
    value:
      '"Montserrat", sans-serif',
    group: 'Hiện đại',
  },
  {
    label: 'Nunito',
    value:
      '"Nunito", sans-serif',
    group: 'Bo tròn',
  },
  {
    label: 'Inter',
    value:
      '"Inter", sans-serif',
    group: 'Hiện đại',
  },
  {
    label: 'Comfortaa',
    value:
      '"Comfortaa", sans-serif',
    group: 'Bo tròn',
  },
  {
    label: 'Playfair Display',
    value:
      '"Playfair Display", serif',
    group: 'Thanh lịch',
  },
  {
    label: 'DM Serif Display',
    value:
      '"DM Serif Display", serif',
    group: 'Thanh lịch',
  },
  {
    label: 'Lora',
    value:
      '"Lora", serif',
    group: 'Thanh lịch',
  },
  {
    label: 'Libre Baskerville',
    value:
      '"Libre Baskerville", serif',
    group: 'Thanh lịch',
  },
  {
    label: 'Roboto Slab',
    value:
      '"Roboto Slab", serif',
    group: 'Thanh lịch',
  },
  {
    label: 'Dancing Script',
    value:
      '"Dancing Script", cursive',
    group: 'Viết tay',
  },
  {
    label: 'Caveat',
    value:
      '"Caveat", cursive',
    group: 'Viết tay',
  },
  {
    label: 'Great Vibes',
    value:
      '"Great Vibes", cursive',
    group: 'Viết tay',
  },
  {
    label: 'Satisfy',
    value:
      '"Satisfy", cursive',
    group: 'Viết tay',
  },
  {
    label: 'Pacifico',
    value:
      '"Pacifico", cursive',
    group: 'Viết tay',
  },
];

const RECENT_FONT_KEY =
  'dearly-admin-recent-fonts';

const getFontName = (
  value: string
) =>
  FONT_OPTIONS.find(
    (font) =>
      font.value ===
      value
  )?.label ||
  value
    .split(',')[0]
    ?.replace(/["']/g, '') ||
  'Font';

const readRecentFonts =
  () => {
    if (
      typeof window ===
      'undefined'
    ) {
      return [] as string[];
    }

    try {
      const parsed =
        JSON.parse(
          window.localStorage.getItem(
            RECENT_FONT_KEY
          ) ||
          '[]'
        );

      return Array.isArray(
        parsed
      )
        ? parsed.filter(
            (
              item
            ): item is string =>
              typeof item ===
              'string'
          )
        : [];
    } catch {
      return [] as string[];
    }
  };

export const QuickFontPicker:
React.FC<Props> = ({
  value,
  onChange,
  previewText =
    'Dearly',
}) => {
  const [
    open,
    setOpen,
  ] =
    useState(false);

  const [
    search,
    setSearch,
  ] =
    useState('');

  const [
    group,
    setGroup,
  ] =
    useState<
      'Tất cả' |
      FontOption['group']
    >(
      'Tất cả'
    );

  const [
    recent,
    setRecent,
  ] =
    useState<string[]>(
      readRecentFonts
    );

  const [
    fontOptions,
    setFontOptions,
  ] = useState<FontOption[]>(
    () =>
      mergeFontOptions(
        FONT_OPTIONS
      ) as FontOption[]
  );

  useEffect(() => {
    let cancelled = false;

    void document.fonts.ready.then(() => {
      if (!cancelled) {
        setFontOptions(
          mergeFontOptions(
            FONT_OPTIONS
          ) as FontOption[]
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const rootRef =
    useRef<HTMLDivElement>(
      null
    );

  const searchRef =
    useRef<HTMLInputElement>(
      null
    );

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointer =
      (
        event:
          MouseEvent
      ) => {
        if (
          rootRef.current &&
          !rootRef.current.contains(
            event.target as Node
          )
        ) {
          setOpen(false);
        }
      };

    const handleKey =
      (
        event:
          KeyboardEvent
      ) => {
        if (
          event.key ===
          'Escape'
        ) {
          setOpen(false);
        }
      };

    window.addEventListener(
      'mousedown',
      handlePointer
    );
    window.addEventListener(
      'keydown',
      handleKey
    );

    const timer =
      window.setTimeout(
        () =>
          searchRef.current
            ?.focus(),
        0
      );

    return () => {
      window.clearTimeout(
        timer
      );
      window.removeEventListener(
        'mousedown',
        handlePointer
      );
      window.removeEventListener(
        'keydown',
        handleKey
      );
    };
  }, [
    open,
  ]);

  const visibleFonts =
    useMemo(
      () => {
        const keyword =
          search
            .trim()
            .toLowerCase();

        return fontOptions.filter(
          (font) => {
            if (
              group !==
                'Tất cả' &&
              font.group !==
                group
            ) {
              return false;
            }

            if (!keyword) {
              return true;
            }

            return (
              font.label
                .toLowerCase()
                .includes(
                  keyword
                ) ||
              font.group
                .toLowerCase()
                .includes(
                  keyword
                )
            );
          }
        );
      },
      [
        search,
        group,
        fontOptions,
      ]
    );

  const recentOptions =
    recent
      .map(
        (recentValue) =>
          fontOptions.find(
            (font) =>
              font.value ===
              recentValue
          )
      )
      .filter(
        Boolean
      ) as
      FontOption[];

  const selectFont = (
    font:
      FontOption
  ) => {
    onChange(
      font.value
    );

    const nextRecent = [
      font.value,
      ...recent.filter(
        (item) =>
          item !==
          font.value
      ),
    ].slice(
      0,
      5
    );

    setRecent(
      nextRecent
    );

    try {
      window.localStorage.setItem(
        RECENT_FONT_KEY,
        JSON.stringify(
          nextRecent
        )
      );
    } catch {
      // localStorage can be unavailable in private/locked contexts.
    }

    setOpen(false);
    setSearch('');
  };

  return (
    <div
      ref={
        rootRef
      }
      className="relative z-[85]"
    >
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) =>
              !current
          )
        }
        className={[
          'flex min-w-[165px] max-w-[260px] items-center gap-2 rounded-[9px] border px-3 py-2 text-left transition',
          open
            ? 'border-[#cf5068]/35 bg-[#fff7f9]'
            : 'border-black/9 bg-white hover:border-[#cf5068]/25',
        ].join(' ')}
        title="Chọn font nhanh"
      >
        <span className="text-[9px] font-black text-black/30">
          Aa
        </span>

        <span
          style={{
            fontFamily:
              value,
          }}
          className="min-w-0 flex-1 truncate text-[13px] text-black/70"
        >
          {getFontName(
            value
          )}
        </span>

        <span className="text-[8px] text-black/25">
          {open
            ? '▲'
            : '▼'}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-[120] mt-2 w-[min(620px,calc(100vw-32px))] overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
          <div className="border-b border-black/6 p-3">
            <div className="flex items-center gap-2">
              <input
                ref={
                  searchRef
                }
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
                placeholder="Tìm font: serif, viết tay, Playfair..."
                className="min-w-0 flex-1 rounded-[9px] border border-black/9 bg-[#faf9f8] px-3 py-2.5 text-[10px] outline-none focus:border-[#cf5068]/35"
              />

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                className="rounded-[9px] border border-black/8 px-3 py-2.5 text-[9px] font-black text-black/35"
              >
                Đóng
              </button>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {([
                'Tất cả',
                'Hiện đại',
                'Thanh lịch',
                'Viết tay',
                'Bo tròn',
                'Khác',
              ] as const).map(
                (
                  item
                ) => (
                  <button
                    key={
                      item
                    }
                    type="button"
                    onClick={() =>
                      setGroup(
                        item
                      )
                    }
                    className={[
                      'rounded-full px-2.5 py-1.5 text-[8px] font-black transition',
                      group ===
                      item
                        ? 'bg-[#f7e9ed] text-[#a73551]'
                        : 'bg-[#f6f4f3] text-black/35 hover:text-black/60',
                    ].join(' ')}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="max-h-[430px] overflow-y-auto p-3">
            {recentOptions.length >
              0 &&
              !search &&
              group ===
                'Tất cả' && (
              <div className="mb-4">
                <p className="mb-2 text-[8px] font-black uppercase tracking-[0.12em] text-black/25">
                  Dùng gần đây
                </p>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {recentOptions.map(
                    (font) => (
                      <FontCard
                        key={`recent-${font.value}`}
                        font={
                          font
                        }
                        active={
                          font.value ===
                          value
                        }
                        previewText={
                          previewText
                        }
                        onClick={() =>
                          selectFont(
                            font
                          )
                        }
                      />
                    )
                  )}
                </div>
              </div>
            )}

            <p className="mb-2 text-[8px] font-black uppercase tracking-[0.12em] text-black/25">
              {visibleFonts.length}{' '}
              font
            </p>

            {visibleFonts.length >
            0 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {visibleFonts.map(
                  (font) => (
                    <FontCard
                      key={
                        font.value
                      }
                      font={
                        font
                      }
                      active={
                        font.value ===
                        value
                      }
                      previewText={
                        previewText
                      }
                      onClick={() =>
                        selectFont(
                          font
                        )
                      }
                    />
                  )
                )}
              </div>
            ) : (
              <div className="rounded-[12px] border border-dashed border-black/10 bg-[#faf9f8] px-4 py-10 text-center text-[9px] text-black/30">
                Không tìm thấy font.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const FontCard:
React.FC<{
  font:
    FontOption;
  active:
    boolean;
  previewText:
    string;
  onClick:
    () => void;
}> = ({
  font,
  active,
  previewText,
  onClick,
}) => (
  <button
    type="button"
    onClick={
      onClick
    }
    className={[
      'min-w-0 rounded-[11px] border p-3 text-left transition',
      active
        ? 'border-[#cf5068]/35 bg-[#fff2f5] shadow-[0_6px_18px_rgba(160,50,80,0.08)]'
        : 'border-black/7 bg-white hover:border-[#cf5068]/25 hover:bg-[#fffafb]',
    ].join(' ')}
  >
    <p
      style={{
        fontFamily:
          font.value,
      }}
      className="truncate text-[19px] leading-tight text-black/80"
    >
      {previewText ||
        'Dearly'}
    </p>

    <div className="mt-2 flex items-center justify-between gap-2">
      <span className="truncate text-[8px] font-black text-black/50">
        {font.label}
      </span>

      <span className="shrink-0 text-[7px] font-bold text-black/25">
        {active
          ? '✓ Đang dùng'
          : font.group}
      </span>
    </div>
  </button>
);
