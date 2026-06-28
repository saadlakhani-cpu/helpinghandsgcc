import { NextRequest, NextResponse } from "next/server";
import {
  MANUAL_IMPORT_TOKEN_COOKIE,
  MANUAL_IMPORT_USER_COOKIE,
} from "@/lib/manual-import/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/manual-import/login", request.url));
  response.cookies.set(MANUAL_IMPORT_TOKEN_COOKIE, "", { maxAge: 0, path: "/" });
  response.cookies.set(MANUAL_IMPORT_USER_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}
