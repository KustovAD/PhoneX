"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, quantity: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item, quantity = 1) => {
        const current = get().items;
        const existing = current.find((row) => row.productId === item.productId);
        if (existing) {
          set({
            items: current.map((row) =>
              row.productId === item.productId
                ? { ...row, quantity: Math.min(5, row.quantity + quantity) }
                : row,
            ),
          });
          return;
        }
        set({ items: [...current, { ...item, quantity }] });
      },
      remove: (productId) =>
        set({ items: get().items.filter((row) => row.productId !== productId) }),
      setQty: (productId, quantity) =>
        set({
          items:
            quantity < 1
              ? get().items.filter((row) => row.productId !== productId)
              : get().items.map((row) =>
                  row.productId === productId ? { ...row, quantity } : row,
                ),
        }),
      clear: () => set({ items: [] }),
    }),
    { name: "phonex-cart" },
  ),
);
