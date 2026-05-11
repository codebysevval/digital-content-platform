import { create } from 'zustand';
import { api } from '../lib/api';

export interface NotificationEntry {
  contentId: number;
  creatorName: string;
  creatorInitials: string;
  contentTitle: string;
  uploadedAt: string;
  creatorAvatarUrl?: string;
}

const SEEN_KEY = 'sochen_notif_seen';

function getSeenIds(): Set<number> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveSeenIds(ids: Set<number>) {
  const arr = Array.from(ids).slice(-300);
  localStorage.setItem(SEEN_KEY, JSON.stringify(arr));
}

interface NotificationState {
  items: NotificationEntry[];
  unreadCount: number;
  isLoading: boolean;

  fetchNotifications: () => Promise<void>;
  markRead: () => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const data = await api.get<NotificationEntry[]>('/api/users/me/notifications');
      const seenIds = getSeenIds();
      const unreadCount = data.filter((n) => !seenIds.has(n.contentId)).length;
      set({ items: data, unreadCount, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  markRead: () => {
    const { items } = get();
    const seenIds = getSeenIds();
    items.forEach((n) => seenIds.add(n.contentId));
    saveSeenIds(seenIds);
    set({ unreadCount: 0 });
  },

  reset: () => set({ items: [], unreadCount: 0, isLoading: false }),
}));
