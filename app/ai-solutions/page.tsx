import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { EnquiryForm } from "@/components/EnquiryForm";

export const metadata: Metadata = {
  title: "AI Solutions for Business",
  description:
    "Discuss AI workflows for finance reporting, document extraction, recruitment and internal knowledge with Helping Hands GCC.",
  alternates: { canonical: "/ai-solutions" },
};
const solutions = [
  {
    title: "Finance reporting and workflow automation",
    problem: "Too much time spent preparing recurring reports?",
    outcome:
      "Explore workflows that organise inputs and prepare draft reporting commentary for your team to review.",
  },
  {
    title: "Document and invoice extraction",
    problem: "Copying information from documents into spreadsheets?",
    outcome:
      "Discuss extracting key fields into structured records, with checks for missing or uncertain values.",
  },
  {
    title: "Recruitment and CV workflows",
    problem: "Applications arrive in different formats and places?",
    outcome:
      "Explore organising candidate information and preparing review summaries, with hiring decisions kept with your team.",
  },
  {
    title: "Internal knowledge assistants",
    problem: "Answers are spread across policies and documents?",
    outcome:
      "Discuss an assistant that helps staff find information in approved company materials and points them to the source.",
  },
];
export default function SolutionsPage({
  searchParams,
}: {
  searchParams: { topic?: string };
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <p className="text-sm font-semibold text-finance">
            Helping Hands GCC
          </p>
          <h1 className="mt-3 text-3xl font-bold">AI Solutions for Business</h1>
          <p className="mt-4 max-w-2xl text-lg leading-7 text-gray-600">
            Start with a task that takes too much time. Let&apos;s explore where
            AI could help your finance, recruitment or operations team.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {solutions.map((item) => (
              <article
                key={item.title}
                className="rounded-lg border border-gray-200 bg-white p-6"
              >
                <h2 className="text-xl font-bold">{item.title}</h2>
                <p className="mt-3 font-medium text-gray-800">{item.problem}</p>
                <p className="mt-2 leading-7 text-gray-600">{item.outcome}</p>
                <a
                  href={`?topic=${encodeURIComponent(item.title)}#enquire`}
                  className="mt-5 inline-block font-semibold text-finance underline underline-offset-4"
                >
                  Discuss Your Requirement
                </a>
              </article>
            ))}
          </div>
        </section>
        <section className="border-y border-gray-200 bg-white px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold">
              From a business problem to a practical scope
            </h2>
            <ol className="mt-6 grid list-inside list-decimal gap-6 text-gray-700 md:grid-cols-3">
              <li>Discuss the task and your desired outcome.</li>
              <li>Review feasibility, data needs and human checks.</li>
              <li>
                Agree deliverables, pricing and timing before work begins.
              </li>
            </ol>
          </div>
        </section>
        <section
          id="enquire"
          className="mx-auto grid max-w-6xl scroll-mt-6 gap-10 px-4 py-12 sm:px-6 md:grid-cols-2"
        >
          <div>
            <h2 className="text-2xl font-bold">
              What would you like to improve?
            </h2>
            <p className="mt-4 leading-7 text-gray-600">
              Tell us about your process and where your team needs help. A short
              description is enough to start the conversation.
            </p>
          </div>
          <EnquiryForm
            key={searchParams.topic}
            types={["solution"]}
            initialTopic={searchParams.topic}
          />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
