"use client";

import Link from "next/link";
import {
  buildJobsSearchParams,
  type JobsFilterState,
} from "@/lib/jobs/search-params";

type JobsPaginationProps = {
  filters: JobsFilterState;
  page: number;
  totalPages: number;
};

export function JobsPagination({
  filters,
  page,
  totalPages,
}: JobsPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  function hrefForPage(targetPage: number) {
    const params = buildJobsSearchParams({
      ...filters,
      page: String(targetPage),
    });
    return `/jobs?${params}`;
  }

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
      aria-label="Pagination"
    >
      {page > 1 && (
        <PaginationLink href={hrefForPage(page - 1)} label="← Previous" />
      )}
      {pages.map((p) =>
        p === "..." ? (
          <span key={`ellipsis-${p}-${page}`} className="px-2 text-gray-400">
            …
          </span>
        ) : (
          <PaginationLink
            key={p}
            href={hrefForPage(p)}
            label={String(p)}
            active={p === page}
          />
        )
      )}
      {page < totalPages && (
        <PaginationLink href={hrefForPage(page + 1)} label="Next →" />
      )}
    </nav>
  );
}

function PaginationLink({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-primary text-white"
          : "border border-gray-200 text-gray-700 hover:bg-gray-50"
      }`}
    >
      {label}
    </Link>
  );
}

function getPageNumbers(
  current: number,
  total: number
): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("...");
  pages.push(total);

  return pages;
}
