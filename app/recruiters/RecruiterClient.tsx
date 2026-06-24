"use client";

import { FormEvent, useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

const COUNTRIES = ["KSA", "UAE", "Qatar", "Kuwait", "Bahrain", "Oman"];
const PROFILE_COUNTRIES = [...COUNTRIES, "Multiple GCC countries"];
const CATEGORIES = ["Finance", "AI"];
const WORK_TYPES = ["Remote", "Hybrid", "On-site"];
const SENIORITIES = ["Junior", "Mid", "Senior", "Director", "C-Suite"];

type SubmitState = "idle" | "submitting" | "success" | "error";

export function RecruiterClient() {
  const [email, setEmail] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [hiringCategories, setHiringCategories] = useState<string[]>(["Finance"]);
  const [screeningRequested, setScreeningRequested] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn() {
    const supabase = createBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/recruiters` },
    });
  }

  function toggleCategory(category: string) {
    setHiringCategories((current) => {
      if (current.includes(category)) {
        const next = current.filter((item) => item !== category);
        return next.length ? next : current;
      }
      return [...current, category];
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("submitting");
    setMessage("");

    const supabase = createBrowserClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      setSubmitState("error");
      setMessage("Please sign in with Google before submitting.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const payload = {
      company_name: String(form.get("company_name") ?? ""),
      contact_name: String(form.get("contact_name") ?? ""),
      work_email: String(form.get("work_email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      company_website: String(form.get("company_website") ?? ""),
      linkedin_url: String(form.get("linkedin_url") ?? ""),
      country: String(form.get("country") ?? ""),
      hiring_categories: hiringCategories,
      title: String(form.get("title") ?? ""),
      category: String(form.get("category") ?? ""),
      city: String(form.get("city") ?? ""),
      job_country: String(form.get("job_country") ?? ""),
      work_type: String(form.get("work_type") ?? ""),
      seniority: String(form.get("seniority") ?? ""),
      job_type: String(form.get("job_type") ?? ""),
      description: String(form.get("description") ?? ""),
      requirements: String(form.get("requirements") ?? ""),
      apply_email: String(form.get("apply_email") ?? ""),
      apply_url: String(form.get("apply_url") ?? ""),
      screening_requested: screeningRequested,
    };

    const response = await fetch("/api/recruiters/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setSubmitState("error");
      setMessage(result.error ?? "Could not submit your job. Please try again.");
      return;
    }

    event.currentTarget.reset();
    setHiringCategories(["Finance"]);
    setScreeningRequested(true);
    setSubmitState("success");
    setMessage(
      "Thanks. Your job has been submitted for review. Most approved roles are published within 10 minutes."
    );
  }

  if (!email) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-primary">Recruiter sign-in</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Sign in with Google to register your company and submit finance or AI
          jobs for review.
        </p>
        <button
          type="button"
          onClick={signIn}
          className="mt-5 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Continue with Google
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-recruiter">
            Signed in as {email}
          </p>
          <h2 className="mt-1 text-xl font-bold text-primary">
            Company details
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Company name" name="company_name" required />
          <Field label="Contact person name" name="contact_name" required />
          <Field label="Work email" name="work_email" type="email" required />
          <Field label="Phone / WhatsApp" name="phone" />
          <Field label="Company website" name="company_website" type="url" />
          <Field label="LinkedIn profile" name="linkedin_url" type="url" />
          <Select label="Recruiter country" name="country" options={PROFILE_COUNTRIES} required />
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-gray-700">
            Hiring categories
          </legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {CATEGORIES.map((category) => (
              <label key={category} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={hiringCategories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="h-4 w-4 rounded border-gray-300 text-recruiter"
                />
                {category}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-recruiter">
            Job post
          </p>
          <h2 className="mt-1 text-xl font-bold text-primary">
            Submit a role for review
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Job title" name="title" required />
          <Select label="Category" name="category" options={CATEGORIES} required />
          <Select label="Country" name="job_country" options={COUNTRIES} required />
          <Field label="City" name="city" required />
          <Select label="Work type" name="work_type" options={WORK_TYPES} required />
          <Select label="Seniority" name="seniority" options={SENIORITIES} required />
          <Field label="Job type" name="job_type" placeholder="Full-time, contract, internship..." />
          <Field label="Apply email" name="apply_email" type="email" />
          <Field label="Apply URL" name="apply_url" type="url" />
        </div>

        <TextArea label="Job description" name="description" required />
        <TextArea label="Requirements" name="requirements" />

        <label className="mt-4 flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={screeningRequested}
            onChange={(event) => setScreeningRequested(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-recruiter"
          />
          <span>
            Request free initial CV screening while the recruiter workflow is
            being launched.
          </span>
        </label>
      </div>

      {message && (
        <p
          className={`rounded-md px-4 py-3 text-sm ${
            submitState === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={submitState === "submitting"}
        className="rounded-md bg-recruiter px-6 py-3 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitState === "submitting" ? "Submitting..." : "Submit job for review"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-recruiter focus:ring-1 focus:ring-recruiter"
      />
    </label>
  );
}

function Select({
  label,
  name,
  options,
  required = false,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <select
        name={name}
        required={required}
        className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-recruiter focus:ring-1 focus:ring-recruiter"
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  label,
  name,
  required = false,
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label className="mt-4 block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <textarea
        name={name}
        required={required}
        rows={5}
        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-recruiter focus:ring-1 focus:ring-recruiter"
      />
    </label>
  );
}
