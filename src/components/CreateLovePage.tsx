import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  CreditCard,
  Image as ImageIcon,
  Mail,
  Music2,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
} from 'lucide-react';

import { LoveConfig } from '../types';
import {
  getYouTubeThumbnailUrl,
  getYouTubeVideoId,
} from '../utils/youtube';

interface CreateLovePageProps {
  config: LoveConfig;
  onChange: (config: LoveConfig) => void;
  onBack: () => void;
  onReset: () => void;
  onCheckout: () => void;
}

type TabId =
  | 'basic'
  | 'memories'
  | 'music'
  | 'letter';

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
  onCheckout,
}) => {
  const [activeTab, setActiveTab] =
    useState<TabId>('basic');

  const [imageError, setImageError] =
    useState('');

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
    ],
    []
  );

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
    const photos = config.gifts.gift1.photos.map(
      (photo, photoIndex) =>
        photoIndex === index
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

          <button
            type="button"
            onClick={onCheckout}
            className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-600"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Thanh toán
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-7 sm:py-8">
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
                  updatePhoto={updatePhoto}
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
    </div>
  );
};

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
  updatePhoto: (
    index: number,
    patch: Partial<
      LoveConfig['gifts']['gift1']['photos'][number]
    >
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
  updatePhoto,
  uploadPhoto,
}) => (
  <div>
    <SectionHeader
      title="Ảnh kỷ niệm"
      description="Thay từng ảnh xuất hiện trong Polaroid Gallery."
    />

    <div className="mt-7 space-y-5">
      {config.gifts.gift1.photos.map(
        (photo, index) => (
          <div
            key={photo.id}
            className="grid gap-4 rounded-[22px] border border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-[150px_1fr]"
          >
            <div>
              <div className="aspect-square overflow-hidden rounded-2xl bg-white">
                <img
                  src={photo.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>

              <label className="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[11px] font-bold text-rose-500 shadow-sm">
                <Upload className="h-3.5 w-3.5" />
                Chọn ảnh
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) =>
                    uploadPhoto(
                      index,
                      event.target.files?.[0]
                    )
                  }
                />
              </label>
            </div>

            <div className="grid gap-3">
              <InputField
                label={`Ảnh ${index + 1} · URL`}
                value={photo.url}
                onChange={(value) =>
                  updatePhoto(index, {
                    url: value,
                  })
                }
              />

            </div>
          </div>
        )
      )}
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