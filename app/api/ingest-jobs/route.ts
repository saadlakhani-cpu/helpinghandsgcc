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
import { parseIngestBody } from "@/lib/ingest/parse-body";
import type { IngestResponse } from "@/lib/ingest/types";

export async function POST(request: NextRequest) {
  try {
    const ingestSecret = process.env.INGEST_SECRET ?? process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization") ?? "";

    if (!ingestSecret || authHeader !== `Bearer ${ingestSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const jobs = parseIngestBody(body);

    if (!jobs) {
      return NextResponse.json(
        {
          error:
            "Expected a job object, an array of jobs, or { jobs: [...] }",
        },
        { status: 400 }
      );
    }

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
      // Required-field guard — includes date_posted so a bad date doesn't reach the DB
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

      // STEP A — Normalize fields
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

      // STEP B — Generate fingerprint
      const job_fingerprint = generateJobFingerprint(
        title,
        company,
        city,
        description
      );

      // STEP C — Duplicate check
      const { data: existing } = await supabase
        .from("jobs")
        .select("id")
        .eq("job_fingerprint", job_fingerprint)
        .maybeSingle();

      if (existing) {
        skipped += 1;
        continue;
      }

      // STEP D — Keyword categorization
      const { category, subcategory } = categorizeJob(
        title,
        description,
        keywordRows
      );

      // STEP E — Generate slug
      const slug = generateJobSlug(title, city);

      // STEP F — Calculate freshness score
      const source_priority = getSourcePriority(raw.platform);
      const date_posted = raw.date_posted;
      const freshness_score = calculateFreshnessScore(
        source_priority,
        date_posted
      );

      // STEP G — Insert into jobs table
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
        apply_url: raw.apply_url,
        salary_range: raw.salary_range ?? null,
        experience_years: raw.experience_years ?? null,
        description_snippet: description || null,
        job_fingerprint,
        freshness_score,
        source_priority,
        is_featured: false,
        is_active: true,
      });

      if (insertError) {
        if (insertError.code === "23505") {
          skipped += 1;
          continue;
        }
        console.error("Insert error:", insertError);
        skipped += 1;
        continue;
      }

      inserted += 1;
    }

    const response: IngestResponse = {
      received: jobs.length,
      inserted,
      skipped,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("ingest-jobs error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ingest failed" },
      { status: 500 }
    );
  }
}
