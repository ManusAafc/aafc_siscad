import { create } from 'zustand';

interface LoadingState {
  isGlobalLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isGlobalLoading: false,
  startLoading: () => set({ isGlobalLoading: true }),
  stopLoading: () => set({ isGlobalLoading: false }),
}));
