-- =========================================================================
-- V5__upload_v2_and_avatar.sql
-- Adds avatar_url to users and upload-tracking columns to pending_content.
-- =========================================================================

ALTER TABLE users
    ADD COLUMN avatar_url VARCHAR(1024);

ALTER TABLE pending_content
    ADD COLUMN media_url              VARCHAR(1024),
    ADD COLUMN thumbnail_upload_url   VARCHAR(1024),
    ADD COLUMN attachment_urls        TEXT;
