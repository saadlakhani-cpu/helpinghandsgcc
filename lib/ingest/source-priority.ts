const PLATFORM_PRIORITY: Record<string, number> = {
  linkedin: 10,
  indeed: 8,
  bayt: 8,
  naukrigulf: 7,
  glassdoor: 7,
  "michael page": 9,
  hays: 9,
  "robert walters": 9,
};

export function getSourcePriority(platform: string | null | undefined): number {
  if (!platform?.trim()) return 6;

  const key = platform.trim().toLowerCase();
  return PLATFORM_PRIORITY[key] ?? 6;
}
