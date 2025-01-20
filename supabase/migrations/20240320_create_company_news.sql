-- Create company_news table
CREATE TABLE IF NOT EXISTS company_news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by company name
CREATE INDEX IF NOT EXISTS idx_company_news_company_name ON company_news(company_name);

-- Add RLS policies
ALTER TABLE company_news ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read company news
CREATE POLICY "Allow public read access to company news"
  ON company_news
  FOR SELECT
  TO public
  USING (true);

-- Only allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users to manage company news"
  ON company_news
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true); 