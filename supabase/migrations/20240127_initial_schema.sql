-- Drop existing tables if they exist
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS companies;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create companies table
CREATE TABLE companies (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    location VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    verification_status VARCHAR(50) DEFAULT 'pending',
    verified BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    company_id BIGINT REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    title VARCHAR(255) NOT NULL,
    review_content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    pros TEXT,
    cons TEXT,
    employment_status VARCHAR(50),
    position VARCHAR(255),
    is_current_employee BOOLEAN,
    reviewer_name VARCHAR(255),
    reviewer_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_location ON companies(location);
CREATE INDEX idx_reviews_company_id ON reviews(company_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_status ON reviews(status);

-- Insert sample companies
INSERT INTO companies (name, description, industry, location, website, logo_url, verification_status, verified)
VALUES
    ('Tech Innovators Inc.', 'Leading technology company specializing in AI and machine learning solutions', 'Technology', 'San Francisco, CA', 'https://techinnovators.com', 'https://example.com/logos/tech-innovators.png', 'approved', true),
    ('Green Energy Solutions', 'Renewable energy company focused on sustainable solutions', 'Energy', 'Austin, TX', 'https://greenenergy.com', 'https://example.com/logos/green-energy.png', 'approved', true),
    ('Global Finance Group', 'International financial services and consulting firm', 'Finance', 'New York, NY', 'https://globalfinance.com', 'https://example.com/logos/global-finance.png', 'approved', true),
    ('Healthcare Plus', 'Modern healthcare provider with innovative medical solutions', 'Healthcare', 'Boston, MA', 'https://healthcareplus.com', 'https://example.com/logos/healthcare-plus.png', 'approved', true),
    ('Creative Design Studio', 'Award-winning design agency specializing in digital experiences', 'Design', 'Los Angeles, CA', 'https://creativedesign.com', 'https://example.com/logos/creative-design.png', 'approved', true);

-- Insert sample reviews (without user_id as we don't have users yet)
INSERT INTO reviews (company_id, title, review_content, rating, pros, cons, employment_status, position, is_current_employee, reviewer_name, status)
VALUES
    (1, 'Great work environment', 'Amazing company culture and opportunities for growth', 5, 'Good benefits, flexible hours, great team', 'Sometimes high pressure', 'Full-time', 'Senior Developer', true, 'John D.', 'approved'),
    (1, 'Good but challenging', 'Fast-paced environment with lots to learn', 4, 'Learning opportunities, good salary', 'Work-life balance could be better', 'Full-time', 'Product Manager', false, 'Sarah M.', 'approved'),
    (2, 'Innovative company', 'Leading the way in renewable energy', 5, 'Meaningful work, great colleagues', 'Complex projects', 'Full-time', 'Environmental Engineer', true, 'Michael R.', 'approved'),
    (3, 'Professional environment', 'Strong focus on career development', 4, 'Career growth, competitive salary', 'Long hours during peak season', 'Full-time', 'Financial Analyst', true, 'Emma S.', 'approved'),
    (4, 'Patient-focused organization', 'Great place to make a difference', 5, 'Meaningful work, good benefits', 'Busy schedules', 'Part-time', 'Medical Assistant', false, 'David L.', 'approved'),
    (5, 'Creative and dynamic', 'Exciting projects and talented team', 4, 'Creative freedom, modern office', 'Project deadlines can be tight', 'Full-time', 'Senior Designer', true, 'Lisa K.', 'approved');

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for companies
CREATE POLICY "Public companies are viewable by everyone"
    ON companies FOR SELECT
    USING (true);

CREATE POLICY "Users can insert companies"
    ON companies FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own companies"
    ON companies FOR UPDATE
    USING (auth.uid() = created_by);

-- Create policies for reviews
CREATE POLICY "Approved reviews are viewable by everyone"
    ON reviews FOR SELECT
    USING (status = 'approved');

CREATE POLICY "Users can insert reviews"
    ON reviews FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own reviews"
    ON reviews FOR UPDATE
    USING (auth.uid() = user_id); 