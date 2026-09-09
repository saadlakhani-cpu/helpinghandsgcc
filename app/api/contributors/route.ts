import { NextRequest, NextResponse } from "next/server";
import { contributorAccess } from "@/lib/contributors/access";
import { canonicalUrl, validateDetails } from "@/lib/contributors/model";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(request: NextRequest) {
  try {
    const { db, email, member } = await contributorAccess(request);
    const page = Math.max(
      1,
      Math.min(100000, Number(request.nextUrl.searchParams.get("page")) || 1),
    );
    const { data, error, count } = await db
      .from("contributor_submissions")
      .select(
        "id,original_url,canonical_url,status,reason,details,created_at,updated_at,amount_minor,currency,paid_at,payment_reference",
        { count: "exact" },
      )
      .eq("contributor_email", email)
      .order("created_at", { ascending: false })
      .order("id")
      .range((page - 1) * 25, page * 25 - 1);
    if (error) throw new Error("Could not load submissions.");
    return NextResponse.json(
      { rows: data, count, member },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unavailable" },
      { status: 403 },
    );
  }
}
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  let access;
  try {
    access = await contributorAccess(request);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 403 },
    );
  }
  const { db, email } = access;
  const limit = checkRateLimit(`contributor:${email}`, 20, 3600000);
  if (limit.limited)
    return NextResponse.json(
      { error: "Please wait before submitting more links." },
      { status: 429 },
    );
  try {
    const raw = await request.text();
    if (raw.length > 65000)
      return NextResponse.json(
        { error: "Submit up to 25 links at a time." },
        { status: 413 },
      );
    const body = JSON.parse(raw);
    if (body.action === "details") {
      const details = validateDetails(body.details);
      const { data, error } = await db
        .from("contributor_submissions")
        .update({
          details,
          status: "review",
          reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", body.id)
        .eq("contributor_email", email)
        .eq("status", "needs_details")
        .select("id")
        .maybeSingle();
      if (error || !data)
        throw new Error(
          "This submission is no longer editable. Refresh the list.",
        );
      return NextResponse.json({ success: true });
    }
    if (typeof body.links !== "string")
      throw new Error("Paste job links, one per line.");
    const links = body.links
      .split(/\r?\n/)
      .map((s: string) => s.trim())
      .filter(Boolean);
    if (!links.length || links.length > 25)
      throw new Error("Submit between 1 and 25 links.");
    const queueLink = async (link: string) => {
      try {
        const url = canonicalUrl(link);
        const parsed = new URL(url);
        // Narrow existing job checks by path, then compare normalized URLs (never trust a substring match).
        const identity = parsed.hostname === 'linkedin.com' ? parsed.pathname.split('/').pop()! : parsed.searchParams.get('jk') || parsed.pathname;
        const escaped = identity.replace(/[\\%_]/g, "\\$&");
        const existing = await db
          .from("jobs")
          .select("apply_url")
          .like("apply_url", `%${escaped}%`)
          .limit(1000);
        if (existing.error)
          throw new Error("Could not check existing jobs. Please retry.");
        const found = (existing.data || []).some((row) => {
          try {
            return canonicalUrl(row.apply_url) === url;
          } catch {
            return false;
          }
        });
        const queued = await db.rpc("submit_contributor_link", {
          p_email: email,
          p_original: link,
          p_url: url,
          p_existing: found,
        });
        if (queued.error)
          throw new Error("Could not queue this link. Please retry.");
        return {
          url: link,
          id: queued.data.id,
          status: queued.data.status,
          reason: queued.data.reason,
        };
      } catch (error) {
        return {
          url: link,
          status: "failed",
          reason: error instanceof Error ? error.message : "Invalid link",
        };
      }
    };
    const results = [];
    for (let offset = 0; offset < links.length; offset += 5) {
      results.push(...await Promise.all(links.slice(offset, offset + 5).map(queueLink)));
    }
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Submission failed" },
      { status: 400 },
    );
  }
}
