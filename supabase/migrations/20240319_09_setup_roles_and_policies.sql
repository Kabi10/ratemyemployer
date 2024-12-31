-- Enable the pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the user_role type if it doesn't exist
DO $$ 
BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add role column to auth.users if it doesn't exist
DO $$ 
BEGIN
    ALTER TABLE auth.users 
    ADD COLUMN IF NOT EXISTS role public.user_role 
    DEFAULT 'user'::public.user_role;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Set up RLS policies for the companies table
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access for all users"
    ON public.companies
    FOR SELECT
    USING (true);

CREATE POLICY "Allow write access for admin users"
    ON public.companies
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.role = 'admin'::public.user_role
        )
    );

-- Set up RLS policies for the reviews table
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access for all users"
    ON public.reviews
    FOR SELECT
    USING (true);

CREATE POLICY "Allow write access for admin users"
    ON public.reviews
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.role = 'admin'::public.user_role
        )
    );

-- Set the initial admin user
UPDATE auth.users
SET role = 'admin'::public.user_role
WHERE email = 'kabiedu@gmail.com'; 