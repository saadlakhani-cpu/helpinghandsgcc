import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  normalizeCity,
  normalizeCompany,
  normalizeCountry,
  normalizeSeniority,
  normalizeTitle,
  normalizeWorkType,
} from "@/lib/ingest/normalize";
import { generateJobFingerprint } from "@/lib/ingest/fingerprint";
import { categorizeJob, type KeywordRow } from "@/lib/ingest/categorize";
import { generateJobSlug } from "@/lib/ingest/slug";
import { calculateFreshnessScore } from "@/lib/ingest/freshness";
import { getSourcePriority } from "@/lib/ingest/source-priority";
import {
  fetchAllJSearchJobsWithDebug,
  getJSearchQueryCount,
  type JSearchFetchOptions,
  type JSearchLayer,
} from "@/lib/jsearch/fetch-jobs";
import type { IngestResponse } from "@/lib/ingest/types";

export const dynamic = "force-dynamic";

export { POST as GET };

function getJSearchLayer(request: NextRequest): JSearchLayer {
  const layer = request.nextUrl.searchParams.get("layer");
  const pathname = request.nextUrl.pathname;
  if (pathname.endsWith("/layer1")) return "1";
  if (pathname.endsWith("/layer2")) return "2";
  if (pathname.endsWith("/layer3")) return "3";
  if (pathname.endsWith("/ai")) return "ai";
  return layer === "1" || layer === "2" || layer === "3" || layer === "ai"
    ? layer
    : "all";
}

function getDatePostedOverride(request: NextRequest): string | undefined {
  const datePosted = request.nextUrl.searchParams.get("date_posted");
  const allowed = new Set(["today", "3days", "week", "month", "all"]);
  return datePosted && allowed.has(datePosted) ? datePosted : undefined;
}

function getNumberParam(
  request: NextRequest,
  name: string,
  min: number,
  max: number
): number | undefined {
  const value = request.nextUrl.searchParams.get(name);
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return undefined;
  return Math.min(max, Math.max(min, parsed));
}

function getDefaultBatchSize(layer: JSearchLayer): number {
  if (layer === "3") return 4;
  if (layer === "ai") return 6;
  return 5;
}

function getRotatingOffset(layer: JSearchLayer, batchSize: number): number {
  const queryCount = getJSearchQueryCount(layer);
  const batchCount = Math.max(1, Math.ceil(queryCount / batchSize));
  const now = new Date();
  const startOfYear = Date.UTC(now.getUTCFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear) / 86400000);
  const halfDaySlot = now.getUTCHours() >= 12 ? 1 : 0;
  const runSlot = dayOfYear * 2 + halfDaySlot;

  return (runSlot % batchCount) * batchSize;
}

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const layer = getJSearchLayer(request);
    const queryLimit = getNumberParam(request, "limit", 1, 10);
    const batchSize = queryLimit ?? getDefaultBatchSize(layer);
    const fetchOptions: JSearchFetchOptions = {
      datePosted: getDatePostedOverride(request),
      queryOffset:
        getNumberParam(request, "offset", 0, 100) ??
        getRotatingOffset(layer, batchSize),
      queryLimit: batchSize,
      numPages: getNumberParam(request, "pages", 1, 5),
    };
    const { jobs, debug } = await fetchAllJSearchJobsWithDebug(layer, fetchOptions);

    const supabase = createAdminClient();

    const { data: keywords, error: keywordsError } = await supabase
      .from("keywords")
      .select("keyword, category, subcategory, match_field");

    if (keywordsError) {
      return NextResponse.json(
        { error: keywordsError.message },
        { status: 500 }
      );
    }

    const keywordRows = (keywords ?? []) as KeywordRow[];

    let inserted = 0;
    let skipped = 0;

    for (const raw of jobs) {
      if (
        !raw.title?.trim() ||
        !raw.company?.trim() ||
        !raw.apply_url?.trim() ||
        !raw.date_posted?.trim() ||
        isNaN(Date.parse(raw.date_posted))
      ) {
        skipped += 1;
        continue;
      }

      const country = normalizeCountry(raw.country);
      const city = normalizeCity(raw.city, country);
      const work_type = normalizeWorkType(raw.work_type);
      const seniority = normalizeSeniority(raw.seniority);
      const title = normalizeTitle(raw.title);
      const company = normalizeCompany(raw.company);

      const description =
        raw.description_snippet ??
        raw.description ??
        "";

      const job_fingerprint = generateJobFingerprint(
        title,
        company,
        city,
        description
      );

      const { data: existing } = await supabase
        .from("jobs")
        .select("id")
        .eq("job_fingerprint", job_fingerprint)
        .maybeSingle();

      if (existing) {
        skipped += 1;
        continue;
      }

      const categoryResult = categorizeJob(
        title,
        description,
        keywordRows
      );
      if (!categoryResult) {
        skipped += 1;
        continue;
      }

      const { category, subcategory } = categoryResult;

      const slug = generateJobSlug(title, city);

      const source_priority = getSourcePriority(raw.platform);
      const date_posted = raw.date_posted;
      const freshness_score = calculateFreshnessScore(
        source_priority,
        date_posted
      );

      const { error: insertError } = await supabase.from("jobs").insert({
        title,
        slug,
        category,
        subcategory,
        company,
        recruiter_source: raw.recruiter_source ?? null,
        platform: raw.platform,
        country,
        city,
        work_type,
        seniority,
        date_posted,
        date_scraped: new Date().toISOString(),
        apply_url: raw.apply_url,
        salary_range: raw.salary_range ?? null,
        experience_years: raw.experience_years ?? null,
        description_snippet: description || null,
        job_fingerprint,
        freshness_score,
        source_priority,
        is_featured: raw.is_featured ?? false,
        is_active: true,
      });

      if (insertError) {
        if (insertError.code === "23505") {
          skipped += 1;
          continue;
        }
        console.error("[cron/fetch-jobs] Insert error:", insertError);
        skipped += 1;
        continue;
      }

      inserted += 1;
    }

    const response: IngestResponse = {
      received: jobs.length,
      inserted,
      skipped,
      layer,
      jsearch_debug: debug,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[cron/fetch-jobs] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Fetch-jobs cron failed" },
      { status: 500 }
    );
  }
}
