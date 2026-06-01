# Supabase setup

## Apply migrations

### Option A — Supabase Dashboard

1. Open your project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** → **New query**.
3. Paste the contents of `migrations/20240526000001_create_tables.sql`.
4. Run the query.

### Option B — Supabase CLI

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

## Tables created (Step 1)

| Table        | Purpose                                      |
|-------------|----------------------------------------------|
| `jobs`      | Scraped job listings with dedup fingerprint  |
| `sources`   | Apify/scraper source configuration           |
| `keywords`  | Finance/AI keyword → subcategory mapping     |
| `subscribers` | Job alert subscribers + resume data        |
| `alerts_log`  | Sent alert tracking (email/WhatsApp)     |
| `job_matches` | Subscriber ↔ job match records           |

## Step 2 — Keywords seed

Run `migrations/20240526000002_seed_keywords.sql` in the SQL Editor (after Step 1).

| Category | Count |
|----------|-------|
| Finance  | 48    |
| AI       | 23    |
| **Total**| **71**|

All keywords use `match_field = 'Both'` so ingest can scan title first, then description.

## Step 3 — Ingest API

`POST /api/ingest-jobs` accepts a single job object, a JSON array of jobs, or `{ "jobs": [...] }`.

Copy `.env.local.example` to `.env.local` and set Supabase keys.

Example test payload:

```json
[
  {
    "title": "Financial Controller",
    "company": "Acme Corp",
    "platform": "LinkedIn",
    "country": "Saudi Arabia",
    "city": "Riyadh",
    "work_type": "hybrid",
    "seniority": "senior",
    "date_posted": "2026-05-24",
    "apply_url": "https://example.com/apply",
    "description_snippet": "Lead finance team and month-end close."
  }
]
```

## Step 4 — Jobs API

`GET /api/jobs` — active jobs only (`is_active = true`).

| Query param | Values |
|-------------|--------|
| `category` | Finance, AI |
| `subcategory` | e.g. FP&A, Engineering |
| `country` | KSA, UAE, Qatar, Kuwait, Bahrain, Oman |
| `city` | partial match (ilike) |
| `work_type` | Remote, Hybrid, On-site |
| `seniority` | Junior, Mid, Senior, Director, C-Suite |
| `platform` | partial match (ilike) |
| `date_range` | today, 7days, 30days |
| `page` | default 1 |
| `limit` | default 20, max 100 |
| `sort` | freshness (default), date_posted, seniority |

Example: `/api/jobs?category=Finance&country=KSA&date_range=7days&page=1&limit=20`

## Storage bucket (Step 8)

Create a public or private bucket named `resumes` in **Storage** for resume PDF uploads.

For Step 8 endpoints, also set `ANTHROPIC_API_KEY` in `.env.local`.
