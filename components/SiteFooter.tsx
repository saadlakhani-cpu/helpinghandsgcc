import { SITE_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-500 sm:px-6">
        <p>
          © {new Date().getFullYear()} {SITE_NAME}. Gulf region Finance & AI
          jobs.
        </p>
      </div>
    </footer>
  );
}
