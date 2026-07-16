-- Enable Row-Level Security on all remaining public tables.
-- The app accesses these exclusively through the service-role client
-- (lib/supabase/admin.ts), which bypasses RLS, so no policies are needed.
-- The browser anon client is used for auth only and never queries tables.

ALTER TABLE jobs                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources              ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords             ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts_log           ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matches          ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_job_posts  ENABLE ROW LEVEL SECURITY;
