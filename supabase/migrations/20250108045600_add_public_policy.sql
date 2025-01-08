-- First drop any existing public select policies
DROP POLICY IF EXISTS "Public can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "reviews_select_policy" ON public.reviews;

-- Create the public select policy
CREATE POLICY "reviews_select_policy" ON public.reviews
FOR SELECT USING (true);

-- Make sure RLS is enabled
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY; 