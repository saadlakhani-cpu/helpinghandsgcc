import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { validateEnquiry } from "@/lib/enquiries";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json(
      { error: "Please submit from this website." },
      { status: 403 },
    );
  }
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rate = checkRateLimit(`enquiries:${ip}`, 5, 60 * 60 * 1000);
  if (rate.limited)
    return NextResponse.json(
      { error: "Too many enquiries. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
    );
  const raw = await request.text();
  if (raw.length > 12000)
    return NextResponse.json(
      { error: "Your enquiry is too long." },
      { status: 413 },
    );
  let payload;
  try {
    const body = JSON.parse(raw);
    if (body?.website)
      return NextResponse.json({ error: "Please try again." }, { status: 400 });
    payload = validateEnquiry(body);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof SyntaxError
            ? "Invalid enquiry."
            : error instanceof Error
              ? error.message
              : "Invalid enquiry.",
      },
      { status: 400 },
    );
  }
  try {
    const { error } = await createAdminClient()
      .from("service_enquiries")
      .insert(payload);
    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    console.error("Service enquiry could not be saved.");
    return NextResponse.json(
      {
        error:
          "We could not save your enquiry. Please try again later or contact adminhhgcc@gmail.com.",
      },
      { status: 503 },
    );
  }
}
