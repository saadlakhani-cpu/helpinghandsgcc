import type { IngestJobInput } from "@/lib/ingest/types";
import { cleanDescription } from "@/lib/ingest/sanitize";

const JSEARCH_BASE = "https://jsearch.p.rapidapi.com/search-v2";

const FEATURED_COMPANIES = [
  "aramco", "sabic", "pif", "neom", "maaden", "ma'aden", "acwa power",
  "emirates", "adnoc", "dp world", "mubadala", "emaar", "qatarenergy",
  "qatar airways", "qia", "ooredoo", "kpc", "agility", "zain", "alba",
  "bapco", "investcorp", "oq", "pdo", "omantel", "asyad", "almarai",
];

const LAYER_1_QUERIES = [
  "finance jobs in Saudi Arabia",
  "financial controller jobs in Riyadh",
  "accountant jobs in Riyadh",
  "CFO jobs in Saudi Arabia",
  "AI analyst jobs in Saudi Arabia",
  "finance manager jobs in Dubai",
  "financial analyst jobs in Dubai",
  "financial analyst jobs in Saudi Arabia",
  "FP&A manager jobs in Riyadh",
  "finance manager jobs in Riyadh",
  "finance director jobs in Saudi Arabia",
  "head of finance jobs in Saudi Arabia",
  "financial analyst jobs in United Arab Emirates",
  "FP&A manager jobs in Dubai",
  "finance director jobs in Dubai",
  "head of finance jobs in Dubai",
  "financial controller jobs in Dubai",
];

const LAYER_2_QUERIES = [
  "Michael Page finance jobs in Saudi Arabia",
  "Robert Walters finance jobs in Saudi Arabia",
  "Hays finance jobs in Saudi Arabia",
  "Cooper Fitch finance jobs in Saudi Arabia",
  "Charterhouse finance jobs in Saudi Arabia",
  "Michael Page finance jobs in Dubai",
  "Robert Walters finance jobs in Dubai",
  "FP&A analyst jobs in Saudi Arabia",
  "senior accountant jobs in Riyadh",
  "chief accountant jobs in Riyadh",
  "accounting manager jobs in Saudi Arabia",
  "accountant jobs in Dubai",
  "senior accountant jobs in Dubai",
  "chief accountant jobs in Dubai",
];

const LAYER_3_QUERIES = [
  "finance jobs in Qatar",
  "finance jobs in Kuwait",
  "finance jobs in Bahrain",
  "finance jobs in Oman",
  "treasury jobs in Saudi Arabia",
  "tax jobs in Saudi Arabia",
  "audit jobs in Saudi Arabia",
  "GRC jobs in Saudi Arabia",
];

const AI_WEEKLY_QUERIES = [
  "AI jobs in United Arab Emirates",
  "AI jobs in Saudi Arabia",
  "data analyst jobs in Dubai",
  "data science jobs in Saudi Arabia",
  "machine learning jobs in Dubai",
  "business intelligence jobs in Riyadh",
];

export type JSearchLayer = "1" | "2" | "3" | "ai" | "all";

const QUERY_LAYERS: Record<JSearchLayer, string[]> = {
  "1": LAYER_1_QUERIES,
  "2": LAYER_2_QUERIES,
  "3": LAYER_3_QUERIES,
  ai: AI_WEEKLY_QUERIES,
  all: [
    ...LAYER_1_QUERIES,
    ...LAYER_2_QUERIES,
    ...LAYER_3_QUERIES,
    ...AI_WEEKLY_QUERIES,
  ],
};

const DATE_POSTED_BY_LAYER: Record<JSearchLayer, string> = {
  "1": "3days",
  "2": "week",
  "3": "month",
  ai: "week",
  all: "month",
};

export function getJSearchQueryCount(layer: JSearchLayer): number {
  return (QUERY_LAYERS[layer] ?? QUERY_LAYERS.all).length;
}

interface JSearchJob {
  employer_name: string;
  job_publisher: string;
  job_employment_type: string | null;
  job_title: string;
  job_apply_link: string;
  job_description: string | null;
  job_is_remote: boolean;
  job_city: string | null;
  job_country: string | null;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string | null;
  job_salary_period: string | null;
  job_job_title: string | null;
  job_posted_at_datetime_utc?: string | null;
  job_posted_at_timestamp?: number | null;
}

interface JSearchResponse {
  status: string;
  // v1 returns data as an array; v2 returns data as { jobs: [...] }
  data: JSearchJob[] | { jobs: JSearchJob[] } | null;
}

export type JSearchQueryDebug = {
  query: string;
  date_posted: string;
  status: string;
  raw_count: number;
  usable_count: number;
};

export type JSearchFetchOptions = {
  datePosted?: string;
  queryOffset?: number;
  queryLimit?: number;
  numPages?: number;
};

function buildSalaryRange(job: JSearchJob): string | null {
  if (job.job_min_salary == null && job.job_max_salary == null) return null;
  const currency = job.job_salary_currency ?? "";
  const period = job.job_salary_period ? `/${job.job_salary_period.toLowerCase()}` : "";
  const min = job.job_min_salary != null ? job.job_min_salary.toLocaleString() : null;
  const max = job.job_max_salary != null ? job.job_max_salary.toLocaleString() : null;
  const range = min && max ? `${min} - ${max}` : (min ?? max ?? "");
  return `${currency} ${range}${period}`.trim();
}

function inferCountryParam(query: string): string {
  const normalized = query.toLowerCase();
  if (normalized.includes("saudi") || normalized.includes("riyadh")) return "sa";
  if (
    normalized.includes("uae") ||
    normalized.includes("united arab emirates") ||
    normalized.includes("dubai") ||
    normalized.includes("abu dhabi")
  ) {
    return "ae";
  }
  if (normalized.includes("qatar")) return "qa";
  if (normalized.includes("kuwait")) return "kw";
  if (normalized.includes("bahrain")) return "bh";
  if (normalized.includes("oman")) return "om";
  return "sa";
}

function getPostedDate(job: JSearchJob, fallbackISO: string): string {
  const postedDate = job.job_posted_at_datetime_utc
    ? new Date(job.job_posted_at_datetime_utc)
    : job.job_posted_at_timestamp
      ? new Date(job.job_posted_at_timestamp * 1000)
      : null;

  if (postedDate && !Number.isNaN(postedDate.getTime())) {
    return postedDate.toISOString().slice(0, 10);
  }

  return fallbackISO;
}

async function fetchQuery(
  query: string,
  todayISO: string,
  apiKey: string,
  datePosted: string,
  numPages: number,
  debug?: JSearchQueryDebug[]
): Promise<IngestJobInput[]> {
  const url = new URL(JSEARCH_BASE);
  url.searchParams.set("query", query);
  url.searchParams.set("num_pages", String(numPages));
  url.searchParams.set("country", inferCountryParam(query));
  url.searchParams.set("date_posted", datePosted);

  const response = await fetch(url.toString(), {
    headers: {
      "x-rapidapi-host": "jsearch.p.rapidapi.com",
      "x-rapidapi-key": apiKey,
    },
  });

  if (!response.ok) {
    console.error(`[fetch-jobs] JSearch error for "${query}": ${response.status}`);
    debug?.push({
      query,
      date_posted: datePosted,
      status: `HTTP ${response.status}`,
      raw_count: 0,
      usable_count: 0,
    });
    return [];
  }

  const json: JSearchResponse = await response.json();

  // Support both v1 (data=[...]) and v2 (data={jobs:[...]}) response shapes.
  let rawData: JSearchJob[];
  if (Array.isArray(json.data)) {
    rawData = json.data;
  } else if (json.data && Array.isArray((json.data as { jobs?: JSearchJob[] }).jobs)) {
    rawData = (json.data as { jobs: JSearchJob[] }).jobs;
  } else {
    rawData = [];
  }

  if (json.status !== "OK") {
    debug?.push({
      query,
      date_posted: datePosted,
      status: json.status ?? "INVALID_RESPONSE",
      raw_count: rawData.length,
      usable_count: 0,
    });
    return [];
  }

  const usableJobs = rawData
    .filter((job) => job.job_apply_link && job.job_title && job.employer_name);

  debug?.push({
    query,
    date_posted: datePosted,
    status: json.status,
    raw_count: rawData.length,
    usable_count: usableJobs.length,
  });

  return usableJobs
    .map((job): IngestJobInput => {
      const description = cleanDescription(job.job_description);
      const snippet = description ? description.slice(0, 500) : null;

      const workTypeRaw = job.job_is_remote
        ? "Remote"
        : (job.job_employment_type ?? null);

      return {
        title: job.job_title,
        company: job.employer_name,
        platform: job.job_publisher || "JSearch",
        country: job.job_country ?? "",
        city: job.job_city ?? "",
        work_type: workTypeRaw,
        seniority: job.job_job_title ?? null,
        date_posted: getPostedDate(job, todayISO),
        apply_url: job.job_apply_link,
        description: description,
        description_snippet: snippet,
        salary_range: buildSalaryRange(job),
        is_featured: FEATURED_COMPANIES.some((name) =>
          job.employer_name.toLowerCase().includes(name)
        ),
      };
    });
}

export async function fetchAllJSearchJobs(
  layer: JSearchLayer = "all"
): Promise<IngestJobInput[]> {
  const { jobs } = await fetchAllJSearchJobsWithDebug(layer);
  return jobs;
}

export async function fetchAllJSearchJobsWithDebug(
  layer: JSearchLayer = "all",
  options: JSearchFetchOptions = {}
): Promise<{ jobs: IngestJobInput[]; debug: JSearchQueryDebug[] }> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error("RAPIDAPI_KEY env var is not set");

  const todayISO = new Date().toISOString().split("T")[0];
  const allQueries = QUERY_LAYERS[layer] ?? QUERY_LAYERS.all;
  const queryOffset = Math.max(0, options.queryOffset ?? 0);
  const queryLimit = options.queryLimit
    ? Math.max(1, options.queryLimit)
    : allQueries.length;
  const queries = allQueries.slice(queryOffset, queryOffset + queryLimit);
  const datePosted =
    options.datePosted ?? DATE_POSTED_BY_LAYER[layer] ?? DATE_POSTED_BY_LAYER.all;
  const numPages = Math.min(5, Math.max(1, options.numPages ?? 1));
  const debug: JSearchQueryDebug[] = [];
  const seen = new Set<string>();
  const results: IngestJobInput[] = [];

  for (const query of queries) {
    const jobs = await fetchQuery(
      query,
      todayISO,
      apiKey,
      datePosted,
      numPages,
      debug
    );
    for (const job of jobs) {
      if (!seen.has(job.apply_url)) {
        seen.add(job.apply_url);
        results.push(job);
      }
    }
  }

  return { jobs: results, debug };
}
