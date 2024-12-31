# Database Change Log

## 2024-03-19 - Database Structure Improvements

### Changes

1. Table Structure Updates

   - Modified data types for timestamp fields
   - Removed redundant verification_status column
   - Added unique constraint on company names
   - Added proper foreign key constraints

2. Security Improvements
   - Enabled Row Level Security (RLS) on tables
   - Added policies for public read access
   - Added policies for authenticated user actions

### SQL Migrations

Migration file: `20240319_01_fix_data_types.sql`

```sql
-- Fix timestamp fields
ALTER TABLE companies
  ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE,
  ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE,
  ALTER COLUMN verification_date TYPE TIMESTAMP WITH TIME ZONE;

-- Fix description field
ALTER TABLE companies
  ALTER COLUMN description TYPE TEXT;

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
```

Migration file: `20240319_02_add_rls_policies.sql`

```sql
-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Public companies are viewable by everyone"
  ON companies FOR SELECT
  USING (true);

CREATE POLICY "Companies can only be created by authenticated users"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Companies can only be updated by creators or admins"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'admin'
  ));

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can only create reviews when logged in"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

### Validation Rules

Added the following validation rules:

- Company names must be unique
- Reviews must have a valid company_id and user_id
- Reviews are linked to companies with cascading deletes
- Users can only modify their own content unless they are admins

### Security Changes

- Enabled RLS on all tables
- Added policies for:
  - Public read access
  - Authenticated user creation
  - Owner-only updates
  - Admin override capabilities

### Next Steps

1. Monitor for any issues with the cascading deletes
2. Consider adding additional indexes for performance
3. Implement rate limiting on review submissions
4. Add data validation triggers for rating ranges
