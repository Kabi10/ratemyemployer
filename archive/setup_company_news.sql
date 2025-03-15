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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_news_company_name ON company_news(company_name);

-- Enable RLS
ALTER TABLE company_news ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Allow public read access to company news"
    ON company_news
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow authenticated users to manage company news"
    ON company_news
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert sample data
INSERT INTO company_news (company_name, title, description, url, published_at, source_name)
VALUES
    ('Amazon', 'Amazon Faces Labor Violations Claims in Multiple States', 
     'Multiple states file complaints against Amazon for alleged workplace safety violations and unfair labor practices.',
     'https://example.com/amazon-labor-violations',
     '2024-03-15T00:00:00Z',
     'Business Insider'),
    
    ('Amazon', 'Workers Stage Walkout Over Working Conditions', 
     'Amazon warehouse workers organize walkout to protest working conditions and demand better pay.',
     'https://example.com/amazon-walkout',
     '2024-03-10T00:00:00Z',
     'Reuters'),
    
    ('Meta', 'Meta Faces Discrimination Lawsuit from Former Employees', 
     'Class action lawsuit filed against Meta alleging systematic discrimination in hiring and promotion practices.',
     'https://example.com/meta-lawsuit',
     '2024-03-12T00:00:00Z',
     'Tech Chronicle'),
    
    ('Google', 'Google Contractors Allege Unfair Treatment', 
     'Contract workers at Google claim disparate treatment compared to full-time employees.',
     'https://example.com/google-contractors',
     '2024-03-08T00:00:00Z',
     'Tech News Daily'),
    
    ('Apple', 'Apple Store Workers Unite in Unionization Effort', 
     'Retail workers at multiple Apple stores begin unionization process, citing workplace concerns.',
     'https://example.com/apple-union',
     '2024-03-05T00:00:00Z',
     'The Verge'); 