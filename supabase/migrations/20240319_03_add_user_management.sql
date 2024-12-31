-- Function to list all users with their roles
CREATE OR REPLACE FUNCTION public.list_users()
RETURNS TABLE (
    id text,
    email text,
    role text,
    created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the requesting user is an admin
    IF (SELECT role FROM auth.users WHERE id = auth.uid()) != 'admin' THEN
        RAISE EXCEPTION 'Only admins can list users';
    END IF;

    RETURN QUERY
    SELECT 
        u.id::text,
        u.email::text,
        u.role::text,
        u.created_at
    FROM auth.users u
    ORDER BY u.created_at DESC;
END;
$$;

-- Function to update a user's role
CREATE OR REPLACE FUNCTION public.update_user_role(
    target_user_id text,
    new_role user_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the requesting user is an admin
    IF (SELECT role FROM auth.users WHERE id = auth.uid()) != 'admin' THEN
        RAISE EXCEPTION 'Only admins can update user roles';
    END IF;

    -- Check if the target user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- Don't allow changing own role
    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Cannot change own role';
    END IF;

    -- Update the user's role
    UPDATE auth.users
    SET role = new_role
    WHERE id = target_user_id;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.list_users TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_role TO authenticated; 