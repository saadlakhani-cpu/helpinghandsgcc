"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSafeReturnPath } from "@/lib/auth/return-to";
import { createBrowserClient } from "@/lib/supabase/client";

type AuthMode = "sign-in" | "sign-up" | "verify";

function inputClassName() {
  return "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
}

export function SignInClient({ returnTo }: { returnTo: string }) {
  const safeReturnTo = useMemo(() => getSafeReturnPath(returnTo), [returnTo]);

  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email_confirmed_at) {
        window.location.replace(safeReturnTo);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") &&
        session?.user?.email_confirmed_at
      ) {
        window.location.replace(safeReturnTo);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [safeReturnTo]);

  function resetMessages() {
    setError(null);
    setInfo(null);
  }

  function switchMode(next: AuthMode) {
    resetMessages();
    setMode(next);
    setPassword("");
    setConfirmPassword("");
    setOtp("");
  }

  async function handleSignIn(event: FormEvent) {
    event.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const supabase = createBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) throw signInError;

      window.location.replace(safeReturnTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(event: FormEvent) {
    event.preventDefault();
    resetMessages();

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserClient();
      const origin = window.location.origin;
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: { full_name: trimmedName, username: trimmedName },
          emailRedirectTo: `${origin}/sign-in?returnTo=${encodeURIComponent(safeReturnTo)}`,
        },
      });

      if (signUpError) throw signUpError;

      if (data.session?.user?.email_confirmed_at) {
        window.location.replace(safeReturnTo);
        return;
      }

      setMode("verify");
      setInfo(
        "We sent a confirmation email. Enter the 6-digit code below, or click the confirmation link in your email."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Account creation failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent) {
    event.preventDefault();
    resetMessages();

    const token = otp.trim();
    if (!token) {
      setError("Please enter the verification code.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserClient();
      const trimmedEmail = email.trim().toLowerCase();

      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: trimmedEmail,
        token,
        type: "signup",
      });

      if (verifyError) {
        const { error: emailTypeError } = await supabase.auth.verifyOtp({
          email: trimmedEmail,
          token,
          type: "email",
        });

        if (emailTypeError) throw verifyError;
      }

      window.location.replace(safeReturnTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    resetMessages();
    setLoading(true);

    try {
      const supabase = createBrowserClient();
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/sign-in?returnTo=${encodeURIComponent(safeReturnTo)}`,
        },
      });

      if (resendError) throw resendError;

      setInfo("A new confirmation email has been sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <Link href="/" className="text-sm font-semibold text-primary">
          Gulf Finance & AI Jobs
        </Link>

        {mode === "verify" ? (
          <>
            <h1 className="mt-6 text-2xl font-bold text-primary">
              Verify your email
            </h1>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Enter the 6-digit code sent to <strong>{email}</strong>, or use the
              confirmation link in your email.
            </p>

            {info && (
              <p className="mt-4 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
                {info}
              </p>
            )}

            {error && (
              <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Verification code
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder="123456"
                  className={inputClassName()}
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? "Verifying…" : "Verify email"}
              </button>
            </form>

            <div className="mt-4 flex flex-col gap-2 text-sm">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="text-primary underline disabled:opacity-50"
              >
                Resend confirmation email
              </button>
              <button
                type="button"
                onClick={() => switchMode("sign-in")}
                className="text-gray-500 underline"
              >
                Back to sign in
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-6 text-2xl font-bold text-primary">
              {mode === "sign-in" ? "Sign in to continue" : "Create your account"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {mode === "sign-in"
                ? "Sign in to view jobs, subscribe to alerts, manage your profile, or register as a recruiter."
                : "Create an account with your email and password. We will send a confirmation code or link to activate it."}
            </p>

            <div className="mt-5 flex rounded-md border border-gray-200 p-1">
              <button
                type="button"
                onClick={() => switchMode("sign-in")}
                className={`flex-1 rounded px-3 py-2 text-sm font-medium transition ${
                  mode === "sign-in"
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-primary"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => switchMode("sign-up")}
                className={`flex-1 rounded px-3 py-2 text-sm font-medium transition ${
                  mode === "sign-up"
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-primary"
                }`}
              >
                Create account
              </button>
            </div>

            {info && (
              <p className="mt-4 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
                {info}
              </p>
            )}

            {error && (
              <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            {mode === "sign-in" ? (
              <form onSubmit={handleSignIn} className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Email</span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={inputClassName()}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Password</span>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={inputClassName()}
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Full name
                  </span>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className={inputClassName()}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Email</span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={inputClassName()}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Password</span>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={inputClassName()}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Confirm password
                  </span>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className={inputClassName()}
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {loading ? "Creating account…" : "Create account"}
                </button>
              </form>
            )}

            <p className="mt-4 text-xs text-gray-500">
              After sign-in, you will return to the page you tried to open.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
