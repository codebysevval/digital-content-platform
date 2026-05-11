-- =========================================================================
-- V1__init_schema.sql
-- Base schema for the SOCHEN backend.
-- Column names are snake_case to match the JPA mappings on the entity classes.
-- =========================================================================

CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE creators (
    id             BIGINT PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    avatar         VARCHAR(255) NOT NULL,
    type           VARCHAR(255) NOT NULL,
    bio            TEXT,
    followers      BIGINT       NOT NULL,
    total_content  INTEGER      NOT NULL,
    total_views    BIGINT       NOT NULL
);

CREATE TABLE content (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    category        VARCHAR(20)  NOT NULL,
    topic           VARCHAR(64)  NOT NULL,
    thumbnail       VARCHAR(1024) NOT NULL,
    duration        VARCHAR(64)  NOT NULL,
    subscriber_only BOOLEAN      NOT NULL DEFAULT FALSE,
    upload_date     DATE         NOT NULL,
    views           BIGINT       NOT NULL DEFAULT 0,
    creator         VARCHAR(255) NOT NULL,
    creator_id      BIGINT       NOT NULL,
    description     TEXT         NOT NULL
);
CREATE INDEX idx_content_category ON content (category);
CREATE INDEX idx_content_creator  ON content (creator_id);

CREATE TABLE content_modules (
    id          BIGSERIAL PRIMARY KEY,
    content_id  BIGINT       NOT NULL REFERENCES content (id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    duration    VARCHAR(64)  NOT NULL,
    sort_order  INTEGER      NOT NULL
);
CREATE INDEX idx_content_modules_content ON content_modules (content_id);

CREATE TABLE content_topics (
    id          BIGSERIAL PRIMARY KEY,
    content_id  BIGINT       NOT NULL REFERENCES content (id) ON DELETE CASCADE,
    label       VARCHAR(128) NOT NULL,
    sort_order  INTEGER      NOT NULL
);
CREATE INDEX idx_content_topics_content ON content_topics (content_id);

CREATE TABLE user_follows (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users    (id) ON DELETE CASCADE,
    creator_id BIGINT      NOT NULL REFERENCES creators (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_user_follows_user_creator UNIQUE (user_id, creator_id)
);
CREATE INDEX idx_user_follows_user ON user_follows (user_id);

CREATE TABLE user_notifications (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT  NOT NULL REFERENCES users    (id) ON DELETE CASCADE,
    creator_id BIGINT  NOT NULL REFERENCES creators (id) ON DELETE CASCADE,
    enabled    BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uk_user_notifications_user_creator UNIQUE (user_id, creator_id)
);

CREATE TABLE user_likes (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users   (id) ON DELETE CASCADE,
    content_id BIGINT      NOT NULL REFERENCES content (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_user_likes_user_content UNIQUE (user_id, content_id)
);
CREATE INDEX idx_user_likes_user ON user_likes (user_id);

CREATE TABLE offline_content (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT  NOT NULL REFERENCES users   (id) ON DELETE CASCADE,
    content_id    BIGINT  NOT NULL REFERENCES content (id) ON DELETE CASCADE,
    size_mb       INTEGER NOT NULL,
    download_date DATE    NOT NULL,
    CONSTRAINT uk_offline_user_content UNIQUE (user_id, content_id)
);
CREATE INDEX idx_offline_user ON offline_content (user_id);

CREATE TABLE subscriptions (
    id                BIGSERIAL PRIMARY KEY,
    user_id           BIGINT         NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    plan_id           VARCHAR(64)    NOT NULL,
    plan_name         VARCHAR(128)   NOT NULL,
    price             NUMERIC(12, 2) NOT NULL,
    active            BOOLEAN        NOT NULL DEFAULT TRUE,
    next_billing_date DATE           NOT NULL
);

CREATE TABLE billing_records (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    billing_date  DATE           NOT NULL,
    amount        NUMERIC(12, 2) NOT NULL,
    plan_label    VARCHAR(128)   NOT NULL,
    status        VARCHAR(64)    NOT NULL
);
CREATE INDEX idx_billing_user ON billing_records (user_id);

CREATE TABLE usage_quotas (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT  NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    api_calls_used      INTEGER NOT NULL,
    api_calls_limit     INTEGER NOT NULL,
    storage_used_gb     INTEGER NOT NULL,
    storage_limit_gb    INTEGER NOT NULL,
    team_members_used   INTEGER NOT NULL,
    team_members_limit  INTEGER NOT NULL
);

CREATE TABLE pricing_plans (
    id          VARCHAR(64) PRIMARY KEY,
    name        VARCHAR(128)   NOT NULL,
    icon_key    VARCHAR(32)    NOT NULL,
    price       NUMERIC(12, 2) NOT NULL,
    period      VARCHAR(32)    NOT NULL,
    description TEXT           NOT NULL,
    features    TEXT           NOT NULL,
    color       VARCHAR(32)    NOT NULL,
    is_free     BOOLEAN        NOT NULL DEFAULT FALSE,
    recommended BOOLEAN        NOT NULL DEFAULT FALSE,
    savings     VARCHAR(64),
    sort_order  INTEGER        NOT NULL
);

CREATE TABLE checkout_plans (
    id          VARCHAR(64) PRIMARY KEY,
    name        VARCHAR(128)   NOT NULL,
    price       NUMERIC(12, 2) NOT NULL,
    period      VARCHAR(32)    NOT NULL,
    popular     BOOLEAN        NOT NULL DEFAULT FALSE,
    savings     VARCHAR(64),
    features    TEXT           NOT NULL,
    sort_order  INTEGER        NOT NULL
);

CREATE TABLE marketing_plans (
    id            VARCHAR(64) PRIMARY KEY,
    name          VARCHAR(128)   NOT NULL,
    icon_key      VARCHAR(32)    NOT NULL,
    monthly_price NUMERIC(12, 2) NOT NULL,
    yearly_price  NUMERIC(12, 2) NOT NULL,
    description   TEXT           NOT NULL,
    features      TEXT           NOT NULL,
    color         VARCHAR(32)    NOT NULL,
    recommended   BOOLEAN        NOT NULL DEFAULT FALSE,
    sort_order    INTEGER        NOT NULL
);

CREATE TABLE payments (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    plan_id         VARCHAR(64)    NOT NULL,
    cardholder_name VARCHAR(255)   NOT NULL,
    amount          NUMERIC(12, 2) NOT NULL,
    success         BOOLEAN        NOT NULL,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE pending_content (
    id                BIGSERIAL PRIMARY KEY,
    title             VARCHAR(255)  NOT NULL,
    creator           VARCHAR(255)  NOT NULL,
    creator_id        BIGINT        NOT NULL,
    category          VARCHAR(20)   NOT NULL,
    topic             VARCHAR(64)   NOT NULL,
    duration          VARCHAR(64)   NOT NULL,
    description       TEXT          NOT NULL,
    subscriber_only   BOOLEAN       NOT NULL DEFAULT FALSE,
    upload_date       DATE          NOT NULL,
    thumbnail         VARCHAR(1024) NOT NULL,
    rejection_reason  VARCHAR(512),
    status            VARCHAR(20)   NOT NULL DEFAULT 'PENDING'
);

CREATE TABLE distribution_regions (
    id                  BIGSERIAL PRIMARY KEY,
    region              VARCHAR(255) NOT NULL,
    distribution_points VARCHAR(128) NOT NULL,
    monthly_amount      VARCHAR(128) NOT NULL,
    last_delivery       DATE         NOT NULL,
    status              VARCHAR(32)  NOT NULL
);

CREATE TABLE system_modules (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(128)     NOT NULL UNIQUE,
    status          VARCHAR(20)      NOT NULL,
    uptime_percent  DOUBLE PRECISION NOT NULL,
    request_count   BIGINT           NOT NULL,
    sort_order      INTEGER          NOT NULL
);

CREATE TABLE weekly_deliveries (
    id             BIGSERIAL PRIMARY KEY,
    day_of_week    INTEGER     NOT NULL,
    day_label      VARCHAR(8)  NOT NULL,
    delivery_count INTEGER     NOT NULL
);

CREATE TABLE monthly_metrics (
    id           BIGSERIAL PRIMARY KEY,
    month_index  INTEGER        NOT NULL,
    month_label  VARCHAR(8)     NOT NULL,
    mrr          NUMERIC(14, 2) NOT NULL,
    subscribers  INTEGER        NOT NULL
);

CREATE TABLE managed_user_views (
    id               BIGSERIAL PRIMARY KEY,
    context          VARCHAR(32)    NOT NULL,
    external_user_id BIGINT         NOT NULL,
    name             VARCHAR(255)   NOT NULL,
    email            VARCHAR(255)   NOT NULL,
    tier             VARCHAR(64)    NOT NULL,
    status           VARCHAR(64)    NOT NULL,
    mrr              NUMERIC(12, 2) NOT NULL,
    sort_order       INTEGER        NOT NULL
);
CREATE INDEX idx_managed_user_views_context ON managed_user_views (context);
