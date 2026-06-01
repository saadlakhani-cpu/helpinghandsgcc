import { randomBytes } from "crypto";

function kebabCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function shortId(length = 6): string {
  return randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

export function generateJobSlug(title: string, city: string): string {
  return `${kebabCase(title)}-${kebabCase(city)}-${shortId(6)}`;
}
