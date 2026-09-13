"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { getSafeReturnPath } from "@/lib/auth/return-to";

export function PasswordRecovery({ returnTo }: { returnTo: string }) {
  const supabase = useMemo(() => createBrowserClient(false), []);
  const recovery = useRef<Promise<void> | null>(null);
  const destination = getSafeReturnPath(returnTo);
  const [mode, setMode] = useState<"checking" | "request" | "update" | "done">("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    let active = true;
    // Consume the recovery fragment once, including during Strict Mode effect replay.
    if (!recovery.current) recovery.current = (async () => {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const query = new URLSearchParams(window.location.search);
      const invalid = hash.has("error") || query.has("error");
      const recoveryLink = hash.get("type") === "recovery";
      if (invalid || recoveryLink) {
        sessionStorage.removeItem("password-recovery-user");
        window.history.replaceState(null, "", window.location.pathname + `?returnTo=${encodeURIComponent(destination)}`);
        if (invalid) throw new Error("This password link is invalid or expired. Request a new one below.");
        const access_token = hash.get("access_token");
        const refresh_token = hash.get("refresh_token");
        if (!access_token || !refresh_token) throw new Error("This password link is incomplete. Request a new one below.");
        const { data, error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
        if (sessionError || !data.user) throw new Error("This password link could not be verified. Request a new one below.");
        sessionStorage.setItem("password-recovery-user", data.user.id);
      }
    })();
    recovery.current.then(() => supabase.auth.getUser()).then(({ data, error: userError }) => {
      if (!active) return;
      const restored = sessionStorage.getItem("password-recovery-user");
      if (!userError && data.user && restored === data.user.id) {
        setEmail(data.user.email || "");
        setMode("update");
      } else {
        setMode("request");
      }
    }).catch((err) => {
      if (active) { setMode("request"); setError(err instanceof Error ? err.message : "Could not verify your session. Please try again."); }
    });
    return () => { active = false; };
  }, [supabase, destination]);

  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setTimeout(() => setCooldown(value => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || cooldown) return;
    setBusy(true); setError(""); setInfo("");
    try {
      const { error: sendError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password?returnTo=${encodeURIComponent(destination)}`,
      });
      if (sendError) throw sendError;
      setInfo("If this email is registered, a password link has been requested. Check your inbox. This also works for an account originally created with Google.");
      setCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not request a password email. Please try again.");
    } finally { setBusy(false); }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (password.length < 8) { setError("Use at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setBusy(true);
    try {
      const { data, error: sessionError } = await supabase.auth.getUser();
      if (sessionError || !data.user || sessionStorage.getItem("password-recovery-user") !== data.user.id) {
        setMode("request");
        throw new Error("Your recovery session has expired. Request a new password link.");
      }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      sessionStorage.removeItem("password-recovery-user");
      setPassword(""); setConfirm(""); setMode("done");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not update your password."); }
    finally { setBusy(false); }
  }

  const input = "mt-2 w-full rounded-md border border-gray-300 px-3 py-3 text-base focus:border-finance focus:outline-none focus:ring-1 focus:ring-finance";
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6">
        <Link href="/" className="text-sm font-semibold text-finance">Helping Hands GCC</Link>
        <h1 className="mt-6 text-2xl font-bold">{mode === "update" ? "Choose your password" : mode === "done" ? "Password saved" : "Forgot or set password"}</h1>
        {mode === "checking" && <p role="status" className="mt-4 text-sm">Checking your recovery link...</p>}
        {error && <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {info && mode === "request" && <p role="status" className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">{info}</p>}
        {mode === "request" && <>
          <p className="mt-4 text-sm leading-6 text-gray-600">Enter your account email to reset your password, or set one for an existing Google-registered account.</p>
          <form onSubmit={requestReset} className="mt-6 space-y-5">
            <label className="block text-sm font-medium">Email address<input className={input} type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></label>
            <button disabled={busy || cooldown > 0} className="w-full rounded-md bg-finance px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Requesting..." : cooldown ? `Request again in ${cooldown}s` : "Send password link"}</button>
          </form>
        </>}
        {mode === "update" && <>
          <p className="mt-4 break-words text-sm text-gray-600">Set a new password for {email}. Your existing profile and submissions stay unchanged.</p>
          <form onSubmit={updatePassword} className="mt-6 space-y-5">
            <label className="block text-sm font-medium">New password<input className={input} type="password" autoComplete="new-password" minLength={8} required value={password} onChange={event => setPassword(event.target.value)} /></label>
            <label className="block text-sm font-medium">Confirm new password<input className={input} type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={event => setConfirm(event.target.value)} /></label>
            <button disabled={busy} className="w-full rounded-md bg-finance px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving..." : "Save password"}</button>
          </form>
        </>}
        {mode === "done" && <div role="status" className="mt-5"><p className="text-sm leading-6">Your password has been updated. You can now use your email and password to sign in.</p><Link href={destination} className="mt-5 inline-block rounded-md bg-finance px-5 py-3 text-sm font-semibold text-white">Continue</Link></div>}
        <Link href={`/sign-in?returnTo=${encodeURIComponent(destination)}`} className="mt-6 inline-block text-sm text-finance underline">Back to sign in</Link>
      </div>
    </main>
  );
}
