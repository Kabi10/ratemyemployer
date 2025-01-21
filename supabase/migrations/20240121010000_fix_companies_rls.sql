-- Drop existing RLS policies on companies table if they exist
DO $$ 
BEGIN
    EXECUTE (
        SELECT string_agg('DROP POLICY IF EXISTS "' || policyname || '" ON companies;', E'\n')
        FROM pg_catalog.pg_policies 
        WHERE tablename = 'companies'
    );
END $$;

-- Enable RLS on companies table
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read companies
CREATE POLICY "Allow public read access to companies"
  ON companies
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to create companies
CREATE POLICY "Allow authenticated users to create companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update their own companies
CREATE POLICY "Allow users to update their own companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Add created_by column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'companies' 
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE companies 
    ADD COLUMN created_by UUID REFERENCES auth.users(id);
  END IF;
END $$; 