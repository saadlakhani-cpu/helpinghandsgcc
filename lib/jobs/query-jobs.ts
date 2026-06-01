import type { SupabaseClient } from "@supabase/supabase-js";
import { getDateRangeCutoff } from "@/lib/jobs/parse-query";
import type { Job, JobsListResponse, JobsQueryParams } from "@/lib/jobs/types";

function applyExperienceFilter<T extends { or: (filters: string) => T }>(
  query: T,
  experience: string
): T {
  switch (experience) {
    case "0-2":
      return query.or(
        "seniority.eq.Junior,experience_years.ilike.%0-2%,experience_years.ilike.%0 - 2%"
      );
    case "2-5":
      return query.or(
        "seniority.eq.Mid,experience_years.ilike.%2-5%,experience_years.ilike.%2 - 5%"
      );
    case "5-10":
      return query.or(
        "seniority.eq.Senior,experience_years.ilike.%5-10%,experience_years.ilike.%5 - 10%"
      );
    case "10+":
      return query.or(
        "seniority.in.(Director,C-Suite),experience_years.ilike.%10+%,experience_years.ilike.%10+%"
      );
    default:
      return query;
  }
}

const SENIORITY_ORDER: Record<string, number> = {
  Junior: 1,
  Mid: 2,
  Senior: 3,
  Director: 4,
  "C-Suite": 5,
};

export async function queryJobs(
  supabase: SupabaseClient,
  params: JobsQueryParams
): Promise<JobsListResponse> {
  const from = (params.page - 1) * params.limit;
  const to = from + params.limit - 1;

  let query = supabase
    .from("jobs")
    .select("*", { count: "exact" })
    .eq("is_active", true);

  if (params.category) {
    query = query.eq("category", params.category);
  }
  if (params.subcategory) {
    query = query.eq("subcategory", params.subcategory);
  }
  if (params.country) {
    query = query.eq("country", params.country);
  }
  if (params.city) {
    query = query.ilike("city", `%${params.city}%`);
  }
  if (params.work_type) {
    query = query.eq("work_type", params.work_type);
  }
  if (params.seniority) {
    query = query.eq("seniority", params.seniority);
  }
  if (params.platform) {
    query = query.ilike("platform", `%${params.platform}%`);
  }
  if (params.q) {
    const escaped = params.q.replace(/[%_,]/g, "");
    const term = `%${escaped}%`;
    query = query.or(
      `title.ilike.${term},company.ilike.${term},description_snippet.ilike.${term}`
    );
  }
  if (params.experience) {
    query = applyExperienceFilter(query, params.experience);
  }
  if (params.date_range) {
    const cutoff = getDateRangeCutoff(params.date_range);
    query = query.gte("date_posted", cutoff);
  }

  if (params.sort === "date_posted") {
    query = query.order("date_posted", { ascending: false });
  } else if (params.sort === "seniority") {
    query = query.order("date_posted", { ascending: false });
  } else {
    query = query.order("freshness_score", { ascending: false });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  let jobs = (data ?? []) as Job[];

  if (params.sort === "seniority") {
    jobs = [...jobs].sort(
      (a, b) =>
        (SENIORITY_ORDER[a.seniority] ?? 99) -
        (SENIORITY_ORDER[b.seniority] ?? 99)
    );
  }

  const total = count ?? 0;
  const total_pages = total === 0 ? 0 : Math.ceil(total / params.limit);

  return {
    jobs,
    total,
    page: params.page,
    limit: params.limit,
    total_pages,
  };
}
