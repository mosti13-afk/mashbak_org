# Mashbak v2 — mashbak.org

A full rebuild of [mashbak.org](https://mashbak.org): public website, member app and admin dashboard, in Arabic, English and Hebrew (RTL-first).

**Stack:** Next.js 15 (App Router, server actions) · TypeScript · Tailwind CSS v4 · Supabase (Postgres, Auth, Storage, RLS)

## What's inside

| Area | Routes | Highlights |
|---|---|---|
| Public site | `/[locale]`, `/about`, `/programs`, `/programs/[slug]`, `/events`, `/events/[id]`, `/faq`, `/contact`, `/apply`, `/login`, `/privacy` | Floating member constellation hero (6 faces from admin settings), testimonials, programs, public events, membership application (18+ confirmation) |
| Member app | `/[locale]/app/…` | Dashboard, member directory with search/filters, connection requests → WhatsApp once accepted, jobs (published instantly, no approval), referral requests that go to the job poster, events with RSVP + automatic waitlist + QR ticket, notifications, profile |
| Admin | `/[locale]/admin/…` | Overview stats, application review (approve → member activated/invited), members (suspend, roles), events (create/edit, attendees CSV, QR check-in), jobs moderation, testimonials, programs, FAQs, site settings (hero copy, floating avatars, homepage numbers, contact), contact messages |

Locales: `ar` (default), `en`, `he`. The middleware redirects `/` based on the saved choice or the browser language.

## Running locally

```bash
npm install
cp .env.example .env.local   # leave Supabase empty for demo mode
npm run dev
```

**Demo mode** (no Supabase env vars): everything runs on an in-memory seed. On `/login` you can enter as a demo member or demo admin. Data resets when the server restarts.

## Connecting Supabase

1. In the Supabase SQL editor, run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql` (default programs, FAQs, testimonials and settings).
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API).
3. Optional: `SUPABASE_SERVICE_ROLE_KEY` so approving an application emails an invite. Without it, approved applicants activate automatically the first time they sign in with the same email (magic link on `/login`).
4. Auth → URL configuration: add `https://<your-domain>/auth/callback` to redirect URLs.
5. Make yourself admin: sign in once, then run
   `update public.profiles set role = 'admin', status = 'active' where email = 'you@example.com';`

Regenerate the seed after editing `src/lib/content.ts`: `node --experimental-strip-types scripts/gen-seed.ts`.

## Rules encoded in the database

- Membership is by application; applicants must confirm they are 18+.
- Members can't change their own role or status (RLS).
- Phone numbers are only revealed to accepted connections who opted in (`connection_phone()`).
- RSVP uses `register_for_event()` — capacity is enforced and extra sign-ups go to a waitlist; cancelling promotes the next person and notifies them.
- Notifications are created by triggers for connection requests/acceptances and referral requests/acceptances.

## Project layout

```
src/app/[locale]/(site)   public pages
src/app/[locale]/app      member app
src/app/[locale]/admin    admin dashboard
src/app/actions.ts        all server actions (validated with zod)
src/lib/data              repository interface + demo and Supabase implementations
src/i18n                  dictionaries (ar/en/he)
supabase/                 schema, RLS, functions, seed
```
