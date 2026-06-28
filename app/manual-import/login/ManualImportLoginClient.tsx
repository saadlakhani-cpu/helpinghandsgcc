"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/manual-import";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/manual-import/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Login failed");
      router.push(from);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <label htmlFor="username" className="block text-sm font-medium text-gray-700">
        Username
      </label>
      <input
        id="username"
        required
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        placeholder="Enter username"
        autoFocus
      />

      <label
        htmlFor="password"
        className="mt-4 block text-sm font-medium text-gray-700"
      >
        Password
      </label>
      <input
        id="password"
        type="password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        placeholder="Enter password"
      />

      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

export function ManualImportLoginClient() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
