-- V6__nuke_seed_data.sql
-- Removes all V3 demo/seed content so the platform starts with a clean slate.
-- ON DELETE CASCADE handles child rows (content_modules, content_topics,
-- user_likes, offline_content, user_follows, user_notifications).

DELETE FROM content;
DELETE FROM creators;
DELETE FROM pending_content;
DELETE FROM monthly_metrics;
DELETE FROM managed_user_views;

DELETE FROM subscriptions   WHERE user_id = 1;
DELETE FROM billing_records WHERE user_id = 1;
DELETE FROM usage_quotas    WHERE user_id = 1;

SELECT setval(pg_get_serial_sequence('content',             'id'), 1, false);
SELECT setval(pg_get_serial_sequence('pending_content',     'id'), 1, false);
SELECT setval(pg_get_serial_sequence('monthly_metrics',     'id'), 1, false);
SELECT setval(pg_get_serial_sequence('managed_user_views',  'id'), 1, false);
SELECT setval(pg_get_serial_sequence('subscriptions',       'id'), 1, false);
SELECT setval(pg_get_serial_sequence('billing_records',     'id'), 1, false);
