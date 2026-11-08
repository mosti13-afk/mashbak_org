-- Mashbak v2: parity with the live mashbak.org platform (programs, applications, profiles, jobs, events,
-- dropdown lists, notification templates and delivery log).

-- Programs: icon/image, audience and session counts like the live site
alter table public.programs add column if not exists icon_url text;
alter table public.programs add column if not exists image_url text;
alter table public.programs add column if not exists target_audience jsonb not null default '[]'::jsonb;
alter table public.programs add column if not exists sessions_count int;
alter table public.programs add column if not exists duration_months int;

-- Managed dropdown lists (cities, sectors, organisations, career goals ...)
create table if not exists public.dropdown_options (
  id bigint generated always as identity primary key,
  type text not null,
  key text not null,
  label jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  is_active boolean not null default true,
  status text not null default 'approved' check (status in ('approved', 'pending')),
  suggested_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (type, key)
);
alter table public.dropdown_options enable row level security;
create policy "dropdowns read" on public.dropdown_options for select using ((is_active and status = 'approved') or public.is_admin());
create policy "dropdowns suggest" on public.dropdown_options for insert with check (status = 'pending' and not is_active);
create policy "dropdowns admin" on public.dropdown_options for all using (public.is_admin()) with check (public.is_admin());

-- Applications: the full live form
alter table public.applications add column if not exists date_of_birth date;
alter table public.applications add column if not exists gender text check (gender in ('male', 'female'));
alter table public.applications add column if not exists academic_title text;
alter table public.applications add column if not exists is_manager boolean;
alter table public.applications add column if not exists mentoring_participated boolean;
alter table public.applications add column if not exists reject_reason text;
alter table public.applications add column if not exists flagged boolean not null default false;
alter table public.applications add column if not exists locale text not null default 'ar';

-- Profiles: questionnaire, verification and files
alter table public.profiles add column if not exists gender text;
alter table public.profiles add column if not exists date_of_birth date;
alter table public.profiles add column if not exists academic_title text;
alter table public.profiles add column if not exists is_manager boolean;
alter table public.profiles add column if not exists mentoring_participated boolean;
alter table public.profiles add column if not exists current_interests text[] not null default '{}';
alter table public.profiles add column if not exists top_career_challenges text[] not null default '{}';
alter table public.profiles add column if not exists interested_opportunities text[] not null default '{}';
alter table public.profiles add column if not exists interested_in_mentoring text[] not null default '{}';
alter table public.profiles add column if not exists cv_url text;
alter table public.profiles add column if not exists onboarded_at timestamptz;
alter table public.profiles add column if not exists notify_email boolean not null default true;
alter table public.profiles add column if not exists notify_whatsapp boolean not null default true;
alter table public.profiles add column if not exists admin_notes text;
alter table public.profiles add column if not exists last_seen_at timestamptz;

-- Jobs: industry, seniority, workflow, notes and archiving
alter table public.jobs add column if not exists industry text;
alter table public.jobs add column if not exists seniority text;
alter table public.jobs add column if not exists notes_for_members text;
alter table public.jobs add column if not exists archived boolean not null default false;

-- Job applications (referral requests): withdraw
alter type public.referral_status add value if not exists 'withdrawn';

-- Events: registration window, waitlist toggle, visibility, reminders, reviews
alter table public.events add column if not exists registration_ends_at timestamptz;
alter table public.events add column if not exists waitlist_enabled boolean not null default true;
alter table public.events add column if not exists send_24h_reminder boolean not null default true;
alter table public.events add column if not exists send_2h_reminder boolean not null default false;
alter table public.events add column if not exists reminded_24h_at timestamptz;
alter table public.events add column if not exists reminded_2h_at timestamptz;

create table if not exists public.event_reviews (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  member_id uuid not null references public.profiles (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (event_id, member_id)
);
alter table public.event_reviews enable row level security;
create policy "event reviews own" on public.event_reviews for all using (member_id = auth.uid() or public.is_admin()) with check (member_id = auth.uid());

-- Editable notification texts (email, WhatsApp and in-app) per event type
create table if not exists public.notification_templates (
  key text primary key,
  subject jsonb not null default '{}'::jsonb,
  body jsonb not null default '{}'::jsonb,
  whatsapp_template jsonb not null default '{}'::jsonb,
  email_enabled boolean not null default true,
  whatsapp_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.notification_templates enable row level security;
create policy "templates admin" on public.notification_templates for all using (public.is_admin()) with check (public.is_admin());

-- Delivery log for email / WhatsApp
create table if not exists public.message_log (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('email', 'whatsapp')),
  template text,
  recipient text not null,
  member_id uuid references public.profiles (id) on delete set null,
  status text not null,
  error text,
  created_at timestamptz not null default now()
);
alter table public.message_log enable row level security;
create policy "message log admin" on public.message_log for select using (public.is_admin());

-- Admin broadcast history
create table if not exists public.broadcasts (
  id uuid primary key default gen_random_uuid(),
  title jsonb not null,
  body jsonb not null,
  channels text[] not null default '{inapp}',
  audience text not null default 'all',
  recipients int not null default 0,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);
alter table public.broadcasts enable row level security;
create policy "broadcasts admin" on public.broadcasts for all using (public.is_admin()) with check (public.is_admin());

-- Admin activity log
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor uuid references public.profiles (id) on delete set null,
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.audit_log enable row level security;
create policy "audit admin" on public.audit_log for all using (public.is_admin()) with check (public.is_admin());

-- Activate approved applicants on first sign-in, now copying the full application
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare a public.applications;
begin
  select * into a from public.applications
   where lower(email) = lower(new.email) and status = 'approved'
   order by reviewed_at desc nulls last limit 1;
  insert into public.profiles (id, email, full_name_ar, full_name_en, phone, headline, company, sector, city,
                               years_experience, linkedin_url, gender, date_of_birth, academic_title, is_manager,
                               mentoring_participated, locale, status)
  values (new.id, new.email,
          coalesce(a.full_name, new.raw_user_meta_data->>'full_name', ''),
          coalesce(a.full_name, new.raw_user_meta_data->>'full_name', ''),
          a.phone, a.headline, a.company, a.sector, a.city, a.years_experience, a.linkedin_url, a.gender, a.date_of_birth,
          a.academic_title, a.is_manager, a.mentoring_participated, coalesce(a.locale, 'ar'),
          case when a.id is not null then 'active'::public.member_status else 'pending'::public.member_status end);
  return new;
end $$;

-- Public stats for "Mashbak Pulse" and the homepage counter
create or replace function public.platform_stats() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'members', (select count(*) from profiles where status = 'active'),
    'events_upcoming', (select count(*) from events where status = 'published' and starts_at > now()),
    'jobs_open', (select count(*) from jobs where is_open and not archived and expires_at > now()),
    'connections', (select count(*) from connections where status = 'accepted'),
    'programs', (select count(*) from programs where is_active)
  );
$$;
grant execute on function public.platform_stats() to anon, authenticated;

-- Private bucket for CVs already exists (cvs). Allow the job poster to read CVs attached to applications on their jobs.
create policy "poster reads applicant cv" on storage.objects for select using (
  bucket_id = 'cvs' and exists (
    select 1 from public.referral_requests r join public.jobs j on j.id = r.job_id
    where j.posted_by = auth.uid() and r.cv_url like '%' || storage.objects.name));

grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage on all sequences in schema public to anon, authenticated;

-- Duplicate-application check usable by anonymous visitors without exposing applications
create or replace function public.application_pending(p_email text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from applications where lower(email) = lower(p_email) and status = 'pending');
$$;
grant execute on function public.application_pending(text) to anon, authenticated;
