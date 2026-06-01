import Link from "next/link";
import {
  getAdminStats,
  getRecentAlerts,
  getRecentJobs,
  getRecentMatches,
  getSources,
  type RecentAlertRow,
  type RecentJobRow,
  type RecentMatchRow,
  type SourceRow,
} from "@/lib/admin/stats";
import { AdminActions } from "@/app/admin/_components/AdminActions";

export const dynamic = "force-dynamic";

// ── Date helper ───────────────────────────────────────────────────────────────

function fmt(iso: string | null): string {
  if (!iso) return "–";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold ${accent ?? "text-primary"}`}>
        {value.toLocaleString()}
      </p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function Dot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${active ? "bg-green-500" : "bg-gray-300"}`}
    />
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold ${color}`}
    >
      {text}
    </span>
  );
}

function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      {children}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-3 py-2.5 text-sm text-gray-700 ${className ?? ""}`}>
      {children}
    </td>
  );
}

function EmptyRow({ cols, message }: { cols: number; message: string }) {
  return (
    <tr>
      <td
        colSpan={cols}
        className="px-3 py-8 text-center text-sm text-gray-400"
      >
        {message}
      </td>
    </tr>
  );
}

// ── Sources table ─────────────────────────────────────────────────────────────

function SourcesTable({ sources }: { sources: SourceRow[] }) {
  return (
    <TableWrap>
      <table className="min-w-full">
        <thead className="border-b border-gray-100 bg-gray-50">
          <tr>
            <Th>Source</Th>
            <Th>Type</Th>
            <Th>Priority</Th>
            <Th>Last Scraped</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sources.length === 0 ? (
            <EmptyRow cols={5} message="No sources configured yet" />
          ) : (
            sources.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <Td>
                  <span className="font-medium">{s.name}</span>
                </Td>
                <Td>{s.type}</Td>
                <Td>{s.priority}</Td>
                <Td>{fmt(s.last_scraped)}</Td>
                <Td>
                  <span className="flex items-center gap-1.5">
                    <Dot active={s.is_active} />
                    {s.is_active ? "Active" : "Inactive"}
                  </span>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableWrap>
  );
}

// ── Recent jobs table ─────────────────────────────────────────────────────────

function RecentJobsTable({ jobs }: { jobs: RecentJobRow[] }) {
  return (
    <TableWrap>
      <table className="min-w-full">
        <thead className="border-b border-gray-100 bg-gray-50">
          <tr>
            <Th>Title</Th>
            <Th>Company</Th>
            <Th>Category</Th>
            <Th>Country</Th>
            <Th>Platform</Th>
            <Th>Scraped</Th>
            <Th>Active</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {jobs.length === 0 ? (
            <EmptyRow cols={7} message="No jobs ingested yet" />
          ) : (
            jobs.map((j) => (
              <tr key={j.id} className="hover:bg-gray-50">
                <Td className="max-w-xs">
                  <Link
                    href={`/jobs/${j.slug}`}
                    target="_blank"
                    className="line-clamp-1 font-medium hover:text-finance hover:underline"
                  >
                    {j.title}
                  </Link>
                </Td>
                <Td className="max-w-[120px] truncate">{j.company}</Td>
                <Td>
                  <Badge
                    text={j.category}
                    color={
                      j.category === "Finance"
                        ? "bg-blue-50 text-finance"
                        : "bg-purple-50 text-ai"
                    }
                  />
                </Td>
                <Td>{j.country}</Td>
                <Td className="max-w-[100px] truncate text-xs text-gray-500">
                  {j.platform}
                </Td>
                <Td className="text-xs text-gray-500">{fmt(j.date_scraped)}</Td>
                <Td>
                  <Dot active={j.is_active} />
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableWrap>
  );
}

// ── Job matches table (Step 11 verification) ──────────────────────────────────

function MatchesTable({ matches }: { matches: RecentMatchRow[] }) {
  return (
    <TableWrap>
      <table className="min-w-full">
        <thead className="border-b border-gray-100 bg-gray-50">
          <tr>
            <Th>Subscriber</Th>
            <Th>Job</Th>
            <Th>Score</Th>
            <Th>Matched</Th>
            <Th>Notified</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {matches.length === 0 ? (
            <EmptyRow cols={5} message="No job matches yet" />
          ) : (
            matches.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <Td>
                  <p className="font-medium">{m.subscriber_name}</p>
                  <p className="text-xs text-gray-400">{m.subscriber_email}</p>
                </Td>
                <Td className="max-w-xs">
                  <Link
                    href={`/jobs/${m.job_slug}`}
                    target="_blank"
                    className="line-clamp-1 hover:text-finance hover:underline"
                  >
                    {m.job_title}
                  </Link>
                </Td>
                <Td>
                  <span className="font-mono text-xs">
                    {m.match_score.toFixed(2)}
                  </span>
                </Td>
                <Td className="text-xs text-gray-500">
                  {fmt(m.matched_at)}
                </Td>
                <Td>
                  {m.notified ? (
                    <Badge text="Sent" color="bg-green-50 text-green-700" />
                  ) : (
                    <Badge text="Pending" color="bg-amber-50 text-amber-700" />
                  )}
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableWrap>
  );
}

// ── Alerts log table (Step 11 verification) ───────────────────────────────────

function AlertsLogTable({ alerts }: { alerts: RecentAlertRow[] }) {
  return (
    <TableWrap>
      <table className="min-w-full">
        <thead className="border-b border-gray-100 bg-gray-50">
          <tr>
            <Th>Subscriber</Th>
            <Th>Job</Th>
            <Th>Channel</Th>
            <Th>Sent</Th>
            <Th>Opened</Th>
            <Th>Clicked</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {alerts.length === 0 ? (
            <EmptyRow cols={6} message="No alerts sent yet" />
          ) : (
            alerts.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <Td>
                  <p className="font-medium">{a.subscriber_name}</p>
                  <p className="text-xs text-gray-400">{a.subscriber_email}</p>
                </Td>
                <Td className="max-w-xs">
                  <Link
                    href={`/jobs/${a.job_slug}`}
                    target="_blank"
                    className="line-clamp-1 hover:text-finance hover:underline"
                  >
                    {a.job_title}
                  </Link>
                </Td>
                <Td>
                  <Badge text={a.channel} color="bg-slate-100 text-slate-600" />
                </Td>
                <Td className="text-xs text-gray-500">{fmt(a.sent_at)}</Td>
                <Td>
                  <Dot active={a.opened} />
                </Td>
                <Td>
                  <Dot active={a.clicked} />
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableWrap>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminPage() {
  const [stats, sources, recentJobs, recentMatches, recentAlerts] =
    await Promise.all([
      getAdminStats(),
      getSources(),
      getRecentJobs(25),
      getRecentMatches(25),
      getRecentAlerts(25),
    ]);

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-bold text-white">
                GF
              </div>
            </Link>
            <span className="text-sm font-semibold text-primary">
              Admin Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-primary"
              target="_blank"
            >
              View Site ↗
            </Link>
            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        {/* ── Stats grid ─────────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Overview
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            <StatCard
              label="Total Jobs"
              value={stats.jobs.total}
              sub={`${stats.jobs.inactive} inactive`}
            />
            <StatCard
              label="Finance"
              value={stats.jobs.finance}
              accent="text-finance"
            />
            <StatCard
              label="AI"
              value={stats.jobs.ai}
              accent="text-ai"
            />
            <StatCard
              label="Subscribers"
              value={stats.subscribers.total}
              sub={`+${stats.subscribers.last_7d} this week`}
            />
            <StatCard
              label="Matches"
              value={stats.matches.total}
              sub={`${stats.matches.pending} pending`}
            />
            <StatCard
              label="Notified"
              value={stats.matches.notified}
              accent="text-green-600"
            />
            <StatCard
              label="Alerts Sent"
              value={stats.alerts.total}
              sub={`${stats.alerts.last_24h} last 24h`}
            />
            <StatCard
              label="Pending Alerts"
              value={stats.matches.pending}
              accent={stats.matches.pending > 0 ? "text-amber-600" : "text-gray-400"}
            />
          </div>
        </section>

        {/* ── Sources + Actions ───────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Sources Status
            </h2>
            <SourcesTable sources={sources} />
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Actions
            </h2>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <AdminActions />
            </div>
          </section>
        </div>

        {/* ── Recent Jobs ─────────────────────────────────────────────────── */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Recent Jobs{" "}
              <span className="normal-case font-normal text-gray-400">
                (last 25)
              </span>
            </h2>
            <Link
              href="/jobs"
              target="_blank"
              className="text-xs text-finance hover:underline"
            >
              Browse all →
            </Link>
          </div>
          <RecentJobsTable jobs={recentJobs} />
        </section>

        {/* ── Job Matches — Step 11 verification ──────────────────────────── */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Job Matches{" "}
            <span className="normal-case font-normal text-gray-400">
              (last 25 · tracking verification)
            </span>
          </h2>
          <MatchesTable matches={recentMatches} />
        </section>

        {/* ── Alerts Log — Step 11 verification ───────────────────────────── */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Alerts Log{" "}
            <span className="normal-case font-normal text-gray-400">
              (last 25 · tracking verification)
            </span>
          </h2>
          <AlertsLogTable alerts={recentAlerts} />
        </section>
      </main>
    </div>
  );
}
