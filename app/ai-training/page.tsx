import Image from "next/image";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ServiceHero } from "@/components/ServiceHero";
import { EnquiryForm } from "@/components/EnquiryForm";
export const metadata: Metadata = {
  title: "Practical AI Training",
  description:
    "Explore practical AI training for finance professionals and corporate teams across the GCC.",
  alternates: { canonical: "/ai-training" },
};
export default function TrainingPage({
  searchParams,
}: {
  searchParams: { type?: string; topic?: string };
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <ServiceHero
          eyebrow="LEARN IT. USE IT."
          title="Practical AI Training"
          description="Bring AI into your next report, presentation or working day."
          image="/images/services/workshop.webp"
          action="Explore Workshops"
          href="#workshops"
          secondary={{ label: "For Corporate Teams", href: "#corporate" }}
        />
        <section
          id="workshops"
          className="mx-auto max-w-6xl px-4 py-14 sm:px-6"
        >
          <p className="text-sm font-semibold text-finance">FOR INDIVIDUALS</p>
          <h2 className="mt-2 text-3xl font-bold">
            Skills that belong in your working day
          </h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {[
              {
                title: "AI for Finance Professionals",
                image: "finance",
                audience: "Accountants · Analysts · Finance managers",
                outcomes: [
                  "Draft reporting commentary",
                  "Work confidently with spreadsheets",
                  "Check AI outputs before using them",
                ],
              },
              {
                title: "AI Productivity at Work",
                image: "workshop",
                audience: "Business professionals · Teams · Beginners",
                outcomes: [
                  "Write clearer prompts",
                  "Turn notes into useful drafts",
                  "Build repeatable workflows",
                ],
              },
            ].map((course) => (
              <article
                key={course.title}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white"
              >
                <div className="relative aspect-[16/9]">
                  <Image
                    src={`/images/services/${course.image}.webp`}
                    alt={
                      course.image === "finance"
                        ? "Illustrative finance professional using a spreadsheet"
                        : "Illustrative practical AI workshop"
                    }
                    fill
                    sizes="(max-width:768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold text-finance">
                    {course.audience}
                  </p>
                  <h3 className="mt-3 text-2xl font-bold">{course.title}</h3>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    {course.outcomes.map((outcome) => (
                      <li key={outcome} className="flex gap-2">
                        <span
                          aria-hidden="true"
                          className="font-bold text-finance"
                        >
                          &#10003;
                        </span>
                        {outcome}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`?type=individual&topic=${encodeURIComponent(course.title)}#enquire`}
                    className="mt-6 inline-block rounded-md bg-finance px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Register Interest
                  </a>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Illustrative workshop imagery. Trainer, format, duration, dates and
            pricing will be confirmed before booking.
          </p>
        </section>
        <section
          id="corporate"
          className="border-y border-gray-200 bg-emerald-50/60 px-4 py-12 sm:px-6"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
            <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
              <Image
                src="/images/services/workshop.webp"
                alt="Illustrative team workshop"
                fill
                sizes="(max-width:768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-finance">
                FOR CORPORATE TEAMS
              </p>
              <h2 className="mt-3 text-3xl font-bold">
                Your team. Your tasks. Practical AI.
              </h2>
              <p className="mt-4 leading-7 text-gray-600">
                Discuss a session built around the work your finance,
                recruitment or operations team actually does.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  "2-hour awareness",
                  "Half-day workshop",
                  "Full-day department session",
                ].map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-emerald-200 bg-white px-3 py-2 text-xs font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <a
                href="?type=corporate#enquire"
                className="mt-7 inline-block rounded-md bg-finance px-5 py-3 text-sm font-semibold text-white"
              >
                Request Corporate Training
              </a>
            </div>
          </div>
        </section>
        <section
          id="enquire"
          className="mx-auto grid max-w-6xl scroll-mt-6 gap-10 px-4 py-14 sm:px-6 md:grid-cols-2"
        >
          <div>
            <p className="text-sm font-semibold text-finance">
              LET&apos;S GET STARTED
            </p>
            <h2 className="mt-3 text-3xl font-bold">
              Tell us what you want to learn
            </h2>
            <p className="mt-4 max-w-md leading-7 text-gray-600">
              Share your interests or your team&apos;s needs. We will follow up by
              email. Registering interest does not reserve a place or require
              payment.
            </p>
          </div>
          <EnquiryForm
            key={`${searchParams.type}-${searchParams.topic}`}
            types={["individual", "corporate"]}
            initialType={
              searchParams.type === "corporate" ? "corporate" : "individual"
            }
            initialTopic={searchParams.topic}
          />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
