import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { JobCard } from "@/components/JobCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  getCategoryPageData,
  getCountryMeta,
  COUNTRY_META,
} from "@/lib/seo/category-page";

export const revalidate = 3600;

type Props = { params: { country: string } };

export async function generateStaticParams() {
  return COUNTRY_META.map((c) => ({ country: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const meta = getCountryMeta(params.country);
  if (!meta) return { title: "AI Jobs | Gulf Finance & AI Jobs" };

  const title = `AI Jobs in ${meta.fullLabel}`;
  const description = `Browse AI and machine learning jobs in ${meta.fullLabel}. Data science, LLM engineering, NLP, and computer vision roles in ${meta.label}.`;

  return {
    title,
    description,
    keywords: [
      `AI jobs ${meta.label}`,
      `machine learning jobs ${meta.label}`,
      `data science jobs ${meta.label}`,
      `AI engineer ${meta.label}`,
      `LLM jobs ${meta.fullLabel}`,
    ],
    openGraph: { title: `${title} | Gulf Finance & AI Jobs`, description },
    alternates: { canonical: `/ai-jobs/${params.country}` },
  };
}

export default async function AiJobsByCountryPage({ params }: Props) {
  const meta = getCountryMeta(params.country);
  if (!meta) notFound();

  const { topJobs, totalCount } = await getCategoryPageData("AI", meta.dbCode);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
          <nav className="mx-auto flex max-w-6xl items-center gap-1 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/ai-jobs" className="hover:text-primary">AI Jobs</Link>
            <span>/</span>
            <span className="text-primary font-medium">{meta.fullLabel}</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="bg-primary px-4 py-14 text-white sm:px-6">
          <div className="mx-auto max-w-4xl">
            <p className="mb-2 text-2xl">{meta.flag}</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              AI Jobs in {meta.fullLabel}
            </h1>
            <p className="mt-3 text-slate-300">
              {totalCount > 0
                ? `${totalCount.toLocaleString()} active AI roles in ${meta.label} — machine learning, data science, LLM engineering, NLP and computer vision.`
                : `AI roles in ${meta.label} — check back daily for new listings.`}
            </p>
            <div className="mt-5">
              <Link
                href={`/jobs?category=AI&country=${meta.dbCode}`}
                className="rounded-md bg-ai px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
              >
                View all {totalCount.toLocaleString()} AI jobs in {meta.label} →
              </Link>
            </div>
          </div>
        </section>

        {/* Sibling country nav */}
        <section className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Other countries:
            </span>
            {COUNTRY_META.filter((c) => c.slug !== params.country).map((c) => (
              <Link
                key={c.slug}
                href={`/ai-jobs/${c.slug}`}
                className="rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-600 transition hover:border-ai hover:text-ai"
              >
                {c.flag} {c.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Job listings */}
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary">
              Latest AI Roles in {meta.label}
            </h2>
            <Link
              href={`/jobs?category=AI&country=${meta.dbCode}`}
              className="text-sm text-ai hover:underline"
            >
              See all {totalCount.toLocaleString()} →
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
              No AI jobs in {meta.label} right now — check back soon or{" "}
              <Link href="/subscribe" className="text-ai underline">
                subscribe for alerts
              </Link>
              .
            </p>
          )}
        </section>

        {/* CTA */}
        <section className="bg-primary px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-white">
              Never miss an AI role in {meta.label}
            </h2>
            <p className="mt-2 text-slate-300">
              Subscribe and we&apos;ll alert you the moment new AI jobs appear in{" "}
              {meta.fullLabel}.
            </p>
            <Link
              href="/subscribe"
              className="mt-6 inline-block rounded-md bg-white px-6 py-2.5 text-sm font-medium text-primary transition hover:bg-slate-100"
            >
              Get Alerts →
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
