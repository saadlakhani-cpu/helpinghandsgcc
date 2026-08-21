import { equippedGear } from "./gear";
import type { Player } from "./lib";

const AURA_GLOW: Record<string, string> = {
  aura_veteran: "0 0 22px 6px rgba(56,189,248,0.45)",
  aura_legend: "0 0 26px 8px rgba(196,132,252,0.55)",
  aura_payout: "0 0 18px 5px rgba(251,191,36,0.45)",
};

const CAPE_TIER_COLOR: Record<number, string> = {
  1: "#4ade80",
  2: "#38bdf8",
  3: "#c084fc",
};

// A blocky, Roblox-style humanoid built entirely from CSS boxes — no image
// assets. `scale` controls overall size (1 = ~56px wide); `ring` highlights
// "this is you"; gear (helmet/cape/weapon/aura) is read from the player's
// permanently-earned unlocks (see gear.ts).
export function Character({
  player,
  scale = 1,
  showName = false,
  ring = false,
  online = false,
}: {
  player: Player;
  scale?: number;
  showName?: boolean;
  ring?: boolean;
  online?: boolean;
}) {
  const gear = equippedGear(player);
  const auraShadow = gear.aura ? AURA_GLOW[gear.aura.id] : undefined;
  const capeColor = gear.cape ? CAPE_TIER_COLOR[gear.cape.tier] : null;
  const u = scale;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative rounded-2xl p-1 ${ring ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950" : ""}`}
        style={{ boxShadow: auraShadow }}
      >
        <div className="relative flex flex-col items-center" style={{ width: 56 * u, height: 84 * u }}>
          {gear.helmet && (
            <span
              className="absolute -top-1 left-1/2 z-20 -translate-x-1/2 drop-shadow"
              style={{ fontSize: 15 * u }}
            >
              {gear.helmet.emoji}
            </span>
          )}

          {capeColor && (
            <div
              className="absolute z-0 rounded-b-full opacity-90"
              style={{
                top: 22 * u,
                width: 32 * u,
                height: 38 * u,
                background: capeColor,
              }}
            />
          )}

          {/* head */}
          <div
            className="relative z-10 rounded-md border border-black/30"
            style={{ width: 22 * u, height: 19 * u, marginTop: 14 * u, background: "#f4c9a0" }}
          >
            <div
              className="absolute flex"
              style={{ top: 8 * u, left: 5 * u, gap: 3 * u }}
            >
              <span style={{ width: 3 * u, height: 3 * u, background: "#1e293b", borderRadius: 1 }} />
              <span style={{ width: 3 * u, height: 3 * u, background: "#1e293b", borderRadius: 1 }} />
            </div>
          </div>

          {/* torso + arms */}
          <div className="relative z-10 flex items-start" style={{ marginTop: 2 * u }}>
            <div
              style={{
                width: 7 * u,
                height: 25 * u,
                background: player.characterColor,
                borderRadius: 3,
                marginRight: 2 * u,
              }}
            />
            <div
              className="rounded-sm border border-black/20"
              style={{ width: 23 * u, height: 27 * u, background: player.characterColor }}
            />
            <div
              style={{
                width: 7 * u,
                height: 25 * u,
                background: player.characterColor,
                borderRadius: 3,
                marginLeft: 2 * u,
              }}
            />
          </div>

          {/* legs */}
          <div className="relative z-10 flex" style={{ marginTop: 1 * u, gap: 2 * u }}>
            <div style={{ width: 9 * u, height: 19 * u, background: "#1e293b", borderRadius: 2 }} />
            <div style={{ width: 9 * u, height: 19 * u, background: "#1e293b", borderRadius: 2 }} />
          </div>

          {gear.weapon && (
            <span
              className="absolute z-20 drop-shadow"
              style={{ right: -5 * u, top: 38 * u, fontSize: 13 * u }}
            >
              {gear.weapon.emoji}
            </span>
          )}

          {online && (
            <span
              className="absolute right-0 top-0 z-30 rounded-full border border-slate-950 bg-lime-400"
              style={{ width: 8 * u, height: 8 * u }}
            />
          )}
        </div>
      </div>

      <div
        className="rounded-full bg-black/40"
        style={{ width: 30 * u, height: 5 * u, marginTop: -2 * u, filter: "blur(1px)" }}
      />

      {showName && (
        <p className="mt-1 max-w-[80px] truncate text-center text-xs font-bold text-slate-200">
          {player.name}
        </p>
      )}
    </div>
  );
}
