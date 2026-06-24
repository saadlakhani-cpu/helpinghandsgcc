"use client";

import { useState } from "react";

type ActionResult = {
  // send-alerts
  sent?: number;
  failed?: number;
  subscribers_processed?: number;
  jobs_in_batch?: number;
  // expire-jobs
  expired?: number;
  freshness_updated?: number;
  buckets_processed?: number;
  cutoff_date?: string;
  // fetch-jobs
  received?: number;
  inserted?: number;
  skipped?: number;
  layer?: string;
  // generic
  message?: string;
  error?: string;
};

export function AdminActions() {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<ActionResult | null>(null);

  async function runAction(action: string) {
    setLoading(action);
    setResult(null);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await res.json()) as ActionResult;
      setResult(data);
    } catch {
      setResult({ error: "Network error" });
    } finally {
      setLoading(null);
    }
  }

  function ResultPanel() {
    if (!result) return null;
    const isError = Boolean(result.error);
    const isSendAlerts = result.sent !== undefined || result.subscribers_processed !== undefined;
    const isExpire = result.expired !== undefined || result.freshness_updated !== undefined;
    const isFetchJobs = result.received !== undefined || result.inserted !== undefined;
    return (
      <div
        className={`rounded-lg p-3 text-xs ${
          isError ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800"
        }`}
      >
        {isError ? (
          <p>Error: {result.error}</p>
        ) : result.message ? (
          <p>{result.message}</p>
        ) : isSendAlerts ? (
          <ul className="space-y-0.5">
            <li>Subscribers processed: <strong>{result.subscribers_processed ?? 0}</strong></li>
            <li>Emails sent: <strong>{result.sent ?? 0}</strong></li>
            {(result.failed ?? 0) > 0 && (
              <li className="text-red-600">Failed: <strong>{result.failed}</strong></li>
            )}
            <li>Jobs in batch: <strong>{result.jobs_in_batch ?? 0}</strong></li>
          </ul>
        ) : isExpire ? (
          <ul className="space-y-0.5">
            <li>Jobs expired: <strong>{result.expired ?? 0}</strong></li>
            <li>Freshness scores updated: <strong>{result.freshness_updated ?? 0}</strong></li>
            <li>Buckets processed: <strong>{result.buckets_processed ?? 0}</strong></li>
            {result.cutoff_date && (
              <li className="text-gray-500">Cutoff: {result.cutoff_date}</li>
            )}
          </ul>
        ) : isFetchJobs ? (
          <ul className="space-y-0.5">
            <li>Layer: <strong>{result.layer ?? "all"}</strong></li>
            <li>Received: <strong>{result.received ?? 0}</strong></li>
            <li>Inserted: <strong>{result.inserted ?? 0}</strong></li>
            <li>Skipped: <strong>{result.skipped ?? 0}</strong></li>
          </ul>
        ) : (
          <p>Done.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => runAction("send-alerts")}
        disabled={loading !== null}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
      >
        {loading === "send-alerts" ? "Running…" : "Run Send-Alerts"}
      </button>

      <button
        onClick={() => runAction("expire-jobs")}
        disabled={loading !== null}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
      >
        {loading === "expire-jobs" ? "Running…" : "Run Expire-Jobs"}
      </button>

      <hr className="border-gray-200" />

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        JSearch
      </p>

      <button
        onClick={() => runAction("fetch-jobs-layer-1")}
        disabled={loading !== null}
        className="w-full rounded-lg bg-finance px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
      >
        {loading === "fetch-jobs-layer-1" ? "Running…" : "Run JSearch Layer 1"}
      </button>

      <button
        onClick={() => runAction("fetch-jobs-layer-2")}
        disabled={loading !== null}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
      >
        {loading === "fetch-jobs-layer-2" ? "Running…" : "Run JSearch Layer 2"}
      </button>

      <button
        onClick={() => runAction("fetch-jobs-layer-3")}
        disabled={loading !== null}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
      >
        {loading === "fetch-jobs-layer-3" ? "Running…" : "Run JSearch Layer 3"}
      </button>

      <ResultPanel />

      <hr className="border-gray-200" />

      <div className="rounded-lg bg-slate-50 p-3 text-xs text-gray-500">
        <p className="mb-1 font-medium text-gray-700">Trigger Ingest</p>
        <p>
          POST{" "}
          <code className="rounded bg-gray-200 px-1 py-0.5">/api/ingest-jobs</code>{" "}
          with a jobs array from your scraper or Apify actor. Include an
          optional <code className="rounded bg-gray-200 px-1 py-0.5">x-ingest-secret</code>{" "}
          header.
        </p>
      </div>
    </div>
  );
}
