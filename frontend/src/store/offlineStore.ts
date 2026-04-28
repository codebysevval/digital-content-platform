import { create } from 'zustand';
import { toast } from 'sonner';
import type { OfflineContentItem } from '../types';
import { OFFLINE_STORAGE_LIMIT_MB, mockOfflineContent } from '../lib/mockData';

const FAKE_LATENCY_MS = 200;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export type AddOfflineRequest = Omit<OfflineContentItem, 'downloadDate' | 'size'> & {
  /** Optional explicit size; falls back to a category-based estimate. */
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
}

const parseSizeMb = (size: string): number => {
  const trimmed = size.trim().toUpperCase();
  const value = parseFloat(trimmed) || 0;
  if (trimmed.includes('GB')) return value * 1024;
  return value;
};

const formatSizeLabel = (sizeMb: number): string =>
  sizeMb >= 1024 ? `${(sizeMb / 1024).toFixed(1)} GB` : `${Math.round(sizeMb)} MB`;

const estimateSizeMb = (category: OfflineContentItem['category']): number => {
  switch (category) {
    case 'courses':
      return 600;
    case 'podcasts':
      return 90;
    case 'magazines':
      return 150;
    case 'newspapers':
      return 50;
    default:
      return 250;
  }
};

const formatDownloadDate = (): string => {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

export const useOfflineStore = create<OfflineState>((set, get) => ({
  items: mockOfflineContent,
  storageLimitMb: OFFLINE_STORAGE_LIMIT_MB,
  isLoading: false,
  error: null,

  fetchOfflineContent: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: replace with `await fetch('/api/users/me/offline')`
      await wait(FAKE_LATENCY_MS);
      set({ items: mockOfflineContent, isLoading: false });
      return mockOfflineContent;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Offline fetch failed';
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

    const sizeMb = payload.size
      ? parseSizeMb(payload.size)
      : estimateSizeMb(payload.category);
    const currentSize = items.reduce(
      (sum, item) => sum + parseSizeMb(item.size),
      0,
    );

    if (currentSize + sizeMb > storageLimitMb) {
      toast.warning('Depolama limiti doldu', {
        description: `İndirilemiyor — ${formatSizeLabel(storageLimitMb)} sınırını aşıyor.`,
      });
      return false;
    }

    // TODO: replace with `await fetch('/api/users/me/offline', { method: 'POST', body: JSON.stringify(payload) })`
    await wait(FAKE_LATENCY_MS / 2);

    const newItem: OfflineContentItem = {
      id: payload.id,
      title: payload.title,
      category: payload.category,
      thumbnail: payload.thumbnail,
      size: payload.size ?? formatSizeLabel(sizeMb),
      downloadDate: formatDownloadDate(),
      duration: payload.duration,
      views: payload.views,
      subscriberOnly: payload.subscriberOnly,
      creator: payload.creator,
    };

    set({ items: [newItem, ...items] });
    toast.success('İçerik çevrimdışı kullanıma hazır', {
      description: payload.title,
    });
    return true;
  },

  deleteOfflineItem: async (id) => {
    // TODO: replace with `await fetch(`/api/users/me/offline/${id}`, { method: 'DELETE' })`
    await wait(FAKE_LATENCY_MS / 2);
    set({ items: get().items.filter((item) => item.id !== id) });
  },

  getTotalSizeMb: () =>
    get().items.reduce((sum, item) => sum + parseSizeMb(item.size), 0),

  hasItem: (id) => get().items.some((item) => item.id === id),
}));
