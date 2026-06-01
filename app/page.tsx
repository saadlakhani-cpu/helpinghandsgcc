import Link from "next/link";
import { HeroSearch } from "@/components/HeroSearch";
import { JobCard } from "@/components/JobCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getHomePageData } from "@/lib/jobs/home-data";
import { formatHoursAgo } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

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
              Gulf&apos;s #1 Finance &amp; AI Jobs Portal
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              The GCC Finance &amp; AI Career Intelligence Platform
            </p>
            <div className="mt-8">
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
