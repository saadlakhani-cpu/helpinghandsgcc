import { NextRequest, NextResponse } from "next/server";
import { rowToPlayer } from "../_db";
import { getAuthenticatedPlayerRow } from "../_auth";

export const dynamic = "force-dynamic";

// Lets the client rehydrate "which kid is signed in" after a reload without
// re-asking for the PIN, since the session cookie itself is httpOnly.
export async function GET(request: NextRequest) {
  const row = await getAuthenticatedPlayerRow(request);
  return NextResponse.json({ player: row ? rowToPlayer(row) : null });
}
