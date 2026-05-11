# SOCHEN Frontend

React + TypeScript SPA for the SOCHEN digital content platform.

## Stack

| Concern | Choice |
|---|---|
| Framework | React 19 + Vite 6 |
| Language | TypeScript |
| Routing | React Router v7 (`BrowserRouter`) |
| State | Zustand (one store per domain) |
| Styling | Tailwind CSS v4 |
| UI Primitives | Radix UI (Tabs, Checkbox, Popover, Select, Switch, Dialog, Progress) |
| Icons | Lucide React |
| Notifications | Sonner |
| HTTP | Custom `api` wrapper (`src/lib/api.ts`) with JWT header injection |

## Getting Started

```bash
cp .env.example .env     # set VITE_API_BASE_URL=http://localhost:8080
npm install
npm run dev              # http://localhost:5173
npm run build            # production build → dist/
```

## URL Routes

| Path | Component | Role required |
|---|---|---|
| `/` | `ContentDiscovery` | any |
| `/content/:id` | `ContentDetail` | any |
| `/creator/:id` | `CreatorProfile` | any |
| `/profile/me` | `OwnProfile` | any |
| `/pricing` | `PricingCheckout` | any |
| `/settings` | `UserSettings` | any |
| `/liked` | via `App.tsx` | any |
| `/offline` | via `App.tsx` | any |
| `/studio` | `CreatorStudio` | creator / admin |
| `/admin` | `AdminDashboard` | admin |

## Zustand Stores (`src/store/`)

| Store | Responsibility |
|---|---|
| `authStore` | Login/signup/logout, current user, avatar upload |
| `contentStore` | Catalog, search, topics, likes, view/heartbeat |
| `creatorStore` | Creator profiles, follow/unfollow, notifications, creator search |
| `creatorStudioStore` | Studio stats, uploads, my content, earnings history, followers |
| `creatorApplicationStore` | Creator role application flow |
| `subscriptionStore` | Subscription status, billing, plan purchase |
| `adminStore` | Pending content, stats, analytics, managed users, devtools |
| `offlineStore` | Downloaded content list |
| `notificationStore` | Per-creator notification preferences |

All stores expose a `reset()` method called on logout.

## Key Components

### ContentDiscovery
Full-page content feed with:
- Topic chip bar (flex-wrap)
- Category filter (Checkbox popover)
- Subscriber-only / free content toggles
- Creator search (shows `CreatorCard` grid)
- Trending / Following / Recommended sections with client-side deduplication

### ContentDetail
- Video player / PDF viewer (`<object>`) / audio depending on category
- 5 s view timer → `POST /api/content/{id}/view`
- 15 s heartbeat interval → `POST /api/content/{id}/heartbeat`
- Paywall for subscriber-only content
- Like count display, offline download

### CreatorStudio
Tabs: **İçerik Yükle** · **İçeriklerim** · **Kazançlar** · **Takipçilerim**
- Three upload zones (media / thumbnail / attachment) with XHR progress
- Inline edit/delete with topic & category dropdowns
- Pure-CSS earnings bar chart
- Follower list with search

### AdminDashboard
Tabs: **İçerik Moderasyonu** · **Sistem Yönetimi** · **İçerik Üreticisi Başvuruları** · **Devtools**
- Media preview (video / PDF) per pending item
- Real MRR chart from live subscription data
- Creator application approve / reject flow
- Devtools: role assignment, subscription grant, traffic simulation, user delete, content delete

### UserSettings
Tabs: **Profil** · **Abonelik Durumu** · **Güvenlik** · (creators) **Üretici Profili**
- Avatar upload with circular crop modal (canvas arc-clip → JPEG)
- Inline payment method update adjacent to plan upgrade

## Types

All frontend types in `src/types/index.ts` mirror backend DTOs field-for-field.
Key enums:
- `ContentCategory`: `'courses' | 'podcasts' | 'magazines' | 'newspapers' | 'ebooks'`
- `UserRole`: `'user' | 'creator' | 'admin'`

## Media URL Resolution

Relative paths (e.g. `/uploads/abc_video.mp4`) are prepended with `VITE_API_BASE_URL`
via `resolveMediaUrl()` in `src/lib/api.ts`. Always wrap thumbnail/media `src` attributes
with this helper.
