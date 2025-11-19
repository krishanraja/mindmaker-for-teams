-- Fix duplicate data and add unique constraints for all autosave tables

-- 1. STRATEGY_ADDENDUM: Clean duplicates and add unique constraint
WITH ranked_rows AS (
  SELECT 
    id,
    workshop_session_id,
    ROW_NUMBER() OVER (
      PARTITION BY workshop_session_id 
      ORDER BY updated_at DESC NULLS LAST, created_at DESC
    ) as rn
  FROM strategy_addendum
)
DELETE FROM strategy_addendum
WHERE id IN (
  SELECT id FROM ranked_rows WHERE rn > 1
);

ALTER TABLE strategy_addendum
ADD CONSTRAINT strategy_addendum_workshop_session_id_key 
UNIQUE (workshop_session_id);

-- 2. PILOT_CHARTER: Clean duplicates and add unique constraint
WITH ranked_rows AS (
  SELECT 
    id,
    workshop_session_id,
    ROW_NUMBER() OVER (
      PARTITION BY workshop_session_id 
      ORDER BY updated_at DESC NULLS LAST, created_at DESC
    ) as rn
  FROM pilot_charter
)
DELETE FROM pilot_charter
WHERE id IN (
  SELECT id FROM ranked_rows WHERE rn > 1
);

ALTER TABLE pilot_charter
ADD CONSTRAINT pilot_charter_workshop_session_id_key 
UNIQUE (workshop_session_id);

-- 3. HUDDLE_SYNTHESIS: Clean duplicates and add unique constraint
WITH ranked_rows AS (
  SELECT 
    id,
    workshop_session_id,
    ROW_NUMBER() OVER (
      PARTITION BY workshop_session_id 
      ORDER BY updated_at DESC NULLS LAST, created_at DESC
    ) as rn
  FROM huddle_synthesis
)
DELETE FROM huddle_synthesis
WHERE id IN (
  SELECT id FROM ranked_rows WHERE rn > 1
);

ALTER TABLE huddle_synthesis
ADD CONSTRAINT huddle_synthesis_workshop_session_id_key 
UNIQUE (workshop_session_id);

-- 4. PROVOCATION_REPORTS: Clean duplicates and add unique constraint
WITH ranked_rows AS (
  SELECT 
    id,
    workshop_session_id,
    ROW_NUMBER() OVER (
      PARTITION BY workshop_session_id 
      ORDER BY updated_at DESC NULLS LAST, created_at DESC
    ) as rn
  FROM provocation_reports
)
DELETE FROM provocation_reports
WHERE id IN (
  SELECT id FROM ranked_rows WHERE rn > 1
);

ALTER TABLE provocation_reports
ADD CONSTRAINT provocation_reports_workshop_session_id_key 
UNIQUE (workshop_session_id);