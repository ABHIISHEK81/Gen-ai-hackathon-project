-- This trigger calls the 'resume-analyzer' edge function when a new resume is inserted.
CREATE TRIGGER on_resume_inserted
  AFTER INSERT ON public.resumes
  FOR EACH ROW
  EXECUTE FUNCTION supabase_functions.http_request(
    -- The URL of the edge function. For local development, this is the default.
    -- Supabase will replace this with the correct URL when deployed.
    'http://localhost:54321/functions/v1/resume-analyzer',
    'POST',
    -- The headers for the request
    '{"Content-Type":"application/json"}',
    -- The body of the request, which contains the new resume record
    jsonb_build_object('record', NEW),
    -- The timeout in milliseconds
    '10000'
  );
