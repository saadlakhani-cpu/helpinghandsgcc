import { NextRequest, NextResponse } from "next/server";

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

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
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

  return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
}
