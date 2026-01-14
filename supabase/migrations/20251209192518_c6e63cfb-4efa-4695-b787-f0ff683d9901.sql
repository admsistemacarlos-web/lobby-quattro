-- Create storage bucket for corretor logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('corretor-logos', 'corretor-logos', true);

-- Policy: Anyone can view logos (public bucket)
CREATE POLICY "Public can view logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'corretor-logos');

-- Policy: Admins can upload/update/delete logos
CREATE POLICY "Admins can manage logos"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'corretor-logos' 
  AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'corretor-logos' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Policy: Authenticated users can upload their own logo (for onboarding)
CREATE POLICY "Users can upload own logo"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'corretor-logos' 
  AND auth.role() = 'authenticated'
);

-- Policy: Users can update their own logo
CREATE POLICY "Users can update own logo"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'corretor-logos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);