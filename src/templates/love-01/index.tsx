import React from 'react';

import {
  loveConfig,
} from '../../config/loveConfig';

import type {
  LoveConfig,
} from '../../types';

import {
  ProductDetailPage,
} from '../../components/ProductDetailPage';

import {
  CreateLovePage,
} from '../../components/CreateLovePage';

import {
  CheckoutPage,
} from '../../components/CheckoutPage';

import {
  LoveStoryExperience,
} from './LoveStoryExperience';

import type {
  TemplateModule,
} from '../types';

const validateLoveConfig = (
  value: unknown
): value is LoveConfig => {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return false;
  }

  const config =
    value as Partial<LoveConfig>;

  return Boolean(
    config.couple &&
    config.proposal &&
    config.gifts &&
    config.audio
  );
};

export const love01Template:
TemplateModule<LoveConfig> = {
  id: 'love-01',
  name: 'Love Story 01',
  category: 'love',

  paths: {
    product:
      '/products/love-01',
    create:
      '/create/love-01',
    checkout:
      '/checkout/love-01',
  },

  draftStorageKey:
    'dearly:draft:love-01',

  legacyDraftStorageKeys: [
    'gifts:love-01:draft',
  ],

  defaultConfig:
    loveConfig,

  validateConfig:
    validateLoveConfig,

  ProductPage: ({
    onBackHome,
    onStartPersonalize,
  }) => (
    <ProductDetailPage
      onBackHome={
        onBackHome
      }
      onPersonalize={
        onStartPersonalize
      }
    />
  ),

  EditorPage: ({
    config,
    onChange,
    onBack,
    onReset,
    onAddToCart,
    onCheckout,
  }) => (
    <CreateLovePage
      config={config}
      onChange={onChange}
      onBack={onBack}
      onReset={onReset}
      onAddToCart={
        onAddToCart
      }
      onCheckout={
        onCheckout
      }
    />
  ),

  CheckoutPage: ({
    config,
    onBack,
  }) => (
    <CheckoutPage
      config={config}
      onBack={onBack}
    />
  ),

  Experience: ({
    config,
    onCreateSimilar,
  }) => (
    <LoveStoryExperience
      config={config}
      onCreateSimilar={
        onCreateSimilar
      }
    />
  ),
};
