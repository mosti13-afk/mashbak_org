-- Mashbak V2: companies and insiders, careers-site jobs, referral flow with outcomes, asks & offers, follows.

-- ---------------------------------------------------------------------------
-- Companies
-- ---------------------------------------------------------------------------
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  name_ar text,
  name_he text,
  aliases text[] not null default '{}',        -- lower-case spellings used to match members' "company" text
  logo_url text,
  website text,
  sector text,
  careers_url text,                             -- any careers page: Workday, Greenhouse, Lever, SmartRecruiters, Ashby, Comeet or a page with JobPosting data
  location_filter text not null default 'israel' check (location_filter in ('israel', 'all')),
  sync_enabled boolean not null default true,
  last_synced_at timestamptz,
  last_sync_status text,
  last_sync_count int,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists companies_aliases_idx on public.companies using gin (aliases);
alter table public.companies enable row level security;
create policy "companies read" on public.companies for select using (public.is_active_member() or public.is_admin());
create policy "companies add" on public.companies for insert with check (public.is_active_member() and created_by = auth.uid());
create policy "companies admin" on public.companies for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.company_follows (
  member_id uuid not null references public.profiles (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (member_id, company_id)
);
alter table public.company_follows enable row level security;
create policy "follows own" on public.company_follows for all using (member_id = auth.uid()) with check (member_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Profiles: link to a company and say how you are happy to help
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists company_id uuid references public.companies (id) on delete set null;
alter table public.profiles add column if not exists open_to_referrals boolean not null default true;
alter table public.profiles add column if not exists open_to_chats boolean not null default true;
alter table public.profiles add column if not exists help_offers text[] not null default '{}';
create index if not exists profiles_company_idx on public.profiles (company_id);

create or replace function public.match_company(p_text text) returns uuid
language sql stable security definer set search_path = public as $$
  select c.id from companies c
  where p_text is not null and btrim(p_text) <> '' and (
    lower(c.name) = lower(btrim(p_text)) or lower(btrim(p_text)) = any (c.aliases)
    or lower(coalesce(c.name_ar, '')) = lower(btrim(p_text)) or lower(coalesce(c.name_he, '')) = lower(btrim(p_text)))
  order by c.created_at limit 1;
$$;

create or replace function public.profiles_link_company() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.company is distinct from old.company and new.company_id is not distinct from old.company_id then
    new.company_id := public.match_company(new.company);
  elsif new.company_id is null and new.company is not null then
    new.company_id := public.match_company(new.company);
  end if;
  return new;
end $$;
drop trigger if exists profiles_link_company on public.profiles;
create trigger profiles_link_company before insert or update of company, company_id on public.profiles
  for each row execute function public.profiles_link_company();

create or replace function public.companies_backfill() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update profiles p set company_id = new.id
   where p.company_id is null and p.company is not null and (
     lower(btrim(p.company)) = lower(new.name) or lower(btrim(p.company)) = any (new.aliases)
     or lower(btrim(p.company)) = lower(coalesce(new.name_ar, '')) or lower(btrim(p.company)) = lower(coalesce(new.name_he, '')));
  update jobs j set company_id = new.id
   where j.company_id is null and (lower(btrim(j.company)) = lower(new.name) or lower(btrim(j.company)) = any (new.aliases));
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Jobs: member posts, jobs imported from careers sites, and jobs shared from a link
-- ---------------------------------------------------------------------------
alter table public.jobs alter column posted_by drop not null;
alter table public.jobs alter column description set default '';
alter table public.jobs add column if not exists company_id uuid references public.companies (id) on delete cascade;
alter table public.jobs add column if not exists source text not null default 'member' check (source in ('member', 'careers', 'link'));
alter table public.jobs add column if not exists external_id text;
alter table public.jobs add column if not exists external_url text;
alter table public.jobs add column if not exists location text;
alter table public.jobs add column if not exists last_seen_at timestamptz;
alter table public.jobs drop constraint if exists jobs_external_key;
alter table public.jobs add constraint jobs_external_key unique (company_id, external_id);
create index if not exists jobs_company_idx on public.jobs (company_id, is_open);
-- Admins can run a careers sync from the dashboard (the scheduled sync uses the service role)
create policy "jobs admin" on public.jobs for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.jobs_link_company() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.company_id is null then new.company_id := public.match_company(new.company); end if;
  return new;
end $$;
drop trigger if exists jobs_link_company on public.jobs;
create trigger jobs_link_company before insert on public.jobs for each row execute function public.jobs_link_company();

drop trigger if exists companies_backfill on public.companies;
create trigger companies_backfill after insert or update of name, aliases, name_ar, name_he on public.companies
  for each row execute function public.companies_backfill();

-- ---------------------------------------------------------------------------
-- Referral requests: addressed to a chosen insider, with advice and outcome
-- ---------------------------------------------------------------------------
alter table public.referral_requests add column if not exists insider_id uuid references public.profiles (id) on delete set null;
alter table public.referral_requests add column if not exists insider_note text;
alter table public.referral_requests add column if not exists outcome text check (outcome in ('interview', 'offer', 'hired', 'no_news', 'rejected'));
alter table public.referral_requests add column if not exists outcome_at timestamptz;
alter table public.referral_requests drop constraint if exists referral_requests_job_id_requester_id_key;
-- one open request per job per member; after a decline you can ask someone else
create unique index if not exists referrals_one_pending on public.referral_requests (job_id, requester_id) where status = 'pending';
create index if not exists referrals_insider_idx on public.referral_requests (insider_id, status);

drop policy if exists "referrals read" on public.referral_requests;
drop policy if exists "referrals insert" on public.referral_requests;
drop policy if exists "referrals respond" on public.referral_requests;
create policy "referrals read" on public.referral_requests for select using (
  requester_id = auth.uid() or insider_id = auth.uid() or public.is_admin() or
  (insider_id is null and exists (select 1 from public.jobs j where j.id = job_id and j.posted_by = auth.uid())));
create policy "referrals insert" on public.referral_requests for insert with check (
  requester_id = auth.uid() and public.is_active_member() and status = 'pending' and (insider_id is null or insider_id <> auth.uid()));
create policy "referrals admin" on public.referral_requests for update using (public.is_admin());

-- Actions go through functions so nobody can mark their own request as accepted
create or replace function public.respond_referral(p_id uuid, p_accept boolean, p_note text) returns void
language plpgsql security definer set search_path = public as $$
begin
  update referral_requests r set status = case when p_accept then 'accepted'::referral_status else 'declined'::referral_status end,
         insider_note = nullif(btrim(coalesce(p_note, '')), ''), responded_at = now()
   where r.id = p_id and r.status = 'pending' and (
     r.insider_id = auth.uid() or (r.insider_id is null and exists (select 1 from jobs j where j.id = r.job_id and j.posted_by = auth.uid())));
  if not found then raise exception 'not allowed'; end if;
end $$;

create or replace function public.withdraw_referral(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  update referral_requests set status = 'withdrawn', responded_at = now() where id = p_id and requester_id = auth.uid() and status = 'pending';
end $$;

create or replace function public.referral_outcome(p_id uuid, p_outcome text) returns void
language plpgsql security definer set search_path = public as $$
begin
  update referral_requests set outcome = p_outcome, outcome_at = now() where id = p_id and requester_id = auth.uid() and status = 'accepted';
end $$;
grant execute on function public.respond_referral(uuid, boolean, text), public.withdraw_referral(uuid), public.referral_outcome(uuid, text) to authenticated;

create or replace function public.on_referral_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare n text; target uuid; jt text;
begin
  select coalesce(new.insider_id, posted_by), title into target, jt from jobs where id = new.job_id;
  if tg_op = 'INSERT' then
    select coalesce(nullif(full_name_ar,''), nullif(full_name_en,''), split_part(email,'@',1)) into n from profiles where id = new.requester_id;
    if target is not null then
      perform notify(target, 'referral_request',
        jsonb_build_object('ar', n || ' يطلب/تطلب توصية: ' || jt, 'en', n || ' asked you for a referral: ' || jt, 'he', n || ' ביקש/ה ממך המלצה: ' || jt),
        jsonb_build_object('ar', new.message, 'en', new.message, 'he', new.message), '/app/requests');
    end if;
  elsif new.status is distinct from old.status and new.status in ('accepted', 'declined') then
    perform notify(new.requester_id, case when new.status = 'accepted' then 'referral_accepted' else 'referral_declined' end,
      case when new.status = 'accepted'
        then jsonb_build_object('ar', 'تمت الموافقة على طلب التوصية: ' || jt, 'en', 'Your referral request was accepted: ' || jt, 'he', 'בקשת ההמלצה אושרה: ' || jt)
        else jsonb_build_object('ar', 'تحديث على طلب التوصية: ' || jt, 'en', 'Update on your referral request: ' || jt, 'he', 'עדכון לגבי בקשת ההמלצה: ' || jt) end,
      jsonb_build_object('ar', coalesce(new.insider_note, ''), 'en', coalesce(new.insider_note, ''), 'he', coalesce(new.insider_note, '')), '/app/requests');
  end if;
  return new;
end $$;

-- Insiders at a company with their current load, for fair rotation (aggregates only)
create or replace function public.company_insiders(p_company uuid) returns table (
  member_id uuid, pending int, accepted int, answered int, total int, last_asked timestamptz)
language sql stable security definer set search_path = public as $$
  select p.id,
         count(*) filter (where r.status = 'pending')::int,
         count(*) filter (where r.status = 'accepted')::int,
         count(*) filter (where r.status in ('accepted', 'declined'))::int,
         count(r.id)::int,
         max(r.created_at)
    from profiles p
    left join referral_requests r on r.insider_id = p.id
   where public.is_active_member() and p.company_id = p_company and p.status = 'active' and p.open_to_referrals
   group by p.id;
$$;
grant execute on function public.company_insiders(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Asks & offers ("بدّي / بقدر")
-- ---------------------------------------------------------------------------
create table if not exists public.asks (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('ask', 'offer')),
  title text not null,
  body text not null default '',
  tags text[] not null default '{}',
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);
create index if not exists asks_open_idx on public.asks (status, created_at desc);
alter table public.asks enable row level security;
create policy "asks read" on public.asks for select using (public.is_active_member() or public.is_admin());
create policy "asks insert" on public.asks for insert with check (member_id = auth.uid() and public.is_active_member());
create policy "asks update" on public.asks for update using (member_id = auth.uid() or public.is_admin());
create policy "asks delete" on public.asks for delete using (member_id = auth.uid() or public.is_admin());

create table if not exists public.ask_replies (
  id uuid primary key default gen_random_uuid(),
  ask_id uuid not null references public.asks (id) on delete cascade,
  member_id uuid not null references public.profiles (id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now(),
  unique (ask_id, member_id)
);
alter table public.ask_replies enable row level security;
create policy "replies read" on public.ask_replies for select using (
  member_id = auth.uid() or public.is_admin() or exists (select 1 from public.asks a where a.id = ask_id and a.member_id = auth.uid()));
create policy "replies insert" on public.ask_replies for insert with check (
  member_id = auth.uid() and public.is_active_member() and not exists (select 1 from public.asks a where a.id = ask_id and a.member_id = auth.uid()));
create policy "replies delete" on public.ask_replies for delete using (member_id = auth.uid() or public.is_admin());

create or replace function public.ask_reply_counts(ids uuid[]) returns table (ask_id uuid, n int)
language sql stable security definer set search_path = public as $$
  select r.ask_id, count(*)::int from ask_replies r where r.ask_id = any(ids) and public.is_active_member() group by r.ask_id;
$$;

create or replace function public.on_ask_reply() returns trigger
language plpgsql security definer set search_path = public as $$
declare n text; owner uuid; t text; k text;
begin
  select member_id, title, kind into owner, t, k from asks where id = new.ask_id;
  select coalesce(nullif(full_name_ar,''), nullif(full_name_en,''), split_part(email,'@',1)) into n from profiles where id = new.member_id;
  perform notify(owner, 'ask_reply',
    case when k = 'ask'
      then jsonb_build_object('ar', n || ' يعرض المساعدة: ' || t, 'en', n || ' offered to help: ' || t, 'he', n || ' מציע/ה לעזור: ' || t)
      else jsonb_build_object('ar', n || ' مهتم/ة بعرضك: ' || t, 'en', n || ' is interested in your offer: ' || t, 'he', n || ' מתעניין/ת בהצעה שלך: ' || t) end,
    jsonb_build_object('ar', new.message, 'en', new.message, 'he', new.message), '/app/asks/' || new.ask_id);
  return new;
end $$;
drop trigger if exists ask_reply_notify on public.ask_replies;
create trigger ask_reply_notify after insert on public.ask_replies for each row execute function public.on_ask_reply();

-- "Helped N members": accepted referrals given + accepted chats + answers to asks (aggregates only)
create or replace function public.member_stats(ids uuid[]) returns table (member_id uuid, referrals int, chats int, answers int, hires int)
language sql stable security definer set search_path = public as $$
  select m.id,
    (select count(*) from referral_requests r where r.insider_id = m.id and r.status = 'accepted')::int,
    (select count(*) from connections c where c.recipient_id = m.id and c.status = 'accepted')::int,
    (select count(*) from ask_replies a where a.member_id = m.id)::int,
    (select count(*) from referral_requests r where r.insider_id = m.id and r.outcome = 'hired')::int
  from unnest(ids) as m(id)
  where public.is_active_member();
$$;

-- Connection (coffee chat) notifications now point to the Requests inbox
create or replace function public.on_connection_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare n text;
begin
  if tg_op = 'INSERT' then
    select coalesce(nullif(full_name_ar,''), nullif(full_name_en,''), split_part(email,'@',1)) into n from profiles where id = new.requester_id;
    perform notify(new.recipient_id, 'connection_request',
      jsonb_build_object('ar', n || ' يطلب دردشة قصيرة معك', 'en', n || ' would like a short chat with you', 'he', n || ' מבקש/ת שיחה קצרה איתך'),
      jsonb_build_object('ar', new.message, 'en', new.message, 'he', new.message), '/app/requests');
  elsif new.status = 'accepted' and old.status <> 'accepted' then
    select coalesce(nullif(full_name_ar,''), nullif(full_name_en,''), split_part(email,'@',1)) into n from profiles where id = new.recipient_id;
    perform notify(new.requester_id, 'connection_accepted',
      jsonb_build_object('ar', n || ' وافق/ت على الدردشة. تواصلوا عبر واتساب', 'en', n || ' accepted your chat request. Continue on WhatsApp', 'he', n || ' אישר/ה את בקשת השיחה. המשיכו בוואטסאפ'),
      '{}'::jsonb, '/app/requests?tab=sent');
  end if;
  return new;
end $$;

-- Pulse: add referrals and reported hires
create or replace function public.platform_stats() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'members', (select count(*) from profiles where status = 'active'),
    'companies', (select count(distinct company_id) from profiles where status = 'active' and company_id is not null),
    'events_upcoming', (select count(*) from events where status = 'published' and starts_at > now()),
    'jobs_open', (select count(*) from jobs where is_open and not archived and expires_at > now()),
    'connections', (select count(*) from connections where status = 'accepted'),
    'referrals', (select count(*) from referral_requests where status = 'accepted'),
    'hires', (select count(*) from referral_requests where outcome = 'hired'),
    'programs', (select count(*) from programs where is_active)
  );
$$;

grant select, insert, update, delete on public.companies, public.company_follows, public.asks, public.ask_replies to authenticated;
grant select on public.companies to anon;
grant execute on function public.member_stats(uuid[]), public.ask_reply_counts(uuid[]), public.match_company(text) to authenticated;
