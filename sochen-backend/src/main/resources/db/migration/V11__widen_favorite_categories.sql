-- Widen the favorite_category column to hold multiple comma-separated topic IDs
ALTER TABLE users ALTER COLUMN favorite_category TYPE VARCHAR(500);
