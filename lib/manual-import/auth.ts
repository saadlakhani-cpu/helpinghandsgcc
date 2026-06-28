import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const MANUAL_IMPORT_TOKEN_COOKIE = "manual_import_token";
export const MANUAL_IMPORT_USER_COOKIE = "manual_import_user";

export function getManualImportSessionSecret(): string | null {
  return (
    process.env.MANUAL_IMPORT_SESSION_SECRET ||
    process.env.MANUAL_IMPORT_PASSWORD ||
    null
  );
}

export function isManualImportRequestAuthorized(request: NextRequest): boolean {
  const expected = getManualImportSessionSecret();
  const token = request.cookies.get(MANUAL_IMPORT_TOKEN_COOKIE)?.value;

  return Boolean(expected && token === expected);
}

export function getManualImportUserFromCookies(): string {
  return cookies().get(MANUAL_IMPORT_USER_COOKIE)?.value || "manual-import";
}
