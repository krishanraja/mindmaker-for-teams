-- Make the pre-workshop-qr bucket public so unauthenticated users can access QR codes
UPDATE storage.buckets 
SET public = true 
WHERE id = 'pre-workshop-qr';

-- Create RLS policy to allow public read access to QR codes
CREATE POLICY "Public read access to QR codes"
ON storage.objects FOR SELECT
USING (bucket_id = 'pre-workshop-qr');