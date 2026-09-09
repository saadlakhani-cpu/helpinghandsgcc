import Image from "next/image";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ServiceHero } from "@/components/ServiceHero";
import { ServiceTiles } from "@/components/ServiceTiles";
import { EnquiryForm } from "@/components/EnquiryForm";
export const metadata: Metadata = {
  title: "AI Training for Finance, Supply Chain, HR & Sales",
  description: "Explore role-specific AI training for individuals and corporate teams across Finance, Supply Chain, HR and Sales.",
  alternates: { canonical: "/ai-training" },
};
export default function TrainingPage({ searchParams }: { searchParams: { type?: string; topic?: string } }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <ServiceHero eyebrow="FOR INDIVIDUALS & CORPORATE TEAMS" title="Practical AI Training" description="Finance. Supply Chain. HR. Sales. Build AI skills around the work you do every day." image="/images/services/workshop.webp" action="Choose Your Track" href="#workshops" secondary={{ label: "For Corporate Teams", href: "#corporate" }} />
        <section id="workshops" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="text-sm font-semibold text-finance">FOUR TRAINING TRACKS</p>
          <h2 className="mt-2 text-3xl font-bold">Find the right starting point</h2>
          <p className="mb-8 mt-4 leading-7 text-gray-600">Every track supports individual enquiries and tailored corporate workshops.</p>
          <ServiceTiles />
        </section>
        <section id="corporate" className="border-y border-gray-200 bg-emerald-50/60 px-4 py-12 sm:px-6">
          <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
            <div className="relative aspect-[3/2] overflow-hidden rounded-lg"><Image src="/images/services/workshop.webp" alt="Illustrative corporate AI workshop" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" /></div>
            <div><p className="text-sm font-semibold text-finance">FOR CORPORATE TEAMS</p><h2 className="mt-3 text-3xl font-bold">Your team. Your tasks. Practical AI.</h2><p className="mt-4 leading-7 text-gray-600">Discuss a workshop for your finance, supply chain, HR or sales team. Agree the focus around your business needs, with practical exercises and responsible use of company data.</p><a href="?type=corporate#enquire" className="mt-7 inline-block rounded-md bg-finance px-5 py-3 text-sm font-semibold text-white">Request Corporate Training</a></div>
          </div>
        </section>
        <section id="enquire" className="mx-auto grid max-w-6xl scroll-mt-6 gap-10 px-4 py-14 sm:px-6 md:grid-cols-2">
          <div><h2 className="text-3xl font-bold">Enquire About Training</h2><p className="mt-4 max-w-md leading-7 text-gray-600">Share your interests or your team&apos;s needs. We will follow up by email. This enquiry does not reserve a place or require payment.</p><p className="mt-4 max-w-md text-sm leading-6 text-gray-500">Syllabus, trainer, format, duration, dates and pricing will be confirmed before booking. Training imagery is illustrative.</p></div>
          <EnquiryForm key={`${searchParams.type}-${searchParams.topic}`} types={["individual", "corporate"]} initialType={searchParams.type === "corporate" ? "corporate" : "individual"} initialTopic={searchParams.topic} />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
