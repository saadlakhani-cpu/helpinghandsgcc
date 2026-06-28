import { categorizeJob, type KeywordRow } from "@/lib/ingest/categorize";
import { generateJobFingerprint } from "@/lib/ingest/fingerprint";
import { calculateFreshnessScore } from "@/lib/ingest/freshness";
import {
  normalizeCity,
  normalizeCompany,
  normalizeCountry,
  normalizeSeniority,
  normalizeTitle,
  normalizeWorkType,
} from "@/lib/ingest/normalize";
import { generateJobSlug } from "@/lib/ingest/slug";
import { getSourcePriority } from "@/lib/ingest/source-priority";
import type { SupabaseClient } from "@supabase/supabase-js";

type ImportedJob = {
  title: string;
  company: string;
  platform: string;
  country: string;
  city: string;
  description: string;
  applyUrl: string;
};

export type ManualImportResult = {
  received: number;
  inserted: number;
  skipped: number;
  failed: number;
  details: Array<{
    url: string;
    status: "inserted" | "skipped" | "failed";
    reason?: string;
    title?: string;
    company?: string;
  }>;
};

const CITY_COUNTRY_HINTS = [
  { city: "Dubai", country: "UAE", pattern: /\b(dubai|uae|united arab emirates)\b/i },
  { city: "Abu Dhabi", country: "UAE", pattern: /\babu dhabi\b/i },
  { city: "Riyadh", country: "KSA", pattern: /\b(riyadh|ksa|saudi arabia)\b/i },
  { city: "Jeddah", country: "KSA", pattern: /\bjeddah\b/i },
  { city: "Dammam", country: "KSA", pattern: /\bdammam\b/i },
  { city: "Doha", country: "Qatar", pattern: /\b(doha|qatar)\b/i },
  { city: "Kuwait City", country: "Kuwait", pattern: /\bkuwait\b/i },
  { city: "Manama", country: "Bahrain", pattern: /\b(manama|bahrain)\b/i },
  { city: "Muscat", country: "Oman", pattern: /\b(muscat|oman)\b/i },
];

function normalizeLinks(rawLinks: unknown): string[] {
  if (Array.isArray(rawLinks)) {
    return rawLinks.filter((link): link is string => typeof link === "string");
  }

  if (typeof rawLinks !== "string") return [];

  return rawLinks
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&ndash;|&mdash;/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function pickMeta(html: string, names: string[]): string {
  for (const name of names) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const propertyFirst = new RegExp(
      `<meta[^>]+(?:property|name)=["']${escapedName}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i"
    );
    const contentFirst = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escapedName}["'][^>]*>`,
      "i"
    );
    const match = html.match(propertyFirst) ?? html.match(contentFirst);
    if (match?.[1]) return decodeHtml(match[1]);
  }

  return "";
}

function pickTitle(html: string): string {
  return (
    pickMeta(html, ["og:title", "twitter:title"]) ||
    decodeHtml(html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? "")
  );
}

function pickDescription(html: string): string {
  return pickMeta(html, ["og:description", "twitter:description", "description"]);
}

function platformFromUrl(url: URL): string {
  const host = url.hostname.toLowerCase();
  if (host.includes("linkedin")) return "LinkedIn";
  if (host.includes("naukrigulf")) return "Naukri Gulf";
  if (host.includes("bayt")) return "Bayt";
  if (host.includes("gulftalent")) return "GulfTalent";
  if (host.includes("indeed")) return "Indeed";
  return url.hostname.replace(/^www\./, "");
}

function titleFromPath(url: URL): string {
  const lastSlug = url.pathname
    .split("/")
    .filter(Boolean)
    .findLast((part) => /[a-z]/i.test(part) && !/^\d+$/.test(part));

  if (!lastSlug) return "";

  return decodeHtml(
    lastSlug
      .replace(/[-_]+/g, " ")
      .replace(/\b(job|jobs|vacancy|opening|linkedin|naukrigulf)\b/gi, " ")
  );
}

function inferLocation(text: string): { city: string; country: string } {
  for (const hint of CITY_COUNTRY_HINTS) {
    if (hint.pattern.test(text)) {
      return { city: hint.city, country: hint.country };
    }
  }

  return { city: "Dubai", country: "UAE" };
}

function parseTitleAndCompany(
  rawTitle: string,
  description: string,
  url: URL
): { title: string; company: string } {
  const platform = platformFromUrl(url);
  let cleanTitle = decodeHtml(rawTitle)
    .replace(/\s+\|\s+LinkedIn.*$/i, "")
    .replace(/\s+\|\s+NaukriGulf.*$/i, "")
    .replace(/\s+-\s+NaukriGulf.*$/i, "")
    .replace(/\s+\|\s+.*?Jobs.*$/i, "")
    .trim();

  let company = "";

  const linkedinHiring = cleanTitle.match(/^(.+?)\s+hiring\s+(.+?)(?:\s+in\s+.+)?$/i);
  if (linkedinHiring) {
    company = linkedinHiring[1].trim();
    cleanTitle = linkedinHiring[2].trim();
  }

  const atCompany = cleanTitle.match(/^(.+?)\s+at\s+(.+?)(?:\s+in\s+.+)?$/i);
  if (!company && atCompany) {
    cleanTitle = atCompany[1].trim();
    company = atCompany[2].trim();
  }

  if (!cleanTitle || cleanTitle.length < 4) {
    cleanTitle = titleFromPath(url);
  }

  const descriptionCompany = description.match(/\bat\s+([A-Z][A-Za-z0-9 &.,'-]{2,60})/);
  if (!company && descriptionCompany) {
    company = descriptionCompany[1].trim();
  }

  if (!company) {
    company = platform === "LinkedIn" ? "LinkedIn Employer" : "Confidential Employer";
  }

  return { title: cleanTitle, company };
}

async function fetchJobMetadata(url: URL): Promise<ImportedJob | null> {
  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; HelpingHandsGCC/1.0; +https://www.helpinghandsgcc.com)",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) return null;

  const html = await response.text();
  const rawTitle = pickTitle(html);
  const description = pickDescription(html);
  const { title, company } = parseTitleAndCompany(rawTitle, description, url);
  const location = inferLocation(`${title} ${description} ${url.toString()}`);

  if (!title || title.length < 4) return null;

  return {
    title,
    company,
    platform: platformFromUrl(url),
    country: location.country,
    city: location.city,
    description,
    applyUrl: url.toString(),
  };
}

export async function importJobLinks({
  supabase,
  rawLinks,
  keywordRows,
}: {
  supabase: SupabaseClient;
  rawLinks: unknown;
  keywordRows: KeywordRow[];
}): Promise<ManualImportResult> {
  const links = Array.from(new Set(normalizeLinks(rawLinks))).slice(0, 25);
  const result: ManualImportResult = {
    received: links.length,
    inserted: 0,
    skipped: 0,
    failed: 0,
    details: [],
  };

  for (const rawLink of links) {
    let url: URL;
    try {
      url = new URL(rawLink);
    } catch {
      result.failed += 1;
      result.details.push({ url: rawLink, status: "failed", reason: "Invalid URL" });
      continue;
    }

    try {
      const imported = await fetchJobMetadata(url);
      if (!imported) {
        result.failed += 1;
        result.details.push({
          url: rawLink,
          status: "failed",
          reason: "Could not read job page metadata",
        });
        continue;
      }

      const title = normalizeTitle(imported.title);
      const company = normalizeCompany(imported.company);
      const country = normalizeCountry(imported.country);
      const city = normalizeCity(imported.city, country);
      const work_type = normalizeWorkType(null);
      const seniority = normalizeSeniority(title);
      const description = imported.description || title;
      const categoryResult = categorizeJob(title, description, keywordRows);

      if (!categoryResult) {
        result.skipped += 1;
        result.details.push({
          url: rawLink,
          status: "skipped",
          reason: "Not classified as Finance or AI",
          title,
          company,
        });
        continue;
      }

      const fingerprint = generateJobFingerprint(title, company, city, description);
      const { data: existing } = await supabase
        .from("jobs")
        .select("id")
        .eq("job_fingerprint", fingerprint)
        .maybeSingle();

      if (existing) {
        result.skipped += 1;
        result.details.push({
          url: rawLink,
          status: "skipped",
          reason: "Duplicate job",
          title,
          company,
        });
        continue;
      }

      const date_posted = new Date().toISOString().slice(0, 10);
      const source_priority = getSourcePriority(imported.platform);
      const { error } = await supabase.from("jobs").insert({
        title,
        slug: generateJobSlug(title, city),
        category: categoryResult.category,
        subcategory: categoryResult.subcategory,
        company,
        recruiter_source: "Manual Import",
        platform: imported.platform,
        country,
        city,
        work_type,
        seniority,
        date_posted,
        date_scraped: new Date().toISOString(),
        apply_url: imported.applyUrl,
        salary_range: null,
        experience_years: null,
        description_snippet: description.slice(0, 1200),
        job_fingerprint: fingerprint,
        freshness_score: calculateFreshnessScore(source_priority, date_posted),
        source_priority,
        is_featured: false,
        is_active: true,
      });

      if (error) {
        result.failed += 1;
        result.details.push({
          url: rawLink,
          status: "failed",
          reason: error.message,
          title,
          company,
        });
        continue;
      }

      result.inserted += 1;
      result.details.push({ url: rawLink, status: "inserted", title, company });
    } catch (error) {
      result.failed += 1;
      result.details.push({
        url: rawLink,
        status: "failed",
        reason: error instanceof Error ? error.message : "Import failed",
      });
    }
  }

  return result;
}
