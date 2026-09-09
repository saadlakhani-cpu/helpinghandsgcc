# AI Training and Solutions Release

## Implemented

- Homepage positioning, service entry points, navigation and footer links.
- `/ai-training`: individual topics and corporate workshops; course buttons preselect the enquiry.
- `/ai-solutions`: four business workflow areas and consultation enquiries.
- Public forms with validation, consent, loading/error/success states and a privacy notice at `/enquiry-privacy`.
- `/admin/enquiries`: private enquiry list, 25 per page, status filters and New / Contacted / Closed controls. Accessible from the admin dashboard.
- Supabase `service_enquiries` table with RLS enabled and no anonymous or authenticated table access. Server routes use the existing service-role client.
- GA `generate_lead` event on successful submission; includes enquiry type and topic only, not contact details or the message.
- No payments, booking guarantees or automatic email notifications. Follow-up is handled by the administrator.

## Enable in production

1. In Supabase SQL Editor, run the **contents** of `supabase/migrations/20260908000001_create_service_enquiries.sql`. Do not paste the file path as SQL. Keep RLS enabled.
2. Existing Vercel variables must remain available: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SECRET`, and the existing Analytics configuration. There are no new required environment variables.
3. Deploy the changes after reviewing the local preview. No commit, push, deployment or production migration was performed during implementation.
4. Submit one real enquiry on the deployed site and verify it appears in Admin > Training & Solution Enquiries. Set it to Contacted and reload to confirm persistence. Also confirm signed-out visitors cannot access the admin screen or update endpoint.
5. Check Analytics Realtime/DebugView for `generate_lead` with tracking enabled. Blockers or consent settings may prevent Analytics delivery without affecting enquiry storage.

## Validation

- `npm run build`: production compilation, lint and type checks.
- `node --test tests/service-enquiries.test.cjs`: validation, persistence failure, rate limit and admin authorization tests using mocked database calls.
- Local Chrome checks: public pages, desktop/mobile overflow, selected service, error recovery, success state, admin redirects and API authorization. Browser form submissions are intercepted and do not create database records.
- Screenshots are in the parent workspace `outputs` directory.

Live database inserts, RLS enforcement against the deployed table and persisted admin updates still require the production migration and smoke check above.

## Operational notes

- The existing in-memory rate limiter and a hidden spam field provide basic protection; rate limits are per server instance and reset on restart. Persistent rate limiting or CAPTCHA can be added if abuse appears.
- Trainer information, delivery arrangements, dates and pricing must be confirmed before accepting bookings. This release collects interest and requirements.
- Enquiry data is private to the administrator. The privacy notice provides the contact address for correction or deletion requests.
- Existing unrelated footer `/privacy` and `/terms` destinations were not present in this checkout; the new enquiry forms use their own working privacy notice.
