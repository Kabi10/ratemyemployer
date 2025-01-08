-- Add company_name column to reviews table
ALTER TABLE public.reviews ADD COLUMN company_name VARCHAR(255);

-- Update existing rows with company names from companies table
UPDATE public.reviews r 
SET company_name = c.name 
FROM public.companies c 
WHERE r.company_id = c.id; 