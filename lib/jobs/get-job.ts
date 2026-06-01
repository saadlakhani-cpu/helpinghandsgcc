import { createAdminClient } from "@/lib/supabase/admin";
import type { Job } from "@/lib/jobs/types";

export async function getJobBySlug(slug: string): Promise<Job | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as Job | null) ?? null;
}

export async function getSimilarJobs(
  job: Job,
  limit = 3
): Promise<Job[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("is_active", true)
    .eq("subcategory", job.subcategory)
    .eq("country", job.country)
    .neq("id", job.id)
    .order("freshness_score", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Job[];
}
