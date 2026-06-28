# Manual Job Link Import SOP

Use this guide when outsourcing manual job collection for Helping Hands GCC.

## Purpose

JSearch does not capture every useful GCC finance or AI role. This manual process is for adding missed high-quality jobs from LinkedIn, Naukri Gulf, Indeed, Bayt, GulfTalent, and similar job boards.

## Who Can Do This

Only someone with access to the limited manual import screen should run the import.

The outsourced person can either:

1. Collect links only and send them to the admin.
2. Collect links and import them directly if they are trusted with limited manual import access.

For safety, start with option 1.

## Limited Access Setup

The helper should not receive Supabase, Vercel, GitHub, or full Admin access.

Create/change the helper credentials in Vercel Environment Variables:

```text
MANUAL_IMPORT_USERNAME=helper-name
MANUAL_IMPORT_PASSWORD=strong-password
MANUAL_IMPORT_SESSION_SECRET=random-long-secret
```

The helper login URL is:

```text
https://www.helpinghandsgcc.com/manual-import/login
```

After login, the helper only sees the manual import screen.

## Daily Target

Recommended starting target:

- 20 to 50 LinkedIn job links per day
- 10 to 30 Naukri Gulf job links per day
- Optional: 10 to 20 links from Indeed, Bayt, or GulfTalent

Quality is more important than volume.

## Job Rules

Only collect jobs that match the portal:

- Finance jobs
- Accounting jobs
- FP&A jobs
- Audit, tax, treasury, controller, CFO, finance manager roles
- AI jobs, data jobs, ML jobs, prompt/LLM jobs
- GCC countries only: UAE, KSA, Qatar, Kuwait, Bahrain, Oman

Do not collect:

- Travel, sales, marketing, HR, admin, customer service, or generic operations jobs
- Jobs outside the GCC
- Internships unless clearly finance/AI and useful
- Expired jobs
- Duplicate links
- Jobs with no company or unclear role title, unless the role is very relevant

## Best Search Examples

Use these search terms on LinkedIn and Naukri Gulf:

- Finance Manager Dubai
- Finance Manager Saudi Arabia
- Financial Controller UAE
- Financial Controller Riyadh
- FP&A Manager Dubai
- Senior Accountant UAE
- Chief Financial Officer Saudi Arabia
- Internal Auditor GCC
- Treasury Manager Dubai
- Tax Manager Saudi Arabia
- AI Analyst Dubai
- Data Analyst Finance UAE
- Machine Learning Engineer Saudi Arabia

## Link Collection Format

Paste one job URL per line.

Example:

```text
https://www.linkedin.com/jobs/view/4433043104/
https://www.linkedin.com/jobs/view/4433033748/
https://www.naukrigulf.com/finance-manager-jobs-in-dubai
```

Do not add notes, bullets, commas, or numbering in the import box.

## Admin Import Steps

1. Open `/manual-import/login`.
2. Sign in with the limited helper username and password.
3. Paste job URLs, one per line.
4. Click **Import pasted job links**.
5. Review the result message.
6. Admin can check **Manual Import History** in the Admin panel to track pasted links, unique links, duplicates, inserted jobs, skipped jobs, and failed links.

## Result Meanings

- `inserted`: job was added to the website.
- `skipped - Duplicate job`: the job already exists.
- `skipped - Not classified as Finance or AI`: the job did not match the portal rules.
- `failed - Could not read job page metadata`: the website blocked reading the page or did not expose enough job data.
- `failed - Invalid URL`: the pasted link was not a valid URL.

LinkedIn may block some pages. If that happens, try Naukri Gulf, Bayt, GulfTalent, Indeed, or send the link to the admin for manual review.

## Admin Tracking

The Admin panel shows a private **Manual Import History** table.

Use it to review:

- Who imported the batch
- How many links were pasted
- How many were unique
- How many pasted links were duplicates
- How many jobs were inserted
- How many were skipped
- How many failed

This section is only for admin monitoring. It should not appear on public job cards.

## Quality Check After Import

After importing, open the live Jobs page and check:

- Job title looks correct
- Company looks reasonable
- Country and city are correct
- Category is Finance or AI
- Apply link opens the original job page
- No unrelated jobs were added

If a wrong job appears, ask the admin to remove it from Supabase or mark it inactive.

## Recommended Outsourcing Workflow

For a new outsourced helper:

1. First 2 days: helper only sends links in a Google Sheet or WhatsApp.
2. Admin reviews and imports.
3. If quality is good, give limited Admin access later.
4. Keep a daily target and review inserted jobs weekly.

## Suggested Google Sheet Columns

Use this if the helper is only collecting links:

```text
Date
Source
Job Title
Company
Country
City
Job URL
Checked By
Imported? Yes/No
Notes
```

## Security Notes

Do not share:

- Supabase access
- Vercel access
- GitHub access
- API keys
- Admin password with untrusted helpers

If outsourcing, prefer link collection first. Admin import can stay with you until the process is proven.
