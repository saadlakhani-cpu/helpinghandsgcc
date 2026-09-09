import Link from "next/link";
import { AuthNav } from "@/components/AuthNav";
function Navigation() {
  return (
    <>
      <Link href="/jobs" className="hover:text-finance">
        Jobs
      </Link>
      <Link href="/ai-training" className="hover:text-finance">
        AI Training
      </Link>
      <Link href="/ai-solutions" className="hover:text-finance">
        AI Solutions
      </Link>
      <Link href="/recruiters" className="hover:text-finance">
        For Recruiters
      </Link>
      <Link href="/profile" className="hover:text-finance">
        Profile
      </Link>
      <AuthNav />
    </>
  );
}
export function SiteHeader() {
  return (
    <header className="relative z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Link
          href="/"
          aria-label="Helping Hands GCC home"
          className="text-lg font-bold text-primary sm:text-xl"
        >
          Helping Hands <span className="text-finance">GCC</span>
        </Link>
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-6 text-sm font-medium text-gray-700 lg:flex"
        >
          <Navigation />
        </nav>
        <details className="group lg:hidden">
          <summary className="cursor-pointer list-none rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold">
            Menu
          </summary>
          <nav
            aria-label="Mobile navigation"
            className="absolute left-0 right-0 top-full flex flex-col gap-5 border-b border-gray-200 bg-white px-6 py-6 shadow-md"
          >
            <Navigation />
          </nav>
        </details>
      </div>
    </header>
  );
}
