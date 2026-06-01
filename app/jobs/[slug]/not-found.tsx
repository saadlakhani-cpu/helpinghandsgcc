import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function JobNotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">Job not found</h1>
          <p className="mt-2 text-gray-600">
            This job may have expired or been removed.
          </p>
          <Link
            href="/jobs"
            className="mt-6 inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Browse all jobs
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
