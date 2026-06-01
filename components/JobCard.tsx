import Link from "next/link";
import type { Job } from "@/lib/jobs/types";
import { formatRelativeDate, isHotJob } from "@/lib/utils/date";
import { formatLocation, getCountryFlag } from "@/lib/utils/location";

const WORK_TYPE_STYLES: Record<string, string> = {
  Remote: "bg-remote/10 text-remote",
  Hybrid: "bg-hybrid/10 text-hybrid",
  "On-site": "bg-onsite/10 text-onsite",
};

type JobCardProps = {
  job: Job;
};

export function JobCard({ job }: JobCardProps) {
  const isFinance = job.category === "Finance";
  const hot = isHotJob(job.date_posted);

  return (
    <article className="flex flex-col rounded-lg border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-primary">
            <Link href={`/jobs/${job.slug}`} className="hover:underline">
              {job.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-gray-600">{job.company}</p>
        </div>
        {hot && (
          <span className="shrink-0 text-xs font-medium text-hot">🔥 Hot</span>
        )}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {job.recruiter_source && (
          <span className="rounded-full bg-recruiter/10 px-2.5 py-0.5 text-xs font-medium text-recruiter">
            {job.recruiter_source}
          </span>
        )}
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            WORK_TYPE_STYLES[job.work_type] ?? WORK_TYPE_STYLES["On-site"]
          }`}
        >
          {job.work_type}
        </span>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
          {job.seniority}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isFinance ? "bg-finance/10 text-finance" : "bg-ai/10 text-ai"
          }`}
        >
          {job.category}
        </span>
{job.platform && (
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
            {job.platform}
          </span>
        )}
      
</div>

      <p className="mb-4 text-sm text-gray-600">
        {getCountryFlag(job.country)}{" "}
        {formatLocation(job.city, job.country)}
      </p>

      <div className="mt-auto flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {formatRelativeDate(job.date_posted)}
        </span>
        <Link
          href={`/jobs/${job.slug}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          View Job →
        </Link>
      </div>
    </article>
  );
}
