import { NextRequest, NextResponse } from "next/server";
import {
  MANUAL_IMPORT_TOKEN_COOKIE,
  MANUAL_IMPORT_USER_COOKIE,
  getManualImportSessionSecret,
} from "@/lib/manual-import/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const expectedUsername = process.env.MANUAL_IMPORT_USERNAME;
  const expectedPassword = process.env.MANUAL_IMPORT_PASSWORD;
  const sessionSecret = getManualImportSessionSecret();

  if (!expectedUsername || !expectedPassword || !sessionSecret) {
    return NextResponse.json(
      { error: "Manual import login is not configured" },
      { status: 500 }
    );
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  };

  response.cookies.set(MANUAL_IMPORT_TOKEN_COOKIE, sessionSecret, cookieOptions);
  response.cookies.set(MANUAL_IMPORT_USER_COOKIE, username, cookieOptions);

  return response;
}
