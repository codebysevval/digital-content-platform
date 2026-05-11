import { create } from 'zustand';
import type {
  Content,
  ContentDetailDTO,
  ContentFilterParams,
  ContentTypeOption,
  LikedContentItem,
  RelatedContent,
  Topic,
} from '../types';
import { api } from '../lib/api';

interface ContentState {
  topics: Topic[];
  contentTypes: ContentTypeOption[];
  catalog: Content[];
  trendingFeed: Content[];
  recommendedFeed: Content[];
  followingFeed: Content[];
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
  fetchTrendingFeed: () => Promise<Content[]>;
  fetchRecommendedFeed: (category?: string) => Promise<Content[]>;
  fetchFollowingFeed: () => Promise<Content[]>;
  reset: () => void;
}

export const useContentStore = create<ContentState>((set, get) => ({
  topics: [],
  contentTypes: [],
  catalog: [],
  trendingFeed: [],
  recommendedFeed: [],
  followingFeed: [],
  contentDetails: {},
  likedContentIds: [],
  likedContentList: [],
  isLoading: false,
  error: null,

  fetchCatalog: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get<Content[]>('/api/content');
      set({ catalog: data, isLoading: false });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Catalog fetch failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  fetchTopics: async () => {
    const data = await api.get<Topic[]>('/api/content/topics');
    set({ topics: data });
    return data;
  },

  fetchContentTypes: async () => {
    const data = await api.get<ContentTypeOption[]>('/api/content/types');
    set({ contentTypes: data });
    return data;
  },

  fetchContentById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // The catch swallows 404s so the UI can render an empty/not-found state
      // without surfacing a generic error toast.
      const detail = await api
        .get<ContentDetailDTO>(`/api/content/${id}`)
        .catch(() => null);
      set({ isLoading: false });
      return detail;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Detail fetch failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  fetchRelatedContent: async (id) => {
    return api.get<RelatedContent[]>(`/api/content/${id}/related`);
  },

  fetchLikedContent: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get<LikedContentItem[]>('/api/users/me/likes');
      set({ likedContentList: data, isLoading: false });
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Liked content fetch failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  filterContent: async (params) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') {
      query.set('category', params.category);
    }
    if (params.topic && params.topic !== 'all') {
      query.set('topic', params.topic);
    }
    if (params.searchQuery) {
      query.set('searchQuery', params.searchQuery);
    }
    if (params.showSubscriberOnly) {
      query.set('showSubscriberOnly', 'true');
    }
    if (params.showFreeContent === false) {
      query.set('showFreeContent', 'false');
    }
    if (params.selectedContentTypes?.length) {
      query.set('selectedContentTypes', params.selectedContentTypes.join(','));
    }
    if (params.sortBy) {
      query.set('sortBy', params.sortBy);
    }
    return api.get<Content[]>(`/api/content/search?${query.toString()}`);
  },

  toggleLike: async (id) => {
    const res = await api.post<{ liked: boolean }>(`/api/content/${id}/like`);
    const current = get().likedContentIds;
    set({
      likedContentIds: res.liked
        ? [...current, id]
        : current.filter((i) => i !== id),
    });
  },

  isLiked: (id) => get().likedContentIds.includes(id),

  fetchTrendingFeed: async () => {
    const data = await api.get<Content[]>('/api/content/trending');
    set({ trendingFeed: data });
    return data;
  },

  fetchRecommendedFeed: async (category) => {
    const url = category
      ? `/api/content/recommended?category=${encodeURIComponent(category)}`
      : '/api/content/recommended';
    const data = await api.get<Content[]>(url);
    set({ recommendedFeed: data });
    return data;
  },

  fetchFollowingFeed: async () => {
    try {
      const data = await api.get<Content[]>('/api/content/following-feed');
      set({ followingFeed: data });
      return data;
    } catch {
      set({ followingFeed: [] });
      return [];
    }
  },

  reset: () => set({
    topics: [],
    contentTypes: [],
    catalog: [],
    trendingFeed: [],
    recommendedFeed: [],
    followingFeed: [],
    contentDetails: {},
    likedContentIds: [],
    likedContentList: [],
    isLoading: false,
    error: null,
  }),
}));
