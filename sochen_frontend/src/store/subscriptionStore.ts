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

const FAKE_LATENCY_MS = 200;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

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
    set({ isLoading: true, error: null });
    try {
      // TODO: replace with `await fetch('/api/plans/pricing')`
      await wait(FAKE_LATENCY_MS);
      set({ pricingPlans: mockPricingPlans, isLoading: false });
      return mockPricingPlans;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Pricing plans fetch failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  fetchCheckoutPlans: async () => {
    // TODO: replace with `await fetch('/api/plans/checkout')`
    await wait(FAKE_LATENCY_MS);
    set({ checkoutPlans: mockCheckoutPlans });
    return mockCheckoutPlans;
  },

  fetchYearlyTogglePlans: async () => {
    // TODO: replace with `await fetch('/api/plans/marketing')`
    await wait(FAKE_LATENCY_MS);
    set({ yearlyTogglePlans: mockYearlyTogglePlans });
    return mockYearlyTogglePlans;
  },

  fetchSubscriptionStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: replace with `await fetch('/api/users/me/subscription')`
      await wait(FAKE_LATENCY_MS);
      set({ status: mockSubscriptionStatus, isLoading: false });
      return mockSubscriptionStatus;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Subscription status fetch failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  fetchBillingHistory: async () => {
    // TODO: replace with `await fetch('/api/users/me/billing')`
    await wait(FAKE_LATENCY_MS);
    set({ billingHistory: mockBillingHistory });
    return mockBillingHistory;
  },

  fetchUsageQuota: async () => {
    // TODO: replace with `await fetch('/api/users/me/usage')`
    await wait(FAKE_LATENCY_MS);
    set({ usageQuota: mockUsageQuota });
    return mockUsageQuota;
  },

  submitPayment: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: replace with `await fetch('/api/payments', { method: 'POST', body: JSON.stringify(payload) })`
      // Dummy gateway: 1-second simulated network round-trip, no real provider call.
      await wait(1000);
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
    set({ isLoading: true, error: null });
    try {
      // TODO: replace with `await fetch('/api/users/me/subscription', { method: 'DELETE' })`
      await wait(FAKE_LATENCY_MS);
      set({
        status: { ...mockSubscriptionStatus, isActive: false },
        isLoading: false,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Cancel subscription failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },
}));
