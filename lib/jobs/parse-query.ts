import type { JobsQueryParams } from "@/lib/jobs/types";

const VALID_CATEGORIES = new Set(["Finance", "AI"]);
const VALID_COUNTRIES = new Set([
  "KSA",
  "UAE",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Oman",
]);
const VALID_WORK_TYPES = new Set(["Remote", "Hybrid", "On-site"]);
const VALID_SENIORITIES = new Set([
  "Junior",
  "Mid",
  "Senior",
  "Director",
  "C-Suite",
]);
const VALID_DATE_RANGES = new Set(["today", "7days", "30days"]);
const VALID_SORTS = new Set(["freshness", "date_posted", "seniority"]);
const VALID_EXPERIENCE = new Set(["0-2", "2-5", "5-10", "10+"]);

export function parseJobsQuery(
  searchParams: URLSearchParams
): JobsQueryParams {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20)
  );

  const sortRaw = (searchParams.get("sort") ?? "freshness").toLowerCase();
  const sort = VALID_SORTS.has(sortRaw) ? sortRaw : "freshness";

  const params: JobsQueryParams = { page, limit, sort };

  const category = searchParams.get("category");
  if (category) {
    const normalized =
      category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    if (normalized === "Ai") {
      params.category = "AI";
    } else if (VALID_CATEGORIES.has(normalized)) {
      params.category = normalized;
    }
  }

  const subcategory = searchParams.get("subcategory");
  if (subcategory?.trim()) {
    params.subcategory = subcategory.trim();
  }

  const country = searchParams.get("country");
  if (country?.trim()) {
    const raw = country.trim();
    // 1. Exact match ("UAE", "Qatar", …)
    if (VALID_COUNTRIES.has(raw)) {
      params.country = raw;
    // 2. Uppercase match ("uae" → "UAE", "ksa" → "KSA")
    } else if (VALID_COUNTRIES.has(raw.toUpperCase())) {
      params.country = raw.toUpperCase();
    // 3. Title-case match ("QATAR" → "Qatar", "KUWAIT" → "Kuwait")
    } else {
      const titled =
        raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
      if (VALID_COUNTRIES.has(titled)) {
        params.country = titled;
      }
    }
  }

  const city = searchParams.get("city");
  if (city?.trim()) {
    params.city = city.trim();
  }

  const work_type = searchParams.get("work_type");
  if (work_type && VALID_WORK_TYPES.has(work_type)) {
    params.work_type = work_type;
  }

  const seniority = searchParams.get("seniority");
  if (seniority && VALID_SENIORITIES.has(seniority)) {
    params.seniority = seniority;
  }

  const platform = searchParams.get("platform");
  if (platform?.trim()) {
    params.platform = platform.trim();
  }

  const company = searchParams.get("company");
  if (company?.trim()) {
    params.company = company.trim();
  }

  const q = searchParams.get("q");
  if (q?.trim()) {
    params.q = q.trim();
  }

  const experience = searchParams.get("experience");
  if (experience && VALID_EXPERIENCE.has(experience)) {
    params.experience = experience;
  }

  const date_range = searchParams.get("date_range");
  if (date_range && VALID_DATE_RANGES.has(date_range)) {
    params.date_range = date_range;
  }

  return params;
}

export function getDateRangeCutoff(dateRange: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (dateRange === "today") {
    return formatDate(today);
  }

  if (dateRange === "7days") {
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - 7);
    return formatDate(cutoff);
  }

  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - 30);
  return formatDate(cutoff);
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
