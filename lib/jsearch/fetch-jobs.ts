import type { IngestJobInput } from "@/lib/ingest/types";
import { cleanDescription } from "@/lib/ingest/sanitize";

const JSEARCH_BASE = "https://jsearch.p.rapidapi.com/search";

const QUERIES = [
  "Finance Saudi Arabia",
  "Financial Controller Saudi Arabia",
  "Accountant Saudi Arabia",
  "CFO Saudi Arabia",
  "AI Analyst Saudi Arabia",
  "Finance Manager UAE",
  "Financial Analyst Dubai",
];

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
  apiKey: string
): Promise<IngestJobInput[]> {
  const url = new URL(JSEARCH_BASE);
  url.searchParams.set("query", query);
  url.searchParams.set("num_pages", "1");
  url.searchParams.set("date_posted", "today");

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
      };
    });
}

export async function fetchAllJSearchJobs(): Promise<IngestJobInput[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error("RAPIDAPI_KEY env var is not set");

  const todayISO = new Date().toISOString().split("T")[0];
  const seen = new Set<string>();
  const results: IngestJobInput[] = [];

  for (const query of QUERIES) {
    const jobs = await fetchQuery(query, todayISO, apiKey);
    for (const job of jobs) {
      if (!seen.has(job.apply_url)) {
        seen.add(job.apply_url);
        results.push(job);
      }
    }
  }

  return results;
}
