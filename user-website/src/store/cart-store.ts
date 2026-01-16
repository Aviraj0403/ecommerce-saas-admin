import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, AddToCartData } from '@/types/cart.types';

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  addItem: (item: AddToCartData) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  syncWithBackend: (items: CartItem[]) => void;
  setLoading: (loading: boolean) => void;
  calculateTotals: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,
      isLoading: false,

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.productId === item.productId);

          let newItems: CartItem[];
          if (existingItem) {
            // Update quantity if item exists
            newItems = state.items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            );
          } else {
            // Add new item with generated ID
            const newItem: CartItem = {
              id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              ...item,
            };
            newItems = [...state.items, newItem];
          }

          const total = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
          const itemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);

          return { items: newItems, total, itemCount };
        });
      },

      removeItem: (productId) => {
        set((state) => {
          const newItems = state.items.filter((i) => i.productId !== productId);
          const total = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
          const itemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);

          return { items: newItems, total, itemCount };
        });
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            const newItems = state.items.filter((i) => i.productId !== productId);
            const total = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
            const itemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);
            return { items: newItems, total, itemCount };
          }

          const newItems = state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          );
          const total = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
          const itemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);

          return { items: newItems, total, itemCount };
        });
      },

      clearCart: () => {
        set({ items: [], total: 0, itemCount: 0 });
      },

      syncWithBackend: (items) => {
        const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
        set({ items, total, itemCount });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      calculateTotals: () => {
        const state = get();
        const total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
        set({ total, itemCount });
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        total: state.total,
        itemCount: state.itemCount,
      }),
    }
  )
);
