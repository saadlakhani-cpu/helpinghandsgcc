export const countries = ["KSA", "UAE", "Qatar", "Kuwait", "Bahrain", "Oman"];
export type JobDetails = {
  title: string;
  company: string;
  country: string;
  city: string;
  category: string;
  description: string;
  date_posted: string;
};
export type Submission = {
  id: string;
  contributor_email: string;
  original_url: string;
  canonical_url: string;
  status: string;
  reason: string | null;
  details: JobDetails | null;
  created_at: string;
  updated_at: string;
  amount_minor: number;
  currency: string;
  paid_at: string | null;
  payment_reference: string | null;
  lease?: string;
};
export const statuses = [
  "queued",
  "processing",
  "needs_details",
  "review",
  "approved",
  "duplicate",
  "rejected",
];

export function canonicalUrl(raw: string): string {
  if (raw.length > 2000) throw new Error("Link is too long.");
  const url = new URL(raw.trim());
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.port
  )
    throw new Error(
      "Use a public job link without a custom port or login details.",
    );
  url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  if (
    !url.hostname.includes(".") ||
    /(^|\.)(localhost|local|internal|test|invalid)$/.test(url.hostname) ||
    /^\[|^[\d.]+$/.test(url.hostname)
  )
    throw new Error("Use a public website link.");
  url.protocol = "https:";
  url.hash = "";
  if (url.hostname === "linkedin.com") {
    const id =
      url.pathname.match(/\/jobs\/view\/(?:[^/]*-)?(\d+)\/?$/)?.[1] ||
      url.searchParams.get("currentJobId");
    if (!id || !/^\d+$/.test(id))
      throw new Error("Paste a LinkedIn job detail link, not a search page.");
    url.pathname = `/jobs/view/${id}`;
    url.search = "";
  } else if (
    /(^|\.)indeed\.com$/.test(url.hostname) &&
    url.searchParams.get("jk")
  ) {
    const id = url.searchParams.get("jk")!;
    url.pathname = "/viewjob";
    url.search = "";
    url.searchParams.set("jk", id);
  } else {
    for (const key of Array.from(url.searchParams.keys()))
      if (/^utm_|^(trk|trackingId|refId|fbclid|gclid|ref|source)$/i.test(key))
        url.searchParams.delete(key);
    url.searchParams.sort();
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  }
  return url.toString();
}

export function validateDetails(value: unknown): JobDetails {
  if (!value || typeof value !== "object")
    throw new Error("Complete the job details.");
  const d = value as Record<string, unknown>;
  const field = (key: string, max: number) => {
    const v = d[key];
    if (typeof v !== "string" || !v.trim() || v.length > max)
      throw new Error(`Check ${key.replace("_", " ")}.`);
    return v.trim();
  };
  const result = {
    title: field("title", 200),
    company: field("company", 200),
    country: field("country", 30),
    city: field("city", 100),
    category: field("category", 20),
    description: field("description", 12000),
    date_posted: field("date_posted", 10),
  };
  if (
    !countries.includes(result.country) ||
    !["Finance", "AI"].includes(result.category)
  )
    throw new Error("Only GCC Finance and AI roles are accepted.");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(result.date_posted) ||
    !Number.isFinite(Date.parse(result.date_posted)) ||
    new Date(result.date_posted).toISOString().slice(0, 10) !==
      result.date_posted ||
    result.date_posted > new Date().toISOString().slice(0, 10)
  )
    throw new Error("Enter the job's actual posting date, not a future date.");
  return result;
}
