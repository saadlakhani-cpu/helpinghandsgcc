create table if not exists public.service_enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  type text not null check (type in ('individual', 'corporate', 'solution')),
  topic text not null check (char_length(topic) between 1 and 120),
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) between 3 and 254),
  company text check (char_length(company) <= 150),
  message text check (char_length(message) <= 3000),
  consent_at timestamptz not null,
  status text not null default 'New' check (status in ('New', 'Contacted', 'Closed'))
);
create index if not exists service_enquiries_created_idx on public.service_enquiries (created_at desc, id);
alter table public.service_enquiries enable row level security;
revoke all on public.service_enquiries from anon, authenticated;
grant select, insert, update on public.service_enquiries to service_role;
