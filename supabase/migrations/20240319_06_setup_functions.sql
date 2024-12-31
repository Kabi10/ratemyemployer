-- Function to create user_role type
CREATE OR REPLACE FUNCTION public.create_user_role_type()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    CREATE TYPE IF NOT EXISTS public.user_role AS ENUM ('admin', 'user');
END;
$$;

-- Function to add role column
CREATE OR REPLACE FUNCTION public.add_role_column()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    ALTER TABLE auth.users 
    ADD COLUMN IF NOT EXISTS role public.user_role 
    DEFAULT 'user'::public.user_role;
END;
$$;

-- Function to set initial admin
CREATE OR REPLACE FUNCTION public.set_initial_admin(admin_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE auth.users
    SET role = 'admin'::public.user_role
    WHERE email = admin_email;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_user_role_type TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_role_column TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_initial_admin TO authenticated; 