import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { localDateString, rolloverPlayer } from "@/app/hifz/lib";
import { playerPatchToRow, rowToPlayer, type HifzPlayerRow } from "../_db";

export const dynamic = "force-dynamic";

// Shared read for the whole family: every roster member's public state
// (never includes `pin`). Whoever's browser hits this first each day
// triggers that player's daily quest/streak rollover and persists it, so
// every other device sees the same rolled-over state from then on.
export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("hifz_players")
    .select("*")
    .returns<HifzPlayerRow[]>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const today = localDateString(new Date());
  const players = await Promise.all(
    (data ?? []).map(async (row) => {
      const player = rowToPlayer(row);
      if (player.tasksDate === today) return player;

      const rolled = rolloverPlayer(player, today);
      const patch = {
        ...playerPatchToRow({
          streak: rolled.streak,
          tasks: rolled.tasks,
          tasksDate: rolled.tasksDate,
        }),
        updated_at: new Date().toISOString(),
      };
      await supabase.from("hifz_players").update(patch).eq("id", row.id);
      return rolled;
    })
  );

  return NextResponse.json({ players });
}
