-- Function to set a user as admin
CREATE OR REPLACE FUNCTION public.set_user_as_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE auth.users
    SET role = 'admin'::user_role
    WHERE email = user_email;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.set_user_as_admin TO authenticated;

-- Create RLS policy for the function
CREATE POLICY "Allow authenticated users to execute set_user_as_admin"
    ON public.users
    FOR ALL
    TO authenticated
    USING (true); 