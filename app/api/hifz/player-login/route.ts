import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rowToPlayer, type HifzPlayerRow } from "../_db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const playerId = typeof body.playerId === "string" ? body.playerId.trim() : "";
  const pin = typeof body.pin === "string" ? body.pin.trim() : "";

  if (!playerId || !pin) {
    return NextResponse.json({ error: "Missing playerId or pin" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("hifz_players")
    .select("*")
    .eq("id", playerId)
    .maybeSingle<HifzPlayerRow>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data || data.pin !== pin) {
    return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
  }

  const response = NextResponse.json({ player: rowToPlayer(data) });
  response.cookies.set("hifz_player_token", `${playerId}:${pin}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return response;
}
