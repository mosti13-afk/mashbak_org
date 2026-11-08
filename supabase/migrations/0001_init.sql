-- Mashbak v2 - core schema
-- Run with: supabase db push   (or paste into the Supabase SQL editor)


-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('member', 'admin');
create type public.member_status as enum ('pending', 'active', 'suspended');
create type public.application_status as enum ('pending', 'approved', 'rejected');
create type public.connection_status as enum ('pending', 'accepted', 'declined');
create type public.referral_status as enum ('pending', 'accepted', 'declined');
create type public.registration_status as enum ('registered', 'waitlist', 'cancelled', 'attended');
create type public.job_type as enum ('full_time', 'part_time', 'contract', 'freelance');
create type public.work_mode as enum ('onsite', 'hybrid', 'remote');
create type public.event_status as enum ('draft', 'published', 'cancelled');

-- Localized text is stored as jsonb: {"ar": "...", "en": "...", "he": "..."}

-- ---------------------------------------------------------------------------
-- Profiles (one per auth user)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'member',
  status public.member_status not null default 'pending',
  full_name_ar text not null default '',
  full_name_en text not null default '',
  email text not null,
  phone text,                       -- E.164, used for the WhatsApp hand-off
  avatar_url text,
  headline text,                    -- current job title
  company text,
  sector text,
  city text,
  years_experience int,
  linkedin_url text,
  bio text,
  career_goals text[] not null default '{}',
  interests text[] not null default '{}',
  open_to_mentoring boolean not null default false,
  show_phone_to_connections boolean not null default true,
  locale text not null default 'ar' check (locale in ('ar', 'en', 'he')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_status_idx on public.profiles (status);
create index profiles_search_idx on public.profiles using gin (
  to_tsvector('simple', coalesce(full_name_ar,'') || ' ' || coalesce(full_name_en,'') || ' ' ||
    coalesce(headline,'') || ' ' || coalesce(company,'') || ' ' || coalesce(sector,''))
);

-- Helper: is the current user an admin?
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Helper: is the current user an active member (or admin)?
create or replace function public.is_active_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and (status = 'active' or role = 'admin'));
$$;

-- ---------------------------------------------------------------------------
-- Membership applications (public form, reviewed by admins)
-- ---------------------------------------------------------------------------
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  city text,
  headline text not null,
  company text,
  sector text,
  years_experience int not null check (years_experience >= 0),
  linkedin_url text,
  motivation text not null,
  referral_source text,
  age_confirmed boolean not null default false,  -- 18+ rule
  status public.application_status not null default 'pending',
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Events + registrations (RSVP, waitlist, QR check-in)
-- ---------------------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title jsonb not null,
  description jsonb not null default '{}'::jsonb,
  cover_url text,
  location jsonb not null default '{}'::jsonb,
  is_online boolean not null default false,
  online_url text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity int,
  program_id uuid,
  status public.event_status not null default 'published',
  members_only boolean not null default true,
  cancellation_deadline_hours int not null default 24,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);
create index events_starts_idx on public.events (starts_at);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  member_id uuid not null references public.profiles (id) on delete cascade,
  status public.registration_status not null default 'registered',
  checkin_code text not null default substr(replace(gen_random_uuid()::text, '-', ''), 1, 16),
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  unique (event_id, member_id)
);

-- ---------------------------------------------------------------------------
-- Jobs (posted by members or admins, no approval needed) + referral requests
-- ---------------------------------------------------------------------------
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  city text,
  job_type public.job_type not null default 'full_time',
  work_mode public.work_mode not null default 'hybrid',
  is_managerial boolean not null default false,
  description text not null,
  requirements text,
  apply_url text,
  posted_by uuid not null references public.profiles (id) on delete cascade,
  is_open boolean not null default true,
  expires_at timestamptz not null default now() + interval '45 days',
  created_at timestamptz not null default now()
);
create index jobs_open_idx on public.jobs (is_open, created_at desc);

create table public.referral_requests (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  requester_id uuid not null references public.profiles (id) on delete cascade,
  message text not null,
  cv_url text,
  status public.referral_status not null default 'pending',
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  unique (job_id, requester_id)
);

-- ---------------------------------------------------------------------------
-- Connections (ask a member about their role → accept → WhatsApp)
-- ---------------------------------------------------------------------------
create table public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  message text not null,
  status public.connection_status not null default 'pending',
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  check (requester_id <> recipient_id),
  unique (requester_id, recipient_id)
);

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,               -- connection_request, connection_accepted, referral_request, referral_accepted, event_reminder, application_approved, system
  title jsonb not null,
  body jsonb not null default '{}'::jsonb,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_member_idx on public.notifications (member_id, created_at desc);

-- ---------------------------------------------------------------------------
-- CMS content: programs, FAQs, member reviews (testimonials), partners, settings
-- ---------------------------------------------------------------------------
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title jsonb not null,
  summary jsonb not null default '{}'::jsonb,
  body jsonb not null default '{}'::jsonb,
  for_who jsonb not null default '{}'::jsonb,
  duration jsonb not null default '{}'::jsonb,
  sessions jsonb not null default '{}'::jsonb,
  benefits jsonb not null default '[]'::jsonb,   -- array of {"ar","en","he"}
  color text not null default '#117286',
  icon text not null default 'network',
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question jsonb not null,
  answer jsonb not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table public.member_reviews (
  id uuid primary key default gen_random_uuid(),
  name jsonb not null,
  role_title jsonb not null default '{}'::jsonb,
  organization text,
  photo_url text,
  quote jsonb not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

-- Key/value settings edited from the admin (hero, stats, floating avatars, limits…)
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  replied_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.events enable row level security;
alter table public.registrations enable row level security;
alter table public.jobs enable row level security;
alter table public.referral_requests enable row level security;
alter table public.connections enable row level security;
alter table public.notifications enable row level security;
alter table public.programs enable row level security;
alter table public.faqs enable row level security;
alter table public.member_reviews enable row level security;
alter table public.partners enable row level security;
alter table public.site_settings enable row level security;
alter table public.contact_messages enable row level security;

-- profiles: active members see active members; everyone sees self; admins see all
create policy "profiles read" on public.profiles for select
  using (id = auth.uid() or public.is_admin() or (public.is_active_member() and status = 'active'));
create policy "profiles update self" on public.profiles for update
  using (id = auth.uid()) with check (
    id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = auth.uid())
    and status = (select p.status from public.profiles p where p.id = auth.uid()));
create policy "profiles admin all" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- applications: anyone can apply; only admins read/update
create policy "applications insert" on public.applications for insert with check (age_confirmed);
create policy "applications admin" on public.applications for all using (public.is_admin()) with check (public.is_admin());

-- events: published public events readable by all; members-only by members; admins all
create policy "events read" on public.events for select
  using (status = 'published' and (not members_only or public.is_active_member()) or public.is_admin());
create policy "events admin" on public.events for all using (public.is_admin()) with check (public.is_admin());

-- registrations: own rows; admins all
create policy "registrations own read" on public.registrations for select using (member_id = auth.uid() or public.is_admin());
create policy "registrations own insert" on public.registrations for insert with check (member_id = auth.uid() and public.is_active_member());
create policy "registrations own update" on public.registrations for update using (member_id = auth.uid() or public.is_admin());

-- jobs: members read open jobs; members post; poster/admin edits
create policy "jobs read" on public.jobs for select using (public.is_active_member());
create policy "jobs insert" on public.jobs for insert with check (posted_by = auth.uid() and public.is_active_member());
create policy "jobs update" on public.jobs for update using (posted_by = auth.uid() or public.is_admin());
create policy "jobs delete" on public.jobs for delete using (posted_by = auth.uid() or public.is_admin());

-- referral requests: requester and job poster see them; poster responds
create policy "referrals read" on public.referral_requests for select using (
  requester_id = auth.uid() or public.is_admin() or
  exists (select 1 from public.jobs j where j.id = job_id and j.posted_by = auth.uid()));
create policy "referrals insert" on public.referral_requests for insert with check (requester_id = auth.uid() and public.is_active_member());
create policy "referrals respond" on public.referral_requests for update using (
  exists (select 1 from public.jobs j where j.id = job_id and j.posted_by = auth.uid()) or public.is_admin());

-- connections: both parties see; recipient responds
create policy "connections read" on public.connections for select using (requester_id = auth.uid() or recipient_id = auth.uid() or public.is_admin());
create policy "connections insert" on public.connections for insert with check (requester_id = auth.uid() and public.is_active_member());
create policy "connections respond" on public.connections for update using (recipient_id = auth.uid() or public.is_admin());

-- notifications: own only
create policy "notifications own" on public.notifications for select using (member_id = auth.uid());
create policy "notifications mark read" on public.notifications for update using (member_id = auth.uid());
create policy "notifications admin" on public.notifications for all using (public.is_admin()) with check (public.is_admin());

-- public CMS content
create policy "programs read" on public.programs for select using (is_active or public.is_admin());
create policy "programs admin" on public.programs for all using (public.is_admin()) with check (public.is_admin());
create policy "faqs read" on public.faqs for select using (is_active or public.is_admin());
create policy "faqs admin" on public.faqs for all using (public.is_admin()) with check (public.is_admin());
create policy "reviews read" on public.member_reviews for select using (is_active or public.is_admin());
create policy "reviews admin" on public.member_reviews for all using (public.is_admin()) with check (public.is_admin());
create policy "partners read" on public.partners for select using (is_active or public.is_admin());
create policy "partners admin" on public.partners for all using (public.is_admin()) with check (public.is_admin());
create policy "settings read" on public.site_settings for select using (true);
create policy "settings admin" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "contact insert" on public.contact_messages for insert with check (true);
create policy "contact admin" on public.contact_messages for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Triggers: profile row on signup, notifications on connection/referral events
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare a public.applications;
begin
  -- If this email belongs to an approved application, activate the member with its details
  select * into a from public.applications
   where lower(email) = lower(new.email) and status = 'approved'
   order by reviewed_at desc nulls last limit 1;
  insert into public.profiles (id, email, full_name_ar, full_name_en, phone, headline, company, sector, city,
                               years_experience, linkedin_url, status)
  values (new.id, new.email,
          coalesce(a.full_name, new.raw_user_meta_data->>'full_name', ''),
          coalesce(a.full_name, new.raw_user_meta_data->>'full_name', ''),
          a.phone, a.headline, a.company, a.sector, a.city, a.years_experience, a.linkedin_url,
          case when a.id is not null then 'active'::public.member_status else 'pending'::public.member_status end);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.notify(p_member uuid, p_kind text, p_title jsonb, p_body jsonb, p_link text)
returns void language sql security definer set search_path = public as $$
  insert into public.notifications (member_id, kind, title, body, link) values (p_member, p_kind, p_title, p_body, p_link);
$$;

create or replace function public.on_connection_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare n text;
begin
  if tg_op = 'INSERT' then
    select coalesce(nullif(full_name_ar,''), nullif(full_name_en,''), split_part(email,'@',1)) into n from profiles where id = new.requester_id;
    perform notify(new.recipient_id, 'connection_request',
      jsonb_build_object('ar', n || ' أرسل/ت لك طلب تواصل', 'en', n || ' sent you a connection request', 'he', n || ' שלח/ה לך בקשת קשר'),
      jsonb_build_object('ar', new.message, 'en', new.message, 'he', new.message), '/app/connections');
  elsif new.status = 'accepted' and old.status <> 'accepted' then
    select coalesce(nullif(full_name_ar,''), nullif(full_name_en,''), split_part(email,'@',1)) into n from profiles where id = new.recipient_id;
    perform notify(new.requester_id, 'connection_accepted',
      jsonb_build_object('ar', n || ' وافق/ت على طلب التواصل', 'en', n || ' accepted your connection request', 'he', n || ' אישר/ה את בקשת הקשר'),
      '{}'::jsonb, '/app/connections');
  end if;
  return new;
end $$;
create trigger connections_notify after insert or update on public.connections
  for each row execute function public.on_connection_change();

create or replace function public.on_referral_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare n text; poster uuid; jt text;
begin
  select posted_by, title into poster, jt from jobs where id = new.job_id;
  if tg_op = 'INSERT' then
    select coalesce(nullif(full_name_ar,''), nullif(full_name_en,''), split_part(email,'@',1)) into n from profiles where id = new.requester_id;
    perform notify(poster, 'referral_request',
      jsonb_build_object('ar', n || ' يطلب/تطلب توصية: ' || jt, 'en', n || ' asked for a referral: ' || jt, 'he', n || ' ביקש/ה המלצה: ' || jt),
      jsonb_build_object('ar', new.message, 'en', new.message, 'he', new.message), '/app/jobs/' || new.job_id);
  elsif new.status = 'accepted' and old.status <> 'accepted' then
    perform notify(new.requester_id, 'referral_accepted',
      jsonb_build_object('ar', 'تمت الموافقة على طلب التوصية: ' || jt, 'en', 'Your referral request was accepted: ' || jt, 'he', 'בקשת ההמלצה אושרה: ' || jt),
      '{}'::jsonb, '/app/jobs/' || new.job_id);
  end if;
  return new;
end $$;
create trigger referrals_notify after insert or update on public.referral_requests
  for each row execute function public.on_referral_change();

-- Seat counts are visible to everyone (registrations themselves are private)
create or replace function public.event_counts(ids uuid[]) returns table (event_id uuid, n int)
language sql stable security definer set search_path = public as $$
  select r.event_id, count(*)::int from registrations r
  where r.event_id = any(ids) and r.status in ('registered', 'attended') group by r.event_id;
$$;

-- RSVP with automatic waitlist
create or replace function public.register_for_event(p_event uuid) returns public.registration_status
language plpgsql security definer set search_path = public as $$
declare cap int; taken int; st public.registration_status;
begin
  if not public.is_active_member() then raise exception 'not a member'; end if;
  select capacity into cap from events where id = p_event and status = 'published' for update;
  if not found then raise exception 'event not found'; end if;
  select count(*) into taken from registrations where event_id = p_event and status in ('registered', 'attended') and member_id <> auth.uid();
  st := case when cap is not null and taken >= cap then 'waitlist' else 'registered' end;
  insert into registrations (event_id, member_id, status) values (p_event, auth.uid(), st)
  on conflict (event_id, member_id) do update set status = excluded.status, created_at = now()
    where registrations.status = 'cancelled';
  return st;
end $$;

-- Cancel and promote the first person on the waitlist
create or replace function public.cancel_registration(p_event uuid) returns void
language plpgsql security definer set search_path = public as $$
declare nxt uuid; t jsonb;
begin
  update registrations set status = 'cancelled' where event_id = p_event and member_id = auth.uid() and status in ('registered', 'waitlist');
  select id into nxt from registrations where event_id = p_event and status = 'waitlist' order by created_at limit 1;
  if nxt is not null and (select count(*) from registrations where event_id = p_event and status in ('registered','attended'))
       < coalesce((select capacity from events where id = p_event), 2147483647) then
    update registrations set status = 'registered' where id = nxt;
    select title into t from events where id = p_event;
    perform notify((select member_id from registrations where id = nxt), 'event_reminder',
      jsonb_build_object('ar', 'حصلت على مقعد: ' || (t->>'ar'), 'en', 'You got a seat: ' || (t->>'en'), 'he', 'קיבלת מקום: ' || (t->>'he')),
      '{}'::jsonb, '/app/events/' || p_event);
  end if;
end $$;

-- Admin check-in by ticket code
create or replace function public.checkin(p_event uuid, p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r registrations; n text;
begin
  if not public.is_admin() then raise exception 'admins only'; end if;
  select * into r from registrations where event_id = p_event and checkin_code = trim(p_code) and status <> 'cancelled';
  if not found then return jsonb_build_object('ok', false); end if;
  select coalesce(nullif(full_name_ar, ''), nullif(full_name_en, ''), split_part(email, '@', 1)) into n from profiles where id = r.member_id;
  if r.checked_in_at is not null then return jsonb_build_object('ok', true, 'already', true, 'name', n); end if;
  update registrations set checked_in_at = now(), status = 'attended' where id = r.id;
  return jsonb_build_object('ok', true, 'already', false, 'name', n);
end $$;

-- Contact details are only revealed after a connection is accepted
create or replace function public.connection_phone(p_other uuid) returns text
language sql stable security definer set search_path = public as $$
  select p.phone from profiles p
  where p.id = p_other and p.show_phone_to_connections and exists (
    select 1 from connections c where c.status = 'accepted' and
      ((c.requester_id = auth.uid() and c.recipient_id = p_other) or (c.recipient_id = auth.uid() and c.requester_id = p_other)));
$$;

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('public-media', 'public-media', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('cvs', 'cvs', false) on conflict do nothing;

create policy "public media read" on storage.objects for select using (bucket_id in ('public-media', 'avatars'));
create policy "admin media write" on storage.objects for all using (bucket_id = 'public-media' and public.is_admin()) with check (bucket_id = 'public-media' and public.is_admin());
create policy "own avatar write" on storage.objects for all using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own cv" on storage.objects for all using (bucket_id = 'cvs' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()))
  with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);

-- Default grants (Supabase sets these automatically; kept explicit for clarity)
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant execute on all functions in schema public to anon, authenticated;
