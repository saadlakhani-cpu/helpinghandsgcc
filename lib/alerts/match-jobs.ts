import type { SupabaseClient } from "@supabase/supabase-js";

export type SubscriberProfile = {
  id: string;
  preferred_category: "Finance" | "AI" | "Both" | null;
  preferred_country: string | null;
  preferred_subcategory: string | null;
};

// Maps subscriber-entered country text → jobs.country CHECK values
const COUNTRY_CODE_MAP: Record<string, string> = {
  uae: "UAE",
  "united arab emirates": "UAE",
  dubai: "UAE",
  "abu dhabi": "UAE",
  "saudi arabia": "KSA",
  ksa: "KSA",
  riyadh: "KSA",
  jeddah: "KSA",
  qatar: "Qatar",
  doha: "Qatar",
  kuwait: "Kuwait",
  bahrain: "Bahrain",
  manama: "Bahrain",
  oman: "Oman",
  muscat: "Oman",
};

function toDbCountry(raw: string): string | null {
  return COUNTRY_CODE_MAP[raw.trim().toLowerCase()] ?? null;
}

const MATCH_WINDOW_DAYS = 30;

export async function matchJobsForSubscriber(
  supabase: SupabaseClient,
  subscriber: SubscriberProfile
): Promise<{ matched: number; error?: string }> {
  const categoryFilter =
    subscriber.preferred_category === "Finance"
      ? ["Finance"]
      : subscriber.preferred_category === "AI"
        ? ["AI"]
        : ["Finance", "AI"]; // Both or null

  const since = new Date();
  since.setDate(since.getDate() - MATCH_WINDOW_DAYS);

  // Build candidate job query — explicit limit prevents silent Supabase truncation
  const CANDIDATE_LIMIT = 2000;

  let query = supabase
    .from("jobs")
    .select("id, category, subcategory, country, freshness_score")
    .eq("is_active", true)
    .in("category", categoryFilter)
    .gte("date_scraped", since.toISOString())
    .limit(CANDIDATE_LIMIT);

  const dbCountry = subscriber.preferred_country
    ? toDbCountry(subscriber.preferred_country)
    : null;

  if (dbCountry) {
    query = query.eq("country", dbCountry);
  }

  const { data: jobs, error: jobsError } = await query;
  if (jobsError) return { matched: 0, error: jobsError.message };
  if (!jobs || jobs.length === 0) return { matched: 0 };

  if (jobs.length === CANDIDATE_LIMIT) {
    console.warn(
      `[match-jobs] hit candidate limit (${CANDIDATE_LIMIT}) for subscriber ${subscriber.id} — some jobs may be missed`
    );
  }

  // Exclude already-matched jobs
  const { data: existing } = await supabase
    .from("job_matches")
    .select("job_id")
    .eq("subscriber_id", subscriber.id);

  const alreadyMatched = new Set((existing ?? []).map((r: { job_id: string }) => r.job_id));

  const toInsert: Array<{
    subscriber_id: string;
    job_id: string;
    match_score: number;
    notified: boolean;
  }> = [];

  for (const job of jobs) {
    if (alreadyMatched.has(job.id)) continue;

    let score = 1.0; // category base (always matched by query filter)

    // Country: filtered in query if preference set, so it's always a match
    score += dbCountry ? 0.5 : 0.2;

    // Subcategory exact match
    if (
      subscriber.preferred_subcategory &&
      job.subcategory === subscriber.preferred_subcategory
    ) {
      score += 0.3;
    }

    // Freshness bonus (capped at 0.5)
    score += Math.min((job.freshness_score ?? 0) * 0.05, 0.5);

    toInsert.push({
      subscriber_id: subscriber.id,
      job_id: job.id,
      match_score: parseFloat(score.toFixed(4)),
      notified: false,
    });
  }

  if (toInsert.length === 0) return { matched: 0 };

  const { error: insertError } = await supabase
    .from("job_matches")
    .upsert(toInsert, { onConflict: "subscriber_id,job_id", ignoreDuplicates: true });

  if (insertError) return { matched: 0, error: insertError.message };

  return { matched: toInsert.length };
}
