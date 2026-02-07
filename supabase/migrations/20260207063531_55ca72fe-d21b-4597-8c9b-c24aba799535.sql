-- Drop the overly permissive insert policy
DROP POLICY IF EXISTS "Anyone can insert characters" ON public.characters;

-- Create a more secure insert policy that still allows guest generation
-- Guest characters must have user_id = null and is_guest = true
-- Authenticated users can create characters with their own user_id
CREATE POLICY "Insert characters with proper ownership" 
ON public.characters 
FOR INSERT 
WITH CHECK (
  (user_id IS NULL AND is_guest = true) OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);