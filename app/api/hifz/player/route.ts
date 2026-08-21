import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { playerPatchToRow, rowToPlayer, type HifzPlayerRow } from "../_db";
import { getAuthenticatedPlayerRow } from "../_auth";

export const dynamic = "force-dynamic";

// Updates only the signed-in player's own row. The body is a partial Player
// patch (camelCase) — id/name/pin are never patchable (see _db.ts), so even
// a tampered request body can't rewrite another cousin's identity.
export async function PATCH(request: NextRequest) {
  const row = await getAuthenticatedPlayerRow(request);
  if (!row) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const patch = {
    ...playerPatchToRow(body as Record<string, unknown>),
    updated_at: new Date().toISOString(),
  };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("hifz_players")
    .update(patch)
    .eq("id", row.id)
    .select("*")
    .single<HifzPlayerRow>();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Update failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ player: rowToPlayer(data) });
}
