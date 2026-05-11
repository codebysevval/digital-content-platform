import { create } from 'zustand';
import type {
  AdminStats,
  AdminUserItem,
  ContentRejection,
  DistributionRegion,
  DistributionStats,
  FinancialDataPoint,
  ManagedUser,
  PendingContent,
  RevenueDataPoint,
  SystemModule,
  WeeklyDeliveryDay,
} from '../types';
import { api } from '../lib/api';
import { useContentStore } from './contentStore';

interface AdminState {
  pendingContent: PendingContent[];
  financialData: FinancialDataPoint[];
  revenueData: RevenueDataPoint[];
  managedUsersDashboard: ManagedUser[];
  managedUsersAdminPanel: ManagedUser[];
  systemModules: SystemModule[];
  distributionRegions: DistributionRegion[];
  distributionStats: DistributionStats;
  weeklyDelivery: WeeklyDeliveryDay[];
  stats: AdminStats;
  allUsers: AdminUserItem[];
  isLoading: boolean;
  error: string | null;

  fetchPendingContent: () => Promise<PendingContent[]>;
  approveContent: (id: number) => Promise<void>;
  rejectContent: (rejection: ContentRejection) => Promise<void>;
  fetchFinancialData: () => Promise<FinancialDataPoint[]>;
  fetchRevenueData: () => Promise<RevenueDataPoint[]>;
  fetchManagedUsersDashboard: () => Promise<ManagedUser[]>;
  fetchManagedUsersAdminPanel: () => Promise<ManagedUser[]>;
  fetchSystemModules: () => Promise<SystemModule[]>;
  fetchDistributionRegions: () => Promise<DistributionRegion[]>;
  fetchDistributionStats: () => Promise<DistributionStats>;
  fetchWeeklyDelivery: () => Promise<WeeklyDeliveryDay[]>;
  fetchAdminStats: () => Promise<AdminStats>;
  fetchAllUsers: () => Promise<AdminUserItem[]>;
  changeUserRole: (userId: number, role: string) => Promise<void>;
  grantSubscription: (userId: number, planId: string, months: number) => Promise<void>;
  simulateTraffic: (contentId: number, views: number, likes: number) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  deleteContent: (contentId: number) => Promise<void>;
  reset: () => void;
}

const EMPTY_ADMIN_STATS: AdminStats = {
  monthlyRevenue: '',
  monthlyRevenueChange: '',
  activeSubscribers: '',
  activeSubscribersChange: '',
  totalContent: '',
  totalContentChange: '',
  totalUsers: '',
  totalUsersChange: '',
  churnRate: '',
  churnRateChange: '',
  arpu: '',
  growthRate: '',
};

const EMPTY_DISTRIBUTION_STATS: DistributionStats = {
  activeRegions: 0,
  newRegions: 0,
  monthlyDistribution: '',
  pendingOrders: 0,
  deliveryRate: '',
};

export const useAdminStore = create<AdminState>((set, get) => ({
  pendingContent: [],
  financialData: [],
  revenueData: [],
  managedUsersDashboard: [],
  managedUsersAdminPanel: [],
  systemModules: [],
  distributionRegions: [],
  distributionStats: EMPTY_DISTRIBUTION_STATS,
  weeklyDelivery: [],
  stats: EMPTY_ADMIN_STATS,
  allUsers: [],
  isLoading: false,
  error: null,

  fetchPendingContent: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get<PendingContent[]>('/api/admin/content/pending');
      set({ pendingContent: data, isLoading: false });
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Pending content fetch failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  approveContent: async (id) => {
    await api.post(`/api/admin/content/${id}/approve`);
    set({
      pendingContent: get().pendingContent.filter((item) => item.id !== id),
    });
    // Refresh the public content catalog so the approved content appears immediately.
    void useContentStore.getState().fetchCatalog().catch(() => {});
  },

  rejectContent: async ({ contentId, reason }) => {
    await api.post(`/api/admin/content/${contentId}/reject`, { reason });
    set({
      pendingContent: get().pendingContent.filter(
        (item) => item.id !== contentId,
      ),
    });
  },

  fetchFinancialData: async () => {
    const data = await api.get<FinancialDataPoint[]>(
      '/api/admin/analytics/financial',
    );
    set({ financialData: data });
    return data;
  },

  fetchRevenueData: async () => {
    const data = await api.get<RevenueDataPoint[]>(
      '/api/admin/analytics/revenue',
    );
    set({ revenueData: data });
    return data;
  },

  fetchManagedUsersDashboard: async () => {
    const data = await api.get<ManagedUser[]>('/api/admin/users');
    set({ managedUsersDashboard: data });
    return data;
  },

  fetchManagedUsersAdminPanel: async () => {
    const data = await api.get<ManagedUser[]>('/api/admin/users?context=panel');
    set({ managedUsersAdminPanel: data });
    return data;
  },

  fetchSystemModules: async () => {
    const data = await api.get<SystemModule[]>('/api/admin/system/modules');
    set({ systemModules: data });
    return data;
  },

  fetchDistributionRegions: async () => {
    const data = await api.get<DistributionRegion[]>(
      '/api/admin/distribution/regions',
    );
    set({ distributionRegions: data });
    return data;
  },

  fetchDistributionStats: async () => {
    const data = await api.get<DistributionStats>(
      '/api/admin/distribution/stats',
    );
    set({ distributionStats: data });
    return data;
  },

  fetchWeeklyDelivery: async () => {
    const data = await api.get<WeeklyDeliveryDay[]>(
      '/api/admin/distribution/weekly',
    );
    set({ weeklyDelivery: data });
    return data;
  },

  fetchAdminStats: async () => {
    const data = await api.get<AdminStats>('/api/admin/stats');
    set({ stats: data });
    return data;
  },

  fetchAllUsers: async () => {
    const data = await api.get<AdminUserItem[]>('/api/admin/dev/users');
    set({ allUsers: data });
    return data;
  },

  changeUserRole: async (userId, role) => {
    await api.put(`/api/admin/dev/users/${userId}/role`, { role });
    set({
      allUsers: get().allUsers.map((u) =>
        u.id === userId ? { ...u, role } : u,
      ),
    });
  },

  grantSubscription: async (userId, planId, months) => {
    await api.post(`/api/admin/dev/users/${userId}/grant-subscription`, { planId, months });
    set({
      allUsers: get().allUsers.map((u) =>
        u.id === userId ? { ...u, hasSubscription: true } : u,
      ),
    });
  },

  simulateTraffic: async (contentId, views, likes) => {
    await api.post(`/api/admin/dev/content/${contentId}/simulate-traffic`, { views, likes });
  },

  deleteUser: async (userId) => {
    await api.del(`/api/admin/dev/users/${userId}`);
    set({ allUsers: get().allUsers.filter((u) => u.id !== userId) });
  },

  deleteContent: async (contentId) => {
    await api.del(`/api/admin/dev/content/${contentId}`);
  },

  reset: () => set({
    pendingContent: [],
    financialData: [],
    revenueData: [],
    managedUsersDashboard: [],
    managedUsersAdminPanel: [],
    systemModules: [],
    distributionRegions: [],
    distributionStats: EMPTY_DISTRIBUTION_STATS,
    weeklyDelivery: [],
    stats: EMPTY_ADMIN_STATS,
    allUsers: [],
    isLoading: false,
    error: null,
  }),
}));
