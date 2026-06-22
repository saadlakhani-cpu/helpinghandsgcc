export type Job = {
  id: string;
  title: string;
  slug: string;
  category: string;
  subcategory: string;
  company: string;
  recruiter_source: string | null;
  platform: string;
  country: string;
  city: string;
  work_type: string;
  seniority: string;
  date_posted: string;
  date_scraped: string;
  apply_url: string;
  is_active: boolean;
  salary_range: string | null;
  experience_years: string | null;
  description_snippet: string | null;
  freshness_score: number;
  source_priority: number;
};

export type JobsQueryParams = {
  category?: string;
  subcategory?: string;
  country?: string;
  city?: string;
  work_type?: string;
  seniority?: string;
  experience?: string;
  platform?: string;
  company?: string;
  date_range?: string;
  q?: string;
  page: number;
  limit: number;
  sort: string;
};

export type FilterOptions = {
  financeSubcategories: string[];
  aiSubcategories: string[];
  platforms: string[];
  companies: string[];
};

export type JobsListResponse = {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};
