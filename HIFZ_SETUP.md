# Hifz Command Center — Setup

A gamified, multiplayer Hifz tracking dashboard at `/hifz` for the family
(Zayn, Ahmad, Muhammad, Abiha). Dark sci-fi/arcade theme inspired by
"Missiles vs Cities," with real Surah/Ayah memorization tracking, a shared
Supabase backend, blocky Roblox-style characters, and an unlock system.

## 1. Run the migration

Apply `supabase/migrations/20260821000001_create_hifz_tables.sql` to your
Supabase project:

- **Dashboard**: SQL Editor → New query → paste the file contents → Run.
- **CLI**: `supabase link --project-ref YOUR_PROJECT_REF && supabase db push`

This creates the `hifz_players` table (RLS enabled, no policies — same
pattern as every other table in this project, accessed only through the
service-role client) and seeds the four kids with **placeholder PINs**.

## 2. Set environment variables

Add to `.env.local` (or your host's env var settings):

```
HIFZ_FAMILY_PASSCODE=choose-a-family-passcode
```

This repo's existing `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
are reused — no separate Supabase project needed.

## 3. Change the seeded PINs before sharing the link

The migration ships with these placeholders:

| Kid | PIN |
|-----|-----|
| Zayn | `1111` |
| Ahmad | `2222` |
| Muhammad | `3333` |
| Abiha | `4444` |

Change them in the Supabase SQL editor before giving anyone the URL:

```sql
UPDATE hifz_players SET pin = 'new-pin' WHERE id = 'zayn';
```

## How access works

Two-tier login, both cookie-based (httpOnly), same pattern as `/admin`:

1. **Family passcode** (`HIFZ_FAMILY_PASSCODE`) gates `/hifz` and all of
   `/api/hifz/*` in `middleware.ts`. Anyone with this passcode can view the
   shared family state (leaderboard, Family Base, everyone's progress).
2. **Per-kid PIN** (stored in `hifz_players.pin`, plaintext — a low-stakes
   "compare a literal secret" credential, not a real password) scopes writes
   to that kid's own row. A kid must sign in as their own character before
   they can complete quests, log memorization, or change settings.

## How the multiplayer sync works

- `GET /api/hifz/state` returns every player's public state (never the PIN)
  and applies that day's quest/streak rollover server-side the first time
  anyone loads it each day — so every device sees the same rolled-over state.
- The client polls this endpoint every 15 seconds, so one cousin's completed
  quest shows up on everyone else's screen shortly after.
- `PATCH /api/hifz/player` is the only write path; it only ever touches the
  signed-in kid's own row.

## Gear & unlocks

`app/hifz/gear.ts` defines milestone-based cosmetic unlocks (streak tiers →
helmets, ayahs-memorized tiers → capes, base-defense tiers → weapons,
streak/earnings/cash-out → auras). Once earned, an item is permanent — it
won't disappear if the underlying stat later drops (e.g. a broken streak).
`app/hifz/Character.tsx` renders each kid as a CSS-only blocky humanoid
wearing their highest unlocked item per slot.

## Known limitation

The database-backed routes (`player-login`, `me`, `state`, `player` PATCH)
were built following this repo's existing Supabase conventions exactly, but
could not be tested end-to-end against a live project in the environment
this was built in (no network access to Supabase). Everything else — the
passcode gate, error handling, character rendering, and full build/typecheck —
was verified. **Do a real smoke test after deploying**: sign in as one kid,
complete a quest, and confirm it shows up from a second browser/device.
