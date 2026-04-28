import { create } from 'zustand';
import type {
  Content,
  ContentCategory,
  ContentDetailDTO,
  ContentFilterParams,
  ContentSortBy,
  ContentTypeOption,
  LikedContentItem,
  RelatedContent,
  Topic,
} from '../types';
import {
  mockAllContent,
  mockContentDetails,
  mockContentTypes,
  mockLikedContent,
  mockTopics,
} from '../lib/mockData';

const FAKE_LATENCY_MS = 200;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface ContentState {
  topics: Topic[];
  contentTypes: ContentTypeOption[];
  catalog: Content[];
  isLoading: boolean;
  error: string | null;

  contentDetails: Record<number, ContentDetailDTO>;
  likedContentIds: number[];
  likedContentList: LikedContentItem[];

  fetchCatalog: () => Promise<Content[]>;
  fetchTopics: () => Promise<Topic[]>;
  fetchContentTypes: () => Promise<ContentTypeOption[]>;
  fetchContentById: (id: number) => Promise<ContentDetailDTO | null>;
  fetchRelatedContent: (id: number) => Promise<RelatedContent[]>;
  fetchLikedContent: () => Promise<LikedContentItem[]>;
  filterContent: (params: ContentFilterParams) => Promise<Content[]>;
  toggleLike: (id: number) => Promise<void>;
  isLiked: (id: number) => boolean;
}

const filterAndSort = (
  catalog: Content[],
  params: ContentFilterParams,
): Content[] => {
  const {
    category = 'all',
    topic = 'all',
    searchQuery = '',
    showSubscriberOnly = false,
    showFreeContent = true,
    selectedContentTypes = ['podcasts', 'magazines', 'newspapers', 'courses'],
    sortBy = 'newest',
  } = params;

  const byCategory =
    category === 'all'
      ? catalog
      : catalog.filter((item) => item.category === category);

  const filtered = byCategory.filter((item) => {
    const matchesTopic = topic === 'all' || item.topic === topic;
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesAccessFilter =
      (showSubscriberOnly && item.subscriberOnly) ||
      (showFreeContent && !item.subscriberOnly) ||
      (!showSubscriberOnly && !showFreeContent);
    const matchesContentType =
      selectedContentTypes.length === 0 ||
      selectedContentTypes.includes(item.category as ContentCategory);
    return matchesTopic && matchesSearch && matchesAccessFilter && matchesContentType;
  });

  return [...filtered].sort((a, b) => {
    switch (sortBy as ContentSortBy) {
      case 'newest':
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      case 'oldest':
        return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
      case 'popular':
        return b.views - a.views;
      default:
        return 0;
    }
  });
};

export const useContentStore = create<ContentState>((set, get) => ({
  topics: mockTopics,
  contentTypes: mockContentTypes,
  catalog: mockAllContent,
  contentDetails: mockContentDetails,
  likedContentIds: [],
  likedContentList: mockLikedContent,
  isLoading: false,
  error: null,

  fetchCatalog: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: replace with `await fetch('/api/content')`
      await wait(FAKE_LATENCY_MS);
      set({ catalog: mockAllContent, isLoading: false });
      return mockAllContent;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Catalog fetch failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  fetchTopics: async () => {
    // TODO: replace with `await fetch('/api/content/topics')`
    await wait(FAKE_LATENCY_MS);
    set({ topics: mockTopics });
    return mockTopics;
  },

  fetchContentTypes: async () => {
    // TODO: replace with `await fetch('/api/content/types')`
    await wait(FAKE_LATENCY_MS);
    set({ contentTypes: mockContentTypes });
    return mockContentTypes;
  },

  fetchContentById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: replace with `await fetch(`/api/content/${id}`)`
      await wait(FAKE_LATENCY_MS);
      const detail = mockContentDetails[id] ?? mockContentDetails[1] ?? null;
      set({ isLoading: false });
      return detail;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Detail fetch failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  fetchRelatedContent: async (id) => {
    // TODO: replace with `await fetch(`/api/content/${id}/related`)`
    await wait(FAKE_LATENCY_MS);
    const detail = get().contentDetails[id];
    const targetCategory = detail?.category;
    const candidates = get()
      .catalog.filter((c) => c.id !== id)
      .slice(0, 3)
      .map<RelatedContent>((c) => ({
        id: c.id,
        title: c.title,
        thumbnail: c.thumbnail,
        duration: c.duration,
      }));
    void targetCategory;
    return candidates;
  },

  fetchLikedContent: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: replace with `await fetch('/api/users/me/likes')`
      await wait(FAKE_LATENCY_MS);
      set({ likedContentList: mockLikedContent, isLoading: false });
      return mockLikedContent;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Liked content fetch failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  filterContent: async (params) => {
    // TODO: replace with `await fetch('/api/content/search?...')`
    await wait(FAKE_LATENCY_MS / 4);
    return filterAndSort(get().catalog, params);
  },

  toggleLike: async (id) => {
    // TODO: replace with `await fetch(`/api/content/${id}/like`, { method: 'POST' })`
    await wait(FAKE_LATENCY_MS / 4);
    const current = get().likedContentIds;
    const next = current.includes(id)
      ? current.filter((i) => i !== id)
      : [...current, id];
    set({ likedContentIds: next });
  },

  isLiked: (id) => get().likedContentIds.includes(id),
}));
