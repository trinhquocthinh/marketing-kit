'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { FolderModel, MyImageModel, PerformanceModel } from '@/types';
import { TabEnum } from '@/types/enums';

interface DashboardState {
  isLoading: boolean;
  stage: string;
  folders: FolderModel[];
  myImages: MyImageModel[];
  performances: PerformanceModel[];
}

interface DashboardActions {
  setLoading: (val: boolean) => void;
  setStage: (stage: string) => void;
  setFolders: (folders: FolderModel[]) => void;
  setMyImages: (images: MyImageModel[]) => void;
  setPerformances: (performances: PerformanceModel[]) => void;
  resetState: () => void;
}

const initialState: DashboardState = {
  isLoading: false,
  stage: TabEnum.Libraries,
  folders: [],
  myImages: [],
  performances: [],
};

/**
 * Dashboard store — persisted to **localStorage**.
 * Chỉ persist field UI (stage) để tránh giữ data stale; list được fetch lại từ API.
 */
export const useDashboardStore = create<DashboardState & DashboardActions>()(
  persist(
    (set) => ({
      ...initialState,

      setLoading: (isLoading) => set({ isLoading }),
      setStage: (stage) => set({ stage }),
      setFolders: (folders) => set({ folders }),
      setMyImages: (myImages) => set({ myImages }),
      setPerformances: (performances) => set({ performances }),

      resetState: () =>
        set((state) => ({
          ...initialState,
          stage: state.stage,
        })),
    }),
    {
      name: 'mkk-dashboard',
      storage: createJSONStorage(() => localStorage),
      // Chỉ persist field bền vững (stage) — list data nên fetch lại
      partialize: (state) => ({ stage: state.stage }),
    },
  ),
);
