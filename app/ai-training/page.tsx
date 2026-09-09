import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { EnquiryForm } from "@/components/EnquiryForm";

export const metadata: Metadata = {
  title: "Practical AI Training",
  description:
    "Register interest in practical AI training for finance professionals, individuals and corporate teams across the GCC.",
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
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <p className="text-sm font-semibold text-finance">
            Helping Hands GCC
          </p>
          <h1 className="mt-3 text-3xl font-bold">Practical AI Training</h1>
          <p className="mt-4 max-w-2xl text-lg leading-7 text-gray-600">
            Build skills you can use in your next report, presentation or
            working day. Explore training for yourself or your team.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <article className="rounded-lg border border-gray-200 bg-white p-6">
              <p className="text-sm font-semibold text-finance">
                For finance professionals
              </p>
              <h2 className="mt-2 text-xl font-bold">
                AI for Finance Professionals
              </h2>
              <p className="mt-3 leading-6 text-gray-600">
                For accountants, analysts and finance managers who want to use
                AI in everyday work.
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-700">
                <li>Draft management commentary and presentation outlines.</li>
                <li>
                  Use AI to explain formulas and support spreadsheet analysis.
                </li>
                <li>
                  Check outputs and handle confidential information carefully.
                </li>
              </ul>
              <a
                href="?type=individual&topic=AI%20for%20Finance%20Professionals#enquire"
                className="mt-6 inline-block font-semibold text-finance underline underline-offset-4"
              >
                Register Interest
              </a>
            </article>
            <article className="rounded-lg border border-gray-200 bg-white p-6">
              <p className="text-sm font-semibold text-finance">
                For working professionals
              </p>
              <h2 className="mt-2 text-xl font-bold">
                AI Productivity at Work
              </h2>
              <p className="mt-3 leading-6 text-gray-600">
                For people looking to make research, writing and document tasks
                more efficient.
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-700">
                <li>Write clear prompts for everyday business tasks.</li>
                <li>
                  Turn documents and notes into useful drafts and action lists.
                </li>
                <li>
                  Evaluate answers and build repeatable personal workflows.
                </li>
              </ul>
              <a
                href="?type=individual&topic=AI%20Productivity%20at%20Work#enquire"
                className="mt-6 inline-block font-semibold text-finance underline underline-offset-4"
              >
                Register Interest
              </a>
            </article>
          </div>
        </section>
        <section
          id="corporate"
          className="border-y border-gray-200 bg-white px-4 py-12 sm:px-6"
        >
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-finance">
                For corporate teams
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                Learn AI through your team&apos;s real tasks
              </h2>
              <p className="mt-4 leading-7 text-gray-600">
                Discuss a workshop for your finance, recruitment or operations
                team, shaped around their experience and business needs.
              </p>
              <a
                href="?type=corporate#enquire"
                className="mt-6 inline-block rounded-md bg-finance px-5 py-3 text-sm font-semibold text-white"
              >
                Request Corporate Training
              </a>
            </div>
            <div className="space-y-4 text-gray-700">
              <h3 className="font-semibold">Workshop formats to discuss</h3>
              <p>2-hour AI awareness session</p>
              <p>Half-day practical workshop</p>
              <p>Full-day workshop focused on a department</p>
              <p className="border-t border-gray-200 pt-4 text-sm leading-6 text-gray-500">
                Delivery format, trainer, duration, dates and pricing will be
                confirmed before booking. Registration of interest does not
                reserve a place.
              </p>
            </div>
          </div>
        </section>
        <section
          id="enquire"
          className="mx-auto grid max-w-6xl scroll-mt-6 gap-10 px-4 py-12 sm:px-6 md:grid-cols-2"
        >
          <div>
            <h2 className="text-2xl font-bold">
              Tell us what you want to learn
            </h2>
            <p className="mt-4 leading-7 text-gray-600">
              Register your interest as an individual or share your corporate
              training needs. We will follow up by email with next steps.
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
