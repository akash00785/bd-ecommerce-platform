import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistState = {
  productIds: number[];
  toggle: (productId: number) => void;
  has: (productId: number) => boolean;
  clear: () => void;
};

export const useWishlistStore = create<WishlistState>()(persist((set, get) => ({
  productIds: [],
  toggle: (productId) => set((state) => ({
    productIds: state.productIds.includes(productId)
      ? state.productIds.filter((id) => id !== productId)
      : [...state.productIds, productId],
  })),
  has: (productId) => get().productIds.includes(productId),
  clear: () => set({ productIds: [] }),
}), { name: "ecommerce-wishlist" }));