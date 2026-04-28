/**
 * Global TypeScript Domain Types (DTOs)
 *
 * These interfaces define the shape of data passed between the React frontend
 * and the future Java Spring Boot RESTful API backend. They are designed to
 * mirror the backend DTOs (Data Transfer Objects) field-for-field.
 *
 * Convention:
 *  - Field names use camelCase (Spring/Jackson default).
 *  - Date fields are ISO-8601 strings (yyyy-MM-dd) or display strings as
 *    documented per field.
 *  - Numeric ids are `number` (Java `Long`).
 *  - Discriminator/enum-like fields are typed as string literal unions.
 */

/* ------------------------------------------------------------------ */
/*  Authentication & User                                              */
/* ------------------------------------------------------------------ */

export type UserRole = 'user' | 'creator' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  avatarInitials: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ProfileUpdateRequest {
  name: string;
  email: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/* ------------------------------------------------------------------ */
/*  Catalog: Content                                                   */
/* ------------------------------------------------------------------ */

export type ContentCategory = 'courses' | 'podcasts' | 'magazines' | 'newspapers';

export type ContentSortBy = 'newest' | 'oldest' | 'popular';

export interface Topic {
  id: string;
  label: string;
}

export interface ContentTypeOption {
  id: ContentCategory;
  label: string;
}

/**
 * Slim content card DTO returned by the catalog/list endpoints.
 */
export interface Content {
  id: number;
  title: string;
  category: ContentCategory;
  topic: string;
  thumbnail: string;
  duration: string;
  subscriberOnly: boolean;
  /** ISO date string yyyy-MM-dd */
  uploadDate: string;
  views: number;
  creator: string;
  creatorId: number;
  description: string;
}

export interface ContentModule {
  title: string;
  duration: string;
}

/**
 * Full content detail DTO returned by GET /api/content/{id}
 */
export interface ContentDetailDTO {
  id: number;
  title: string;
  /** Display label e.g. "Video Kurs", "Podcast", "Dergi", "Gazete" */
  category: string;
  thumbnail: string;
  duration: string;
  subscriberOnly: boolean;
  /** Display formatted date string e.g. "15.04.2026" */
  uploadDate: string;
  views: number;
  creator: string;
  creatorId: number;
  description: string;
  modules?: ContentModule[];
  topics?: string[];
}

export interface ContentFilterParams {
  category?: ContentCategory | 'all';
  topic?: string;
  searchQuery?: string;
  showSubscriberOnly?: boolean;
  showFreeContent?: boolean;
  selectedContentTypes?: ContentCategory[];
  sortBy?: ContentSortBy;
}

export interface RelatedContent {
  id: number;
  title: string;
  thumbnail: string;
  duration: string;
}

/* ------------------------------------------------------------------ */
/*  Creators                                                           */
/* ------------------------------------------------------------------ */

export interface Creator {
  id: number;
  name: string;
  avatar: string;
  type: string;
  bio: string;
  followers: number;
  totalContent: number;
  totalViews: number;
}

/**
 * Sidebar "followed creators" projection.
 */
export interface FollowedCreator {
  id: number;
  name: string;
  avatar: string;
  /** Display formatted follower count e.g. "12.5B" */
  followers: string;
}

/**
 * Lightweight content reference for a creator profile timeline.
 */
export interface CreatorContent {
  id: number;
  title: string;
  thumbnail: string;
  duration: string;
  subscriberOnly: boolean;
  views: number;
  /** ISO date yyyy-MM-dd */
  uploadDate: string;
}

/* ------------------------------------------------------------------ */
/*  Liked / Offline                                                    */
/* ------------------------------------------------------------------ */

export interface LikedContentItem {
  id: number;
  title: string;
  category: ContentCategory;
  thumbnail: string;
  duration: string;
  subscriberOnly: boolean;
  views: number;
  creator: string;
  /** ISO date string yyyy-MM-dd */
  uploadDate: string;
}

export interface OfflineContentItem {
  id: number;
  title: string;
  category: ContentCategory;
  thumbnail: string;
  /** Human-readable size e.g. "450 MB" */
  size: string;
  /** Display date string e.g. "15.04.2026" */
  downloadDate: string;
  duration: string;
  views: number;
  subscriberOnly: boolean;
  creator: string;
}

/* ------------------------------------------------------------------ */
/*  Subscriptions / Pricing / Billing                                  */
/* ------------------------------------------------------------------ */

export type PlanIconKey = 'zap' | 'star' | 'building2';

/**
 * Pricing card for the unified Pricing+Checkout flow.
 */
export interface PricingPlan {
  id: string;
  name: string;
  iconKey: PlanIconKey;
  price: number;
  period: string;
  description: string;
  features: string[];
  color: string;
  isFree?: boolean;
  recommended?: boolean;
  savings?: string;
}

/**
 * Pricing card used by the standalone CheckoutFlow page.
 */
export interface CheckoutPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  popular?: boolean;
  savings?: string;
  features: string[];
}

/**
 * Pricing card used by the marketing PricingPage with a yearly toggle.
 */
export interface YearlyTogglePlan {
  name: string;
  iconKey: PlanIconKey;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  color: string;
  recommended?: boolean;
}

export interface BillingHistoryItem {
  id: number;
  /** Display date string e.g. "19.03.2026" */
  date: string;
  /** Human-readable amount e.g. "₺1.650" */
  amount: string;
  plan: string;
  status: string;
}

export interface SubscriptionStatus {
  planName: string;
  /** Numeric monthly cost */
  price: number;
  isActive: boolean;
  /** Display date string e.g. "19 Mayıs 2026" */
  nextBillingDate: string;
  features: string[];
}

export interface UsageQuota {
  apiCallsUsed: number;
  apiCallsLimit: number;
  storageUsedGb: number;
  storageLimitGb: number;
  teamMembersUsed: number;
  teamMembersLimit: number;
}

export interface PaymentRequest {
  planId: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardholderName: string;
}

/* ------------------------------------------------------------------ */
/*  Admin                                                              */
/* ------------------------------------------------------------------ */

export interface PendingContent {
  id: number;
  title: string;
  creator: string;
  type: string;
  /** Display date string e.g. "18.04.2026" */
  uploadDate: string;
  thumbnail: string;
}

export interface ContentRejection {
  contentId: number;
  reason: string;
}

export interface FinancialDataPoint {
  month: string;
  mrr: number;
  subscribers: number;
}

export interface RevenueDataPoint {
  month: string;
  mrr: number;
}

export interface ManagedUser {
  id: number;
  name: string;
  email: string;
  tier: string;
  status: string;
  mrr: number;
}

export type SystemModuleStatus = 'online' | 'degraded';

export interface SystemModule {
  name: string;
  status: SystemModuleStatus;
  /** Display string e.g. "%99,9" */
  uptime: string;
  /** Display string e.g. "12,4B" */
  requests: string;
}

export type DistributionStatus = 'Aktif' | 'Beklemede';

export interface DistributionRegion {
  id: number;
  region: string;
  distributionPoints: string;
  monthlyAmount: string;
  /** Display date string */
  lastDelivery: string;
  status: DistributionStatus;
}

export interface AdminStats {
  monthlyRevenue: string;
  monthlyRevenueChange: string;
  activeSubscribers: string;
  activeSubscribersChange: string;
  totalContent: string;
  totalContentChange: string;
  totalUsers: string;
  totalUsersChange: string;
  churnRate: string;
  churnRateChange: string;
  arpu: string;
  growthRate: string;
}

export interface DistributionStats {
  activeRegions: number;
  newRegions: number;
  monthlyDistribution: string;
  pendingOrders: number;
  deliveryRate: string;
}

export interface WeeklyDeliveryDay {
  day: string;
  deliveryCount: number;
}

/* ------------------------------------------------------------------ */
/*  Creator Studio                                                     */
/* ------------------------------------------------------------------ */

export interface CreatorStudioStats {
  totalContent: number;
  /** Display string e.g. "12,4B" */
  totalViews: string;
  /** Display string e.g. "%87" */
  engagementRate: string;
  /** Display string e.g. "₺8.115" */
  monthlyEarnings: string;
}

export interface NewContentRequest {
  title: string;
  description: string;
  category: string;
  /** Topic id from mockTopics, e.g. 'software', 'economy'. */
  topic: string;
  duration: string;
  subscriberOnly: boolean;
}

/* ------------------------------------------------------------------ */
/*  UI / Navigation Configuration                                      */
/* ------------------------------------------------------------------ */

export type UserMenuIconKey =
  | 'creditCard'
  | 'upload'
  | 'shieldCheck'
  | 'settings'
  | 'logOut';

export interface UserMenuItem {
  id: string;
  label: string;
  iconKey: UserMenuIconKey;
  roles: UserRole[];
}
