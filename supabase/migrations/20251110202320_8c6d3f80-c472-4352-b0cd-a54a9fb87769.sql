-- Update RLS policies for pre_workshop_inputs to allow anonymous inserts
DROP POLICY IF EXISTS "Anyone can manage pre workshop inputs" ON public.pre_workshop_inputs;

-- Allow anyone to insert (anonymous participants)
CREATE POLICY "Anyone can insert pre-workshop inputs"
ON public.pre_workshop_inputs
FOR INSERT
WITH CHECK (true);

-- Only facilitators can view
CREATE POLICY "Facilitators can view pre-workshop inputs"
ON public.pre_workshop_inputs
FOR SELECT
USING (public.has_role(auth.uid(), 'facilitator'));

-- Only facilitators can update
CREATE POLICY "Facilitators can update pre-workshop inputs"
ON public.pre_workshop_inputs
FOR UPDATE
USING (public.has_role(auth.uid(), 'facilitator'));

-- Only facilitators can delete
CREATE POLICY "Facilitators can delete pre-workshop inputs"
ON public.pre_workshop_inputs
FOR DELETE
USING (public.has_role(auth.uid(), 'facilitator'));

-- Create storage bucket for QR codes (private bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pre-workshop-qr',
  'pre-workshop-qr',
  false,
  1048576, -- 1MB limit
  ARRAY['image/png']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for QR codes
CREATE POLICY "Facilitators can upload QR codes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pre-workshop-qr' AND
  public.has_role(auth.uid(), 'facilitator')
);

CREATE POLICY "Facilitators can view QR codes"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'pre-workshop-qr' AND
  public.has_role(auth.uid(), 'facilitator')
);

CREATE POLICY "Anyone can view QR codes via signed URL"
ON storage.objects
FOR SELECT
USING (bucket_id = 'pre-workshop-qr');