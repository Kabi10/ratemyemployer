-- Function to get admin dashboard statistics
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    company_count integer;
    review_count integer;
    user_count integer;
    pending_count integer;
BEGIN
    -- Check if the requesting user is an admin
    IF (SELECT role FROM auth.users WHERE id = auth.uid()) != 'admin' THEN
        RAISE EXCEPTION 'Only admins can view stats';
    END IF;

    -- Get total companies
    SELECT COUNT(*) INTO company_count FROM companies;

    -- Get total reviews
    SELECT COUNT(*) INTO review_count FROM reviews;

    -- Get total users
    SELECT COUNT(*) INTO user_count FROM auth.users;

    -- Get pending reviews
    SELECT COUNT(*) INTO pending_count FROM reviews WHERE status = 'pending';

    -- Return all stats as JSON
    RETURN json_build_object(
        'totalCompanies', company_count,
        'totalReviews', review_count,
        'totalUsers', user_count,
        'pendingReviews', pending_count
    );
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_admin_stats TO authenticated; 