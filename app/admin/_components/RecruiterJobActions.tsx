"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type RecruiterAction =
  | "approve-recruiter-job"
  | "reject-recruiter-job"
  | "publish-recruiter-job";

type ActionResult = {
  message?: string;
  error?: string;
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

  async function runAction(action: RecruiterAction) {
    setLoading(action);
    setMessage("");

    try {
      const response = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, recruiterJobId }),
      });
      const result = (await response.json()) as ActionResult;

      if (!response.ok || result.error) {
        setMessage(result.error ?? "Action failed.");
        return;
      }

      setMessage(result.message ?? "Done.");
      router.refresh();
    } catch {
      setMessage("Network error.");
    } finally {
      setLoading(null);
    }
  }

  const isPublished = status === "published";
  const isRejected = status === "rejected";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading !== null || isPublished}
          onClick={() => runAction("approve-recruiter-job")}
          className="rounded border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading === "approve-recruiter-job" ? "..." : "Approve"}
        </button>
        <button
          type="button"
          disabled={loading !== null || isPublished || isRejected}
          onClick={() => runAction("reject-recruiter-job")}
          className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading === "reject-recruiter-job" ? "..." : "Reject"}
        </button>
        <button
          type="button"
          disabled={loading !== null || isPublished || isRejected}
          onClick={() => runAction("publish-recruiter-job")}
          className="rounded border border-orange-200 bg-orange-50 px-2 py-1 text-xs font-medium text-recruiter transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading === "publish-recruiter-job" ? "..." : "Publish"}
        </button>
      </div>
      {message && <p className="max-w-[180px] text-xs text-gray-500">{message}</p>}
    </div>
  );
}
