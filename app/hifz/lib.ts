// ── Types ─────────────────────────────────────────────────────────────────────

export type Currency = "SAR" | "USD" | "PKR";
export type Difficulty = "RECRUIT" | "SENTINEL" | "COMMANDER";
export type QuestKey = "shields" | "recon" | "perimeter";

export type DailyTasks = Record<QuestKey, boolean>;

export type CashOutRecord = {
  id: string;
  date: string;
  coins: number;
  amount: number;
  currency: Currency;
};

export type MemorizationEntry = {
  id: string;
  date: string;
  fromSurah: number;
  fromAyah: number;
  toSurah: number;
  toAyah: number;
  ayahCount: number;
};

export type Player = {
  id: string;
  name: string;
  characterColor: string;
  currency: Currency;
  difficulty: Difficulty;
  focus: string;
  weekendDays: number[];
  vacationMode: boolean;
  streak: number;
  bestStreak: number;
  baseDefenseLevel: number;
  vaultCoins: number;
  gems: number;
  totalCoinsEarned: number;
  tasks: DailyTasks;
  tasksDate: string;
  cashOutHistory: CashOutRecord[];
  currentSurah: number;
  currentAyah: number;
  memorizationLog: MemorizationEntry[];
  unlocks: string[];
  updatedAt: string;
};

export function totalAyahsMemorized(player: Pick<Player, "memorizationLog">): number {
  return player.memorizationLog.reduce((sum, e) => sum + e.ayahCount, 0);
}

// ── Static config ─────────────────────────────────────────────────────────────

export const CHARACTER_COLORS = [
  "#22d3ee", // cyan
  "#f472b6", // pink
  "#a3e635", // lime
  "#fbbf24", // amber
  "#c084fc", // violet
  "#fb7185", // rose
  "#38bdf8", // sky
  "#34d399", // emerald
];

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const CASH_OUT_THRESHOLD = 500;
export const DAILY_COMPLETE_BONUS_COINS = 60;
export const DAILY_COMPLETE_BONUS_GEMS = 6;

export const CURRENCY_META: Record<
  Currency,
  { symbol: string; label: string; perCoin: number }
> = {
  SAR: { symbol: "SAR", label: "Saudi Riyal", perCoin: 0.02 },
  USD: { symbol: "$", label: "US Dollar", perCoin: 0.005 },
  PKR: { symbol: "₨", label: "Pakistani Rupee", perCoin: 1.5 },
};

export const DIFFICULTY_META: Record<
  Difficulty,
  {
    label: string;
    tagline: string;
    session: string;
    accent: string;
    ring: string;
    glow: string;
    baseCoins: number;
    baseGems: number;
    // Rough default span (in ayahs) suggested when logging a new-memorization
    // session at this difficulty — a starting point the player can edit.
    suggestedAyahs: number;
    quests: Record<QuestKey, string>;
  }
> = {
  RECRUIT: {
    label: "RECRUIT",
    tagline: "Easy — building the habit",
    session: "10-15 min sessions",
    accent: "text-lime-400",
    ring: "ring-lime-400/60",
    glow: "shadow-lime-400/40",
    baseCoins: 40,
    baseGems: 4,
    suggestedAyahs: 3,
    quests: {
      shields: "Revise yesterday's Sabaq (1 page)",
      recon: "Memorize 2-3 new lines",
      perimeter: "Light Manzil review — 1 short section",
    },
  },
  SENTINEL: {
    label: "SENTINEL",
    tagline: "Medium — standard operations",
    session: "20-30 min sessions",
    accent: "text-cyan-400",
    ring: "ring-cyan-400/60",
    glow: "shadow-cyan-400/40",
    baseCoins: 80,
    baseGems: 8,
    suggestedAyahs: 8,
    quests: {
      shields: "Revise last 3 pages of Sabqi",
      recon: "Memorize 0.5 new page",
      perimeter: "Manzil review — 1 full Juzz",
    },
  },
  COMMANDER: {
    label: "COMMANDER",
    tagline: "Hard — intensive push",
    session: "45-60 min sessions",
    accent: "text-fuchsia-400",
    ring: "ring-fuchsia-400/60",
    glow: "shadow-fuchsia-400/40",
    baseCoins: 150,
    baseGems: 15,
    suggestedAyahs: 15,
    quests: {
      shields: "Revise last 5 pages of Sabqi",
      recon: "Memorize 1+ new page",
      perimeter: "Manzil review — 2 Juzz rotation",
    },
  },
};

export const QUEST_TITLES: Record<
  QuestKey,
  { title: string; subtitle: string; icon: string }
> = {
  shields: {
    title: "Reinforce Base Shields",
    subtitle: "Sabqi · Recent Revision",
    icon: "🛡️",
  },
  recon: {
    title: "Launch Recon Strike",
    subtitle: "Sabaq · New Memorization",
    icon: "🚀",
  },
  perimeter: {
    title: "Fortify City Perimeter",
    subtitle: "Manzil · Old Revision",
    icon: "🏙️",
  },
};

// ── Date helpers ──────────────────────────────────────────────────────────────

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function localDateString(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function todayString(): string {
  return localDateString(new Date());
}

export function yesterdayOf(dateStr: string): string {
  return localDateString(addDays(parseLocalDate(dateStr), -1));
}

// ── Game logic ────────────────────────────────────────────────────────────────

export function emptyTasks(): DailyTasks {
  return { shields: false, recon: false, perimeter: false };
}

export function rolloverPlayer(player: Player, today: string): Player {
  if (player.tasksDate === today) return player;

  const isFreshSetup = player.tasksDate === "";
  const wasYesterday = player.tasksDate === yesterdayOf(today);
  const completedAllYesterday =
    wasYesterday &&
    player.tasks.shields &&
    player.tasks.recon &&
    player.tasks.perimeter;

  const nextStreak = isFreshSetup
    ? player.streak
    : wasYesterday && completedAllYesterday
      ? player.streak
      : 0;

  return {
    ...player,
    streak: nextStreak,
    tasks: emptyTasks(),
    tasksDate: today,
  };
}

export type MultiplierTier = "none" | "weekend" | "vacation";

export type MultiplierState = {
  multiplier: number;
  label: string | null;
  tier: MultiplierTier;
};

export function getMultiplier(
  player: Pick<Player, "vacationMode" | "weekendDays">,
  now: Date = new Date()
): MultiplierState {
  if (player.vacationMode) {
    return {
      multiplier: 2,
      label: "🔥 DOUBLE LOOT EVENT ACTIVE — 2X EARNINGS",
      tier: "vacation",
    };
  }
  if (player.weekendDays.includes(now.getDay())) {
    return {
      multiplier: 1.5,
      label: "⚡ WEEKEND OPS ACTIVE — 1.5X EARNINGS",
      tier: "weekend",
    };
  }
  return { multiplier: 1, label: null, tier: "none" };
}

export function taskReward(
  difficulty: Difficulty,
  multiplier: number
): { coins: number; gems: number } {
  const meta = DIFFICULTY_META[difficulty];
  return {
    coins: Math.round(meta.baseCoins * multiplier),
    gems: Math.round(meta.baseGems * multiplier),
  };
}

export function coinsToCash(coins: number, currency: Currency): number {
  return Math.round(coins * CURRENCY_META[currency].perCoin * 100) / 100;
}

export function formatCash(amount: number, currency: Currency): string {
  const meta = CURRENCY_META[currency];
  return currency === "USD"
    ? `${meta.symbol}${amount.toLocaleString()}`
    : `${amount.toLocaleString()} ${meta.symbol}`;
}

export function allTasksDone(tasks: DailyTasks): boolean {
  return tasks.shields && tasks.recon && tasks.perimeter;
}

// ── Ramadan countdown ─────────────────────────────────────────────────────────

// Anchored on the estimated start of Ramadan 1447 AH (Feb 18, 2026).
// Future years are projected using the average lunar year (~354.36 days);
// actual dates shift ± a day depending on moon sighting.
const RAMADAN_ANCHOR = new Date(2026, 1, 18);
const LUNAR_YEAR_MS = 354.36 * 24 * 60 * 60 * 1000;

export function getNextRamadanStart(from: Date = new Date()): Date {
  let d = new Date(RAMADAN_ANCHOR);
  while (d.getTime() <= from.getTime()) {
    d = new Date(d.getTime() + LUNAR_YEAR_MS);
  }
  while (d.getTime() - LUNAR_YEAR_MS > from.getTime()) {
    d = new Date(d.getTime() - LUNAR_YEAR_MS);
  }
  return d;
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

export function rankPlayers(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    if (b.streak !== a.streak) return b.streak - a.streak;
    if (b.baseDefenseLevel !== a.baseDefenseLevel)
      return b.baseDefenseLevel - a.baseDefenseLevel;
    return b.totalCoinsEarned - a.totalCoinsEarned;
  });
}
