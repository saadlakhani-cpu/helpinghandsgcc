import { addDays, emptyTasks, localDateString, type MemorizationEntry, type Player } from "./lib";
import { rangeAyahCount } from "./quran";

// Preloaded roster. tasksDate is left blank so rolloverPlayer() treats this
// as a fresh setup: it preserves the seeded streak (there's no history to
// verify) and simply queues up today's three fresh quests.
function seedPlayer(
  overrides: Omit<Player, "tasks" | "tasksDate">
): Player {
  return {
    ...overrides,
    tasks: emptyTasks(),
    tasksDate: "",
  };
}

// Builds a memorization log from a list of ranges (oldest first), each
// logged `daysAgo` days before today, and computes each entry's ayah count.
function seedLog(
  playerId: string,
  entries: {
    daysAgo: number;
    fromSurah: number;
    fromAyah: number;
    toSurah: number;
    toAyah: number;
  }[]
): MemorizationEntry[] {
  return entries.map((e, i) => ({
    id: `${playerId}-log-${i}`,
    date: localDateString(addDays(new Date(), -e.daysAgo)),
    fromSurah: e.fromSurah,
    fromAyah: e.fromAyah,
    toSurah: e.toSurah,
    toAyah: e.toAyah,
    ayahCount: rangeAyahCount(e.fromSurah, e.fromAyah, e.toSurah, e.toAyah),
  }));
}

export function buildDefaultPlayers(): Player[] {
  const zaynLog = seedLog("zayn", [
    // Secured base: Juz 23-30
    { daysAgo: 20, fromSurah: 36, fromAyah: 28, toSurah: 114, toAyah: 6 },
    // Now attacking Surah 22 (Al-Hajj)
    { daysAgo: 10, fromSurah: 22, fromAyah: 1, toSurah: 22, toAyah: 20 },
    { daysAgo: 5, fromSurah: 22, fromAyah: 21, toSurah: 22, toAyah: 45 },
  ]);

  const ahmadLog = seedLog("ahmad", [
    // Secured base: Juz 21-30
    { daysAgo: 15, fromSurah: 29, fromAyah: 46, toSurah: 114, toAyah: 6 },
    { daysAgo: 8, fromSurah: 27, fromAyah: 56, toSurah: 27, toAyah: 93 },
    { daysAgo: 3, fromSurah: 28, fromAyah: 1, toSurah: 28, toAyah: 30 },
  ]);

  const muhammadLog = seedLog("muhammad", [
    { daysAgo: 12, fromSurah: 78, fromAyah: 1, toSurah: 80, toAyah: 42 },
    { daysAgo: 2, fromSurah: 81, fromAyah: 1, toSurah: 81, toAyah: 10 },
  ]);

  const abihaLog = seedLog("abiha", [
    { daysAgo: 20, fromSurah: 1, fromAyah: 1, toSurah: 1, toAyah: 7 },
    { daysAgo: 10, fromSurah: 2, fromAyah: 1, toSurah: 2, toAyah: 50 },
    { daysAgo: 4, fromSurah: 2, fromAyah: 51, toSurah: 2, toAyah: 100 },
  ]);

  return [
    seedPlayer({
      id: "zayn",
      name: "Zayn",
      avatar: "🛡️",
      currency: "SAR",
      difficulty: "COMMANDER",
      focus: "Protecting Juzz 23-30 · Attacking Chapter 22",
      weekendDays: [5, 6],
      vacationMode: false,
      streak: 6,
      bestStreak: 11,
      baseDefenseLevel: 14,
      vaultCoins: 640,
      gems: 58,
      totalCoinsEarned: 3120,
      cashOutHistory: [],
      currentSurah: 22,
      currentAyah: 45,
      memorizationLog: zaynLog,
    }),
    seedPlayer({
      id: "ahmad",
      name: "Ahmad",
      avatar: "🚀",
      currency: "SAR",
      difficulty: "COMMANDER",
      focus: "Ramadan Target: Complete Juzz 14-30 before Ramadan",
      weekendDays: [5, 6],
      vacationMode: false,
      streak: 3,
      bestStreak: 8,
      baseDefenseLevel: 10,
      vaultCoins: 410,
      gems: 36,
      totalCoinsEarned: 2260,
      cashOutHistory: [],
      currentSurah: 28,
      currentAyah: 30,
      memorizationLog: ahmadLog,
    }),
    seedPlayer({
      id: "muhammad",
      name: "Muhammad",
      avatar: "🎯",
      currency: "USD",
      difficulty: "RECRUIT",
      focus: "Building the foundation: Juzz Amma, line by line",
      weekendDays: [6, 0],
      vacationMode: false,
      streak: 2,
      bestStreak: 5,
      baseDefenseLevel: 4,
      vaultCoins: 180,
      gems: 14,
      totalCoinsEarned: 540,
      cashOutHistory: [],
      currentSurah: 81,
      currentAyah: 10,
      memorizationLog: muhammadLog,
    }),
    seedPlayer({
      id: "abiha",
      name: "Abiha",
      avatar: "🛰️",
      currency: "PKR",
      difficulty: "SENTINEL",
      focus: "Steady progress through Juzz 1-5",
      weekendDays: [6, 0],
      vacationMode: false,
      streak: 5,
      bestStreak: 5,
      baseDefenseLevel: 8,
      vaultCoins: 320,
      gems: 27,
      totalCoinsEarned: 1580,
      cashOutHistory: [],
      currentSurah: 2,
      currentAyah: 100,
      memorizationLog: abihaLog,
    }),
  ];
}
