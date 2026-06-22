import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { matchJobsForSubscriber } from "@/lib/alerts/match-jobs";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

type SubscribePayload = {
  name: string;
  email: string;
  whatsapp?: string | null;
  current_role?: string | null;
  experience_years?: number | null;
  certifications?: string | null;
  preferred_country?: string | null;
  preferred_category?: "Finance" | "AI" | "Both" | null;
  preferred_subcategory?: string | null;
  salary_expectation?: string | null;
  resume_url?: string | null;
  resume_parsed?: unknown | null;
};

export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
    const ip =
      forwardedFor.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const rateLimit = checkRateLimit(`subscribe:${ip}`, 10, 60 * 60 * 1000);

    if (rateLimit.limited) {
      return NextResponse.json(
        { error: "Too many subscription attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) },
        }
      );
    }

    const body = (await request.json()) as Partial<SubscribePayload>;

    if (!body.email?.trim() || !body.name?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields: name, email" },
        { status: 400 }
      );
    }

    const email = body.email.trim().toLowerCase();
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // ── 1. Upsert subscriber ─────────────────────────────────────────────────
    const { data: subscriber, error: upsertError } = await supabase
      .from("subscribers")
      .upsert(
        {
          name: body.name.trim(),
          email,
          whatsapp: body.whatsapp ?? null,
          current_role: body.current_role ?? null,
          experience_years:
            typeof body.experience_years === "number"
              ? body.experience_years
              : null,
          certifications: body.certifications ?? null,
          preferred_country: body.preferred_country ?? null,
          preferred_category: body.preferred_category ?? null,
          preferred_subcategory: body.preferred_subcategory ?? null,
          salary_expectation: body.salary_expectation ?? null,
          resume_url: body.resume_url ?? null,
          resume_parsed: body.resume_parsed ?? null,
          resume_uploaded_at: body.resume_url ? now : null,
        },
        { onConflict: "email" }
      )
      .select("*")
      .single();

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    // ── 2. Run job matching ──────────────────────────────────────────────────
    const { matched, error: matchError } = await matchJobsForSubscriber(
      supabase,
      {
        id: subscriber.id,
        preferred_category: subscriber.preferred_category ?? null,
        preferred_country: subscriber.preferred_country ?? null,
        preferred_subcategory: subscriber.preferred_subcategory ?? null,
      }
    );

    if (matchError) {
      // Non-fatal: subscriber is saved, matching just failed
      console.error("matchJobsForSubscriber error:", matchError);
    }

    return NextResponse.json({
      success: true,
      subscriber,
      matched_count: matched,
    });
  } catch (error) {
    console.error("POST /api/subscribe error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Subscribe failed" },
      { status: 500 }
    );
  }
}
