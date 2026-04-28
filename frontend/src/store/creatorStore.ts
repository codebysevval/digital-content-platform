import { create } from 'zustand';
import type { Creator, CreatorContent, FollowedCreator } from '../types';
import {
  mockCreators,
  mockCreatorContent,
  mockFollowedCreators,
} from '../lib/mockData';

const FAKE_LATENCY_MS = 200;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

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
  toggleFollow: (creatorId: number) => Promise<boolean>;
  toggleNotifications: (creatorId: number) => Promise<boolean>;
  isFollowing: (creatorId: number) => boolean;
  isNotified: (creatorId: number) => boolean;
}

// Format a raw follower count into the display string used by the
// FollowedCreator DTO when re-adding a creator to the sidebar after a
// follow toggle.
const formatFollowerCount = (count: number): string => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}B`;
  return String(count);
};

const buildFollowedFromCreator = (id: number): FollowedCreator | null => {
  const known = mockFollowedCreators.find((c) => c.id === id);
  if (known) return known;
  const creator = mockCreators[id];
  if (!creator) return null;
  return {
    id: creator.id,
    name: creator.name,
    avatar: creator.avatar,
    followers: formatFollowerCount(creator.followers),
  };
};

export const useCreatorStore = create<CreatorState>((set, get) => ({
  creators: mockCreators,
  followedCreators: mockFollowedCreators,
  // Mark every sidebar-listed creator as currently followed so the toggle
  // state stays in sync with the visible list on first render.
  followingStatus: Object.fromEntries(
    mockFollowedCreators.map((c) => [c.id, true]),
  ),
  notificationStatus: { 1: true, 2: true, 3: true },
  isLoading: false,
  error: null,

  fetchFollowedCreators: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: replace with `await fetch('/api/users/me/following')`
      await wait(FAKE_LATENCY_MS);
      set({ followedCreators: mockFollowedCreators, isLoading: false });
      return mockFollowedCreators;
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
      // TODO: replace with `await fetch(`/api/creators/${id}`)`
      await wait(FAKE_LATENCY_MS);
      // Return null for unknown ids instead of silently falling back to
      // creator #1 — the previous fallback masked missing data and made
      // every unmapped sidebar entry render as Ayşe Demir.
      const creator = mockCreators[id] ?? null;
      set({ isLoading: false });
      return creator;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Creator fetch failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  fetchCreatorContent: async (creatorId) => {
    // TODO: replace with `await fetch(`/api/creators/${creatorId}/content`)`
    await wait(FAKE_LATENCY_MS);
    void creatorId;
    return mockCreatorContent;
  },

  toggleFollow: async (creatorId) => {
    // TODO: replace with `await fetch(`/api/creators/${creatorId}/follow`, { method: 'POST' })`
    await wait(FAKE_LATENCY_MS / 4);
    const { followingStatus, followedCreators } = get();
    const current = !!followingStatus[creatorId];
    const next = !current;

    if (!next) {
      // Unfollow: drop the creator from the sidebar list so they vanish from
      // the UI immediately, and clear the follow flag.
      set({
        followingStatus: { ...followingStatus, [creatorId]: false },
        followedCreators: followedCreators.filter((c) => c.id !== creatorId),
      });
      return next;
    }

    // Follow: re-attach to the sidebar list if we know how to render the
    // creator. If not present in the catalogue we just flip the flag.
    const alreadyListed = followedCreators.some((c) => c.id === creatorId);
    if (!alreadyListed) {
      const entry = buildFollowedFromCreator(creatorId);
      set({
        followingStatus: { ...followingStatus, [creatorId]: true },
        followedCreators: entry
          ? [...followedCreators, entry]
          : followedCreators,
      });
    } else {
      set({
        followingStatus: { ...followingStatus, [creatorId]: true },
      });
    }
    return next;
  },

  toggleNotifications: async (creatorId) => {
    // TODO: replace with `await fetch(`/api/creators/${creatorId}/notifications`, { method: 'POST' })`
    await wait(FAKE_LATENCY_MS / 4);
    const current = !!get().notificationStatus[creatorId];
    const next = !current;
    set({
      notificationStatus: { ...get().notificationStatus, [creatorId]: next },
    });
    return next;
  },

  isFollowing: (creatorId) => !!get().followingStatus[creatorId],
  isNotified: (creatorId) => !!get().notificationStatus[creatorId],
}));
