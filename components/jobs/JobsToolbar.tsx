"use client";

import { useRouter } from "next/navigation";
import {
  buildJobsSearchParams,
  type JobsFilterState,
} from "@/lib/jobs/search-params";

type JobsToolbarProps = {
  filters: JobsFilterState;
  resultsLabel: string;
};

const SORT_OPTIONS = [
  { value: "freshness", label: "Freshness" },
  { value: "date_posted", label: "Date Posted" },
  { value: "seniority", label: "Seniority" },
] as const;

export function JobsToolbar({ filters, resultsLabel }: JobsToolbarProps) {
  const router = useRouter();

  function handleSortChange(sort: string) {
    const params = buildJobsSearchParams({ ...filters, sort, page: "1" });
    router.push(`/jobs?${params}`);
  }

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-xl font-bold text-primary">{resultsLabel}</h1>
      <div className="flex items-center gap-2">
        <label htmlFor="sort" className="text-sm text-gray-600">
          Sort by:
        </label>
        <select
          id="sort"
          value={filters.sort || "freshness"}
          onChange={(e) => handleSortChange(e.target.value)}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-finance focus:ring-1 focus:ring-finance"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
