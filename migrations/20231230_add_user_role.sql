-- Create the user_role enum type if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('admin', 'user');
    END IF;
END $$;

-- Add the role column to the users table if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE auth.users ADD COLUMN role user_role DEFAULT 'user';
    END IF;
END $$;

-- Create a function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT role::text
        FROM auth.users
        WHERE id = user_id
    );
END;
$$; 