-- Create company_news table optimized for Marketaux
CREATE TABLE IF NOT EXISTS company_news (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    source TEXT,
    relevance_score FLOAT,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Create a unique constraint to prevent duplicates
    UNIQUE(company_name, url)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_news_company_name ON company_news(company_name);
CREATE INDEX IF NOT EXISTS idx_company_news_relevance ON company_news(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_company_news_published_at ON company_news(published_at DESC); 