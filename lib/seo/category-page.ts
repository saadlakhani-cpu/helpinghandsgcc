import { createAdminClient } from "@/lib/supabase/admin";
import type { Job } from "@/lib/jobs/types";

export type CountryMeta = {
  slug: string;
  dbCode: string;
  label: string;
  fullLabel: string;
  flag: string;
};

export const COUNTRY_META: CountryMeta[] = [
  { slug: "uae", dbCode: "UAE", label: "UAE", fullLabel: "United Arab Emirates", flag: "🇦🇪" },
  { slug: "ksa", dbCode: "KSA", label: "Saudi Arabia", fullLabel: "Saudi Arabia", flag: "🇸🇦" },
  { slug: "qatar", dbCode: "Qatar", label: "Qatar", fullLabel: "Qatar", flag: "🇶🇦" },
  { slug: "kuwait", dbCode: "Kuwait", label: "Kuwait", fullLabel: "Kuwait", flag: "🇰🇼" },
  { slug: "bahrain", dbCode: "Bahrain", label: "Bahrain", fullLabel: "Bahrain", flag: "🇧🇭" },
  { slug: "oman", dbCode: "Oman", label: "Oman", fullLabel: "Oman", flag: "🇴🇲" },
];

export function getCountryMeta(slug: string): CountryMeta | null {
  return COUNTRY_META.find((c) => c.slug === slug) ?? null;
}

export type CategoryPageData = {
  topJobs: Job[];
  totalCount: number;
};

export type CategoryCountryCount = {
  country: CountryMeta;
  count: number;
};

export async function getCategoryPageData(
  category: "Finance" | "AI",
  dbCountry?: string
): Promise<CategoryPageData> {
  const supabase = createAdminClient();

  let query = supabase
    .from("jobs")
    .select("*", { count: "exact" })
    .eq("category", category)
    .eq("is_active", true)
    .order("freshness_score", { ascending: false })
    .limit(8);

  if (dbCountry) {
    query = query.eq("country", dbCountry);
  }

  const { data, count } = await query;

  return {
    topJobs: (data ?? []) as Job[],
    totalCount: count ?? 0,
  };
}

export async function getCountryCounts(
  category: "Finance" | "AI"
): Promise<CategoryCountryCount[]> {
  const supabase = createAdminClient();

  const results = await Promise.all(
    COUNTRY_META.map(async (c) => {
      const { count } = await supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("category", category)
        .eq("country", c.dbCode)
        .eq("is_active", true);
      return { country: c, count: count ?? 0 };
    })
  );

  return results.filter((r) => r.count > 0);
}
