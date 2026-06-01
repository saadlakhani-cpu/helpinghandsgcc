"use client";

import { FormEvent, useState } from "react";

export function ResumeWaitlistForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="text-sm text-gray-600">
        Thanks — you&apos;re on the waitlist. We&apos;ll notify you at{" "}
        <span className="font-medium text-primary">{email}</span>.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="flex-1 rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-finance focus:ring-1 focus:ring-finance"
      />
      <button
        type="submit"
        className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Join Waitlist
      </button>
    </form>
  );
}
