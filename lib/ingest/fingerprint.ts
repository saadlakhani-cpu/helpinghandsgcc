import { createHash } from "crypto";

export function generateJobFingerprint(
  title: string,
  company: string,
  city: string,
  description: string
): string {
  const payload =
    title.toLowerCase() +
    company.toLowerCase() +
    city.toLowerCase() +
    description.substring(0, 100).toLowerCase();

  return createHash("sha256").update(payload).digest("hex");
}
