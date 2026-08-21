import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const passcode = typeof body.passcode === "string" ? body.passcode.trim() : "";
  const secret = process.env.HIFZ_FAMILY_PASSCODE;

  if (!secret) {
    return NextResponse.json(
      { error: "HIFZ_FAMILY_PASSCODE is not configured" },
      { status: 500 }
    );
  }

  if (!passcode || passcode !== secret) {
    return NextResponse.json({ error: "Incorrect passcode" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("hifz_family_token", secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return response;
}
