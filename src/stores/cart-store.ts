"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "@/products/types";

export interface CartLine {
  id: string;
  title: string;
  price: number;
  image: string;
  qty: number;
}

interface CartState {
  items: CartLine[];
  add: (product: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;

  /** totals are selectors — cheap and pure */
  subtotal: () => number;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (product, qty = 1) => {
        set((state) => {
          const existing = state.items.find((l) => l.id === product.id);
          if (existing) {
            return {
              items: state.items.map((l) =>
                l.id === product.id ? { ...l, qty: l.qty + qty } : l
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                qty,
              },
            ],
          };
        });
      },

      remove: (id) =>
        set((state) => ({ items: state.items.filter((l) => l.id !== id) })),

      setQty: (id, qty) =>
        set((state) => ({
          items: state.items
            .map((l) => (l.id === id ? { ...l, qty: Math.max(1, qty) } : l))
            .filter((l) => l.qty > 0),
        })),

      clear: () => set({ items: [] }),

      subtotal: () =>
        get().items.reduce((acc, l) => acc + l.price * l.qty, 0),

      count: () => get().items.reduce((acc, l) => acc + l.qty, 0),
    }),
    {
      name: "luxe_cart",
      storage: createJSONStorage(() => localStorage),
      // Only persist the line items — selectors are recomputed.
      partialize: (state) => ({ items: state.items }),
      version: 1,
    }
  )
);
