import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateFreshnessScore } from "@/lib/ingest/freshness";

export const dynamic = "force-dynamic";

const EXPIRY_DAYS = 30;

// GET alias so Vercel cron (which sends GET) and the admin panel (POST) both work.
// Both paths go through the same CRON_SECRET auth check.
export { POST as GET }

export async function POST(request: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createAdminClient();

  // ── Step 1: Expire jobs older than EXPIRY_DAYS ────────────────────────────
  // Use date_posted (the authoritative age), not date_scraped.
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - EXPIRY_DAYS);
  // DATE column in PG: compare with YYYY-MM-DD string
  const cutoffDate = cutoff.toISOString().split("T")[0];

  const { data: expiredRows, error: expireError } = await supabase
    .from("jobs")
    .update({ is_active: false, freshness_score: 0 })
    .lt("date_posted", cutoffDate)
    .eq("is_active", true)
    .select("id");

  if (expireError) {
    return NextResponse.json({ error: expireError.message }, { status: 500 });
  }

  const expired = expiredRows?.length ?? 0;

  // ── Step 2: Fetch (date_posted, source_priority) for all still-active jobs ─
  // Freshness score is a pure function of these two values + today,
  // so every job with the same pair gets the same new score → bucket-update.
  // Explicit limit prevents silent Supabase PostgREST truncation at 1 000 rows.
  const { data: activePairs, error: pairsError } = await supabase
    .from("jobs")
    .select("date_posted, source_priority")
    .eq("is_active", true)
    .limit(10000);

  if (pairsError) {
    // Non-fatal: expiry already ran; return partial result.
    console.error("[expire-jobs] fetch active pairs error:", pairsError.message);
    return NextResponse.json({ expired, freshness_updated: 0, buckets_processed: 0 });
  }

  // ── Step 3: Deduplicate into unique (date_posted, source_priority) buckets ─
  const seen: Record<string, true> = {};
  const buckets: Array<{ date_posted: string; source_priority: number }> = [];

  for (const row of activePairs ?? []) {
    const key = `${row.date_posted}|${row.source_priority}`;
    if (!seen[key]) {
      seen[key] = true;
      buckets.push({
        date_posted: row.date_posted as string,
        source_priority: row.source_priority as number,
      });
    }
  }

  // ── Step 4: Recalculate and update one bucket at a time ──────────────────
  // Max iterations ≈ EXPIRY_DAYS × distinct_priority_levels (e.g. 30 × 5 = 150)
  let freshness_updated = 0;

  for (const bucket of buckets) {
    const newScore = calculateFreshnessScore(
      bucket.source_priority,
      bucket.date_posted
    );

    const { data: updated, error: updateError } = await supabase
      .from("jobs")
      .update({ freshness_score: parseFloat(newScore.toFixed(6)) })
      .eq("date_posted", bucket.date_posted)
      .eq("source_priority", bucket.source_priority)
      .eq("is_active", true)
      .select("id");

    if (updateError) {
      console.error("[expire-jobs] bucket update error:", updateError.message, bucket);
      continue;
    }

    freshness_updated += updated?.length ?? 0;
  }

  return NextResponse.json({
    expired,
    freshness_updated,
    buckets_processed: buckets.length,
    cutoff_date: cutoffDate,
  });
}
