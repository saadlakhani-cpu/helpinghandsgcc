import { CvTailorTeaser } from "@/components/CvTailorTeaser";
import { ProtectedJobLink } from "@/components/ProtectedJobLink";
import type { Job } from "@/lib/jobs/types";
import { formatRelativeDate, isHotJob } from "@/lib/utils/date";
import { formatLocation, getCountryFlag } from "@/lib/utils/location";

const WORK_TYPE_STYLES: Record<string, string> = {
  Remote: "bg-remote/10 text-remote",
  Hybrid: "bg-hybrid/10 text-hybrid",
  "On-site": "bg-onsite/10 text-onsite",
};

const AVATAR_COLORS: [string, string][] = [
  ["bg-finance/10", "text-finance"],
  ["bg-ai/10", "text-ai"],
  ["bg-emerald-50", "text-emerald-700"],
  ["bg-orange-50", "text-orange-700"],
  ["bg-violet-50", "text-violet-700"],
  ["bg-sky-50", "text-sky-700"],
];

function companyInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return name.slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function companyAvatarColors(name: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

type JobCardProps = {
  job: Job;
};

export function JobCard({ job }: JobCardProps) {
  const isFinance = job.category === "Finance";
  const hot = isHotJob(job.date_posted);
  const initials = companyInitials(job.company);
  const [avatarBg, avatarText] = companyAvatarColors(job.company);

  return (
    <article className="flex flex-col rounded-lg border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      {/* Header: avatar + title + hot badge */}
      <div className="mb-3 flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-xs font-bold ${avatarBg} ${avatarText}`}
          aria-hidden="true"
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-primary">
            <ProtectedJobLink href={`/jobs/${job.slug}`} className="hover:underline">
              {job.title}
            </ProtectedJobLink>
          </h3>
          <p className="mt-0.5 truncate text-sm text-gray-600">{job.company}</p>
        </div>
        {hot && (
          <span className="shrink-0 text-xs font-medium text-hot">🔥 Hot</span>
        )}
      </div>

      {/* Salary badge — shown when available */}
      {job.salary_range && (
        <p className="mb-2 inline-flex w-fit items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
          {job.salary_range}
        </p>
      )}

      {/* Tags */}
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

      {/* Footer: date + action buttons */}
      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="text-xs text-gray-500">
          {formatRelativeDate(job.date_posted)}
        </span>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <CvTailorTeaser />
          <ProtectedJobLink
            href={`/jobs/${job.slug}`}
            className="text-sm font-medium text-gray-500 hover:text-primary"
          >
            Details
          </ProtectedJobLink>
          <ProtectedJobLink
            href={`/jobs/${job.slug}?apply=1`}
            className="rounded-md bg-finance px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            Apply →
          </ProtectedJobLink>
        </div>
      </div>
    </article>
  );
}
