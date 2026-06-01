import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type ConfirmProfilePayload = {
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
    const body = (await request.json()) as Partial<ConfirmProfilePayload>;

    if (!body.email?.trim() || !body.name?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields: name, email" },
        { status: 400 }
      );
    }

    const email = body.email.trim().toLowerCase();

    const supabase = createAdminClient();

    const now = new Date().toISOString();

    const upsertPayload = {
      name: body.name.trim(),
      email,
      whatsapp: body.whatsapp ?? null,
      current_role: body.current_role ?? null,
      experience_years:
        typeof body.experience_years === "number" ? body.experience_years : null,
      certifications: body.certifications ?? null,
      preferred_country: body.preferred_country ?? null,
      preferred_category: body.preferred_category ?? null,
      preferred_subcategory: body.preferred_subcategory ?? null,
      salary_expectation: body.salary_expectation ?? null,
      resume_url: body.resume_url ?? null,
      resume_parsed: body.resume_parsed ?? null,
      resume_uploaded_at: body.resume_url ? now : null,
    };

    const { data, error } = await supabase
      .from("subscribers")
      .upsert(upsertPayload, { onConflict: "email" })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, subscriber: data });
  } catch (error) {
    console.error("POST /api/confirm-profile error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Confirm failed" },
      { status: 500 }
    );
  }
}

