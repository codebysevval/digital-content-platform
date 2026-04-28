import { create } from 'zustand';
import type {
  BillingHistoryItem,
  CheckoutPlan,
  PaymentRequest,
  PricingPlan,
  SubscriptionStatus,
  UsageQuota,
  YearlyTogglePlan,
} from '../types';
import {
  mockBillingHistory,
  mockCheckoutPlans,
  mockPricingPlans,
  mockSubscriptionStatus,
  mockUsageQuota,
  mockYearlyTogglePlans,
} from '../lib/mockData';
import { apiRequest } from '../lib/api';

interface BackendSubscription {
  id: number;
  planName: string;
  price: number;
  currency: string;
  billingCycle: string;
  startDate: string;
  endDate: string;
  active: boolean;
  userId: number;
}

interface BackendDashboardResponse {
  stats: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalContents: number;
    premiumContents: number;
    totalCategories: number;
  };
  subscriptions: BackendSubscription[];
}

interface SubscriptionState {
  pricingPlans: PricingPlan[];
  checkoutPlans: CheckoutPlan[];
  yearlyTogglePlans: YearlyTogglePlan[];
  status: SubscriptionStatus;
  billingHistory: BillingHistoryItem[];
  usageQuota: UsageQuota;
  isLoading: boolean;
  error: string | null;

  fetchPricingPlans: () => Promise<PricingPlan[]>;
  fetchCheckoutPlans: () => Promise<CheckoutPlan[]>;
  fetchYearlyTogglePlans: () => Promise<YearlyTogglePlan[]>;
  fetchSubscriptionStatus: () => Promise<SubscriptionStatus>;
  fetchBillingHistory: () => Promise<BillingHistoryItem[]>;
  fetchUsageQuota: () => Promise<UsageQuota>;
  submitPayment: (payload: PaymentRequest) => Promise<{ success: boolean }>;
  cancelSubscription: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  pricingPlans: mockPricingPlans,
  checkoutPlans: mockCheckoutPlans,
  yearlyTogglePlans: mockYearlyTogglePlans,
  status: mockSubscriptionStatus,
  billingHistory: mockBillingHistory,
  usageQuota: mockUsageQuota,
  isLoading: false,
  error: null,

  fetchPricingPlans: async () => {
    set({ pricingPlans: mockPricingPlans, isLoading: false });
    return mockPricingPlans;
  },

  fetchCheckoutPlans: async () => {
    set({ checkoutPlans: mockCheckoutPlans });
    return mockCheckoutPlans;
  },

  fetchYearlyTogglePlans: async () => {
    set({ yearlyTogglePlans: mockYearlyTogglePlans });
    return mockYearlyTogglePlans;
  },

  fetchSubscriptionStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const dashboard = await apiRequest<BackendDashboardResponse>('/api/dashboard/me');
      const active =
        dashboard.subscriptions.find((item) => item.active) ?? dashboard.subscriptions[0];
      const status: SubscriptionStatus = active
        ? {
            planName: active.planName,
            price: active.price,
            isActive: active.active,
            nextBillingDate: new Date(active.endDate).toLocaleDateString('tr-TR'),
            features: [
              `Toplam içerik erişimi: ${dashboard.stats.totalContents}`,
              `Premium içerik: ${dashboard.stats.premiumContents}`,
              `Aktif abonelik: ${dashboard.stats.activeSubscriptions}`,
            ],
          }
        : { ...mockSubscriptionStatus, isActive: false };
      set({ status, isLoading: false });
      return status;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Subscription status fetch failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  fetchBillingHistory: async () => {
    const dashboard = await apiRequest<BackendDashboardResponse>('/api/dashboard/me');
    const billingHistory: BillingHistoryItem[] = dashboard.subscriptions.map((item) => ({
      id: item.id,
      date: new Date(item.startDate).toLocaleDateString('tr-TR'),
      amount: `${item.currency} ${item.price.toLocaleString('tr-TR')}`,
      plan: item.planName,
      status: item.active ? 'Ödendi' : 'Pasif',
    }));
    set({ billingHistory });
    return billingHistory;
  },

  fetchUsageQuota: async () => {
    const dashboard = await apiRequest<BackendDashboardResponse>('/api/dashboard/me');
    const usageQuota: UsageQuota = {
      apiCallsUsed: Number(dashboard.stats.totalContents) * 120,
      apiCallsLimit: 10000,
      storageUsedGb: Number(dashboard.stats.premiumContents) * 2,
      storageLimitGb: 100,
      teamMembersUsed: Number(dashboard.stats.activeSubscriptions),
      teamMembersLimit: 15,
    };
    set({ usageQuota });
    return usageQuota;
  },

  submitPayment: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const current = get().status;
      const matchedPlan =
        get().pricingPlans.find((p) => p.id === payload.planId) ??
        get().checkoutPlans.find((p) => p.id === payload.planId);
      set({
        isLoading: false,
        status: {
          ...current,
          isActive: true,
          planName: matchedPlan?.name ?? current.planName,
          price: matchedPlan?.price ?? current.price,
        },
      });
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  cancelSubscription: async () => {
    set({ status: { ...get().status, isActive: false } });
  },
}));
