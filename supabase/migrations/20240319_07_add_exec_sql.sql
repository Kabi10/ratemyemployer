-- Function to execute SQL commands
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    EXECUTE sql;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.exec_sql TO authenticated; 