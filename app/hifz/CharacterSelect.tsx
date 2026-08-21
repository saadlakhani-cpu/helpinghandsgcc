"use client";

import { useState } from "react";
import { Character } from "./Character";
import { hifzApi } from "./api";
import type { Player } from "./lib";

function isOnline(player: Player): boolean {
  const diff = Date.now() - new Date(player.updatedAt).getTime();
  return diff >= 0 && diff < 3 * 60 * 1000;
}

export function CharacterSelect({
  players,
  onSignedIn,
}: {
  players: Player[];
  onSignedIn: (player: Player) => void;
}) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pickedId) return;
    setError(null);
    setSubmitting(true);
    try {
      const { player } = await hifzApi.playerLogin(pickedId, pin.trim());
      onSignedIn(player);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.1),_transparent_60%)] p-4 text-slate-200">
      <div className="w-full max-w-2xl">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-400">
            Missiles vs Hifz
          </p>
          <h1 className="mt-1 text-2xl font-black uppercase tracking-wide text-slate-50">
            Choose Your Character
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Tap your character, then enter your PIN to deploy.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {players.map((p) => {
            const picked = pickedId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPickedId(p.id);
                  setPin("");
                  setError(null);
                }}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${
                  picked
                    ? "border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                    : "border-slate-700 bg-slate-900/70 hover:border-slate-500"
                }`}
              >
                <Character player={p} scale={1.1} online={isOnline(p)} />
                <p className="text-sm font-bold text-slate-100">{p.name}</p>
                {isOnline(p) && (
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-lime-400">
                    ● Online now
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {pickedId && (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-6 max-w-xs rounded-xl border border-slate-700 bg-slate-900/80 p-5 text-center"
          >
            <p className="text-sm text-slate-300">
              Enter <span className="font-bold text-cyan-300">{players.find((p) => p.id === pickedId)?.name}</span>&rsquo;s PIN
            </p>
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="mt-3 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2.5 text-center text-lg tracking-[0.5em] text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
            {error && (
              <p className="mt-3 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting || !pin.trim()}
              className="mt-4 w-full rounded-md bg-cyan-500 py-2.5 text-sm font-black uppercase tracking-wide text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
            >
              {submitting ? "Deploying…" : "Deploy"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
