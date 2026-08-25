import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Image as ImageIcon,
  Mail,
  Music2,
  Plus,
  Trash2,
  Upload,
  UserRound,
  WandSparkles,
} from 'lucide-react';

import type {
  LoveConfig,
  MemoryDisplayCaptions,
} from '../types';

import {
  getYouTubeThumbnailUrl,
  getYouTubeVideoId,
} from '../utils/youtube';

import {
  DEFAULT_LOVE_TEMPLATE_ASSETS,
  type TemplateAssetLibrary,
  getCustomerSelectableSlots,
  getEnabledAssetChoices,
  getSelectedAssetChoiceId,
} from '../templates/assets';

import {
  DEFAULT_LOVE_TEMPLATE_DESIGN,
} from '../templates/design';

import {
  getCachedTemplateConfigById,
  getRequiredPublicTemplateConfigById,
} from '../services/templateService';

import {
  PersonalizeInput,
  PersonalizePageShell,
  PersonalizeSectionHeader,
  PersonalizeTextarea,
  type PersonalizeTab,
} from './PersonalizePageShell';

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
  LoveConfig['gifts']['gift1']['photos'][number];

const TOTAL_MEMORY_PHOTOS = 8;

const makeEmptyMemoryPhoto = (
  index: number
): MemoryPhoto => ({
  id: `memory-slot-${index + 1}`,
  url: '',
  caption: '',
});

const ensureEightMemoryPhotos = (
  photos: MemoryPhoto[]
) =>
  Array.from(
    { length: TOTAL_MEMORY_PHOTOS },
    (_, index) =>
      photos[index] ||
      makeEmptyMemoryPhoto(index)
  );

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
        maxSize /
          Math.max(
            image.width,
            image.height
          )
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

      context.drawImage(
        image,
        0,
        0,
        width,
        height
      );

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

export const CreateLovePage:
React.FC<CreateLovePageProps> = ({
  config,
  onChange,
  onReset,
  onAddToCart,
  onCheckout,
}) => {
  const [activeTab, setActiveTab] =
    useState<TabId>('basic');
  const [imageError, setImageError] =
    useState('');
  const [assetLibrary, setAssetLibrary] =
    useState<TemplateAssetLibrary>(
      () =>
        getCachedTemplateConfigById('love-01')
          ?.assets ||
        DEFAULT_LOVE_TEMPLATE_ASSETS
    );
  const [
    memoryCaptionDefaults,
    setMemoryCaptionDefaults,
  ] = useState<MemoryDisplayCaptions>(
    () =>
      getCachedTemplateConfigById('love-01')
        ?.design.memories.captions ||
      DEFAULT_LOVE_TEMPLATE_DESIGN.memories
        .captions
  );

  useEffect(() => {
    let cancelled = false;

    const loadTemplate = async () => {
      try {
        const template =
          await getRequiredPublicTemplateConfigById(
            'love-01'
          );

        if (!cancelled) {
          setAssetLibrary(template.assets);
          setMemoryCaptionDefaults(
            template.design.memories.captions
          );
        }
      } catch (error) {
        console.warn(
          'Fresh template assets load failed:',
          error
        );
      }
    };

    void loadTemplate();
    const handleFocus = () => void loadTemplate();
    window.addEventListener('focus', handleFocus);

    return () => {
      cancelled = true;
      window.removeEventListener(
        'focus',
        handleFocus
      );
    };
  }, []);

  const selectableAssetSlots = useMemo(
    () =>
      getCustomerSelectableSlots(assetLibrary),
    [assetLibrary]
  );

  const tabs = useMemo<PersonalizeTab[]>(
    () => {
      const items: PersonalizeTab[] = [
        {
          id: 'basic',
          label: 'Thông tin',
          icon: UserRound,
        },
        {
          id: 'memories',
          label: 'Ảnh',
          icon: ImageIcon,
        },
        {
          id: 'music',
          label: 'Âm nhạc',
          icon: Music2,
        },
        {
          id: 'letter',
          label: 'Bức thư',
          icon: Mail,
        },
      ];

      if (selectableAssetSlots.length > 0) {
        items.push({
          id: 'assets',
          label: 'GIF & hình',
          icon: WandSparkles,
        });
      }

      return items;
    },
    [selectableAssetSlots.length]
  );

  useEffect(() => {
    if (
      activeTab === 'assets' &&
      selectableAssetSlots.length === 0
    ) {
      setActiveTab('basic');
    }
  }, [activeTab, selectableAssetSlots.length]);

  const updateCouple = (
    patch: Partial<LoveConfig['couple']>
  ) =>
    onChange({
      ...config,
      couple: {
        ...config.couple,
        ...patch,
      },
    });

  const updateProposal = (
    patch: Partial<LoveConfig['proposal']>
  ) =>
    onChange({
      ...config,
      proposal: {
        ...config.proposal,
        ...patch,
      },
    });

  const updatePhoto = (
    index: number,
    patch: Partial<MemoryPhoto>
  ) => {
    const photos = ensureEightMemoryPhotos(
      config.gifts.gift1.photos
    ).map((photo, photoIndex) =>
      photoIndex === index
        ? { ...photo, ...patch }
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

  const updateMemoryCaption = (
    key: keyof MemoryDisplayCaptions,
    value: string
  ) =>
    onChange({
      ...config,
      gifts: {
        ...config.gifts,
        gift1: {
          ...config.gifts.gift1,
          displayCaptions: {
            ...memoryCaptionDefaults,
            ...(config.gifts.gift1
              .displayCaptions || {}),
            [key]: value,
          },
        },
      },
    });

  const uploadPhoto = async (
    index: number,
    file?: File
  ) => {
    if (!file) return;
    setImageError('');

    try {
      updatePhoto(index, {
        url: await compressImage(file),
      });
    } catch {
      setImageError(
        'Ảnh này không đọc được. Thử ảnh JPG/PNG khác.'
      );
    }
  };

  const updateTrack = (
    index: number,
    patch: Partial<
      LoveConfig['gifts']['gift2']['playlist'][number]
    >
  ) =>
    onChange({
      ...config,
      gifts: {
        ...config.gifts,
        gift2: {
          ...config.gifts.gift2,
          playlist:
            config.gifts.gift2.playlist.map(
              (track, trackIndex) =>
                trackIndex === index
                  ? { ...track, ...patch }
                  : track
            ),
        },
      },
    });

  const uploadCover = async (
    index: number,
    file?: File
  ) => {
    if (!file) return;
    setImageError('');

    try {
      updateTrack(index, {
        coverUrl: await compressImage(
          file,
          900,
          0.8
        ),
      });
    } catch {
      setImageError(
        'Ảnh bìa này không đọc được.'
      );
    }
  };

  const updateLetter = (
    patch: Partial<
      LoveConfig['gifts']['gift3']['letter']
    >
  ) =>
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

  const updateParagraph = (
    index: number,
    value: string
  ) => {
    const paragraphs = [
      ...config.gifts.gift3.letter.paragraphs,
    ];
    paragraphs[index] = value;
    updateLetter({ paragraphs });
  };

  const addParagraph = () =>
    updateLetter({
      paragraphs: [
        ...config.gifts.gift3.letter.paragraphs,
        '',
      ],
    });

  const removeParagraph = (index: number) => {
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

  const updateAssetSelection = (
    slotId: string,
    assetId: string
  ) =>
    onChange({
      ...config,
      assetSelections: {
        ...(config.assetSelections || {}),
        [slotId]: assetId,
      },
    });

  return (
    <PersonalizePageShell
      title="Love Story 01"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tabId) =>
        setActiveTab(tabId as TabId)
      }
      error={imageError}
      primaryAction={{
        label: 'Tiếp tục thanh toán',
        onClick: onCheckout,
      }}
      secondaryActions={[
        {
          label: 'Thêm vào giỏ',
          onClick: onAddToCart,
        },
        {
          label: 'Khôi phục',
          onClick: onReset,
        },
      ]}
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
          captionDefaults={memoryCaptionDefaults}
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
        <AssetSection
          config={config}
          slots={selectableAssetSlots}
          onSelect={updateAssetSelection}
        />
      )}
    </PersonalizePageShell>
  );
};

const BasicSection:
React.FC<{
  config: LoveConfig;
  updateCouple: (
    patch: Partial<LoveConfig['couple']>
  ) => void;
  updateProposal: (
    patch: Partial<LoveConfig['proposal']>
  ) => void;
}> = ({
  config,
  updateCouple,
  updateProposal,
}) => (
  <div>
    <PersonalizeSectionHeader
      title="Thông tin chính"
    />

    <div className="grid gap-4 sm:grid-cols-2">
      <PersonalizeInput
        label="Tên người gửi"
        value={config.couple.senderName}
        onChange={(senderName) =>
          updateCouple({ senderName })
        }
        placeholder="VD: Dương"
      />

      <PersonalizeInput
        label="Tên người nhận"
        value={config.couple.receiverName}
        onChange={(receiverName) =>
          updateCouple({ receiverName })
        }
        placeholder="VD: Linh"
      />
    </div>

    <div className="my-5 h-px bg-black/[0.06]" />

    <div className="grid gap-4">
      <PersonalizeInput
        label="Câu hỏi"
        value={config.proposal.question}
        onChange={(question) =>
          updateProposal({ question })
        }
        placeholder="Em có yêu anh không?"
      />

      <PersonalizeInput
        label="Nút đồng ý"
        value={config.proposal.yesBtnText}
        onChange={(yesBtnText) =>
          updateProposal({ yesBtnText })
        }
        placeholder="Có 💕"
      />
    </div>
  </div>
);

const MemoriesSection:
React.FC<{
  config: LoveConfig;
  captionDefaults: MemoryDisplayCaptions;
  updateMemoryCaption: (
    key: keyof MemoryDisplayCaptions,
    value: string
  ) => void;
  uploadPhoto: (
    index: number,
    file?: File
  ) => void;
}> = ({
  config,
  captionDefaults,
  updateMemoryCaption,
  uploadPhoto,
}) => {
  const photos = ensureEightMemoryPhotos(
    config.gifts.gift1.photos
  );
  const captionKeys: Array<
    keyof MemoryDisplayCaptions
  > = [
    'leftTop',
    'leftBottom',
    'rightTop',
    'rightBottom',
  ];
  const captions = {
    ...captionDefaults,
    ...(config.gifts.gift1.displayCaptions || {}),
  };

  return (
    <div>
      <PersonalizeSectionHeader
        title="Ảnh kỷ niệm"
        hint="8 ảnh · 4 ảnh đầu có thêm caption."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="rounded-[15px] border border-black/[0.07] bg-[#faf9f8] p-3"
          >
            <div className="aspect-square overflow-hidden rounded-[11px] bg-white">
              {photo.url ? (
                <img
                  src={photo.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs font-bold text-black/25">
                  Ảnh {index + 1}
                </div>
              )}
            </div>

            <label className="mt-2 flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border border-black/[0.07] bg-white px-3 text-[11px] font-black text-[#b83e57]">
              <Upload className="h-3.5 w-3.5" />
              Chọn ảnh
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) =>
                  void uploadPhoto(
                    index,
                    event.target.files?.[0]
                  )
                }
              />
            </label>

            {index < 4 && (
              <div className="mt-3">
                <PersonalizeInput
                  label="Caption"
                  value={captions[captionKeys[index]]}
                  onChange={(value) =>
                    updateMemoryCaption(
                      captionKeys[index],
                      value
                    )
                  }
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const MusicSection:
React.FC<{
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
}> = ({
  config,
  updateTrack,
  uploadCover,
}) => (
  <div>
    <PersonalizeSectionHeader
      title="Âm nhạc"
      hint="Dán link YouTube. Thumbnail được lấy tự động."
    />

    <div className="space-y-3">
      {config.gifts.gift2.playlist.map(
        (track, index) => (
          <div
            key={track.id}
            className="grid gap-4 rounded-[15px] border border-black/[0.07] bg-[#faf9f8] p-3 sm:grid-cols-[100px_minmax(0,1fr)]"
          >
            <div>
              <div className="aspect-square overflow-hidden rounded-[11px] bg-white">
                {track.coverUrl ? (
                  <img
                    src={track.coverUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <label className="mt-2 flex min-h-9 cursor-pointer items-center justify-center rounded-[9px] bg-white px-2 text-[10px] font-bold text-[#b83e57]">
                Đổi ảnh bìa
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) =>
                    void uploadCover(
                      index,
                      event.target.files?.[0]
                    )
                  }
                />
              </label>
            </div>

            <div className="flex flex-col justify-center">
              <PersonalizeInput
                label={`Link YouTube (bài ${index + 1})`}
                value={track.youtubeUrl ?? ''}
                placeholder="https://youtu.be/..."
                onChange={(youtubeUrl) => {
                  const thumbnail =
                    getYouTubeThumbnailUrl(
                      youtubeUrl
                    );
                  updateTrack(index, {
                    youtubeUrl,
                    ...(getYouTubeVideoId(
                      youtubeUrl
                    ) && thumbnail
                      ? { coverUrl: thumbnail }
                      : {}),
                  });
                }}
              />
              {track.youtubeUrl &&
                !getYouTubeVideoId(
                  track.youtubeUrl
                ) && (
                <p className="mt-1.5 text-[11px] font-semibold text-red-500">
                  Link YouTube chưa đúng.
                </p>
              )}
            </div>
          </div>
        )
      )}
    </div>
  </div>
);

const LetterSection:
React.FC<{
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
  removeParagraph: (index: number) => void;
}> = ({
  config,
  updateLetter,
  updateParagraph,
  addParagraph,
  removeParagraph,
}) => {
  const letter = config.gifts.gift3.letter;

  return (
    <div>
      <PersonalizeSectionHeader title="Bức thư" />

      <div className="grid gap-4">
        <PersonalizeInput
          label="Lời chào"
          value={letter.salutation}
          onChange={(salutation) =>
            updateLetter({ salutation })
          }
        />

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-bold text-black/58">
              Nội dung thư
            </p>
            <button
              type="button"
              onClick={addParagraph}
              className="inline-flex min-h-9 items-center gap-1 rounded-[9px] px-2 text-[11px] font-black text-[#b83e57]"
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
                  className="relative"
                >
                  <PersonalizeTextarea
                    label={`Đoạn ${index + 1}`}
                    value={paragraph}
                    onChange={(value) =>
                      updateParagraph(
                        index,
                        value
                      )
                    }
                  />

                  {letter.paragraphs.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeParagraph(index)
                      }
                      className="absolute right-2 top-0 flex h-8 w-8 items-center justify-center rounded-full text-black/25 hover:bg-red-50 hover:text-red-500"
                      aria-label={`Xóa đoạn ${index + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <PersonalizeInput
            label="Lời kết"
            value={letter.closing}
            onChange={(closing) =>
              updateLetter({ closing })
            }
          />
          <PersonalizeInput
            label="Chữ ký"
            value={letter.signature}
            onChange={(signature) =>
              updateLetter({ signature })
            }
          />
        </div>
      </div>
    </div>
  );
};

const AssetSection:
React.FC<{
  config: LoveConfig;
  slots: ReturnType<
    typeof getCustomerSelectableSlots
  >;
  onSelect: (
    slotId: string,
    assetId: string
  ) => void;
}> = ({
  config,
  slots,
  onSelect,
}) => (
  <div>
    <PersonalizeSectionHeader
      title="GIF & hình"
    />

    {slots.length === 0 ? (
      <div className="rounded-[14px] border border-dashed border-black/10 bg-[#faf9f8] p-8 text-center text-xs text-black/35">
        Mẫu này không có hình để thay.
      </div>
    ) : (
      <div className="space-y-6">
        {slots.map((slot) => {
          const choices =
            getEnabledAssetChoices(slot);
          const selectedId =
            getSelectedAssetChoiceId(
              slot,
              config.assetSelections
            );

          return (
            <div key={slot.id}>
              <p className="mb-2 text-xs font-black text-black/60">
                {slot.label}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {choices.map((choice) => {
                  const selected =
                    selectedId === choice.id;

                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() =>
                        onSelect(
                          slot.id,
                          choice.id
                        )
                      }
                      className={[
                        'overflow-hidden rounded-[13px] border bg-white p-2 text-left transition',
                        selected
                          ? 'border-[#c9435d] ring-2 ring-[#c9435d]/10'
                          : 'border-black/[0.07]',
                      ].join(' ')}
                    >
                      <div className="aspect-square overflow-hidden rounded-[9px] bg-[#faf9f8]">
                        <img
                          src={choice.url}
                          alt={choice.label}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <p className="mt-2 truncate px-1 text-[10px] font-bold text-black/50">
                        {choice.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);
