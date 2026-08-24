import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  CreditCard,
  Image as ImageIcon,
  Mail,
  Music2,
  Plus,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  WandSparkles,
  Trash2,
  Upload,
  UserRound,
} from 'lucide-react';

import { LoveConfig } from '../types';
import {
  getYouTubeThumbnailUrl,
  getYouTubeVideoId,
} from '../utils/youtube';

import {
  DEFAULT_LOVE_TEMPLATE_ASSETS,
  TemplateAssetLibrary,
  getCustomerSelectableSlots,
  getEnabledAssetChoices,
  getSelectedAssetChoiceId,
} from '../templates/assets';

import {
  DEFAULT_LOVE_TEMPLATE_DESIGN,
} from '../templates/design';

import type {
  MemoryDisplayCaptions,
} from '../types';

import {
  getCachedTemplateConfigById,
  getRequiredPublicTemplateConfigById,
} from '../services/templateService';

interface CreateLovePageProps {
  config: LoveConfig;
  onChange: (config: LoveConfig) => void;
  onBack: () => void;
  onReset: () => void;
  onAddToCart: () => void;
  onCheckout: () => void;
}

type TabId =
  | 'basic'
  | 'memories'
  | 'music'
  | 'letter'
  | 'assets';

type MemoryPhoto =
  LoveConfig[
    'gifts'
  ][
    'gift1'
  ][
    'photos'
  ][number];

const TOTAL_MEMORY_PHOTOS =
  8;

const makeEmptyMemoryPhoto = (
  index: number
): MemoryPhoto => ({
  id:
    `memory-slot-${index + 1}`,
  url: '',
  caption: '',
});

const ensureEightMemoryPhotos = (
  photos:
    MemoryPhoto[]
) => {
  return Array.from(
    {
      length:
        TOTAL_MEMORY_PHOTOS,
    },
    (
      _,
      index
    ) =>
      photos[index] ||
      makeEmptyMemoryPhoto(
        index
      )
  );
};

const compressImage = (
  file: File,
  maxSize = 1200,
  quality = 0.82
): Promise<string> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const scale = Math.min(
        1,
        maxSize / Math.max(image.width, image.height)
      );

      const width = Math.max(
        1,
        Math.round(image.width * scale)
      );

      const height = Math.max(
        1,
        Math.round(image.height * scale)
      );

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');

      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Không thể xử lý ảnh.'));
        return;
      }

      context.drawImage(image, 0, 0, width, height);

      const dataUrl = canvas.toDataURL(
        'image/jpeg',
        quality
      );

      URL.revokeObjectURL(objectUrl);
      resolve(dataUrl);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Không thể đọc ảnh.'));
    };

    image.src = objectUrl;
  });

export const CreateLovePage: React.FC<
  CreateLovePageProps
> = ({
  config,
  onChange,
  onBack,
  onReset,
  onAddToCart,
  onCheckout,
}) => {
  const [activeTab, setActiveTab] =
    useState<TabId>('basic');

  const [imageError, setImageError] =
    useState('');

  const [
    assetLibrary,
    setAssetLibrary,
  ] =
    useState<TemplateAssetLibrary>(
      () =>
        getCachedTemplateConfigById(
          'love-01'
        )?.assets ||
        DEFAULT_LOVE_TEMPLATE_ASSETS
    );

  const [
    memoryCaptionDefaults,
    setMemoryCaptionDefaults,
  ] =
    useState<MemoryDisplayCaptions>(
      () =>
        getCachedTemplateConfigById(
          'love-01'
        )?.design
          .memories
          .captions ||
        DEFAULT_LOVE_TEMPLATE_DESIGN
          .memories
          .captions
    );

  useEffect(() => {
    let cancelled = false;
    let loading = false;

    const loadAssets =
      async () => {
        if (loading) {
          return;
        }

        loading = true;

        try {
          const template =
            await getRequiredPublicTemplateConfigById(
              'love-01'
            );

          if (!cancelled) {
            setAssetLibrary(
              template.assets
            );

            setMemoryCaptionDefaults(
              template.design
                .memories
                .captions
            );
          }
        } catch (
          error
        ) {
          console.warn(
            'Fresh template assets load failed:',
            error
          );
        } finally {
          loading = false;
        }
      };

    const handleFocus =
      () => {
        void loadAssets();
      };

    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          'visible'
        ) {
          void loadAssets();
        }
      };

    void loadAssets();

    window.addEventListener(
      'focus',
      handleFocus
    );

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    return () => {
      cancelled = true;

      window.removeEventListener(
        'focus',
        handleFocus
      );

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
    };
  }, []);

  const selectableAssetSlots =
    useMemo(
      () =>
        getCustomerSelectableSlots(
          assetLibrary
        ),
      [assetLibrary]
    );

  const tabs = useMemo(
    () => [
      {
        id: 'basic' as const,
        label: 'Thông tin',
        icon: UserRound,
      },
      {
        id: 'memories' as const,
        label: 'Ảnh kỷ niệm',
        icon: ImageIcon,
      },
      {
        id: 'music' as const,
        label: 'Âm nhạc',
        icon: Music2,
      },
      {
        id: 'letter' as const,
        label: 'Bức thư',
        icon: Mail,
      },
      {
        id: 'assets' as const,
        label: 'GIF & hình',
        icon: WandSparkles,
      },
    ],
    []
  );

  const updateAssetSelection = (
    slotId: string,
    assetId: string
  ) => {
    onChange({
      ...config,
      assetSelections: {
        ...(
          config.assetSelections ||
          {}
        ),
        [slotId]:
          assetId,
      },
    });
  };

  const updateMemoryCaption = (
    key:
      keyof MemoryDisplayCaptions,
    value: string
  ) => {
    onChange({
      ...config,
      gifts: {
        ...config.gifts,
        gift1: {
          ...config.gifts.gift1,
          displayCaptions: {
            ...memoryCaptionDefaults,
            ...(
              config.gifts
                .gift1
                .displayCaptions ||
              {}
            ),
            [key]:
              value,
          },
        },
      },
    });
  };

  const updateCouple = (
    patch: Partial<LoveConfig['couple']>
  ) => {
    onChange({
      ...config,
      couple: {
        ...config.couple,
        ...patch,
      },
    });
  };

  const updateProposal = (
    patch: Partial<LoveConfig['proposal']>
  ) => {
    onChange({
      ...config,
      proposal: {
        ...config.proposal,
        ...patch,
      },
    });
  };

  const updatePhoto = (
    index: number,
    patch: Partial<
      LoveConfig['gifts']['gift1']['photos'][number]
    >
  ) => {
    const photos =
      ensureEightMemoryPhotos(
        config.gifts
          .gift1.photos
      ).map(
        (
          photo,
          photoIndex
        ) =>
          photoIndex ===
          index
            ? {
                ...photo,
                ...patch,
              }
            : photo
      );

    onChange({
      ...config,
      gifts: {
        ...config.gifts,
        gift1: {
          ...config.gifts.gift1,
          photos,
        },
      },
    });
  };

  const updateTrack = (
    index: number,
    patch: Partial<
      LoveConfig['gifts']['gift2']['playlist'][number]
    >
  ) => {
    const playlist =
      config.gifts.gift2.playlist.map(
        (track, trackIndex) =>
          trackIndex === index
            ? {
                ...track,
                ...patch,
              }
            : track
      );

    onChange({
      ...config,
      gifts: {
        ...config.gifts,
        gift2: {
          ...config.gifts.gift2,
          playlist,
        },
      },
    });
  };

  const updateLetter = (
    patch: Partial<
      LoveConfig['gifts']['gift3']['letter']
    >
  ) => {
    onChange({
      ...config,
      gifts: {
        ...config.gifts,
        gift3: {
          ...config.gifts.gift3,
          letter: {
            ...config.gifts.gift3.letter,
            ...patch,
          },
        },
      },
    });
  };

  const uploadPhoto = async (
    index: number,
    file?: File
  ) => {
    if (!file) {
      return;
    }

    setImageError('');

    try {
      const dataUrl = await compressImage(file);
      updatePhoto(index, {
        url: dataUrl,
      });
    } catch {
      setImageError(
        'Ảnh này không đọc được. Thử ảnh JPG/PNG khác.'
      );
    }
  };

  const uploadCover = async (
    index: number,
    file?: File
  ) => {
    if (!file) {
      return;
    }

    setImageError('');

    try {
      const dataUrl = await compressImage(
        file,
        900,
        0.8
      );

      updateTrack(index, {
        coverUrl: dataUrl,
      });
    } catch {
      setImageError(
        'Ảnh bìa này không đọc được. Thử ảnh JPG/PNG khác.'
      );
    }
  };

  const updateParagraph = (
    index: number,
    value: string
  ) => {
    const paragraphs = [
      ...config.gifts.gift3.letter.paragraphs,
    ];

    paragraphs[index] = value;

    updateLetter({
      paragraphs,
    });
  };

  const addParagraph = () => {
    updateLetter({
      paragraphs: [
        ...config.gifts.gift3.letter.paragraphs,
        '',
      ],
    });
  };

  const removeParagraph = (
    index: number
  ) => {
    if (
      config.gifts.gift3.letter.paragraphs
        .length <= 1
    ) {
      return;
    }

    updateLetter({
      paragraphs:
        config.gifts.gift3.letter.paragraphs.filter(
          (_, paragraphIndex) =>
            paragraphIndex !== index
        ),
    });
  };

  return (
    <div className="min-h-[100svh] bg-[#fff9fb] text-slate-800">
      <header className="sticky top-0 z-50 border-b border-rose-100 bg-[#fff9fb]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-4 sm:px-7">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-rose-500"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">
              Love Story 01
            </span>
          </button>

          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-400">
              Personalize
            </p>

            <p className="text-sm font-bold text-slate-900">
              Tạo món quà của bạn
            </p>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={onAddToCart}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-4 py-2.5 text-xs font-bold text-rose-500 transition hover:bg-rose-50"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Thêm vào giỏ
            </button>

            <button
              type="button"
              onClick={onCheckout}
              className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-600"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Thanh toán
            </button>
          </div>

          <div className="w-8 sm:hidden" />
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-3 pb-24 pt-5 sm:px-7 sm:py-8">
        <div className="mb-6 rounded-[24px] border border-rose-100 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
              <Sparkles className="h-4 w-4" />
            </span>

            <div>
              <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                Cá nhân hóa Love Story 01
              </h1>

              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                Điền đầy đủ nội dung món quà bên dưới.
                Bản nháp được tự lưu trên trình duyệt này.
                Preview chỉ được mở sau khi thanh toán được xác nhận.
              </p>
            </div>
          </div>
        </div>

        {imageError && (
          <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
            {imageError}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[210px_minmax(0,1fr)]">
          <aside>
            <div className="sticky top-[92px] flex gap-2 overflow-x-auto rounded-[22px] border border-rose-100 bg-white p-2 shadow-sm xl:flex-col">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active =
                  activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setActiveTab(tab.id)
                    }
                    className={[
                      'inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-left text-xs font-bold transition xl:w-full',
                      active
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-100'
                        : 'text-slate-500 hover:bg-rose-50 hover:text-rose-500',
                    ].join(' ')}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="min-w-0">
            <motion.div
              key={activeTab}
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="rounded-[26px] border border-rose-100 bg-white p-5 shadow-sm sm:p-7"
            >
              {activeTab === 'basic' && (
                <BasicSection
                  config={config}
                  updateCouple={updateCouple}
                  updateProposal={updateProposal}
                />
              )}

              {activeTab === 'memories' && (
                <MemoriesSection
                  config={config}
                  captionDefaults={
                    memoryCaptionDefaults
                  }
                  updatePhoto={updatePhoto}
                  updateMemoryCaption={
                    updateMemoryCaption
                  }
                  uploadPhoto={uploadPhoto}
                />
              )}

              {activeTab === 'music' && (
                <MusicSection
                  config={config}
                  updateTrack={updateTrack}
                  uploadCover={uploadCover}
                />
              )}

              {activeTab === 'letter' && (
                <LetterSection
                  config={config}
                  updateLetter={updateLetter}
                  updateParagraph={updateParagraph}
                  addParagraph={addParagraph}
                  removeParagraph={removeParagraph}
                />
              )}

              {activeTab === 'assets' && (
                <AssetSelectionSection
                  config={config}
                  slots={
                    selectableAssetSlots
                  }
                  onSelect={
                    updateAssetSelection
                  }
                />
              )}
            </motion.div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-500 transition hover:border-rose-200 hover:text-rose-500"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Khôi phục mẫu gốc
              </button>

              <div className="flex flex-col items-stretch gap-2 sm:items-end">
                <button
                  type="button"
                  onClick={onCheckout}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:-translate-y-0.5 hover:bg-rose-600"
                >
                  <CreditCard className="h-4 w-4" />
                  Tiếp tục thanh toán
                </button>

                <p className="text-center text-[10px] font-medium text-slate-400 sm:text-right">
                  Preview mở sau khi thanh toán thành công.
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-rose-100 bg-white/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onAddToCart}
            className="inline-flex items-center justify-center gap-1.5 rounded-[14px] border border-rose-200 bg-white px-3 py-3 text-xs font-bold text-rose-500"
          >
            <ShoppingBag className="h-4 w-4" />
            Thêm vào giỏ
          </button>

          <button
            type="button"
            onClick={onCheckout}
            className="inline-flex items-center justify-center gap-1.5 rounded-[14px] bg-rose-500 px-3 py-3 text-xs font-bold text-white shadow-lg shadow-rose-100"
          >
            <CreditCard className="h-4 w-4" />
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

interface AssetSelectionSectionProps {
  config: LoveConfig;
  slots: ReturnType<
    typeof getCustomerSelectableSlots
  >;
  onSelect: (
    slotId: string,
    assetId: string
  ) => void;
}

const AssetSelectionSection:
React.FC<
  AssetSelectionSectionProps
> = ({
  config,
  slots,
  onSelect,
}) => (
  <div>
    <SectionHeader
      title="Chọn GIF & hình"
      description="Chỉ những lựa chọn được Dearly mở trong mẫu gốc mới xuất hiện ở đây."
    />

    {slots.length === 0 ? (
      <div className="mt-7 rounded-[20px] border border-dashed border-rose-200 bg-rose-50/50 px-5 py-9 text-center">
        <WandSparkles className="mx-auto h-5 w-5 text-rose-300" />

        <p className="mt-3 text-sm font-bold text-slate-700">
          Mẫu này chưa mở lựa chọn asset
        </p>

        <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
          Các GIF và hình mặc định vẫn được dùng bình thường.
        </p>
      </div>
    ) : (
      <div className="mt-7 grid gap-7">
        {slots.map(
          (slot) => {
            const choices =
              getEnabledAssetChoices(
                slot
              );

            const selectedId =
              getSelectedAssetChoiceId(
                slot,
                config.assetSelections
              );

            return (
              <section
                key={
                  slot.id
                }
              >
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    {
                      slot.label
                    }
                  </h3>

                  <p className="mt-1 text-[11px] leading-5 text-slate-400">
                    {
                      slot.description
                    }
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {choices.map(
                    (
                      choice
                    ) => {
                      const selected =
                        selectedId ===
                        choice.id;

                      return (
                        <button
                          key={
                            choice.id
                          }
                          type="button"
                          onClick={() =>
                            onSelect(
                              slot.id,
                              choice.id
                            )
                          }
                          className={[
                            'overflow-hidden rounded-[18px] border bg-white p-2 text-left transition',
                            selected
                              ? 'border-rose-400 shadow-[0_0_0_2px_rgba(251,113,133,0.16)]'
                              : 'border-slate-100 hover:border-rose-200',
                          ].join(' ')}
                        >
                          <div className="aspect-square overflow-hidden rounded-[13px] bg-rose-50">
                            <img
                              src={
                                choice.url
                              }
                              alt={
                                choice.label
                              }
                              className="h-full w-full object-contain"
                            />
                          </div>

                          <div className="flex items-center justify-between gap-2 px-1 pb-1 pt-2">
                            <span className="truncate text-[11px] font-bold text-slate-600">
                              {
                                choice.label
                              }
                            </span>

                            {selected && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                            )}
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </section>
            );
          }
        )}
      </div>
    )}
  </div>
);

interface BasicSectionProps {
  config: LoveConfig;
  updateCouple: (
    patch: Partial<LoveConfig['couple']>
  ) => void;
  updateProposal: (
    patch: Partial<LoveConfig['proposal']>
  ) => void;
}

const BasicSection: React.FC<
  BasicSectionProps
> = ({
  config,
  updateCouple,
  updateProposal,
}) => (
  <div>
    <SectionHeader
      title="Thông tin cơ bản"
      description="Những nội dung xuất hiện ở phần mở đầu và xuyên suốt món quà."
    />

    <div className="mt-7 grid gap-4 sm:grid-cols-2">
      <InputField
        label="Tên người gửi"
        value={config.couple.senderName}
        onChange={(value) =>
          updateCouple({
            senderName: value,
          })
        }
        placeholder="VD: Anh nè"
      />

      <InputField
        label="Tên người nhận"
        value={config.couple.receiverName}
        onChange={(value) =>
          updateCouple({
            receiverName: value,
          })
        }
        placeholder="VD: Em bé của anh"
      />

      <InputField
        label="Biệt danh"
        value={config.couple.nickname ?? ''}
        onChange={(value) =>
          updateCouple({
            nickname: value,
          })
        }
        placeholder="VD: Công chúa nhỏ"
      />

      <InputField
        label="Ngày đặc biệt"
        value={
          config.couple.anniversaryDate ?? ''
        }
        onChange={(value) =>
          updateCouple({
            anniversaryDate: value,
          })
        }
        placeholder="VD: 14/02"
      />
    </div>

    <div className="my-7 h-px bg-slate-100" />

    <div className="grid gap-4">
      <InputField
        label="Câu hỏi YES / NO"
        value={config.proposal.question}
        onChange={(value) =>
          updateProposal({
            question: value,
          })
        }
        placeholder="Do you love me? ❤️"
      />

      <InputField
        label="Nội dung nút YES"
        value={config.proposal.yesBtnText}
        onChange={(value) =>
          updateProposal({
            yesBtnText: value,
          })
        }
        placeholder="YES! Yêu nhiều lắmmm 💕"
      />
    </div>
  </div>
);

interface MemoriesSectionProps {
  config: LoveConfig;

  captionDefaults:
    MemoryDisplayCaptions;

  updatePhoto: (
    index: number,
    patch: Partial<
      LoveConfig['gifts']['gift1']['photos'][number]
    >
  ) => void;

  updateMemoryCaption: (
    key:
      keyof MemoryDisplayCaptions,
    value: string
  ) => void;

  uploadPhoto: (
    index: number,
    file?: File
  ) => void;
}

const MemoriesSection: React.FC<
  MemoriesSectionProps
> = ({
  config,
  captionDefaults,
  updatePhoto,
  updateMemoryCaption,
  uploadPhoto,
}) => {
  const captionKeys:
    Array<
      keyof
        MemoryDisplayCaptions
    > = [
      'leftTop',
      'leftBottom',
      'rightTop',
      'rightBottom',
    ];

  const captionLabels = [
    'Chữ dưới ảnh trái trên',
    'Chữ dưới ảnh trái dưới',
    'Chữ dưới ảnh phải trên',
    'Chữ dưới ảnh phải dưới',
  ];

  const displayCaptions = {
    ...captionDefaults,
    ...(
      config.gifts
        .gift1
        .displayCaptions ||
      {}
    ),
  };

  const photos =
    ensureEightMemoryPhotos(
      config.gifts
        .gift1.photos
    );

  return (
    <div>
      <SectionHeader
        title="Ảnh kỷ niệm"
        description="4 ảnh chính nằm ngoài và 4 ảnh phụ chỉ dùng cho collage giữa. Một ảnh chỉ xuất hiện đúng một vị trí."
      />

      <div className="mt-7">
        <MemoryPhotoGroupTitle
          title="4 ảnh chính"
          description="Hiển thị thành 4 Polaroid lớn bên ngoài. Bạn có thể sửa cả ảnh và dòng chữ bên dưới."
        />

        <div className="mt-4 space-y-4">
          {photos
            .slice(
              0,
              4
            )
            .map(
              (
                photo,
                index
              ) => (
                <MemoryPhotoEditor
                  key={
                    photo.id
                  }
                  photo={
                    photo
                  }
                  index={
                    index
                  }
                  label={
                    `Ảnh chính ${index + 1}`
                  }
                  onUpload={
                    uploadPhoto
                  }
                  onUrlChange={(
                    value
                  ) =>
                    updatePhoto(
                      index,
                      {
                        url:
                          value,
                      }
                    )
                  }
                >
                  <InputField
                    label={
                      captionLabels[
                        index
                      ]
                    }
                    value={
                      displayCaptions[
                        captionKeys[
                          index
                        ]
                      ]
                    }
                    onChange={(
                      value
                    ) =>
                      updateMemoryCaption(
                        captionKeys[
                          index
                        ],
                        value
                      )
                    }
                    placeholder="Nhập chữ hiển thị dưới ảnh"
                  />
                </MemoryPhotoEditor>
              )
            )}
        </div>

        <div className="my-8 h-px bg-slate-100" />

        <MemoryPhotoGroupTitle
          title="4 ảnh phụ cho collage giữa"
          description="Bốn ảnh này chỉ xuất hiện trong 2 dãy ảnh chéo ở giữa. Không có caption và không bị lấy lại từ 4 ảnh chính."
        />

        <div className="mt-4 space-y-4">
          {photos
            .slice(
              4,
              8
            )
            .map(
              (
                photo,
                localIndex
              ) => {
                const index =
                  localIndex +
                  4;

                return (
                  <MemoryPhotoEditor
                    key={
                      photo.id
                    }
                    photo={
                      photo
                    }
                    index={
                      index
                    }
                    label={
                      `Ảnh collage ${localIndex + 1}`
                    }
                    onUpload={
                      uploadPhoto
                    }
                    onUrlChange={(
                      value
                    ) =>
                      updatePhoto(
                        index,
                        {
                          url:
                            value,
                        }
                      )
                    }
                  >
                    <p className="rounded-xl bg-white px-3 py-2.5 text-[10px] leading-5 text-slate-400">
                      Chỉ dùng cho dãy ảnh giữa · không có chữ bên dưới.
                    </p>
                  </MemoryPhotoEditor>
                );
              }
            )}
        </div>
      </div>
    </div>
  );
};

const MemoryPhotoGroupTitle:
React.FC<{
  title: string;
  description: string;
}> = ({
  title,
  description,
}) => (
  <div>
    <p className="text-sm font-bold text-slate-900">
      {title}
    </p>

    <p className="mt-1 text-[11px] leading-5 text-slate-400">
      {description}
    </p>
  </div>
);

const MemoryPhotoEditor:
React.FC<{
  photo:
    MemoryPhoto;
  index: number;
  label: string;
  onUpload: (
    index: number,
    file?: File
  ) => void;
  onUrlChange: (
    value: string
  ) => void;
  children:
    React.ReactNode;
}> = ({
  photo,
  index,
  label,
  onUpload,
  onUrlChange,
  children,
}) => (
  <div className="grid gap-4 rounded-[22px] border border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-[150px_minmax(0,1fr)]">
    <div>
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-white">
        {photo.url ? (
          <img
            src={
              photo.url
            }
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-rose-50/50 px-3 text-center">
            <ImageIcon className="h-5 w-5 text-rose-200" />

            <span className="mt-2 text-[10px] font-bold text-rose-300">
              Chưa chọn ảnh
            </span>
          </div>
        )}
      </div>

      <label className="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[11px] font-bold text-rose-500 shadow-sm">
        <Upload className="h-3.5 w-3.5" />
        Chọn ảnh

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(
            event
          ) =>
            onUpload(
              index,
              event.target
                .files?.[0]
            )
          }
        />
      </label>
    </div>

    <div className="grid content-start gap-3">
      <div>
        <p className="text-xs font-bold text-slate-700">
          {label}
        </p>

        <p className="mt-1 text-[10px] text-slate-400">
          Vị trí cố định trong gallery
        </p>
      </div>

      <InputField
        label="URL ảnh"
        value={
          photo.url
        }
        onChange={
          onUrlChange
        }
        placeholder="Dán URL hoặc chọn ảnh ở bên trái"
      />

      {children}
    </div>
  </div>
);

interface MusicSectionProps {
  config: LoveConfig;
  updateTrack: (
    index: number,
    patch: Partial<
      LoveConfig['gifts']['gift2']['playlist'][number]
    >
  ) => void;
  uploadCover: (
    index: number,
    file?: File
  ) => void;
}

const MusicSection: React.FC<
  MusicSectionProps
> = ({
  config,
  updateTrack,
  uploadCover,
}) => (
  <div>
    <SectionHeader
      title="Playlist riêng"
      description="Dán link video YouTube cho từng bài. Ảnh thumbnail sẽ được lấy tự động; Audio URL chỉ là phương án dự phòng."
    />

    <div className="mt-7 space-y-5">
      {config.gifts.gift2.playlist.map(
        (track, index) => (
          <div
            key={track.id}
            className="grid gap-4 rounded-[22px] border border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-[150px_1fr]"
          >
            <div>
              <div className="aspect-square overflow-hidden rounded-2xl bg-slate-900">
                <img
                  src={track.coverUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>

              <label className="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[11px] font-bold text-rose-500 shadow-sm">
                <Upload className="h-3.5 w-3.5" />
                Ảnh bìa
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) =>
                    uploadCover(
                      index,
                      event.target.files?.[0]
                    )
                  }
                />
              </label>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <InputField
                  label={`Bài ${index + 1}`}
                  value={track.title}
                  onChange={(value) =>
                    updateTrack(index, {
                      title: value,
                    })
                  }
                />

                <InputField
                  label="Ca sĩ"
                  value={track.artist}
                  onChange={(value) =>
                    updateTrack(index, {
                      artist: value,
                    })
                  }
                />
              </div>

              <InputField
                label="Ảnh bìa · URL"
                value={track.coverUrl}
                onChange={(value) =>
                  updateTrack(index, {
                    coverUrl: value,
                  })
                }
              />

              <InputField
                label="Video YouTube"
                value={
                  track.youtubeUrl ?? ''
                }
                onChange={(value) => {
                  const videoId =
                    getYouTubeVideoId(
                      value
                    );

                  const thumbnail =
                    getYouTubeThumbnailUrl(
                      value
                    );

                  updateTrack(index, {
                    youtubeUrl: value,
                    ...(videoId &&
                    thumbnail
                      ? {
                          coverUrl:
                            thumbnail,
                        }
                      : {}),
                  });
                }}
                placeholder="https://www.youtube.com/watch?v=..."
              />

              {track.youtubeUrl &&
                !getYouTubeVideoId(
                  track.youtubeUrl
                ) && (
                <p className="text-[11px] font-semibold leading-5 text-red-500">
                  Link YouTube chưa đúng. Hãy dán link video YouTube, YouTube Music hoặc youtu.be.
                </p>
              )}

              <InputField
                label="Audio URL · không bắt buộc"
                value={track.audioUrl}
                onChange={(value) =>
                  updateTrack(index, {
                    audioUrl: value,
                  })
                }
                placeholder="https://...mp3"
              />

              <p className="text-[11px] leading-5 text-slate-400">
                Nếu có link YouTube hợp lệ, món quà sẽ ưu tiên hiển thị video YouTube. Không cần upload file nhạc.
              </p>
            </div>
          </div>
        )
      )}
    </div>
  </div>
);

interface LetterSectionProps {
  config: LoveConfig;
  updateLetter: (
    patch: Partial<
      LoveConfig['gifts']['gift3']['letter']
    >
  ) => void;
  updateParagraph: (
    index: number,
    value: string
  ) => void;
  addParagraph: () => void;
  removeParagraph: (
    index: number
  ) => void;
}

const LetterSection: React.FC<
  LetterSectionProps
> = ({
  config,
  updateLetter,
  updateParagraph,
  addParagraph,
  removeParagraph,
}) => {
  const letter =
    config.gifts.gift3.letter;

  return (
    <div>
      <SectionHeader
        title="Bức thư"
        description="Viết lời nhắn cuối cùng mà người nhận sẽ mở trong Gift 3."
      />

      <div className="mt-7 grid gap-4">
        <InputField
          label="Lời chào"
          value={letter.salutation}
          onChange={(value) =>
            updateLetter({
              salutation: value,
            })
          }
        />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">
              Nội dung thư
            </label>

            <button
              type="button"
              onClick={addParagraph}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm đoạn
            </button>
          </div>

          <div className="space-y-3">
            {letter.paragraphs.map(
              (paragraph, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Đoạn {index + 1}
                    </span>

                    {letter.paragraphs.length >
                      1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeParagraph(index)
                        }
                        className="text-slate-300 transition hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <textarea
                    value={paragraph}
                    onChange={(event) =>
                      updateParagraph(
                        index,
                        event.target.value
                      )
                    }
                    rows={4}
                    className="w-full resize-y bg-transparent text-sm leading-6 text-slate-700 outline-none"
                  />
                </div>
              )
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Lời kết"
            value={letter.closing}
            onChange={(value) =>
              updateLetter({
                closing: value,
              })
            }
          />

          <InputField
            label="Chữ ký"
            value={letter.signature}
            onChange={(value) =>
              updateLetter({
                signature: value,
              })
            }
          />
        </div>
      </div>
    </div>
  );
};

interface SectionHeaderProps {
  title: string;
  description: string;
}

const SectionHeader: React.FC<
  SectionHeaderProps
> = ({
  title,
  description,
}) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-400">
      Love Story 01
    </p>

    <h2 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-slate-900">
      {title}
    </h2>

    <p className="mt-2 text-sm leading-6 text-slate-500">
      {description}
    </p>
  </div>
);

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const InputField: React.FC<
  InputFieldProps
> = ({
  label,
  value,
  onChange,
  placeholder,
}) => (
  <div>
    <label className="mb-1.5 block text-xs font-bold text-slate-700">
      {label}
    </label>

    <input
      type="text"
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
    />
  </div>
);