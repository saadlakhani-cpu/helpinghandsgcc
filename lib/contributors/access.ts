import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function contributorAccess(request: NextRequest) {
  const token = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Sign in with your contributor account.");
  const db = createAdminClient();
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user?.email || !data.user.email_confirmed_at)
    throw new Error("Sign in with a verified email address.");
  const email = data.user.email.toLowerCase();
  const member = await db
    .from("contributors")
    .select("email,name,rate_minor,currency,active")
    .eq("email", email)
    .maybeSingle();
  if (member.error)
    throw new Error(
      "Contributor portal is not ready. Contact the administrator.",
    );
  if (!member.data?.active)
    throw new Error(
      "Ask the administrator to enable contributor access for this email.",
    );
  return { db, email, member: member.data };
}

export function isAdmin(request: NextRequest) {
  return Boolean(
    process.env.ADMIN_SECRET &&
      request.cookies.get("admin_token")?.value === process.env.ADMIN_SECRET,
  );
}
