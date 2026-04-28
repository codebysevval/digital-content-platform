import { create } from 'zustand';
import type {
  AuthResponse,
  LoginRequest,
  PasswordChangeRequest,
  ProfileUpdateRequest,
  SignupRequest,
  User,
  UserMenuItem,
  UserRole,
} from '../types';
import { mockCurrentUser, mockUserMenuItems } from '../lib/mockData';

const FAKE_LATENCY_MS = 200;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  menuItems: UserMenuItem[];

  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  signup: (payload: SignupRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<User>;
  updateProfile: (payload: ProfileUpdateRequest) => Promise<User>;
  changePassword: (payload: PasswordChangeRequest) => Promise<void>;
  setRole: (role: UserRole) => void;
  getVisibleMenuItems: () => UserMenuItem[];
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: mockCurrentUser,
  isAuthenticated: true,
  isLoading: false,
  error: null,
  menuItems: mockUserMenuItems,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: replace with `await fetch('/api/auth/login', { ... })`
      await wait(FAKE_LATENCY_MS);
      const user: User = { ...mockCurrentUser, email: credentials.email };
      const response: AuthResponse = { user, token: 'mock-jwt-token' };
      set({ user, isAuthenticated: true, isLoading: false });
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  signup: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: replace with `await fetch('/api/auth/signup', { ... })`
      await wait(FAKE_LATENCY_MS);
      const user: User = {
        ...mockCurrentUser,
        name: payload.name,
        email: payload.email,
        avatarInitials: payload.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase(),
      };
      const response: AuthResponse = { user, token: 'mock-jwt-token' };
      set({ user, isAuthenticated: true, isLoading: false });
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    // TODO: replace with `await fetch('/api/auth/logout', { method: 'POST' })`
    await wait(FAKE_LATENCY_MS);
    set({ user: null, isAuthenticated: false });
  },

  fetchCurrentUser: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: replace with `await fetch('/api/auth/me')`
      await wait(FAKE_LATENCY_MS);
      set({ user: mockCurrentUser, isAuthenticated: true, isLoading: false });
      return mockCurrentUser;
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
      // TODO: replace with `await fetch('/api/users/me', { method: 'PUT', ... })`
      await wait(FAKE_LATENCY_MS);
      const updated: User = { ...current, name: payload.name, email: payload.email };
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
      // TODO: replace with `await fetch('/api/users/me/password', { method: 'PUT', ... })`
      await wait(FAKE_LATENCY_MS);
      set({ isLoading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Password change failed';
      set({ error: message, isLoading: false });
      throw err;
    }
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
