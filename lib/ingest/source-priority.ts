const PLATFORM_PRIORITY: Record<string, number> = {
  linkedin: 10,
  indeed: 8,
  bayt: 8,
  naukrigulf: 7,
  "naukri gulf": 8,
  "naukri.com": 8,
  gulftalent: 8,
  "gulf talent": 8,
  glassdoor: 7,
  "michael page": 9,
  hays: 9,
  "robert walters": 9,
  jobleads: 4,
  jooble: 4,
  trabajo: 4,
};

export function getSourcePriority(platform: string | null | undefined): number {
  if (!platform?.trim()) return 6;

  const key = platform.trim().toLowerCase();
  const exact = PLATFORM_PRIORITY[key];
  if (exact) return exact;

  if (key.includes("linkedin")) return 10;
  if (key.includes("michael page")) return 9;
  if (key.includes("robert walters")) return 9;
  if (key.includes("hays")) return 9;
  if (key.includes("naukri")) return 8;
  if (key.includes("gulftalent") || key.includes("gulf talent")) return 8;
  if (key.includes("bayt")) return 8;
  if (key.includes("indeed")) return 8;
  if (key.includes("glassdoor")) return 7;
  if (key.includes("jobleads")) return 4;
  if (key.includes("jooble")) return 4;
  if (key.includes("trabajo")) return 4;

  return 6;
}
