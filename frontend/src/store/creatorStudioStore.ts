import { create } from 'zustand';
import type { CreatorStudioStats, NewContentRequest } from '../types';
import { mockCreatorStudioStats } from '../lib/mockData';

const FAKE_LATENCY_MS = 200;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface CreatorStudioState {
  stats: CreatorStudioStats;
  uploadProgress: number;
  isUploading: boolean;
  isLoading: boolean;
  error: string | null;

  fetchStats: () => Promise<CreatorStudioStats>;
  startUpload: () => Promise<void>;
  publishContent: (payload: NewContentRequest) => Promise<{ id: number }>;
  resetUpload: () => void;
}

export const useCreatorStudioStore = create<CreatorStudioState>((set) => ({
  stats: mockCreatorStudioStats,
  uploadProgress: 0,
  isUploading: false,
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: replace with `await fetch('/api/creator-studio/stats')`
      await wait(FAKE_LATENCY_MS);
      set({ stats: mockCreatorStudioStats, isLoading: false });
      return mockCreatorStudioStats;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Creator stats fetch failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  startUpload: async () => {
    set({ isUploading: true, uploadProgress: 0 });
    // TODO: replace simulation with multipart upload progress tracking
    await new Promise<void>((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        set({ uploadProgress: progress });
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            set({ isUploading: false, uploadProgress: 0 });
            resolve();
          }, 500);
        }
      }, 300);
    });
  },

  publishContent: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: replace with `await fetch('/api/creator-studio/content', { method: 'POST', body: JSON.stringify(payload) })`
      await wait(FAKE_LATENCY_MS);
      void payload;
      set({ isLoading: false });
      return { id: Date.now() };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Publish failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  resetUpload: () => set({ isUploading: false, uploadProgress: 0 }),
}));
