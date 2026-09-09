import Image from "next/image";
import Link from "next/link";
import { HeroSearch } from "@/components/HeroSearch";
import { JobCard } from "@/components/JobCard";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ServiceHero } from "@/components/ServiceHero";
import { ServiceTiles } from "@/components/ServiceTiles";
import { getHomePageData } from "@/lib/jobs/home-data";
import { CV_REVIEW_ROUTE, RECRUITER_FORM_URL } from "@/lib/constants";
import { formatHoursAgo } from "@/lib/utils/date";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = {
  title: "Helping Hands GCC | Careers, AI Training & Business Solutions",
  description:
    "Find GCC Finance and AI jobs, build practical AI skills, and explore solutions for your business.",
};
export default async function HomePage() {
  const { financeCount, aiCount, lastUpdated, latestFinance, latestAi } =
    await getHomePageData();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <ServiceHero
          eyebrow="CAREERS · SKILLS · BUSINESS"
          title="Helping Hands GCC"
          description="Find your next role. Build practical AI skills. Put AI to work in your business."
          image="/images/services/workshop.webp"
          action="Find Jobs"
          href="/jobs"
          secondary={{ label: "Explore Training", href: "/ai-training" }}
        />
        <section className="border-b border-gray-200 bg-white px-4 py-6 sm:px-6">
          <HeroSearch />
          <div className="mx-auto mt-5 flex max-w-6xl flex-wrap justify-center gap-6 text-sm text-gray-600">
            <span>
              <strong className="text-finance">
                {financeCount.toLocaleString()}
              </strong>{" "}
              Finance jobs
            </span>
            <span>
              <strong className="text-ai">{aiCount.toLocaleString()}</strong> AI
              jobs
            </span>
            <span>Updated {formatHoursAgo(lastUpdated)}</span>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-8">
            <p className="text-sm font-semibold text-finance">YOUR NEXT STEP</p>
            <h2 className="mt-2 text-3xl font-bold">
              Learn AI. Put it to work.
            </h2>
          </div>
          <ServiceTiles />
        </section>
        <section className="border-y border-gray-200 bg-emerald-50/60 px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl font-bold">See what AI can do at work</h2>
              <span className="text-xs font-semibold text-finance">
                EXAMPLE WORKFLOW
              </span>
            </div>
            <div className="mt-7 grid items-center gap-8 md:grid-cols-2">
              <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
                <Image
                  src="/images/services/workflow.webp"
                  alt="Illustrative invoice, extracted spreadsheet and report"
                  fill
                  sizes="(max-width:768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div>
                <ol className="space-y-5">
                  {[
                    "Start with your documents",
                    "Extract and organise key fields",
                    "Review the result with your team",
                  ].map((step, i) => (
                    <li key={step} className="flex items-center gap-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-finance text-sm font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="font-semibold">{step}</span>
                    </li>
                  ))}
                </ol>
                <Link
                  href="/ai-solutions"
                  className="mt-8 inline-block font-semibold text-finance"
                >
                  Explore AI Solutions &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>
        {[
          {
            title: "Latest Finance Jobs",
            category: "Finance",
            jobs: latestFinance,
          },
          { title: "Latest AI Jobs", category: "AI", jobs: latestAi },
        ].map((group) => (
          <section
            key={group.category}
            className="mx-auto max-w-6xl px-4 py-12 sm:px-6"
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold">{group.title}</h2>
              <Link
                href={`/jobs?category=${group.category}`}
                className="text-sm font-semibold text-finance"
              >
                View all &rarr;
              </Link>
            </div>
            {group.jobs.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {group.jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <p className="py-6 text-gray-500">
                No roles to display yet. Check back soon.
              </p>
            )}
          </section>
        ))}
        <section className="border-t border-gray-200 bg-white px-4 py-12 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {[
              {
                title: "A stronger CV",
                text: "Request a review for your next finance or AI opportunity.",
                href: CV_REVIEW_ROUTE,
                action: "Request CV Review",
              },
              {
                title: "Find your next hire",
                text: "Submit a role for review and reach GCC professionals.",
                href: RECRUITER_FORM_URL,
                action: "For Recruiters",
              },
              {
                title: "Jobs that match you",
                text: "Set your preferences and subscribe for relevant roles.",
                href: "/subscribe",
                action: "Create Job Alerts",
              },
            ].map((s) => (
              <div key={s.title}>
                <h2 className="text-xl font-bold">{s.title}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">{s.text}</p>
                <Link
                  className="mt-4 inline-block text-sm font-semibold text-finance"
                  href={s.href}
                >
                  {s.action} &rarr;
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
