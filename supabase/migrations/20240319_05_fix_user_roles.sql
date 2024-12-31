-- Create user_role type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add role column to auth.users if it doesn't exist
DO $$ BEGIN
    ALTER TABLE auth.users ADD COLUMN role public.user_role DEFAULT 'user'::public.user_role;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Public companies are viewable by everyone" ON companies;
DROP POLICY IF EXISTS "Companies can only be created by authenticated users" ON companies;
DROP POLICY IF EXISTS "Companies can only be updated by creators or admins" ON companies;

-- Create new RLS policies for companies
CREATE POLICY "Companies are viewable by everyone" 
ON companies FOR SELECT 
USING (true);

CREATE POLICY "Companies can be created by authenticated users" 
ON companies FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Companies can be updated by any authenticated user" 
ON companies FOR UPDATE 
TO authenticated 
USING (true);

-- Drop existing RLS policies for reviews
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Users can only create reviews when logged in" ON reviews;
DROP POLICY IF EXISTS "Users can only update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can only delete their own reviews" ON reviews;

-- Create new RLS policies for reviews
CREATE POLICY "Reviews are viewable by everyone" 
ON reviews FOR SELECT 
USING (true);

CREATE POLICY "Reviews can be created by authenticated users" 
ON reviews FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Reviews can be updated by owners" 
ON reviews FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Reviews can be deleted by owners" 
ON reviews FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Enable RLS on tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create function to set initial admin user
CREATE OR REPLACE FUNCTION public.set_initial_admin(admin_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE auth.users
    SET role = 'admin'
    WHERE email = admin_email;
END;
$$; 