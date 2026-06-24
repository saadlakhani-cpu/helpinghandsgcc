import { createAdminClient } from "@/lib/supabase/admin";
import type { Job } from "@/lib/jobs/types";

export type HomePageData = {
  financeCount: number;
  aiCount: number;
  lastUpdated: string | null;
  latestFinance: Job[];
  latestAi: Job[];
};

export async function getHomePageData(): Promise<HomePageData> {
  const supabase = createAdminClient();

  const [financeRes, aiRes, latestFinanceRes, latestAiRes, lastScrapedRes] =
    await Promise.all([
      supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true)
        .eq("category", "Finance"),
      supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true)
        .eq("category", "AI"),
      supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .eq("category", "Finance")
        .order("date_scraped", { ascending: false, nullsFirst: false })
        .order("date_posted", { ascending: false })
        .order("freshness_score", { ascending: false })
        .limit(8),
      supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .eq("category", "AI")
        .order("date_scraped", { ascending: false, nullsFirst: false })
        .order("date_posted", { ascending: false })
        .order("freshness_score", { ascending: false })
        .limit(8),
      supabase
        .from("jobs")
        .select("date_scraped")
        .eq("is_active", true)
        .order("date_scraped", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle(),
    ]);

  return {
    financeCount: financeRes.count ?? 0,
    aiCount: aiRes.count ?? 0,
    lastUpdated: lastScrapedRes.data?.date_scraped ?? null,
    latestFinance: (latestFinanceRes.data ?? []) as Job[],
    latestAi: (latestAiRes.data ?? []) as Job[],
  };
}
