import { totalAyahsMemorized, type Player } from "./lib";

export type GearSlot = "helmet" | "cape" | "weapon" | "aura";

export type GearItem = {
  id: string;
  slot: GearSlot;
  tier: number;
  name: string;
  emoji: string;
  description: string;
  requirement: (player: Player) => boolean;
};

// Every item's requirement is checked against LIVE stats to decide what's
// newly earned, but once earned an id is stored permanently in
// `player.unlocks` — trophies never get taken away even if the underlying
// stat later dips (e.g. a broken streak).
export const GEAR_CATALOG: GearItem[] = [
  {
    id: "helmet_bronze",
    slot: "helmet",
    tier: 1,
    name: "Bronze Helm",
    emoji: "🪖",
    description: "Reach a 3-day streak",
    requirement: (p) => p.streak >= 3,
  },
  {
    id: "helmet_silver",
    slot: "helmet",
    tier: 2,
    name: "Silver Helm",
    emoji: "⛑️",
    description: "Reach a 7-day streak",
    requirement: (p) => p.streak >= 7,
  },
  {
    id: "helmet_gold",
    slot: "helmet",
    tier: 3,
    name: "Champion's Crown",
    emoji: "👑",
    description: "Reach a 14-day streak",
    requirement: (p) => p.streak >= 14,
  },
  {
    id: "cape_recruit",
    slot: "cape",
    tier: 1,
    name: "Recruit Cape",
    emoji: "🟩",
    description: "Memorize 250 ayahs total",
    requirement: (p) => totalAyahsMemorized(p) >= 250,
  },
  {
    id: "cape_sentinel",
    slot: "cape",
    tier: 2,
    name: "Sentinel Cape",
    emoji: "🟦",
    description: "Memorize 1,500 ayahs total",
    requirement: (p) => totalAyahsMemorized(p) >= 1500,
  },
  {
    id: "cape_commander",
    slot: "cape",
    tier: 3,
    name: "Commander's Cape",
    emoji: "🟪",
    description: "Memorize 3,500 ayahs total",
    requirement: (p) => totalAyahsMemorized(p) >= 3500,
  },
  {
    id: "weapon_training",
    slot: "weapon",
    tier: 1,
    name: "Training Sword",
    emoji: "🗡️",
    description: "Reach Base Defense Lv. 5",
    requirement: (p) => p.baseDefenseLevel >= 5,
  },
  {
    id: "weapon_steel",
    slot: "weapon",
    tier: 2,
    name: "Steel Blade",
    emoji: "⚔️",
    description: "Reach Base Defense Lv. 10",
    requirement: (p) => p.baseDefenseLevel >= 10,
  },
  {
    id: "weapon_plasma",
    slot: "weapon",
    tier: 3,
    name: "Plasma Blade",
    emoji: "🔱",
    description: "Reach Base Defense Lv. 20",
    requirement: (p) => p.baseDefenseLevel >= 20,
  },
  {
    id: "aura_veteran",
    slot: "aura",
    tier: 1,
    name: "Veteran Aura",
    emoji: "✨",
    description: "Hit a 10-day best streak",
    requirement: (p) => p.bestStreak >= 10,
  },
  {
    id: "aura_legend",
    slot: "aura",
    tier: 2,
    name: "Legend Aura",
    emoji: "💠",
    description: "Earn 5,000 lifetime Defense Coins",
    requirement: (p) => p.totalCoinsEarned >= 5000,
  },
  {
    id: "aura_payout",
    slot: "aura",
    tier: 0,
    name: "First Payout",
    emoji: "💰",
    description: "Cash out for the first time",
    requirement: (p) => p.cashOutHistory.length >= 1,
  },
];

export function eligibleUnlockIds(player: Player): string[] {
  return GEAR_CATALOG.filter((item) => item.requirement(player)).map((i) => i.id);
}

// Highest-tier unlocked item per slot, using the player's PERSISTED unlocks
// (so gear stays equipped even if a live stat like streak later drops).
export function equippedGear(player: Player): Partial<Record<GearSlot, GearItem>> {
  const equipped: Partial<Record<GearSlot, GearItem>> = {};
  for (const item of GEAR_CATALOG) {
    if (!player.unlocks.includes(item.id)) continue;
    const current = equipped[item.slot];
    if (!current || item.tier > current.tier) equipped[item.slot] = item;
  }
  return equipped;
}

export function gearById(id: string): GearItem | undefined {
  return GEAR_CATALOG.find((i) => i.id === id);
}

// Given a player object with its stats already updated (but `unlocks` still
// the old persisted list), returns the merged unlocks array to persist plus
// whichever items were newly earned by this change — for a celebration toast.
export function computeUnlockUpdate(prospective: Player): {
  unlocks: string[];
  newlyUnlocked: GearItem[];
} {
  const eligible = eligibleUnlockIds(prospective);
  const newlyUnlockedIds = eligible.filter((id) => !prospective.unlocks.includes(id));
  const unlocks = Array.from(new Set([...prospective.unlocks, ...eligible]));
  const newlyUnlocked = newlyUnlockedIds
    .map((id) => gearById(id))
    .filter((item): item is GearItem => Boolean(item));
  return { unlocks, newlyUnlocked };
}
