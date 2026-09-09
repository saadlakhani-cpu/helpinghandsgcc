# Contributor Portal

## Set up a collector

1. Open `/admin/contributors` from Admin > Contributor Management.
2. Expand Contributor Access & Rates. Enter the person's name and email, their agreed rate per approved job, currency, and leave Access enabled checked. Save.
3. Share `/contributors` with them. They create and verify an account through the normal sign-in page using the same email. They set their own password; no shared helper password is needed.
4. To change their rate or disable access, save the same email with the new settings. Rate changes apply at approval time; previously approved earnings keep their original rate.

## Daily contributor workflow

- Paste up to 25 links, one per line, and click Submit Links.
- Each batch shows queued, duplicate or failed results with a reason. Fix invalid links and retry them; invalid links that could not be queued are shown in the batch results, not persisted as job submissions.
- My Submissions refreshes every 10 seconds while visible. Use Refresh for an immediate check.
- Queued links are processed on the scheduled runs. Unsupported, incomplete or inaccessible pages become Needs details.
- Use Complete Details to enter the actual title, company, GCC location, Finance/AI category, original posting date and description from an authorised source.
- Review means awaiting administrator review. Approved means published and eligible for payment. Duplicate and rejected submissions do not earn credit.
- Contributors can only read and edit their own submissions. They cannot approve jobs or mark payments.

## Admin review and payment records

- Filter by contributor or status. Expand Job Details and check the original application link, relevance, location, posting date and whether the role is still open.
- Approve & Publish inserts one live job and records one earning in the same database transaction. Repeated approval cannot create a second earning.
- The approval check catches matching fingerprints, application URLs and same-title/company/location/date vacancies. Near-duplicates with different wording still need human review.
- Return for details or Reject requires a reason, visible to the contributor.
- Record Paid records a payment already made elsewhere. Enter the transfer/reference number. This button does not transfer money.
- Each approved row shows its amount, currency and payment state. The list is paginated at 25 submissions.

## Scheduled extraction

- `/api/cron/contributor-jobs` is configured daily at 06:30 UTC (09:30 Riyadh, approximate on Hobby) in `vercel.json` and uses the existing `CRON_SECRET` bearer header. Vercel rejected the proposed 15-minute schedule under the current plan.
- Each run claims at most 3 jobs: the daily fallback processes only 3 per day. Use the admin Process button for additional batches. A supported frequent scheduler is still needed before onboarding larger volumes.
- The admin Process Next 3 Links button runs the same worker immediately.
- `CONTRIBUTOR_ALLOWED_HOSTS` is an optional comma-separated list of exact source hostnames approved for automated access. It is deliberately empty by default. Do not add sources until permitted access is confirmed. No automatic reading of LinkedIn, Indeed or other restricted sources is enabled by this release.
- With no approved hosts, the worker moves queued links to Needs details. It does not silently scrape unsupported sites or invent job details.
- For enabled hosts, the worker reads a single structured JobPosting, checks Finance/AI relevance, and requires an explicit GCC location and posting date. No new AI API key is used.
- Redirect hosts are revalidated, DNS is pinned to a checked public address, response size is capped and requests are time-limited. Abandoned jobs are recovered using leases. After repeated unfinished attempts they move to Needs details.
- The requested 15-minute processing frequency remains pending. It requires a compatible scheduler or an owner-approved plan change; no paid upgrade was made.

## Deployment and tests

- Migration: `supabase/migrations/20260909000001_contributor_portal.sql`. Run its contents once in Supabase SQL Editor. It creates private tables and service-role-only functions.
- `npm run build` validates compilation, types and lint.
- `node --test tests/contributor-validation.test.cjs tests/recruiter-refresh.test.cjs tests/service-enquiries.test.cjs` runs application tests.
- SQL transaction tests use PGlite in isolation: install `@electric-sql/pglite` in a test runtime and set `SQL_TEST_RUNTIME` to its package path, then run `node --test tests/contributor-sql.test.cjs`.
- Browser fixtures and screenshots are in the parent workspace `outputs` directory. Browser fixture submissions do not write production data.

## Visual assets

The approved redesign uses built-in image generation, not external paid API calls. Assets are illustrative, not evidence of a real training event or customer result.

- `public/images/services/workshop.webp`: a practical GCC office workshop with laptops and a finance display.
- `public/images/services/finance.webp`: a finance professional reviewing charts and a spreadsheet.
- `public/images/services/workflow.webp`: a fictional invoice-to-spreadsheet-to-report example.

Generated PNG originals remain in the Codex generated-images directory. WebP copies preserve the source composition and reduce download size.
