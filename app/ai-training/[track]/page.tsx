import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ServiceHero } from "@/components/ServiceHero";
import { EnquiryForm } from "@/components/EnquiryForm";
import { findTrainingTrack, trainingTracks } from "@/lib/training";

type Props = { params: { track: string }; searchParams: { type?: string } };
export function generateStaticParams() {
  return trainingTracks.map(({ slug }) => ({ track: slug }));
}
export function generateMetadata({ params }: Props): Metadata {
  const track = findTrainingTrack(params.track);
  if (!track) return {};
  return { title: `${track.title} Training`, description: track.summary, alternates: { canonical: `/ai-training/${track.slug}` } };
}
export default function TrainingTrackPage({ params, searchParams }: Props) {
  const track = findTrainingTrack(params.track);
  if (!track) notFound();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <ServiceHero eyebrow="INDIVIDUAL & CORPORATE TRAINING" title={track.title} description={track.summary} image={`/images/services/${track.image}.webp`} action="Enquire About Training" href="#enquire" secondary={{ label: "Train Your Team", href: "?type=corporate#enquire" }} />
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <Link href="/ai-training" className="text-sm font-semibold text-finance">&larr; All Training Tracks</Link>
          <p className="mt-8 text-sm font-semibold text-finance">{track.audience}</p>
          <h2 className="mt-3 text-3xl font-bold">Practical topics for your work</h2>
          <div className="mt-7 grid gap-6 md:grid-cols-3">
            {track.topics.map((topic, index) => <div key={topic} className="border-t-2 border-emerald-600 pt-5"><span className="text-sm font-semibold text-finance">0{index + 1}</span><h3 className="mt-3 text-xl font-semibold">{topic}</h3></div>)}
          </div>
        </section>
        <section className="border-y border-gray-200 bg-emerald-50/60 px-4 py-12 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
            <div><p className="text-sm font-semibold text-finance">EXAMPLE EXERCISE</p><h2 className="mt-3 text-2xl font-bold">Learn with realistic tasks</h2><p className="mt-4 leading-7 text-gray-700">{track.exercise}</p></div>
            <div><h2 className="text-2xl font-bold">For you or your team</h2><p className="mt-4 leading-7 text-gray-700">Discuss individual learning or a corporate workshop shaped around your department. Exercises use sample or approved, anonymised data, with human review of AI outputs.</p><p className="mt-4 text-sm text-gray-600">The syllabus, trainer, delivery format, duration, dates and pricing will be confirmed before booking. Images are illustrative.</p></div>
          </div>
        </section>
        <section id="enquire" className="mx-auto grid max-w-6xl scroll-mt-6 gap-10 px-4 py-14 sm:px-6 md:grid-cols-2">
          <div><h2 className="text-3xl font-bold">Enquire About Training</h2><p className="mt-4 leading-7 text-gray-600">Tell us about your role or your team. We will follow up by email. This is an enquiry, not a booking or payment.</p></div>
          <EnquiryForm key={searchParams.type || "individual"} types={["individual", "corporate"]} initialType={searchParams.type === "corporate" ? "corporate" : "individual"} initialTopic={track.topic} />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
