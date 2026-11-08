-- Mashbak v2: sign-in gate. Email codes are only sent to people who are members or whose application was approved,
-- so strangers cannot create accounts by typing any email.
create or replace function public.can_sign_in(p_email text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where lower(email) = lower(p_email) and status <> 'suspended')
      or exists (select 1 from applications where lower(email) = lower(p_email) and status = 'approved');
$$;
grant execute on function public.can_sign_in(text) to anon, authenticated;

-- Members can turn email / WhatsApp notifications on or off and keep their questionnaire answers
-- (already covered by the self-update policy; status and role stay protected by the trigger in 0001).
