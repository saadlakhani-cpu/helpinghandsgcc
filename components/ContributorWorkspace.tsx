"use client";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { countries, statuses, type Submission } from "@/lib/contributors/model";

type Member = {
  email: string;
  name: string;
  rate_minor: number;
  currency: string;
  active: boolean;
};
type Result = { url: string; status: string; reason?: string };
const input =
  "mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900";
const button =
  "rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50";

export function ContributorWorkspace({ admin = false }: { admin?: boolean }) {
  const [rows, setRows] = useState<Submission[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [member, setMember] = useState<Member | null>(null);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [filter, setFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [editing, setEditing] = useState<Submission | null>(null);
  const fetching = useRef<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (editing) dialog.current?.showModal();
  }, [editing]);
  const endpoint = admin ? "/api/admin/contributors" : "/api/contributors";
  const headers = useCallback(async () => {
    if (admin)
      return { "Content-Type": "application/json" } as Record<string, string>;
    const { data, error } = await createBrowserClient().auth.getSession();
    if (error || !data.session)
      throw new Error("Sign in with your contributor email to continue.");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.session.access_token}`,
    };
  }, [admin]);
  const refresh = useCallback(async () => {
    const key = `${endpoint}:${page}:${filter}:${emailFilter}`;
    if (fetching.current === key) return;
    fetching.current = key;
    try {
      const response = await fetch(
        `${endpoint}?page=${page}&status=${encodeURIComponent(filter)}&email=${encodeURIComponent(emailFilter)}`,
        {
          headers: await headers(),
          cache: "no-store",
          signal: AbortSignal.timeout(15000),
        },
      );
      const data = await response.json();
      if (fetching.current !== key) return;
      if (!response.ok) throw new Error(data.error);
      setRows(data.rows || []);
      setCount(data.count || 0);
      setMembers(data.members || []);
      setMember(data.member || null);
      setError("");
    } catch (err) {
      if (fetching.current !== key) return;
      setError(
        err instanceof Error ? err.message : "Could not load submissions.",
      );
    } finally {
      if (fetching.current === key) {
        fetching.current = null;
        setLoading(false);
      }
    }
  }, [endpoint, page, filter, emailFilter, headers]);
  useEffect(() => {
    void refresh();
    const tick = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const timer = window.setInterval(tick, 10000);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", tick);
    };
  }, [refresh]);
  async function send(payload: unknown) {
    if (busy) return false;
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: await headers(),
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(60000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");
      if (data.results) setResults(data.results);
      setNotice(
        data.status === "duplicate"
          ? "This vacancy is already published. No earning was added."
          : data.processed !== undefined
            ? `Processed ${data.processed} queued links.`
            : "Saved.",
      );
      await refresh();
      return true;
    } catch (err) {
      setNotice(
        err instanceof Error
          ? err.message
          : "Request failed. Refresh before retrying.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function submitLinks(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    if (await send({ links: values.get("links") })) form.reset();
  }
  async function submitMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    if (
      await send({
        ...data,
        action: "member",
        rate_minor: Math.round(Number(data.rate) * 100),
        active: data.active === "on",
      })
    )
      form.reset();
  }
  async function saveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    if (
      await send({
        action: "details",
        id: editing.id,
        details: Object.fromEntries(new FormData(event.currentTarget)),
      })
    )
      setEditing(null);
  }
  return (
    <div className="space-y-6">
      {admin ? (
        <div className="flex flex-wrap gap-3">
          <Link href="/admin" className={button}>
            Back to Admin
          </Link>
          <button
            disabled={busy}
            onClick={() => send({ action: "process" })}
            className={button}
          >
            Process Next 3 Links
          </button>
        </div>
      ) : (
        <p className="text-sm leading-6 text-gray-600">
          Paste up to 25 job links, one per line. Duplicate links are flagged on
          submission. Accepted links are queued for extraction and admin review.
          Only approved, unique jobs earn credit.
        </p>
      )}
      {error && (
        <div role="alert" className="rounded-md bg-red-50 p-4 text-red-700">
          {error}
          {!admin && (
            <Link
              className="ml-3 underline"
              href="/sign-in?returnTo=%2Fcontributors"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
      {member && (
        <p className="rounded-md bg-emerald-50 p-4 text-sm">
          {member.name} · {member.email} · Current rate:{" "}
          {(member.rate_minor / 100).toFixed(2)} {member.currency} per approved
          job. The rate at approval is recorded with each earning.
        </p>
      )}
      {admin && (
        <details className="border-y border-gray-200 py-4">
          <summary className="cursor-pointer font-semibold">
            Contributor Access &amp; Rates
          </summary>
          <p className="mt-3 text-sm text-gray-600">
            The contributor registers and verifies their email through the
            normal sign-in page. Add that email here to grant access. Saving an
            existing email updates their access and rate.
          </p>
          <form
            onSubmit={submitMember}
            className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <label>
              Name
              <input name="name" required maxLength={100} className={input} />
            </label>
            <label>
              Email
              <input name="email" type="email" required className={input} />
            </label>
            <label>
              Rate per approved job
              <input
                name="rate"
                type="number"
                min="0"
                max="10000"
                step="0.01"
                required
                defaultValue="0"
                className={input}
              />
            </label>
            <label>
              Currency
              <select name="currency" className={input}>
                <option>SAR</option>
                <option>AED</option>
                <option>USD</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <input name="active" type="checkbox" defaultChecked />
              Access enabled
            </label>
            <button disabled={busy} className={button}>
              Save Contributor
            </button>
          </form>
          <ul className="mt-5 divide-y divide-gray-100">
            {members.map((m) => (
              <li
                key={m.email}
                className="flex flex-wrap justify-between gap-2 py-3 text-sm"
              >
                <span>
                  {m.name} · {m.email}
                </span>
                <span>
                  {(m.rate_minor / 100).toFixed(2)} {m.currency} ·{" "}
                  {m.active ? "Enabled" : "Disabled"}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
      {!admin && member && (
        <form onSubmit={submitLinks}>
          <label className="block font-semibold">
            Job links
            <textarea
              name="links"
              rows={5}
              required
              maxLength={51000}
              placeholder="https://..."
              className={input}
            />
          </label>
          <button
            disabled={busy}
            className="mt-3 rounded-md bg-finance px-5 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Submitting..." : "Submit Links"}
          </button>
        </form>
      )}
      {notice && (
        <p
          role="status"
          className="border-l-4 border-finance bg-blue-50 p-4 text-sm"
        >
          {notice}
        </p>
      )}
      {results.length > 0 && (
        <section
          aria-label="Submission results"
          className="border-y border-gray-200 py-4"
        >
          <h2 className="font-semibold">Latest Batch</h2>
          <ul className="mt-3 space-y-3">
            {results.map((r, i) => (
              <li key={i} className="break-all text-sm">
                <strong
                  className={
                    r.status === "duplicate" ? "text-amber-800" : "text-primary"
                  }
                >
                  {r.status.replaceAll("_", " ")}
                </strong>{" "}
                · {r.url}
                {r.reason && <p className="text-gray-600">{r.reason}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
      {admin && (
        <div className="flex flex-wrap gap-4">
          <label>
            Status
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className={input}
            >
              <option value="">All</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label>
            Contributor
            <select
              value={emailFilter}
              onChange={(e) => {
                setEmailFilter(e.target.value);
                setPage(1);
              }}
              className={input}
            >
              <option value="">All</option>
              {members.map((m) => (
                <option key={m.email}>{m.email}</option>
              ))}
            </select>
          </label>
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">
          {admin ? "Submission Review" : "My Submissions"}{" "}
          <span className="text-sm font-normal text-gray-500">({count})</span>
        </h2>
        <button className={button} onClick={() => refresh()}>
          Refresh
        </button>
      </div>
      {loading ? (
        <p role="status">Loading submissions...</p>
      ) : rows.length === 0 ? (
        <p className="py-8 text-gray-500">No submissions to display.</p>
      ) : (
        <div className="divide-y divide-gray-200 border-y border-gray-200">
          {rows.map((row) => (
            <article
              key={row.id}
              className="grid gap-5 py-5 md:grid-cols-[1fr_220px]"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold">
                    {row.status.replaceAll("_", " ")}
                  </span>
                  <time className="py-1 text-xs text-gray-500">
                    {new Date(row.created_at).toLocaleString()}
                  </time>
                </div>
                <h3 className="mt-2 break-words font-semibold">
                  {row.details?.title || "Job details pending"}
                </h3>
                <a
                  href={row.canonical_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block break-all text-sm text-finance underline"
                >
                  {row.original_url}
                </a>
                {admin && (
                  <p className="mt-2 text-sm">{row.contributor_email}</p>
                )}
                {row.reason && (
                  <p className="mt-2 text-sm text-amber-800">{row.reason}</p>
                )}
                {row.details && (
                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer">Job Details</summary>
                    <p className="mt-2">
                      {row.details.company} · {row.details.city},{" "}
                      {row.details.country} · {row.details.category} · Posted{" "}
                      {row.details.date_posted}
                    </p>
                    <p className="mt-3 whitespace-pre-wrap break-words leading-6">
                      {row.details.description}
                    </p>
                  </details>
                )}
                <p className="mt-3 break-all text-xs text-gray-400">
                  Reference: {row.id}
                </p>
              </div>
              <div className="space-y-3 text-sm">
                {row.status === "approved" ? (
                  <>
                    <p className="font-semibold">
                      {(row.amount_minor / 100).toFixed(2)} {row.currency}
                    </p>
                    <p>
                      {row.paid_at
                        ? `Paid: ${row.payment_reference}`
                        : "Eligible for payment"}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">
                    {["duplicate", "rejected"].includes(row.status)
                      ? "Not eligible for payment"
                      : "Payment pending approval"}
                  </p>
                )}
                {!admin && row.status === "needs_details" && (
                  <button
                    disabled={busy}
                    className={button}
                    onClick={() => setEditing(row)}
                  >
                    Complete Details
                  </button>
                )}
                {admin && row.status === "review" && (
                  <button
                    disabled={busy}
                    className={button}
                    onClick={() => send({ action: "approve", id: row.id })}
                  >
                    Approve &amp; Publish
                  </button>
                )}
                {admin && ["review", "needs_details"].includes(row.status) && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const data = new FormData(e.currentTarget);
                      void send({
                        id: row.id,
                        action: data.get("action"),
                        reason: data.get("reason"),
                      });
                    }}
                    className="space-y-2"
                  >
                    <input
                      aria-label="Review reason"
                      name="reason"
                      required
                      maxLength={1000}
                      placeholder="Reason"
                      className={input}
                    />
                    <select
                      name="action"
                      aria-label="Review action"
                      className={input}
                    >
                      <option value="return">Return for details</option>
                      <option value="reject">Reject</option>
                    </select>
                    <button disabled={busy} className={button}>
                      Save Decision
                    </button>
                  </form>
                )}
                {admin && row.status === "approved" && !row.paid_at && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void send({
                        action: "paid",
                        id: row.id,
                        reference: new FormData(e.currentTarget).get(
                          "reference",
                        ),
                      });
                    }}
                  >
                    <input
                      name="reference"
                      aria-label="Payment reference"
                      required
                      maxLength={200}
                      placeholder="Payment reference"
                      className={input}
                    />
                    <button disabled={busy} className={`${button} mt-2`}>
                      Record Paid
                    </button>
                  </form>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className={button}
        >
          Previous
        </button>
        <span className="text-sm">Page {page}</span>
        <button
          disabled={page * 25 >= count}
          onClick={() => setPage((p) => p + 1)}
          className={button}
        >
          Next
        </button>
      </div>
      {editing && (
        <dialog
          ref={dialog}
          aria-labelledby="details-title"
          onCancel={() => setEditing(null)}
          className="max-h-[90vh] w-[calc(100%_-_2rem)] max-w-2xl overflow-y-auto rounded-lg bg-white p-0 backdrop:bg-black/40"
        >
          <section
            aria-labelledby="details-title"
            className="mx-auto my-6 max-w-2xl rounded-lg bg-white p-6"
          >
            <h2 id="details-title" className="text-xl font-semibold">
              Complete Job Details
            </h2>
            <p className="mt-2 break-all text-xs text-gray-500">
              {editing.canonical_url}
            </p>
            <form onSubmit={saveDetails} className="mt-4 space-y-4">
              {(["title", "company", "city"] as const).map((name) => (
                <label key={name} className="block capitalize">
                  {name}
                  <input
                    name={name}
                    required
                    maxLength={name === "city" ? 100 : 200}
                    defaultValue={editing.details?.[name]}
                    className={input}
                  />
                </label>
              ))}
              <label className="block">
                Country
                <select
                  name="country"
                  required
                  defaultValue={editing.details?.country || ""}
                  className={input}
                >
                  <option value="">Select country</option>
                  {countries.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                Category
                <select
                  name="category"
                  required
                  defaultValue={editing.details?.category || "Finance"}
                  className={input}
                >
                  <option>Finance</option>
                  <option>AI</option>
                </select>
              </label>
              <label className="block">
                Original posting date
                <input
                  type="date"
                  name="date_posted"
                  required
                  max={new Date().toISOString().slice(0, 10)}
                  defaultValue={editing.details?.date_posted}
                  className={input}
                />
              </label>
              <label className="block">
                Job description
                <textarea
                  name="description"
                  required
                  maxLength={12000}
                  rows={5}
                  defaultValue={editing.details?.description}
                  className={input}
                />
              </label>
              <div className="flex gap-3">
                <button disabled={busy} className={button}>
                  Send for Review
                </button>
                <button
                  type="button"
                  disabled={busy}
                  className={button}
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
              </div>
              {notice && (
                <p role="status" className="text-sm">
                  {notice}
                </p>
              )}
            </form>
          </section>
        </dialog>
      )}
    </div>
  );
}
