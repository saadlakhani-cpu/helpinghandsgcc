# Helping Hands GCC - Post-Claude Code Changes

Date: 2026-06-24  
Repo: `C:\Users\Paul\Documents\Codex\2026-06-21\pat\work\helpinghandsgcc-push-20260622b`  
Remote: `https://github.com/saadlakhani-cpu/helpinghandsgcc.git`

## Purpose

This note documents the changes made after the Claude Code UI inspection and follow-up production testing. It is intended as a handoff for any further Claude Code/Cursor work so the next pass does not undo or duplicate the fixes.

## Recent Commits

These are the latest relevant commits currently present in this repo:

- `529b70f fix: avoid misclassifying uncategorized jobs as finance`
- `c328df2 fix: refresh homepage job counts`
- `4fbd1cb fix: keep admin JSearch batches recent`
- `ae5e411 feat: add Google Analytics tracking`
- `f9d2035 feat: UI improvements — cards, hero, filters, footer, alert CTA`
- `06eaeef feat: add weekly AI JSearch layer`
- `89a6fa0 feat: add safe JSearch admin batches`
- `83aefe0 fix: improve home latest job sorting`

## Changes Made

### 1. Homepage job counts now refresh correctly

Problem:

- The jobs page showed updated jobs, but the homepage Finance/AI count stayed stale.

Files changed:

- `app/page.tsx`
- `lib/jobs/home-data.ts`

Fix:

- Added `export const revalidate = 0` to the homepage.
- Added `noStore()` inside `getHomePageData()`.
- This forces homepage counts and latest job cards to read live Supabase data instead of cached data.

Validation:

- `npm.cmd run lint` passed.
- `npm.cmd run build` passed.

### 2. Admin JSearch buttons now fetch recent jobs only

Problem:

- Admin batch buttons were using `date_posted=all`.
- This imported older jobs, so some external job links showed postings from weeks ago.

File changed:

- `app/api/admin/actions/route.ts`

Fix:

- Finance Batch 1-4 now use `date_posted=week`.
- AI Jobs Batch already used `date_posted=week`.
- Wider GCC Batch now uses `date_posted=week`.

Current admin batch paths:

```txt
/api/cron/fetch-jobs/layer1?date_posted=week&offset=0&limit=5&pages=1
/api/cron/fetch-jobs/layer1?date_posted=week&offset=5&limit=5&pages=1
/api/cron/fetch-jobs/layer1?date_posted=week&offset=10&limit=5&pages=1
/api/cron/fetch-jobs/layer1?date_posted=week&offset=15&limit=5&pages=1
/api/cron/fetch-jobs/ai?date_posted=week&offset=0&limit=6&pages=1
/api/cron/fetch-jobs/layer3?date_posted=week&offset=0&limit=4&pages=1
```

Validation:

- `npm.cmd run lint` passed.
- `npm.cmd run build` passed.

### 3. JSearch categorization no longer defaults unknown jobs to Finance

Problem:

- Some non-finance jobs were tagged as Finance.
- Example reported by user:
  `Arabic Prompt Architect for Travel AI`
- Root cause: `categorizeJob()` returned `Finance / General` when no keyword matched.

Files changed:

- `lib/ingest/categorize.ts`
- `app/api/cron/fetch-jobs/route.ts`
- `app/api/ingest-jobs/route.ts`

Fix:

- Added built-in classification rules for Finance and AI terms.
- AI title/description terms such as `prompt`, `LLM`, `Generative AI`, `Machine Learning`, `Data Scientist`, etc. now classify as AI.
- Finance title/description terms such as `Accountant`, `FP&A`, `Treasury`, `Audit`, `Tax`, `Controller`, etc. classify as Finance.
- If no Finance or AI rule/keyword matches, `categorizeJob()` now returns `null`.
- Both import routes now skip uncategorized jobs instead of inserting them as Finance.

Important behavior change:

- `categorizeJob()` now returns `CategoryResult | null`.
- Any future caller must handle `null` by skipping, reviewing, or routing the job somewhere else.

Validation:

- `npm.cmd run lint` passed.
- `npm.cmd run build` passed.

## Database Cleanup Needed

The code fix prevents future bad imports, but already-imported jobs may still need cleanup in Supabase.

### Specific reported job

Run this in Supabase SQL Editor to move the reported Prompt Architect role from Finance to AI:

```sql
update jobs
set category = 'AI',
    subcategory = 'General'
where apply_url = 'https://www.jobleads.com/sa/job/arabic-prompt-architect-for-travel-ai-saudi-arabia--riyadh--e43eca3020a04b61670cfebc7657f8582';
```

### Find other suspicious Finance jobs that may be AI

Run this to review Finance jobs with AI-like terms:

```sql
select id, title, company, category, subcategory, date_posted, apply_url
from jobs
where is_active = true
  and category = 'Finance'
  and (
    title ilike '%prompt%'
    or title ilike '%llm%'
    or title ilike '%ai %'
    or title ilike '%artificial intelligence%'
    or title ilike '%machine learning%'
    or title ilike '%data scientist%'
    or title ilike '%data engineer%'
    or title ilike '%data analyst%'
    or title ilike '%generative ai%'
  )
order by date_scraped desc;
```

### Batch move obvious AI jobs out of Finance

Only run this after reviewing the select above:

```sql
update jobs
set category = 'AI',
    subcategory = case
      when title ilike '%data scientist%' or title ilike '%data engineer%' or title ilike '%data analyst%' then 'Data'
      when title ilike '%machine learning%' or title ilike '%ml engineer%' then 'Engineering'
      else 'General'
    end
where is_active = true
  and category = 'Finance'
  and (
    title ilike '%prompt%'
    or title ilike '%llm%'
    or title ilike '%artificial intelligence%'
    or title ilike '%machine learning%'
    or title ilike '%data scientist%'
    or title ilike '%data engineer%'
    or title ilike '%data analyst%'
    or title ilike '%generative ai%'
  );
```

### Find likely non-Finance/non-AI jobs

Run this to review jobs in Finance that may be unrelated:

```sql
select id, title, company, category, subcategory, date_posted, apply_url
from jobs
where is_active = true
  and category = 'Finance'
  and not (
    title ilike '%account%'
    or title ilike '%finance%'
    or title ilike '%financial%'
    or title ilike '%audit%'
    or title ilike '%tax%'
    or title ilike '%vat%'
    or title ilike '%zakat%'
    or title ilike '%treasury%'
    or title ilike '%controller%'
    or title ilike '%cfo%'
    or title ilike '%fp&a%'
    or title ilike '%budget%'
    or title ilike '%forecast%'
    or title ilike '%compliance%'
    or title ilike '%risk%'
    or title ilike '%grc%'
  )
order by date_scraped desc
limit 100;
```

For clearly unrelated roles, deactivate them:

```sql
update jobs
set is_active = false
where id in (
  -- paste reviewed job IDs here
);
```

## Deployment Notes

Use the Codex repo as the source of truth:

```powershell
cd "C:\Users\Paul\Documents\Codex\2026-06-21\pat\work\helpinghandsgcc-push-20260622b"
git status
git push origin main
```

Do not push from:

```txt
C:\Users\Paul\Claude\Finance Jobs Portal
```

That folder previously had unrelated WIP changes and caused confusion.

## Verification Checklist

After deployment:

1. Open the homepage and confirm Finance/AI counts changed after Supabase cleanup.
2. Open `/jobs?category=Finance` and look for obvious AI/non-finance titles.
3. Open `/jobs?category=AI` and confirm AI jobs appear there.
4. Use Admin JSearch buttons and confirm result debug shows `date_posted: week`.
5. Click a few external job links and confirm they are recent enough for launch.

## Recommended Next Improvement

Add an Admin "Quality Review" page later with:

- suspicious Finance jobs containing AI terms
- suspicious Finance jobs with no finance terms
- jobs older than 14 days
- one-click deactivate
- one-click move Finance to AI

For now, the SQL review queries above are enough for launch cleanup.
