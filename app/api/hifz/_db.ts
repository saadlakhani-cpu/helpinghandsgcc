import type { Player } from "@/app/hifz/lib";

// Maps between the DB's snake_case columns and the app's camelCase Player
// shape. `pin` is deliberately never included in the returned Player object.

export type HifzPlayerRow = {
  id: string;
  name: string;
  pin: string;
  character_color: string;
  currency: string;
  difficulty: string;
  focus: string;
  weekend_days: number[];
  vacation_mode: boolean;
  streak: number;
  best_streak: number;
  base_defense_level: number;
  vault_coins: number;
  gems: number;
  total_coins_earned: number;
  tasks: Player["tasks"];
  tasks_date: string;
  cash_out_history: Player["cashOutHistory"];
  current_surah: number;
  current_ayah: number;
  memorization_log: Player["memorizationLog"];
  unlocks: string[];
  updated_at: string;
};

export function rowToPlayer(row: HifzPlayerRow): Player {
  return {
    id: row.id,
    name: row.name,
    characterColor: row.character_color,
    currency: row.currency as Player["currency"],
    difficulty: row.difficulty as Player["difficulty"],
    focus: row.focus,
    weekendDays: row.weekend_days,
    vacationMode: row.vacation_mode,
    streak: row.streak,
    bestStreak: row.best_streak,
    baseDefenseLevel: row.base_defense_level,
    vaultCoins: row.vault_coins,
    gems: row.gems,
    totalCoinsEarned: row.total_coins_earned,
    tasks: row.tasks,
    tasksDate: row.tasks_date,
    cashOutHistory: row.cash_out_history,
    currentSurah: row.current_surah,
    currentAyah: row.current_ayah,
    memorizationLog: row.memorization_log,
    unlocks: row.unlocks,
    updatedAt: row.updated_at,
  };
}

// Only these Player fields may ever be PATCHed by a client — id/name/pin are
// intentionally excluded (identity + credential fields aren't editable here).
const PATCHABLE_FIELDS: Record<string, string> = {
  characterColor: "character_color",
  currency: "currency",
  difficulty: "difficulty",
  focus: "focus",
  weekendDays: "weekend_days",
  vacationMode: "vacation_mode",
  streak: "streak",
  bestStreak: "best_streak",
  baseDefenseLevel: "base_defense_level",
  vaultCoins: "vault_coins",
  gems: "gems",
  totalCoinsEarned: "total_coins_earned",
  tasks: "tasks",
  tasksDate: "tasks_date",
  cashOutHistory: "cash_out_history",
  currentSurah: "current_surah",
  currentAyah: "current_ayah",
  memorizationLog: "memorization_log",
  unlocks: "unlocks",
};

export function playerPatchToRow(
  patch: Record<string, unknown>
): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(patch)) {
    const column = PATCHABLE_FIELDS[key];
    if (column) row[column] = value;
  }
  return row;
}
