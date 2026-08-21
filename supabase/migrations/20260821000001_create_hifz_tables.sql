-- Hifz Command Center: shared multiplayer state for the family roster.
-- Accessed exclusively through the service-role client (lib/supabase/admin.ts)
-- from /api/hifz/* routes — RLS is enabled with no policies, matching every
-- other table in this project, so anon/authenticated clients get nothing.
--
-- `pin` is a plaintext 4-digit code, not a hashed credential. It gates which
-- kid's row a browser session may write to (so one cousin can't edit
-- another's progress) — the same low-stakes "compare a literal secret"
-- pattern this repo already uses for ADMIN_SECRET / MANUAL_IMPORT_PASSWORD.
-- It is never returned by /api/hifz/state or any read endpoint.

CREATE TABLE IF NOT EXISTS hifz_players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pin TEXT NOT NULL,
  character_color TEXT NOT NULL DEFAULT '#38bdf8',
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('SAR', 'USD', 'PKR')),
  difficulty TEXT NOT NULL DEFAULT 'RECRUIT' CHECK (difficulty IN ('RECRUIT', 'SENTINEL', 'COMMANDER')),
  focus TEXT NOT NULL DEFAULT '',
  weekend_days INTEGER[] NOT NULL DEFAULT '{0,6}',
  vacation_mode BOOLEAN NOT NULL DEFAULT FALSE,
  streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  base_defense_level INTEGER NOT NULL DEFAULT 1,
  vault_coins INTEGER NOT NULL DEFAULT 0,
  gems INTEGER NOT NULL DEFAULT 0,
  total_coins_earned INTEGER NOT NULL DEFAULT 0,
  tasks JSONB NOT NULL DEFAULT '{"shields": false, "recon": false, "perimeter": false}',
  tasks_date TEXT NOT NULL DEFAULT '',
  cash_out_history JSONB NOT NULL DEFAULT '[]',
  current_surah INTEGER NOT NULL DEFAULT 1,
  current_ayah INTEGER NOT NULL DEFAULT 1,
  memorization_log JSONB NOT NULL DEFAULT '[]',
  unlocks TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE hifz_players ENABLE ROW LEVEL SECURITY;

-- Starter roster. PINs below are placeholders — change them (or ask the
-- family to pick their own) once this is live: UPDATE hifz_players SET pin
-- = '....' WHERE id = '...';
INSERT INTO hifz_players (
  id, name, pin, character_color, currency, difficulty, focus,
  weekend_days, streak, best_streak, base_defense_level,
  vault_coins, gems, total_coins_earned,
  current_surah, current_ayah
) VALUES
  ('zayn', 'Zayn', '1111', '#22d3ee', 'SAR', 'COMMANDER',
   'Protecting Juzz 23-30 · Attacking Chapter 22',
   '{5,6}', 6, 11, 14, 640, 58, 3120, 22, 45),
  ('ahmad', 'Ahmad', '2222', '#f472b6', 'SAR', 'COMMANDER',
   'Ramadan Target: Complete Juzz 14-30 before Ramadan',
   '{5,6}', 3, 8, 10, 410, 36, 2260, 28, 30),
  ('muhammad', 'Muhammad', '3333', '#a3e635', 'USD', 'RECRUIT',
   'Building the foundation: Juzz Amma, line by line',
   '{6,0}', 2, 5, 4, 180, 14, 540, 81, 10),
  ('abiha', 'Abiha', '4444', '#fbbf24', 'PKR', 'SENTINEL',
   'Steady progress through Juzz 1-5',
   '{6,0}', 5, 5, 8, 320, 27, 1580, 2, 100)
ON CONFLICT (id) DO NOTHING;
