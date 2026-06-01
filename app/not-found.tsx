import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <p className="text-6xl font-bold text-gray-200">404</p>
        <h1 className="mt-4 text-2xl font-bold text-primary">Page not found</h1>
        <p className="mt-2 text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/jobs"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Browse Jobs →
          </Link>
          <Link
            href="/"
            className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Go Home
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
