-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  full_name TEXT,
  avatar_url TEXT,
  career_goals TEXT,
  education TEXT,
  skills TEXT
);

-- Enable RLS for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
CREATE POLICY "Users can select their own profile."
ON profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile."
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile."
ON profiles
FOR DELETE
USING (auth.uid() = id);


-- Create resumes table
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMTz DEFAULT NOW(),
  file_path TEXT NOT NULL,
  file_name TEXT,
  file_size BIGINT,
  file_type TEXT,
  parsed_text TEXT,
  analysis_result JSONB
);

-- Enable RLS for resumes table
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Policies for resumes table
CREATE POLICY "Users can select their own resumes."
ON resumes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes."
ON resumes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes."
ON resumes
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes."
ON resumes
FOR DELETE
USING (auth.uid() = user_id);
