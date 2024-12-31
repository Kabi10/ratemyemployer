-- Fix timestamp fields
ALTER TABLE companies
  ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE USING created_at::TIMESTAMP WITH TIME ZONE,
  ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE USING updated_at::TIMESTAMP WITH TIME ZONE,
  ALTER COLUMN verification_date TYPE TIMESTAMP WITH TIME ZONE USING verification_date::TIMESTAMP WITH TIME ZONE;

-- Fix description field
ALTER TABLE companies
  ALTER COLUMN description TYPE TEXT USING description::TEXT;

-- Remove redundant column
ALTER TABLE companies
  DROP COLUMN IF EXISTS verification_status;

-- Add unique constraint
ALTER TABLE companies
  ADD CONSTRAINT company_name_unique UNIQUE (name);

-- Add foreign key constraints
ALTER TABLE reviews
  ADD CONSTRAINT fk_company
  FOREIGN KEY (company_id)
  REFERENCES companies(id)
  ON DELETE CASCADE;

ALTER TABLE reviews
  ADD CONSTRAINT fk_user
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE; 