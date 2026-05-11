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
import { api } from '../lib/api';

interface SubscriptionState {
  pricingPlans: PricingPlan[];
  checkoutPlans: CheckoutPlan[];
  yearlyTogglePlans: YearlyTogglePlan[];
  status: SubscriptionStatus;
  statusFetched: boolean;
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
  reset: () => void;
}

const EMPTY_STATUS: SubscriptionStatus = {
  planName: 'Ücretsiz',
  price: 0,
  isActive: false,
  nextBillingDate: '',
  features: [],
};

const EMPTY_USAGE: UsageQuota = {
  apiCallsUsed: 0,
  apiCallsLimit: 0,
  storageUsedGb: 0,
  storageLimitGb: 0,
  teamMembersUsed: 0,
  teamMembersLimit: 0,
};

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  pricingPlans: [],
  checkoutPlans: [],
  yearlyTogglePlans: [],
  status: EMPTY_STATUS,
  statusFetched: false,
  billingHistory: [],
  usageQuota: EMPTY_USAGE,
  isLoading: false,
  error: null,

  fetchPricingPlans: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get<PricingPlan[]>('/api/plans/pricing');
      set({ pricingPlans: data, isLoading: false });
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Pricing plans fetch failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  fetchCheckoutPlans: async () => {
    const data = await api.get<CheckoutPlan[]>('/api/plans/checkout');
    set({ checkoutPlans: data });
    return data;
  },

  fetchYearlyTogglePlans: async () => {
    const data = await api.get<YearlyTogglePlan[]>('/api/plans/marketing');
    set({ yearlyTogglePlans: data });
    return data;
  },

  fetchSubscriptionStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get<SubscriptionStatus>('/api/users/me/subscription');
      set({ status: data, isLoading: false, statusFetched: true });
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Subscription status fetch failed';
      set({ error: message, isLoading: false, statusFetched: true });
      throw err;
    }
  },

  fetchBillingHistory: async () => {
    const data = await api.get<BillingHistoryItem[]>('/api/users/me/billing');
    set({ billingHistory: data });
    return data;
  },

  fetchUsageQuota: async () => {
    const data = await api.get<UsageQuota>('/api/users/me/usage');
    set({ usageQuota: data });
    return data;
  },

  submitPayment: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<{
        success: boolean;
        subscription: SubscriptionStatus;
      }>('/api/payments', payload);
      set({ status: res.subscription, isLoading: false });
      return { success: res.success };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  cancelSubscription: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.del('/api/users/me/subscription');
      await get().fetchSubscriptionStatus();
      set({ isLoading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Cancel subscription failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  reset: () => set({
    pricingPlans: [],
    checkoutPlans: [],
    yearlyTogglePlans: [],
    status: EMPTY_STATUS,
    statusFetched: false,
    billingHistory: [],
    usageQuota: EMPTY_USAGE,
    isLoading: false,
    error: null,
  }),
}));
