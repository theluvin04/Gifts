import {
  useState,
} from 'react';

import {
  addTemplateToCart,
  clearCartItems,
  getCartItems,
  removeCartItem,
} from '../services/cartService';

export const useCart = () => {
  const [
    items,
    setItems,
  ] = useState(
    getCartItems
  );

  const addItem = (
    templateId: string,
    templateName: string
  ) => {
    const next =
      addTemplateToCart(
        templateId,
        templateName
      );

    setItems(next);
  };

  const removeItem = (
    itemId: string
  ) => {
    const next =
      removeCartItem(
        itemId
      );

    setItems(next);
  };

  const clearCart = () => {
    setItems(
      clearCartItems()
    );
  };

  return {
    items,
    count:
      items.length,
    addItem,
    removeItem,
    clearCart,
  };
};
