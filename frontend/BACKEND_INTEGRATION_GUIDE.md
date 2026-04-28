# Backend Integration Guide

> **Audience:** Spring Boot backend team
> **Frontend:** React + Zustand + TypeScript (Vite)
> **Source of truth for DTOs:** `src/types/index.ts`
> **Source of truth for API call sites:** `src/store/*.ts`

This document describes **every HTTP endpoint** the frontend expects from the
backend. Each endpoint includes the suggested URL, request body, response
shape (referencing the TypeScript interface), and a brief description.

---

## Table of Contents

1. [Conventions](#1-conventions)
2. [Authentication & Users](#2-authentication--users)
3. [Content Catalog](#3-content-catalog)
4. [Liked Content](#4-liked-content)
5. [Creators & Following](#5-creators--following)
6. [Offline Library](#6-offline-library)
7. [Plans, Subscriptions & Billing](#7-plans-subscriptions--billing)
8. [Payments](#8-payments)
9. [Creator Studio](#9-creator-studio)
10. [Admin — Content Moderation](#10-admin--content-moderation)
11. [Admin — Analytics & Users](#11-admin--analytics--users)
12. [Admin — System & Distribution](#12-admin--system--distribution)
13. [Endpoint Summary Matrix](#13-endpoint-summary-matrix)
14. [Appendix — DTO Reference](#14-appendix--dto-reference)

---

## 1. Conventions

| Concern | Convention |
|---|---|
| Base path | `/api` (configurable via `VITE_API_BASE_URL`) |
| Auth | `Authorization: Bearer <jwt>` on all non-public endpoints |
| Content type | `application/json; charset=UTF-8` (except multipart upload) |
| Field casing | **camelCase** (Spring/Jackson default) |
| IDs | `number` on the wire (Java `Long`) — except plan ids, topic ids and user-menu ids which are stable string slugs |
| ISO date fields | `yyyy-MM-dd` (e.g. `Content.uploadDate`) |
| Display date fields | Pre-formatted `dd.MM.yyyy` or `"19 Mayıs 2026"` (see DTO doc-comments) |
| Error envelope | `{ "timestamp", "status", "error", "message", "path" }` (Spring default) |
| Pagination | Not yet required by the frontend — return full collections for now. When introduced, prefer `Page<T>` (`content`, `totalElements`, `number`, `size`). |
| Locale | Currency strings (e.g. `"₺1.650"`) and weekday/month abbreviations are computed **server-side** for fields documented as "Display string". |

---

## 2. Authentication & Users

Backed by `src/store/authStore.ts`. DTOs: `User`, `LoginRequest`,
`SignupRequest`, `AuthResponse`, `ProfileUpdateRequest`,
`PasswordChangeRequest`.

### 2.1 Endpoints

| # | Method | Path | Description |
|---|---|---|---|
| 2.1 | `POST` | `/api/auth/login` | Authenticate an existing user, returns JWT + user. |
| 2.2 | `POST` | `/api/auth/signup` | Register a new user, returns JWT + user. |
| 2.3 | `POST` | `/api/auth/logout` | Invalidate the caller's session/token. |
| 2.4 | `GET`  | `/api/auth/me` | Fetch the currently authenticated user. |
| 2.5 | `PUT`  | `/api/users/me` | Update the current user's profile (name, email). |
| 2.6 | `PUT`  | `/api/users/me/password` | Change the current user's password. |

### 2.2 `POST /api/auth/login`

**Request body** — `LoginRequest`

```json
{
  "email": "ahmet@sirket.com",
  "password": "********"
}
```

**Response 200** — `AuthResponse`

```json
{
  "user": {
    "id": 1,
    "name": "Ahmet Yılmaz",
    "email": "ahmet@sirket.com",
    "avatarInitials": "AY",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:** `401 Unauthorized` for bad credentials.

### 2.3 `POST /api/auth/signup`

**Request body** — `SignupRequest`

```json
{
  "name": "Ahmet Yılmaz",
  "email": "ahmet@sirket.com",
  "password": "********"
}
```

**Response 201** — `AuthResponse` (same shape as login).

> The frontend derives `avatarInitials` client-side, but expects the backend
> to return the canonical value as part of `user`.

**Errors:** `409 Conflict` if email already registered.

### 2.4 `POST /api/auth/logout`

No request body. **Response 204 No Content.**

### 2.5 `GET /api/auth/me`

No request body. **Response 200** — `User`

```json
{
  "id": 1,
  "name": "Ahmet Yılmaz",
  "email": "ahmet@sirket.com",
  "avatarInitials": "AY",
  "role": "admin"
}
```

`role` is one of: `"user" | "creator" | "admin"`. The frontend uses this to
gate the user-menu items (see `UserMenuItem.roles`).

### 2.6 `PUT /api/users/me`

**Request body** — `ProfileUpdateRequest`

```json
{
  "name": "Ahmet Yılmaz",
  "email": "ahmet@sirket.com"
}
```

**Response 200** — updated `User` (same shape as `/api/auth/me`).

### 2.7 `PUT /api/users/me/password`

**Request body** — `PasswordChangeRequest`

```json
{
  "currentPassword": "********",
  "newPassword": "********",
  "confirmPassword": "********"
}
```

**Response 204 No Content.**

> The frontend already validates `newPassword === confirmPassword` but the
> backend MUST re-validate. Return `400 Bad Request` with a localized
> `message` if the rules fail.

---

## 3. Content Catalog

Backed by `src/store/contentStore.ts`. DTOs: `Content`, `ContentDetailDTO`,
`ContentModule`, `ContentFilterParams`, `ContentSortBy`, `Topic`,
`ContentTypeOption`, `RelatedContent`.

### 3.1 Endpoints

| # | Method | Path | Description |
|---|---|---|---|
| 3.1 | `GET` | `/api/content` | List the full content catalog (slim `Content` cards). |
| 3.2 | `GET` | `/api/content/topics` | List of available topic filters. |
| 3.3 | `GET` | `/api/content/types` | List of selectable content type filters. |
| 3.4 | `GET` | `/api/content/{id}` | Fetch full detail for a single piece of content. |
| 3.5 | `GET` | `/api/content/{id}/related` | Fetch up to 3 related content cards. |
| 3.6 | `GET` | `/api/content/search` | Filter & sort the catalog (server-side replacement for `filterContent`). |
| 3.7 | `POST` | `/api/content/{id}/like` | Toggle the like state for the current user. |

### 3.2 `GET /api/content`

No request body. **Response 200** — `Content[]`

```json
[
  {
    "id": 1,
    "title": "İleri React Teknikleri",
    "category": "courses",
    "topic": "software",
    "thumbnail": "https://images.unsplash.com/photo-1633356122544-...&fit=crop",
    "duration": "8 saat",
    "subscriberOnly": true,
    "uploadDate": "2026-04-15",
    "views": 1250,
    "creator": "Ayşe Demir",
    "creatorId": 1,
    "description": "Modern React uygulamaları için ileri seviye teknikler..."
  }
]
```

`category` is one of: `"courses" | "podcasts" | "magazines" | "newspapers"`.
`topic` is the slug of a `Topic.id` (see 3.3). `uploadDate` is ISO `yyyy-MM-dd`.

### 3.3 `GET /api/content/topics`

**Response 200** — `Topic[]`

```json
[
  { "id": "all", "label": "Tümü" },
  { "id": "software", "label": "Yazılım" },
  { "id": "business", "label": "Girişimcilik" },
  { "id": "design", "label": "Tasarım" }
]
```

> The `"all"` entry is required and is used as the default filter.

### 3.4 `GET /api/content/types`

**Response 200** — `ContentTypeOption[]`

```json
[
  { "id": "podcasts",   "label": "Podcast'ler" },
  { "id": "magazines",  "label": "Dergiler" },
  { "id": "newspapers", "label": "Gazeteler" },
  { "id": "courses",    "label": "Video Kurslar" }
]
```

`id` MUST be a valid `ContentCategory`.

### 3.5 `GET /api/content/{id}`

**Response 200** — `ContentDetailDTO`

```json
{
  "id": 1,
  "title": "İleri React Teknikleri",
  "category": "Video Kurs",
  "thumbnail": "https://...",
  "duration": "8 saat",
  "subscriberOnly": true,
  "uploadDate": "15.04.2026",
  "views": 1250,
  "creator": "Ayşe Demir",
  "creatorId": 1,
  "description": "Modern React uygulamaları için...",
  "modules": [
    { "title": "Hooks Derinlemesine", "duration": "1 saat 20 dk" },
    { "title": "Context API ve State Yönetimi", "duration": "1 saat 45 dk" }
  ],
  "topics": ["React", "Hooks", "Performance"]
}
```

> ⚠️ **Note the differences from the slim `Content` DTO:**
> - `category` is the **display label** (e.g. `"Video Kurs"`, `"Podcast"`), not the slug.
> - `uploadDate` is the **display date** (`dd.MM.yyyy`), not ISO.
> - `modules` and `topics` are optional — only present for course/long-form content.

**Errors:** `404 Not Found`.

### 3.6 `GET /api/content/{id}/related`

**Response 200** — `RelatedContent[]` (max 3 items)

```json
[
  {
    "id": 4,
    "title": "JavaScript Temelleri",
    "thumbnail": "https://...",
    "duration": "12 saat"
  }
]
```

### 3.7 `GET /api/content/search`

Replaces the client-side `filterContent` helper. Query parameters mirror
`ContentFilterParams`:

| Query param | Type | Default | Notes |
|---|---|---|---|
| `category` | `ContentCategory \| "all"` | `"all"` | |
| `topic` | `string` (Topic id) | `"all"` | |
| `searchQuery` | `string` | `""` | Case-insensitive title match. |
| `showSubscriberOnly` | `boolean` | `false` | |
| `showFreeContent` | `boolean` | `true` | |
| `selectedContentTypes` | `ContentCategory[]` (CSV) | `podcasts,magazines,newspapers,courses` | Empty = no type filter. |
| `sortBy` | `"newest" \| "oldest" \| "popular"` | `"newest"` | |

**Response 200** — `Content[]` (same shape as [3.2](#32-get-apicontent)).

### 3.8 `POST /api/content/{id}/like`

No request body. Toggles the like state.

**Response 200**

```json
{ "liked": true }
```

> The frontend currently maintains the boolean locally; returning the new
> state lets us reconcile after navigation.

---

## 4. Liked Content

Backed by `src/store/contentStore.ts` (`fetchLikedContent`). DTO:
`LikedContentItem`.

| # | Method | Path | Description |
|---|---|---|---|
| 4.1 | `GET` | `/api/users/me/likes` | List of content items the current user has liked. |

### 4.1 `GET /api/users/me/likes`

**Response 200** — `LikedContentItem[]`

```json
[
  {
    "id": 2,
    "title": "Haftalık Teknoloji Podcast",
    "category": "podcasts",
    "thumbnail": "https://...",
    "duration": "45 dk",
    "subscriberOnly": false,
    "views": 3420,
    "creator": "Can Özdemir",
    "uploadDate": "2026-04-18"
  }
]
```

> `uploadDate` is ISO `yyyy-MM-dd`.

---

## 5. Creators & Following

Backed by `src/store/creatorStore.ts`. DTOs: `Creator`, `FollowedCreator`,
`CreatorContent`.

### 5.1 Endpoints

| # | Method | Path | Description |
|---|---|---|---|
| 5.1 | `GET`  | `/api/users/me/following` | Sidebar list of creators the current user follows. |
| 5.2 | `GET`  | `/api/creators/{id}` | Full creator profile. |
| 5.3 | `GET`  | `/api/creators/{creatorId}/content` | Timeline of a creator's content. |
| 5.4 | `POST` | `/api/creators/{creatorId}/follow` | Toggle follow state for the current user. |
| 5.5 | `POST` | `/api/creators/{creatorId}/notifications` | Toggle creator notifications for the current user. |

### 5.2 `GET /api/users/me/following`

**Response 200** — `FollowedCreator[]`

```json
[
  { "id": 1, "name": "Ayşe Demir",   "avatar": "AD", "followers": "12.5B" },
  { "id": 2, "name": "Mehmet Çelik", "avatar": "MÇ", "followers": "8.3M" }
]
```

> `followers` is a pre-formatted display string (`"12.5B"`, `"8.3M"`).
> `avatar` here is the 2-letter initials (no image URL).

### 5.3 `GET /api/creators/{id}`

**Response 200** — `Creator`

```json
{
  "id": 1,
  "name": "Ayşe Demir",
  "avatar": "AD",
  "type": "Yazar / Eğitmen",
  "bio": "10+ yıl React deneyimi olan...",
  "followers": 12500,
  "totalContent": 47,
  "totalViews": 1240000
}
```

> Here `followers` is a **raw integer** (the frontend formats for display).

**Errors:** `404 Not Found` (the frontend treats `null`/`404` as "unknown creator" and shows an empty profile rather than falling back to creator #1).

### 5.4 `GET /api/creators/{creatorId}/content`

**Response 200** — `CreatorContent[]`

```json
[
  {
    "id": 1,
    "title": "İleri React Teknikleri",
    "thumbnail": "https://...",
    "duration": "8 saat",
    "subscriberOnly": true,
    "views": 1250,
    "uploadDate": "2026-04-15"
  }
]
```

### 5.5 `POST /api/creators/{creatorId}/follow`

No request body. Toggle. **Response 200**

```json
{ "following": true }
```

### 5.6 `POST /api/creators/{creatorId}/notifications`

No request body. Toggle. **Response 200**

```json
{ "notificationsEnabled": true }
```

> Returning `404` if the user is not following the creator is acceptable;
> the frontend currently allows toggling notifications independently of
> follow state.

---

## 6. Offline Library

Backed by `src/store/offlineStore.ts`. DTO: `OfflineContentItem`.

### 6.1 Endpoints

| # | Method | Path | Description |
|---|---|---|---|
| 6.1 | `GET`    | `/api/users/me/offline`        | List the user's downloaded items. |
| 6.2 | `POST`   | `/api/users/me/offline`        | Register a new offline-download record. |
| 6.3 | `DELETE` | `/api/users/me/offline/{id}`   | Remove an offline-download record. |

> Storage limit: the client enforces a **10 GB** soft cap (`OFFLINE_STORAGE_LIMIT_MB = 10240`).
> The backend SHOULD also enforce this and reject with `409 Conflict` (or
> `413 Payload Too Large`) when exceeded so multi-device usage stays consistent.

### 6.2 `GET /api/users/me/offline`

**Response 200** — `OfflineContentItem[]`

```json
[
  {
    "id": 1,
    "title": "İleri React Teknikleri",
    "category": "courses",
    "thumbnail": "https://...",
    "size": "450 MB",
    "downloadDate": "15.04.2026",
    "duration": "8 saat",
    "views": 1250,
    "subscriberOnly": true,
    "creator": "Ayşe Demir"
  }
]
```

> `size` is a human-readable display string, `downloadDate` is `dd.MM.yyyy`.

### 6.3 `POST /api/users/me/offline`

**Request body** — frontend `AddOfflineRequest` (= `OfflineContentItem` minus
`size` and `downloadDate`, with optional `size`):

```json
{
  "id": 7,
  "title": "UI/UX Tasarım Uzmanlığı",
  "category": "courses",
  "thumbnail": "https://...",
  "duration": "10 saat",
  "views": 1890,
  "subscriberOnly": true,
  "creator": "Zeynep Kaya",
  "size": "680 MB"
}
```

**Response 201** — full `OfflineContentItem` (server fills in `downloadDate`
and authoritative `size`):

```json
{
  "id": 7,
  "title": "UI/UX Tasarım Uzmanlığı",
  "category": "courses",
  "thumbnail": "https://...",
  "size": "680 MB",
  "downloadDate": "28.04.2026",
  "duration": "10 saat",
  "views": 1890,
  "subscriberOnly": true,
  "creator": "Zeynep Kaya"
}
```

**Errors:**
- `409 Conflict` if the item is already in the user's offline list.
- `409 Conflict` if registering it would exceed the storage limit.

### 6.4 `DELETE /api/users/me/offline/{id}`

**Response 204 No Content.**

---

## 7. Plans, Subscriptions & Billing

Backed by `src/store/subscriptionStore.ts`. DTOs: `PricingPlan`,
`CheckoutPlan`, `YearlyTogglePlan`, `SubscriptionStatus`,
`BillingHistoryItem`, `UsageQuota`.

### 7.1 Endpoints

| # | Method | Path | Description |
|---|---|---|---|
| 7.1 | `GET`    | `/api/plans/pricing`            | Pricing cards for the unified Pricing+Checkout flow. |
| 7.2 | `GET`    | `/api/plans/checkout`           | Plan list used by the standalone `CheckoutFlow` page. |
| 7.3 | `GET`    | `/api/plans/marketing`          | Plans with monthly/yearly toggle (marketing page). |
| 7.4 | `GET`    | `/api/users/me/subscription`    | Current user's active subscription status. |
| 7.5 | `GET`    | `/api/users/me/billing`         | Current user's invoice/billing history. |
| 7.6 | `GET`    | `/api/users/me/usage`           | Current user's usage quota. |
| 7.7 | `DELETE` | `/api/users/me/subscription`    | Cancel the current user's subscription. |

> Payment submission is documented in [§8](#8-payments).

### 7.2 `GET /api/plans/pricing`

**Response 200** — `PricingPlan[]`

```json
[
  {
    "id": "free",
    "name": "Ücretsiz",
    "iconKey": "zap",
    "price": 0,
    "period": "ücretsiz",
    "description": "Platformu keşfetmek için başlangıç planı",
    "features": [
      "Ücretsiz içeriklere sınırsız erişim",
      "Topluluk forumlarına erişim"
    ],
    "color": "gray",
    "isFree": true
  },
  {
    "id": "monthly",
    "name": "Aylık Premium",
    "iconKey": "star",
    "price": 99,
    "period": "ay",
    "description": "Tüm premium içeriklere erişim",
    "features": ["Tüm premium içeriklere sınırsız erişim", "..."],
    "recommended": true,
    "color": "blue"
  },
  {
    "id": "yearly",
    "name": "Yıllık Premium",
    "iconKey": "building2",
    "price": 990,
    "period": "yıl",
    "savings": "₺198 tasarruf",
    "description": "En avantajlı plan - 2 ay bedava",
    "features": ["...", "..."],
    "color": "purple"
  }
]
```

`iconKey` is one of: `"zap" | "star" | "building2"`.
`id` is a stable string slug used as `PaymentRequest.planId` (see §8).

### 7.3 `GET /api/plans/checkout`

**Response 200** — `CheckoutPlan[]`

```json
[
  {
    "id": "basic",
    "name": "Temel",
    "price": 299,
    "period": "ay",
    "features": ["Ücretsiz içeriklere erişim", "Ayda 5 indirme"]
  },
  {
    "id": "monthly-pro",
    "name": "Aylık Pro",
    "price": 999,
    "period": "ay",
    "popular": true,
    "features": ["..."]
  },
  {
    "id": "annual-elite",
    "name": "Yıllık Elite",
    "price": 9999,
    "period": "yıl",
    "savings": "₺2.000 tasarruf",
    "features": ["..."]
  }
]
```

### 7.4 `GET /api/plans/marketing`

**Response 200** — `YearlyTogglePlan[]`

```json
[
  {
    "name": "Temel",
    "iconKey": "zap",
    "monthlyPrice": 299,
    "yearlyPrice": 2990,
    "description": "Bireyler ve küçük projeler için mükemmel",
    "features": ["5.000 API çağrısı/ay", "20 GB depolama"],
    "color": "gray"
  },
  {
    "name": "Pro",
    "iconKey": "star",
    "monthlyPrice": 999,
    "yearlyPrice": 9990,
    "description": "...",
    "features": ["..."],
    "recommended": true,
    "color": "blue"
  }
]
```

### 7.5 `GET /api/users/me/subscription`

**Response 200** — `SubscriptionStatus`

```json
{
  "planName": "Pro",
  "price": 1650,
  "isActive": true,
  "nextBillingDate": "19 Mayıs 2026",
  "features": [
    "Tüm premium içeriklere sınırsız erişim",
    "Offline içerik indirme",
    "HD kalitede video izleme",
    "Öncelikli müşteri desteği"
  ]
}
```

> `nextBillingDate` is a **localized display string** (`"19 Mayıs 2026"`).
> `price` is the numeric monthly cost.

When the user has no subscription, return `200` with `isActive: false` and an
appropriate `planName` (e.g. `"Ücretsiz"`).

### 7.6 `GET /api/users/me/billing`

**Response 200** — `BillingHistoryItem[]`

```json
[
  { "id": 1, "date": "19.03.2026", "amount": "₺1.650", "plan": "Pro Plan", "status": "Ödendi" },
  { "id": 2, "date": "19.02.2026", "amount": "₺1.650", "plan": "Pro Plan", "status": "Ödendi" },
  { "id": 4, "date": "19.12.2025", "amount": "₺980",   "plan": "Temel Plan", "status": "Ödendi" }
]
```

> `date` is `dd.MM.yyyy`. `amount` is a localized currency string.

### 7.7 `GET /api/users/me/usage`

**Response 200** — `UsageQuota`

```json
{
  "apiCallsUsed": 7500,
  "apiCallsLimit": 10000,
  "storageUsedGb": 45,
  "storageLimitGb": 100,
  "teamMembersUsed": 8,
  "teamMembersLimit": 15
}
```

### 7.8 `DELETE /api/users/me/subscription`

**Response 204 No Content.** The follow-up `GET /api/users/me/subscription`
should return `isActive: false`.

---

## 8. Payments

Backed by `src/store/subscriptionStore.ts` (`submitPayment`). DTO:
`PaymentRequest`.

| # | Method | Path | Description |
|---|---|---|---|
| 8.1 | `POST` | `/api/payments` | Submit a payment for a subscription plan. |

### 8.1 `POST /api/payments`

**Request body** — `PaymentRequest`

```json
{
  "planId": "monthly",
  "cardNumber": "4242 4242 4242 4242",
  "expiry": "12/29",
  "cvv": "123",
  "cardholderName": "Ahmet Yılmaz"
}
```

**Response 200**

```json
{
  "success": true,
  "subscription": {
    "planName": "Aylık Premium",
    "price": 99,
    "isActive": true,
    "nextBillingDate": "28 Mayıs 2026",
    "features": ["..."]
  }
}
```

**Implementation notes:**
- `planId` MUST resolve to a `PricingPlan.id` *or* `CheckoutPlan.id`.
- Today the frontend treats any non-throwing response as success and updates
  the local subscription. Returning the new `SubscriptionStatus` lets us
  drop the optimistic update.
- **Never** persist or echo back `cardNumber`/`cvv`. Forward to the real PSP
  (e.g. Iyzico / Stripe) server-side.

**Errors:**
- `400 Bad Request` — invalid card / expired plan id.
- `402 Payment Required` — gateway declined.

---

## 9. Creator Studio

Backed by `src/store/creatorStudioStore.ts`. DTOs: `CreatorStudioStats`,
`NewContentRequest`.

### 9.1 Endpoints

| # | Method | Path | Description |
|---|---|---|---|
| 9.1 | `GET`  | `/api/creator-studio/stats` | KPIs for the creator dashboard. |
| 9.2 | `POST` | `/api/creator-studio/content` | Publish a new piece of content (metadata only). |
| 9.3 | `POST` | `/api/creator-studio/uploads` *(suggested)* | Multipart upload of the asset (video / audio / pdf). |

### 9.2 `GET /api/creator-studio/stats`

**Response 200** — `CreatorStudioStats`

```json
{
  "totalContent": 47,
  "totalViews": "12,4B",
  "engagementRate": "%87",
  "monthlyEarnings": "₺8.115"
}
```

> Only `totalContent` is numeric; the other three are pre-formatted display
> strings (Turkish locale: `,` decimal separator, `B`/`M` for thousand/million,
> `%` and `₺` prefixed).

### 9.3 `POST /api/creator-studio/content`

**Request body** — `NewContentRequest`

```json
{
  "title": "İleri TypeScript Teknikleri",
  "description": "Generic'ler, conditional types ve daha fazlası",
  "category": "courses",
  "topic": "software",
  "duration": "6 saat",
  "subscriberOnly": true
}
```

- `category` MUST be a `ContentCategory` slug.
- `topic` MUST be a `Topic.id`.

**Response 201**

```json
{ "id": 1024 }
```

> The new content enters moderation and SHOULD appear in
> `GET /api/admin/content/pending` (§10) until approved.

### 9.4 `POST /api/creator-studio/uploads` (suggested)

`multipart/form-data` with a single `file` field. The current frontend
simulates progress via `XMLHttpRequest`; please surface progress events via
the standard `Content-Length` / chunked transfer.

**Response 201**

```json
{ "uploadId": "9b1c...-...-abcd", "url": "https://cdn.../uploads/abc.mp4" }
```

---

## 10. Admin — Content Moderation

Backed by `src/store/adminStore.ts`. DTOs: `PendingContent`,
`ContentRejection`.

| # | Method | Path | Description |
|---|---|---|---|
| 10.1 | `GET`  | `/api/admin/content/pending` | List content awaiting moderation. |
| 10.2 | `POST` | `/api/admin/content/{id}/approve` | Approve a pending submission. |
| 10.3 | `POST` | `/api/admin/content/{id}/reject` | Reject a pending submission with a reason. |

### 10.2 `GET /api/admin/content/pending`

**Response 200** — `PendingContent[]`

```json
[
  {
    "id": 1,
    "title": "İleri TypeScript Teknikleri",
    "creator": "Ayşe Demir",
    "type": "Video Kursu",
    "uploadDate": "18.04.2026",
    "thumbnail": "https://..."
  }
]
```

> `type` is a localized display label (`"Video Kursu"`, `"Podcast"`,
> `"Dergi"`, `"Gazete"`). `uploadDate` is `dd.MM.yyyy`.

### 10.3 `POST /api/admin/content/{id}/approve`

No request body. **Response 204 No Content.**

### 10.4 `POST /api/admin/content/{id}/reject`

**Request body** — `ContentRejection` (without `contentId`, since it's in the URL):

```json
{ "reason": "Görsel kalitesi yetersiz." }
```

**Response 204 No Content.**

---

## 11. Admin — Analytics & Users

DTOs: `FinancialDataPoint`, `RevenueDataPoint`, `ManagedUser`, `AdminStats`.

| # | Method | Path | Description |
|---|---|---|---|
| 11.1 | `GET` | `/api/admin/stats`              | Top-level admin KPIs. |
| 11.2 | `GET` | `/api/admin/analytics/financial`| MRR + subscriber count by month (combined chart). |
| 11.3 | `GET` | `/api/admin/analytics/revenue`  | MRR by month (revenue-only chart). |
| 11.4 | `GET` | `/api/admin/users`              | Managed users (dashboard projection). |
| 11.5 | `GET` | `/api/admin/users?context=panel`| Managed users (admin panel projection — different `tier`/`mrr` semantics). |

### 11.2 `GET /api/admin/stats`

**Response 200** — `AdminStats`

```json
{
  "monthlyRevenue": "₺85.420",
  "monthlyRevenueChange": "↑ Geçen aydan %8,9",
  "activeSubscribers": "2.080",
  "activeSubscribersChange": "↑ Geçen aydan %8,3",
  "totalContent": "1.247",
  "totalContentChange": "Bu ay 45 eklendi",
  "totalUsers": "1.247",
  "totalUsersChange": "Geçen aydan +%12,5",
  "churnRate": "%3,2",
  "churnRateChange": "Geçen aydan +%0,4",
  "arpu": "₺41,07",
  "growthRate": "+%8,9"
}
```

> Every field is a **pre-formatted display string** computed server-side.

### 11.3 `GET /api/admin/analytics/financial`

**Response 200** — `FinancialDataPoint[]`

```json
[
  { "month": "Eki", "mrr": 45200, "subscribers": 1120 },
  { "month": "Kas", "mrr": 52300, "subscribers": 1285 },
  { "month": "Ara", "mrr": 58700, "subscribers": 1450 },
  { "month": "Nis", "mrr": 85420, "subscribers": 2080 }
]
```

> `month` is the 3-letter Turkish abbreviation (`Oca`, `Şub`, `Mar`, …, `Ara`).

### 11.4 `GET /api/admin/analytics/revenue`

**Response 200** — `RevenueDataPoint[]`

```json
[
  { "month": "Eki", "mrr": 45000 },
  { "month": "Nis", "mrr": 85000 }
]
```

### 11.5 `GET /api/admin/users`

**Response 200** — `ManagedUser[]`

```json
[
  { "id": 1, "name": "Ayşe Demir",     "email": "ayse@sirket.com", "tier": "Yıllık Premium", "status": "Aktif", "mrr": 990 },
  { "id": 2, "name": "Mehmet Yılmaz",  "email": "mehmet@startup.io", "tier": "Aylık Premium", "status": "Aktif", "mrr": 99 },
  { "id": 6, "name": "Burak Arslan",   "email": "burak@dev.com",  "tier": "Aylık Premium", "status": "İptal Edildi", "mrr": 0 }
]
```

`status` is a localized display string (`"Aktif"`, `"İptal Edildi"`,
`"Deneme"`).

### 11.6 `GET /api/admin/users?context=panel`

Same DTO (`ManagedUser[]`), different projection — the *admin panel* table
shows the **enterprise tiers** (`"Kurumsal"`, `"Pro"`, `"Temel"`) with their
corresponding MRR. The frontend issues this with `?context=panel`.

```json
[
  { "id": 1, "name": "Ayşe Demir",    "email": "ayse@sirket.com",   "tier": "Kurumsal", "status": "Aktif",        "mrr": 9999 },
  { "id": 4, "name": "Can Özdemir",   "email": "can@tech.com",      "tier": "Temel",    "status": "Deneme",       "mrr": 0    },
  { "id": 6, "name": "Burak Arslan",  "email": "burak@dev.com",     "tier": "Pro",      "status": "İptal Edildi", "mrr": 0    }
]
```

> Backend can implement this as two separate endpoints if cleaner — just
> keep the response shape identical so the same Zustand selector works.

---

## 12. Admin — System & Distribution

DTOs: `SystemModule`, `DistributionRegion`, `DistributionStats`,
`WeeklyDeliveryDay`.

| # | Method | Path | Description |
|---|---|---|---|
| 12.1 | `GET` | `/api/admin/system/modules`        | Status of internal microservices. |
| 12.2 | `GET` | `/api/admin/distribution/regions`  | Print/physical distribution regions. |
| 12.3 | `GET` | `/api/admin/distribution/stats`    | Distribution KPIs. |
| 12.4 | `GET` | `/api/admin/distribution/weekly`   | Last 7 days of delivery counts. |

### 12.2 `GET /api/admin/system/modules`

**Response 200** — `SystemModule[]`

```json
[
  { "name": "Ödeme Servisi",     "status": "online",   "uptime": "%99,9", "requests": "12,4B" },
  { "name": "E-posta Servisi",   "status": "online",   "uptime": "%99,8", "requests": "8,2B"  },
  { "name": "Abonelik Motoru",   "status": "online",   "uptime": "%100",  "requests": "15,7B" },
  { "name": "Analitik Servisi",  "status": "degraded", "uptime": "%97,2", "requests": "5,1B"  }
]
```

`status` is one of: `"online" | "degraded"`.

### 12.3 `GET /api/admin/distribution/regions`

**Response 200** — `DistributionRegion[]`

```json
[
  {
    "id": 1,
    "region": "İstanbul - Anadolu",
    "distributionPoints": "45 Nokta",
    "monthlyAmount": "3.250 Adet",
    "lastDelivery": "19.04.2026",
    "status": "Aktif"
  },
  {
    "id": 3,
    "region": "İzmir - Karşıyaka",
    "distributionPoints": "32 Nokta",
    "monthlyAmount": "1.850 Adet",
    "lastDelivery": "18.04.2026",
    "status": "Beklemede"
  }
]
```

`status` is one of: `"Aktif" | "Beklemede"`.

### 12.4 `GET /api/admin/distribution/stats`

**Response 200** — `DistributionStats`

```json
{
  "activeRegions": 47,
  "newRegions": 7,
  "monthlyDistribution": "12.450",
  "pendingOrders": 234,
  "deliveryRate": "%97.2"
}
```

### 12.5 `GET /api/admin/distribution/weekly`

**Response 200** — `WeeklyDeliveryDay[]`

```json
[
  { "day": "Pzt", "deliveryCount": 38 },
  { "day": "Sal", "deliveryCount": 42 },
  { "day": "Çar", "deliveryCount": 35 },
  { "day": "Per", "deliveryCount": 47 },
  { "day": "Cum", "deliveryCount": 52 },
  { "day": "Cmt", "deliveryCount": 28 },
  { "day": "Paz", "deliveryCount": 18 }
]
```

> `day` is the 3-letter Turkish abbreviation, in display order Mon → Sun.

---

## 13. Endpoint Summary Matrix

| # | Method | Path | Auth | Roles | Frontend caller |
|---|---|---|---|---|---|
| 1 | `POST`   | `/api/auth/login`                       | public | — | `useAuthStore.login` |
| 2 | `POST`   | `/api/auth/signup`                      | public | — | `useAuthStore.signup` |
| 3 | `POST`   | `/api/auth/logout`                      | yes    | any | `useAuthStore.logout` |
| 4 | `GET`    | `/api/auth/me`                          | yes    | any | `useAuthStore.fetchCurrentUser` |
| 5 | `PUT`    | `/api/users/me`                         | yes    | any | `useAuthStore.updateProfile` |
| 6 | `PUT`    | `/api/users/me/password`                | yes    | any | `useAuthStore.changePassword` |
| 7 | `GET`    | `/api/content`                          | yes    | any | `useContentStore.fetchCatalog` |
| 8 | `GET`    | `/api/content/topics`                   | yes    | any | `useContentStore.fetchTopics` |
| 9 | `GET`    | `/api/content/types`                    | yes    | any | `useContentStore.fetchContentTypes` |
| 10 | `GET`   | `/api/content/{id}`                     | yes    | any | `useContentStore.fetchContentById` |
| 11 | `GET`   | `/api/content/{id}/related`             | yes    | any | `useContentStore.fetchRelatedContent` |
| 12 | `GET`   | `/api/content/search`                   | yes    | any | `useContentStore.filterContent` |
| 13 | `POST`  | `/api/content/{id}/like`                | yes    | any | `useContentStore.toggleLike` |
| 14 | `GET`   | `/api/users/me/likes`                   | yes    | any | `useContentStore.fetchLikedContent` |
| 15 | `GET`   | `/api/users/me/following`               | yes    | any | `useCreatorStore.fetchFollowedCreators` |
| 16 | `GET`   | `/api/creators/{id}`                    | yes    | any | `useCreatorStore.fetchCreatorById` |
| 17 | `GET`   | `/api/creators/{creatorId}/content`     | yes    | any | `useCreatorStore.fetchCreatorContent` |
| 18 | `POST`  | `/api/creators/{creatorId}/follow`      | yes    | any | `useCreatorStore.toggleFollow` |
| 19 | `POST`  | `/api/creators/{creatorId}/notifications`| yes   | any | `useCreatorStore.toggleNotifications` |
| 20 | `GET`   | `/api/users/me/offline`                 | yes    | any | `useOfflineStore.fetchOfflineContent` |
| 21 | `POST`  | `/api/users/me/offline`                 | yes    | any | `useOfflineStore.addOfflineItem` |
| 22 | `DELETE`| `/api/users/me/offline/{id}`            | yes    | any | `useOfflineStore.deleteOfflineItem` |
| 23 | `GET`   | `/api/plans/pricing`                    | public | — | `useSubscriptionStore.fetchPricingPlans` |
| 24 | `GET`   | `/api/plans/checkout`                   | public | — | `useSubscriptionStore.fetchCheckoutPlans` |
| 25 | `GET`   | `/api/plans/marketing`                  | public | — | `useSubscriptionStore.fetchYearlyTogglePlans` |
| 26 | `GET`   | `/api/users/me/subscription`            | yes    | any | `useSubscriptionStore.fetchSubscriptionStatus` |
| 27 | `GET`   | `/api/users/me/billing`                 | yes    | any | `useSubscriptionStore.fetchBillingHistory` |
| 28 | `GET`   | `/api/users/me/usage`                   | yes    | any | `useSubscriptionStore.fetchUsageQuota` |
| 29 | `DELETE`| `/api/users/me/subscription`            | yes    | any | `useSubscriptionStore.cancelSubscription` |
| 30 | `POST`  | `/api/payments`                         | yes    | any | `useSubscriptionStore.submitPayment` |
| 31 | `GET`   | `/api/creator-studio/stats`             | yes    | creator, admin | `useCreatorStudioStore.fetchStats` |
| 32 | `POST`  | `/api/creator-studio/content`           | yes    | creator, admin | `useCreatorStudioStore.publishContent` |
| 33 | `POST`  | `/api/creator-studio/uploads`           | yes    | creator, admin | `useCreatorStudioStore.startUpload` |
| 34 | `GET`   | `/api/admin/content/pending`            | yes    | admin | `useAdminStore.fetchPendingContent` |
| 35 | `POST`  | `/api/admin/content/{id}/approve`       | yes    | admin | `useAdminStore.approveContent` |
| 36 | `POST`  | `/api/admin/content/{id}/reject`        | yes    | admin | `useAdminStore.rejectContent` |
| 37 | `GET`   | `/api/admin/stats`                      | yes    | admin | `useAdminStore.fetchAdminStats` |
| 38 | `GET`   | `/api/admin/analytics/financial`        | yes    | admin | `useAdminStore.fetchFinancialData` |
| 39 | `GET`   | `/api/admin/analytics/revenue`          | yes    | admin | `useAdminStore.fetchRevenueData` |
| 40 | `GET`   | `/api/admin/users`                      | yes    | admin | `useAdminStore.fetchManagedUsersDashboard` |
| 41 | `GET`   | `/api/admin/users?context=panel`        | yes    | admin | `useAdminStore.fetchManagedUsersAdminPanel` |
| 42 | `GET`   | `/api/admin/system/modules`             | yes    | admin | `useAdminStore.fetchSystemModules` |
| 43 | `GET`   | `/api/admin/distribution/regions`       | yes    | admin | `useAdminStore.fetchDistributionRegions` |
| 44 | `GET`   | `/api/admin/distribution/stats`         | yes    | admin | `useAdminStore.fetchDistributionStats` |
| 45 | `GET`   | `/api/admin/distribution/weekly`        | yes    | admin | `useAdminStore.fetchWeeklyDelivery` |

---

## 14. Appendix — DTO Reference

The full canonical TypeScript definitions live in
[`src/types/index.ts`](src/types/index.ts). Suggested Java mapping (Lombok
`@Data` records):

| TS interface | Suggested Java class | Notes |
|---|---|---|
| `User` | `UserDTO` | `role` → `enum UserRole { USER, CREATOR, ADMIN }`, serialize lowercase. |
| `LoginRequest` / `SignupRequest` | request records | Validate `@Email`, `@Size(min=8)` for password. |
| `AuthResponse` | `AuthResponseDTO { UserDTO user; String token; }` | |
| `Content` | `ContentSummaryDTO` | `category` enum (`COURSES, PODCASTS, MAGAZINES, NEWSPAPERS`), serialize lowercase. `uploadDate` → `LocalDate`. |
| `ContentDetailDTO` | `ContentDetailDTO` | `category` is **localized label**; `uploadDate` is **display string** (`dd.MM.yyyy`). |
| `ContentModule` | nested record | |
| `Topic` / `ContentTypeOption` | reference data, can be cached forever | |
| `Creator` | `CreatorDTO` | `followers` is the **raw integer** count. |
| `FollowedCreator` | `FollowedCreatorDTO` | `followers` is **pre-formatted** ("12.5B"). |
| `CreatorContent` | `CreatorContentDTO` | `uploadDate` ISO. |
| `LikedContentItem` | `LikedContentDTO` | `uploadDate` ISO. |
| `OfflineContentItem` | `OfflineContentDTO` | `size`, `downloadDate` are display strings. |
| `PricingPlan` / `CheckoutPlan` / `YearlyTogglePlan` | plan DTOs | Enforce `iconKey` enum. |
| `SubscriptionStatus` | `SubscriptionStatusDTO` | `nextBillingDate` is localized display. |
| `BillingHistoryItem` | `InvoiceDTO` | `date`, `amount`, `status` are display strings. |
| `UsageQuota` | `UsageQuotaDTO` | All numeric. |
| `PaymentRequest` | `PaymentRequestDTO` | **Never log `cardNumber`/`cvv`.** |
| `PendingContent` | `PendingContentDTO` | `type` is **localized label**. |
| `ContentRejection` | `ContentRejectionRequest` | `contentId` from path, `reason` from body. |
| `FinancialDataPoint` / `RevenueDataPoint` | analytics DTOs | `month` is 3-letter TR abbr. |
| `ManagedUser` | `ManagedUserDTO` | Two server-side projections (see §11.5/§11.6). |
| `SystemModule` | `SystemModuleDTO` | `status` enum, `uptime`/`requests` display strings. |
| `DistributionRegion` / `DistributionStats` | distribution DTOs | All counts are display strings except `activeRegions`, `newRegions`, `pendingOrders`. |
| `WeeklyDeliveryDay` | record | `day` is TR abbr (Pzt..Paz). |
| `AdminStats` | analytics DTO | **All fields are display strings.** |
| `CreatorStudioStats` | `CreatorStudioStatsDTO` | Only `totalContent` is numeric. |
| `NewContentRequest` | `NewContentRequest` | Validate `category`/`topic` against catalog. |

### 14.1 Display-vs-ISO field cheat sheet

The frontend deliberately keeps a clear split between **machine-readable**
fields (used for sorting/filtering) and **human-readable** fields (rendered
verbatim in the UI):

| Field | Format | Example |
|---|---|---|
| `Content.uploadDate`, `CreatorContent.uploadDate`, `LikedContentItem.uploadDate` | ISO `yyyy-MM-dd` | `"2026-04-15"` |
| `ContentDetailDTO.uploadDate`, `OfflineContentItem.downloadDate`, `PendingContent.uploadDate`, `BillingHistoryItem.date`, `DistributionRegion.lastDelivery` | display `dd.MM.yyyy` | `"15.04.2026"` |
| `SubscriptionStatus.nextBillingDate` | display `d MMMM yyyy` (TR locale) | `"19 Mayıs 2026"` |
| Currency values in `BillingHistoryItem.amount`, `AdminStats.*` | display, prefixed `₺` | `"₺1.650"` |
| Percentages in `AdminStats.*`, `SystemModule.uptime`, `DistributionStats.deliveryRate` | display, prefixed `%`, comma decimals | `"%99,9"` |
| Large counts in `FollowedCreator.followers`, `CreatorStudioStats.totalViews`, `SystemModule.requests` | display `"12,4B"` / `"8.3M"` | (`B` = bin = thousand, `M` = million) |

Any new endpoint that returns one of these should follow the same split:
**numeric raw value when the FE may operate on it; pre-formatted string only
when it is purely display.**

---

_Last updated: 2026-04-28 — generated from `src/store/*` + `src/types/index.ts`._
