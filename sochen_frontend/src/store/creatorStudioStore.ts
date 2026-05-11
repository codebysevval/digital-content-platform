import { create } from 'zustand';
import type {
  ContentUpdatePayload,
  CreatorFollower,
  CreatorStudioStats,
  EarningsHistoryEntry,
  MyContentItem,
  NewContentRequest,
  UploadResponse,
} from '../types';
import { api, API_BASE_URL } from '../lib/api';

interface UploadSlot {
  url: string | null;
  progress: number;
  isUploading: boolean;
  fileName: string | null;
  pageCount?: number | null;
}

interface CreatorStudioState {
  stats: CreatorStudioStats;
  mediaUpload: UploadSlot;
  thumbnailUpload: UploadSlot;
  attachmentUpload: UploadSlot;
  isLoading: boolean;
  error: string | null;
  myContent: MyContentItem[];
  earningsHistory: EarningsHistoryEntry[];
  followers: CreatorFollower[];

  fetchStats: () => Promise<CreatorStudioStats>;
  uploadMedia: (file: File) => Promise<void>;
  uploadThumbnail: (file: File) => Promise<void>;
  uploadAttachment: (file: File) => Promise<void>;
  clearUploads: () => void;
  publishContent: (payload: NewContentRequest) => Promise<{ id: number }>;
  fetchMyContent: () => Promise<MyContentItem[]>;
  updateContent: (id: number, payload: ContentUpdatePayload) => Promise<void>;
  deleteContent: (id: number) => Promise<void>;
  fetchEarningsHistory: () => Promise<EarningsHistoryEntry[]>;
  fetchFollowers: () => Promise<CreatorFollower[]>;
  reset: () => void;
}

const EMPTY_STATS: CreatorStudioStats = {
  totalContent: 0,
  totalViews: '0',
  engagementRate: '%0',
  monthlyEarnings: '₺0',
  totalEarnings: '₺0',
};

const EMPTY_SLOT: UploadSlot = { url: null, progress: 0, isUploading: false, fileName: null, pageCount: null };

function xhrUpload(
  file: File,
  onProgress: (p: number) => void,
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const token = localStorage.getItem('sochen_token');
    xhr.open('POST', `${API_BASE_URL}/api/creator-studio/uploads`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText) as UploadResponse);
      } else {
        reject(new Error(`Yükleme başarısız: HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Ağ hatası, lütfen tekrar deneyin'));
    xhr.ontimeout = () => reject(new Error('Yükleme zaman aşımına uğradı'));
    xhr.timeout = 120_000;
    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
  });
}

export const useCreatorStudioStore = create<CreatorStudioState>((set, get) => ({
  stats: EMPTY_STATS,
  mediaUpload: EMPTY_SLOT,
  thumbnailUpload: EMPTY_SLOT,
  attachmentUpload: EMPTY_SLOT,
  isLoading: false,
  error: null,
  myContent: [],
  earningsHistory: [],
  followers: [],

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get<CreatorStudioStats>('/api/creator-studio/stats');
      set({ stats: data, isLoading: false });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'İstatistikler alınamadı';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  uploadMedia: (file: File) =>
    new Promise<void>((resolve, reject) => {
      set({ mediaUpload: { url: null, progress: 0, isUploading: true, fileName: file.name, pageCount: null } });
      xhrUpload(file, (progress) =>
        set((s) => ({ mediaUpload: { ...s.mediaUpload, progress } })),
      )
        .then((result) => {
          set({ mediaUpload: { url: result.url, progress: 100, isUploading: false, fileName: file.name, pageCount: result.pageCount ?? null } });
          resolve();
        })
        .catch((err: Error) => {
          set({ mediaUpload: { url: null, progress: 0, isUploading: false, fileName: null, pageCount: null } });
          reject(err);
        });
    }),

  uploadThumbnail: (file: File) =>
    new Promise<void>((resolve, reject) => {
      set({ thumbnailUpload: { url: null, progress: 0, isUploading: true, fileName: file.name, pageCount: null } });
      xhrUpload(file, (progress) =>
        set((s) => ({ thumbnailUpload: { ...s.thumbnailUpload, progress } })),
      )
        .then((result) => {
          set({ thumbnailUpload: { url: result.url, progress: 100, isUploading: false, fileName: file.name, pageCount: null } });
          resolve();
        })
        .catch((err: Error) => {
          set({ thumbnailUpload: { url: null, progress: 0, isUploading: false, fileName: null, pageCount: null } });
          reject(err);
        });
    }),

  uploadAttachment: (file: File) =>
    new Promise<void>((resolve, reject) => {
      set({ attachmentUpload: { url: null, progress: 0, isUploading: true, fileName: file.name, pageCount: null } });
      xhrUpload(file, (progress) =>
        set((s) => ({ attachmentUpload: { ...s.attachmentUpload, progress } })),
      )
        .then((result) => {
          set({ attachmentUpload: { url: result.url, progress: 100, isUploading: false, fileName: file.name, pageCount: null } });
          resolve();
        })
        .catch((err: Error) => {
          set({ attachmentUpload: { url: null, progress: 0, isUploading: false, fileName: null, pageCount: null } });
          reject(err);
        });
    }),

  clearUploads: () =>
    set({
      mediaUpload: EMPTY_SLOT,
      thumbnailUpload: EMPTY_SLOT,
      attachmentUpload: EMPTY_SLOT,
    }),

  publishContent: async (payload) => {
    const { mediaUpload, thumbnailUpload, attachmentUpload } = get();
    const enriched: NewContentRequest = {
      ...payload,
      mediaUrl: mediaUpload.url ?? undefined,
      thumbnailUrl: thumbnailUpload.url ?? undefined,
      attachmentUrls: attachmentUpload.url ?? undefined,
    };
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<{ id: number }>('/api/creator-studio/content', enriched);
      set({ isLoading: false });
      return res;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Yayınlama başarısız';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  fetchMyContent: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get<MyContentItem[]>('/api/creator-studio/my-content');
      set({ myContent: data, isLoading: false });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'İçerikler alınamadı';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateContent: async (id, payload) => {
    await api.put<void>(`/api/creator-studio/content/${id}`, payload);
    set((s) => ({
      myContent: s.myContent.map((c) =>
        c.id === id
          ? {
              ...c,
              title: payload.title,
              description: payload.description,
              ...(payload.thumbnailUrl ? { thumbnail: payload.thumbnailUrl } : {}),
              ...(payload.topic ? { topic: payload.topic } : {}),
              ...(payload.category ? { category: payload.category.toLowerCase() } : {}),
            }
          : c,
      ),
    }));
  },

  deleteContent: async (id) => {
    await api.del(`/api/creator-studio/content/${id}`);
    set((s) => ({ myContent: s.myContent.filter((c) => c.id !== id) }));
  },

  fetchEarningsHistory: async () => {
    try {
      const data = await api.get<EarningsHistoryEntry[]>('/api/creator-studio/earnings-history');
      set({ earningsHistory: data });
      return data;
    } catch {
      return [];
    }
  },

  fetchFollowers: async () => {
    try {
      const data = await api.get<CreatorFollower[]>('/api/creator-studio/followers');
      set({ followers: data });
      return data;
    } catch {
      return [];
    }
  },

  reset: () =>
    set({
      stats: EMPTY_STATS,
      mediaUpload: EMPTY_SLOT,
      thumbnailUpload: EMPTY_SLOT,
      attachmentUpload: EMPTY_SLOT,
      isLoading: false,
      error: null,
      myContent: [],
      earningsHistory: [],
      followers: [],
    }),
}));
