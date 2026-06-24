import type { IngestJobInput } from "@/lib/ingest/types";
import { cleanDescription } from "@/lib/ingest/sanitize";

const JSEARCH_BASE = "https://jsearch.p.rapidapi.com/search";

const FEATURED_COMPANIES = [
  "aramco", "sabic", "pif", "neom", "maaden", "ma'aden", "acwa power",
  "emirates", "adnoc", "dp world", "mubadala", "emaar", "qatarenergy",
  "qatar airways", "qia", "ooredoo", "kpc", "agility", "zain", "alba",
  "bapco", "investcorp", "oq", "pdo", "omantel", "asyad", "almarai",
];

const LAYER_1_QUERIES = [
  "Finance Saudi Arabia",
  "Financial Controller Saudi Arabia",
  "Accountant Saudi Arabia",
  "CFO Saudi Arabia",
  "AI Analyst Saudi Arabia",
  "Finance Manager UAE",
  "Financial Analyst Dubai",
  "Financial Analyst Saudi Arabia",
  "FP&A Manager Saudi Arabia",
  "Finance Manager Saudi Arabia",
  "Finance Director Saudi Arabia",
  "Head of Finance Saudi Arabia",
  "Financial Analyst UAE",
  "FP&A Manager UAE",
  "Finance Director UAE",
  "Head of Finance UAE",
  "Financial Controller UAE",
];

const LAYER_2_QUERIES = [
  "Michael Page Finance Saudi Arabia",
  "Robert Walters Finance Saudi Arabia",
  "Hays Finance Saudi Arabia",
  "Cooper Fitch Finance Saudi Arabia",
  "Charterhouse Finance Saudi Arabia",
  "Michael Page Finance UAE",
  "Robert Walters Finance UAE",
  "FP&A Analyst Saudi Arabia",
  "Senior Accountant Saudi Arabia",
  "Chief Accountant Saudi Arabia",
  "Accounting Manager Saudi Arabia",
  "Accountant UAE",
  "Senior Accountant UAE",
  "Chief Accountant UAE",
];

const LAYER_3_QUERIES = [
  "Finance Qatar",
  "Finance Kuwait",
  "Finance Bahrain",
  "Finance Oman",
  "AI UAE",
  "AI Saudi Arabia",
  "Treasury Saudi Arabia",
  "Tax Saudi Arabia",
  "Audit Saudi Arabia",
  "GRC Saudi Arabia",
];

export type JSearchLayer = "1" | "2" | "3" | "all";

const QUERY_LAYERS: Record<JSearchLayer, string[]> = {
  "1": LAYER_1_QUERIES,
  "2": LAYER_2_QUERIES,
  "3": LAYER_3_QUERIES,
  all: [...LAYER_1_QUERIES, ...LAYER_2_QUERIES, ...LAYER_3_QUERIES],
};

const DATE_POSTED_BY_LAYER: Record<JSearchLayer, string> = {
  "1": "3days",
  "2": "week",
  "3": "month",
  all: "month",
};

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
  data: JSearchJob[];
}

export type JSearchQueryDebug = {
  query: string;
  date_posted: string;
  status: string;
  raw_count: number;
  usable_count: number;
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
  debug?: JSearchQueryDebug[]
): Promise<IngestJobInput[]> {
  const url = new URL(JSEARCH_BASE);
  url.searchParams.set("query", query);
  url.searchParams.set("num_pages", "5");
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

  if (json.status !== "OK" || !Array.isArray(json.data)) {
    debug?.push({
      query,
      date_posted: datePosted,
      status: json.status ?? "INVALID_RESPONSE",
      raw_count: 0,
      usable_count: 0,
    });
    return [];
  }

  const usableJobs = json.data
    .filter((job) => job.job_apply_link && job.job_title && job.employer_name);

  debug?.push({
    query,
    date_posted: datePosted,
    status: json.status,
    raw_count: json.data.length,
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
  datePostedOverride?: string
): Promise<{ jobs: IngestJobInput[]; debug: JSearchQueryDebug[] }> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error("RAPIDAPI_KEY env var is not set");

  const todayISO = new Date().toISOString().split("T")[0];
  const queries = QUERY_LAYERS[layer] ?? QUERY_LAYERS.all;
  const datePosted =
    datePostedOverride ?? DATE_POSTED_BY_LAYER[layer] ?? DATE_POSTED_BY_LAYER.all;
  const debug: JSearchQueryDebug[] = [];
  const seen = new Set<string>();
  const results: IngestJobInput[] = [];

  for (const query of queries) {
    const jobs = await fetchQuery(query, todayISO, apiKey, datePosted, debug);
    for (const job of jobs) {
      if (!seen.has(job.apply_url)) {
        seen.add(job.apply_url);
        results.push(job);
      }
    }
  }

  return { jobs: results, debug };
}
