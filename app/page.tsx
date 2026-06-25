import Link from "next/link";
import { HeroSearch } from "@/components/HeroSearch";
import { JobCard } from "@/components/JobCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CONTACT_EMAIL, CV_REVIEW_ROUTE, RECRUITER_FORM_URL } from "@/lib/constants";
import { getHomePageData } from "@/lib/jobs/home-data";
import { formatHoursAgo } from "@/lib/utils/date";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const { financeCount, aiCount, lastUpdated, latestFinance, latestAi } =
    await getHomePageData();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary px-4 py-16 text-white sm:px-6 sm:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Gulf Finance &amp; AI Jobs
            </h1>
            <p className="mt-3 text-lg text-slate-300">
              The GCC&apos;s specialist portal for Finance &amp; AI careers
            </p>
            {/* Trust pills */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {[
                `${(financeCount + aiCount).toLocaleString()}+ live roles`,
                "KSA · UAE · GCC",
                "Updated daily",
                "Finance & AI only",
              ].map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-slate-300"
                >
                  {pill}
                </span>
              ))}
            </div>
            <div className="mt-6">
              <HeroSearch />
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-b border-gray-200 bg-white py-4">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4 px-4 text-sm text-gray-600 sm:gap-8 sm:px-6">
            <span>
              <strong className="text-finance">{financeCount.toLocaleString()}</strong>{" "}
              Finance Jobs
            </span>
            <span className="hidden text-gray-300 sm:inline">|</span>
            <span>
              <strong className="text-ai">{aiCount.toLocaleString()}</strong> AI Jobs
            </span>
            <span className="hidden text-gray-300 sm:inline">|</span>
            <span>Updated {formatHoursAgo(lastUpdated)}</span>
          </div>
        </section>

        {/* Candidate and recruiter actions */}
        <section className="bg-amber-50 px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-finance">
                New career support
              </p>
              <h2 className="mt-2 text-2xl font-bold text-primary">
                Review CVs and screen applicants with Helping Hands GCC
              </h2>
              <p className="mx-auto mt-2 max-w-3xl text-sm text-gray-600">
                Candidates can request a CV review, and companies or recruiters can
                register interest to post jobs and receive initial CV screening.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-amber-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-finance">For candidates</p>
                <h3 className="mt-2 text-xl font-bold text-primary">
                  Get your CV reviewed
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Upload your CV through our request form. We will review it for
                  Gulf finance and AI job opportunities and help you improve how it
                  presents your experience.
                </p>
                <Link
                  href={CV_REVIEW_ROUTE}
                  className="mt-4 inline-flex rounded-md bg-finance px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                  Request CV review
                </Link>
              </div>

              <div className="rounded-lg border border-sky-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-ai">
                  For companies and recruiters
                </p>
                <h3 className="mt-2 text-xl font-bold text-primary">
                  Register to post jobs
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Share your hiring needs and post finance or AI roles. Initial CV
                  screening can be offered free while the recruiter workflow is
                  being launched.
                </p>
                <Link
                  href={RECRUITER_FORM_URL}
                  className="mt-4 inline-flex rounded-md bg-ai px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700"
                >
                  Register as recruiter
                </Link>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-gray-500">
              Prefer email? Contact us at{" "}
              <a
                className="font-medium text-primary hover:underline"
                href={`mailto:${CONTACT_EMAIL}`}
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>
        </section>

        {/* Latest Finance Jobs */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary">Latest Finance Jobs</h2>
            <Link
              href="/jobs?category=Finance"
              className="text-sm font-medium text-finance hover:underline"
            >
              View all →
            </Link>
          </div>
          {latestFinance.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {latestFinance.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <p className="rounded-lg bg-white p-8 text-center text-gray-500 shadow-sm">
              No finance jobs yet. Check back soon.
            </p>
          )}
        </section>

        {/* Latest AI Jobs */}
        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary">Latest AI Jobs</h2>
            <Link
              href="/jobs?category=AI"
              className="text-sm font-medium text-ai hover:underline"
            >
              View all →
            </Link>
          </div>
          {latestAi.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {latestAi.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <p className="rounded-lg bg-white p-8 text-center text-gray-500 shadow-sm">
              No AI jobs yet. Check back soon.
            </p>
          )}
        </section>

        {/* CTA banner */}
        <section className="bg-primary px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-white">
              Get notified for relevant jobs
            </h2>
            <p className="mt-2 text-slate-300">
              Subscribe once and receive matched Finance &amp; AI roles across
              the Gulf.
            </p>
            <Link
              href="/subscribe"
              className="mt-6 inline-block rounded-md bg-white px-6 py-2.5 text-sm font-medium text-primary transition hover:bg-slate-100"
            >
              Subscribe →
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
