import { emptyTasks, type Player } from "./lib";

// Preloaded roster. tasksDate is left blank so rolloverPlayer() treats this
// as a fresh setup: it preserves the seeded streak (there's no history to
// verify) and simply queues up today's three fresh quests.
function seedPlayer(overrides: Omit<Player, "tasks" | "tasksDate">): Player {
  return {
    ...overrides,
    tasks: emptyTasks(),
    tasksDate: "",
  };
}

export function buildDefaultPlayers(): Player[] {
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
    }),
  ];
}
