import type { IngestJobInput } from "@/lib/ingest/types";

function isJobObject(value: unknown): value is IngestJobInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const obj = value as Record<string, unknown>;
  return typeof obj.title === "string" && typeof obj.company === "string";
}

/** Accepts a job array, `{ jobs: [...] }`, or a single job object. */
export function parseIngestBody(body: unknown): IngestJobInput[] | null {
  if (Array.isArray(body)) {
    return body as IngestJobInput[];
  }

  if (!body || typeof body !== "object") {
    return null;
  }

  const record = body as Record<string, unknown>;

  if (Array.isArray(record.jobs)) {
    return record.jobs as IngestJobInput[];
  }

  if (isJobObject(body)) {
    return [body];
  }

  return null;
}
