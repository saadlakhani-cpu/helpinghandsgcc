"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { CATEGORIES, GULF_COUNTRIES } from "@/lib/constants";

const POPULAR_SEARCHES = [
  { label: "CFO", q: "CFO" },
  { label: "FP&A Manager", q: "FP&A Manager" },
  { label: "Financial Controller", q: "Financial Controller" },
  { label: "Treasury", q: "Treasury" },
  { label: "AI Analyst", q: "AI Analyst" },
  { label: "Audit", q: "Audit" },
];

export function HeroSearch() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");

  function buildParams(overrides: Record<string, string> = {}) {
    const params = new URLSearchParams();
    const q = overrides.q ?? keyword.trim();
    const c = overrides.country ?? country;
    const ci = overrides.city ?? city.trim();
    const cat = overrides.category ?? category;
    if (q) params.set("q", q);
    if (c) params.set("country", c);
    if (ci) params.set("city", ci);
    if (cat) params.set("category", cat);
    return params;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const params = buildParams();
    router.push(params.toString() ? `/jobs?${params}` : "/jobs");
  }

  function handlePopular(q: string) {
    const params = buildParams({ q });
    router.push(`/jobs?${params}`);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <form
        onSubmit={handleSubmit}
        className="grid gap-3 bg-white sm:grid-cols-2 lg:grid-cols-[minmax(180px,2fr)_minmax(100px,1fr)_minmax(120px,1fr)_minmax(120px,1fr)_auto]"
      >
        <input
          type="text"
          placeholder="Job title or keyword..."
          aria-label="Job title or keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="min-w-0 rounded-md border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-finance focus:ring-1 focus:ring-finance"
        />
        <input
          type="text"
          placeholder="City (e.g. Dubai)"
          aria-label="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="min-w-0 rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-finance focus:ring-1 focus:ring-finance"
        />
        <select
          aria-label="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="min-w-0 rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-finance focus:ring-1 focus:ring-finance"
        >
          {GULF_COUNTRIES.map((c) => (
            <option
              className="bg-white text-gray-900"
              key={c.value || "all"}
              value={c.value}
            >
              {c.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="min-w-0 rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-finance focus:ring-1 focus:ring-finance"
        >
          {CATEGORIES.map((c) => (
            <option
              className="bg-white text-gray-900"
              key={c.value || "all"}
              value={c.value}
            >
              {c.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-finance px-6 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800"
        >
          Search
        </button>
      </form>

      {/* Popular searches */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs text-slate-400">Popular:</span>
        {POPULAR_SEARCHES.map(({ label, q }) => (
          <button
            key={q}
            type="button"
            onClick={() => handlePopular(q)}
            className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 transition hover:border-emerald-300 hover:text-finance"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
