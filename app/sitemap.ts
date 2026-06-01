import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 3600; // regenerate hourly

const COUNTRY_SLUGS = ["uae", "ksa", "qatar", "kuwait", "bahrain", "oman"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://gulffinancejobs.com";

  const now = new Date();

  // ── Static pages ──────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/jobs`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/subscribe`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/finance-jobs`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${base}/ai-jobs`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
  ];

  // ── SEO country landing pages ─────────────────────────────────────────────
  const seoPages: MetadataRoute.Sitemap = COUNTRY_SLUGS.flatMap((c) => [
    {
      url: `${base}/finance-jobs/${c}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${base}/ai-jobs/${c}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
  ]);

  // ── Job detail pages (up to 1 000 most recent active) ────────────────────
  let jobPages: MetadataRoute.Sitemap = [];
  try {
    const supabase = createAdminClient();
    const { data: jobs } = await supabase
      .from("jobs")
      .select("slug, date_scraped")
      .eq("is_active", true)
      .order("date_scraped", { ascending: false })
      .limit(1000);

    jobPages = (jobs ?? []).map(
      (j: { slug: string; date_scraped: string }) => ({
        url: `${base}/jobs/${j.slug}`,
        lastModified: new Date(j.date_scraped),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })
    );
  } catch {
    // Non-fatal: sitemap still served without job pages
  }

  return [...staticPages, ...seoPages, ...jobPages];
}
