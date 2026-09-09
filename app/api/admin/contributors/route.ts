import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/contributors/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateDetails } from "@/lib/contributors/model";
import { generateJobFingerprint } from "@/lib/ingest/fingerprint";
import { generateJobSlug } from "@/lib/ingest/slug";
import { processContributorQueue } from "@/lib/contributors/worker";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(request: NextRequest) {
  if (!isAdmin(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const db = createAdminClient();
    const page = Math.max(
      1,
      Math.min(100000, Number(request.nextUrl.searchParams.get("page")) || 1),
    );
    let query = db
      .from("contributor_submissions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .order("id")
      .range((page - 1) * 25, page * 25 - 1);
    const status = request.nextUrl.searchParams.get("status");
    if (status) query = query.eq("status", status);
    const email = request.nextUrl.searchParams.get("email");
    if (email) query = query.eq("contributor_email", email);
    const [rows, members] = await Promise.all([
      query,
      db
        .from("contributors")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);
    if (rows.error || members.error)
      throw new Error(
        "Apply the contributor migration before using this screen.",
      );
    return NextResponse.json(
      { rows: rows.data, count: rows.count, members: members.data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load contributors",
      },
      { status: 503 },
    );
  }
}
export async function POST(request: NextRequest) {
  if (!isAdmin(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  try {
    const body = await request.json();
    const db = createAdminClient();
    if (body.action === "member") {
      if (
        typeof body.email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) ||
        body.email.length > 254 ||
        typeof body.name !== "string" ||
        !body.name.trim() ||
        body.name.length > 100 ||
        !Number.isInteger(body.rate_minor) ||
        body.rate_minor < 0 ||
        body.rate_minor > 1000000 ||
        !["SAR", "AED", "USD"].includes(body.currency) ||
        typeof body.active !== "boolean"
      )
        throw new Error("Check contributor name, email and payment rate.");
      const saved = await db
        .from("contributors")
        .upsert({
          email: body.email.trim().toLowerCase(),
          name: body.name.trim(),
          rate_minor: body.rate_minor,
          currency: body.currency,
          active: body.active,
        });
      if (saved.error) throw new Error("Could not save contributor.");
      return NextResponse.json({ success: true });
    }
    if (body.action === "process")
      return NextResponse.json(await processContributorQueue());
    if (typeof body.id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.id))
      throw new Error("Invalid submission.");
    if (body.action === "approve") {
      const row = await db
        .from("contributor_submissions")
        .select("details,canonical_url")
        .eq("id", body.id)
        .single();
      if (row.error) throw new Error("Could not load submission.");
      const d = validateDetails(row.data.details);
      const result = await db.rpc("approve_contributor_submission", {
        p_id: body.id,
        p_job: {
          slug: generateJobSlug(d.title, d.city),
          job_fingerprint: generateJobFingerprint(
            d.title,
            d.company,
            d.city,
            d.description,
          ),
          platform: new URL(row.data.canonical_url).hostname,
        },
      });
      if (result.error)
        throw new Error(
          "Could not approve this submission. Refresh and check its status.",
        );
      return NextResponse.json(result.data);
    }
    if (body.action === "paid") {
      if (
        typeof body.reference !== "string" ||
        !body.reference.trim() ||
        body.reference.length > 200
      )
        throw new Error("Enter the payment reference.");
      const saved = await db
        .from("contributor_submissions")
        .update({
          paid_at: new Date().toISOString(),
          payment_reference: body.reference.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", body.id)
        .eq("status", "approved")
        .is("paid_at", null)
        .select("id")
        .maybeSingle();
      if (saved.error || !saved.data)
        throw new Error(
          "Payment is already recorded or the job is not approved.",
        );
      return NextResponse.json({ success: true });
    }
    if (
      !["reject", "return"].includes(body.action) ||
      typeof body.reason !== "string" ||
      !body.reason.trim() ||
      body.reason.length > 1000
    )
      throw new Error("Provide a reason for this action.");
    const saved = await db
      .from("contributor_submissions")
      .update({
        status: body.action === "reject" ? "rejected" : "needs_details",
        reason: body.reason.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.id)
      .in("status", ["review", "needs_details"])
      .select("id")
      .maybeSingle();
    if (saved.error || !saved.data)
      throw new Error("Status changed. Refresh and try again.");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Action failed" },
      { status: 400 },
    );
  }
}
