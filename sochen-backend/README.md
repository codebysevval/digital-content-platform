# SOCHEN Backend

Spring Boot 3 REST API for the SOCHEN Turkish digital content platform.

## Stack

| Concern | Choice |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 3.3.x |
| Build | Maven (Spring Boot BOM) |
| Database | PostgreSQL 14+ |
| ORM | Spring Data JPA + Hibernate (`ddl-auto: validate`) |
| Migrations | Flyway V1–V16 |
| Auth | JWT (`jjwt` 0.12.x) — 24 h expiry |
| Password | BCrypt strength 12 |
| File Storage | Local disk (`UPLOAD_DIR`), served at `/uploads/**` |
| PDF | Apache PDFBox (page-count detection on upload) |
| Utilities | Lombok, hand-written mappers |
| CORS | `http://localhost:5173` |

## Configuration

```yaml
# application.yml — override with env vars
DB_URL:     jdbc:postgresql://localhost:5432/sochen
DB_USER:    sochen
DB_PASS:    sochen
JWT_SECRET: sochen-dev-secret-key-change-in-production-min-32-chars
UPLOAD_DIR: /tmp/sochen-uploads
```

## Authorization Model

| Path | Required role |
|---|---|
| `POST /api/auth/**` | public |
| `GET /api/plans/**` | public |
| `GET /api/content/**`, `POST /api/content/{id}/view`, etc. | any authenticated |
| `GET|POST|PUT|DELETE /api/creator-studio/**` | `CREATOR` or `ADMIN` |
| `**  /api/admin/**` | `ADMIN` |

JWT claims: `sub` (user id), `role` (lowercase), `iat`, `exp`.

## Flyway Migrations

| Version | Description |
|---|---|
| V1 | Full schema — users, content, subscriptions, plans, etc. |
| V2 | Seed pricing plans (free / monthly ₺99 / yearly ₺990) |
| V3 | Reference data — system modules, distribution regions, weekly delivery |
| V4 | Creator applications table |
| V5 | `users.avatar_url`, media/thumbnail/attachment columns on pending_content |
| V6 | Nuke seed content & creators; reset sequences |
| V7 | `content_heartbeats` + `creator_earnings` tables |
| V8 | Onboarding helpers & traffic simulation columns |
| V9 | Sync creator rows for users with CREATOR role |
| V10 | Remove ad-free feature from plan copy |
| V11 | Widen `favorite_category` column |
| V12 | Fix free plan feature text |
| V13 | Add `media_url` to content table |
| V14 | Fix stale email-as-creator-name in content/pending_content |
| V15 | Remove false "HD/4K" plan copy; fix download quota text |
| V16 | Normalize `favorite_category` to canonical English topic slugs |

## Endpoint Map

### Auth & User
| Method | Path | Auth |
|---|---|---|
| `POST` | `/api/auth/login` | public |
| `POST` | `/api/auth/signup` | public |
| `POST` | `/api/auth/logout` | yes |
| `GET` | `/api/auth/me` | yes |
| `POST` | `/api/auth/forgot-password` | public |
| `PUT` | `/api/users/me` | yes |
| `PUT` | `/api/users/me/password` | yes |
| `POST` | `/api/users/me/avatar` | yes |

### Content
| Method | Path | Auth |
|---|---|---|
| `GET` | `/api/content` | yes |
| `GET` | `/api/content/topics` | yes |
| `GET` | `/api/content/types` | yes |
| `GET` | `/api/content/search` | yes |
| `GET` | `/api/content/{id}` | yes |
| `GET` | `/api/content/{id}/related` | yes |
| `POST` | `/api/content/{id}/like` | yes |
| `POST` | `/api/content/{id}/view` | yes |
| `POST` | `/api/content/{id}/heartbeat` | yes |

### Liked / Offline
| Method | Path | Auth |
|---|---|---|
| `GET` | `/api/users/me/likes` | yes |
| `GET` | `/api/users/me/offline` | yes |
| `POST` | `/api/users/me/offline` | yes |
| `DELETE` | `/api/users/me/offline/{id}` | yes |

### Creators
| Method | Path | Auth |
|---|---|---|
| `GET` | `/api/creators/{id}` | yes |
| `GET` | `/api/creators/{id}/content` | yes |
| `POST` | `/api/creators/{id}/follow` | yes |
| `POST` | `/api/creators/{id}/notifications` | yes |
| `GET` | `/api/creators/search` | yes |
| `GET` | `/api/users/me/following` | yes |
| `GET` | `/api/users/me/notifications` | yes |

### Creator Applications
| Method | Path | Auth |
|---|---|---|
| `POST` | `/api/creator-applications` | yes |
| `GET` | `/api/creator-applications/me` | yes |
| `PUT` | `/api/users/me/creator-profile` | creator/admin |

### Creator Studio
| Method | Path | Auth |
|---|---|---|
| `GET` | `/api/creator-studio/stats` | creator/admin |
| `GET` | `/api/creator-studio/earnings-history` | creator/admin |
| `GET` | `/api/creator-studio/my-content` | creator/admin |
| `POST` | `/api/creator-studio/content` | creator/admin |
| `PUT` | `/api/creator-studio/content/{id}` | creator/admin |
| `DELETE` | `/api/creator-studio/content/{id}` | creator/admin |
| `POST` | `/api/creator-studio/uploads` | creator/admin |
| `GET` | `/api/creator-studio/followers` | creator/admin |

### Plans & Subscriptions
| Method | Path | Auth |
|---|---|---|
| `GET` | `/api/plans/pricing` | public |
| `GET` | `/api/plans/checkout` | public |
| `GET` | `/api/plans/marketing` | public |
| `GET` | `/api/users/me/subscription` | yes |
| `GET` | `/api/users/me/billing` | yes |
| `GET` | `/api/users/me/usage` | yes |
| `DELETE` | `/api/users/me/subscription` | yes |
| `POST` | `/api/payments` | yes |

### Admin — Moderation & Analytics
| Method | Path | Auth |
|---|---|---|
| `GET` | `/api/admin/content/pending` | admin |
| `POST` | `/api/admin/content/{id}/approve` | admin |
| `POST` | `/api/admin/content/{id}/reject` | admin |
| `GET` | `/api/admin/stats` | admin |
| `GET` | `/api/admin/analytics/financial` | admin |
| `GET` | `/api/admin/analytics/revenue` | admin |
| `GET` | `/api/admin/users` | admin |
| `GET` | `/api/admin/system/modules` | admin |
| `GET` | `/api/admin/distribution/regions` | admin |
| `GET` | `/api/admin/distribution/stats` | admin |
| `GET` | `/api/admin/distribution/weekly` | admin |
| `GET` | `/api/admin/creator-applications` | admin |
| `POST` | `/api/admin/creator-applications/{id}/approve` | admin |
| `POST` | `/api/admin/creator-applications/{id}/reject` | admin |

### Admin — Devtools
| Method | Path | Auth |
|---|---|---|
| `GET` | `/api/admin/dev/users` | admin |
| `PUT` | `/api/admin/dev/users/{id}/role` | admin |
| `POST` | `/api/admin/dev/users/{id}/grant-subscription` | admin |
| `POST` | `/api/admin/dev/content/{id}/simulate-traffic` | admin |
| `DELETE` | `/api/admin/dev/users/{id}` | admin |
| `DELETE` | `/api/admin/dev/content/{id}` | admin |

## Heartbeat Earning Rates

| Category | Multiplier | Per-heartbeat (₺) |
|---|---|---|
| COURSES | 1.0× | ₺0.00015 |
| PODCASTS | 0.7× | ₺0.000105 |
| Others | 0.3× | ₺0.000045 |

## Download Quota

| Plan | Monthly downloads |
|---|---|
| Free / no subscription | 0 |
| Monthly (₺99/ay) | 10 |
| Yearly (₺990/yıl) | 20 |

## Key DTO Rules

- Dates returned as `yyyy-MM-dd` ISO string for list/card endpoints; display string `dd.MM.yyyy` for detail/admin endpoints.
- `ContentCategory` serialized as lowercase slug: `courses`, `podcasts`, `magazines`, `newspapers`, `ebooks`.
- `UserRole` serialized lowercase: `user`, `creator`, `admin`.
- `FollowedCreator.followers` is pre-formatted (e.g. `"1.2B"` for 1 200).
- `POST /api/payments` never persists `cardNumber` or `cvv`.
- `POST /api/users/me/offline` returns `409` when storage cap (10 240 MB) would be exceeded.

## Project Layout

```
sochen-backend/
├── pom.xml
├── mvnw
└── src/main/
    ├── java/com/sochen/
    │   ├── SochenApplication.java
    │   ├── config/          # SecurityConfig, CORS, Jackson, seeder
    │   ├── security/        # JwtUtil, JwtFilter, AuthenticationFacade
    │   ├── domain/          # @Entity classes + enums/
    │   ├── dto/             # request/ + response/ records
    │   ├── repository/      # Spring Data JPA interfaces
    │   ├── service/         # Business logic
    │   ├── controller/      # REST controllers
    │   ├── mapper/          # DTO ↔ entity mappers
    │   ├── util/            # DisplayFormatter
    │   └── exception/       # GlobalExceptionHandler
    └── resources/
        ├── application.yml
        └── db/migration/    # V1–V16 Flyway scripts
```
