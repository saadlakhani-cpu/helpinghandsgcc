"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type RecruiterAction =
  | "approve-recruiter-job"
  | "reject-recruiter-job"
  | "publish-recruiter-job";

type ActionResult = {
  message?: string;
  error?: string;
  status?: string;
  slug?: string;
};

export function RecruiterJobActions({
  recruiterJobId,
  status,
}: {
  recruiterJobId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<RecruiterAction | null>(null);
  const [message, setMessage] = useState("");
  const [currentStatus, setCurrentStatus] = useState(status);
  const [slug, setSlug] = useState<string>();
  useEffect(() => setCurrentStatus(status), [status]);

  async function runAction(action: RecruiterAction) {
    if (loading) return;
    setLoading(action);
    setMessage("");

    try {
      const response = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, recruiterJobId }),
        signal: AbortSignal.timeout(25000),
      });
      const result = (await response.json()) as ActionResult;

      if (!response.ok || result.error) {
        setMessage(result.error ?? "Action failed.");
        return;
      }

      setMessage(result.message ?? "Done.");
      if (result.status) setCurrentStatus(result.status);
      setSlug(result.slug);
      router.refresh();
    } catch {
      setMessage("Network error.");
    } finally {
      setLoading(null);
    }
  }

  const isPublished = currentStatus === "published";
  const isRejected = currentStatus === "rejected";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading !== null || isPublished || isRejected}
          onClick={() => runAction("approve-recruiter-job")}
          className="rounded border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading === "approve-recruiter-job" ? "Publishing..." : isPublished ? "Published" : "Approve & Publish"}
        </button>
        <button
          type="button"
          disabled={loading !== null || isPublished || isRejected}
          onClick={() => runAction("reject-recruiter-job")}
          className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading === "reject-recruiter-job" ? "..." : "Reject"}
        </button>
      </div>
      {message && <p role="status" className="max-w-[220px] text-xs text-gray-500">{message}</p>}
      {slug && <Link href={`/jobs/${slug}`} className="inline-block text-xs text-finance underline">View published job</Link>}
    </div>
  );
}
