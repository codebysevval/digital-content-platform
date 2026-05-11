import { create } from 'zustand';
import type { CreatorApplicationDTO, CreatorProfileUpdateRequest } from '../types';
import { api } from '../lib/api';
import { useAuthStore } from './authStore';

interface CreatorApplicationState {
  myApplication: CreatorApplicationDTO | null;
  myApplicationFetched: boolean;
  applications: CreatorApplicationDTO[];
  isLoading: boolean;
  error: string | null;

  fetchMyApplication: () => Promise<void>;
  submitApplication: (rationale: string) => Promise<void>;
  fetchApplications: () => Promise<void>;
  approveApplication: (id: number) => Promise<void>;
  rejectApplication: (id: number, reason: string) => Promise<void>;
  updateCreatorProfile: (payload: CreatorProfileUpdateRequest) => Promise<void>;
  reset: () => void;
}

export const useCreatorApplicationStore = create<CreatorApplicationState>((set, get) => ({
  myApplication: null,
  myApplicationFetched: false,
  applications: [],
  isLoading: false,
  error: null,

  fetchMyApplication: async () => {
    set({ isLoading: true, error: null });
    try {
      // 204 → undefined (no application), 200 → DTO
      const dto = await api.get<CreatorApplicationDTO>('/api/creator-applications/me');
      set({ myApplication: dto ?? null, myApplicationFetched: true, isLoading: false });
      // If admin approved while the user was logged in, refresh their role seamlessly.
      if (dto?.status === 'approved') {
        const auth = useAuthStore.getState();
        if (auth.user?.role === 'user') {
          void auth.fetchCurrentUser().catch(() => {});
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Başvuru durumu alınamadı';
      set({ error: message, isLoading: false, myApplicationFetched: true });
    }
  },

  submitApplication: async (rationale) => {
    set({ isLoading: true, error: null });
    try {
      const dto = await api.post<CreatorApplicationDTO>('/api/creator-applications', { rationale });
      set({ myApplication: dto, myApplicationFetched: true, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Başvuru gönderilemedi';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  fetchApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get<CreatorApplicationDTO[]>('/api/admin/creator-applications');
      set({ applications: data, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Başvurular alınamadı';
      set({ error: message, isLoading: false });
    }
  },

  approveApplication: async (id) => {
    await api.post(`/api/admin/creator-applications/${id}/approve`);
    set({ applications: get().applications.filter((a) => a.id !== id) });
  },

  rejectApplication: async (id, reason) => {
    await api.post(`/api/admin/creator-applications/${id}/reject`, { reason });
    set({ applications: get().applications.filter((a) => a.id !== id) });
  },

  updateCreatorProfile: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await api.put('/api/users/me/creator-profile', payload);
      set({ isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profil güncellenemedi';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  reset: () => set({
    myApplication: null,
    myApplicationFetched: false,
    applications: [],
    isLoading: false,
    error: null,
  }),
}));
