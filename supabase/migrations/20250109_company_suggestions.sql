-- Create company_suggestions table for user-driven company additions
CREATE TABLE IF NOT EXISTS "public"."company_suggestions" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "name" character varying(100) NOT NULL,
    "industry" character varying(50),
    "location" character varying(150),
    "website" character varying(2048),
    "description" text,
    "size" character varying(20),
    "suggested_by" uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    "status" character varying(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    "admin_notes" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "company_suggestions_status_idx" ON "public"."company_suggestions" ("status");
CREATE INDEX IF NOT EXISTS "company_suggestions_suggested_by_idx" ON "public"."company_suggestions" ("suggested_by");
CREATE INDEX IF NOT EXISTS "company_suggestions_created_at_idx" ON "public"."company_suggestions" ("created_at");

-- Enable Row Level Security
ALTER TABLE "public"."company_suggestions" ENABLE ROW LEVEL SECURITY;

-- Create policies for company suggestions
-- Users can view their own suggestions
CREATE POLICY "Users can view own suggestions" ON "public"."company_suggestions"
    FOR SELECT USING (auth.uid() = suggested_by);

-- Users can insert their own suggestions
CREATE POLICY "Users can create suggestions" ON "public"."company_suggestions"
    FOR INSERT WITH CHECK (auth.uid() = suggested_by);

-- Admins can view all suggestions (you'll need to implement admin role checking)
-- For now, we'll allow authenticated users to view all pending suggestions
CREATE POLICY "Authenticated users can view pending suggestions" ON "public"."company_suggestions"
    FOR SELECT USING (auth.role() = 'authenticated' AND status = 'pending');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_company_suggestions_updated_at 
    BEFORE UPDATE ON "public"."company_suggestions"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON "public"."company_suggestions" TO authenticated;
GRANT ALL ON "public"."company_suggestions" TO service_role;
