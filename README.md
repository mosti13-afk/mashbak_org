# Mashbak v2, mashbak.org

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

1. In the Supabase SQL editor, run the files in `supabase/migrations/` in order (`0001_init.sql`, `0002_live_parity.sql`, `0003_auth.sql`).
2. Public URL and anon key are baked into the Dockerfile (they are public by design).
3. Sign in once, make yourself admin, then press **Install defaults** on the admin overview to load programs, FAQs, testimonials, settings and dropdown lists:
   `update public.profiles set role = 'admin', status = 'active' where email = 'you@example.com';`

### Supabase Auth settings

- **URL configuration**: Site URL `https://mashbak.org`; redirect URLs `https://mashbak.org/auth/callback` and the Cloud Run URL `/auth/callback`.
- **Email sign-in with a 6-digit code**: Authentication → Email Templates → *Magic Link*: put `{{ .Token }}` in the body (the login page asks for the code, not a link). Example body:
  `<h2>رمز الدخول إلى مشبك / Your Mashbak code</h2><p style="font-size:28px;letter-spacing:6px"><b>{{ .Token }}</b></p>`
- **Send auth emails from info@mashbak.org**: Authentication → SMTP settings → enable custom SMTP with the same mailbox as below.
- **Google**: Authentication → Providers → Google, paste the OAuth client ID/secret from Google Cloud (authorized redirect URI = `https://<project>.supabase.co/auth/v1/callback`).
- **LinkedIn**: Authentication → Providers → LinkedIn (OIDC), paste the client ID/secret from the LinkedIn developer app (product "Sign In with LinkedIn using OpenID Connect", same redirect URI).

## Server secrets (Cloud Run → Edit → Variables & secrets)

| Variable | What it is |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://mashbak.org` (used in email links) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API. Needed for notifications to look up members, the delivery log and reminders |
| `SMTP_HOST` / `SMTP_PORT` | Defaults `smtp.gmail.com` / `465` (Google Workspace). Change for another provider |
| `SMTP_USER` / `SMTP_PASS` | `info@mashbak.org` and its app password |
| `EMAIL_FROM` | Optional, default `Mashbak \| مشبك <info@mashbak.org>` |
| `ADMIN_EMAILS` | Who gets "new application / new message" alerts, comma separated. Default `info@mashbak.org` |
| `WHATSAPP_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` | Meta WhatsApp Cloud API. Templates to create: see `WHATSAPP_TEMPLATES.md` |
| `ANTHROPIC_API_KEY` | Turns on the Mashbakni assistant. Optional `ANTHROPIC_MODEL` (default `claude-sonnet-5-5`) |
| `CRON_SECRET` | Any long random string. Cloud Scheduler calls `GET /api/cron/reminders` every 15 minutes with `Authorization: Bearer <CRON_SECRET>` for 24h / 2h event reminders |

Everything is optional: without a channel configured, the platform keeps working and the delivery log shows "skipped".

## Rules encoded in the database

- Membership is by application; applicants must confirm they are 18+.
- Members can't change their own role or status (RLS).
- Phone numbers are only revealed to accepted connections who opted in (`connection_phone()`).
- RSVP uses `register_for_event()`, capacity is enforced and extra sign-ups go to a waitlist; cancelling promotes the next person and notifies them.
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
