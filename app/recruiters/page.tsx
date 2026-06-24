import { RecruiterClient } from "@/app/recruiters/RecruiterClient";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export default function RecruitersPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary px-4 py-12 text-white sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-300">
              For companies and recruiters
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Post Gulf finance and AI jobs
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Register your company, submit a hiring requirement, and request
              free initial CV screening while Helping Hands GCC launches its
              recruiter workflow.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <RecruiterClient />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
