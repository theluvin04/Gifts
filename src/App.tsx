import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

import { HomePage } from './components/Homepage';
import { CartPage } from './components/CartPage';
import { TrackOrderPage } from './components/TrackOrderPage';
import { DynamicVisualTemplatePage } from './components/DynamicVisualTemplatePage';
import { DynamicVisualCheckoutPage } from './components/DynamicVisualCheckoutPage';
import { CustomerSiteHeader } from './components/CustomerSiteHeader';
import { AdminOrdersPage } from './components/admin/AdminOrdersPage';
import { AdminOrderDetailPage } from './components/admin/AdminOrderDetailPage';
import { BRAND } from './config/brand';
import { useAppNavigation } from './hooks/useAppNavigation';
import { useTemplateDrafts } from './hooks/useTemplateDrafts';
import { useSharedGift } from './hooks/useSharedGift';
import { useCart } from './hooks/useCart';
import { DEFAULT_TEMPLATE_ID, getTemplateModule } from './templates/registry';
import { VisualSceneExperience } from './engine';
import type { TemplateVisualEditorConfig } from './templates/visualEditor';

export default function App() {
  const { location, navigate } = useAppNavigation();
  const { getDraft, persistDraft, resetDraft } = useTemplateDrafts();
  const { sharedGift, isLoadingGift, giftError } = useSharedGift(location);
  const {
    items: cartItems,
    addItem: addCartItem,
    removeItem: removeCartItem,
    clearCart,
  } = useCart();

  useEffect(() => {
    if (location.kind !== 'legacy-template') return;

    navigate(
      `/products/${location.templateId}`,
      true
    );
  }, [location, navigate]);

  const openTemplates = () => {
    navigate('/#templates');
  };

  const renderCustomerShell = (
    content: React.ReactNode,
    active:
      | 'templates'
      | 'track-order'
      | 'cart'
      | null = null
  ) => (
    <div className="dearly-customer-shell min-h-[100svh] bg-[#fffaf8]">
      <CustomerSiteHeader
        active={active}
        cartCount={cartItems.length}
        onHome={() => navigate('/')}
        onTemplates={openTemplates}
        onTrackOrder={() =>
          navigate('/track-order')
        }
        onCart={() =>
          navigate('/cart')
        }
      />

      {/* Ẩn header cũ của page con: toàn customer web chỉ còn 1 navbar. */}
      <div className="[&>div>header:first-child]:hidden">
        {content}
      </div>
    </div>
  );

  const renderMessage = (
    title: string,
    message: string
  ) => (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#fffaf8] px-5">
      <div className="w-full max-w-sm rounded-[28px] border border-black/[0.06] bg-white p-7 text-center shadow-[0_24px_70px_rgba(60,25,35,0.08)]">
        <img src={BRAND.logoPath} alt={BRAND.name} className="mx-auto h-12 w-auto" />
        <h1 className="mt-6 text-xl font-black">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-black/45">{message}</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-6 rounded-[14px] bg-[#c9435d] px-5 py-3 text-sm font-bold text-white"
        >
          Về Dearly
        </button>
      </div>
    </main>
  );

  if (location.kind === 'legacy-template') return null;

  if (location.kind === 'gift') {
    if (isLoadingGift) {
      return (
        <main className="flex min-h-[100svh] flex-col items-center justify-center bg-[#fffaf8] px-5 text-center">
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c9435d] text-white shadow-[0_14px_30px_rgba(201,67,93,0.18)]"
          >
            <Heart className="h-6 w-6 fill-current" />
          </motion.div>
          <p className="mt-5 text-sm font-bold text-black/55">Đang mở món quà...</p>
        </main>
      );
    }

    if (giftError || !sharedGift) {
      return renderMessage(
        'Không tìm thấy món quà',
        giftError || 'Món quà không tồn tại.'
      );
    }

    const template = getTemplateModule(sharedGift.templateId);

    if (!template) {
      if (sharedGift.dynamicVisual) {
        const visualConfig =
          sharedGift.config as TemplateVisualEditorConfig;

        return (
          <main className="min-h-[100svh] w-full overflow-x-hidden bg-white">
            <VisualSceneExperience
              scenes={visualConfig.scenes}
              initialSceneId={visualConfig.initialSceneId}
            />
          </main>
        );
      }

      return renderMessage(
        'Template chưa được hỗ trợ',
        'Không thể mở template của món quà này.'
      );
    }

    const Experience = template.Experience;

    return (
      <Experience
        config={sharedGift.config}
        onCreateSimilar={() => {
          persistDraft(template, sharedGift.config);
          navigate(template.paths.create);
        }}
      />
    );
  }

  if (location.kind === 'home') {
    const template = getTemplateModule(DEFAULT_TEMPLATE_ID);

    return renderCustomerShell(
      <HomePage
        onOpenLoveTemplate={() =>
          navigate(template?.paths.product || '/')
        }
        onOpenTemplate={(templateId) =>
          navigate(`/products/${templateId}`)
        }
        onTrackOrder={() =>
          navigate('/track-order')
        }
      />
    );
  }

  if (location.kind === 'track-order') {
    return renderCustomerShell(
      <TrackOrderPage
        onBackHome={() =>
          navigate('/')
        }
      />,
      'track-order'
    );
  }

  if (location.kind === 'cart') {
    return renderCustomerShell(
      <CartPage
        items={cartItems}
        onBackHome={() => navigate('/')}
        onRemove={removeCartItem}
        onClear={clearCart}
        onEdit={(item) => {
          const template = getTemplateModule(item.templateId);
          navigate(
            template?.paths.create ||
              `/create/${item.templateId}`
          );
        }}
        onCheckout={(item) => {
          const template = getTemplateModule(item.templateId);
          navigate(
            template?.paths.checkout ||
              `/checkout/${item.templateId}`
          );
        }}
      />,
      'cart'
    );
  }

  if (location.kind === 'admin-order') {
    return (
      <AdminOrderDetailPage
        giftId={location.giftId}
        onBack={() => navigate('/admin/orders')}
        onBackHome={() => navigate('/')}
      />
    );
  }

  if (location.kind === 'admin') {
    return (
      <AdminOrdersPage
        onBackHome={() => navigate('/')}
        onOpenOrder={(giftId) => navigate(`/admin/orders/${giftId}`)}
      />
    );
  }

  if (
    location.kind === 'template-product' ||
    location.kind === 'template-create' ||
    location.kind === 'template-checkout'
  ) {
    const template = getTemplateModule(location.templateId);

    if (!template) {
      if (location.kind === 'template-checkout') {
        return renderCustomerShell(
          <DynamicVisualCheckoutPage
            templateId={location.templateId}
            onBack={() => navigate(`/create/${location.templateId}`)}
            onBackHome={() => navigate('/')}
          />,
          'templates'
        );
      }

      return renderCustomerShell(
        <DynamicVisualTemplatePage
          templateId={location.templateId}
          mode={location.kind === 'template-product' ? 'product' : 'create'}
          onBackHome={() => navigate('/')}
          onStartPersonalize={() => navigate(`/create/${location.templateId}`)}
          onBackProduct={() => navigate(`/products/${location.templateId}`)}
          onCheckout={() => navigate(`/checkout/${location.templateId}`)}
        />,
        'templates'
      );
    }

    const config = getDraft(template);

    if (location.kind === 'template-product') {
      const ProductPage = template.ProductPage;
      return renderCustomerShell(
        <ProductPage
          onBackHome={() => navigate('/')}
          onStartPersonalize={() => navigate(template.paths.create)}
        />,
        'templates'
      );
    }

    if (location.kind === 'template-create') {
      const EditorPage = template.EditorPage;
      return renderCustomerShell(
        <EditorPage
          config={config}
          onChange={(nextConfig) => persistDraft(template, nextConfig)}
          onBack={() => navigate(template.paths.product)}
          onReset={() => resetDraft(template)}
          onAddToCart={() => {
            try {
              addCartItem(template.id, template.name);
              navigate('/cart');
            } catch (error) {
              console.error(error);
              window.alert('Không thể thêm vào giỏ hàng trên trình duyệt này.');
            }
          }}
          onCheckout={() => navigate(template.paths.checkout)}
        />,
        'templates'
      );
    }

    const Checkout = template.CheckoutPage;
    return renderCustomerShell(
      <Checkout
        config={config}
        onBack={() => navigate(template.paths.create)}
      />,
      'templates'
    );
  }

  return renderMessage(
    'Trang không tồn tại',
    'Đường dẫn này chưa có trong Dearly.'
  );
}
