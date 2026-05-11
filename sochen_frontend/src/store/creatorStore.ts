import { create } from 'zustand';
import type { Creator, CreatorContent, CreatorSearchResult, FollowedCreator } from '../types';
import { api } from '../lib/api';

interface CreatorState {
  creators: Record<number, Creator>;
  followedCreators: FollowedCreator[];
  /** creatorId -> isFollowing flag */
  followingStatus: Record<number, boolean>;
  /** creatorId -> notification subscribed flag */
  notificationStatus: Record<number, boolean>;
  isLoading: boolean;
  error: string | null;

  fetchFollowedCreators: () => Promise<FollowedCreator[]>;
  fetchCreatorById: (id: number) => Promise<Creator | null>;
  fetchCreatorContent: (creatorId: number) => Promise<CreatorContent[]>;
  searchCreators: (query: string) => Promise<CreatorSearchResult[]>;
  toggleFollow: (creatorId: number) => Promise<boolean>;
  toggleNotifications: (creatorId: number) => Promise<boolean>;
  isFollowing: (creatorId: number) => boolean;
  isNotified: (creatorId: number) => boolean;
  reset: () => void;
}

export const useCreatorStore = create<CreatorState>((set, get) => ({
  creators: {},
  followedCreators: [],
  followingStatus: {},
  notificationStatus: {},
  isLoading: false,
  error: null,

  fetchFollowedCreators: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get<FollowedCreator[]>('/api/users/me/following');
      const statusMap = Object.fromEntries(data.map((c) => [c.id, true]));
      set({
        followedCreators: data,
        followingStatus: statusMap,
        isLoading: false,
      });
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Followed creators fetch failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  fetchCreatorById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const creator = await api.get<Creator>(`/api/creators/${id}`).catch(() => null);
      if (creator) {
        set((s) => ({ creators: { ...s.creators, [id]: creator }, isLoading: false }));
      } else {
        set({ isLoading: false });
      }
      return creator;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Creator fetch failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  fetchCreatorContent: async (creatorId) => {
    return api.get<CreatorContent[]>(`/api/creators/${creatorId}/content`);
  },

  searchCreators: async (query) => {
    try {
      return await api.get<CreatorSearchResult[]>(
        `/api/creators/search?query=${encodeURIComponent(query)}`,
      );
    } catch {
      return [];
    }
  },

  toggleFollow: async (creatorId) => {
    const res = await api.post<{ following: boolean; followerCount: number }>(
      `/api/creators/${creatorId}/follow`,
    );
    const currentCreator = get().creators[creatorId];
    set({
      followingStatus: { ...get().followingStatus, [creatorId]: res.following },
      creators: currentCreator
        ? { ...get().creators, [creatorId]: { ...currentCreator, followers: res.followerCount } }
        : get().creators,
    });
    if (!res.following) {
      set({
        followedCreators: get().followedCreators.filter((c) => c.id !== creatorId),
      });
    } else {
      void get().fetchFollowedCreators();
    }
    return res.following;
  },

  toggleNotifications: async (creatorId) => {
    const res = await api.post<{ notificationsEnabled: boolean }>(
      `/api/creators/${creatorId}/notifications`,
    );
    set({
      notificationStatus: {
        ...get().notificationStatus,
        [creatorId]: res.notificationsEnabled,
      },
    });
    return res.notificationsEnabled;
  },

  isFollowing: (creatorId) => !!get().followingStatus[creatorId],
  isNotified: (creatorId) => !!get().notificationStatus[creatorId],

  reset: () => set({
    creators: {},
    followedCreators: [],
    followingStatus: {},
    notificationStatus: {},
    isLoading: false,
    error: null,
  }),
}));
