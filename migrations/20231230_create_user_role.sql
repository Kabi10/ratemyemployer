-- Create user_role type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add role column to auth.users if it doesn't exist
DO $$ BEGIN
    ALTER TABLE auth.users ADD COLUMN role user_role DEFAULT 'user';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id text)
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (SELECT role FROM auth.users WHERE id = user_id);
END;
$$; 