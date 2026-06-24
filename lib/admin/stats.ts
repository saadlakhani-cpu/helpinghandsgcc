import { createAdminClient } from "@/lib/supabase/admin";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AdminStats = {
  jobs: { total: number; finance: number; ai: number; inactive: number };
  subscribers: { total: number; last_7d: number };
  matches: { total: number; pending: number; notified: number };
  alerts: { total: number; last_24h: number };
  recruiters: { profiles: number; job_posts: number; pending_jobs: number };
};

export type SourceRow = {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  last_scraped: string | null;
  priority: number;
};

export type RecentJobRow = {
  id: string;
  title: string;
  company: string;
  category: string;
  country: string;
  platform: string;
  date_scraped: string;
  is_active: boolean;
  slug: string;
};

export type RecentAlertRow = {
  id: string;
  sent_at: string;
  channel: string;
  opened: boolean;
  clicked: boolean;
  subscriber_name: string;
  subscriber_email: string;
  job_title: string;
  job_slug: string;
};

export type RecentMatchRow = {
  id: string;
  matched_at: string;
  notified: boolean;
  match_score: number;
  subscriber_name: string;
  subscriber_email: string;
  job_title: string;
  job_slug: string;
};

export type RecruiterJobPostRow = {
  id: string;
  title: string;
  category: string;
  company: string;
  country: string;
  city: string;
  status: string;
  screening_requested: boolean;
  created_at: string;
  contact_name: string;
  work_email: string;
};

// ── Helper ────────────────────────────────────────────────────────────────────

function unique(ids: string[]): string[] {
  const seen: Record<string, true> = {};
  return ids.filter((id) => {
    if (seen[id]) return false;
    seen[id] = true;
    return true;
  });
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = createAdminClient();

  const since7d = new Date();
  since7d.setDate(since7d.getDate() - 7);

  const since24h = new Date();
  since24h.setHours(since24h.getHours() - 24);

  const [
    totalJobsRes,
    financeJobsRes,
    aiJobsRes,
    inactiveJobsRes,
    totalSubsRes,
    recent7dSubsRes,
    totalMatchesRes,
    pendingMatchesRes,
    notifiedMatchesRes,
    totalAlertsRes,
    recent24hAlertsRes,
    recruiterProfilesRes,
    recruiterJobPostsRes,
    pendingRecruiterJobsRes,
  ] = await Promise.all([
    supabase.from("jobs").select("id", { count: "exact", head: true }),
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("category", "Finance")
      .eq("is_active", true),
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("category", "AI")
      .eq("is_active", true),
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("is_active", false),
    supabase.from("subscribers").select("id", { count: "exact", head: true }),
    supabase
      .from("subscribers")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since7d.toISOString()),
    supabase.from("job_matches").select("id", { count: "exact", head: true }),
    supabase
      .from("job_matches")
      .select("id", { count: "exact", head: true })
      .eq("notified", false),
    supabase
      .from("job_matches")
      .select("id", { count: "exact", head: true })
      .eq("notified", true),
    supabase.from("alerts_log").select("id", { count: "exact", head: true }),
    supabase
      .from("alerts_log")
      .select("id", { count: "exact", head: true })
      .gte("sent_at", since24h.toISOString()),
    supabase
      .from("recruiter_profiles")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("recruiter_job_posts")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("recruiter_job_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_review"),
  ]);

  return {
    jobs: {
      total: totalJobsRes.count ?? 0,
      finance: financeJobsRes.count ?? 0,
      ai: aiJobsRes.count ?? 0,
      inactive: inactiveJobsRes.count ?? 0,
    },
    subscribers: {
      total: totalSubsRes.count ?? 0,
      last_7d: recent7dSubsRes.count ?? 0,
    },
    matches: {
      total: totalMatchesRes.count ?? 0,
      pending: pendingMatchesRes.count ?? 0,
      notified: notifiedMatchesRes.count ?? 0,
    },
    alerts: {
      total: totalAlertsRes.count ?? 0,
      last_24h: recent24hAlertsRes.count ?? 0,
    },
    recruiters: {
      profiles: recruiterProfilesRes.count ?? 0,
      job_posts: recruiterJobPostsRes.count ?? 0,
      pending_jobs: pendingRecruiterJobsRes.count ?? 0,
    },
  };
}

export async function getSources(): Promise<SourceRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("sources")
    .select("id, name, type, is_active, last_scraped, priority")
    .order("priority", { ascending: true });
  return (data ?? []) as SourceRow[];
}

export async function getRecentJobs(limit = 25): Promise<RecentJobRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("jobs")
    .select(
      "id, title, company, category, country, platform, date_scraped, is_active, slug"
    )
    .order("date_scraped", { ascending: false })
    .limit(limit);
  return (data ?? []) as RecentJobRow[];
}

export async function getRecentAlerts(limit = 25): Promise<RecentAlertRow[]> {
  const supabase = createAdminClient();

  const { data: alerts } = await supabase
    .from("alerts_log")
    .select("id, sent_at, channel, subscriber_id, job_id, opened, clicked")
    .order("sent_at", { ascending: false })
    .limit(limit);

  if (!alerts || alerts.length === 0) return [];

  const subIds = unique(alerts.map((a: { subscriber_id: string }) => a.subscriber_id));
  const jobIds = unique(alerts.map((a: { job_id: string }) => a.job_id));

  const [subsRes, jobsRes] = await Promise.all([
    supabase.from("subscribers").select("id, name, email").in("id", subIds),
    supabase.from("jobs").select("id, title, slug").in("id", jobIds),
  ]);

  type SubRow = { id: string; name: string; email: string };
  type JobRow = { id: string; title: string; slug: string };

  const subMap: Record<string, SubRow> = {};
  (subsRes.data ?? []).forEach((s: SubRow) => { subMap[s.id] = s; });

  const jobMap: Record<string, JobRow> = {};
  (jobsRes.data ?? []).forEach((j: JobRow) => { jobMap[j.id] = j; });

  return alerts.map(
    (a: {
      id: string;
      sent_at: string;
      channel: string;
      subscriber_id: string;
      job_id: string;
      opened: boolean;
      clicked: boolean;
    }) => ({
      id: a.id,
      sent_at: a.sent_at,
      channel: a.channel,
      opened: a.opened,
      clicked: a.clicked,
      subscriber_name: subMap[a.subscriber_id]?.name ?? "–",
      subscriber_email: subMap[a.subscriber_id]?.email ?? "",
      job_title: jobMap[a.job_id]?.title ?? "–",
      job_slug: jobMap[a.job_id]?.slug ?? "",
    })
  );
}

export async function getRecentMatches(limit = 25): Promise<RecentMatchRow[]> {
  const supabase = createAdminClient();

  const { data: matches } = await supabase
    .from("job_matches")
    .select("id, matched_at, notified, match_score, subscriber_id, job_id")
    .order("matched_at", { ascending: false })
    .limit(limit);

  if (!matches || matches.length === 0) return [];

  const subIds = unique(matches.map((m: { subscriber_id: string }) => m.subscriber_id));
  const jobIds = unique(matches.map((m: { job_id: string }) => m.job_id));

  const [subsRes, jobsRes] = await Promise.all([
    supabase.from("subscribers").select("id, name, email").in("id", subIds),
    supabase.from("jobs").select("id, title, slug").in("id", jobIds),
  ]);

  type SubRow = { id: string; name: string; email: string };
  type JobRow = { id: string; title: string; slug: string };

  const subMap: Record<string, SubRow> = {};
  (subsRes.data ?? []).forEach((s: SubRow) => { subMap[s.id] = s; });

  const jobMap: Record<string, JobRow> = {};
  (jobsRes.data ?? []).forEach((j: JobRow) => { jobMap[j.id] = j; });

  return matches.map(
    (m: {
      id: string;
      matched_at: string;
      notified: boolean;
      match_score: number;
      subscriber_id: string;
      job_id: string;
    }) => ({
      id: m.id,
      matched_at: m.matched_at,
      notified: m.notified,
      match_score: m.match_score,
      subscriber_name: subMap[m.subscriber_id]?.name ?? "–",
      subscriber_email: subMap[m.subscriber_id]?.email ?? "",
      job_title: jobMap[m.job_id]?.title ?? "–",
      job_slug: jobMap[m.job_id]?.slug ?? "",
    })
  );
}

export async function getRecruiterJobPosts(
  limit = 25
): Promise<RecruiterJobPostRow[]> {
  const supabase = createAdminClient();

  const { data: posts } = await supabase
    .from("recruiter_job_posts")
    .select(
      "id, title, category, company, country, city, status, screening_requested, created_at, recruiter_profile_id"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!posts || posts.length === 0) return [];

  const profileIds = unique(
    posts.map((post: { recruiter_profile_id: string }) => post.recruiter_profile_id)
  );

  const { data: profiles } = await supabase
    .from("recruiter_profiles")
    .select("id, contact_name, work_email")
    .in("id", profileIds);

  type ProfileRow = { id: string; contact_name: string; work_email: string };

  const profileMap: Record<string, ProfileRow> = {};
  (profiles ?? []).forEach((profile: ProfileRow) => {
    profileMap[profile.id] = profile;
  });

  return posts.map(
    (post: {
      id: string;
      title: string;
      category: string;
      company: string;
      country: string;
      city: string;
      status: string;
      screening_requested: boolean;
      created_at: string;
      recruiter_profile_id: string;
    }) => ({
      id: post.id,
      title: post.title,
      category: post.category,
      company: post.company,
      country: post.country,
      city: post.city,
      status: post.status,
      screening_requested: post.screening_requested,
      created_at: post.created_at,
      contact_name: profileMap[post.recruiter_profile_id]?.contact_name ?? "-",
      work_email: profileMap[post.recruiter_profile_id]?.work_email ?? "",
    })
  );
}
