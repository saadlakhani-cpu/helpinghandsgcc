"use client";

import { useState } from "react";
import { hifzApi } from "./api";

export function FamilyGate({ onUnlock }: { onUnlock: () => void }) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await hifzApi.familyLogin(passcode.trim());
      onUnlock();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.1),_transparent_60%)] p-4 text-slate-200">
      <div className="w-full max-w-sm rounded-2xl border border-cyan-400/40 bg-slate-900/80 p-6 text-center shadow-[0_0_40px_rgba(34,211,238,0.15)]">
        <p className="text-3xl">🛰️</p>
        <h1 className="mt-2 text-lg font-black uppercase tracking-wide text-cyan-300">
          Hifz Command Center
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Enter the family passcode to access the shared base.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <input
            type="password"
            inputMode="text"
            autoFocus
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Family passcode"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2.5 text-center text-sm tracking-widest text-slate-100 focus:border-cyan-400 focus:outline-none"
          />
          {error && (
            <p className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting || !passcode.trim()}
            className="w-full rounded-md bg-cyan-500 py-2.5 text-sm font-black uppercase tracking-wide text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
          >
            {submitting ? "Verifying…" : "Unlock Base"}
          </button>
        </form>
      </div>
    </div>
  );
}
