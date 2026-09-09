import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ServiceHero } from "@/components/ServiceHero";
import { ServiceTiles } from "@/components/ServiceTiles";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata = {
  title: { absolute: "Helping Hands GCC | AI Training & Solutions" },
  description: "Practical AI training for Finance, Supply Chain, HR and Sales. Explore individual learning, corporate workshops and AI business solutions.",
  alternates: { canonical: "/" },
};
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <ServiceHero eyebrow="AI TRAINING & BUSINESS SOLUTIONS" title="Helping Hands GCC" description="Build practical AI skills. Put them to work in your business. Training for Finance, Supply Chain, HR and Sales." image="/images/services/workshop.webp" action="Explore Training" href="/ai-training" secondary={{ label: "Discuss Your AI Needs", href: "/ai-solutions#enquire" }} />
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="text-sm font-semibold text-finance">FOUR FUNCTIONS. PRACTICAL AI.</p>
          <h2 className="mt-2 text-3xl font-bold">AI training for the work you do</h2>
          <p className="mb-8 mt-4 max-w-2xl leading-7 text-gray-600">Choose your track. Learn as an individual or discuss a workshop for your corporate team.</p>
          <ServiceTiles />
        </section>
        <section className="border-y border-gray-200 bg-emerald-50/60 px-4 py-14 sm:px-6">
          <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
            <div className="relative aspect-[3/2] overflow-hidden rounded-lg"><Image src="/images/services/workflow.webp" alt="Illustrative document extraction workflow with an invoice, spreadsheet and report" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" /></div>
            <div><p className="text-sm font-semibold text-finance">AI SOLUTIONS</p><h2 className="mt-3 text-3xl font-bold">From repetitive tasks to useful workflows</h2><p className="mt-4 leading-7 text-gray-700">Explore document extraction, reporting automation and internal knowledge assistants. Start with a business problem, agree the scope, and keep your team in control.</p><p className="mt-3 text-xs text-gray-500">Illustrative document-to-report workflow.</p><Link href="/ai-solutions" className="mt-6 inline-block rounded-md bg-finance px-5 py-3 text-sm font-semibold text-white">Explore AI Solutions &rarr;</Link></div>
          </div>
        </section>
        <section id="about" className="mx-auto grid max-w-6xl scroll-mt-6 gap-8 px-4 py-14 sm:px-6 md:grid-cols-2">
          <div><p className="text-sm font-semibold text-finance">ABOUT HELPING HANDS GCC</p><h2 className="mt-3 text-3xl font-bold">Practical learning. Business application.</h2></div>
          <div><p className="leading-7 text-gray-600">We bring together role-specific AI training and business solution enquiries for professionals and teams across the GCC. Our focus is the work people actually do: reports, planning, people operations and customer relationships.</p><p className="mt-4 leading-7 text-gray-600">Discuss your goals before booking. Training scope, delivery, dates and pricing are confirmed individually.</p></div>
        </section>
        <section className="border-y border-gray-200 bg-white px-4 py-10 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6"><div><p className="text-sm font-semibold text-finance">ALSO FROM HELPING HANDS GCC</p><h2 className="mt-2 text-2xl font-bold">Your next opportunity starts here</h2><p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">Explore Finance and AI jobs, request a CV review, set up alerts or post a role through our dedicated Job Portal.</p></div><Link href="/jobs" className="rounded-md border border-finance px-5 py-3 text-sm font-semibold text-finance">Visit Job Portal &rarr;</Link></div>
        </section>
        <section id="contact" className="mx-auto max-w-6xl scroll-mt-6 px-4 py-14 sm:px-6">
          <h2 className="text-3xl font-bold">What would you like to build or learn?</h2>
          <div className="mt-6 flex flex-wrap gap-4"><Link href="/ai-training#enquire" className="rounded-md bg-finance px-5 py-3 text-sm font-semibold text-white">Enquire About Training</Link><Link href="/ai-solutions#enquire" className="rounded-md border border-finance px-5 py-3 text-sm font-semibold text-finance">Discuss Your AI Needs</Link></div>
          <a href={`mailto:${CONTACT_EMAIL}`} className="mt-6 inline-block break-all text-sm text-gray-600 underline">{CONTACT_EMAIL}</a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
