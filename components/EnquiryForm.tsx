"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  enquiryLabels,
  enquiryTopics,
  type EnquiryType,
} from "@/lib/enquiries";

export function EnquiryForm({
  types,
  initialType,
  initialTopic,
}: {
  types: EnquiryType[];
  initialType?: EnquiryType;
  initialTopic?: string;
}) {
  const [type, setType] = useState<EnquiryType>(
    initialType && types.includes(initialType) ? initialType : types[0],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const fields = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(fields),
          type,
          consent: fields.get("consent") === "on",
        }),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Please try again later.");
      setSuccess(true);
      const analytics = window as Window & {
        gtag?: (...args: unknown[]) => void;
      };
      try {
        analytics.gtag?.("event", "generate_lead", {
          enquiry_type: type,
          service_topic: fields.get("topic"),
        });
      } catch {
        /* Analytics must not affect a saved enquiry. */
      }
    } catch (err) {
      setError(
        err instanceof Error && err.name !== "TimeoutError"
          ? err.message
          : "The request timed out. Please contact us before resubmitting if you are unsure it was received.",
      );
    } finally {
      setBusy(false);
    }
  }
  const input =
    "mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 focus:border-finance focus:outline-none focus:ring-2 focus:ring-finance/20";
  if (success)
    return (
      <div
        role="status"
        className="border-l-4 border-finance bg-emerald-50 p-6"
      >
        <h3 className="text-xl font-semibold">
          Thank you. Your enquiry is received.
        </h3>
        <p className="mt-2 text-gray-700">
          We will contact you by email to discuss the next steps. No booking or
          payment has been made.
        </p>
      </div>
    );
  return (
    <form onSubmit={submit} className="space-y-5">
      <fieldset disabled={busy} className="space-y-5 disabled:opacity-70">
        {types.length > 1 && (
          <label className="block text-sm font-medium">
            I am interested in
            <select
              className={input}
              value={type}
              onChange={(e) => setType(e.target.value as EnquiryType)}
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {enquiryLabels[t]}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="block text-sm font-medium">
          Topic
          <select
            key={type}
            name="topic"
            required
            defaultValue={
              initialTopic &&
              (enquiryTopics[type] as readonly string[]).includes(initialTopic)
                ? initialTopic
                : enquiryTopics[type][0]
            }
            className={input}
          >
            {enquiryTopics[type].map((topic) => (
              <option key={topic}>{topic}</option>
            ))}
          </select>
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Full name
            <input
              name="name"
              autoComplete="name"
              minLength={2}
              maxLength={100}
              required
              className={input}
            />
          </label>
          <label className="block text-sm font-medium">
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              className={input}
            />
          </label>
        </div>
        <label className="block text-sm font-medium">
          Company {type === "individual" ? "(optional)" : ""}
          <input
            name="company"
            autoComplete="organization"
            maxLength={150}
            required={type !== "individual"}
            className={input}
          />
        </label>
        <label className="block text-sm font-medium">
          What would you like to achieve? (optional)
          <textarea
            name="message"
            maxLength={3000}
            rows={4}
            className={input}
          />
        </label>
        <div hidden aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <label className="flex items-start gap-3 text-sm text-gray-600">
          <input
            type="checkbox"
            name="consent"
            required
            className="mt-1 h-4 w-4 shrink-0"
          />
          <span>
            I agree to be contacted about this enquiry and have read the{" "}
            <Link
              href="/enquiry-privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Enquiry Privacy Notice
            </Link>
            .
          </span>
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-finance px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {busy
            ? "Submitting..."
            : type === "individual"
              ? "Register Interest"
              : type === "corporate"
                ? "Request Corporate Training"
                : "Discuss Your Requirement"}
        </button>
      </fieldset>
    </form>
  );
}
