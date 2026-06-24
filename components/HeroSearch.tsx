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
    <div className="mx-auto max-w-3xl">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center"
      >
        <input
          type="text"
          placeholder="Job title or keyword..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1 rounded-md border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-finance focus:ring-1 focus:ring-finance"
        />
        <input
          type="text"
          placeholder="City (e.g. Dubai)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-finance focus:ring-1 focus:ring-finance sm:w-32"
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-finance focus:ring-1 focus:ring-finance sm:w-32"
        >
          <option className="bg-white text-gray-900" value="">All Countries</option>
          {GULF_COUNTRIES.map((c) => (
            <option className="bg-white text-gray-900" key={c.value || "all"} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-finance focus:ring-1 focus:ring-finance sm:w-32"
        >
          <option className="bg-white text-gray-900" value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option className="bg-white text-gray-900" key={c.value || "all"} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-finance px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
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
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-slate-300 transition hover:bg-white/20 hover:text-white"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
