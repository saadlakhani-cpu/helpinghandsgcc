"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { enquiryStatuses } from "@/lib/enquiries";

export function EnquiryStatus({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function update(value: string) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: value }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <select
        aria-label="Enquiry status"
        value={status}
        disabled={busy}
        onChange={(e) => update(e.target.value)}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-50"
      >
        {enquiryStatuses.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      {busy && (
        <p role="status" className="mt-1 text-xs">
          Saving...
        </p>
      )}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
