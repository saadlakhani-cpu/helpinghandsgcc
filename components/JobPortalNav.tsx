import Link from "next/link";
import { CV_REVIEW_ROUTE } from "@/lib/constants";

export function JobPortalNav() {
  return <section className="border-b border-gray-200 bg-white px-4 py-6 sm:px-6">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5">
      <div><h1 className="text-2xl font-bold">Job Portal</h1><p className="mt-1 text-sm text-gray-600">Finance and AI careers across the GCC</p></div>
      <nav aria-label="Job portal services" className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-finance">
        <Link href="/jobs">Find Jobs</Link><Link href={CV_REVIEW_ROUTE}>CV Review</Link><Link href="/subscribe">Job Alerts</Link><Link href="/recruiters">Recruiters / Post a Job</Link><Link href="/profile">My Profile</Link>
      </nav>
    </div>
  </section>;
}
