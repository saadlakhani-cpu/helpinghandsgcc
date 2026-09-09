import { createAdminClient } from "@/lib/supabase/admin";
import { extractJob } from "./extract";
import type { Submission } from "./model";

export async function processContributorQueue() {
  const db = createAdminClient();
  const keywords = await db
    .from("keywords")
    .select("keyword,category,subcategory,match_field");
  if (keywords.error) throw new Error("Could not load classification rules.");
  const claimed = await db.rpc("claim_contributor_links", { p_limit: 3 });
  if (claimed.error)
    throw new Error(
      "Could not claim queued submissions. Check the contributor migration.",
    );
  const results = [];
  for (const item of (claimed.data || []) as Submission[]) {
    let patch;
    try {
      patch = {
        details: await extractJob(item.canonical_url, keywords.data || []),
        status: "review",
        reason: null,
      };
    } catch (error) {
      patch = {
        status: "needs_details",
        reason:
          error instanceof Error
            ? error.message
            : "Please complete the details.",
      };
    }
    const saved = await db
      .from("contributor_submissions")
      .update({
        ...patch,
        lease: null,
        lease_until: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)
      .eq("status", "processing")
      .eq("lease", item.lease)
      .select("id");
    if (saved.error)
      throw new Error(
        "Could not save processing results. Work will be retried when its lease expires.",
      );
    results.push({
      id: item.id,
      status: saved.data?.length ? patch.status : "lease_changed",
    });
  }
  return { processed: results.length, results };
}
