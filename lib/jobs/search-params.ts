import type { JobsQueryParams } from "@/lib/jobs/types";

export type JobsFilterState = {
  category: string;
  subcategory: string;
  country: string;
  city: string;
  work_type: string;
  seniority: string;
  experience: string;
  date_range: string;
  platform: string;
  company: string;
  q: string;
  sort: string;
  page: string;
};

export function filtersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): JobsFilterState {
  const get = (key: string) => {
    const value = searchParams[key];
    if (Array.isArray(value)) return value[0] ?? "";
    return value ?? "";
  };

  return {
    category: get("category"),
    subcategory: get("subcategory"),
    country: get("country"),
    city: get("city"),
    work_type: get("work_type"),
    seniority: get("seniority"),
    experience: get("experience"),
    date_range: get("date_range"),
    platform: get("platform"),
    company: get("company"),
    q: get("q"),
    sort: get("sort") || "freshness",
    page: get("page") || "1",
  };
}

export function buildJobsSearchParams(
  filters: JobsFilterState
): URLSearchParams {
  const params = new URLSearchParams();

  const entries: [keyof JobsFilterState, string][] = [
    ["category", filters.category],
    ["subcategory", filters.subcategory],
    ["country", filters.country],
    ["city", filters.city],
    ["work_type", filters.work_type],
    ["seniority", filters.seniority],
    ["experience", filters.experience],
    ["date_range", filters.date_range],
    ["platform", filters.platform],
    ["company", filters.company],
    ["q", filters.q],
    ["sort", filters.sort],
    ["page", filters.page],
  ];

  for (const [key, value] of entries) {
    if (key === "sort" && value === "freshness") continue;
    if (key === "page" && (value === "1" || !value)) continue;
    if (value) params.set(key, value);
  }

  return params;
}

export function toQueryParams(filters: JobsFilterState): JobsQueryParams {
  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const params: JobsQueryParams = {
    page,
    limit: 20,
    sort: filters.sort || "freshness",
  };

  if (filters.category) params.category = filters.category;
  if (filters.subcategory) params.subcategory = filters.subcategory;
  if (filters.country) params.country = filters.country;
  if (filters.city) params.city = filters.city;
  if (filters.work_type) params.work_type = filters.work_type;
  if (filters.seniority) params.seniority = filters.seniority;
  if (filters.experience) params.experience = filters.experience;
  if (filters.platform) params.platform = filters.platform;
  if (filters.company) params.company = filters.company;
  if (filters.date_range) params.date_range = filters.date_range;
  if (filters.q) params.q = filters.q;

  return params;
}

export function getResultsLabel(
  total: number,
  category?: string
): string {
  const categoryLabel = category || "All";
  const jobWord = total === 1 ? "Job" : "Jobs";
  return `Showing ${total.toLocaleString()} ${categoryLabel} ${jobWord}`;
}
