-- Fix content.creator and pending_content.creator rows that stored an email
-- address instead of the user's display name. Joins through creator_id → users.id.
UPDATE content c
SET creator = u.name
FROM users u
WHERE c.creator_id = u.id
  AND c.creator LIKE '%@%';

UPDATE pending_content pc
SET creator = u.name
FROM users u
WHERE pc.creator_id = u.id
  AND pc.creator LIKE '%@%';
