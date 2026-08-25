import React, {
  useEffect,
  useState,
} from 'react';

import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  Trash2,
} from 'lucide-react';

import {
  AdminOrderRecord,
  AdminSession,
  confirmAdminBankPayment,
  deleteAdminOrder,
  getAdminOrderById,
  getAdminSession,
  loginAdminWithGoogle,
  logoutAdmin,
  markAdminOrderPaid,
  setAdminGiftPublished,
} from '../../services/adminService';

import {
  formatDateTime,
  formatVnd,
  getGiftLabel,
  getOrderCode,
  getPaymentLabel,
  isPaidOrder,
} from './adminUi';

interface Props {
  giftId: string;
  onBack: () => void;
  onBackHome: () => void;
}

const EMPTY_SESSION:
AdminSession = {
  uid: '',
  email: '',
  displayName: '',
  photoURL: '',
  isSignedIn: false,
  isGoogleUser: false,
  isAdmin: false,
};

const getErrorMessage = (
  error: any
) => {
  const code =
    error?.code || '';

  if (
    code ===
    'auth/popup-closed-by-user'
  ) {
    return 'Bạn đã đóng cửa sổ đăng nhập Google.';
  }

  if (
    code ===
      'permission-denied' ||
    code ===
      'firestore/permission-denied'
  ) {
    return 'Firestore đang chặn quyền Admin.';
  }

  return (
    error?.message ||
    'Có lỗi xảy ra.'
  );
};

export const AdminOrderDetailPage:
React.FC<Props> = ({
  giftId,
  onBack,
  onBackHome,
}) => {
  const [
    session,
    setSession,
  ] =
    useState<AdminSession>(
      EMPTY_SESSION
    );

  const [
    order,
    setOrder,
  ] =
    useState<
      AdminOrderRecord |
      null
    >(null);

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    action,
    setAction,
  ] =
    useState<
      | ''
      | 'confirm'
      | 'paid'
      | 'publish'
      | 'unpublish'
      | 'delete'
    >('');

  const [
    error,
    setError,
  ] =
    useState('');

  const [
    copied,
    setCopied,
  ] =
    useState(false);

  const loadPage =
    async () => {
      setIsLoading(true);
      setError('');

      try {
        const nextSession =
          await getAdminSession();

        setSession(
          nextSession
        );

        if (
          !nextSession
            .isAdmin
        ) {
          setOrder(null);
          return;
        }

        setOrder(
          await getAdminOrderById(
            giftId
          )
        );
      } catch (
        loadError: any
      ) {
        setError(
          getErrorMessage(
            loadError
          )
        );
      } finally {
        setIsLoading(
          false
        );
      }
    };

  const refreshOrder =
    async () => {
      setOrder(
        await getAdminOrderById(
          giftId
        )
      );
    };

  useEffect(() => {
    void loadPage();
  }, [giftId]);

  const runAction =
    async (
      name:
        typeof action,
      callback:
        () =>
          Promise<void>
    ) => {
      setAction(name);
      setError('');

      try {
        await callback();
        await refreshOrder();
      } catch (
        actionError: any
      ) {
        setError(
          getErrorMessage(
            actionError
          )
        );
      } finally {
        setAction('');
      }
    };

  const copyGiftLink =
    async () => {
      if (!order) {
        return;
      }

      try {
        await navigator
          .clipboard
          .writeText(
            `${window.location.origin}/gift/${order.id}`
          );

        setCopied(true);

        window.setTimeout(
          () =>
            setCopied(
              false
            ),
          1600
        );
      } catch {
        setError(
          'Không thể tự copy link.'
        );
      }
    };

  const handleDelete =
    async () => {
      if (!order) {
        return;
      }

      if (
        !window.confirm(
          `Xóa vĩnh viễn ${getOrderCode(order)}?`
        )
      ) {
        return;
      }

      setAction(
        'delete'
      );

      try {
        await deleteAdminOrder(
          order.id
        );

        onBack();
      } catch (
        deleteError: any
      ) {
        setError(
          getErrorMessage(
            deleteError
          )
        );

        setAction('');
      }
    };

  if (isLoading) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#f6f5f3]">
        <Loader2 className="h-6 w-6 animate-spin text-[#b83e57]" />
      </main>
    );
  }

  if (
    !session
      .isGoogleUser
  ) {
    return (
      <AccessCard
        title="Đăng nhập Admin"
        description="Đăng nhập Google để xem đơn hàng."
        buttonLabel="Đăng nhập với Google"
        error={
          error
        }
        onAction={() =>
          void loginAdminWithGoogle()
            .then(
              loadPage
            )
        }
        onBackHome={
          onBackHome
        }
      />
    );
  }

  if (
    !session.isAdmin
  ) {
    return (
      <AccessCard
        title="Gmail chưa có quyền Admin"
        description={
          session.email
        }
        buttonLabel="Đổi Gmail"
        error={
          error
        }
        onAction={() =>
          void logoutAdmin()
            .then(
              () =>
                loginAdminWithGoogle()
            )
            .then(
              loadPage
            )
        }
        onBackHome={
          onBackHome
        }
      />
    );
  }

  if (!order) {
    return (
      <main className="min-h-[100svh] bg-[#f6f5f3] px-4 py-10">
        <div className="mx-auto max-w-md rounded-[18px] border border-black/8 bg-white p-7 text-center">
          <h1 className="text-xl font-black">
            Không tìm thấy đơn
          </h1>

          <button
            type="button"
            onClick={
              onBack
            }
            className="mt-5 rounded-[10px] bg-[#191919] px-4 py-3 text-xs font-bold text-white"
          >
            Về danh sách đơn
          </button>
        </div>
      </main>
    );
  }

  const paid =
    isPaidOrder(order);

  const published =
    order.status ===
    'published';

  const code =
    getOrderCode(order);

  const config =
    order.config;

  const giftUrl =
    `/gift/${order.id}`;

  return (
    <div className="min-h-[100svh] bg-[#f6f5f3] text-[#191919]">
      <header className="sticky top-0 z-40 border-b border-black/8 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[62px] max-w-[1200px] items-center justify-between gap-3 px-3 sm:px-6">
          <button
            type="button"
            onClick={
              onBack
            }
            className="inline-flex items-center gap-2 text-xs font-bold text-black/45 hover:text-[#b83e57]"
          >
            <ArrowLeft className="h-4 w-4" />

            <span className="hidden sm:inline">
              Danh sách đơn
            </span>
          </button>

          <p className="font-mono text-sm font-black text-[#b83e57]">
            {code}
          </p>

          <button
            type="button"
            onClick={() =>
              void refreshOrder()
            }
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/8 text-black/40"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-3 py-5 sm:px-6 sm:py-7">
        <section className="rounded-[18px] border border-black/8 bg-white p-5">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusPill
                  label={
                    getPaymentLabel(
                      order
                    )
                  }
                  tone={
                    paid
                      ? 'green'
                      : order
                          .paymentStatus ===
                        'waiting_bank_transfer'
                        ? 'amber'
                        : 'gray'
                  }
                />

                <StatusPill
                  label={
                    getGiftLabel(
                      order
                    )
                  }
                  tone={
                    published
                      ? 'green'
                      : 'gray'
                  }
                />
              </div>

              <h1 className="mt-4 text-2xl font-black tracking-[-0.04em]">
                {order.customer
                  ?.fullName ||
                  'Chưa có tên khách'}
              </h1>

              <p className="mt-1 text-sm text-black/45">
                {order.customer
                  ?.phone ||
                  'Chưa có SĐT'}
                {' · '}
                {order.customer
                  ?.email ||
                  'Chưa có email'}
              </p>
            </div>

            <div className="lg:text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/30">
                Tổng đơn
              </p>

              <p className="mt-1 text-2xl font-black">
                {typeof order.price ===
                'number'
                  ? formatVnd(
                      order.price
                    )
                  : '—'}
              </p>

              <p className="mt-1 text-[10px] text-black/35">
                {formatDateTime(
                  order.createdAtMs
                )}
              </p>
            </div>
          </div>

          <div className="mt-5 border-t border-black/7 pt-4">
            <div className="flex flex-wrap gap-2">
              {!paid &&
              order.paymentStatus ===
                'waiting_bank_transfer' && (
                <PrimaryAction
                  label="Xác nhận CK & Publish"
                  loading={
                    action ===
                    'confirm'
                  }
                  disabled={
                    action !== ''
                  }
                  onClick={() =>
                    void runAction(
                      'confirm',
                      () =>
                        confirmAdminBankPayment(
                          order.id
                        )
                    )
                  }
                />
              )}

              {!paid &&
              order.paymentStatus !==
                'waiting_bank_transfer' && (
                <PrimaryAction
                  label="Đánh dấu đã thanh toán"
                  loading={
                    action ===
                    'paid'
                  }
                  disabled={
                    action !== ''
                  }
                  onClick={() =>
                    void runAction(
                      'paid',
                      () =>
                        markAdminOrderPaid(
                          order.id
                        )
                    )
                  }
                />
              )}

              {paid &&
              !published && (
                <PrimaryAction
                  label="Publish gift"
                  loading={
                    action ===
                    'publish'
                  }
                  disabled={
                    action !== ''
                  }
                  onClick={() =>
                    void runAction(
                      'publish',
                      () =>
                        setAdminGiftPublished(
                          order.id,
                          true
                        )
                    )
                  }
                />
              )}

              {published && (
                <a
                  href={
                    giftUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#191919] px-4 py-2.5 text-xs font-bold text-white"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Mở gift
                </a>
              )}

              <button
                type="button"
                onClick={() =>
                  void copyGiftLink()
                }
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-black/10 bg-white px-3.5 py-2.5 text-xs font-bold text-black/50"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}

                {copied
                  ? 'Đã copy'
                  : 'Copy link'}
              </button>

              {published && (
                <button
                  type="button"
                  disabled={
                    action !== ''
                  }
                  onClick={() =>
                    void runAction(
                      'unpublish',
                      () =>
                        setAdminGiftPublished(
                          order.id,
                          false
                        )
                    )
                  }
                  className="rounded-[10px] border border-black/10 px-3.5 py-2.5 text-xs font-bold text-black/40"
                >
                  Unpublish
                </button>
              )}
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-4 rounded-[12px] bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        <div className="mt-4 grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
          <section className="rounded-[18px] border border-black/8 bg-white p-5">
            <h2 className="text-sm font-black">
              Thông tin đơn
            </h2>

            <div className="mt-4">
              <DetailRow
                label="Mã đơn"
                value={
                  code
                }
              />

              <DetailRow
                label="Template"
                value={
                  order.templateId ||
                  'love-01'
                }
              />

              <DetailRow
                label="Người gửi"
                value={
                  order.senderName ||
                  '—'
                }
              />

              <DetailRow
                label="Người nhận"
                value={
                  order.receiverName ||
                  '—'
                }
              />

              <DetailRow
                label="Nội dung CK"
                value={
                  order.paymentReference ||
                  code
                }
              />

              <DetailRow
                label="Gift ID"
                value={
                  order.id
                }
                mono
              />

              <DetailRow
                label="Đã thanh toán lúc"
                value={
                  formatDateTime(
                    order.paidAtMs
                  )
                }
              />
            </div>

            <button
              type="button"
              disabled={
                action !== ''
              }
              onClick={() =>
                void handleDelete()
              }
              className="mt-6 inline-flex items-center gap-1.5 text-[10px] font-bold text-red-500"
            >
              {action ===
              'delete' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}

              Xóa đơn
            </button>
          </section>

          <section className="space-y-3">
            {Array.isArray(config?.scenes) && config.scenes.length > 0 ? (
              <>
                <ContentDetails
                  title={`Visual Editor Scenes (${config.scenes.length})`}
                  open
                >
                  <div className="space-y-4">
                    {config.scenes.map((scene: any, sIdx: number) => {
                      const elements = Array.isArray(scene.elements) ? scene.elements : [];
                      return (
                        <div
                          key={scene.id || sIdx}
                          className="rounded-[12px] border border-black/8 bg-[#faf9f8] p-3.5"
                        >
                          <div className="flex items-center justify-between border-b border-black/6 pb-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-black/30">
                                Scene {sIdx + 1}
                              </span>
                              <h3 className="text-xs font-bold text-black/80">
                                {scene.name || `Scene ${sIdx + 1}`}
                              </h3>
                            </div>
                            <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-black/50 border border-black/6">
                              {elements.length} elements
                            </span>
                          </div>

                          <div className="mt-3 space-y-2">
                            {elements.map((el: any, eIdx: number) => (
                              <div
                                key={el.id || eIdx}
                                className="flex items-start gap-2.5 rounded-[8px] bg-white p-2.5 text-xs border border-black/4"
                              >
                                <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-rose-600">
                                  {el.type}
                                </span>
                                <div className="min-w-0 flex-1">
                                  {el.type === 'text' && (
                                    <p className="line-clamp-2 text-xs text-black/70">
                                      {el.content || '—'}
                                    </p>
                                  )}
                                  {el.type === 'image' && (
                                    <div className="flex items-center gap-2">
                                      {el.src ? (
                                        <img
                                          src={el.src}
                                          alt=""
                                          className="h-10 w-10 rounded object-cover border border-black/8"
                                        />
                                      ) : (
                                        <span className="text-[10px] text-black/30">Không có ảnh</span>
                                      )}
                                      <span className="truncate text-[10px] text-black/40">
                                        {el.alt || 'Image element'}
                                      </span>
                                    </div>
                                  )}
                                  {el.type === 'button' && (
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="font-semibold text-black/80">
                                        {el.label || 'Nút bấm'}
                                      </span>
                                      {el.action && (
                                        <span className="text-[10px] text-black/40">
                                          → {el.action.type}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {el.type !== 'text' && el.type !== 'image' && el.type !== 'button' && (
                                    <p className="text-[11px] text-black/60">
                                      {JSON.stringify(el)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ContentDetails>

                {config.audio?.url && (
                  <ContentDetails title="Nhạc nền" open>
                    <DetailRow label="Audio URL" value={config.audio.url} />
                    {config.audio.title && (
                      <DetailRow label="Tên bài hát" value={config.audio.title} />
                    )}
                  </ContentDetails>
                )}
              </>
            ) : (
              <>
                <ContentDetails
                  title="Nội dung cơ bản"
                  open
                >
                  <DetailRow
                    label="Câu hỏi"
                    value={
                      config?.proposal?.question || '—'
                    }
                  />

                  <DetailRow
                    label="Nút YES"
                    value={
                      config?.proposal?.yesBtnText || '—'
                    }
                  />

                  <DetailRow
                    label="Biệt danh"
                    value={
                      config?.couple?.nickname ||
                      '—'
                    }
                  />
                </ContentDetails>

                {config?.gifts?.gift1?.photos && (
                  <ContentDetails
                    title={`Ảnh kỷ niệm (${config.gifts.gift1.photos.length || 0})`}
                  >
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {(config.gifts.gift1.photos || []).map(
                        (
                          photo: any,
                          index: number
                        ) => (
                          <div
                            key={
                              photo?.id ||
                              index
                            }
                            className="overflow-hidden rounded-[10px] bg-[#f4f1f1]"
                          >
                            {photo?.url ? (
                              <img
                                src={
                                  photo.url
                                }
                                alt=""
                                className="aspect-square w-full object-cover"
                              />
                            ) : (
                              <div className="flex aspect-square items-center justify-center text-[10px] text-black/25">
                                Trống
                              </div>
                            )}

                            <p className="px-2 py-1.5 text-[9px] font-bold text-black/35">
                              Ảnh{' '}
                              {index +
                                1}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </ContentDetails>
                )}

                {config?.gifts?.gift2?.playlist && (
                  <ContentDetails
                    title={`Playlist (${config.gifts.gift2.playlist.length || 0})`}
                  >
                    <div className="divide-y divide-black/6">
                      {(config.gifts.gift2.playlist || []).map(
                        (
                          track: any,
                          index: number
                        ) => (
                          <div
                            key={
                              track?.id ||
                              index
                            }
                            className="py-3 first:pt-0 last:pb-0"
                          >
                            <p className="text-xs font-bold">
                              {track?.title ||
                                `Bài ${index + 1}`}
                            </p>

                            <p className="mt-1 text-[10px] text-black/35">
                              {track?.artist ||
                                '—'}
                            </p>

                            {track?.youtubeUrl && (
                              <p className="mt-1 truncate text-[9px] text-black/25">
                                {track.youtubeUrl}
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </ContentDetails>
                )}

                {config?.gifts?.gift3?.letter && (
                  <ContentDetails
                    title="Bức thư"
                  >
                    <p className="text-xs font-bold text-[#b83e57]">
                      {
                        config.gifts.gift3.letter.salutation || '—'
                      }
                    </p>

                    <div className="mt-3 space-y-2">
                      {(config.gifts.gift3.letter.paragraphs || []).map(
                        (
                          paragraph: string,
                          index: number
                        ) => (
                          <p
                            key={
                              index
                            }
                            className="text-xs leading-5 text-black/55"
                          >
                            {paragraph}
                          </p>
                        )
                      )}
                    </div>
                  </ContentDetails>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

const AccessCard:
React.FC<{
  title: string;
  description: string;
  buttonLabel: string;
  error: string;
  onAction: () => void;
  onBackHome: () => void;
}> = ({
  title,
  description,
  buttonLabel,
  error,
  onAction,
  onBackHome,
}) => (
  <main className="min-h-[100svh] bg-[#f6f5f3] px-4 py-10">
    <div className="mx-auto max-w-md rounded-[18px] border border-black/8 bg-white p-7">
      <button
        type="button"
        onClick={
          onBackHome
        }
        className="text-xs font-bold text-black/40"
      >
        ← Về trang chủ
      </button>

      <h1 className="mt-7 text-2xl font-black">
        {title}
      </h1>

      <p className="mt-2 text-sm text-black/45">
        {description}
      </p>

      {error && (
        <p className="mt-4 text-xs font-semibold text-red-500">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={
          onAction
        }
        className="mt-6 w-full rounded-[12px] bg-[#191919] px-4 py-3 text-sm font-bold text-white"
      >
        {buttonLabel}
      </button>
    </div>
  </main>
);

const PrimaryAction:
React.FC<{
  label: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}> = ({
  label,
  loading,
  disabled,
  onClick,
}) => (
  <button
    type="button"
    disabled={
      disabled
    }
    onClick={
      onClick
    }
    className="inline-flex items-center gap-2 rounded-[10px] bg-[#b83e57] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
  >
    {loading && (
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
    )}

    {label}
  </button>
);

const StatusPill:
React.FC<{
  label: string;
  tone:
    | 'green'
    | 'amber'
    | 'gray';
}> = ({
  label,
  tone,
}) => (
  <span
    className={[
      'rounded-full px-2.5 py-1 text-[9px] font-bold',
      tone ===
      'green'
        ? 'bg-emerald-50 text-emerald-700'
        : tone ===
            'amber'
          ? 'bg-amber-50 text-amber-700'
          : 'bg-slate-100 text-slate-500',
    ].join(' ')}
  >
    {label}
  </span>
);

const DetailRow:
React.FC<{
  label: string;
  value: string;
  mono?: boolean;
}> = ({
  label,
  value,
  mono = false,
}) => (
  <div className="border-b border-black/6 py-3 last:border-b-0">
    <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-black/28">
      {label}
    </p>

    <p
      className={[
        'mt-1 break-words text-xs font-semibold leading-5 text-black/62',
        mono
          ? 'font-mono'
          : '',
      ].join(' ')}
    >
      {value}
    </p>
  </div>
);

const ContentDetails:
React.FC<{
  title: string;
  open?: boolean;
  children:
    React.ReactNode;
}> = ({
  title,
  open = false,
  children,
}) => (
  <details
    open={open}
    className="group rounded-[18px] border border-black/8 bg-white"
  >
    <summary className="cursor-pointer list-none px-5 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black">
          {title}
        </h2>

        <span className="text-lg text-black/25 transition group-open:rotate-45">
          +
        </span>
      </div>
    </summary>

    <div className="border-t border-black/6 px-5 py-4">
      {children}
    </div>
  </details>
);
