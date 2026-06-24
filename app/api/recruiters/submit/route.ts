import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const COUNTRIES = [
  "KSA",
  "UAE",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Oman",
] as const;

const PROFILE_COUNTRIES = [...COUNTRIES, "Multiple GCC countries"] as const;
const CATEGORIES = ["Finance", "AI"] as const;
const WORK_TYPES = ["Remote", "Hybrid", "On-site"] as const;
const SENIORITIES = ["Junior", "Mid", "Senior", "Director", "C-Suite"] as const;

type RecruiterPayload = {
  company_name?: string;
  contact_name?: string;
  work_email?: string;
  phone?: string;
  company_website?: string;
  linkedin_url?: string;
  country?: string;
  hiring_categories?: string[];
  title?: string;
  category?: string;
  city?: string;
  job_country?: string;
  work_type?: string;
  seniority?: string;
  job_type?: string;
  description?: string;
  requirements?: string;
  apply_email?: string;
  apply_url?: string;
  screening_requested?: boolean;
};

function clean(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isOneOf<T extends readonly string[]>(
  value: string | null,
  allowed: T
): value is T[number] {
  return Boolean(value && allowed.includes(value));
}

function isEmail(value: string | null): boolean {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}

export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
    const ip =
      forwardedFor.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const rateLimit = checkRateLimit(`recruiter-submit:${ip}`, 8, 60 * 60 * 1000);

    if (rateLimit.limited) {
      return NextResponse.json(
        { error: "Too many recruiter submissions. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) },
        }
      );
    }

    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json({ error: "Please sign in with Google first." }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user?.id || !userData.user.email) {
      return NextResponse.json({ error: "Your sign-in session could not be verified." }, { status: 401 });
    }

    const body = (await request.json()) as RecruiterPayload;
    const companyName = clean(body.company_name);
    const contactName = clean(body.contact_name);
    const workEmail = clean(body.work_email)?.toLowerCase() ?? null;
    const profileCountry = clean(body.country);
    const title = clean(body.title);
    const category = clean(body.category);
    const jobCountry = clean(body.job_country);
    const city = clean(body.city);
    const workType = clean(body.work_type);
    const seniority = clean(body.seniority);
    const description = clean(body.description);
    const applyEmail = clean(body.apply_email)?.toLowerCase() ?? null;
    const applyUrl = clean(body.apply_url);
    const hiringCategories = Array.isArray(body.hiring_categories)
      ? body.hiring_categories.filter((item): item is "Finance" | "AI" =>
          CATEGORIES.includes(item as "Finance" | "AI")
        )
      : [];

    if (
      !companyName ||
      !contactName ||
      !isEmail(workEmail) ||
      !isOneOf(profileCountry, PROFILE_COUNTRIES) ||
      hiringCategories.length === 0 ||
      !title ||
      !isOneOf(category, CATEGORIES) ||
      !isOneOf(jobCountry, COUNTRIES) ||
      !city ||
      !isOneOf(workType, WORK_TYPES) ||
      !isOneOf(seniority, SENIORITIES) ||
      !description
    ) {
      return NextResponse.json(
        { error: "Please complete all required recruiter and job fields." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const { data: profile, error: profileError } = await supabase
      .from("recruiter_profiles")
      .upsert(
        {
          auth_user_id: userData.user.id,
          auth_email: userData.user.email.toLowerCase(),
          company_name: companyName,
          contact_name: contactName,
          work_email: workEmail,
          phone: clean(body.phone),
          company_website: clean(body.company_website),
          linkedin_url: clean(body.linkedin_url),
          country: profileCountry,
          hiring_categories: hiringCategories,
          updated_at: now,
        },
        { onConflict: "auth_user_id" }
      )
      .select("id")
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: profileError?.message ?? "Could not save recruiter profile." },
        { status: 500 }
      );
    }

    const { data: jobPost, error: jobError } = await supabase
      .from("recruiter_job_posts")
      .insert({
        recruiter_profile_id: profile.id,
        title,
        category,
        company: companyName,
        country: jobCountry,
        city,
        work_type: workType,
        seniority,
        job_type: clean(body.job_type),
        description,
        requirements: clean(body.requirements),
        apply_email: isEmail(applyEmail) ? applyEmail : null,
        apply_url: applyUrl,
        screening_requested: body.screening_requested !== false,
      })
      .select("id, status")
      .single();

    if (jobError) {
      return NextResponse.json({ error: jobError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile_id: profile.id, job_post: jobPost });
  } catch (error) {
    console.error("POST /api/recruiters/submit error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Recruiter submission failed" },
      { status: 500 }
    );
  }
}
