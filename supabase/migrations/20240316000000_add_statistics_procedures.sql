-- Create a stored procedure to get location statistics
CREATE OR REPLACE FUNCTION get_location_statistics()
RETURNS TABLE (
  location TEXT,
  average_rating NUMERIC,
  company_count BIGINT,
  review_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.location,
    COALESCE(AVG(r.rating), 0) AS average_rating,
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
  size TEXT,
  average_rating NUMERIC,
  company_count BIGINT,
  review_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.size,
    COALESCE(AVG(r.rating), 0) AS average_rating,
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

-- Create a stored procedure to get industry statistics (more detailed than get_average_ratings_by_industry)
CREATE OR REPLACE FUNCTION get_industry_statistics()
RETURNS TABLE (
  industry TEXT,
  average_rating NUMERIC,
  company_count BIGINT,
  review_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.industry,
    COALESCE(AVG(r.rating), 0) AS average_rating,
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