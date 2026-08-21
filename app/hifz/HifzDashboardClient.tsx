"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AVATAR_CHOICES,
  CASH_OUT_THRESHOLD,
  CURRENCY_META,
  DAILY_COMPLETE_BONUS_COINS,
  DAILY_COMPLETE_BONUS_GEMS,
  DIFFICULTY_META,
  QUEST_TITLES,
  STORAGE_KEY,
  WEEKDAY_LABELS,
  allTasksDone,
  coinsToCash,
  formatCash,
  getMultiplier,
  getNextRamadanStart,
  localDateString,
  rankPlayers,
  rolloverPlayer,
  taskReward,
  type CashOutRecord,
  type Currency,
  type Difficulty,
  type Player,
  type QuestKey,
} from "./lib";
import { buildDefaultPlayers } from "./seed";

// ── Small building blocks ────────────────────────────────────────────────────

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-16 shrink-0 rounded-full border transition-colors ${
        checked
          ? "border-lime-400 bg-lime-400/20"
          : "border-slate-600 bg-slate-800"
      }`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full transition-transform ${
          checked
            ? "translate-x-9 bg-lime-400 shadow-[0_0_10px_theme(colors.lime.400)]"
            : "translate-x-1 bg-slate-500"
        }`}
      />
    </button>
  );
}

function QuestBlast({ triggerId }: { triggerId: number }) {
  const particles = useMemo(() => {
    if (triggerId === 0) return [];
    return Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * Math.PI * 2 + Math.random() * 0.4;
      const distance = 36 + Math.random() * 36;
      return {
        id: i,
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
        delay: Math.random() * 0.08,
        emoji: ["✨", "💥", "⚡"][i % 3],
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerId]);

  if (particles.length === 0) return null;

  return (
    <div
      key={triggerId}
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="animate-hifz-blast absolute text-lg"
          style={
            {
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              animationDelay: `${p.delay}s`,
            } as React.CSSProperties
          }
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

// ── Ramadan countdown ─────────────────────────────────────────────────────────

function RamadanCountdown({ now }: { now: Date | null }) {
  const target = useMemo(() => getNextRamadanStart(now ?? undefined), [now]);
  const diff = now ? Math.max(0, target.getTime() - now.getTime()) : 0;
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  const secs = Math.floor((diff % 60_000) / 1_000);

  return (
    <div className="rounded-xl border border-amber-400/40 bg-slate-900/70 px-4 py-2.5 text-center shadow-[0_0_18px_rgba(251,191,36,0.15)]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300/80">
        🌙 Ramadan Countdown
      </p>
      <p className="mt-0.5 flex items-baseline justify-center gap-1.5 font-mono text-amber-300">
        <span className="text-xl font-black leading-none">{days}</span>
        <span className="text-[10px] uppercase text-amber-300/60">d</span>
        <span className="text-xl font-black leading-none">
          {String(hours).padStart(2, "0")}
        </span>
        <span className="text-[10px] uppercase text-amber-300/60">h</span>
        <span className="text-xl font-black leading-none">
          {String(mins).padStart(2, "0")}
        </span>
        <span className="text-[10px] uppercase text-amber-300/60">m</span>
        <span className="text-xl font-black leading-none">
          {String(secs).padStart(2, "0")}
        </span>
        <span className="text-[10px] uppercase text-amber-300/60">s</span>
      </p>
      <p className="mt-0.5 text-[9px] text-slate-500">
        {now
          ? `Est. start ${target.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} — pending moon sighting`
          : "Calculating…"}
      </p>
    </div>
  );
}

// ── Player switcher ───────────────────────────────────────────────────────────

function PlayerSwitcher({
  players,
  activeId,
  onSelect,
}: {
  players: Player[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {players.map((p) => {
        const active = p.id === activeId;
        const done = allTasksDone(p.tasks);
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
              active
                ? "border-cyan-400 bg-cyan-400/10 text-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.35)]"
                : "border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-500 hover:text-slate-200"
            }`}
          >
            <span className="text-base">{p.avatar}</span>
            {p.name}
            {p.streak > 0 && (
              <span className="text-xs text-orange-400">
                🔥{p.streak}
              </span>
            )}
            {done && <span className="text-xs text-lime-400">✓</span>}
          </button>
        );
      })}
    </div>
  );
}

// ── Multiplier banner ─────────────────────────────────────────────────────────

function MultiplierBanner({ label, tier }: { label: string | null; tier: string }) {
  if (!label) return null;
  const isVacation = tier === "vacation";
  return (
    <div
      className={`animate-hifz-glow rounded-lg border px-4 py-2 text-center text-sm font-black uppercase tracking-wide ${
        isVacation
          ? "border-fuchsia-400 bg-fuchsia-400/10 text-fuchsia-300"
          : "border-cyan-400 bg-cyan-400/10 text-cyan-300"
      }`}
    >
      {label}
    </div>
  );
}

// ── Quest card ─────────────────────────────────────────────────────────────

function QuestCard({
  questKey,
  player,
  multiplier,
  blastTrigger,
  onComplete,
}: {
  questKey: QuestKey;
  player: Player;
  multiplier: number;
  blastTrigger: number;
  onComplete: (key: QuestKey) => void;
}) {
  const meta = QUEST_TITLES[questKey];
  const difficultyMeta = DIFFICULTY_META[player.difficulty];
  const description = difficultyMeta.quests[questKey];
  const reward = taskReward(player.difficulty, multiplier);
  const done = player.tasks[questKey];

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 transition ${
        done
          ? "border-lime-400/60 bg-lime-400/5"
          : "border-slate-700 bg-slate-900/70 hover:border-slate-500"
      }`}
    >
      <QuestBlast triggerId={blastTrigger} />
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xl">{meta.icon}</p>
          <h3 className="mt-1 text-sm font-black uppercase tracking-wide text-slate-100">
            {meta.title}
          </h3>
          <p className={`text-[11px] font-semibold ${difficultyMeta.accent}`}>
            {meta.subtitle}
          </p>
        </div>
        {done && (
          <span className="rounded-full border border-lime-400 px-2 py-0.5 text-[10px] font-bold uppercase text-lime-400">
            Secured
          </span>
        )}
      </div>

      <p className="mt-3 text-sm text-slate-300">{description}</p>

      <div className="mt-4 flex items-center justify-between">
        <p className="font-mono text-xs text-slate-400">
          +{reward.coins}
          <span className="text-amber-400">◎</span> · +{reward.gems}
          <span className="text-fuchsia-400">♦</span>
        </p>
        <button
          type="button"
          disabled={done}
          onClick={() => onComplete(questKey)}
          className={`rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
            done
              ? "cursor-default bg-slate-800 text-slate-500"
              : "bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:scale-95"
          }`}
        >
          {done ? "✓ Complete" : "Deploy"}
        </button>
      </div>
    </div>
  );
}

// ── Vault panel ────────────────────────────────────────────────────────────

function VaultPanel({
  player,
  onCashOut,
}: {
  player: Player;
  onCashOut: () => void;
}) {
  const cashEquiv = coinsToCash(player.vaultCoins, player.currency);
  const canCashOut = player.vaultCoins >= CASH_OUT_THRESHOLD;
  const progress = Math.min(100, (player.vaultCoins / CASH_OUT_THRESHOLD) * 100);

  return (
    <div className="rounded-xl border border-amber-400/30 bg-slate-900/70 p-4">
      <h3 className="text-xs font-black uppercase tracking-widest text-amber-300">
        💰 Real Cash Vault
      </h3>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-2xl font-black text-amber-300">
            {player.vaultCoins.toLocaleString()}
            <span className="ml-1 text-sm text-amber-400">Defense Coins</span>
          </p>
          <p className="text-sm text-slate-400">
            Equiv. to{" "}
            <span className="font-semibold text-slate-200">
              {formatCash(cashEquiv, player.currency)}
            </span>
          </p>
        </div>
        <p className="font-mono text-lg text-fuchsia-300">
          {player.gems.toLocaleString()} <span className="text-sm">♦ Gems</span>
        </p>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-lime-400 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-slate-500">
        {canCashOut
          ? "Threshold reached — ready to cash out!"
          : `${(CASH_OUT_THRESHOLD - player.vaultCoins).toLocaleString()} coins to next cash-out threshold`}
      </p>

      <button
        type="button"
        disabled={!canCashOut}
        onClick={onCashOut}
        className={`mt-4 w-full rounded-md py-2 text-sm font-black uppercase tracking-wide transition ${
          canCashOut
            ? "bg-amber-400 text-slate-950 hover:bg-amber-300 active:scale-[0.98]"
            : "cursor-not-allowed bg-slate-800 text-slate-500"
        }`}
      >
        Request Cash Out
      </button>
    </div>
  );
}

// ── Cash-out voucher modal ────────────────────────────────────────────────────

function CashOutModal({
  record,
  onClose,
}: {
  record: CashOutRecord;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="animate-hifz-scale-in relative w-full max-w-sm rounded-2xl border-2 border-dashed border-amber-400 bg-slate-900 p-6 text-center shadow-[0_0_40px_rgba(251,191,36,0.35)]">
        <p className="text-4xl">🎟️</p>
        <h2 className="mt-2 text-lg font-black uppercase tracking-wide text-amber-300">
          Cash-Out Voucher
        </h2>
        <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">
          Family Command Center Receipt
        </p>

        <div className="mt-4 space-y-1 rounded-lg border border-slate-700 bg-slate-950/60 p-4 text-left text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Coins redeemed</span>
            <span className="font-mono text-slate-100">
              {record.coins.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Cash value</span>
            <span className="font-mono font-bold text-lime-400">
              {formatCash(record.amount, record.currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Date</span>
            <span className="font-mono text-slate-100">{record.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Voucher #</span>
            <span className="font-mono text-slate-100">
              {record.id.slice(-8).toUpperCase()}
            </span>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Show this voucher to a parent to redeem the real-world payout.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-md bg-amber-400 py-2 text-sm font-black uppercase tracking-wide text-slate-950 hover:bg-amber-300"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ── Settings modal ────────────────────────────────────────────────────────────

function SettingsModal({
  player,
  onSave,
  onClose,
}: {
  player: Player;
  onSave: (updates: Partial<Player>) => void;
  onClose: () => void;
}) {
  const [avatar, setAvatar] = useState(player.avatar);
  const [currency, setCurrency] = useState<Currency>(player.currency);
  const [difficulty, setDifficulty] = useState<Difficulty>(player.difficulty);
  const [focus, setFocus] = useState(player.focus);
  const [weekendDays, setWeekendDays] = useState<number[]>(player.weekendDays);

  function toggleDay(day: number) {
    setWeekendDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="animate-hifz-scale-in max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <h2 className="text-lg font-black uppercase tracking-wide text-cyan-300">
          ⚙️ {player.name} — Settings
        </h2>

        <div className="mt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            Role Avatar
          </p>
          <div className="flex flex-wrap gap-2">
            {AVATAR_CHOICES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border text-lg transition ${
                  avatar === a
                    ? "border-cyan-400 bg-cyan-400/10"
                    : "border-slate-700 hover:border-slate-500"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            Difficulty Preset
          </p>
          <div className="space-y-2">
            {(Object.keys(DIFFICULTY_META) as Difficulty[]).map((d) => {
              const meta = DIFFICULTY_META[d];
              const active = difficulty === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`w-full rounded-lg border p-2.5 text-left transition ${
                    active
                      ? `border-current ${meta.accent} bg-white/5`
                      : "border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <p className="text-sm font-bold">{meta.label}</p>
                  <p className="text-[11px] opacity-80">
                    {meta.tagline} · {meta.session}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            Local Currency
          </p>
          <div className="flex gap-2">
            {(Object.keys(CURRENCY_META) as Currency[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`flex-1 rounded-md border py-2 text-sm font-semibold transition ${
                  currency === c
                    ? "border-lime-400 bg-lime-400/10 text-lime-300"
                    : "border-slate-700 text-slate-400 hover:border-slate-500"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            Weekend Days (1.5x)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAY_LABELS.map((label, day) => (
              <button
                key={label}
                type="button"
                onClick={() => toggleDay(day)}
                className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition ${
                  weekendDays.includes(day)
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                    : "border-slate-700 text-slate-400 hover:border-slate-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <label
            htmlFor="hifz-focus"
            className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400"
          >
            Custom Hifz Focus
          </label>
          <textarea
            id="hifz-focus"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
            placeholder="e.g. Protecting Juzz 23-30, Attacking Chapter 22"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border border-slate-700 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onSave({ avatar, currency, difficulty, focus, weekendDays })
            }
            className="flex-1 rounded-md bg-cyan-500 py-2 text-sm font-black uppercase tracking-wide text-slate-950 hover:bg-cyan-400"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Leaderboard ────────────────────────────────────────────────────────────

function Leaderboard({ players }: { players: Player[] }) {
  const ranked = rankPlayers(players);
  const medals = ["🥇", "🥈", "🥉", "🎖️"];

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
        🏆 Family Leaderboard
      </h3>
      <ul className="mt-3 space-y-2">
        {ranked.map((p, i) => (
          <li
            key={p.id}
            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{medals[i] ?? "🎖️"}</span>
              <span className="text-base">{p.avatar}</span>
              <div>
                <p className="text-sm font-semibold text-slate-100">{p.name}</p>
                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                  {DIFFICULTY_META[p.difficulty].label} · Lv.{p.baseDefenseLevel}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-orange-400">🔥 {p.streak}</p>
              <p className="font-mono text-[10px] text-amber-400">
                {p.totalCoinsEarned.toLocaleString()}◎
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Family power bar ───────────────────────────────────────────────────────

function FamilyPowerBar({ players }: { players: Player[] }) {
  const totalPower = players.reduce((sum, p) => sum + p.baseDefenseLevel, 0);
  const step = 20;
  const familyLevel = Math.floor(totalPower / step) + 1;
  const progress = ((totalPower % step) / step) * 100;
  const allSynced = players.length > 0 && players.every((p) => allTasksDone(p.tasks));

  return (
    <div
      className={`rounded-xl border p-4 ${
        allSynced
          ? "animate-hifz-glow border-lime-400 bg-lime-400/5 text-lime-300"
          : "border-slate-700 bg-slate-900/70"
      }`}
    >
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
        🏙️ Total Family City Power
      </h3>
      <p className="mt-1 font-mono text-xl font-black text-slate-100">
        Level {familyLevel}{" "}
        <span className="text-sm font-normal text-slate-400">
          ({totalPower} total power)
        </span>
      </p>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-lime-400 to-fuchsia-400 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      {allSynced && (
        <p className="mt-2 text-xs font-bold uppercase tracking-wide text-lime-300">
          🛰️ Full Squad Sync — every cousin deployed today!
        </p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function HifzDashboardClient() {
  const [players, setPlayers] = useState<Player[]>(() => buildDefaultPlayers());
  const [activeId, setActiveId] = useState<string>("zayn");
  const [loaded, setLoaded] = useState(false);
  // Starts null so the server-rendered markup and the pre-hydration client
  // render match exactly — the real clock only kicks in after mount.
  const [now, setNow] = useState<Date | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [voucher, setVoucher] = useState<CashOutRecord | null>(null);
  const [blastKeys, setBlastKeys] = useState<Record<QuestKey, number>>({
    shields: 0,
    recon: 0,
    perimeter: 0,
  });
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);

  // Load persisted state on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { players?: Player[]; activeId?: string };
        if (Array.isArray(parsed.players) && parsed.players.length > 0) {
          const today = localDateString(new Date());
          setPlayers(parsed.players.map((p) => rolloverPlayer(p, today)));
          if (parsed.activeId) setActiveId(parsed.activeId);
          setLoaded(true);
          return;
        }
      }
    } catch {
      // corrupt storage — fall through to defaults
    }
    const today = localDateString(new Date());
    setPlayers((prev) => prev.map((p) => rolloverPlayer(p, today)));
    setLoaded(true);
  }, []);

  // Persist on change (after initial load completes).
  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ players, activeId }));
    } catch {
      // storage full/unavailable — ignore
    }
  }, [players, activeId, loaded]);

  // Live clock tick, drives the Ramadan countdown & weekend detection.
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const todayStr = useMemo(() => (now ? localDateString(now) : ""), [now]);

  // Roll daily quests over whenever the calendar day changes (skip until
  // the live clock has actually mounted and produced a real date).
  useEffect(() => {
    if (!todayStr) return;
    setPlayers((prev) => {
      const rolled = prev.map((p) => rolloverPlayer(p, todayStr));
      return rolled.some((p, i) => p !== prev[i]) ? rolled : prev;
    });
  }, [todayStr]);

  // Auto-dismiss reward toast.
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2300);
    return () => clearTimeout(id);
  }, [toast]);

  const activePlayer = players.find((p) => p.id === activeId) ?? players[0];
  const multiplierState = getMultiplier(activePlayer, now ?? undefined);

  function handleCompleteQuest(questKey: QuestKey) {
    const player = activePlayer;
    if (!player || player.tasks[questKey]) return;

    const { multiplier } = getMultiplier(player, now ?? undefined);
    const reward = taskReward(player.difficulty, multiplier);
    const nextTasks = { ...player.tasks, [questKey]: true };
    const justCompletedAll = allTasksDone(nextTasks);
    const bonusCoins = justCompletedAll
      ? Math.round(DAILY_COMPLETE_BONUS_COINS * multiplier)
      : 0;
    const bonusGems = justCompletedAll
      ? Math.round(DAILY_COMPLETE_BONUS_GEMS * multiplier)
      : 0;
    const coinsGained = reward.coins + bonusCoins;
    const gemsGained = reward.gems + bonusGems;
    const nextStreak = justCompletedAll ? player.streak + 1 : player.streak;

    setPlayers((prev) =>
      prev.map((p) =>
        p.id !== player.id
          ? p
          : {
              ...p,
              tasks: nextTasks,
              vaultCoins: p.vaultCoins + coinsGained,
              gems: p.gems + gemsGained,
              totalCoinsEarned: p.totalCoinsEarned + coinsGained,
              streak: nextStreak,
              bestStreak: Math.max(p.bestStreak, nextStreak),
              baseDefenseLevel: justCompletedAll
                ? p.baseDefenseLevel + 1
                : p.baseDefenseLevel,
            }
      )
    );
    setBlastKeys((prev) => ({ ...prev, [questKey]: prev[questKey] + 1 }));
    setToast({
      id: Date.now(),
      text: `+${coinsGained} Coins   +${gemsGained} Gems${
        justCompletedAll ? "   •   DAILY OPS COMPLETE" : ""
      }`,
    });
  }

  function handleCashOut() {
    const player = activePlayer;
    if (!player || player.vaultCoins < CASH_OUT_THRESHOLD) return;
    const coins = player.vaultCoins;
    const amount = coinsToCash(coins, player.currency);
    const record: CashOutRecord = {
      id: `${player.id}-${Date.now()}`,
      date: todayStr || localDateString(new Date()),
      coins,
      amount,
      currency: player.currency,
    };
    setPlayers((prev) =>
      prev.map((p) =>
        p.id !== player.id
          ? p
          : {
              ...p,
              vaultCoins: 0,
              cashOutHistory: [record, ...p.cashOutHistory].slice(0, 10),
            }
      )
    );
    setVoucher(record);
  }

  function handleToggleVacation(id: string) {
    setPlayers((prev) =>
      prev.map((p) => (p.id !== id ? p : { ...p, vacationMode: !p.vacationMode }))
    );
  }

  function handleSaveSettings(updates: Partial<Player>) {
    setPlayers((prev) =>
      prev.map((p) => (p.id !== activeId ? p : { ...p, ...updates }))
    );
    setSettingsOpen(false);
  }

  if (!activePlayer) return null;

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.08),_transparent_60%)] pb-16 text-slate-200">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-400">
              Missiles vs Hifz
            </p>
            <h1 className="text-2xl font-black uppercase tracking-wide text-slate-50 drop-shadow-[0_0_16px_rgba(34,211,238,0.5)] sm:text-3xl">
              Hifz Command Center
            </h1>
          </div>
          <RamadanCountdown now={now} />
        </div>

        <div className="mt-6">
          <PlayerSwitcher players={players} activeId={activeId} onSelect={setActiveId} />
        </div>

        {/* ── Main grid ──────────────────────────────────────────────── */}
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {/* Player header card */}
            <div
              className={`rounded-xl border p-5 ${
                multiplierState.tier !== "none"
                  ? multiplierState.tier === "vacation"
                    ? "animate-hifz-glow border-fuchsia-400 text-fuchsia-300"
                    : "animate-hifz-glow border-cyan-400 text-cyan-300"
                  : "border-slate-700"
              } bg-slate-900/70`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-3xl">
                    {activePlayer.avatar}
                  </span>
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-wide text-slate-50">
                      {activePlayer.name}
                    </h2>
                    <p
                      className={`text-xs font-bold uppercase tracking-widest ${DIFFICULTY_META[activePlayer.difficulty].accent}`}
                    >
                      {DIFFICULTY_META[activePlayer.difficulty].label} ·{" "}
                      {activePlayer.currency}
                    </p>
                    <p className="mt-1 max-w-md text-sm text-slate-400">
                      {activePlayer.focus}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  ⚙️ Settings
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-4">
                <div className="flex items-center gap-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">
                      Streak
                    </p>
                    <p className="font-mono text-lg font-bold text-orange-400">
                      🔥 {activePlayer.streak} days
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">
                      Base Defense
                    </p>
                    <p className="font-mono text-lg font-bold text-lime-400">
                      Lv. {activePlayer.baseDefenseLevel}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-300">
                    🌴 Vacation Mode
                  </span>
                  <ToggleSwitch
                    checked={activePlayer.vacationMode}
                    onChange={() => handleToggleVacation(activePlayer.id)}
                  />
                </div>
              </div>
            </div>

            <MultiplierBanner label={multiplierState.label} tier={multiplierState.tier} />

            {/* Quests */}
            <div className="grid gap-4 sm:grid-cols-3">
              {(["shields", "recon", "perimeter"] as QuestKey[]).map((key) => (
                <QuestCard
                  key={key}
                  questKey={key}
                  player={activePlayer}
                  multiplier={multiplierState.multiplier}
                  blastTrigger={blastKeys[key]}
                  onComplete={handleCompleteQuest}
                />
              ))}
            </div>

            <VaultPanel player={activePlayer} onCashOut={handleCashOut} />
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <FamilyPowerBar players={players} />
            <Leaderboard players={players} />
          </div>
        </div>
      </div>

      {settingsOpen && (
        <SettingsModal
          player={activePlayer}
          onSave={handleSaveSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {voucher && <CashOutModal record={voucher} onClose={() => setVoucher(null)} />}

      {toast && (
        <div
          key={toast.id}
          className="animate-hifz-toast fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-lime-400 bg-slate-900 px-5 py-2.5 text-sm font-bold text-lime-300 shadow-[0_0_20px_rgba(163,230,53,0.4)]"
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
