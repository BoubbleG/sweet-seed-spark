import { create } from 'zustand';
import { CartItem, Product, ProductSize } from '@/types';

interface AddOpts {
  quantity?: number;
  notes?: string;
  size?: ProductSize;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, opts?: AddOpts) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

const lineId = (productId: string, size?: ProductSize, notes?: string) => {
  const base = size ? `${productId}__${size}` : productId;
  if (!notes) return base;
  // distinct line when notes (e.g. misturas) differ
  let h = 0;
  for (let i = 0; i < notes.length; i++) h = (h * 31 + notes.charCodeAt(i)) | 0;
  return `${base}__${h}`;
};

export const useCart = create<CartState>((set, get) => ({
  items: [],
  addItem: (product, opts = {}) => {
    const { quantity = 1, notes = '', size } = opts;
    const id = lineId(product.id, size, notes);
    const items = get().items;
    const existingItem = items.find((item) => item.id === id);

    if (existingItem) {
      set({
        items: items.map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + quantity, notes: notes || item.notes }
            : item
        ),
      });
    } else {
      set({ items: [...items, { ...product, id, quantity, notes, size }] });
    }
  },
  removeItem: (productId: string) => {
    set({ items: get().items.filter((item) => item.id !== productId) });
  },
  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      ),
    });
  },
  clearCart: () => set({ items: [] }),
  getTotal: () => {
    return get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  },
}));
