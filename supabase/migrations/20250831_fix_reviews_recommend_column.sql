-- Add missing recommend column to reviews table
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS recommend BOOLEAN DEFAULT NULL;

-- Update existing reviews with default recommend values based on rating
UPDATE public.reviews 
SET recommend = CASE 
    WHEN overall_rating >= 4 THEN true
    WHEN overall_rating <= 2 THEN false
    ELSE NULL
END
WHERE recommend IS NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_reviews_recommend ON public.reviews(recommend);

