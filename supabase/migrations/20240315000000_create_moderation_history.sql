-- Create moderation history table
CREATE TABLE IF NOT EXISTS moderation_history (
  id BIGSERIAL PRIMARY KEY,
  review_id BIGINT REFERENCES reviews(id) ON DELETE CASCADE,
  moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  note TEXT,
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add moderation fields to reviews table if they don't exist
DO $$ 
BEGIN
  -- Add moderation_note column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'moderation_note') 
  THEN
    ALTER TABLE reviews ADD COLUMN moderation_note TEXT;
  END IF;

  -- Add moderated_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'moderated_at') 
  THEN
    ALTER TABLE reviews ADD COLUMN moderated_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add moderated_by column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'moderated_by') 
  THEN
    ALTER TABLE reviews ADD COLUMN moderated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create trigger function to log moderation history
CREATE OR REPLACE FUNCTION log_review_moderation()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO moderation_history (
      review_id,
      moderator_id,
      action,
      note,
      previous_status,
      new_status,
      created_at
    ) VALUES (
      NEW.id,
      NEW.moderated_by,
      CASE 
        WHEN NEW.status = 'approved' THEN 'approve'
        WHEN NEW.status = 'rejected' THEN 'reject'
        ELSE 'update'
      END,
      NEW.moderation_note,
      OLD.status,
      NEW.status,
      COALESCE(NEW.moderated_at, NOW())
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for review moderation
DROP TRIGGER IF EXISTS review_moderation_trigger ON reviews;
CREATE TRIGGER review_moderation_trigger
  AFTER UPDATE OF status
  ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION log_review_moderation();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_moderation_history_review_id ON moderation_history(review_id);
CREATE INDEX IF NOT EXISTS idx_moderation_history_created_at ON moderation_history(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_moderated_at ON reviews(moderated_at);

-- Add RLS policies for moderation_history
ALTER TABLE moderation_history ENABLE ROW LEVEL SECURITY;

-- Allow moderators and admins to view moderation history
CREATE POLICY "Moderators can view moderation history"
  ON moderation_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.user_metadata->>'role' = 'moderator'
        OR auth.users.user_metadata->>'role' = 'admin'
      )
    )
  );

-- Allow moderators and admins to insert moderation history
CREATE POLICY "Moderators can insert moderation history"
  ON moderation_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.user_metadata->>'role' = 'moderator'
        OR auth.users.user_metadata->>'role' = 'admin'
      )
    )
  );

-- Create view for review moderation stats
CREATE OR REPLACE VIEW review_moderation_stats AS
SELECT
  r.id as review_id,
  r.status,
  r.moderated_at,
  r.moderated_by,
  u.email as moderator_email,
  COUNT(mh.id) as moderation_count,
  MAX(mh.created_at) as last_moderation,
  STRING_AGG(DISTINCT mh.action, ', ' ORDER BY mh.action) as actions_taken
FROM reviews r
LEFT JOIN moderation_history mh ON r.id = mh.review_id
LEFT JOIN auth.users u ON r.moderated_by = u.id
GROUP BY r.id, r.status, r.moderated_at, r.moderated_by, u.email; 