-- Drop any existing user_id column and its dependencies
DROP TRIGGER IF EXISTS review_rate_limit_trigger ON public.reviews;
DROP INDEX IF EXISTS reviews_user_id_idx;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Public can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public can update reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public can delete reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "reviews_select_policy" ON public.reviews;

-- Drop the column if it exists
ALTER TABLE public.reviews DROP COLUMN IF EXISTS user_id CASCADE;

-- Add user_id column with proper constraints
ALTER TABLE public.reviews ADD COLUMN user_id UUID REFERENCES auth.users(id);
CREATE INDEX reviews_user_id_idx ON public.reviews(user_id);

-- Create new RLS policies
CREATE POLICY "Authenticated users can create reviews" ON public.reviews
FOR INSERT TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own reviews" ON public.reviews
FOR UPDATE TO authenticated
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own reviews" ON public.reviews
FOR DELETE TO authenticated
USING (auth.uid()::text = user_id::text);

-- Keep the public select policy
CREATE POLICY "Public can view all reviews" ON public.reviews
FOR SELECT USING (true); 