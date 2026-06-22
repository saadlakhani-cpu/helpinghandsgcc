"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { GULF_COUNTRIES } from "@/lib/constants";
import type { FilterOptions } from "@/lib/jobs/types";
import {
  buildJobsSearchParams,
  type JobsFilterState,
} from "@/lib/jobs/search-params";

const WORK_TYPES = ["Remote", "Hybrid", "On-site"] as const;
const SENIORITIES = ["Junior", "Mid", "Senior", "Director", "C-Suite"] as const;
const EXPERIENCE_OPTIONS = [
  { value: "0-2", label: "0-2 years" },
  { value: "2-5", label: "2-5 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "10+", label: "10+ years" },
] as const;
const DATE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "7days", label: "Last 7 days" },
  { value: "30days", label: "Last 30 days" },
] as const;

type JobsFiltersProps = {
  initialFilters: JobsFilterState;
  filterOptions: FilterOptions;
};

export function JobsFilters({
  initialFilters,
  filterOptions,
}: JobsFiltersProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<JobsFilterState>(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const subcategories = useMemo(() => {
    if (filters.category === "Finance") {
      return filterOptions.financeSubcategories;
    }
    if (filters.category === "AI") {
      return filterOptions.aiSubcategories;
    }
    return Array.from(
      new Set([
        ...filterOptions.financeSubcategories,
        ...filterOptions.aiSubcategories,
      ])
    ).sort();
  }, [filters.category, filterOptions]);

  function applyFilters(next: JobsFilterState) {
    const params = buildJobsSearchParams({ ...next, page: "1" });
    router.push(params.toString() ? `/jobs?${params}` : "/jobs");
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    applyFilters(filters);
  }

  function update<K extends keyof JobsFilterState>(
    key: K,
    value: JobsFilterState[K]
  ) {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "category" && value !== prev.category) {
        next.subcategory = "";
      }
      return next;
    });
  }

  function clearFilters() {
    const cleared: JobsFilterState = {
      category: "",
      subcategory: "",
      country: "",
      city: "",
      work_type: "",
      seniority: "",
      experience: "",
      date_range: "",
      platform: "",
      company: "",
      q: "",
      sort: filters.sort,
      page: "1",
    };
    setFilters(cleared);
    router.push("/jobs");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Keyword
        </label>
        <input
          type="text"
          value={filters.q}
          onChange={(e) => update("q", e.target.value)}
          placeholder="Title or keyword..."
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-finance focus:ring-1 focus:ring-finance"
        />
      </div>

      <FilterGroup label="Category">
        <FilterRadio
          name="category"
          value=""
          label="All"
          checked={filters.category === ""}
          onChange={() => update("category", "")}
        />
        <FilterRadio
          name="category"
          value="Finance"
          label="Finance"
          checked={filters.category === "Finance"}
          onChange={() => update("category", "Finance")}
        />
        <FilterRadio
          name="category"
          value="AI"
          label="AI"
          checked={filters.category === "AI"}
          onChange={() => update("category", "AI")}
        />
      </FilterGroup>

      <FilterGroup label="Subcategory">
        <select
          value={filters.subcategory}
          onChange={(e) => update("subcategory", e.target.value)}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-finance focus:ring-1 focus:ring-finance"
        >
          <option value="">All subcategories</option>
          {subcategories.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup label="Country">
        {GULF_COUNTRIES.filter((c) => c.value).map((country) => (
          <FilterRadio
            key={country.value}
            name="country"
            value={country.value}
            label={country.label}
            checked={filters.country === country.value}
            onChange={() => update("country", country.value)}
          />
        ))}
        <FilterRadio
          name="country"
          value=""
          label="All countries"
          checked={filters.country === ""}
          onChange={() => update("country", "")}
        />
      </FilterGroup>

      <FilterGroup label="City">
        <input
          type="text"
          value={filters.city}
          onChange={(e) => update("city", e.target.value)}
          placeholder="e.g. Dubai"
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-finance focus:ring-1 focus:ring-finance"
        />
      </FilterGroup>

      <FilterGroup label="Work Type">
        {WORK_TYPES.map((type) => (
          <FilterRadio
            key={type}
            name="work_type"
            value={type}
            label={type}
            checked={filters.work_type === type}
            onChange={() => update("work_type", type)}
          />
        ))}
        <FilterRadio
          name="work_type"
          value=""
          label="Any"
          checked={filters.work_type === ""}
          onChange={() => update("work_type", "")}
        />
      </FilterGroup>

      <FilterGroup label="Seniority">
        {SENIORITIES.map((level) => (
          <FilterRadio
            key={level}
            name="seniority"
            value={level}
            label={level}
            checked={filters.seniority === level}
            onChange={() => update("seniority", level)}
          />
        ))}
        <FilterRadio
          name="seniority"
          value=""
          label="Any"
          checked={filters.seniority === ""}
          onChange={() => update("seniority", "")}
        />
      </FilterGroup>

      <FilterGroup label="Experience">
        {EXPERIENCE_OPTIONS.map((opt) => (
          <FilterRadio
            key={opt.value}
            name="experience"
            value={opt.value}
            label={opt.label}
            checked={filters.experience === opt.value}
            onChange={() => update("experience", opt.value)}
          />
        ))}
        <FilterRadio
          name="experience"
          value=""
          label="Any"
          checked={filters.experience === ""}
          onChange={() => update("experience", "")}
        />
      </FilterGroup>

      <FilterGroup label="Date Posted">
        {DATE_OPTIONS.map((opt) => (
          <FilterRadio
            key={opt.value}
            name="date_range"
            value={opt.value}
            label={opt.label}
            checked={filters.date_range === opt.value}
            onChange={() => update("date_range", opt.value)}
          />
        ))}
        <FilterRadio
          name="date_range"
          value=""
          label="Any time"
          checked={filters.date_range === ""}
          onChange={() => update("date_range", "")}
        />
      </FilterGroup>

      <FilterGroup label="Platform">
        <select
          value={filters.platform}
          onChange={(e) => update("platform", e.target.value)}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-finance focus:ring-1 focus:ring-finance"
        >
          <option value="">All platforms</option>
          {filterOptions.platforms.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup label="Company">
        <select
          value={filters.company}
          onChange={(e) => update("company", e.target.value)}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-finance focus:ring-1 focus:ring-finance"
        >
          <option value="">All companies</option>
          {filterOptions.companies.map((company) => (
            <option key={company} value={company}>
              {company}
            </option>
          ))}
        </select>
      </FilterGroup>

      <div className="flex flex-col gap-2 pt-2">
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Apply Filters
        </button>
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
        >
          Clear all
        </button>
      </div>
    </form>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function FilterRadio({
  name,
  value,
  label,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="text-finance focus:ring-finance"
      />
      {label}
    </label>
  );
}
