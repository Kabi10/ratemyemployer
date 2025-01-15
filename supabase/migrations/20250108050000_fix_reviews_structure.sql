-- Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.reviews (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    company_id BIGINT REFERENCES public.companies(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    pros TEXT,
    cons TEXT,
    position VARCHAR(255),
    employment_status VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    status VARCHAR(255) DEFAULT 'pending',
    is_current_employee BOOLEAN DEFAULT false,
    user_id UUID REFERENCES auth.users(id),
    company_name VARCHAR(255),
    reviewer_email VARCHAR(255),
    reviewer_name VARCHAR(255),
    likes INTEGER DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS reviews_company_id_idx ON public.reviews(company_id);
CREATE INDEX IF NOT EXISTS reviews_company_name_idx ON public.reviews(company_name);

-- Update company_name from companies table for existing records
UPDATE public.reviews r 
SET company_name = c.name 
FROM public.companies c 
WHERE r.company_id = c.id 
AND r.company_name IS NULL;

-- Add comments for documentation
COMMENT ON TABLE public.reviews IS 'Table storing company reviews with proper user identification and company details';
COMMENT ON COLUMN public.reviews.user_id IS 'Reference to auth.users for review ownership';
COMMENT ON COLUMN public.reviews.company_name IS 'Denormalized company name for easier querying';
COMMENT ON COLUMN public.reviews.reviewer_email IS 'Optional reviewer email for non-authenticated reviews';
COMMENT ON COLUMN public.reviews.reviewer_name IS 'Optional reviewer name for display'; 