-- Normalize legacy uppercase/invalid favorite_category values to canonical topic slugs.
-- Old values (from UserSettings before Phase 2): YAZILIM, EKONOMI, SPOR, TARIH, MUZIK
-- Also cleans: COURSES, ECONOMY (wrong casing / wrong token).

UPDATE users SET favorite_category = LOWER(favorite_category)
WHERE favorite_category IS NOT NULL AND favorite_category <> '';

-- Map legacy Turkish uppercase slugs to canonical English slugs
UPDATE users SET favorite_category = REGEXP_REPLACE(favorite_category, '\byazilim\b', 'software', 'g')
WHERE favorite_category IS NOT NULL AND favorite_category ~ '\byazilim\b';

UPDATE users SET favorite_category = REGEXP_REPLACE(favorite_category, '\bkonomi\b', 'economy', 'g')
WHERE favorite_category IS NOT NULL AND favorite_category ~ '\bkonomi\b';

UPDATE users SET favorite_category = REGEXP_REPLACE(favorite_category, '\bspor\b', 'sports', 'g')
WHERE favorite_category IS NOT NULL AND favorite_category ~ '\bspor\b';

UPDATE users SET favorite_category = REGEXP_REPLACE(favorite_category, '\btarih\b', 'history', 'g')
WHERE favorite_category IS NOT NULL AND favorite_category ~ '\btarih\b';

UPDATE users SET favorite_category = REGEXP_REPLACE(favorite_category, '\bmuzik\b', 'music', 'g')
WHERE favorite_category IS NOT NULL AND favorite_category ~ '\bmuzik\b';

-- courses is not a valid topic slug — remove it from the list
UPDATE users SET favorite_category = TRIM(BOTH ',' FROM REGEXP_REPLACE(
    REGEXP_REPLACE(favorite_category, ',?courses,?', ',', 'g'), ',+', ',', 'g'))
WHERE favorite_category IS NOT NULL AND favorite_category LIKE '%courses%';

-- Clear any remaining obviously invalid values (single token not in allowed set)
UPDATE users SET favorite_category = NULL
WHERE favorite_category IS NOT NULL
  AND favorite_category NOT SIMILAR TO
    '%(software|technology|business|finance|economy|design|science|health|sports|history|music|art|film|gaming|lifestyle|food|politics|culture|philosophy|literature|education)%';
