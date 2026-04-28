import { create } from 'zustand';
import type {
  AdminStats,
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
import {
  mockAdminStats,
  mockDistributionRegions,
  mockDistributionStats,
  mockFinancialData,
  mockManagedUsersAdminPanel,
  mockManagedUsersDashboard,
  mockPendingContent,
  mockRevenueData,
  mockSystemModules,
  mockWeeklyDelivery,
} from '../lib/mockData';

const FAKE_LATENCY_MS = 200;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

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
}

export const useAdminStore = create<AdminState>((set, get) => ({
  pendingContent: mockPendingContent,
  financialData: mockFinancialData,
  revenueData: mockRevenueData,
  managedUsersDashboard: mockManagedUsersDashboard,
  managedUsersAdminPanel: mockManagedUsersAdminPanel,
  systemModules: mockSystemModules,
  distributionRegions: mockDistributionRegions,
  distributionStats: mockDistributionStats,
  weeklyDelivery: mockWeeklyDelivery,
  stats: mockAdminStats,
  isLoading: false,
  error: null,

  fetchPendingContent: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: replace with `await fetch('/api/admin/content/pending')`
      await wait(FAKE_LATENCY_MS);
      set({ pendingContent: mockPendingContent, isLoading: false });
      return mockPendingContent;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Pending content fetch failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  approveContent: async (id) => {
    // TODO: replace with `await fetch(`/api/admin/content/${id}/approve`, { method: 'POST' })`
    await wait(FAKE_LATENCY_MS / 2);
    set({
      pendingContent: get().pendingContent.filter((item) => item.id !== id),
    });
  },

  rejectContent: async ({ contentId, reason }) => {
    // TODO: replace with `await fetch(`/api/admin/content/${contentId}/reject`, { method: 'POST', body: JSON.stringify({ reason }) })`
    await wait(FAKE_LATENCY_MS / 2);
    void reason;
    set({
      pendingContent: get().pendingContent.filter(
        (item) => item.id !== contentId,
      ),
    });
  },

  fetchFinancialData: async () => {
    // TODO: replace with `await fetch('/api/admin/analytics/financial')`
    await wait(FAKE_LATENCY_MS);
    set({ financialData: mockFinancialData });
    return mockFinancialData;
  },

  fetchRevenueData: async () => {
    // TODO: replace with `await fetch('/api/admin/analytics/revenue')`
    await wait(FAKE_LATENCY_MS);
    set({ revenueData: mockRevenueData });
    return mockRevenueData;
  },

  fetchManagedUsersDashboard: async () => {
    // TODO: replace with `await fetch('/api/admin/users')`
    await wait(FAKE_LATENCY_MS);
    set({ managedUsersDashboard: mockManagedUsersDashboard });
    return mockManagedUsersDashboard;
  },

  fetchManagedUsersAdminPanel: async () => {
    // TODO: replace with `await fetch('/api/admin/users?context=panel')`
    await wait(FAKE_LATENCY_MS);
    set({ managedUsersAdminPanel: mockManagedUsersAdminPanel });
    return mockManagedUsersAdminPanel;
  },

  fetchSystemModules: async () => {
    // TODO: replace with `await fetch('/api/admin/system/modules')`
    await wait(FAKE_LATENCY_MS);
    set({ systemModules: mockSystemModules });
    return mockSystemModules;
  },

  fetchDistributionRegions: async () => {
    // TODO: replace with `await fetch('/api/admin/distribution/regions')`
    await wait(FAKE_LATENCY_MS);
    set({ distributionRegions: mockDistributionRegions });
    return mockDistributionRegions;
  },

  fetchDistributionStats: async () => {
    // TODO: replace with `await fetch('/api/admin/distribution/stats')`
    await wait(FAKE_LATENCY_MS);
    set({ distributionStats: mockDistributionStats });
    return mockDistributionStats;
  },

  fetchWeeklyDelivery: async () => {
    // TODO: replace with `await fetch('/api/admin/distribution/weekly')`
    await wait(FAKE_LATENCY_MS);
    set({ weeklyDelivery: mockWeeklyDelivery });
    return mockWeeklyDelivery;
  },

  fetchAdminStats: async () => {
    // TODO: replace with `await fetch('/api/admin/stats')`
    await wait(FAKE_LATENCY_MS);
    set({ stats: mockAdminStats });
    return mockAdminStats;
  },
}));
