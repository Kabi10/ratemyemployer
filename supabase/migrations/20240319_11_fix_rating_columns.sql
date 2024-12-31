-- Update the average_rating calculation function
CREATE OR REPLACE FUNCTION update_company_average_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE companies
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE company_id = NEW.company_id
            AND status = 'approved'
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews
            WHERE company_id = NEW.company_id
            AND status = 'approved'
        )
    WHERE id = NEW.company_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_company_average_rating_trigger ON reviews;

-- Create the trigger
CREATE TRIGGER update_company_average_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_company_average_rating(); 