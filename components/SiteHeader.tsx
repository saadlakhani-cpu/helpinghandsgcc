import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-bold text-white">
            GF
          </div>
          <span className="hidden text-sm font-semibold text-primary sm:inline">
            {SITE_NAME}
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/jobs" className="transition hover:text-primary">
            Jobs
          </Link>
          <Link href="/subscribe" className="transition hover:text-primary">
            Subscribe
          </Link>
          <Link href="/admin" className="transition hover:text-primary">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
