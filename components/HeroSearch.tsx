"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { CATEGORIES, GULF_COUNTRIES } from "@/lib/constants";

export function HeroSearch() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("");
  const [category, setCategory] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (country) params.set("country", country);
    if (category) params.set("category", category);
    const query = params.toString();
    router.push(query ? `/jobs?${query}` : "/jobs");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex max-w-3xl flex-col gap-3 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center"
    >
      <input
        type="text"
        placeholder="Job title or keyword..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="flex-1 rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-finance focus:ring-1 focus:ring-finance"
      />
      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-finance focus:ring-1 focus:ring-finance sm:w-40"
      >
        {GULF_COUNTRIES.map((c) => (
          <option key={c.value || "all"} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-finance focus:ring-1 focus:ring-finance sm:w-40"
      >
        {CATEGORIES.map((c) => (
          <option key={c.value || "all"} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Search
      </button>
    </form>
  );
}
