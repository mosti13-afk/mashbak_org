-- Mashbak V2: notification channels (email, WhatsApp, SMS), per-category preferences, phone verification,
-- channel choice at registration, and message bodies in the delivery log (used for simulated sends and previews).

alter table public.profiles add column if not exists notify_sms boolean not null default false;
alter table public.profiles add column if not exists notify_prefs jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists phone_verified_at timestamptz;

alter table public.applications add column if not exists whatsapp_opt_in boolean not null default true;
alter table public.applications add column if not exists sms_opt_in boolean not null default false;

alter table public.message_log drop constraint if exists message_log_channel_check;
alter table public.message_log add constraint message_log_channel_check check (channel in ('email', 'whatsapp', 'sms'));
alter table public.message_log add column if not exists body text;
alter table public.message_log add column if not exists provider text;

-- Members may not mark their own phone as verified: only the server (service role) sets it.
create or replace function public.protect_phone_verified() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.phone_verified_at is distinct from old.phone_verified_at and auth.uid() is not null and not public.is_admin() then
    new.phone_verified_at := old.phone_verified_at;
  end if;
  -- changing the phone number clears its verification
  if new.phone is distinct from old.phone and new.phone_verified_at is not distinct from old.phone_verified_at then
    new.phone_verified_at := null;
  end if;
  return new;
end $$;
drop trigger if exists profiles_protect_phone_verified on public.profiles;
create trigger profiles_protect_phone_verified before update on public.profiles
  for each row execute function public.protect_phone_verified();

-- Activate approved applicants on first sign-in, carrying over their channel choices
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare a public.applications;
begin
  select * into a from public.applications
   where lower(email) = lower(new.email) and status = 'approved'
   order by reviewed_at desc nulls last limit 1;
  insert into public.profiles (id, email, full_name_ar, full_name_en, phone, headline, company, sector, city,
                               years_experience, linkedin_url, gender, date_of_birth, academic_title, is_manager,
                               mentoring_participated, locale, notify_whatsapp, notify_sms, status)
  values (new.id, new.email,
          coalesce(a.full_name, new.raw_user_meta_data->>'full_name', ''),
          coalesce(a.full_name, new.raw_user_meta_data->>'full_name', ''),
          a.phone, a.headline, a.company, a.sector, a.city, a.years_experience, a.linkedin_url, a.gender, a.date_of_birth,
          a.academic_title, a.is_manager, a.mentoring_participated, coalesce(a.locale, 'ar'),
          coalesce(a.whatsapp_opt_in, true), coalesce(a.sms_opt_in, false),
          case when a.id is not null then 'active'::public.member_status else 'pending'::public.member_status end);
  return new;
end $$;
