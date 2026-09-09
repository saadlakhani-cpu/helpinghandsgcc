import Link from "next/link";

// Verbatim excerpts approved by the site owner for publication on 2026-09-09.
const feedback = [
  {
    name: "Yasir Edhi",
    initials: "YE",
    attribution: "Participant · Ulker SA",
    quote: "The hands-on projects helped me build solid practical skills instead of just learning theory.",
  },
  {
    name: "Fatima",
    initials: "F",
    attribution: "Participant · Fresh graduate",
    quote: "I found the training very valuable and practical. It helped me understand how AI tools can be applied in finance, especially in data analysis and KPI tracking.",
  },
  {
    name: "Jawwad Haqqi",
    initials: "JH",
    attribution: "Participant · ACWA Power",
    quote: "Also, appreciate your long hours post our session for my practical project. I believe the investment paid off.",
  },
  {
    name: "Moinuddin",
    initials: "M",
    attribution: "Participant · Canada",
    quote: "The course made AI feel practical and approachable, and I’ve come away with both useful skills and a lot more confidence.",
  },
  {
    name: "Hadil",
    initials: "H",
    attribution: "Participant · Fresh graduate",
    quote: "You explained really well and showed us how to do it and what we can use and that’s very helpful and taught me knew things, the timing was really good but unfortunately I was caught up with my studies.",
  },
] as const;

export function ParticipantFeedback({ full = false }: { full?: boolean }) {
  const entries = full ? feedback : feedback.slice(0, 3);
  return (
    <section id="participant-feedback" aria-labelledby="participant-feedback-title" className="border-t border-gray-200 bg-white px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-semibold text-finance">FROM PREVIOUS AI TRAINING PARTICIPANTS</p>
            <h2 id="participant-feedback-title" className="mt-3 text-3xl font-bold">What participants say</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-gray-600">Practical projects, clearer understanding and confidence to apply AI at work.</p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry, index) => (
            <figure key={entry.name} className={`flex min-w-0 flex-col rounded-lg border p-6 ${index === 0 ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-gray-50"}`}>
              <span aria-hidden="true" className="h-9 font-serif text-5xl leading-none text-finance">&ldquo;</span>
              <blockquote className="mb-7 mt-3 flex-1 text-base leading-7 text-primary">{entry.quote}</blockquote>
              <figcaption className="flex items-center gap-3 border-t border-gray-200 pt-4">
                <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">{entry.initials}</span>
                <div><p className="text-sm font-semibold">{entry.name}</p><p className="mt-1 text-xs text-gray-600">{entry.attribution}</p></div>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-5 text-xs leading-5 text-gray-500">Excerpts from individual participant feedback. Affiliations describe participants, not company endorsements or corporate client relationships.</p>
        {!full && <Link href="/ai-training/finance#participant-feedback" className="mt-5 inline-block text-sm font-semibold text-finance">More participant feedback &rarr;</Link>}
      </div>
    </section>
  );
}
