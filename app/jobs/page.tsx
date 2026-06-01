import { JobsListing } from "@/components/jobs/JobsListing";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getFilterOptions } from "@/lib/jobs/filter-options";
import { parseJobsQuery } from "@/lib/jobs/parse-query";
import { queryJobs } from "@/lib/jobs/query-jobs";
import { filtersFromSearchParams } from "@/lib/jobs/search-params";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type JobsPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const filters = filtersFromSearchParams(searchParams);

  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") urlParams.set(key, value);
  }
  const parsed = parseJobsQuery(urlParams);

  const supabase = createAdminClient();
  const [jobsData, filterOptions] = await Promise.all([
    queryJobs(supabase, parsed),
    getFilterOptions(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <JobsListing
        initialFilters={filters}
        initialData={jobsData}
        filterOptions={filterOptions}
      />
      <SiteFooter />
    </div>
  );
}
