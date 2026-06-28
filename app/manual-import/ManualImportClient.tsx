"use client";

import { useState } from "react";

type ManualImportResult = {
  received?: number;
  unique?: number;
  duplicate_links?: number;
  inserted?: number;
  skipped?: number;
  failed?: number;
  details?: Array<{
    url: string;
    status: "inserted" | "skipped" | "failed";
    reason?: string;
    title?: string;
    company?: string;
  }>;
  error?: string;
};

export function ManualImportClient() {
  const [jobLinks, setJobLinks] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ManualImportResult | null>(null);

  async function importLinks() {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/manual-import/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links: jobLinks }),
      });
      const data = (await res.json()) as ManualImportResult;
      setResult(data);

      if (res.ok && (data.inserted ?? 0) > 0) {
        setJobLinks("");
      }
    } catch {
      setResult({ error: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          Manual Job Link Import
        </p>
        <h1 className="mt-2 text-2xl font-bold text-primary">
          Paste approved job links
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Add LinkedIn, Naukri Gulf, Indeed, Bayt, or GulfTalent links. Use one
          URL per line. Finance and AI jobs only.
        </p>

        <textarea
          value={jobLinks}
          onChange={(event) => setJobLinks(event.target.value)}
          rows={12}
          placeholder={"https://www.linkedin.com/jobs/view/...\nhttps://www.naukrigulf.com/..."}
          className="mt-4 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
        />

        <button
          onClick={importLinks}
          disabled={loading || jobLinks.trim().length === 0}
          className="mt-3 w-full rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
        >
          {loading ? "Importing..." : "Import pasted job links"}
        </button>
      </div>

      {result && (
        <div
          className={`rounded-xl p-4 text-sm ${
            result.error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800"
          }`}
        >
          {result.error ? (
            <p>Error: {result.error}</p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
                <ResultStat label="Pasted" value={result.received ?? 0} />
                <ResultStat label="Unique" value={result.unique ?? 0} />
                <ResultStat label="Duplicates" value={result.duplicate_links ?? 0} />
                <ResultStat label="Inserted" value={result.inserted ?? 0} />
                <ResultStat label="Skipped" value={result.skipped ?? 0} />
                <ResultStat label="Failed" value={result.failed ?? 0} />
              </div>
              <ul className="space-y-1 border-t border-green-100 pt-3 text-xs">
                {result.details?.slice(0, 12).map((row, index) => (
                  <li key={`${row.url}-${row.status}-${index}`} className="break-words text-gray-700">
                    <strong>{row.status}</strong>
                    {row.title ? `: ${row.title}` : ""}
                    {row.company ? ` (${row.company})` : ""}
                    {row.reason ? ` - ${row.reason}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white/70 p-2">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-lg font-bold text-primary">{value}</p>
    </div>
  );
}
