-- Create review_likes table
CREATE TABLE IF NOT EXISTS public.review_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    review_id INTEGER NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, review_id)
);

-- Add RLS policies
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view any review likes"
    ON public.review_likes
    FOR SELECT
    USING (true);

CREATE POLICY "Users can like reviews"
    ON public.review_likes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
    ON public.review_likes
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to check if a user has liked a review
CREATE OR REPLACE FUNCTION public.has_user_liked_review(p_user_id UUID, p_review_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.review_likes
        WHERE user_id = p_user_id
        AND review_id = p_review_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 