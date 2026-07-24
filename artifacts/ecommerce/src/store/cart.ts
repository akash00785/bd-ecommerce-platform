import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, size?: string, color?: string) => void;
  updateQuantity: (productId: number, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  
  // Coupon state
  couponCode: string | null;
  discountAmount: number;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => set((state) => {
        const existingItemIndex = state.items.findIndex(
          (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
        );
        
        if (existingItemIndex !== -1) {
          const newItems = [...state.items];
          newItems[existingItemIndex].quantity += item.quantity;
          return { items: newItems };
        }
        
        return { items: [...state.items, item] };
      }),
      
      removeItem: (productId, size, color) => set((state) => ({
        items: state.items.filter(
          (i) => !(i.productId === productId && i.size === size && i.color === color)
        ),
      })),
      
      updateQuantity: (productId, quantity, size, color) => set((state) => {
        if (quantity <= 0) {
          return {
            items: state.items.filter(
              (i) => !(i.productId === productId && i.size === size && i.color === color)
            ),
          };
        }
        
        return {
          items: state.items.map((i) => 
            (i.productId === productId && i.size === size && i.color === color)
              ? { ...i, quantity }
              : i
          ),
        };
      }),
      
      clearCart: () => set({ items: [], couponCode: null, discountAmount: 0 }),
      
      getCartTotal: () => {
        const total = get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
        return Math.max(0, total - get().discountAmount);
      },
      
      getCartCount: () => get().items.reduce((count, item) => count + item.quantity, 0),
      
      couponCode: null,
      discountAmount: 0,
      
      applyCoupon: (code, discount) => set({ couponCode: code, discountAmount: discount }),
      removeCoupon: () => set({ couponCode: null, discountAmount: 0 }),
    }),
    {
      name: 'ecommerce-cart',
    }
  )
);
