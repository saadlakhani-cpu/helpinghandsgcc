import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { generateJobFingerprint } from "@/lib/ingest/fingerprint";
import { importJobLinks } from "@/lib/ingest/import-job-links";
import { generateJobSlug } from "@/lib/ingest/slug";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Validate admin session
  const token = request.cookies.get("admin_token")?.value;
  const secret = process.env.ADMIN_SECRET;

  if (!secret || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const action = typeof body.action === "string" ? body.action : "";

  const base = request.nextUrl.origin;
  const cronHeaders = {
    Authorization: `Bearer ${process.env.CRON_SECRET ?? ""}`,
    "Content-Type": "application/json",
  };

  if (action === "send-alerts") {
    const res = await fetch(`${base}/api/send-alerts`, {
      method: "POST",
      headers: cronHeaders,
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }

  if (action === "expire-jobs") {
    const res = await fetch(`${base}/api/expire-jobs`, {
      method: "POST",
      headers: cronHeaders,
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }
  if (request.headers.get("origin") && request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  if (action === "import-job-links") {
    const supabase = createAdminClient();
    const { data: keywords, error: keywordsError } = await supabase
      .from("keywords")
      .select("keyword, category, subcategory, match_field");

    if (keywordsError) {
      return NextResponse.json({ error: keywordsError.message }, { status: 500 });
    }

    const result = await importJobLinks({
      supabase,
      rawLinks: body.links,
      keywordRows: keywords ?? [],
      importedBy:
        typeof body.importedBy === "string" ? body.importedBy : undefined,
    });

    return NextResponse.json(result);
  }

  if (
    action === "fetch-jobs-layer-1" ||
    action === "fetch-jobs-layer-2" ||
    action === "fetch-jobs-layer-3" ||
    action === "fetch-daily-priority-1" ||
    action === "fetch-daily-priority-2" ||
    action === "fetch-daily-priority-3" ||
    action === "fetch-daily-priority-4" ||
    action === "fetch-daily-priority-5" ||
    action === "fetch-twice-weekly-sources" ||
    action === "fetch-weekly-broad-sources" ||
    action === "fetch-finance-batch-1" ||
    action === "fetch-finance-batch-2" ||
    action === "fetch-finance-batch-3" ||
    action === "fetch-finance-batch-4" ||
    action === "fetch-ai-jobs" ||
    action === "fetch-gcc-wider"
  ) {
    const actionPaths: Record<string, string> = {
      "fetch-jobs-layer-1": "/api/cron/fetch-jobs/layer1",
      "fetch-jobs-layer-2": "/api/cron/fetch-jobs/layer2",
      "fetch-jobs-layer-3": "/api/cron/fetch-jobs/layer3",
      "fetch-daily-priority-1":
        "/api/cron/fetch-jobs/layer1?date_posted=week&offset=0&limit=5&pages=1",
      "fetch-daily-priority-2":
        "/api/cron/fetch-jobs/layer1?date_posted=week&offset=5&limit=5&pages=1",
      "fetch-daily-priority-3":
        "/api/cron/fetch-jobs/layer1?date_posted=week&offset=10&limit=5&pages=1",
      "fetch-daily-priority-4":
        "/api/cron/fetch-jobs/layer1?date_posted=week&offset=15&limit=5&pages=1",
      "fetch-daily-priority-5":
        "/api/cron/fetch-jobs/layer1?date_posted=week&offset=20&limit=5&pages=1",
      "fetch-twice-weekly-sources":
        "/api/cron/fetch-jobs/layer2?date_posted=week&offset=0&limit=8&pages=1",
      "fetch-weekly-broad-sources":
        "/api/cron/fetch-jobs/layer3?date_posted=week&offset=0&limit=8&pages=1",
      "fetch-finance-batch-1":
        "/api/cron/fetch-jobs/layer1?date_posted=week&offset=0&limit=5&pages=1",
      "fetch-finance-batch-2":
        "/api/cron/fetch-jobs/layer1?date_posted=week&offset=5&limit=5&pages=1",
      "fetch-finance-batch-3":
        "/api/cron/fetch-jobs/layer1?date_posted=week&offset=10&limit=5&pages=1",
      "fetch-finance-batch-4":
        "/api/cron/fetch-jobs/layer1?date_posted=week&offset=15&limit=5&pages=1",
      "fetch-ai-jobs":
        "/api/cron/fetch-jobs/ai?date_posted=week&offset=0&limit=6&pages=1",
      "fetch-gcc-wider":
        "/api/cron/fetch-jobs/layer3?date_posted=week&offset=0&limit=4&pages=1",
    };

    const res = await fetch(`${base}${actionPaths[action]}`, {
      method: "POST",
      headers: cronHeaders,
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }

  if (
    action === "approve-recruiter-job" ||
    action === "reject-recruiter-job" ||
    action === "publish-recruiter-job"
  ) {
    const recruiterJobId =
      typeof body.recruiterJobId === "string" ? body.recruiterJobId : "";

    if (!recruiterJobId) {
      return NextResponse.json(
        { error: "Missing recruiter job ID" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    if (action === "reject-recruiter-job") {
      const status = "rejected";
      const { data: rejected, error } = await supabase
        .from("recruiter_job_posts")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", recruiterJobId)
        .in("status", ["pending_review", "approved"])
        .is("published_job_id", null)
        .select("id, status")
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!rejected) return NextResponse.json({ error: "Job was not rejected. Refresh its current status; published jobs cannot be rejected here." }, { status: 409 });
      revalidatePath("/admin");
      return NextResponse.json({
        status: rejected.status,
        message: `Recruiter job ${status.replace("_", " ")}.`,
      });
    }

    const { data: post, error: postError } = await supabase
      .from("recruiter_job_posts")
      .select("*")
      .eq("id", recruiterJobId)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: postError?.message ?? "Recruiter job not found" },
        { status: 404 }
      );
    }

    if (post.status === "rejected") return NextResponse.json({ error: "Rejected jobs cannot be published." }, { status: 409 });

    const applyUrl =
      post.apply_url ||
      (post.apply_email ? `mailto:${post.apply_email}` : `${base}/recruiters`);
    const description = [post.description, post.requirements]
      .filter(Boolean)
      .join("\n\nRequirements:\n");
    const targetId = post.published_job_id || post.id;
    const { data: existing, error: existingError } = await supabase.from("jobs").select("id, slug, is_active").eq("id", targetId).maybeSingle();
    if (existingError) return NextResponse.json({ error: "Could not verify publication. Please retry." }, { status: 500 });
    if (post.status === "published" && existing) {
      revalidatePath("/admin");
      revalidatePath("/jobs");
      return NextResponse.json({ message: existing.is_active ? "Job is published." : "Job was published but is now inactive or expired.", status: "published", slug: existing.slug });
    }
    const slug = existing?.slug || `${generateJobSlug(post.title, post.city).replace(/-[^-]+$/, "")}-${targetId}`;
    const fingerprint = generateJobFingerprint(
      post.title,
      post.company,
      post.city,
      description
    );

    const { data: publishedJob, error: publishError } = await supabase
      .from("jobs")
      .upsert({
        id: targetId,
        title: post.title,
        slug,
        category: post.category,
        subcategory: "Recruiter Submitted",
        company: post.company,
        recruiter_source: "Direct Recruiter",
        platform: "Helping Hands GCC",
        country: post.country,
        city: post.city,
        work_type: post.work_type,
        seniority: post.seniority,
        date_posted: new Date().toISOString().slice(0, 10),
        date_scraped: new Date().toISOString(),
        apply_url: applyUrl,
        is_active: true,
        description_snippet: description.slice(0, 1200),
        job_fingerprint: fingerprint,
        freshness_score: 100,
        source_priority: 10,
      }, { onConflict: "id" })
      .select("id, slug")
      .single();

    if (publishError || !publishedJob) {
      return NextResponse.json(
        { error: publishError?.message ?? "Could not publish recruiter job" },
        { status: 500 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from("recruiter_job_posts")
      .update({
        status: "published",
        published_job_id: publishedJob.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", recruiterJobId)
      .select("id, status")
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: "The live job was saved, but its review status could not be updated. Retry Approve & Publish to finish; it will reuse the same job." }, { status: 500 });
    }
    revalidatePath("/admin");
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${publishedJob.slug}`);

    return NextResponse.json({
      message: "Recruiter job published to live jobs.",
      status: updated.status,
      slug: publishedJob.slug,
    });
  }

  return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
}
