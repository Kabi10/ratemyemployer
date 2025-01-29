-- Rename user_id column to reviewer_id
ALTER TABLE reviews RENAME COLUMN user_id TO reviewer_id;

-- Update the index name
DROP INDEX IF EXISTS idx_reviews_user_id;
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);

-- Update the RLS policy
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
CREATE POLICY "Users can update their own reviews"
    ON reviews FOR UPDATE
    USING (auth.uid() = reviewer_id);

-- Add a trigger to automatically set reviewer_id on insert
CREATE OR REPLACE FUNCTION set_reviewer_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.reviewer_id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_reviewer_id_on_insert
    BEFORE INSERT ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION set_reviewer_id(); 