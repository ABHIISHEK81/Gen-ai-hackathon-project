-- Policies for resumes storage bucket

-- Allow authenticated users to view their own resumes
CREATE POLICY "user_select_own_resume"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'resumes' AND auth.uid() = owner_id );

-- Allow authenticated users to upload resumes (PDF, DOC, DOCX) up to 5MB
CREATE POLICY "user_insert_own_resume"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND
  auth.uid() = owner_id AND
  (
    metadata->>'mimetype' = 'application/pdf' OR
    metadata->>'mimetype' = 'application/msword' OR
    metadata->>'mimetype' = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) AND
  (metadata->>'size')::bigint < 5000000
);

-- Allow authenticated users to update their own resumes
CREATE POLICY "user_update_own_resume"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'resumes' AND auth.uid() = owner_id );

-- Allow authenticated users to delete their own resumes
CREATE POLICY "user_delete_own_resume"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'resumes' AND auth.uid() = owner_id );
