"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CASH_OUT_THRESHOLD,
  CHARACTER_COLORS,
  CURRENCY_META,
  DAILY_COMPLETE_BONUS_COINS,
  DAILY_COMPLETE_BONUS_GEMS,
  DIFFICULTY_META,
  QUEST_TITLES,
  WEEKDAY_LABELS,
  allTasksDone,
  coinsToCash,
  formatCash,
  getMultiplier,
  getNextRamadanStart,
  localDateString,
  rankPlayers,
  taskReward,
  type CashOutRecord,
  type Currency,
  type Difficulty,
  type MemorizationEntry,
  type Player,
  type QuestKey,
} from "./lib";
import {
  SURAHS,
  TOTAL_AYAHS,
  advancePosition,
  formatPosition,
  juzForPosition,
  rangeAyahCount,
  surahByNumber,
} from "./quran";
import { GearItem, computeUnlockUpdate } from "./gear";
import { Character } from "./Character";
import { FamilyGate } from "./FamilyGate";
import { CharacterSelect } from "./CharacterSelect";
import { ApiError, hifzApi } from "./api";

function isOnline(player: Player): boolean {
  const diff = Date.now() - new Date(player.updatedAt).getTime();
  return diff >= 0 && diff < 3 * 60 * 1000;
}

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
  disabled,
  onComplete,
}: {
  questKey: QuestKey;
  player: Player;
  multiplier: number;
  blastTrigger: number;
  disabled: boolean;
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
          disabled={done || disabled}
          onClick={() => onComplete(questKey)}
          className={`rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
            done || disabled
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

// ── Memorization progress ───────────────────────────────────────────────────

function MemorizationProgress({ player }: { player: Player }) {
  const totalMemorized = player.memorizationLog.reduce(
    (sum, e) => sum + e.ayahCount,
    0
  );
  const percent = Math.min(100, (totalMemorized / TOTAL_AYAHS) * 100);
  const juz = juzForPosition(player.currentSurah, player.currentAyah);
  const recent = [...player.memorizationLog].reverse().slice(0, 4);

  return (
    <div className="rounded-xl border border-lime-400/30 bg-slate-900/70 p-4">
      <h3 className="text-xs font-black uppercase tracking-widest text-lime-300">
        📖 Memorization Progress
      </h3>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-2xl font-black text-lime-300">
            {totalMemorized.toLocaleString()}
            <span className="ml-1 text-sm text-lime-400/80">/ {TOTAL_AYAHS} Ayahs</span>
          </p>
          <p className="text-sm text-slate-400">
            Currently up to{" "}
            <span className="font-semibold text-slate-200">
              {formatPosition(player.currentSurah, player.currentAyah)}
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-cyan-300">{percent.toFixed(1)}%</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-500">
            Juz {juz.number} · &ldquo;{juz.name}&rdquo;
          </p>
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-lime-500 to-cyan-400 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      {recent.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {recent.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs"
            >
              <span className="text-slate-400">{entry.date}</span>
              <span className="text-slate-200">
                {formatPosition(entry.fromSurah, entry.fromAyah)} →{" "}
                {formatPosition(entry.toSurah, entry.toAyah)}
              </span>
              <span className="font-mono text-lime-400">+{entry.ayahCount}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Log memorization modal ────────────────────────────────────────────────────

function SurahSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
    >
      {SURAHS.map((s) => (
        <option key={s.number} value={s.number}>
          {s.number}. {s.name} — {s.ayahCount} ayahs
        </option>
      ))}
    </select>
  );
}

function LogMemorizationModal({
  player,
  reward,
  onConfirm,
  onClose,
}: {
  player: Player;
  reward: { coins: number; gems: number };
  onConfirm: (
    fromSurah: number,
    fromAyah: number,
    toSurah: number,
    toAyah: number
  ) => void;
  onClose: () => void;
}) {
  const suggested = advancePosition(
    player.currentSurah,
    player.currentAyah,
    DIFFICULTY_META[player.difficulty].suggestedAyahs
  );
  const [fromSurah, setFromSurah] = useState(player.currentSurah);
  const [fromAyah, setFromAyah] = useState(player.currentAyah);
  const [toSurah, setToSurah] = useState(suggested.surah);
  const [toAyah, setToAyah] = useState(suggested.ayah);

  const span = rangeAyahCount(fromSurah, fromAyah, toSurah, toAyah);
  const fromMax = surahByNumber(fromSurah).ayahCount;
  const toMax = surahByNumber(toSurah).ayahCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="animate-hifz-scale-in w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <h2 className="text-lg font-black uppercase tracking-wide text-cyan-300">
          🚀 Launch Recon Strike
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Log exactly what {player.name} memorized today.
        </p>

        <div className="mt-4">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-slate-400">
            From
          </p>
          <div className="flex gap-2">
            <div className="flex-[3]">
              <SurahSelect id="from-surah" value={fromSurah} onChange={setFromSurah} />
            </div>
            <input
              type="number"
              min={1}
              max={fromMax}
              value={fromAyah}
              onChange={(e) => setFromAyah(Number(e.target.value))}
              className="w-20 rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-center text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-3">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-slate-400">
            To
          </p>
          <div className="flex gap-2">
            <div className="flex-[3]">
              <SurahSelect id="to-surah" value={toSurah} onChange={setToSurah} />
            </div>
            <input
              type="number"
              min={1}
              max={toMax}
              value={toAyah}
              onChange={(e) => setToAyah(Number(e.target.value))}
              className="w-20 rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-center text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm">
          <span className="text-slate-400">Span logged</span>
          <span className="font-mono font-bold text-lime-400">{span} ayahs</span>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border border-slate-700 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(fromSurah, fromAyah, toSurah, toAyah)}
            className="flex-1 rounded-md bg-cyan-500 py-2 text-sm font-black uppercase tracking-wide text-slate-950 hover:bg-cyan-400"
          >
            Confirm · +{reward.coins}◎ +{reward.gems}♦
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Vault panel ────────────────────────────────────────────────────────────

function VaultPanel({
  player,
  disabled,
  onCashOut,
}: {
  player: Player;
  disabled: boolean;
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
        disabled={!canCashOut || disabled}
        onClick={onCashOut}
        className={`mt-4 w-full rounded-md py-2 text-sm font-black uppercase tracking-wide transition ${
          canCashOut && !disabled
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

// ── Unlock celebration modal ───────────────────────────────────────────────────

function UnlockModal({ item, onClose }: { item: GearItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="animate-hifz-scale-in animate-hifz-glow w-full max-w-sm rounded-2xl border-2 border-fuchsia-400 bg-slate-900 p-6 text-center text-fuchsia-300 shadow-[0_0_40px_rgba(232,121,249,0.4)]">
        <p className="text-5xl">{item.emoji}</p>
        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.3em] text-fuchsia-400/80">
          New Gear Unlocked
        </p>
        <h2 className="mt-1 text-xl font-black uppercase tracking-wide text-slate-50">
          {item.name}
        </h2>
        <p className="mt-1 text-sm text-slate-400">{item.description}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-md bg-fuchsia-500 py-2 text-sm font-black uppercase tracking-wide text-slate-950 hover:bg-fuchsia-400"
        >
          Equip
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
  const [characterColor, setCharacterColor] = useState(player.characterColor);
  const [currency, setCurrency] = useState<Currency>(player.currency);
  const [difficulty, setDifficulty] = useState<Difficulty>(player.difficulty);
  const [focus, setFocus] = useState(player.focus);
  const [weekendDays, setWeekendDays] = useState<number[]>(player.weekendDays);
  const [currentSurah, setCurrentSurah] = useState(player.currentSurah);
  const [currentAyah, setCurrentAyah] = useState(player.currentAyah);

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
            Character Color
          </p>
          <div className="flex flex-wrap gap-2">
            {CHARACTER_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCharacterColor(c)}
                style={{ background: c }}
                className={`h-9 w-9 rounded-lg border-2 transition ${
                  characterColor === c
                    ? "border-white scale-110"
                    : "border-transparent hover:scale-105"
                }`}
              />
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

        <div className="mt-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            Current Position (manual correction)
          </p>
          <div className="flex gap-2">
            <div className="flex-[3]">
              <SurahSelect
                id="current-surah"
                value={currentSurah}
                onChange={setCurrentSurah}
              />
            </div>
            <input
              type="number"
              min={1}
              max={surahByNumber(currentSurah).ayahCount}
              value={currentAyah}
              onChange={(e) => setCurrentAyah(Number(e.target.value))}
              className="w-20 rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-center text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Only adjust this to fix drift — normal progress is logged via the
            &ldquo;Launch Recon Strike&rdquo; quest instead.
          </p>
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
              onSave({
                characterColor,
                currency,
                difficulty,
                focus,
                weekendDays,
                currentSurah,
                currentAyah,
              })
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
              <Character player={p} scale={0.4} online={isOnline(p)} />
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

// ── Family base ──────────────────────────────────────────────────────────────

function FamilyBase({ players, activeId }: { players: Player[]; activeId: string }) {
  const totalPower = players.reduce((sum, p) => sum + p.baseDefenseLevel, 0);
  const step = 20;
  const familyLevel = Math.floor(totalPower / step) + 1;
  const progress = ((totalPower % step) / step) * 100;
  const allSynced = players.length > 0 && players.every((p) => allTasksDone(p.tasks));
  const onlineCount = players.filter(isOnline).length;

  const tierBg =
    familyLevel >= 4
      ? "from-slate-900 via-fuchsia-950/40 to-slate-950"
      : familyLevel >= 3
        ? "from-slate-900 via-lime-950/30 to-slate-950"
        : familyLevel >= 2
          ? "from-slate-900 via-cyan-950/30 to-slate-950"
          : "from-slate-900 to-slate-950";

  return (
    <div
      className={`rounded-xl border bg-gradient-to-b p-4 ${tierBg} ${
        allSynced ? "animate-hifz-glow border-lime-400 text-lime-300" : "border-slate-700"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
          🏙️ Family Base — Level {familyLevel}
        </h3>
        <span className="text-[10px] text-slate-500">
          {onlineCount > 0 ? `● ${onlineCount} online now` : `${totalPower} total power`}
        </span>
      </div>

      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-lime-400 to-fuchsia-400 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-around gap-3 rounded-lg border border-slate-800 bg-slate-950/40 px-2 py-4">
        {players.map((p) => (
          <Character
            key={p.id}
            player={p}
            scale={0.85}
            showName
            ring={p.id === activeId}
            online={isOnline(p)}
          />
        ))}
      </div>

      {allSynced && (
        <p className="mt-3 text-center text-xs font-bold uppercase tracking-wide text-lime-300">
          🛰️ Full Squad Sync — every cousin deployed today!
        </p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type BootStatus = "checking" | "locked" | "unlocked" | "error";

export function HifzDashboardClient() {
  const [status, setStatus] = useState<BootStatus>("checking");
  const [bootError, setBootError] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [meChecked, setMeChecked] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [voucher, setVoucher] = useState<CashOutRecord | null>(null);
  const [unlockedItem, setUnlockedItem] = useState<GearItem | null>(null);
  const [blastKeys, setBlastKeys] = useState<Record<QuestKey, number>>({
    shields: 0,
    recon: 0,
    perimeter: 0,
  });
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [errorToast, setErrorToast] = useState<{ id: number; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  const bootstrap = useCallback(async () => {
    setStatus("checking");
    setBootError(null);
    try {
      const { players: fetched } = await hifzApi.state();
      setPlayers(fetched);
      setStatus("unlocked");
      try {
        const { player } = await hifzApi.me();
        if (player) setActiveId(player.id);
      } finally {
        setMeChecked(true);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setStatus("locked");
      } else {
        setBootError(
          err instanceof Error ? err.message : "Couldn't reach the command center"
        );
        setStatus("error");
      }
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // Live clock tick, drives the Ramadan countdown & weekend detection.
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Poll the shared family state so every cousin's device stays in sync.
  useEffect(() => {
    if (status !== "unlocked") return;
    const id = setInterval(() => {
      hifzApi
        .state()
        .then(({ players: fetched }) => setPlayers(fetched))
        .catch(() => {
          /* transient network hiccup — next poll will retry */
        });
    }, 15_000);
    return () => clearInterval(id);
  }, [status]);

  const todayStr = useMemo(() => (now ? localDateString(now) : ""), [now]);

  // Auto-dismiss toasts.
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2300);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    if (!errorToast) return;
    const id = setTimeout(() => setErrorToast(null), 3500);
    return () => clearTimeout(id);
  }, [errorToast]);

  const activePlayer = players.find((p) => p.id === activeId) ?? null;
  const multiplierState = activePlayer
    ? getMultiplier(activePlayer, now ?? undefined)
    : { multiplier: 1, label: null, tier: "none" as const };

  async function applyPatch(fields: Record<string, unknown>) {
    const { player } = await hifzApi.patchPlayer(fields);
    setPlayers((prev) => prev.map((p) => (p.id === player.id ? player : p)));
    return player;
  }

  async function handleCompleteQuest(questKey: QuestKey, extra: Partial<Player> = {}) {
    const player = activePlayer;
    if (!player || player.tasks[questKey] || pending) return;
    setPending(true);
    try {
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

      const prospective: Player = {
        ...player,
        ...extra,
        tasks: nextTasks,
        vaultCoins: player.vaultCoins + coinsGained,
        gems: player.gems + gemsGained,
        totalCoinsEarned: player.totalCoinsEarned + coinsGained,
        streak: nextStreak,
        bestStreak: Math.max(player.bestStreak, nextStreak),
        baseDefenseLevel: justCompletedAll
          ? player.baseDefenseLevel + 1
          : player.baseDefenseLevel,
      };
      const { unlocks, newlyUnlocked } = computeUnlockUpdate(prospective);

      await applyPatch({
        ...extra,
        tasks: prospective.tasks,
        vaultCoins: prospective.vaultCoins,
        gems: prospective.gems,
        totalCoinsEarned: prospective.totalCoinsEarned,
        streak: prospective.streak,
        bestStreak: prospective.bestStreak,
        baseDefenseLevel: prospective.baseDefenseLevel,
        unlocks,
      });

      setBlastKeys((prev) => ({ ...prev, [questKey]: prev[questKey] + 1 }));
      setToast({
        id: Date.now(),
        text: `+${coinsGained} Coins   +${gemsGained} Gems${
          justCompletedAll ? "   •   DAILY OPS COMPLETE" : ""
        }`,
      });
      if (newlyUnlocked.length > 0) setUnlockedItem(newlyUnlocked[0]);
    } catch (err) {
      setErrorToast({
        id: Date.now(),
        text: err instanceof Error ? err.message : "Couldn't save — try again",
      });
    } finally {
      setPending(false);
    }
  }

  function handleDeployQuest(questKey: QuestKey) {
    if (questKey === "recon") {
      setLogModalOpen(true);
      return;
    }
    handleCompleteQuest(questKey);
  }

  function handleLogMemorization(
    fromSurah: number,
    fromAyah: number,
    toSurah: number,
    toAyah: number
  ) {
    const player = activePlayer;
    if (!player) return;
    const entry: MemorizationEntry = {
      id: `${player.id}-log-${Date.now()}`,
      date: todayStr || localDateString(new Date()),
      fromSurah,
      fromAyah,
      toSurah,
      toAyah,
      ayahCount: rangeAyahCount(fromSurah, fromAyah, toSurah, toAyah),
    };
    setLogModalOpen(false);
    handleCompleteQuest("recon", {
      currentSurah: toSurah,
      currentAyah: toAyah,
      memorizationLog: [...player.memorizationLog, entry],
    });
  }

  async function handleCashOut() {
    const player = activePlayer;
    if (!player || player.vaultCoins < CASH_OUT_THRESHOLD || pending) return;
    setPending(true);
    try {
      const coins = player.vaultCoins;
      const amount = coinsToCash(coins, player.currency);
      const record: CashOutRecord = {
        id: `${player.id}-${Date.now()}`,
        date: todayStr || localDateString(new Date()),
        coins,
        amount,
        currency: player.currency,
      };
      const prospective: Player = {
        ...player,
        vaultCoins: 0,
        cashOutHistory: [record, ...player.cashOutHistory].slice(0, 10),
      };
      const { unlocks, newlyUnlocked } = computeUnlockUpdate(prospective);
      await applyPatch({
        vaultCoins: 0,
        cashOutHistory: prospective.cashOutHistory,
        unlocks,
      });
      setVoucher(record);
      if (newlyUnlocked.length > 0) setUnlockedItem(newlyUnlocked[0]);
    } catch (err) {
      setErrorToast({
        id: Date.now(),
        text: err instanceof Error ? err.message : "Couldn't save — try again",
      });
    } finally {
      setPending(false);
    }
  }

  async function handleToggleVacation() {
    const player = activePlayer;
    if (!player || pending) return;
    setPending(true);
    try {
      await applyPatch({ vacationMode: !player.vacationMode });
    } catch (err) {
      setErrorToast({
        id: Date.now(),
        text: err instanceof Error ? err.message : "Couldn't save — try again",
      });
    } finally {
      setPending(false);
    }
  }

  async function handleSaveSettings(updates: Partial<Player>) {
    try {
      await applyPatch(updates);
      setSettingsOpen(false);
    } catch (err) {
      setErrorToast({
        id: Date.now(),
        text: err instanceof Error ? err.message : "Couldn't save — try again",
      });
    }
  }

  async function handleSwitchCharacter() {
    await hifzApi.playerLogout().catch(() => {});
    setActiveId(null);
  }

  async function handleFamilyLogout() {
    await hifzApi.familyLogout().catch(() => {});
    setStatus("locked");
    setActiveId(null);
    setPlayers([]);
    setMeChecked(false);
  }

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-400">
        Booting command center…
      </div>
    );
  }

  if (status === "locked") {
    return <FamilyGate onUnlock={bootstrap} />;
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-950 px-4 text-center text-slate-300">
        <p className="text-3xl">📡</p>
        <p className="text-sm font-semibold">Couldn&rsquo;t reach the command center</p>
        <p className="max-w-xs text-xs text-slate-500">{bootError}</p>
        <button
          type="button"
          onClick={bootstrap}
          className="mt-2 rounded-md border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!meChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-400">
        Checking for an active session…
      </div>
    );
  }

  if (!activeId || !activePlayer) {
    return <CharacterSelect players={players} onSignedIn={(p) => {
      setPlayers((prev) => prev.map((x) => (x.id === p.id ? p : x)));
      setActiveId(p.id);
    }} />;
  }

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
          <div className="flex items-center gap-3">
            <RamadanCountdown now={now} />
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={handleSwitchCharacter}
                className="rounded-md border border-slate-700 px-2.5 py-1 text-[10px] font-semibold text-slate-400 hover:bg-slate-800"
              >
                Switch Character
              </button>
              <button
                type="button"
                onClick={handleFamilyLogout}
                className="rounded-md border border-slate-700 px-2.5 py-1 text-[10px] font-semibold text-slate-400 hover:bg-slate-800"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <FamilyBase players={players} activeId={activeId} />
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
                  <Character player={activePlayer} scale={1.3} ring />
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
                    onChange={handleToggleVacation}
                  />
                </div>
              </div>
            </div>

            <MultiplierBanner label={multiplierState.label} tier={multiplierState.tier} />

            <MemorizationProgress player={activePlayer} />

            {/* Quests */}
            <div className="grid gap-4 sm:grid-cols-3">
              {(["shields", "recon", "perimeter"] as QuestKey[]).map((key) => (
                <QuestCard
                  key={key}
                  questKey={key}
                  player={activePlayer}
                  multiplier={multiplierState.multiplier}
                  blastTrigger={blastKeys[key]}
                  disabled={pending}
                  onComplete={handleDeployQuest}
                />
              ))}
            </div>

            <VaultPanel player={activePlayer} disabled={pending} onCashOut={handleCashOut} />
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
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

      {logModalOpen && (
        <LogMemorizationModal
          player={activePlayer}
          reward={taskReward(activePlayer.difficulty, multiplierState.multiplier)}
          onConfirm={handleLogMemorization}
          onClose={() => setLogModalOpen(false)}
        />
      )}

      {unlockedItem && (
        <UnlockModal item={unlockedItem} onClose={() => setUnlockedItem(null)} />
      )}

      {toast && (
        <div
          key={toast.id}
          className="animate-hifz-toast fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-lime-400 bg-slate-900 px-5 py-2.5 text-sm font-bold text-lime-300 shadow-[0_0_20px_rgba(163,230,53,0.4)]"
        >
          {toast.text}
        </div>
      )}

      {errorToast && (
        <div
          key={errorToast.id}
          className="animate-hifz-toast fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-red-400 bg-slate-900 px-5 py-2.5 text-sm font-bold text-red-300 shadow-[0_0_20px_rgba(248,113,113,0.4)]"
        >
          ⚠ {errorToast.text}
        </div>
      )}
    </div>
  );
}
