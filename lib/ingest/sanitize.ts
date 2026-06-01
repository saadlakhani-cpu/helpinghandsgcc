const HTML_TAG_RE = /<[^>]*>/g;
const NULL_BYTE_RE = /\x00/g;
// Strip control characters but keep tab, LF, CR
const CONTROL_CHAR_RE = /[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const WHITESPACE_RE = /[ \t\r\n]+/g;

export function cleanDescription(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const cleaned = value
    .replace(NULL_BYTE_RE, "")
    .replace(CONTROL_CHAR_RE, "")
    .replace(HTML_TAG_RE, " ")
    .replace(WHITESPACE_RE, " ")
    .trim();

  return cleaned.length > 0 ? cleaned : null;
}
