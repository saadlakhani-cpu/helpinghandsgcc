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
  all: "week",
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
}

interface JSearchResponse {
  status: string;
  data: JSearchJob[];
}

function buildSalaryRange(job: JSearchJob): string | null {
  if (job.job_min_salary == null && job.job_max_salary == null) return null;
  const currency = job.job_salary_currency ?? "";
  const period = job.job_salary_period ? `/${job.job_salary_period.toLowerCase()}` : "";
  const min = job.job_min_salary != null ? job.job_min_salary.toLocaleString() : null;
  const max = job.job_max_salary != null ? job.job_max_salary.toLocaleString() : null;
  const range = min && max ? `${min} - ${max}` : (min ?? max ?? "");
  return `${currency} ${range}${period}`.trim();
}

async function fetchQuery(
  query: string,
  todayISO: string,
  apiKey: string,
  datePosted: string
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
    return [];
  }

  const json: JSearchResponse = await response.json();

  if (json.status !== "OK" || !Array.isArray(json.data)) return [];

  return json.data
    .filter((job) => job.job_apply_link && job.job_title && job.employer_name)
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
        date_posted: todayISO,
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
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error("RAPIDAPI_KEY env var is not set");

  const todayISO = new Date().toISOString().split("T")[0];
  const queries = QUERY_LAYERS[layer] ?? QUERY_LAYERS.all;
  const datePosted = DATE_POSTED_BY_LAYER[layer] ?? DATE_POSTED_BY_LAYER.all;
  const seen = new Set<string>();
  const results: IngestJobInput[] = [];

  for (const query of queries) {
    const jobs = await fetchQuery(query, todayISO, apiKey, datePosted);
    for (const job of jobs) {
      if (!seen.has(job.apply_url)) {
        seen.add(job.apply_url);
        results.push(job);
      }
    }
  }

  return results;
}
