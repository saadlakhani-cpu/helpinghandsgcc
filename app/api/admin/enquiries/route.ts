import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enquiryStatuses } from "@/lib/enquiries";

export async function PATCH(request: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || request.cookies.get("admin_token")?.value !== secret)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.id !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      body.id,
    ) ||
    !enquiryStatuses.includes(body.status)
  )
    return NextResponse.json(
      { error: "Invalid enquiry or status." },
      { status: 400 },
    );
  try {
    const { data, error } = await createAdminClient()
      .from("service_enquiries")
      .update({ status: body.status, updated_at: new Date().toISOString() })
      .eq("id", body.id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data)
      return NextResponse.json(
        { error: "Enquiry not found." },
        { status: 404 },
      );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Could not update enquiry. Please try again." },
      { status: 503 },
    );
  }
}
