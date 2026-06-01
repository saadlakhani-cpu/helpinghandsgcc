export type IngestJobInput = {
  title: string;
  company: string;
  platform: string;
  country: string;
  city: string;
  work_type?: string | null;
  seniority?: string | null;
  date_posted: string;
  apply_url: string;
  description?: string | null;
  description_snippet?: string | null;
  recruiter_source?: string | null;
  salary_range?: string | null;
  experience_years?: string | null;
};

export type IngestResponse = {
  received: number;
  inserted: number;
  skipped: number;
};
