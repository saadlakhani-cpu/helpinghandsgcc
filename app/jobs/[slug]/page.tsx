import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JobCard } from "@/components/JobCard";
import { ResumeWaitlistForm } from "@/components/jobs/ResumeWaitlistForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SITE_NAME } from "@/lib/constants";
import { getJobBySlug, getSimilarJobs } from "@/lib/jobs/get-job";
import { formatRelativeDate, isHotJob } from "@/lib/utils/date";
import {
  formatLocation,
  getCountryFlag,
  getCountryLabel,
} from "@/lib/utils/location";

export const dynamic = "force-dynamic";

// ISO-3166-1 alpha-2 codes for schema.org JobPosting
const COUNTRY_ISO: Record<string, string> = {
  KSA: "SA",
  UAE: "AE",
  Qatar: "QA",
  Kuwait: "KW",
  Bahrain: "BH",
  Oman: "OM",
};

function buildJobPostingSchema(job: Awaited<ReturnType<typeof getJobBySlug>>) {
  if (!job) return null;
  const validThrough = new Date(job.date_posted);
  validThrough.setDate(validThrough.getDate() + 90);
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description:
      job.description_snippet ??
      `${job.title} position at ${job.company} in ${job.city}, ${job.country}.`,
    identifier: {
      "@type": "PropertyValue",
      name: job.company,
      value: job.id,
    },
    datePosted: job.date_posted,
    validThrough: validThrough.toISOString().split("T")[0],
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city,
        addressCountry: COUNTRY_ISO[job.country] ?? job.country,
      },
    },
    employmentType: "FULL_TIME",
    occupationalCategory: job.category,
    ...(job.salary_range
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            value: {
              "@type": "QuantitativeValue",
              description: job.salary_range,
            },
          },
        }
      : {}),
  };
}

const WORK_TYPE_STYLES: Record<string, string> = {
  Remote: "bg-remote/10 text-remote",
  Hybrid: "bg-hybrid/10 text-hybrid",
  "On-site": "bg-onsite/10 text-onsite",
};

type JobDetailPageProps = {
  params: { slug: string };
};

export async function generateMetadata({
  params,
}: JobDetailPageProps): Promise<Metadata> {
  const job = await getJobBySlug(params.slug);

  if (!job) {
    return { title: `Job Not Found | ${SITE_NAME}` };
  }

  return {
    title: `${job.title} at ${job.company} | ${SITE_NAME}`,
    description:
      job.description_snippet ??
      `${job.title} at ${job.company} in ${job.city}, ${job.country}.`,
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const job = await getJobBySlug(params.slug);

  if (!job) {
    notFound();
  }

  const similarJobs = await getSimilarJobs(job);
  const isFinance = job.category === "Finance";
  const hot = isHotJob(job.date_posted);
  const jsonLd = buildJobPostingSchema(job);

  return (
    <div className="flex min-h-screen flex-col">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <Link
            href="/jobs"
            className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 transition hover:text-primary"
          >
            ← Back to jobs
          </Link>

          <article className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-primary sm:text-3xl">
                  {job.title}
                </h1>
                <p className="mt-2 text-lg text-gray-600">{job.company}</p>
              </div>
              {hot && (
                <span className="rounded-full bg-hot/10 px-3 py-1 text-sm font-medium text-hot">
                  🔥 Hot
                </span>
              )}
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {job.recruiter_source && (
                <span className="rounded-full bg-recruiter/10 px-3 py-1 text-xs font-medium text-recruiter">
                  {job.recruiter_source}
                </span>
              )}
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  WORK_TYPE_STYLES[job.work_type] ?? WORK_TYPE_STYLES["On-site"]
                }`}
              >
                {job.work_type}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {job.seniority}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  isFinance ? "bg-finance/10 text-finance" : "bg-ai/10 text-ai"
                }`}
              >
                {job.category}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {job.subcategory}
              </span>
            </div>

            <div className="mb-6 space-y-2 text-sm text-gray-600">
              <p>
                {getCountryFlag(job.country)}{" "}
                {formatLocation(job.city, getCountryLabel(job.country))}
              </p>
              <p>
                Posted {formatRelativeDate(job.date_posted)} · Source:{" "}
                {job.platform}
              </p>
              {job.salary_range && <p>Salary: {job.salary_range}</p>}
              {job.experience_years && (
                <p>Experience: {job.experience_years}</p>
              )}
              <p className="text-xs text-gray-500">
                Freshness score: {job.freshness_score.toFixed(1)}
              </p>
            </div>

            {job.description_snippet && (
              <div className="mb-8">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Description
                </h2>
                <p className="whitespace-pre-wrap text-gray-700">
                  {job.description_snippet}
                </p>
              </div>
            )}

            <a
              href={job.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-md bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Apply on {job.platform} →
            </a>
          </article>

          {similarJobs.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-xl font-bold text-primary">
                Similar Jobs
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {similarJobs.map((similar) => (
                  <JobCard key={similar.id} job={similar} />
                ))}
              </div>
            </section>
          )}

          <section className="mt-10 rounded-lg border border-gray-200 bg-gray-50 p-6 sm:p-8">
            <p className="text-lg font-semibold text-primary">
              🔒 Get a Tailored Resume for this role
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Coming Soon — Join waitlist for early access
            </p>
            <div className="mt-4">
              <ResumeWaitlistForm />
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
