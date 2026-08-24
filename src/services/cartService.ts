export interface CartItem {
  id: string;
  templateId: string;
  templateName: string;
  addedAt: number;
}

const CART_STORAGE_KEY =
  'dearly:cart:v1';

const readCart = (): CartItem[] => {
  try {
    const raw =
      window.localStorage.getItem(
        CART_STORAGE_KEY
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.templateId === 'string' &&
        typeof item.templateName === 'string'
    );
  } catch {
    return [];
  }
};

const writeCart = (
  items: CartItem[]
) => {
  window.localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify(items)
  );
};

export const getCartItems =
  () => {
    return readCart();
  };

export const addTemplateToCart =
  (
    templateId: string,
    templateName: string
  ) => {
    const current =
      readCart();

    const existing =
      current.find(
        (item) =>
          item.templateId ===
          templateId
      );

    const nextItem: CartItem = {
      id:
        existing?.id ||
        templateId,
      templateId,
      templateName,
      addedAt:
        Date.now(),
    };

    const next = [
      nextItem,
      ...current.filter(
        (item) =>
          item.templateId !==
          templateId
      ),
    ];

    writeCart(next);

    return next;
  };

export const removeCartItem =
  (itemId: string) => {
    const next =
      readCart().filter(
        (item) =>
          item.id !== itemId
      );

    writeCart(next);

    return next;
  };

export const clearCartItems =
  () => {
    writeCart([]);
    return [];
  };
