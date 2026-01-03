import { create } from "zustand";
import type { CartItem, Product } from "../types";

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product: Product) => {
    const items = get().items;
    const existingItem = items.find((item) => item._id === product._id);

    if (existingItem) {
      set({
        items: items.map((item) =>
          item._id === product._id
            ? {
                ...item,
                cartQuantity: item.cartQuantity + 1,
                cartTotal: (item.cartQuantity + 1) * Number(item.price || 0),
              }
            : item
        ),
      });
    } else {
      set({
        items: [
          ...items,
          {
            ...product,
            cartQuantity: 1,
            cartTotal: Number(product.price || 0),
          },
        ],
      });
    }
  },

  removeItem: (productId: number) => {
    set({ items: get().items.filter((item) => item._id !== productId) });
  },

  updateQuantity: (productId: number, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    set({
      items: get().items.map((item) =>
        item._id === productId
          ? {
              ...item,
              cartQuantity: quantity,
              cartTotal: quantity * Number(item.price || 0),
            }
          : item
      ),
    });
  },

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    return get().items.reduce(
      (total, item) => total + Number(item.cartTotal || 0),
      0
    );
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.cartQuantity, 0);
  },
}));
