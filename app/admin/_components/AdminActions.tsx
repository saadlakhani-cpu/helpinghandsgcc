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
  jsearch_debug?: Array<{
    query: string;
    raw_count: number;
    usable_count: number;
  }>;
  // manual imports
  details?: Array<{
    url: string;
    status: "inserted" | "skipped" | "failed";
    reason?: string;
    title?: string;
    company?: string;
  }>;
  // generic
  message?: string;
  error?: string;
};

export function AdminActions() {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [jobLinks, setJobLinks] = useState("");

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

  async function importLinks() {
    setLoading("import-job-links");
    setResult(null);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import-job-links", links: jobLinks }),
      });
      const data = (await res.json()) as ActionResult;
      setResult(data);
      if (res.ok && (data.inserted ?? 0) > 0) {
        setJobLinks("");
      }
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
    const isManualImport = Boolean(result.details);
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
        ) : isManualImport ? (
          <div className="space-y-2">
            <ul className="space-y-0.5">
              <li>Links received: <strong>{result.received ?? 0}</strong></li>
              <li>Inserted: <strong>{result.inserted ?? 0}</strong></li>
              <li>Skipped: <strong>{result.skipped ?? 0}</strong></li>
              <li>Failed: <strong>{result.failed ?? 0}</strong></li>
            </ul>
            <ul className="space-y-1 border-t border-green-100 pt-2">
              {result.details?.slice(0, 8).map((row) => (
                <li key={row.url} className="break-words text-gray-700">
                  <strong>{row.status}</strong>
                  {row.title ? `: ${row.title}` : ""}{" "}
                  {row.company ? `(${row.company})` : ""}
                  {row.reason ? ` - ${row.reason}` : ""}
                </li>
              ))}
            </ul>
          </div>
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
            {result.jsearch_debug?.slice(0, 5).map((row) => (
              <li key={row.query} className="text-gray-600">
                {row.query}: <strong>{row.raw_count}</strong> raw /{" "}
                <strong>{row.usable_count}</strong> usable
              </li>
            ))}
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
        {loading === "send-alerts" ? "Running..." : "Run Send-Alerts"}
      </button>

      <button
        onClick={() => runAction("expire-jobs")}
        disabled={loading !== null}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
      >
        {loading === "expire-jobs" ? "Running..." : "Run Expire-Jobs"}
      </button>

      <hr className="border-gray-200" />

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          Manual job link import
        </p>
        <p className="mt-1 text-xs text-gray-600">
          Paste LinkedIn or Naukri Gulf job URLs, one per line. The importer will
          read available page details, classify Finance/AI, and add non-duplicate jobs.
        </p>
        <textarea
          value={jobLinks}
          onChange={(event) => setJobLinks(event.target.value)}
          rows={5}
          placeholder={"https://www.linkedin.com/jobs/view/...\nhttps://www.naukrigulf.com/..."}
          className="mt-3 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
        />
        <button
          onClick={importLinks}
          disabled={loading !== null || jobLinks.trim().length === 0}
          className="mt-2 w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
        >
          {loading === "import-job-links" ? "Importing..." : "Import pasted job links"}
        </button>
      </div>

      <hr className="border-gray-200" />

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Daily priority sources
      </p>
      <p className="text-xs text-gray-500">
        LinkedIn, Naukri Gulf and Indeed. Run batches one by one to avoid timeouts.
      </p>

      <button
        onClick={() => runAction("fetch-daily-priority-1")}
        disabled={loading !== null}
        className="w-full rounded-lg bg-finance px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
      >
        {loading === "fetch-daily-priority-1" ? "Running..." : "Daily Priority 1"}
      </button>

      <button
        onClick={() => runAction("fetch-daily-priority-2")}
        disabled={loading !== null}
        className="w-full rounded-lg bg-finance px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
      >
        {loading === "fetch-daily-priority-2" ? "Running..." : "Daily Priority 2"}
      </button>

      <button
        onClick={() => runAction("fetch-daily-priority-3")}
        disabled={loading !== null}
        className="w-full rounded-lg bg-finance px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
      >
        {loading === "fetch-daily-priority-3" ? "Running..." : "Daily Priority 3"}
      </button>

      <button
        onClick={() => runAction("fetch-daily-priority-4")}
        disabled={loading !== null}
        className="w-full rounded-lg bg-finance px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
      >
        {loading === "fetch-daily-priority-4" ? "Running..." : "Daily Priority 4"}
      </button>

      <button
        onClick={() => runAction("fetch-daily-priority-5")}
        disabled={loading !== null}
        className="w-full rounded-lg bg-finance px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
      >
        {loading === "fetch-daily-priority-5" ? "Running..." : "Daily Priority 5"}
      </button>

      <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Twice-weekly sources
      </p>

      <button
        onClick={() => runAction("fetch-twice-weekly-sources")}
        disabled={loading !== null}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
      >
        {loading === "fetch-twice-weekly-sources"
          ? "Running..."
          : "Bayt, GulfTalent & recruiters"}
      </button>

      <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Weekly broad sources
      </p>

      <button
        onClick={() => runAction("fetch-weekly-broad-sources")}
        disabled={loading !== null}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
      >
        {loading === "fetch-weekly-broad-sources"
          ? "Running..."
          : "Wider GCC / broad portals"}
      </button>

      <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        AI weekly source
      </p>

      <button
        onClick={() => runAction("fetch-ai-jobs")}
        disabled={loading !== null}
        className="w-full rounded-lg bg-ai px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
      >
        {loading === "fetch-ai-jobs" ? "Running..." : "AI Jobs Batch"}
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
