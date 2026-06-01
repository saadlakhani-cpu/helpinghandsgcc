const COUNTRY_MAP: Record<string, string> = {
  "saudi arabia": "KSA",
  ksa: "KSA",
  sa: "KSA",
  saudi: "KSA",
  "united arab emirates": "UAE",
  uae: "UAE",
  dubai: "UAE",
  "abu dhabi": "UAE",
  qatar: "Qatar",
  qa: "Qatar",
  kuwait: "Kuwait",
  kw: "Kuwait",
  bahrain: "Bahrain",
  bh: "Bahrain",
  oman: "Oman",
  om: "Oman",
};

const GULF_COUNTRIES = new Set([
  "KSA",
  "UAE",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Oman",
]);

const COUNTRY_SUFFIXES = [
  ", saudi arabia",
  ", ksa",
  ", united arab emirates",
  ", uae",
  ", qatar",
  ", kuwait",
  ", bahrain",
  ", oman",
];

function toTitleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((word) =>
      word.length <= 2 && /^[a-z]+$/i.test(word)
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
}

export function normalizeCountry(raw: string | null | undefined): string {
  if (!raw?.trim()) return "UAE";

  const key = raw.trim().toLowerCase();
  if (COUNTRY_MAP[key]) return COUNTRY_MAP[key];

  const titled = toTitleCase(raw);
  if (GULF_COUNTRIES.has(titled)) return titled;

  return "UAE";
}

export function normalizeCity(
  raw: string | null | undefined,
  country?: string
): string {
  if (!raw?.trim()) return country === "UAE" ? "Dubai" : "Riyadh";

  let city = raw.trim();
  const lower = city.toLowerCase();

  for (const suffix of COUNTRY_SUFFIXES) {
    if (lower.endsWith(suffix)) {
      city = city.slice(0, -suffix.length).trim();
      break;
    }
  }

  if (COUNTRY_MAP[lower]) {
    return country === "UAE" ? "Dubai" : "Riyadh";
  }

  return toTitleCase(city);
}

export function normalizeWorkType(raw: string | null | undefined): string {
  if (!raw?.trim()) return "On-site";

  const value = raw.trim().toLowerCase();

  if (
    value.includes("remote") ||
    value.includes("work from home") ||
    value.includes("wfh")
  ) {
    return "Remote";
  }

  if (value.includes("hybrid") || value.includes("flexible")) {
    return "Hybrid";
  }

  if (
    value.includes("on-site") ||
    value.includes("onsite") ||
    value.includes("office") ||
    value.includes("in-person")
  ) {
    return "On-site";
  }

  return "On-site";
}

export function normalizeSeniority(raw: string | null | undefined): string {
  if (!raw?.trim()) return "Mid";

  const value = raw.trim().toLowerCase();

  if (
    value.includes("junior") ||
    value.includes("graduate") ||
    value.includes("entry") ||
    value.includes("0-2")
  ) {
    return "Junior";
  }

  if (
    value.includes("mid") ||
    value.includes("associate") ||
    value.includes("2-5")
  ) {
    return "Mid";
  }

  if (
    value.includes("senior") ||
    value.includes("lead") ||
    value.includes("5-10")
  ) {
    return "Senior";
  }

  if (
    value.includes("director") ||
    value.includes("head of") ||
    value.includes("vp")
  ) {
    return "Director";
  }

  if (
    value.includes("cfo") ||
    value.includes("ceo") ||
    value.includes("c-suite") ||
    value.includes("chief")
  ) {
    return "C-Suite";
  }

  return "Mid";
}

export function normalizeTitle(raw: string): string {
  return toTitleCase(raw.trim());
}

export function normalizeCompany(raw: string): string {
  return toTitleCase(raw.trim());
}
