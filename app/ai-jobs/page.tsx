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
  title: "AI Jobs in the Gulf",
  description:
    "Browse AI, machine learning, and data science jobs across Saudi Arabia, UAE, Qatar, Kuwait, Bahrain and Oman. LLM engineers, data scientists, ML researchers — updated daily.",
  keywords: [
    "AI jobs gulf",
    "machine learning jobs UAE",
    "data science jobs Saudi Arabia",
    "AI careers GCC",
    "LLM engineer jobs Middle East",
    "NLP jobs Dubai",
    "AI engineer jobs Riyadh",
  ],
  openGraph: {
    title: "AI Jobs in the Gulf | Gulf Finance & AI Jobs",
    description:
      "Machine learning, data science, LLM engineering and AI research roles across all six GCC countries.",
  },
  alternates: { canonical: "/ai-jobs" },
};

const SUBCATEGORIES = [
  "Machine Learning",
  "Data Science",
  "AI Engineering",
  "NLP / LLMs",
  "Computer Vision",
  "General AI",
];

export default async function AiJobsPage() {
  const [{ topJobs, totalCount }, countryCounts] = await Promise.all([
    getCategoryPageData("AI"),
    getCountryCounts("AI"),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary px-4 py-14 text-white sm:px-6">
          <div className="mx-auto max-w-4xl">
            <p className="mb-2 text-sm font-medium text-ai">AI Careers</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              AI Jobs Across the Gulf
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              {totalCount.toLocaleString()} active AI roles across Saudi Arabia,
              UAE, Qatar, Kuwait, Bahrain and Oman — machine learning, data
              science, LLM engineering and more.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {SUBCATEGORIES.map((s) => (
                <Link
                  key={s}
                  href={`/jobs?category=AI&subcategory=${encodeURIComponent(s)}`}
                  className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-300 transition hover:border-ai hover:text-white"
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
                    href={`/ai-jobs/${c.slug}`}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm transition hover:border-ai hover:bg-purple-50"
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
                href="/jobs?category=AI"
                className="flex items-center gap-1.5 rounded-lg border border-ai bg-purple-50 px-3 py-1.5 text-sm font-medium text-ai transition hover:bg-purple-100"
              >
                All AI Jobs ({totalCount.toLocaleString()}) →
              </Link>
            </div>
          </div>
        </section>

        {/* Job listings */}
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary">
              Latest AI Roles
            </h2>
            <Link
              href="/jobs?category=AI"
              className="text-sm text-ai hover:underline"
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
              No AI jobs at the moment. Check back soon.
            </p>
          )}
        </section>

        {/* SEO content block */}
        <section className="border-t border-gray-200 bg-white px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-3xl prose prose-sm text-gray-600">
            <h2 className="text-lg font-bold text-primary">
              AI Careers in the GCC
            </h2>
            <p className="mt-3">
              Gulf governments and sovereign wealth funds are investing billions
              in artificial intelligence. Saudi Arabia&apos;s SDAIA, the UAE&apos;s
              AI Office, and Qatar&apos;s QF are building dedicated AI ecosystems
              that demand machine learning engineers, data scientists, NLP
              researchers, and AI product managers.
            </p>
            <p className="mt-3">
              Popular frameworks in demand across GCC AI roles include
              PyTorch, TensorFlow, Hugging Face, LangChain, and OpenAI APIs. We
              surface AI vacancies from LinkedIn, Bayt, and direct postings
              daily so you never miss a role.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-white">
              Get AI job alerts by email
            </h2>
            <p className="mt-2 text-slate-300">
              Subscribe once and we&apos;ll match you to new AI and machine learning
              roles across the Gulf — no spam, only relevant roles.
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
