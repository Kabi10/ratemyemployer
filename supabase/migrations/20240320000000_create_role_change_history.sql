-- Create role_change_history table
CREATE TABLE IF NOT EXISTS "public"."role_change_history" (
    "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    "user_id" uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    "changed_by" uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    "previous_role" text NOT NULL,
    "new_role" text NOT NULL,
    "reason" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_role_change_history_user" ON "public"."role_change_history" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_role_change_history_changed_by" ON "public"."role_change_history" ("changed_by");
CREATE INDEX IF NOT EXISTS "idx_role_change_history_created_at" ON "public"."role_change_history" ("created_at");

-- Enable RLS
ALTER TABLE "public"."role_change_history" ENABLE ROW LEVEL SECURITY;

-- Create policies for role_change_history
CREATE POLICY "Allow admins to view role change history"
    ON "public"."role_change_history"
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.role = 'admin'
        )
    );

CREATE POLICY "Allow admins to create role change history"
    ON "public"."role_change_history"
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.role = 'admin'
        )
    );

-- Create function to log role changes
CREATE OR REPLACE FUNCTION log_role_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.raw_app_meta_data->>'role' IS DISTINCT FROM OLD.raw_app_meta_data->>'role' THEN
        INSERT INTO role_change_history (
            user_id,
            changed_by,
            previous_role,
            new_role,
            created_at
        ) VALUES (
            NEW.id,
            auth.uid(),
            COALESCE(OLD.raw_app_meta_data->>'role', 'user'),
            NEW.raw_app_meta_data->>'role',
            now()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for role changes
DROP TRIGGER IF EXISTS role_change_trigger ON auth.users;
CREATE TRIGGER role_change_trigger
    AFTER UPDATE OF raw_app_meta_data
    ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION log_role_change();

-- Create view for role change history with user details
CREATE OR REPLACE VIEW role_change_history_with_details AS
SELECT 
    rch.*,
    u.email as user_email,
    cb.email as changed_by_email
FROM role_change_history rch
LEFT JOIN auth.users u ON u.id = rch.user_id
LEFT JOIN auth.users cb ON cb.id = rch.changed_by; 