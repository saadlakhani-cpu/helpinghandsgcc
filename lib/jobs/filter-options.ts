import { createAdminClient } from "@/lib/supabase/admin";
import type { FilterOptions } from "@/lib/jobs/types";

const DEFAULT_PLATFORMS = [
  "LinkedIn",
  "Indeed",
  "Bayt",
  "Naukrigulf",
  "Glassdoor",
  "Michael Page",
  "Hays",
  "Robert Walters",
];

export async function getFilterOptions(): Promise<FilterOptions> {
  const supabase = createAdminClient();

  const [keywordsRes, platformsRes] = await Promise.all([
    supabase.from("keywords").select("category, subcategory"),
    supabase.from("jobs").select("platform").eq("is_active", true),
  ]);

  const financeSet = new Set<string>();
  const aiSet = new Set<string>();

  for (const row of keywordsRes.data ?? []) {
    if (row.category === "Finance") {
      financeSet.add(row.subcategory);
    } else if (row.category === "AI") {
      aiSet.add(row.subcategory);
    }
  }

  const platformSet = new Set<string>(DEFAULT_PLATFORMS);
  for (const row of platformsRes.data ?? []) {
    if (row.platform?.trim()) {
      platformSet.add(row.platform.trim());
    }
  }

  const sortAlpha = (a: string, b: string) => a.localeCompare(b);

  return {
    financeSubcategories: Array.from(financeSet).sort(sortAlpha),
    aiSubcategories: Array.from(aiSet).sort(sortAlpha),
    platforms: Array.from(platformSet).sort(sortAlpha),
  };
}
