import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { HifzPlayerRow } from "./_db";

// Resolves the "hifz_player_token" cookie (format "playerId:pin") to a real,
// currently-valid row — re-checked against the DB on every call rather than
// trusted blindly, so a changed/removed PIN immediately invalidates old
// sessions.
export async function getAuthenticatedPlayerRow(
  request: NextRequest
): Promise<HifzPlayerRow | null> {
  const token = request.cookies.get("hifz_player_token")?.value ?? "";
  const separatorIndex = token.indexOf(":");
  if (separatorIndex < 1) return null;

  const playerId = token.slice(0, separatorIndex);
  const pin = token.slice(separatorIndex + 1);
  if (!playerId || !pin) return null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("hifz_players")
    .select("*")
    .eq("id", playerId)
    .maybeSingle<HifzPlayerRow>();

  if (!data || data.pin !== pin) return null;
  return data;
}
