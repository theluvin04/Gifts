import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CreditCard,
  Heart,
  Settings,
  Sparkles,
} from 'lucide-react';

import { loveConfig as initialConfig } from './config/loveConfig';
import { LoveConfig } from './types';

import { HomePage } from './components/Homepage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CreateLovePage } from './components/CreateLovePage';
import { QuickConfigModal } from './components/QuickConfigModal';
import { CheckoutPage } from './components/CheckoutPage';
import { AdminOrdersPage } from './components/admin/AdminOrdersPage';
import { AdminOrderDetailPage } from './components/admin/AdminOrderDetailPage';

import { ProposalScreen } from './components/ProposalScreen';
import { GiftSelector } from './components/GiftSelector';
import { PolaroidGallery } from './components/gifts/PolaroidGallery';
import { VinylMusicPlayer } from './components/gifts/VinylMusicPlayer';
import { LoveLetter } from './components/gifts/LoveLetter';
import { AudioPlayer } from './components/AudioPlayer';
import { sfx } from './utils/soundEffects';
import { fetchGiftFromFirestore } from './services/giftService';

const TEMPLATE_BASE = '/templates/love-01';
const DRAFT_STORAGE_KEY = 'gifts:love-01:draft';

const ROUTES = {
  home: '/',
  product: '/products/love-01',
  create: '/create/love-01',
  checkout: '/checkout/love-01',
  admin: '/admin',
  adminOrders: '/admin/orders',
  proposal: TEMPLATE_BASE,
  gifts: `${TEMPLATE_BASE}/gifts`,
  gift1: `${TEMPLATE_BASE}/gifts/memories`,
  gift2: `${TEMPLATE_BASE}/gifts/music`,
  gift3: `${TEMPLATE_BASE}/gifts/letter`,
} as const;

type AppRoute = keyof typeof ROUTES;

const cleanPath = (pathname: string) => {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }

  return pathname;
};

const getRouteFromPath = (
  pathname: string
): AppRoute | null => {
  const path = cleanPath(pathname);

  const matched = (
    Object.entries(ROUTES) as [AppRoute, string][]
  ).find(([, value]) => value === path);

  return matched?.[0] ?? null;
};

const getGiftIdFromPath = (
  pathname: string
): string | null => {
  const path = cleanPath(pathname);
  const match = path.match(
    /^\/gift\/([a-z0-9_-]{4,64})$/i
  );

  return match?.[1] ?? null;
};

const getAdminOrderIdFromPath = (
  pathname: string
): string | null => {
  const path = cleanPath(pathname);

  const match = path.match(
    /^\/admin\/orders\/([a-z0-9_-]{4,64})$/i
  );

  return match?.[1] ?? null;
};

const getLegacyGiftIdFromQuery = () => {
  const params = new URLSearchParams(
    window.location.search
  );

  return params.get('gift') || params.get('g');
};

const loadDraftConfig = (): LoveConfig => {
  try {
    const raw = window.localStorage.getItem(
      DRAFT_STORAGE_KEY
    );

    if (!raw) {
      return initialConfig;
    }

    const parsed = JSON.parse(raw) as LoveConfig;

    if (
      !parsed?.couple ||
      !parsed?.proposal ||
      !parsed?.gifts ||
      !parsed?.audio
    ) {
      return initialConfig;
    }

    return parsed;
  } catch {
    return initialConfig;
  }
};

const isTemplateRoute = (route: AppRoute) =>
  route === 'proposal' ||
  route === 'gifts' ||
  route === 'gift1' ||
  route === 'gift2' ||
  route === 'gift3';

export default function App() {
  const initialGiftId =
    getGiftIdFromPath(window.location.pathname) ||
    getLegacyGiftIdFromQuery();

  const initialAdminOrderId =
    getAdminOrderIdFromPath(
      window.location.pathname
    );

  const initialRoute = initialGiftId
    ? 'proposal'
    : initialAdminOrderId
      ? 'adminOrders'
      : getRouteFromPath(
          window.location.pathname
        );

  const [route, setRoute] = useState<AppRoute>(
    initialRoute ?? 'home'
  );

  const [invalidRoute, setInvalidRoute] = useState(
    !initialGiftId &&
      !initialAdminOrderId &&
      initialRoute === null
  );

  const [
    adminOrderId,
    setAdminOrderId,
  ] = useState<string | null>(
    initialAdminOrderId
  );

  const [config, setConfig] =
    useState<LoveConfig>(loadDraftConfig);

  const [isConfigOpen, setIsConfigOpen] =
    useState(false);

  const [
    isLoadingCloudGift,
    setIsLoadingCloudGift,
  ] = useState(Boolean(initialGiftId));

  const [cloudGiftId, setCloudGiftId] = useState<
    string | null
  >(initialGiftId);

  const [cloudGiftError, setCloudGiftError] =
    useState<string | null>(null);

  const [isSharedGiftMode, setIsSharedGiftMode] =
    useState(false);

  const loadSharedGift = async (
    giftId: string,
    normalizeUrl = false
  ) => {
    setCloudGiftId(giftId);
    setCloudGiftError(null);
    setInvalidRoute(false);
    setIsLoadingCloudGift(true);

    try {
      const gift = await fetchGiftFromFirestore(
        giftId
      );

      if (!gift?.config) {
        setCloudGiftError(
          'Món quà này không tồn tại, chưa được xuất bản hoặc đã hết hạn.'
        );
        return;
      }

      setConfig(gift.config);
      setIsSharedGiftMode(true);
      setRoute('proposal');

      if (normalizeUrl) {
        const cleanGiftUrl = `/gift/${giftId}`;

        if (
          cleanPath(window.location.pathname) !==
            cleanGiftUrl ||
          window.location.search
        ) {
          window.history.replaceState(
            {},
            '',
            cleanGiftUrl
          );
        }
      }

      window.scrollTo({
        top: 0,
        behavior: 'instant',
      });
    } catch (error) {
      console.error(error);

      setCloudGiftError(
        'Không thể tải món quà từ đám mây.'
      );
    } finally {
      setIsLoadingCloudGift(false);
    }
  };

  const navigate = (
    nextRoute: AppRoute,
    replace = false
  ) => {
    setInvalidRoute(false);
    setCloudGiftError(null);
    setAdminOrderId(null);
    setRoute(nextRoute);

    if (
      isSharedGiftMode &&
      cloudGiftId &&
      isTemplateRoute(nextRoute)
    ) {
      const giftPath = `/gift/${cloudGiftId}`;

      if (
        cleanPath(window.location.pathname) !==
        giftPath
      ) {
        window.history.replaceState(
          {},
          '',
          giftPath
        );
      }

      window.scrollTo({
        top: 0,
        behavior: 'instant',
      });

      return;
    }

    const nextPath = ROUTES[nextRoute];
    const currentPath = cleanPath(
      window.location.pathname
    );

    if (
      currentPath !== nextPath ||
      window.location.search
    ) {
      if (replace) {
        window.history.replaceState(
          {},
          '',
          nextPath
        );
      } else {
        window.history.pushState(
          {},
          '',
          nextPath
        );
      }
    }

    window.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  };

  const navigateToAdminOrder = (
    giftId: string,
    replace = false
  ) => {
    const nextPath =
      `/admin/orders/${giftId}`;

    setInvalidRoute(false);
    setCloudGiftError(null);
    setIsSharedGiftMode(false);
    setCloudGiftId(null);
    setAdminOrderId(giftId);
    setRoute('adminOrders');

    if (replace) {
      window.history.replaceState(
        {},
        '',
        nextPath
      );
    } else {
      window.history.pushState(
        {},
        '',
        nextPath
      );
    }

    window.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  };

  useEffect(() => {
    if (initialGiftId) {
      loadSharedGift(initialGiftId, true);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const giftId = getGiftIdFromPath(
        window.location.pathname
      );

      if (giftId) {
        loadSharedGift(giftId);
        return;
      }

      const nextAdminOrderId =
        getAdminOrderIdFromPath(
          window.location.pathname
        );

      if (nextAdminOrderId) {
        setInvalidRoute(false);
        setCloudGiftError(null);
        setIsSharedGiftMode(false);
        setCloudGiftId(null);
        setAdminOrderId(
          nextAdminOrderId
        );
        setRoute('adminOrders');

        window.scrollTo({
          top: 0,
          behavior: 'instant',
        });

        return;
      }

      const nextRoute = getRouteFromPath(
        window.location.pathname
      );

      if (!nextRoute) {
        setInvalidRoute(true);
        setIsSharedGiftMode(false);
        setCloudGiftId(null);
        return;
      }

      setInvalidRoute(false);
      setCloudGiftError(null);
      setIsSharedGiftMode(false);
      setCloudGiftId(null);
      setAdminOrderId(null);
      setRoute(nextRoute);

      window.scrollTo({
        top: 0,
        behavior: 'instant',
      });
    };

    window.addEventListener(
      'popstate',
      handlePopState
    );

    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState
      );
    };
  }, []);

  useEffect(() => {
    if (initialGiftId) {
      return;
    }

    const pathname = window.location.pathname;
    const cleaned = cleanPath(pathname);

    if (
      pathname !== cleaned &&
      (
        getRouteFromPath(cleaned) ||
        getAdminOrderIdFromPath(
          cleaned
        )
      )
    ) {
      window.history.replaceState(
        {},
        '',
        cleaned
      );
    }
  }, []);

  useEffect(() => {
    if (isSharedGiftMode) {
      return;
    }

    try {
      window.localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify(config)
      );
    } catch {
      // Draft local có thể vượt quota khi dùng nhiều ảnh base64.
      // Không chặn trải nghiệm chỉnh sửa trong phiên hiện tại.
    }
  }, [config, isSharedGiftMode]);

  const resetDraft = () => {
    setConfig(initialConfig);

    try {
      window.localStorage.removeItem(
        DRAFT_STORAGE_KEY
      );
    } catch {
      // Không cần chặn UI nếu localStorage không khả dụng.
    }
  };

  const handleTemplateReset = () => {
    sfx.playPop();
    navigate('proposal');
  };

  const handleCreateSimilar = () => {
    setIsSharedGiftMode(false);
    setCloudGiftId(null);
    setCloudGiftError(null);

    try {
      window.localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify(config)
      );
    } catch {
      // Vẫn cho phép tiếp tục với state hiện tại.
    }

    navigate('create');
  };

  if (isLoadingCloudGift) {
    return (
      <main className="flex min-h-[100svh] flex-col items-center justify-center bg-gradient-to-b from-pink-50 via-rose-50 to-pink-100 px-5 text-center">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
          className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500 text-white shadow-xl shadow-rose-200"
        >
          <Heart className="h-8 w-8 fill-current" />
        </motion.div>

        <h2 className="mt-6 font-heading text-xl font-bold text-slate-800">
          Đang mở hộp quà đặc biệt...
        </h2>

        <p className="mt-2 text-xs font-medium text-rose-500">
          Chờ một chút để tải đầy đủ câu chuyện
          tình yêu ✨
        </p>
      </main>
    );
  }

  if (cloudGiftError) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#fff9fb] px-5">
        <div className="w-full max-w-sm rounded-[28px] border border-rose-100 bg-white p-7 text-center shadow-xl">
          <div className="text-4xl">💌</div>

          <h1 className="mt-3 text-xl font-bold text-slate-900">
            Không tìm thấy món quà
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {cloudGiftError}
          </p>

          <button
            type="button"
            onClick={() => {
              setCloudGiftError(null);
              setIsSharedGiftMode(false);
              setCloudGiftId(null);

              window.history.replaceState(
                {},
                '',
                '/'
              );

              setRoute('home');
            }}
            className="mt-5 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-600"
          >
            Về trang chủ
          </button>
        </div>
      </main>
    );
  }

  if (invalidRoute) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#fff9fb] px-5">
        <div className="w-full max-w-sm rounded-[28px] border border-rose-100 bg-white p-7 text-center shadow-xl">
          <div className="text-4xl">💌</div>

          <h1 className="mt-3 text-xl font-bold text-slate-900">
            Trang không tồn tại
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Đường dẫn này chưa có trong hệ thống
            Gifts.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate('home', true)
            }
            className="mt-5 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-600"
          >
            Về trang chủ
          </button>
        </div>
      </main>
    );
  }

  if (route === 'home') {
    return (
      <HomePage
        onOpenLoveTemplate={() =>
          navigate('product')
        }
      />
    );
  }

  if (route === 'product') {
    return (
      <ProductDetailPage
        onBackHome={() => navigate('home')}
        onPreview={() => navigate('proposal')}
        onPersonalize={() => navigate('create')}
      />
    );
  }

  if (route === 'create') {
    return (
      <CreateLovePage
        config={config}
        onChange={setConfig}
        onBack={() => navigate('product')}
        onPreview={() => navigate('proposal')}
        onReset={resetDraft}
        onCheckout={() => navigate('checkout')}
      />
    );
  }

  if (route === 'checkout') {
    return (
      <CheckoutPage
        config={config}
        onBack={() => navigate('create')}
        onPreview={() => navigate('proposal')}
      />
    );
  }

  if (
    route === 'adminOrders' &&
    adminOrderId
  ) {
    return (
      <AdminOrderDetailPage
        giftId={adminOrderId}
        onBack={() =>
          navigate('adminOrders')
        }
        onBackHome={() =>
          navigate('home')
        }
      />
    );
  }

  if (
    route === 'admin' ||
    route === 'adminOrders'
  ) {
    return (
      <AdminOrdersPage
        onBackHome={() => navigate('home')}
        onOpenOrder={
          navigateToAdminOrder
        }
      />
    );
  }

  if (!isTemplateRoute(route)) {
    return null;
  }

  return (
    <main className="relative flex min-h-screen flex-col justify-between overflow-x-hidden bg-gradient-to-b from-pink-50 via-rose-50 to-pink-100 text-slate-800 selection:bg-pink-300 selection:text-pink-900">
      <AudioPlayer
        musicUrl={
          config.audio.backgroundMusicUrl
        }
        musicTitle={
          config.audio.backgroundMusicTitle
        }
      />

      <div className="fixed left-4 top-4 z-40 flex items-center gap-2">
        {!isSharedGiftMode && (
          <>
            <button
              type="button"
              onClick={() =>
                setIsConfigOpen(true)
              }
              className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-white/85 px-3 py-2 text-xs font-bold text-rose-700 shadow-sm backdrop-blur-md transition hover:bg-white"
              title="Tùy chỉnh nhanh"
            >
              <Settings className="h-3.5 w-3.5" />

              <span className="hidden sm:inline">
                Chỉnh sửa nhanh
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('checkout')
              }
              className="flex items-center gap-1.5 rounded-full bg-rose-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-600"
              title="Tiếp tục sang bước thanh toán"
            >
              <CreditCard className="h-3.5 w-3.5" />

              <span className="hidden sm:inline">
                Tiếp tục thanh toán
              </span>
            </button>
          </>
        )}

        {isSharedGiftMode && (
          <button
            type="button"
            onClick={handleCreateSimilar}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-white"
          >
            <Sparkles className="h-3.5 w-3.5 text-rose-500" />

            <span className="hidden sm:inline">
              Tạo quà tương tự
            </span>
          </button>
        )}
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-2 sm:p-4">
        <AnimatePresence mode="wait">
          {route === 'proposal' && (
            <ProposalScreen
              key="proposal-stage"
              config={config}
              onYesAccepted={() =>
                navigate('gifts')
              }
            />
          )}

          {route === 'gifts' && (
            <GiftSelector
              key="gifts-stage"
              config={config}
              onSelectGift={(
                selectedStage
              ) => {
                if (
                  selectedStage === 'gift1'
                ) {
                  navigate('gift1');
                  return;
                }

                if (
                  selectedStage === 'gift2'
                ) {
                  navigate('gift2');
                  return;
                }

                if (
                  selectedStage === 'gift3'
                ) {
                  navigate('gift3');
                }
              }}
              onReset={handleTemplateReset}
            />
          )}

          {route === 'gift1' && (
            <PolaroidGallery
              key="gift1-stage"
              photos={
                config.gifts.gift1.photos
              }
              onBack={() =>
                navigate('gifts')
              }
            />
          )}

          {route === 'gift2' && (
            <VinylMusicPlayer
              key="gift2-stage"
              playlist={
                config.gifts.gift2.playlist
              }
              onBack={() =>
                navigate('gifts')
              }
            />
          )}

          {route === 'gift3' && (
            <LoveLetter
              key="gift3-stage"
              letterData={
                config.gifts.gift3.letter
              }
              senderName={
                config.couple.senderName
              }
              receiverName={
                config.couple.receiverName
              }
              onBack={() =>
                navigate('gifts')
              }
            />
          )}
        </AnimatePresence>
      </div>

      <footer className="relative z-10 py-4 text-center text-xs font-medium text-rose-800/60">
        <p className="flex items-center justify-center gap-1">
          <span>Made with</span>

          <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />

          <span>for someone special</span>
        </p>
      </footer>

      {!isSharedGiftMode && (
        <>
          <QuickConfigModal
            open={isConfigOpen}
            config={config}
            onClose={() =>
              setIsConfigOpen(false)
            }
            onSave={setConfig}
            onReset={resetDraft}
          />

        </>
      )}
    </main>
  );
}
