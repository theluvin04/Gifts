import type {
  ComponentType,
} from 'react';

export interface TemplateProductPageProps {
  onBackHome: () => void;
  onStartPersonalize: () => void;
}

export interface TemplateEditorPageProps<
  TConfig = unknown
> {
  config: TConfig;
  onChange: (config: TConfig) => void;
  onBack: () => void;
  onReset: () => void;
  onAddToCart: () => void;
  onCheckout: () => void;
}

export interface TemplateCheckoutPageProps<
  TConfig = unknown
> {
  config: TConfig;
  onBack: () => void;
}

export interface TemplateExperienceProps<
  TConfig = unknown
> {
  config: TConfig;
  onCreateSimilar: () => void;
}

export interface TemplateModule<
  TConfig = unknown
> {
  id: string;
  name: string;
  category: string;

  paths: {
    product: string;
    create: string;
    checkout: string;
  };

  draftStorageKey: string;
  legacyDraftStorageKeys?: string[];

  defaultConfig: TConfig;

  validateConfig: (
    value: unknown
  ) => value is TConfig;

  ProductPage: ComponentType<
    TemplateProductPageProps
  >;

  EditorPage: ComponentType<
    TemplateEditorPageProps<TConfig>
  >;

  CheckoutPage: ComponentType<
    TemplateCheckoutPageProps<TConfig>
  >;

  Experience: ComponentType<
    TemplateExperienceProps<TConfig>
  >;
}
