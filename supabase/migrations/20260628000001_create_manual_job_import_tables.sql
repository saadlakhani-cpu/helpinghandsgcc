create table if not exists manual_job_import_runs (
  id uuid primary key default gen_random_uuid(),
  imported_by text,
  pasted_count integer not null default 0,
  unique_count integer not null default 0,
  duplicate_link_count integer not null default 0,
  inserted_count integer not null default 0,
  skipped_count integer not null default 0,
  failed_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists manual_job_import_items (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references manual_job_import_runs(id) on delete cascade,
  url text not null,
  status text not null check (status in ('inserted', 'skipped', 'failed')),
  reason text,
  title text,
  company text,
  platform text,
  job_id uuid references jobs(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists manual_job_import_runs_created_at_idx
  on manual_job_import_runs (created_at desc);

create index if not exists manual_job_import_items_run_id_idx
  on manual_job_import_items (run_id);

create index if not exists manual_job_import_items_url_idx
  on manual_job_import_items (url);

alter table manual_job_import_runs enable row level security;
alter table manual_job_import_items enable row level security;
