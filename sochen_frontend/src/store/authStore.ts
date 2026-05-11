import { create } from 'zustand';
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  PasswordChangeRequest,
  ProfileUpdateRequest,
  SignupRequest,
  User,
  UserMenuItem,
  UserRole,
} from '../types';
import { api, clearToken, setToken } from '../lib/api';
import { useContentStore } from './contentStore';
import { useCreatorStore } from './creatorStore';
import { useCreatorStudioStore } from './creatorStudioStore';
import { useOfflineStore } from './offlineStore';
import { useSubscriptionStore } from './subscriptionStore';
import { useAdminStore } from './adminStore';
import { useCreatorApplicationStore } from './creatorApplicationStore';
import { useNotificationStore } from './notificationStore';

/** Loads per-session data from the API before exposing `user` in the store (avoids stale follows/feeds). */
async function hydrateSessionStores(user: User): Promise<void> {
  const { fetchFollowedCreators } = useCreatorStore.getState();
  const {
    fetchFollowingFeed,
    fetchLikedContent,
    fetchTrendingFeed,
    fetchRecommendedFeed,
  } = useContentStore.getState();
  const { fetchSubscriptionStatus } = useSubscriptionStore.getState();
  const fav = user.favoriteCategory ?? undefined;
  await Promise.allSettled([
    fetchFollowedCreators(),
    fetchFollowingFeed(),
    fetchLikedContent(),
    fetchTrendingFeed(),
    fetchRecommendedFeed(fav),
    fetchSubscriptionStatus(),
  ]);
}

// UI navigation configuration — not API data, so it stays inlined here.
const MENU_ITEMS: UserMenuItem[] = [
  {
    id: 'pricing',
    label: 'Abonelik Planları',
    iconKey: 'creditCard',
    roles: ['user', 'creator', 'admin'],
  },
  {
    id: 'creator',
    label: 'İçerik Üretici Stüdyosu',
    iconKey: 'upload',
    roles: ['creator', 'admin'],
  },
  {
    id: 'admin',
    label: 'Yönetim Paneli',
    iconKey: 'shieldCheck',
    roles: ['admin'],
  },
];

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  menuItems: UserMenuItem[];

  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  signup: (payload: SignupRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  forgotPassword: (payload: ForgotPasswordRequest) => Promise<void>;
  fetchCurrentUser: () => Promise<User>;
  updateProfile: (payload: ProfileUpdateRequest) => Promise<User>;
  changePassword: (payload: PasswordChangeRequest) => Promise<void>;
  updateFavoriteCategory: (category: string) => Promise<void>;
  setRole: (role: UserRole) => void;
  getVisibleMenuItems: () => UserMenuItem[];
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  menuItems: MENU_ITEMS,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<AuthResponse>('/api/auth/login', credentials);
      setToken(res.token);
      await hydrateSessionStores(res.user);
      set({ user: res.user, isAuthenticated: true, isLoading: false });
      return res;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  signup: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<AuthResponse>('/api/auth/signup', payload);
      setToken(res.token);
      await hydrateSessionStores(res.user);
      set({ user: res.user, isAuthenticated: true, isLoading: false });
      return res;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    clearToken();
    set({ user: null, isAuthenticated: false, error: null });
    useContentStore.getState().reset();
    useCreatorStore.getState().reset();
    useCreatorStudioStore.getState().reset();
    useOfflineStore.getState().reset();
    useSubscriptionStore.getState().reset();
    useAdminStore.getState().reset();
    useCreatorApplicationStore.getState().reset();
    useNotificationStore.getState().reset();
    try {
      await api.post('/api/auth/logout');
    } catch {
      // local state already cleared above
    }
  },

  forgotPassword: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/api/auth/forgot-password', payload);
      set({ isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Şifre sıfırlama başarısız';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  fetchCurrentUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await api.get<User>('/api/auth/me');
      await hydrateSessionStores(user);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch user';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateProfile: async (payload) => {
    const current = get().user;
    if (!current) throw new Error('Not authenticated');
    set({ isLoading: true, error: null });
    try {
      const updated = await api.put<User>('/api/users/me', payload);
      set({ user: updated, isLoading: false });
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profile update failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  changePassword: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      if (payload.newPassword !== payload.confirmPassword) {
        throw new Error('Yeni şifreler eşleşmiyor');
      }
      await api.put('/api/users/me/password', payload);
      set({ isLoading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Password change failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateFavoriteCategory: async (category) => {
    const current = get().user;
    if (!current) return;
    await api.put('/api/users/me/favorite-category', { category });
    set({ user: { ...current, favoriteCategory: category } });
  },

  setRole: (role) => {
    const current = get().user;
    if (!current) return;
    set({ user: { ...current, role } });
  },

  getVisibleMenuItems: () => {
    const role = get().user?.role;
    if (!role) return [];
    return get().menuItems.filter((item) => item.roles.includes(role));
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener('unauthorized', () => {
    if (useAuthStore.getState().isAuthenticated) {
      void useAuthStore.getState().logout();
    }
  });
}
