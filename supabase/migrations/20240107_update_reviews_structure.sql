-- Update reviews table structure
BEGIN;

-- Drop optional columns
ALTER TABLE reviews
  DROP COLUMN IF EXISTS pros,
  DROP COLUMN IF EXISTS cons,
  DROP COLUMN IF EXISTS reviewer_name,
  DROP COLUMN IF EXISTS reviewer_email;

-- Update content column to allow larger text
ALTER TABLE reviews
  ALTER COLUMN content TYPE text;

COMMIT; 