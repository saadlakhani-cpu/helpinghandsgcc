import type { Metadata } from "next";
import Link from "next/link";
import { JobCard } from "@/components/JobCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  getCategoryPageData,
  getCountryCounts,
  COUNTRY_META,
} from "@/lib/seo/category-page";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Finance Jobs in the Gulf",
  description:
    "Browse Finance jobs across Saudi Arabia, UAE, Qatar, Kuwait, Bahrain and Oman. Investment banking, private equity, asset management, corporate finance and risk roles updated daily.",
  keywords: [
    "finance jobs gulf",
    "finance careers GCC",
    "investment banking jobs Middle East",
    "CFA jobs Saudi Arabia",
    "CFO jobs UAE",
    "private equity jobs Dubai",
    "accounting jobs Riyadh",
  ],
  openGraph: {
    title: "Finance Jobs in the Gulf | Gulf Finance & AI Jobs",
    description:
      "Investment banking, private equity, asset management and accounting roles across all six GCC countries.",
  },
  alternates: { canonical: "/finance-jobs" },
};

const SUBCATEGORIES = [
  "Investment Banking",
  "Private Equity",
  "Asset Management",
  "Accounting & Audit",
  "Corporate Finance",
  "Risk & Compliance",
  "Insurance",
];

export default async function FinanceJobsPage() {
  const [{ topJobs, totalCount }, countryCounts] = await Promise.all([
    getCategoryPageData("Finance"),
    getCountryCounts("Finance"),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary px-4 py-14 text-white sm:px-6">
          <div className="mx-auto max-w-4xl">
            <p className="mb-2 text-sm font-medium text-finance">
              Finance Careers
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Finance Jobs Across the Gulf
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              {totalCount.toLocaleString()} active Finance roles across Saudi
              Arabia, UAE, Qatar, Kuwait, Bahrain and Oman — updated daily from
              leading recruiters and job boards.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {SUBCATEGORIES.map((s) => (
                <Link
                  key={s}
                  href={`/jobs?category=Finance&subcategory=${encodeURIComponent(s)}`}
                  className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-300 transition hover:border-finance hover:text-white"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Country navigation */}
        <section className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Browse by Country
            </p>
            <div className="flex flex-wrap gap-2">
              {COUNTRY_META.map((c) => {
                const found = countryCounts.find(
                  (r) => r.country.slug === c.slug
                );
                return (
                  <Link
                    key={c.slug}
                    href={`/finance-jobs/${c.slug}`}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm transition hover:border-finance hover:bg-blue-50"
                  >
                    <span>{c.flag}</span>
                    <span className="font-medium text-gray-800">{c.label}</span>
                    {found && (
                      <span className="text-xs text-gray-400">
                        ({found.count.toLocaleString()})
                      </span>
                    )}
                  </Link>
                );
              })}
              <Link
                href="/jobs?category=Finance"
                className="flex items-center gap-1.5 rounded-lg border border-finance bg-blue-50 px-3 py-1.5 text-sm font-medium text-finance transition hover:bg-blue-100"
              >
                All Finance Jobs ({totalCount.toLocaleString()}) →
              </Link>
            </div>
          </div>
        </section>

        {/* Job listings */}
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary">
              Latest Finance Roles
            </h2>
            <Link
              href="/jobs?category=Finance"
              className="text-sm text-finance hover:underline"
            >
              View all {totalCount.toLocaleString()} →
            </Link>
          </div>

          {topJobs.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {topJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <p className="rounded-lg bg-white p-8 text-center text-gray-500 shadow-sm">
              No finance jobs at the moment. Check back soon.
            </p>
          )}
        </section>

        {/* SEO content block */}
        <section className="border-t border-gray-200 bg-white px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-3xl prose prose-sm text-gray-600">
            <h2 className="text-lg font-bold text-primary">
              Finance Careers in the GCC
            </h2>
            <p className="mt-3">
              The Gulf Cooperation Council is one of the world&apos;s fastest-growing
              financial hubs. Saudi Arabia&apos;s Vision 2030 is driving demand for
              CFOs, financial controllers, and investment professionals. Dubai
              and Abu Dhabi continue to attract global banks, private equity
              firms, and asset managers seeking regional talent.
            </p>
            <p className="mt-3">
              Common certifications valued across GCC Finance roles include the
              CFA, ACCA, CPA, and CA. We aggregate Finance vacancies from
              LinkedIn, Bayt, GulfTalent, and direct recruiter feeds — so you
              see the full market in one place.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-white">
              Get Finance job alerts by email
            </h2>
            <p className="mt-2 text-slate-300">
              Subscribe once and we&apos;ll match you to new Finance roles across
              the Gulf — no spam, only relevant roles.
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
