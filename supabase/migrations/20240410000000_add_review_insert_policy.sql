-- Add policy to allow authenticated users to insert reviews
CREATE POLICY "Allow authenticated users to INSERT reviews" 
ON "public"."reviews" 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Add policy to allow users to update their own reviews
CREATE POLICY "Allow users to UPDATE their own reviews" 
ON "public"."reviews" 
FOR UPDATE TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add policy to allow users to delete their own reviews
CREATE POLICY "Allow users to DELETE their own reviews" 
ON "public"."reviews" 
FOR DELETE TO authenticated 
USING (auth.uid() = user_id); 