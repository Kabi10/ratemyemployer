-- MCP Stored Procedures for RateMyEmployer
-- These procedures can be executed in your Supabase SQL Editor

-- Function to get average ratings by industry
CREATE OR REPLACE FUNCTION get_average_ratings_by_industry()
RETURNS TABLE (
  industry TEXT,
  avg_industry_rating FLOAT,
  company_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.industry::TEXT, 
    AVG(c.average_rating)::FLOAT AS avg_industry_rating,
    COUNT(c.id)::BIGINT AS company_count
  FROM 
    companies c
  WHERE 
    c.industry IS NOT NULL AND
    c.average_rating IS NOT NULL
  GROUP BY 
    c.industry
  ORDER BY 
    avg_industry_rating DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get review submission trends by month
CREATE OR REPLACE FUNCTION get_review_submission_trends()
RETURNS TABLE (
  month TEXT,
  review_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(r.created_at, 'YYYY-MM') AS month,
    COUNT(r.id)::BIGINT AS review_count
  FROM 
    reviews r
  WHERE 
    r.created_at IS NOT NULL
  GROUP BY 
    month
  ORDER BY 
    month;
END;
$$ LANGUAGE plpgsql;

-- Function to get top-rated companies in a specific industry
CREATE OR REPLACE FUNCTION get_top_companies_by_industry(industry_name TEXT)
RETURNS TABLE (
  id INT,
  name TEXT,
  location TEXT,
  average_rating FLOAT,
  total_reviews INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.location,
    c.average_rating::FLOAT,
    c.total_reviews::INT
  FROM 
    companies c
  WHERE 
    c.industry = industry_name AND
    c.average_rating IS NOT NULL
  ORDER BY 
    c.average_rating DESC, c.total_reviews DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Function to get recent reviews for a company
CREATE OR REPLACE FUNCTION get_recent_reviews_for_company(company_id_param INT)
RETURNS TABLE (
  id INT,
  title TEXT,
  rating FLOAT,
  pros TEXT,
  cons TEXT,
  employment_status TEXT,
  position TEXT,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.rating::FLOAT,
    r.pros,
    r.cons,
    r.employment_status,
    r.position,
    r.created_at
  FROM 
    reviews r
  WHERE 
    r.company_id = company_id_param AND
    r.status = 'approved'
  ORDER BY 
    r.created_at DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Function to search companies by name or location
CREATE OR REPLACE FUNCTION search_companies(search_term TEXT)
RETURNS TABLE (
  id INT,
  name TEXT,
  industry TEXT,
  location TEXT,
  average_rating FLOAT,
  total_reviews INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.industry,
    c.location,
    c.average_rating::FLOAT,
    c.total_reviews::INT
  FROM 
    companies c
  WHERE 
    c.name ILIKE '%' || search_term || '%' OR
    c.location ILIKE '%' || search_term || '%'
  ORDER BY 
    c.average_rating DESC NULLS LAST
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Function to get rating distribution
CREATE OR REPLACE FUNCTION get_rating_distribution()
RETURNS TABLE (
  rating INT,
  review_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    FLOOR(r.rating)::INT AS rating,
    COUNT(r.id)::BIGINT AS review_count
  FROM 
    reviews r
  WHERE 
    r.rating IS NOT NULL
  GROUP BY 
    rating
  ORDER BY 
    rating;
END;
$$ LANGUAGE plpgsql;

-- Function to get companies with no reviews
CREATE OR REPLACE FUNCTION get_companies_with_no_reviews()
RETURNS TABLE (
  id INT,
  name TEXT,
  industry TEXT,
  location TEXT,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.industry,
    c.location,
    c.created_at
  FROM 
    companies c
  WHERE 
    c.total_reviews = 0 OR c.total_reviews IS NULL
  ORDER BY 
    c.created_at DESC;
END;
$$ LANGUAGE plpgsql; 