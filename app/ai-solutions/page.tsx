import Image from "next/image";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ServiceHero } from "@/components/ServiceHero";
import { EnquiryForm } from "@/components/EnquiryForm";
export const metadata: Metadata = {
  title: "AI Solutions for Business",
  description:
    "Explore practical AI workflows for finance, documents, recruitment and internal knowledge.",
  alternates: { canonical: "/ai-solutions" },
};
const solutions = [
  {
    title: "Finance reporting and workflow automation",
    label: "Finance Reporting",
    steps: ["Reporting inputs", "Draft commentary", "Team review"],
    text: "Prepare recurring reports with a clear review step.",
  },
  {
    title: "Document and invoice extraction",
    label: "Document Processing",
    steps: ["Invoices and documents", "Structured fields", "Checked records"],
    text: "Turn document information into organised records.",
  },
  {
    title: "Recruitment and CV workflows",
    label: "Recruitment Workflows",
    steps: ["Applications", "Review summaries", "Human decisions"],
    text: "Organise applications and support your team's review.",
  },
  {
    title: "Internal knowledge assistants",
    label: "Company Knowledge",
    steps: ["Approved documents", "Relevant answers", "Source references"],
    text: "Help staff find answers in company materials.",
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
        <ServiceHero
          eyebrow="PRACTICAL AI FOR YOUR BUSINESS"
          title="AI Solutions for Business"
          description="Start with one task. Explore a better way to get it done."
          image="/images/services/workflow.webp"
          action="Explore Solutions"
          href="#solutions"
          secondary={{ label: "Discuss Your Requirement", href: "#enquire" }}
        />
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-finance">
                EXAMPLE WORKFLOW
              </p>
              <h2 className="mt-3 text-3xl font-bold">
                From documents to decisions
              </h2>
              <p className="mt-4 leading-7 text-gray-600">
                Extract useful information, organise it and give your team a
                clear result to review.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
                <span className="rounded-md bg-emerald-50 px-3 py-2">
                  Document
                </span>
                <span aria-hidden="true" className="py-2">
                  &rarr;
                </span>
                <span className="rounded-md bg-cyan-50 px-3 py-2">
                  Structured data
                </span>
                <span aria-hidden="true" className="py-2">
                  &rarr;
                </span>
                <span className="rounded-md bg-gray-100 px-3 py-2">
                  Reviewed report
                </span>
              </div>
            </div>
            <figure>
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
                <Image
                  src="/images/services/workflow.webp"
                  alt="Illustrative example of an invoice, extracted spreadsheet and reviewed report"
                  fill
                  sizes="(max-width:768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-2 text-xs text-gray-500">
                Illustrative example, not a customer result or live product
                demonstration.
              </figcaption>
            </figure>
          </div>
        </section>
        <section
          id="solutions"
          className="border-y border-gray-200 bg-white px-4 py-12 sm:px-6"
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold">
              Where could AI help your team?
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {solutions.map((s, i) => (
                <article
                  key={s.title}
                  className="rounded-lg border border-gray-200 p-6"
                >
                  <p className="text-sm font-semibold text-finance">0{i + 1}</p>
                  <h3 className="mt-3 text-2xl font-bold">{s.label}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {s.text}
                  </p>
                  <ol className="mt-5 space-y-2 border-l-2 border-emerald-200 pl-4 text-sm">
                    {s.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                  <a
                    href={`?topic=${encodeURIComponent(s.title)}#enquire`}
                    className="mt-6 inline-block font-semibold text-finance"
                  >
                    Discuss Your Requirement &rarr;
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          id="enquire"
          className="mx-auto grid max-w-6xl scroll-mt-6 gap-10 px-4 py-14 sm:px-6 md:grid-cols-2"
        >
          <div>
            <p className="text-sm font-semibold text-finance">
              START A CONVERSATION
            </p>
            <h2 className="mt-3 text-3xl font-bold">
              What would you like to improve?
            </h2>
            <p className="mt-4 max-w-md leading-7 text-gray-600">
              Tell us about the process and your desired outcome. We will
              discuss feasibility, scope, pricing and timing before any work
              begins.
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
