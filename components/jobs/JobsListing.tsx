"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { JobCard } from "@/components/JobCard";
import { JobsFilters } from "@/components/jobs/JobsFilters";
import { JobsPagination } from "@/components/jobs/JobsPagination";
import { JobsToolbar } from "@/components/jobs/JobsToolbar";
import type { FilterOptions, JobsListResponse } from "@/lib/jobs/types";
import {
  buildJobsSearchParams,
  getResultsLabel,
  type JobsFilterState,
} from "@/lib/jobs/search-params";

type JobsListingProps = {
  initialFilters: JobsFilterState;
  initialData: JobsListResponse;
  filterOptions: FilterOptions;
};

export function JobsListing({
  initialFilters,
  initialData,
  filterOptions,
}: JobsListingProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [data, setData] = useState(initialData);

  useEffect(() => {
    setFilters(initialFilters);
    setData(initialData);
  }, [initialFilters, initialData]);

  const resultsLabel = getResultsLabel(
    data.total,
    filters.category || undefined
  );

  // Build subscribe URL pre-filled with current search context
  const alertParams = new URLSearchParams();
  if (filters.category) alertParams.set("category", filters.category);
  if (filters.country) alertParams.set("country", filters.country);
  const alertHref = alertParams.toString()
    ? `/subscribe?${alertParams}`
    : "/subscribe";

  const alertLabel = [
    filters.category || "Finance & AI",
    filters.country ? `in ${filters.country}` : "across GCC",
  ].join(" ");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="sticky top-6 rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary">
              Filters
            </h2>
            <JobsFilters
              initialFilters={filters}
              filterOptions={filterOptions}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <JobsToolbar filters={filters} resultsLabel={resultsLabel} />

          {/* Alert CTA banner */}
          <div className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-finance/20 bg-finance/5 px-4 py-3">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-primary">Get new {alertLabel} jobs</span>
              {" "}sent to your inbox.
            </p>
            <Link
              href={alertHref}
              className="shrink-0 rounded-md bg-finance px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              Create alert →
            </Link>
          </div>

          {data.jobs.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {data.jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-100 bg-white p-12 text-center shadow-sm">
              <p className="text-lg font-medium text-gray-700">No jobs found</p>
              <p className="mt-2 text-sm text-gray-500">
                Try adjusting your filters or check back later.
              </p>
            </div>
          )}

          <JobsPagination
            filters={filters}
            page={data.page}
            totalPages={data.total_pages}
          />
        </div>
      </div>
    </div>
  );
}
