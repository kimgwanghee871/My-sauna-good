-- Supabase Storage Bucket Setup for File Uploads
-- Run these commands in Supabase SQL Editor

-- 1. Create uploads bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads', 
  true,
  31457280, -- 30MB in bytes
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- 2. Enable RLS (Row Level Security) on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create policy for public uploads (anyone can upload)
CREATE POLICY "Public Upload Access" ON storage.objects
FOR INSERT 
TO public
WITH CHECK (bucket_id = 'uploads');

-- 4. Create policy for public access (anyone can view)
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'uploads');

-- 5. Create policy for public delete (anyone can delete - adjust as needed)
CREATE POLICY "Public Delete Access" ON storage.objects
FOR DELETE 
TO public
USING (bucket_id = 'uploads');

-- 6. Verify bucket creation
SELECT * FROM storage.buckets WHERE id = 'uploads';