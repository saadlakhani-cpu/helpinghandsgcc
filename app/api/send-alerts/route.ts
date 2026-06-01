import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDigestEmail, type DigestJob } from "@/lib/alerts/format-digest";
import { sendEmail } from "@/lib/alerts/send-email";

export const dynamic = "force-dynamic";

// GET alias so Vercel cron (which sends GET) and the admin panel (POST) both work.
// Both paths go through the same CRON_SECRET auth check.
export { POST as GET }

// Max subscribers processed per cron invocation to avoid timeout
const BATCH_LIMIT = 50;

export async function POST(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://gulffinancejobs.com";

  const supabase = createAdminClient();

  // ── 1. Load unnotified matches ───────────────────────────────────────────
  const { data: rawMatches, error: matchesError } = await supabase
    .from("job_matches")
    .select("id, subscriber_id, job_id, match_score")
    .eq("notified", false)
    .order("match_score", { ascending: false })
    .limit(BATCH_LIMIT * 20); // over-fetch, then group

  if (matchesError) {
    return NextResponse.json({ error: matchesError.message }, { status: 500 });
  }
  if (!rawMatches || rawMatches.length === 0) {
    return NextResponse.json({ sent: 0, message: "No pending matches" });
  }

  // ── 2. Group by subscriber (respect BATCH_LIMIT) ─────────────────────────
  const bySubscriber: Record<
    string,
    Array<{ id: string; job_id: string; match_score: number }>
  > = {};

  for (const m of rawMatches) {
    const existing = bySubscriber[m.subscriber_id];
    if (!existing && Object.keys(bySubscriber).length >= BATCH_LIMIT) break;
    if (!bySubscriber[m.subscriber_id]) bySubscriber[m.subscriber_id] = [];
    bySubscriber[m.subscriber_id].push({
      id: m.id,
      job_id: m.job_id,
      match_score: m.match_score,
    });
  }

  const subscriberIds = Object.keys(bySubscriber);
  const jobIdSet = new Set<string>();
  rawMatches.forEach((m: { job_id: string }) => jobIdSet.add(m.job_id));
  const allJobIds = Array.from(jobIdSet);

  // ── 3. Batch-fetch subscriber profiles ───────────────────────────────────
  const { data: subscribers, error: subError } = await supabase
    .from("subscribers")
    .select("id, name, email")
    .in("id", subscriberIds);

  if (subError) {
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }

  type SubRow = { id: string; name: string; email: string };
  const subMap: Record<string, SubRow> = {};
  (subscribers ?? []).forEach((s: SubRow) => { subMap[s.id] = s; });

  // ── 4. Batch-fetch job details ────────────────────────────────────────────
  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("id, title, company, country, city, category, slug, salary_range, work_type")
    .in("id", allJobIds)
    .eq("is_active", true);

  if (jobsError) {
    return NextResponse.json({ error: jobsError.message }, { status: 500 });
  }

  const jobMap: Record<string, DigestJob> = {};
  (jobs ?? []).forEach((j: DigestJob) => { jobMap[j.id] = j; });

  // ── 5. Send digest per subscriber ─────────────────────────────────────────
  let sent = 0;
  let failed = 0;

  for (const subscriberId of Object.keys(bySubscriber)) {
    const matchBucket = bySubscriber[subscriberId];
    const sub = subMap[subscriberId];
    if (!sub) continue;

    // Resolve matched jobs (skip inactive ones already filtered out above)
    const digestJobs: DigestJob[] = matchBucket
      .map((m) => jobMap[m.job_id])
      .filter((j): j is DigestJob => j !== undefined);

    if (digestJobs.length === 0) continue;

    const { subject, html, text } = formatDigestEmail(
      sub.name,
      digestJobs,
      baseUrl
    );

    const result = await sendEmail({ to: sub.email, subject, html, text });

    if (!result.ok) {
      console.error(`[send-alerts] Failed for ${sub.email}:`, result.error);
      failed++;
      continue;
    }

    // ── 6. Log to alerts_log (one row per job) ─────────────────────────────
    const alertRows = digestJobs.map((j) => ({
      subscriber_id: subscriberId,
      job_id: j.id,
      channel: "Email" as const,
    }));

    const { error: logError } = await supabase
      .from("alerts_log")
      .insert(alertRows);

    if (logError) {
      console.error("[send-alerts] alerts_log insert error:", logError.message);
    }

    // ── 7. Mark matches as notified ────────────────────────────────────────
    const matchIds = matchBucket.map((m: { id: string }) => m.id);
    const { error: notifyError } = await supabase
      .from("job_matches")
      .update({ notified: true })
      .in("id", matchIds);

    if (notifyError) {
      console.error("[send-alerts] notified update error:", notifyError.message);
    }

    sent++;
  }

  return NextResponse.json({
    sent,
    failed,
    subscribers_processed: Object.keys(bySubscriber).length,
    jobs_in_batch: allJobIds.length,
  });
}
