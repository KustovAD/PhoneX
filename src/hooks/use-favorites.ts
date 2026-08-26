"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type FavState = {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  setAll: (ids: string[]) => void;
};

export const useFavorites = create<FavState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const ids = get().ids.includes(id)
          ? get().ids.filter((item) => item !== id)
          : [...get().ids, id];
        set({ ids });
      },
      has: (id) => get().ids.includes(id),
      setAll: (ids) => set({ ids }),
    }),
    { name: "phonex-fav" },
  ),
);
