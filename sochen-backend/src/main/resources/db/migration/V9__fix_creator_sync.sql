-- V9__fix_creator_sync.sql
-- Inserts a creators row for every user with CREATOR role that has no
-- corresponding record. This repairs any mismatch caused by assigning the
-- CREATOR role directly in the DB without going through the approval flow.

INSERT INTO creators (id, name, avatar, type, bio, followers, total_content, total_views)
SELECT
    u.id,
    u.name,
    CASE
        WHEN TRIM(u.name) LIKE '% %'
            THEN UPPER(SUBSTRING(TRIM(u.name), 1, 1))
              || UPPER(SUBSTRING(TRIM(u.name), STRPOS(TRIM(u.name), ' ') + 1, 1))
        ELSE UPPER(SUBSTRING(TRIM(u.name), 1, 1))
    END,
    'İçerik Üretici',
    '',
    0,
    0,
    0
FROM users u
WHERE u.role = 'CREATOR'
  AND NOT EXISTS (SELECT 1 FROM creators c WHERE c.id = u.id);
