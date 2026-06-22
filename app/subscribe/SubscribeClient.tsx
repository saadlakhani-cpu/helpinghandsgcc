"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { createBrowserClient } from "@/lib/supabase/client";

// ── Types ─────────────────────────────────────────────────────────────────────

type ParsedResume = {
  name?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  current_role?: string | null;
  experience_years?: number | null;
  certifications?: string[] | null;
  skills?: string[] | null;
  preferred_country?: string | null;
};

type Category = "Finance" | "AI" | "Both";

type FormState = {
  name: string;
  email: string;
  whatsapp: string;
  current_role: string;
  experience_years: string;
  certifications: string;
  preferred_country: string;
  preferred_category: Category | "";
  preferred_subcategory: string;
  salary_expectation: string;
};

type Step = "choose" | "review" | "success";

type SubscribeClientProps = {
  mode?: "subscribe" | "profile";
};

// ── Static data ───────────────────────────────────────────────────────────────

const GCC_COUNTRIES = ["UAE", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman"];
const OTHER_COUNTRIES = ["Egypt", "Jordan", "Lebanon", "Pakistan", "India", "UK", "USA", "Other"];

const FINANCE_SUBS = [
  "Investment Banking",
  "Private Equity",
  "Asset Management",
  "Accounting & Audit",
  "Corporate Finance",
  "Risk & Compliance",
  "Insurance",
  "General Finance",
];

const AI_SUBS = [
  "Machine Learning",
  "Data Science",
  "AI Engineering",
  "NLP / LLMs",
  "Computer Vision",
  "General AI",
];

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  whatsapp: "",
  current_role: "",
  experience_years: "",
  certifications: "",
  preferred_country: "",
  preferred_category: "",
  preferred_subcategory: "",
  salary_expectation: "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function parsedToForm(parsed: ParsedResume): Partial<FormState> {
  return {
    name: parsed.name ?? "",
    email: parsed.email ?? "",
    whatsapp: parsed.whatsapp ?? "",
    current_role: parsed.current_role ?? "",
    experience_years:
      parsed.experience_years != null ? String(parsed.experience_years) : "",
    certifications: Array.isArray(parsed.certifications)
      ? parsed.certifications.join(", ")
      : "",
    preferred_country: parsed.preferred_country ?? "",
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "choose", label: "Method" },
    { key: "review", label: "Your Details" },
    { key: "success", label: "Done" },
  ];
  const current = steps.findIndex((s) => s.key === step);
  return (
    <ol className="flex items-center gap-0">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s.key} className="flex items-center">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                done
                  ? "bg-finance text-white"
                  : active
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {done ? "✓" : i + 1}
            </span>
            <span
              className={`ml-2 text-sm font-medium ${
                active ? "text-primary" : "text-gray-400"
              }`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <span className="mx-3 h-px w-8 bg-gray-200" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
      {children}
    </label>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      id={id}
      type={type}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function SubscribeClient({ mode = "subscribe" }: SubscribeClientProps) {
  const [step, setStep] = useState<Step>(
    mode === "profile" ? "review" : "choose"
  );
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeParsed, setResumeParsed] = useState<ParsedResume | null>(null);
  const [matchedCount, setMatchedCount] = useState<number | null>(null);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user?.email) return;
      setSignedInEmail(user.email);

      const displayName =
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : typeof user.user_metadata?.name === "string"
            ? user.user_metadata.name
            : "";

      setForm((prev) => ({
        ...prev,
        email: prev.email || user.email || "",
        name: prev.name || displayName,
      }));

      if (mode === "profile") {
        setStep("review");
      }
    });
  }, [mode]);

  async function handleGoogleSignIn() {
    setError(null);
    try {
      const supabase = createBrowserClient();
      const origin = window.location.origin;
      const returnPath = window.location.pathname || "/subscribe";
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${origin}${returnPath}` },
      });
      if (signInError) throw signInError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    }
  }

  async function handleSignOut() {
    setError(null);
    try {
      const supabase = createBrowserClient();
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      setSignedInEmail(null);
      setForm(EMPTY_FORM);
      setResumeUrl(null);
      setResumeParsed(null);
      setMatchedCount(null);
      setStep(mode === "profile" ? "review" : "choose");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign out failed");
    }
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/parse-resume", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Parse failed");
      setResumeUrl(json.resume_url ?? null);
      setResumeParsed(json.parsed ?? null);
      setForm({ ...EMPTY_FORM, ...parsedToForm(json.parsed ?? {}) });
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        whatsapp: form.whatsapp.trim() || null,
        current_role: form.current_role.trim() || null,
        experience_years: form.experience_years
          ? Number(form.experience_years)
          : null,
        certifications: form.certifications.trim() || null,
        preferred_country: form.preferred_country || null,
        preferred_category: (form.preferred_category as Category) || null,
        preferred_subcategory: form.preferred_subcategory || null,
        salary_expectation: form.salary_expectation.trim() || null,
        resume_url: resumeUrl,
        resume_parsed: resumeParsed,
      };
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Submission failed");
      setMatchedCount(json.matched_count ?? 0);
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  const subcategoryOptions =
    form.preferred_category === "Finance"
      ? FINANCE_SUBS
      : form.preferred_category === "AI"
        ? AI_SUBS
        : form.preferred_category === "Both"
          ? [...FINANCE_SUBS, ...AI_SUBS]
          : [];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-surface px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-xl">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-primary sm:text-3xl">
              {mode === "profile" ? "Update Your Profile" : "Get Job Alerts"}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {mode === "profile"
                ? "Keep your details current so we can match you with better Gulf Finance & AI roles."
                : "Subscribe once — receive matched Gulf Finance & AI roles by email."}
            </p>
          </div>

          {signedInEmail && (
            <div className="mb-5 flex flex-col gap-3 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Signed in with Google as <strong>{signedInEmail}</strong>
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="self-start text-xs font-semibold text-green-900 underline sm:self-auto"
              >
                Sign out
              </button>
            </div>
          )}

          <div className="mb-8 flex justify-center">
            <StepIndicator step={step} />
          </div>

          {/* ── Step: choose ──────────────────────────────────────────────── */}
          {step === "choose" && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-center text-base font-semibold text-gray-800">
                How would you like to set up your profile?
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {!signedInEmail && (
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="group flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-primary hover:bg-slate-50 sm:col-span-2"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl font-bold group-hover:bg-slate-200">
                      G
                    </span>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Continue with Google
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Sign in before creating or updating your profile
                      </p>
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="group flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-finance hover:bg-blue-50 disabled:opacity-60"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl group-hover:bg-blue-200">
                    📄
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800">Upload Resume</p>
                    <p className="mt-1 text-xs text-gray-500">
                      PDF only — we&apos;ll auto-fill your details
                    </p>
                  </div>
                  {uploading && (
                    <span className="text-xs text-finance">Parsing…</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({
                      ...EMPTY_FORM,
                      name: prev.name,
                      email: prev.email,
                    }));
                    setStep("review");
                  }}
                  className="group flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-ai hover:bg-purple-50"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-2xl group-hover:bg-purple-200">
                    ✏️
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800">Fill Manually</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Enter your details directly
                    </p>
                  </div>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={onFileInput}
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`mt-5 rounded-lg border-2 border-dashed px-4 py-6 text-center text-sm transition ${
                  dragOver
                    ? "border-finance bg-blue-50 text-finance"
                    : "border-gray-200 text-gray-400"
                }`}
              >
                {uploading
                  ? "Parsing your resume…"
                  : "Or drag & drop your PDF anywhere here"}
              </div>

              {error && (
                <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>
          )}

          {/* ── Step: review ──────────────────────────────────────────────── */}
          {step === "review" && (
            <form
              onSubmit={handleSubmit}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              {resumeParsed && (
                <div className="mb-5 flex items-start gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                  <span>✓</span>
                  <span>
                    Resume parsed — please review and complete your details
                    below.
                  </span>
                </div>
              )}

              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel htmlFor="name">Full Name *</FieldLabel>
                    <TextInput
                      id="name"
                      required
                      value={form.name}
                      onChange={(v) => setField("name", v)}
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="email">Email *</FieldLabel>
                    <TextInput
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(v) => setField("email", v)}
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel htmlFor="whatsapp">
                    WhatsApp (optional)
                  </FieldLabel>
                  <TextInput
                    id="whatsapp"
                    value={form.whatsapp}
                    onChange={(v) => setField("whatsapp", v)}
                    placeholder="+971 50 123 4567"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel htmlFor="current_role">Current Role</FieldLabel>
                    <TextInput
                      id="current_role"
                      value={form.current_role}
                      onChange={(v) => setField("current_role", v)}
                      placeholder="Senior Finance Manager"
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="experience_years">
                      Years of Experience
                    </FieldLabel>
                    <TextInput
                      id="experience_years"
                      type="number"
                      value={form.experience_years}
                      onChange={(v) => setField("experience_years", v)}
                      placeholder="8"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel htmlFor="certifications">
                    Certifications
                  </FieldLabel>
                  <TextInput
                    id="certifications"
                    value={form.certifications}
                    onChange={(v) => setField("certifications", v)}
                    placeholder="CFA, ACCA, CPA…"
                  />
                  <p className="mt-1 text-xs text-gray-400">Comma-separated</p>
                </div>

                <div>
                  <FieldLabel htmlFor="preferred_country">
                    Preferred Country
                  </FieldLabel>
                  <select
                    id="preferred_country"
                    value={form.preferred_country}
                    onChange={(e) =>
                      setField("preferred_country", e.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Any country</option>
                    <optgroup label="GCC">
                      {GCC_COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Other">
                      {OTHER_COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <p className="mb-2 block text-sm font-medium text-gray-700">
                    Job Category *
                  </p>
                  <div className="flex gap-3">
                    {(["Finance", "AI", "Both"] as Category[]).map((cat) => (
                      <label
                        key={cat}
                        className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg border-2 py-2.5 text-sm font-medium transition ${
                          form.preferred_category === cat
                            ? cat === "Finance"
                              ? "border-finance bg-blue-50 text-finance"
                              : cat === "AI"
                                ? "border-ai bg-purple-50 text-ai"
                                : "border-primary bg-slate-50 text-primary"
                            : "border-gray-200 text-gray-500 hover:border-gray-400"
                        }`}
                      >
                        <input
                          type="radio"
                          name="preferred_category"
                          value={cat}
                          checked={form.preferred_category === cat}
                          onChange={() => {
                            setField("preferred_category", cat);
                            setField("preferred_subcategory", "");
                          }}
                          className="sr-only"
                        />
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>

                {subcategoryOptions.length > 0 && (
                  <div>
                    <FieldLabel htmlFor="preferred_subcategory">
                      Specialisation (optional)
                    </FieldLabel>
                    <select
                      id="preferred_subcategory"
                      value={form.preferred_subcategory}
                      onChange={(e) =>
                        setField("preferred_subcategory", e.target.value)
                      }
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Any specialisation</option>
                      {subcategoryOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <FieldLabel htmlFor="salary_expectation">
                    Salary Expectation (optional)
                  </FieldLabel>
                  <TextInput
                    id="salary_expectation"
                    value={form.salary_expectation}
                    onChange={(v) => setField("salary_expectation", v)}
                    placeholder="AED 30,000/month or $150k/yr"
                  />
                </div>
              </div>

              {error && (
                <p className="mt-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep(mode === "profile" ? "review" : "choose");
                    setError(null);
                  }}
                  className="text-sm text-gray-500 hover:text-primary"
                >
                  {mode === "profile" ? "Clear error" : "← Back"}
                </button>
                <button
                  type="submit"
                  disabled={
                    submitting || !form.name.trim() || !form.email.trim()
                  }
                  className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? "Saving…" : "Subscribe →"}
                </button>
              </div>
            </form>
          )}

          {/* ── Step: success ──────────────────────────────────────────────── */}
          {step === "success" && (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl">
                ✓
              </div>
              <h2 className="text-xl font-bold text-primary">
                You&apos;re subscribed!
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                We&apos;ll email <strong>{form.email}</strong> when matched Gulf
                Finance &amp; AI roles are posted.
              </p>
              {matchedCount !== null && matchedCount > 0 && (
                <p className="mt-3 rounded-md bg-blue-50 px-4 py-2 text-sm text-finance">
                  {matchedCount} existing{" "}
                  {matchedCount === 1 ? "role" : "roles"} already matched your
                  profile — you&apos;ll receive these in your first alert.
                </p>
              )}
              {resumeUrl && (
                <p className="mt-3 text-xs text-gray-400">
                  Resume stored:{" "}
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-finance underline"
                  >
                    view PDF
                  </a>
                </p>
              )}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/jobs"
                  className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Browse Jobs →
                </Link>
                <button
                  onClick={() => {
                    setStep("choose");
                    setForm(EMPTY_FORM);
                    setResumeUrl(null);
                    setResumeParsed(null);
                    setMatchedCount(null);
                    setError(null);
                  }}
                  className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Update My Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
