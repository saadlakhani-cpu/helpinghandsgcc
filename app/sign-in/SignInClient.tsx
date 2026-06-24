"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

function getSafeReturnPath(returnTo: string): string {
  if (!returnTo.startsWith("/") || returnTo.startsWith("//")) return "/jobs";
  if (returnTo.startsWith("/admin")) return "/jobs";
  if (returnTo.startsWith("/api")) return "/jobs";
  return returnTo;
}

export function SignInClient({ returnTo }: { returnTo: string }) {
  const [error, setError] = useState<string | null>(null);
  const safeReturnTo = useMemo(() => getSafeReturnPath(returnTo), [returnTo]);

  useEffect(() => {
    const supabase = createBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        window.location.replace(safeReturnTo);
      }
    });
  }, [safeReturnTo]);

  async function signInWithGoogle() {
    setError(null);

    try {
      const supabase = createBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}${safeReturnTo}` },
      });

      if (signInError) throw signInError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <Link href="/" className="text-sm font-semibold text-primary">
          Gulf Finance & AI Jobs
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-primary">
          Sign in to continue
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Please sign in with Google to view jobs, subscribe to alerts, manage
          your profile, or register as a recruiter.
        </p>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={signInWithGoogle}
          className="mt-6 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Sign in with Google
        </button>

        <p className="mt-4 text-xs text-gray-500">
          After sign-in, you will return to the page you tried to open.
        </p>
      </div>
    </main>
  );
}
