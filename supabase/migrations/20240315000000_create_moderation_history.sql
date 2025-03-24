-- Create moderation_history table
CREATE TABLE IF NOT EXISTS "public"."moderation_history" (
    "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    "entity_type" character varying(50) NOT NULL,
    "entity_id" bigint NOT NULL,
    "moderator_id" uuid REFERENCES auth.users(id),
    "action" character varying(50) NOT NULL,
    "previous_status" character varying(50),
    "new_status" character varying(50) NOT NULL,
    "notes" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_moderation_history_entity" ON "public"."moderation_history" ("entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "idx_moderation_history_moderator" ON "public"."moderation_history" ("moderator_id");
CREATE INDEX IF NOT EXISTS "idx_reviews_status" ON "public"."reviews" ("status");

-- Enable RLS
ALTER TABLE "public"."moderation_history" ENABLE ROW LEVEL SECURITY;

-- Create policies for moderation_history
CREATE POLICY "Allow moderators and admins to view moderation history"
    ON "public"."moderation_history"
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.role = 'moderator'
                OR auth.users.role = 'admin'
            )
        )
    );

CREATE POLICY "Allow moderators and admins to create moderation history"
    ON "public"."moderation_history"
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.role = 'moderator'
                OR auth.users.role = 'admin'
            )
        )
    );

-- Create function to log moderation actions
CREATE OR REPLACE FUNCTION log_moderation_action()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != OLD.status THEN
        INSERT INTO moderation_history (
            entity_type,
            entity_id,
            moderator_id,
            action,
            previous_status,
            new_status,
            created_at
        ) VALUES (
            TG_TABLE_NAME,
            NEW.id,
            auth.uid(),
            'status_change',
            OLD.status,
            NEW.status,
            now()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reviews
DROP TRIGGER IF EXISTS review_moderation_trigger ON reviews;
CREATE TRIGGER review_moderation_trigger
    AFTER UPDATE OF status
    ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION log_moderation_action();

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
LEFT JOIN moderation_history mh ON r.id = mh.entity_id
LEFT JOIN auth.users u ON r.moderated_by = u.id
GROUP BY r.id, r.status, r.moderated_at, r.moderated_by, u.email; 