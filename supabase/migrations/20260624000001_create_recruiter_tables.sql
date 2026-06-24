-- Recruiter portal tables for Google-authenticated hiring managers.

CREATE TABLE IF NOT EXISTS recruiter_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE,
  auth_email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  work_email TEXT NOT NULL,
  phone TEXT,
  company_website TEXT,
  linkedin_url TEXT,
  country TEXT NOT NULL CHECK (country IN ('KSA', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Multiple GCC countries')),
  hiring_categories TEXT[] NOT NULL DEFAULT '{}',
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recruiter_profiles_auth_email ON recruiter_profiles (auth_email);
CREATE INDEX IF NOT EXISTS idx_recruiter_profiles_status ON recruiter_profiles (verification_status);

CREATE TABLE IF NOT EXISTS recruiter_job_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_profile_id UUID NOT NULL REFERENCES recruiter_profiles (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Finance', 'AI')),
  company TEXT NOT NULL,
  country TEXT NOT NULL CHECK (country IN ('KSA', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman')),
  city TEXT NOT NULL,
  work_type TEXT NOT NULL CHECK (work_type IN ('Remote', 'Hybrid', 'On-site')),
  seniority TEXT NOT NULL CHECK (seniority IN ('Junior', 'Mid', 'Senior', 'Director', 'C-Suite')),
  job_type TEXT,
  description TEXT NOT NULL,
  requirements TEXT,
  apply_email TEXT,
  apply_url TEXT,
  screening_requested BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'published')),
  admin_notes TEXT,
  published_job_id UUID REFERENCES jobs (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recruiter_job_posts_profile ON recruiter_job_posts (recruiter_profile_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_job_posts_status ON recruiter_job_posts (status);
CREATE INDEX IF NOT EXISTS idx_recruiter_job_posts_created_at ON recruiter_job_posts (created_at DESC);
