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
    useState<
      | ''
      | 'gift'
      | 'reference'
      | 'phone'
    >('');

  const loadPage =
    async () => {
      setIsLoading(
        true
      );
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
          setOrder(
            null
          );
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
      setError('');

      try {
        setOrder(
          await getAdminOrderById(
            giftId
          )
        );
      } catch (
        refreshError: any
      ) {
        setError(
          getErrorMessage(
            refreshError
          )
        );
      }
    };

  useEffect(() => {
    void loadPage();
  }, [
    giftId,
  ]);

  const runAction =
    async (
      name:
        typeof action,
      callback:
        () =>
          Promise<void>
    ) => {
      setAction(
        name
      );
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

  const copyText =
    async (
      key:
        | 'gift'
        | 'reference'
        | 'phone',
      value: string
    ) => {
      try {
        await navigator.clipboard.writeText(
          value
        );

        setCopied(
          key
        );

        window.setTimeout(
          () =>
            setCopied(
              ''
            ),
          1600
        );
      } catch {
        setError(
          'Không thể tự copy.'
        );
      }
    };

  const handleDelete =
    async () => {
      if (!order) {
        return;
      }

      const warning =
        isPaidOrder(
          order
        )
          ? '\n\nĐơn này ĐÃ THANH TOÁN.'
          : order.status ===
              'published'
            ? '\n\nGift này đang được publish.'
            : '';

      if (
        !window.confirm(
          `Xóa vĩnh viễn ${getOrderCode(order)}?${warning}\n\nHành động này không thể hoàn tác.`
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
            className="mt-5 min-h-11 rounded-[10px] bg-[#191919] px-4 text-xs font-bold text-white"
          >
            Về danh sách đơn
          </button>
        </div>
      </main>
    );
  }

  const paid =
    isPaidOrder(
      order
    );

  const published =
    order.status ===
    'published' ||
    order.isPublished ===
      true;

  const waiting =
    order.paymentStatus ===
    'waiting_bank_transfer';

  const code =
    getOrderCode(
      order
    );

  const config =
    order.config as any;

  const giftUrl =
    `${window.location.origin}/gift/${order.id}`;

  const paymentReference =
    order.paymentReference ||
    code;

  const needsAction =
    waiting &&
    !paid;

  return (
    <div className="min-h-[100svh] bg-[#f6f5f3] pb-24 text-[#191919] sm:pb-8">
      <header className="sticky top-0 z-40 border-b border-black/8 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto grid min-h-[64px] max-w-[1240px] grid-cols-[44px_minmax(0,1fr)_44px] items-center px-3 sm:grid-cols-[1fr_auto_1fr] sm:px-6">
          <button
            type="button"
            onClick={
              onBack
            }
            className="inline-flex min-h-10 items-center gap-2 text-xs font-bold text-black/45 hover:text-[#b83e57]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">
              Danh sách đơn
            </span>
          </button>

          <div className="min-w-0 text-center">
            <p className="font-mono text-sm font-black text-[#b83e57]">
              {code}
            </p>
            <p className="mt-0.5 hidden text-[9px] text-black/30 sm:block">
              Chi tiết đơn hàng
            </p>
          </div>

          <button
            type="button"
            disabled={
              action !== ''
            }
            onClick={() =>
              void refreshOrder()
            }
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-black/8 bg-white text-black/40 transition hover:text-[#b83e57] disabled:opacity-40"
            title="Làm mới đơn"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-3 py-4 sm:px-6 sm:py-6">
        {needsAction && (
          <section className="mb-4 overflow-hidden rounded-[18px] border border-amber-200 bg-amber-50 shadow-[0_10px_30px_rgba(180,120,20,0.08)]">
            <div className="p-4 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:p-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-800">
                    Cần xử lý
                  </p>
                </div>

                <h1 className="mt-2 text-xl font-black tracking-[-0.03em] text-amber-950">
                  Khách đang chờ xác nhận chuyển khoản
                </h1>

                <p className="mt-1 text-xs leading-5 text-amber-900/65">
                  Kiểm tra tiền vào tài khoản. Chỉ bấm xác nhận khi giao dịch đã khớp.
                </p>
              </div>

              <PrimaryAction
                label="Xác nhận CK & Publish"
                loading={
                  action ===
                  'confirm'
                }
                disabled={
                  action !== ''
                }
                prominent
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
            </div>
          </section>
        )}

        {error && (
          <div className="mb-4 rounded-[13px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <section className="rounded-[19px] border border-black/8 bg-white p-4 sm:p-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill
                  label={
                    getPaymentLabel(
                      order
                    )
                  }
                  tone={
                    paid
                      ? 'green'
                      : waiting
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

                <span className="rounded-full bg-black/[0.035] px-2.5 py-1 text-[9px] font-bold text-black/35">
                  {order.templateId ||
                    'love-01'}
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                {order.customer
                  ?.fullName ||
                  'Chưa có tên khách'}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-black/45">
                <span>
                  {order.customer
                    ?.phone ||
                    'Chưa có SĐT'}
                </span>

                {order.customer
                  ?.phone && (
                  <button
                    type="button"
                    onClick={() =>
                      void copyText(
                        'phone',
                        order.customer!
                          .phone
                      )
                    }
                    className="font-bold text-[#b83e57]"
                  >
                    {copied ===
                    'phone'
                      ? 'Đã copy'
                      : 'Copy SĐT'}
                  </button>
                )}

                <span className="hidden sm:inline">
                  ·
                </span>

                <span className="break-all">
                  {order.customer
                    ?.email ||
                    'Chưa có email'}
                </span>
              </div>
            </div>

            <div className="rounded-[15px] bg-[#faf9f8] p-4 lg:text-right">
              <p className="text-[9px] font-black uppercase tracking-[0.1em] text-black/30">
                Tổng đơn
              </p>

              <p className="mt-1 text-2xl font-black tracking-[-0.04em]">
                {typeof order.price ===
                'number'
                  ? formatVnd(
                      order.price
                    )
                  : '—'}
              </p>

              <p className="mt-1 text-[10px] leading-5 text-black/35">
                {formatDateTime(
                  order.createdAtMs
                )}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-2 border-t border-black/7 pt-4 sm:grid-cols-2 lg:grid-cols-4">
            {!paid &&
            !waiting && (
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
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[11px] bg-[#191919] px-4 text-xs font-black text-white"
              >
                <ExternalLink className="h-4 w-4" />
                Mở gift
              </a>
            )}

            <button
              type="button"
              onClick={() =>
                void copyText(
                  'gift',
                  giftUrl
                )
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[11px] border border-black/10 bg-white px-4 text-xs font-bold text-black/55"
            >
              {copied ===
              'gift' ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ===
              'gift'
                ? 'Đã copy link'
                : 'Copy link gift'}
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
                className="min-h-11 rounded-[11px] border border-black/10 bg-white px-4 text-xs font-bold text-black/45 disabled:opacity-40"
              >
                {action ===
                'unpublish'
                  ? 'Đang unpublish...'
                  : 'Unpublish'}
              </button>
            )}
          </div>
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <section className="rounded-[18px] border border-black/8 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-black">
                  Thanh toán & đối soát
                </h2>

                <StatusPill
                  label={
                    paid
                      ? 'Đã trả'
                      : waiting
                        ? 'Đang chờ'
                        : 'Chưa trả'
                  }
                  tone={
                    paid
                      ? 'green'
                      : waiting
                        ? 'amber'
                        : 'gray'
                  }
                />
              </div>

              <div className="mt-3">
                <CopyDetailRow
                  label="Nội dung CK"
                  value={
                    paymentReference
                  }
                  copied={
                    copied ===
                    'reference'
                  }
                  onCopy={() =>
                    void copyText(
                      'reference',
                      paymentReference
                    )
                  }
                />

                <DetailRow
                  label="Đã thanh toán lúc"
                  value={
                    order.paidAtMs
                      ? formatDateTime(
                          order.paidAtMs
                        )
                      : 'Chưa xác nhận'
                  }
                />

                <DetailRow
                  label="Phương thức"
                  value={
                    order.paymentMethod ===
                    'bank_transfer'
                      ? 'Chuyển khoản ngân hàng'
                      : order.paymentMethod ||
                        '—'
                  }
                />
              </div>
            </section>

            <section className="rounded-[18px] border border-black/8 bg-white p-4 sm:p-5">
              <h2 className="text-sm font-black">
                Thông tin gift
              </h2>

              <div className="mt-3">
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
                  label="Gift ID"
                  value={
                    order.id
                  }
                  mono
                />
              </div>
            </section>

            <section className="rounded-[18px] border border-red-100 bg-white p-4">
              <p className="text-xs font-black text-red-600">
                Khu vực nguy hiểm
              </p>

              <p className="mt-1 text-[10px] leading-5 text-black/35">
                Xóa đơn sẽ xóa dữ liệu gift và không thể hoàn tác.
              </p>

              <button
                type="button"
                disabled={
                  action !== ''
                }
                onClick={() =>
                  void handleDelete()
                }
                className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-[10px] border border-red-100 bg-red-50 px-3 text-[11px] font-black text-red-600 disabled:opacity-40"
              >
                {action ===
                'delete' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Xóa vĩnh viễn đơn
              </button>
            </section>
          </aside>

          <section className="min-w-0 space-y-3">
            <ContentDetails
              title="Nội dung khách đã đặt"
              subtitle={
                Array.isArray(
                  config?.scenes
                )
                  ? `${config.scenes.length} scene`
                  : 'Love template'
              }
              open
            >
              <OrderContentSummary
                config={
                  config
                }
              />
            </ContentDetails>

            <ContentDetails
              title="Dữ liệu kỹ thuật"
              subtitle="Chỉ mở khi cần kiểm tra lỗi"
            >
              <DetailRow
                label="Gift ID"
                value={
                  order.id
                }
                mono
              />

              <DetailRow
                label="Template ID"
                value={
                  order.templateId ||
                  'love-01'
                }
                mono
              />

              <DetailRow
                label="Payment status"
                value={
                  order.paymentStatus ||
                  'unpaid'
                }
                mono
              />

              <DetailRow
                label="Gift status"
                value={
                  order.status ||
                  'draft'
                }
                mono
              />

              <DetailRow
                label="Tạo lúc"
                value={
                  formatDateTime(
                    order.createdAtMs
                  )
                }
              />

              <DetailRow
                label="Cập nhật"
                value={
                  formatDateTime(
                    order.updatedAtMs
                  )
                }
              />
            </ContentDetails>
          </section>
        </div>
      </main>

      {needsAction && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-amber-200 bg-white/95 p-3 backdrop-blur-xl sm:hidden">
          <PrimaryAction
            label="Xác nhận CK & Publish"
            loading={
              action ===
              'confirm'
            }
            disabled={
              action !== ''
            }
            prominent
            fullWidth
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
        </div>
      )}
    </div>
  );
};

const OrderContentSummary:
React.FC<{
  config: any;
}> = ({
  config,
}) => {
  if (
    Array.isArray(
      config?.scenes
    )
  ) {
    return (
      <div className="space-y-3">
        {config.scenes.map(
          (
            scene: any,
            index: number
          ) => {
            const elements =
              Array.isArray(
                scene?.elements
              )
                ? scene.elements
                : [];

            const textElements =
              elements.filter(
                (element: any) =>
                  element?.type ===
                    'text' ||
                  element?.type ===
                    'button'
              );

            return (
              <div
                key={
                  scene?.id ||
                  index
                }
                className="rounded-[13px] border border-black/7 bg-[#faf9f8] p-3.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.09em] text-black/28">
                      Scene {index + 1}
                    </p>
                    <p className="mt-1 truncate text-xs font-black text-black/65">
                      {scene?.title ||
                        scene?.name ||
                        scene?.id ||
                        `Scene ${index + 1}`}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-black/35">
                    {
                      elements.length
                    }{' '}
                    element
                  </span>
                </div>

                {textElements.length >
                  0 && (
                  <div className="mt-3 space-y-2 border-t border-black/6 pt-3">
                    {textElements
                      .slice(
                        0,
                        6
                      )
                      .map(
                        (
                          element: any,
                          elementIndex: number
                        ) => (
                          <div
                            key={
                              element?.id ||
                              elementIndex
                            }
                            className="rounded-[10px] bg-white px-3 py-2.5"
                          >
                            <p className="text-[9px] font-bold uppercase text-black/25">
                              {element?.type ===
                              'button'
                                ? 'Nút'
                                : 'Chữ'}
                            </p>
                            <p className="mt-1 break-words text-xs font-semibold leading-5 text-black/60">
                              {element?.text ||
                                element?.label ||
                                '—'}
                            </p>
                          </div>
                        )
                      )}

                    {textElements.length >
                      6 && (
                      <p className="text-[10px] text-black/30">
                        +{' '}
                        {textElements.length -
                          6}{' '}
                        nội dung khác
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SummaryBlock
        title="Thông tin chính"
      >
        <DetailRow
          label="Câu hỏi"
          value={
            config?.proposal
              ?.question ||
            '—'
          }
        />

        <DetailRow
          label="Nút YES"
          value={
            config?.proposal
              ?.yesBtnText ||
            '—'
          }
        />

        <DetailRow
          label="Biệt danh"
          value={
            config?.couple
              ?.nickname ||
            '—'
          }
        />
      </SummaryBlock>

      <div className="grid gap-3 sm:grid-cols-3">
        <CountCard
          label="Ảnh"
          value={
            config?.gifts
              ?.gift1?.photos
              ?.length ||
            0
          }
        />
        <CountCard
          label="Bài hát"
          value={
            config?.gifts
              ?.gift2
              ?.playlist
              ?.length ||
            0
          }
        />
        <CountCard
          label="Đoạn thư"
          value={
            config?.gifts
              ?.gift3?.letter
              ?.paragraphs
              ?.length ||
            0
          }
        />
      </div>

      {config?.gifts
        ?.gift3?.letter && (
        <SummaryBlock
          title="Bức thư"
        >
          <p className="text-xs font-black text-[#b83e57]">
            {config.gifts
              .gift3.letter
              .salutation ||
              '—'}
          </p>

          <div className="mt-3 space-y-2">
            {(
              config.gifts
                .gift3.letter
                .paragraphs ||
              []
            ).map(
              (
                paragraph:
                  string,
                index:
                  number
              ) => (
                <p
                  key={
                    index
                  }
                  className="text-xs leading-5 text-black/55"
                >
                  {
                    paragraph
                  }
                </p>
              )
            )}
          </div>
        </SummaryBlock>
      )}
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
        className="min-h-10 text-xs font-bold text-black/40"
      >
        ← Về trang chủ
      </button>

      <h1 className="mt-6 text-2xl font-black">
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
        className="mt-6 min-h-12 w-full rounded-[12px] bg-[#191919] px-4 text-sm font-bold text-white"
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
  prominent?: boolean;
  fullWidth?: boolean;
  onClick: () => void;
}> = ({
  label,
  loading,
  disabled,
  prominent = false,
  fullWidth = false,
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
    className={[
      'inline-flex min-h-11 items-center justify-center gap-2 rounded-[11px] px-4 text-xs font-black text-white transition disabled:opacity-50',
      prominent
        ? 'bg-amber-600 shadow-[0_8px_20px_rgba(180,120,20,0.18)] hover:bg-amber-700'
        : 'bg-[#b83e57] hover:bg-[#a9344c]',
      fullWidth
        ? 'w-full'
        : '',
    ].join(' ')}
  >
    {loading && (
      <Loader2 className="h-4 w-4 animate-spin" />
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
      'rounded-full px-2.5 py-1 text-[9px] font-black',
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
    <p className="text-[9px] font-black uppercase tracking-[0.09em] text-black/28">
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

const CopyDetailRow:
React.FC<{
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}> = ({
  label,
  value,
  copied,
  onCopy,
}) => (
  <div className="flex items-center gap-3 border-b border-black/6 py-3">
    <div className="min-w-0 flex-1">
      <p className="text-[9px] font-black uppercase tracking-[0.09em] text-black/28">
        {label}
      </p>
      <p className="mt-1 break-all font-mono text-sm font-black text-[#b83e57]">
        {value}
      </p>
    </div>

    <button
      type="button"
      onClick={
        onCopy
      }
      className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-[9px] border border-black/8 bg-white px-2.5 text-[10px] font-black text-black/45"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied
        ? 'Đã copy'
        : 'Copy'}
    </button>
  </div>
);

const ContentDetails:
React.FC<{
  title: string;
  subtitle?: string;
  open?: boolean;
  children:
    React.ReactNode;
}> = ({
  title,
  subtitle,
  open = false,
  children,
}) => (
  <details
    open={
      open
    }
    className="group overflow-hidden rounded-[18px] border border-black/8 bg-white"
  >
    <summary className="cursor-pointer list-none px-4 py-4 sm:px-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-[10px] text-black/30">
              {subtitle}
            </p>
          )}
        </div>

        <span className="text-lg text-black/25 transition group-open:rotate-45">
          +
        </span>
      </div>
    </summary>

    <div className="border-t border-black/6 px-4 py-4 sm:px-5">
      {children}
    </div>
  </details>
);

const SummaryBlock:
React.FC<{
  title: string;
  children:
    React.ReactNode;
}> = ({
  title,
  children,
}) => (
  <div className="rounded-[13px] border border-black/7 bg-[#faf9f8] p-3.5">
    <p className="text-xs font-black text-black/65">
      {title}
    </p>
    <div className="mt-2">
      {children}
    </div>
  </div>
);

const CountCard:
React.FC<{
  label: string;
  value: number;
}> = ({
  label,
  value,
}) => (
  <div className="rounded-[13px] border border-black/7 bg-[#faf9f8] p-3.5">
    <p className="text-[9px] font-black uppercase tracking-[0.08em] text-black/28">
      {label}
    </p>
    <p className="mt-1 text-xl font-black text-black/65">
      {value}
    </p>
  </div>
);
