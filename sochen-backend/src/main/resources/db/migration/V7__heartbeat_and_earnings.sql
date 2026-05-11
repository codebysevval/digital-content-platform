-- V7__heartbeat_and_earnings.sql
-- Heartbeat tracking and creator revenue engine (Phase 2).

CREATE TABLE content_heartbeats (
    id         BIGSERIAL PRIMARY KEY,
    content_id BIGINT      NOT NULL REFERENCES content (id) ON DELETE CASCADE,
    user_id    BIGINT      NOT NULL REFERENCES users   (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_heartbeats_content ON content_heartbeats (content_id);
CREATE INDEX idx_heartbeats_user    ON content_heartbeats (user_id);

CREATE TABLE creator_earnings (
    id           BIGSERIAL PRIMARY KEY,
    creator_id   BIGINT         NOT NULL,
    content_id   BIGINT         REFERENCES content           (id) ON DELETE SET NULL,
    heartbeat_id BIGINT         REFERENCES content_heartbeats(id) ON DELETE CASCADE,
    amount       NUMERIC(12, 6) NOT NULL,
    earned_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_creator_earnings_creator ON creator_earnings (creator_id);
CREATE INDEX idx_creator_earnings_month   ON creator_earnings (creator_id, earned_at);
