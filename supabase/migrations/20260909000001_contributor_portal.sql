begin;
create table public.contributors (
  email text primary key check (email = lower(email)),
  name text not null,
  active boolean not null default true,
  rate_minor integer not null default 0 check (rate_minor between 0 and 1000000),
  currency text not null default 'SAR' check (currency in ('SAR','AED','USD')),
  created_at timestamptz not null default now()
);
create table public.contributor_submissions (
  id uuid primary key default gen_random_uuid(),
  contributor_email text not null references public.contributors(email),
  original_url text not null,
  canonical_url text not null,
  status text not null default 'queued' check (status in ('queued','processing','needs_details','review','approved','duplicate','rejected')),
  reason text,
  details jsonb,
  attempts integer not null default 0,
  lease uuid,
  lease_until timestamptz,
  job_id uuid references public.jobs(id),
  amount_minor integer not null default 0,
  currency text not null default 'SAR',
  paid_at timestamptz,
  payment_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index contributor_url_claim on public.contributor_submissions(canonical_url) where status not in ('duplicate','rejected');
create index contributor_recent on public.contributor_submissions(contributor_email,created_at desc);
create index contributor_queue on public.contributor_submissions(status,created_at);
alter table public.contributors enable row level security;
alter table public.contributor_submissions enable row level security;
revoke all on public.contributors,public.contributor_submissions from anon,authenticated;
grant all on public.contributors,public.contributor_submissions to service_role;

-- URL reservation and duplicate feedback must be atomic across contributors.
create function public.submit_contributor_link(p_email text,p_original text,p_url text,p_existing boolean default false)
returns public.contributor_submissions language plpgsql security definer set search_path=public as $$
declare result public.contributor_submissions; duplicate_found boolean;
begin
  if not exists(select 1 from contributors where email=p_email and active) then raise exception 'Contributor disabled'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_url,0));
  duplicate_found := p_existing or exists(select 1 from contributor_submissions where canonical_url=p_url and status not in ('duplicate','rejected'));
  insert into contributor_submissions(contributor_email,original_url,canonical_url,status,reason)
  values(p_email,p_original,p_url,case when duplicate_found then 'duplicate' else 'queued' end,
    case when duplicate_found then 'This link is already submitted or published.' else null end) returning * into result;
  return result;
end $$;

-- Leases recover abandoned work; skip locked prevents overlapping cron runs claiming the same row.
create function public.claim_contributor_links(p_limit integer default 3)
returns setof public.contributor_submissions language plpgsql security definer set search_path=public as $$
begin
  update contributor_submissions set status='needs_details',reason='Automatic processing did not finish. Please complete the details.',lease=null,lease_until=null,updated_at=now()
    where status='processing' and lease_until<now() and attempts>=3;
  return query with candidates as (
    select s.id from contributor_submissions s join contributors c on c.email=s.contributor_email and c.active
    where (s.status='queued' or (s.status='processing' and s.lease_until<now())) and s.attempts<3
    order by s.created_at for update of s skip locked limit greatest(1,least(p_limit,3))
  ) update contributor_submissions s set status='processing',attempts=attempts+1,lease=gen_random_uuid(),lease_until=now()+interval '3 minutes',updated_at=now()
    from candidates where s.id=candidates.id returning s.*;
end $$;

-- Publishing and earning credit are one transaction, and repeated approval is idempotent.
create function public.approve_contributor_submission(p_id uuid,p_job jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare s contributor_submissions; c contributors; existing uuid; new_job uuid; d jsonb;
begin
  select * into s from contributor_submissions where id=p_id for update;
  if not found then raise exception 'Submission not found'; end if;
  if s.status='approved' then return jsonb_build_object('status',s.status,'job_id',s.job_id); end if;
  if s.status<>'review' then raise exception 'Submission is not awaiting review'; end if;
  select * into c from contributors where email=s.contributor_email;
  if not c.active then raise exception 'Contributor disabled'; end if;
  d := s.details;
  perform pg_advisory_xact_lock(hashtextextended('contributor-publish',0));
  select id into existing from jobs where job_fingerprint=p_job->>'job_fingerprint' or apply_url=s.canonical_url or
    (lower(trim(title))=lower(trim(d->>'title')) and lower(trim(company))=lower(trim(d->>'company')) and lower(trim(city))=lower(trim(d->>'city')) and country=d->>'country' and date_posted=(d->>'date_posted')::date) limit 1;
  if existing is not null then
    update contributor_submissions set status='duplicate',reason='This vacancy is already published.',updated_at=now() where id=p_id;
    return jsonb_build_object('status','duplicate');
  end if;
  insert into jobs(title,slug,category,subcategory,company,platform,country,city,work_type,seniority,date_posted,apply_url,description_snippet,job_fingerprint,source_priority,freshness_score,recruiter_source,is_active)
    values(d->>'title',p_job->>'slug',d->>'category','Contributor Reviewed',d->>'company',p_job->>'platform',d->>'country',d->>'city','On-site','Mid',(d->>'date_posted')::date,s.canonical_url,left(d->>'description',1200),p_job->>'job_fingerprint',6,50,'Community Contributor',true)
    on conflict(job_fingerprint) do nothing returning id into new_job;
  if new_job is null then
    update contributor_submissions set status='duplicate',reason='This vacancy was published by another import.',updated_at=now() where id=p_id;
    return jsonb_build_object('status','duplicate');
  end if;
  update contributor_submissions set status='approved',job_id=new_job,amount_minor=c.rate_minor,currency=c.currency,reason=null,updated_at=now() where id=p_id;
  return jsonb_build_object('status','approved','job_id',new_job);
end $$;
revoke all on function public.submit_contributor_link(text,text,text,boolean),public.claim_contributor_links(integer),public.approve_contributor_submission(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.submit_contributor_link(text,text,text,boolean),public.claim_contributor_links(integer),public.approve_contributor_submission(uuid,jsonb) to service_role;
commit;
