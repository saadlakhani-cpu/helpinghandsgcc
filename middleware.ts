import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except the login page itself
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("admin_token")?.value;
    const secret = process.env.ADMIN_SECRET;

    if (!secret || token !== secret) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (
    pathname.startsWith("/manual-import") &&
    !pathname.startsWith("/manual-import/login")
  ) {
    const token = request.cookies.get("manual_import_token")?.value;
    const secret =
      process.env.MANUAL_IMPORT_SESSION_SECRET ||
      process.env.MANUAL_IMPORT_PASSWORD;

    if (!secret || token !== secret) {
      const loginUrl = new URL("/manual-import/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // /hifz and its API are gated by a single shared family passcode. The
  // family-login route itself must stay reachable so the gate can be
  // unlocked in the first place.
  if (
    (pathname.startsWith("/hifz") || pathname.startsWith("/api/hifz")) &&
    pathname !== "/api/hifz/family-login"
  ) {
    const token = request.cookies.get("hifz_family_token")?.value;
    const secret = process.env.HIFZ_FAMILY_PASSCODE;
    const unlocked = Boolean(secret) && token === secret;

    if (!unlocked) {
      if (pathname.startsWith("/api/hifz")) {
        return NextResponse.json({ error: "Family passcode required" }, { status: 401 });
      }
      // The /hifz page itself renders its own lock screen client-side
      // rather than redirecting, so just let it through unauthenticated —
      // it will call /api/hifz/family-login to unlock.
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/manual-import/:path*", "/hifz/:path*", "/api/hifz/:path*"],
};
