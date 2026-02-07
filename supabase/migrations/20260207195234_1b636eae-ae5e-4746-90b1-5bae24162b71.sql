-- Create storage buckets for character portraits and PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('character-portraits', 'character-portraits', true),
  ('character-pdfs', 'character-pdfs', true);

-- Create storage policies for character portraits bucket
CREATE POLICY "Anyone can view character portraits"
ON storage.objects FOR SELECT
USING (bucket_id = 'character-portraits');

CREATE POLICY "Service role can upload character portraits"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'character-portraits');

CREATE POLICY "Service role can update character portraits"
ON storage.objects FOR UPDATE
USING (bucket_id = 'character-portraits');

CREATE POLICY "Service role can delete character portraits"
ON storage.objects FOR DELETE
USING (bucket_id = 'character-portraits');

-- Create storage policies for character PDFs bucket
CREATE POLICY "Anyone can view character PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'character-pdfs');

CREATE POLICY "Service role can upload character PDFs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'character-pdfs');

CREATE POLICY "Service role can update character PDFs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'character-pdfs');

CREATE POLICY "Service role can delete character PDFs"
ON storage.objects FOR DELETE
USING (bucket_id = 'character-pdfs');