"use client";

import { useEffect, useState } from "react";
import { JobCard } from "@/components/JobCard";
import { JobsFilters } from "@/components/jobs/JobsFilters";
import { JobsPagination } from "@/components/jobs/JobsPagination";
import { JobsToolbar } from "@/components/jobs/JobsToolbar";
import type { FilterOptions, JobsListResponse } from "@/lib/jobs/types";
import {
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
