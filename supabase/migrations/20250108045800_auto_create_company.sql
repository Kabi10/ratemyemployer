-- Create function to handle automatic company creation
CREATE OR REPLACE FUNCTION public.handle_new_review()
RETURNS TRIGGER AS $$
DECLARE
    existing_company_id bigint;
BEGIN
    -- If company_name is provided, check if it already exists
    IF NEW.company_name IS NOT NULL THEN
        -- Try to find existing company by name (case insensitive)
        SELECT id INTO existing_company_id 
        FROM public.companies 
        WHERE LOWER(name) = LOWER(NEW.company_name);

        -- If company exists, use its id
        IF existing_company_id IS NOT NULL THEN
            NEW.company_id := existing_company_id;
        -- If company doesn't exist and no company_id is set, create new company
        ELSIF NOT EXISTS (SELECT 1 FROM public.companies WHERE id = NEW.company_id) THEN
            -- Insert new company and get its id
            WITH new_company AS (
                INSERT INTO public.companies (
                    name,
                    created_at,
                    updated_at,
                    industry,
                    website,
                    logo_url,
                    benefits,
                    company_values,
                    ceo,
                    verification_status,
                    average_rating,
                    total_reviews,
                    description,
                    recommendation_rate,
                    created_by,
                    verified,
                    verification_date,
                    location
                ) VALUES (
                    NEW.company_name,  -- name
                    NOW(),            -- created_at
                    NOW(),            -- updated_at
                    NULL,             -- industry
                    NULL,             -- website
                    NULL,             -- logo_url
                    NULL,             -- benefits
                    NULL,             -- company_values
                    NULL,             -- ceo
                    'pending',        -- verification_status
                    0,               -- average_rating
                    1,               -- total_reviews (starting with this review)
                    NULL,             -- description
                    0,               -- recommendation_rate
                    NEW.user_id,      -- created_by (from the reviewer)
                    false,           -- verified
                    NULL,             -- verification_date
                    ''               -- location
                )
                RETURNING id
            )
            -- Update the review's company_id with the new company's id
            SELECT id INTO NEW.company_id FROM new_company;
        END IF;
    -- If company exists but company_name is not set, get it from companies table
    ELSIF NEW.company_id IS NOT NULL AND NEW.company_name IS NULL THEN
        SELECT name INTO NEW.company_name
        FROM public.companies
        WHERE id = NEW.company_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run before insert or update
DROP TRIGGER IF EXISTS handle_new_review_trigger ON public.reviews;
CREATE TRIGGER handle_new_review_trigger
    BEFORE INSERT OR UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_review(); 