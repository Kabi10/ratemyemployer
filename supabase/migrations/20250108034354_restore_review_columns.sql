DO $$ 
BEGIN
    -- Add reviewer_name if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews' 
        AND column_name = 'reviewer_name'
    ) THEN
        ALTER TABLE public.reviews ADD COLUMN reviewer_name varchar(255);
    END IF;

    -- Add reviewer_email if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews' 
        AND column_name = 'reviewer_email'
    ) THEN
        ALTER TABLE public.reviews ADD COLUMN reviewer_email varchar(255);
    END IF;
END $$;

-- Add comment explaining the purpose
COMMENT ON TABLE public.reviews IS 'Table storing company reviews with optional user identification';
