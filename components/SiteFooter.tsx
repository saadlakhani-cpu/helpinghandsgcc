import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/constants";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-bold text-white">
                GF
              </div>
              <span className="text-sm font-semibold text-primary">{SITE_NAME}</span>
            </div>
            <p className="text-xs leading-5 text-gray-500">
              The Gulf region&apos;s specialist job board for Finance &amp; AI
              careers across KSA, UAE, and wider GCC.
            </p>
          </div>

          {/* Jobs */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
              Jobs
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/jobs?category=Finance" className="hover:text-primary">Finance Jobs</Link></li>
              <li><Link href="/jobs?category=AI" className="hover:text-primary">AI Jobs</Link></li>
              <li><Link href="/jobs?country=KSA" className="hover:text-primary">Jobs in KSA</Link></li>
              <li><Link href="/jobs?country=UAE" className="hover:text-primary">Jobs in UAE</Link></li>
              <li><Link href="/subscribe" className="hover:text-primary">Job Alerts</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
              Services
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/recruiters" className="hover:text-primary">Post a Job</Link></li>
              <li><Link href="/recruiters" className="hover:text-primary">Recruiter Portal</Link></li>
              <li>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLScLE8DDCoR5fwD-DCp0eFnKqjWj1G19nvsXX0_eIQNUlFJZDQ/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  CV Review
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & legal */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-primary">
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-6 sm:flex-row">
          <p className="text-xs text-gray-400">
            &copy; {year} {SITE_NAME}. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-400">
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
