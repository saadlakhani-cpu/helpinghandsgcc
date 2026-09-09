import Link from "next/link";
import { AuthNav } from "@/components/AuthNav";
import { SITE_NAME } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-bold text-white">
            GF
          </div>
          <span className="hidden text-sm font-semibold text-primary sm:inline">
            {SITE_NAME}
          </span>
        </Link>
        <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-medium text-gray-700">
          <Link href="/" className="transition hover:text-primary">
            Home
          </Link>
          <Link href="/jobs" className="transition hover:text-primary">
            Jobs
          </Link>
          <Link href="/ai-training" className="transition hover:text-primary">
            AI Training
          </Link>
          <Link href="/ai-solutions" className="transition hover:text-primary">
            AI Solutions
          </Link>
          <Link href="/recruiters" className="transition hover:text-primary">
            For Recruiters
          </Link>
          <Link href="/profile" className="transition hover:text-primary">
            Profile
          </Link>
          <AuthNav />
        </nav>
      </div>
    </header>
  );
}
