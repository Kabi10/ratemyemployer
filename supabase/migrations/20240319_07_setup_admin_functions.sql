-- Create functions for setting up admin user
CREATE OR REPLACE FUNCTION public.create_user_role_type()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_role_column()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    ALTER TABLE auth.users 
    ADD COLUMN IF NOT EXISTS role public.user_role 
    DEFAULT 'user'::public.user_role;
EXCEPTION
    WHEN duplicate_column THEN null;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_admin_user(admin_email text)
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