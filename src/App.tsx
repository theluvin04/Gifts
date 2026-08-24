import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, Settings, Share2, Sparkles, Loader2, RefreshCw } from 'lucide-react';

import { loveConfig as initialConfig } from './config/loveConfig';
import { LoveConfig } from './types';

import { HomePage } from './components/Homepage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CreateLovePage } from './components/CreateLovePage';
import { QuickConfigModal } from './components/QuickConfigModal';
import { ShareGiftModal } from './components/ShareGiftModal';

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

const getRouteFromPath = (pathname: string): AppRoute | null => {
  const path = cleanPath(pathname);
  const matched = (
    Object.entries(ROUTES) as [AppRoute, string][]
  ).find(([, value]) => value === path);

  return matched?.[0] ?? null;
};

const loadDraftConfig = (): LoveConfig => {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return initialConfig;
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
  const initialRoute = getRouteFromPath(window.location.pathname);

  const [route, setRoute] = useState<AppRoute>(initialRoute ?? 'home');
  const [invalidRoute, setInvalidRoute] = useState(initialRoute === null);
  const [config, setConfig] = useState<LoveConfig>(loadDraftConfig);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Firestore cloud gift loading state
  const [isLoadingCloudGift, setIsLoadingCloudGift] = useState(false);
  const [cloudGiftId, setCloudGiftId] = useState<string | null>(null);
  const [cloudGiftError, setCloudGiftError] = useState<string | null>(null);
  const [isSharedGiftMode, setIsSharedGiftMode] = useState(false);

  const navigate = (nextRoute: AppRoute, replace = false) => {
    const nextPath = ROUTES[nextRoute];
    const currentPath = cleanPath(window.location.pathname);

    setInvalidRoute(false);
    setRoute(nextRoute);

    if (currentPath !== nextPath) {
      if (replace) {
        window.history.replaceState({}, '', nextPath);
      } else {
        window.history.pushState({}, '', nextPath);
      }
    }

    window.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  };

  // Check URL query param ?gift=<id> or path /gift/<id> on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const giftParam = searchParams.get('gift') || searchParams.get('g');

    if (giftParam) {
      setCloudGiftId(giftParam);
      setIsLoadingCloudGift(true);
      fetchGiftFromFirestore(giftParam)
        .then((doc) => {
          if (doc && doc.config) {
            setConfig(doc.config);
            setIsSharedGiftMode(true);
            setRoute('proposal');
            setInvalidRoute(false);
          } else {
            setCloudGiftError('Món quà này không tồn tại hoặc đã hết hạn.');
          }
        })
        .catch((err) => {
          console.error(err);
          setCloudGiftError('Không thể tải món quà từ đám mây.');
        })
        .finally(() => {
          setIsLoadingCloudGift(false);
        });
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const nextRoute = getRouteFromPath(window.location.pathname);

      if (!nextRoute) {
        setInvalidRoute(true);
        return;
      }

      setInvalidRoute(false);
      setRoute(nextRoute);

      window.scrollTo({
        top: 0,
        behavior: 'instant',
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    const pathname = window.location.pathname;
    const cleaned = cleanPath(pathname);

    if (pathname !== cleaned && getRouteFromPath(cleaned)) {
      window.history.replaceState({}, '', cleaned);
    }
  }, []);

  useEffect(() => {
    // Only update local draft if not viewing a shared cloud gift
    if (!isSharedGiftMode) {
      try {
        window.localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify(config)
        );
      } catch {
        // Ignore quota exceeded
      }
    }
  }, [config, isSharedGiftMode]);

  const resetDraft = () => {
    setConfig(initialConfig);
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const handleTemplateReset = () => {
    sfx.playPop();
    navigate('proposal');
  };

  if (isLoadingCloudGift) {
    return (
      <main className="flex min-h-[100svh] flex-col items-center justify-center bg-gradient-to-b from-pink-50 via-rose-50 to-pink-100 px-5 text-center">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500 text-white shadow-xl shadow-rose-200"
        >
          <Heart className="h-8 w-8 fill-current" />
        </motion.div>

        <h2 className="mt-6 font-heading text-xl font-bold text-slate-800">
          Đang mở hộp quà đặc biệt...
        </h2>
        <p className="mt-2 text-xs text-rose-500 font-medium">
          Chờ một chút để tải đầy đủ hình ảnh và giai điệu tình yêu ✨
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
              window.history.replaceState({}, '', '/');
              setRoute('home');
            }}
            className="mt-5 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-600"
          >
            Về trang chủ tạo quà mới
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
            Đường dẫn này chưa có trong hệ thống Gifts.
          </p>
          <button
            type="button"
            onClick={() => navigate('home', true)}
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
        onOpenLoveTemplate={() => navigate('product')}
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
      />
    );
  }

  if (!isTemplateRoute(route)) {
    return null;
  }

  return (
    <main className="relative flex min-h-screen flex-col justify-between overflow-x-hidden bg-gradient-to-b from-pink-50 via-rose-50 to-pink-100 text-slate-800 selection:bg-pink-300 selection:text-pink-900">
      <AudioPlayer
        musicUrl={config.audio.backgroundMusicUrl}
        musicTitle={config.audio.backgroundMusicTitle}
      />

      {/* Top Floating Controls */}
      <div className="fixed left-4 top-4 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsConfigOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-white/85 px-3 py-2 text-xs font-bold text-rose-700 shadow-sm backdrop-blur-md transition hover:bg-white"
          title="Tùy chỉnh nhanh"
        >
          <Settings className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Chỉnh sửa nhanh</span>
        </button>

        <button
          type="button"
          onClick={() => setIsShareModalOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-rose-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-600"
          title="Lưu & Chia sẻ link món quà"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Chia sẻ món quà</span>
        </button>

        {isSharedGiftMode && (
          <button
            type="button"
            onClick={() => {
              setIsSharedGiftMode(false);
              navigate('create');
            }}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-white"
          >
            <Sparkles className="h-3.5 w-3.5 text-rose-500" />
            <span className="hidden sm:inline">Tạo quà tương tự</span>
          </button>
        )}
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-2 sm:p-4">
        <AnimatePresence mode="wait">
          {route === 'proposal' && (
            <ProposalScreen
              key="proposal-stage"
              config={config}
              onYesAccepted={() => navigate('gifts')}
            />
          )}

          {route === 'gifts' && (
            <GiftSelector
              key="gifts-stage"
              config={config}
              onSelectGift={(selectedStage) => {
                if (selectedStage === 'gift1') {
                  navigate('gift1');
                  return;
                }

                if (selectedStage === 'gift2') {
                  navigate('gift2');
                  return;
                }

                if (selectedStage === 'gift3') {
                  navigate('gift3');
                }
              }}
              onReset={handleTemplateReset}
            />
          )}

          {route === 'gift1' && (
            <PolaroidGallery
              key="gift1-stage"
              photos={config.gifts.gift1.photos}
              onBack={() => navigate('gifts')}
            />
          )}

          {route === 'gift2' && (
            <VinylMusicPlayer
              key="gift2-stage"
              playlist={config.gifts.gift2.playlist}
              onBack={() => navigate('gifts')}
            />
          )}

          {route === 'gift3' && (
            <LoveLetter
              key="gift3-stage"
              letterData={config.gifts.gift3.letter}
              senderName={config.couple.senderName}
              receiverName={config.couple.receiverName}
              onBack={() => navigate('gifts')}
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

      <QuickConfigModal
        open={isConfigOpen}
        config={config}
        onClose={() => setIsConfigOpen(false)}
        onSave={setConfig}
        onReset={resetDraft}
      />

      <ShareGiftModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        config={config}
      />
    </main>
  );
}
