-- STEP 1: Gulf Finance & AI Jobs Portal — Core schema (6 tables)

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- TABLE 1: jobs
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('Finance', 'AI')),
  subcategory TEXT NOT NULL,
  company TEXT NOT NULL,
  recruiter_source TEXT,
  platform TEXT NOT NULL,
  country TEXT NOT NULL CHECK (country IN ('KSA', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman')),
  city TEXT NOT NULL,
  work_type TEXT NOT NULL CHECK (work_type IN ('Remote', 'Hybrid', 'On-site')),
  seniority TEXT NOT NULL CHECK (seniority IN ('Junior', 'Mid', 'Senior', 'Director', 'C-Suite')),
  date_posted DATE NOT NULL,
  date_scraped TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  apply_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  salary_range TEXT,
  experience_years TEXT,
  description_snippet TEXT,
  job_fingerprint TEXT NOT NULL,
  freshness_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  source_priority INTEGER NOT NULL DEFAULT 6
);

CREATE UNIQUE INDEX idx_jobs_job_fingerprint ON jobs (job_fingerprint);
CREATE INDEX idx_jobs_slug ON jobs (slug);
CREATE INDEX idx_jobs_is_active ON jobs (is_active);
CREATE INDEX idx_jobs_category ON jobs (category);
CREATE INDEX idx_jobs_country ON jobs (country);
CREATE INDEX idx_jobs_city ON jobs (city);
CREATE INDEX idx_jobs_freshness_score ON jobs (freshness_score DESC);
CREATE INDEX idx_jobs_date_posted ON jobs (date_posted DESC);
CREATE INDEX idx_jobs_date_scraped ON jobs (date_scraped DESC);

-- TABLE 2: sources
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Aggregator', 'Recruiter')),
  apify_actor_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_scraped TIMESTAMPTZ,
  priority INTEGER NOT NULL DEFAULT 6
);

CREATE INDEX idx_sources_name ON sources (name);
CREATE INDEX idx_sources_is_active ON sources (is_active);

-- TABLE 3: keywords
CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Finance', 'AI')),
  subcategory TEXT NOT NULL,
  match_field TEXT NOT NULL CHECK (match_field IN ('Title', 'Description', 'Both'))
);

CREATE INDEX idx_keywords_category ON keywords (category);
CREATE INDEX idx_keywords_keyword ON keywords (keyword);

-- TABLE 4: subscribers
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  whatsapp TEXT,
  current_role TEXT,
  experience_years INTEGER,
  certifications TEXT,
  preferred_country TEXT,
  preferred_category TEXT CHECK (preferred_category IN ('Finance', 'AI', 'Both')),
  preferred_subcategory TEXT,
  salary_expectation TEXT,
  resume_url TEXT,
  resume_parsed JSONB,
  resume_uploaded_at TIMESTAMPTZ,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscribers_email ON subscribers (email);
CREATE INDEX idx_subscribers_preferred_category ON subscribers (preferred_category);
CREATE INDEX idx_subscribers_preferred_country ON subscribers (preferred_country);

-- TABLE 5: alerts_log
CREATE TABLE alerts_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES subscribers (id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs (id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  channel TEXT NOT NULL CHECK (channel IN ('Email', 'WhatsApp')),
  opened BOOLEAN NOT NULL DEFAULT FALSE,
  clicked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_alerts_log_subscriber_id ON alerts_log (subscriber_id);
CREATE INDEX idx_alerts_log_job_id ON alerts_log (job_id);
CREATE INDEX idx_alerts_log_sent_at ON alerts_log (sent_at DESC);

-- TABLE 6: job_matches
CREATE TABLE job_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES subscribers (id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs (id) ON DELETE CASCADE,
  matched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notified BOOLEAN NOT NULL DEFAULT FALSE,
  match_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  UNIQUE (subscriber_id, job_id)
);

CREATE INDEX idx_job_matches_subscriber_id ON job_matches (subscriber_id);
CREATE INDEX idx_job_matches_job_id ON job_matches (job_id);
CREATE INDEX idx_job_matches_notified ON job_matches (notified);
CREATE INDEX idx_job_matches_matched_at ON job_matches (matched_at DESC);
