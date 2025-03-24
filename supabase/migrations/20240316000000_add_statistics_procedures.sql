-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_location_statistics();
DROP FUNCTION IF EXISTS get_size_statistics();
DROP FUNCTION IF EXISTS get_industry_statistics();
DROP FUNCTION IF EXISTS check_trigger_and_function_status();

-- Create a stored procedure to get location statistics
CREATE OR REPLACE FUNCTION get_location_statistics()
RETURNS TABLE (
  location text,
  average_rating numeric,
  company_count bigint,
  review_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CAST(c.location AS text),
    COALESCE(AVG(r.rating), 0)::numeric AS average_rating,
    COUNT(DISTINCT c.id) AS company_count,
    COUNT(r.id) AS review_count
  FROM 
    companies c
  LEFT JOIN 
    reviews r ON c.id = r.company_id
  WHERE 
    c.location IS NOT NULL
  GROUP BY 
    c.location
  HAVING 
    COUNT(r.id) > 0
  ORDER BY 
    average_rating DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a stored procedure to get size statistics
CREATE OR REPLACE FUNCTION get_size_statistics()
RETURNS TABLE (
  size text,
  average_rating numeric,
  company_count bigint,
  review_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CAST(c.size AS text),
    COALESCE(AVG(r.rating), 0)::numeric AS average_rating,
    COUNT(DISTINCT c.id) AS company_count,
    COUNT(r.id) AS review_count
  FROM 
    companies c
  LEFT JOIN 
    reviews r ON c.id = r.company_id
  WHERE 
    c.size IS NOT NULL
  GROUP BY 
    c.size
  HAVING 
    COUNT(r.id) > 0
  ORDER BY 
    average_rating DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a stored procedure to get industry statistics
CREATE OR REPLACE FUNCTION get_industry_statistics()
RETURNS TABLE (
  industry text,
  average_rating numeric,
  company_count bigint,
  review_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CAST(c.industry AS text),
    COALESCE(AVG(r.rating), 0)::numeric AS average_rating,
    COUNT(DISTINCT c.id) AS company_count,
    COUNT(r.id) AS review_count
  FROM 
    companies c
  LEFT JOIN 
    reviews r ON c.id = r.company_id
  WHERE 
    c.industry IS NOT NULL
  GROUP BY 
    c.industry
  HAVING 
    COUNT(r.id) > 0
  ORDER BY 
    average_rating DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a function to check trigger and function status
CREATE OR REPLACE FUNCTION check_trigger_and_function_status()
RETURNS TABLE (
  trigger_name text,
  trigger_table text,
  trigger_event text,
  function_name text,
  function_status text,
  error_message text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tgname::text,
    c.relname::text,
    CASE 
      WHEN t.tgtype & 2 = 2 THEN 'BEFORE'
      WHEN t.tgtype & 16 = 16 THEN 'AFTER'
      ELSE 'UNKNOWN'
    END::text,
    p.proname::text,
    CASE 
      WHEN p.provolatile = 'i' THEN 'immutable'
      WHEN p.provolatile = 's' THEN 'stable'
      WHEN p.provolatile = 'v' THEN 'volatile'
      ELSE 'unknown'
    END::text,
    'OK'::text
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_proc p ON t.tgfoid = p.oid
  WHERE c.relnamespace = 'public'::regnamespace;
END;
$$ LANGUAGE plpgsql STABLE; 