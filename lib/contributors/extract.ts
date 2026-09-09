import { lookup } from "node:dns/promises";
import { request as httpsRequest } from "node:https";
import { load } from "cheerio";
import { canonicalUrl, validateDetails } from "./model";
import { categorizeJob, type KeywordRow } from "@/lib/ingest/categorize";

export function publicAddress(ip: string) {
  const parts = ip.split(".").map(Number);
  if (
    parts.length !== 4 ||
    parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)
  )
    return false;
  const [a, b] = parts;
  return !(
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a === 169 ||
    a === 192 ||
    a === 198 ||
    a >= 224 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 100 && b >= 64 && b <= 127)
  );
}

async function readPage(
  raw: string,
  hops = 0,
  deadline = Date.now() + 12000,
): Promise<string> {
  canonicalUrl(raw);
  const url = new URL(raw);
  url.protocol = "https:";
  if (Date.now() >= deadline)
    throw new Error("Source timed out. Complete the details manually.");
  const allowed = (process.env.CONTRIBUTOR_ALLOWED_HOSTS || "")
    .split(",")
    .map((s) =>
      s
        .trim()
        .toLowerCase()
        .replace(/^www\./, ""),
    )
    .filter(Boolean);
  if (!allowed.includes(url.hostname.replace(/^www\./, "")))
    throw new Error(
      "Automatic reading is not enabled for this source. Complete the details from an authorised source.",
    );
  const address = await new Promise<{ address: string; family: number }>(
    (resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Source lookup timed out.")),
        Math.min(3000, deadline - Date.now()),
      );
      lookup(url.hostname, { family: 4 })
        .then(resolve, reject)
        .finally(() => clearTimeout(timer));
    },
  );
  if (!publicAddress(address.address))
    throw new Error("This source cannot be accessed.");
  const result = await new Promise<{
    body: string;
    location?: string;
    status: number;
  }>((resolve, reject) => {
    let bytes = 0;
    const chunks: Buffer[] = [];
    const req = httpsRequest(
      url,
      {
        headers: {
          "User-Agent": "HelpingHandsGCC-JobCollector/1.0",
          Accept: "text/html",
        },
        lookup: (_host, _options, callback) =>
          callback(null, address.address, 4),
      },
      (res) => {
        res.on("data", (chunk: Buffer) => {
          bytes += chunk.length;
          if (bytes > 2000000) {
            req.destroy(new Error("Page is too large."));
            return;
          }
          chunks.push(chunk);
        });
        res.on("end", () =>
          resolve({
            body: Buffer.concat(chunks).toString("utf8"),
            status: res.statusCode || 500,
            location: res.headers.location,
          }),
        );
        res.on("error", reject);
      },
    );
    const timer = setTimeout(
      () =>
        req.destroy(
          new Error("Source timed out. Complete the details manually."),
        ),
      Math.max(1, deadline - Date.now()),
    );
    req.on("close", () => clearTimeout(timer));
    req.on("error", reject);
    req.end();
  });
  if (
    result.status >= 300 &&
    result.status < 400 &&
    result.location &&
    hops < 2
  )
    return readPage(
      new URL(result.location, url).toString(),
      hops + 1,
      deadline,
    );
  if (result.status !== 200)
    throw new Error(
      "Source is unavailable or requires sign-in. Complete the details manually.",
    );
  return result.body;
}

export function extractDetails(html: string, keywords: KeywordRow[]) {
  const $ = load(html);
  const nodes: Record<string, unknown>[] = [];
  const walk = (value: unknown, depth = 0) => {
    if (depth > 12 || !value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach((v) => walk(v, depth + 1));
      return;
    }
    const obj = value as Record<string, unknown>;
    if (
      obj["@type"] === "JobPosting" ||
      (Array.isArray(obj["@type"]) && obj["@type"].includes("JobPosting"))
    )
      nodes.push(obj);
    if (obj["@graph"]) walk(obj["@graph"], depth + 1);
  };
  $('script[type="application/ld+json"]').each((_i, el) => {
    try {
      walk(JSON.parse($(el).text()));
    } catch {
      /* Ignore unrelated malformed structured data. */
    }
  });
  if (nodes.length !== 1)
    throw new Error(
      "Could not identify one complete job. Please enter its details.",
    );
  const node = nodes[0];
  const title = typeof node.title === "string" ? node.title : "";
  const description =
    typeof node.description === "string" ? load(node.description).text() : "";
  const organization = node.hiringOrganization as { name?: string } | undefined;
  const location = (
    Array.isArray(node.jobLocation) ? node.jobLocation[0] : node.jobLocation
  ) as
    | {
        address?: {
          addressLocality?: string;
          addressCountry?: string | { name?: string };
        };
      }
    | undefined;
  const address = location?.address;
  const countryValue =
    typeof address?.addressCountry === "string"
      ? address.addressCountry
      : address?.addressCountry?.name;
  const map: Record<string, string> = {
    sa: "KSA",
    ksa: "KSA",
    "saudi arabia": "KSA",
    ae: "UAE",
    uae: "UAE",
    "united arab emirates": "UAE",
    qa: "Qatar",
    qatar: "Qatar",
    kw: "Kuwait",
    kuwait: "Kuwait",
    bh: "Bahrain",
    bahrain: "Bahrain",
    om: "Oman",
    oman: "Oman",
  };
  const category = categorizeJob(title, description, keywords);
  if (!category)
    throw new Error(
      "Finance or AI relevance needs manual review. Complete the job details.",
    );
  if (
    typeof node.validThrough === "string" &&
    Date.parse(node.validThrough) < Date.now()
  )
    throw new Error(
      "This listing appears expired. Check the source before completing details.",
    );
  return validateDetails({
    title,
    description,
    company: organization?.name,
    country: map[(countryValue || "").toLowerCase()],
    city: address?.addressLocality,
    category: category.category,
    date_posted:
      typeof node.datePosted === "string" ? node.datePosted.slice(0, 10) : "",
  });
}
export async function extractJob(url: string, keywords: KeywordRow[]) {
  return extractDetails(await readPage(url), keywords);
}
