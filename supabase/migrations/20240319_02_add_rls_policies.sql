-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Public companies are viewable by everyone"
  ON companies FOR SELECT
  USING (true);

CREATE POLICY "Companies can only be created by authenticated users"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Companies can only be updated by creators or admins"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'admin'
  ));

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can only create reviews when logged in"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies (name);
CREATE INDEX IF NOT EXISTS idx_reviews_company_id ON reviews (company_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews (created_at DESC);

-- Add check constraints for ratings
ALTER TABLE reviews
  ADD CONSTRAINT chk_rating_range
  CHECK (rating >= 1 AND rating <= 5); 