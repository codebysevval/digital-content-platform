import { create } from 'zustand';
import { toast } from 'sonner';
import type { OfflineContentItem } from '../types';
import { api } from '../lib/api';

const OFFLINE_STORAGE_LIMIT_MB = 10240;

export type AddOfflineRequest = Omit<OfflineContentItem, 'downloadDate' | 'size'> & {
  /** Optional explicit size; the server fills it in if omitted. */
  size?: string;
};

interface OfflineState {
  items: OfflineContentItem[];
  storageLimitMb: number;
  isLoading: boolean;
  error: string | null;

  fetchOfflineContent: () => Promise<OfflineContentItem[]>;
  addOfflineItem: (item: AddOfflineRequest) => Promise<boolean>;
  deleteOfflineItem: (id: number) => Promise<void>;
  getTotalSizeMb: () => number;
  hasItem: (id: number) => boolean;
  reset: () => void;
}

const parseSizeMb = (size: string): number => {
  const trimmed = size.trim().toUpperCase();
  const value = parseFloat(trimmed) || 0;
  if (trimmed.includes('GB')) return value * 1024;
  return value;
};

export const useOfflineStore = create<OfflineState>((set, get) => ({
  items: [],
  storageLimitMb: OFFLINE_STORAGE_LIMIT_MB,
  isLoading: false,
  error: null,

  fetchOfflineContent: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get<OfflineContentItem[]>('/api/users/me/offline');
      set({ items: data, isLoading: false });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Offline fetch failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  addOfflineItem: async (payload) => {
    const { items, storageLimitMb } = get();

    if (items.some((existing) => existing.id === payload.id)) {
      toast.info('Bu içerik zaten indirildi');
      return false;
    }

    // Optimistic client-side check using the explicit size hint when present,
    // otherwise let the server enforce the limit and surface a 409.
    if (payload.size) {
      const sizeMb = parseSizeMb(payload.size);
      const currentSize = items.reduce(
        (sum, item) => sum + parseSizeMb(item.size),
        0,
      );
      if (currentSize + sizeMb > storageLimitMb) {
        toast.warning('Depolama limiti doldu');
        return false;
      }
    }

    try {
      const newItem = await api.post<OfflineContentItem>(
        '/api/users/me/offline',
        payload,
      );
      set({ items: [newItem, ...get().items] });
      toast.success('İçerik çevrimdışı kullanıma hazır', {
        description: payload.title,
      });
      return true;
    } catch (err) {
      if (err instanceof Error && err.message.includes('409')) {
        toast.warning('Depolama limiti doldu');
        return false;
      }
      throw err;
    }
  },

  deleteOfflineItem: async (id) => {
    await api.del(`/api/users/me/offline/${id}`);
    set({ items: get().items.filter((item) => item.id !== id) });
  },

  getTotalSizeMb: () =>
    get().items.reduce((sum, item) => sum + parseSizeMb(item.size), 0),

  hasItem: (id) => get().items.some((item) => item.id === id),

  reset: () => set({ items: [], isLoading: false, error: null }),
}));
