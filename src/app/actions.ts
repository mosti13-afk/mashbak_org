"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isLocale, type Locale, type L10n } from "@/i18n/config";
import { repo } from "@/lib/data";
import { DEMO_ADMIN_ID, DEMO_MEMBER_ID } from "@/lib/data/demo-seed";
import { isDemo } from "@/lib/env";
import { siteUrl } from "@/lib/site-url";
import { fromLocalInput } from "@/lib/format";
import { DEMO_COOKIE, requireAdmin, requireMember } from "@/lib/session";
import { supabaseAdmin, supabaseServer } from "@/lib/supabase/server";
import { checkPhoneVerification, startPhoneVerification } from "@/lib/notify";
import { CATEGORIES, CHANNELS, type NotifyPrefs } from "@/lib/notify/prefs";
import type { EventItem, Faq, MemberReview, Program, SiteSettings } from "@/lib/types";
import * as hooks from "@/lib/notify/hooks";

// ---------- helpers ----------
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const opt = (f: FormData, k: string) => str(f, k) || null;
const bool = (f: FormData, k: string) => f.get(k) === "on" || f.get(k) === "true";
const int = (f: FormData, k: string) => (str(f, k) === "" ? null : Number.parseInt(str(f, k), 10));
const loc = (f: FormData): Locale => {
  const l = str(f, "locale");
  return isLocale(l) ? l : "ar";
};
const l10n = (f: FormData, base: string): L10n => ({ ar: str(f, `${base}_ar`), en: str(f, `${base}_en`), he: str(f, `${base}_he`) });
const back = (f: FormData, fallback: string) => {
  const r = str(f, "redirect");
  return r.startsWith("/") ? r : fallback;
};
const list = (s: string) => s.split(/[,،\n]/).map((x) => x.trim()).filter(Boolean);

// ---------- auth ----------
export async function demoLogin(f: FormData) {
  if (!isDemo) return;
  const who = str(f, "as") === "admin" ? DEMO_ADMIN_ID : DEMO_MEMBER_ID;
  (await cookies()).set(DEMO_COOKIE, who, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
  redirect(`/${loc(f)}/${who === DEMO_ADMIN_ID ? "admin" : "app"}`);
}

const LOGIN_COOKIE = "mb_login_email";

/** Step 1: email a 6-digit code (Supabase OTP), only to members or approved applicants. */
export async function sendLoginCode(f: FormData) {
  const locale = loc(f);
  const email = str(f, "email").toLowerCase();
  if (!z.email().safeParse(email).success) redirect(`/${locale}/login?error=email`);
  const s = await supabaseServer();
  const { data: allowed, error: gateErr } = await s.rpc("can_sign_in", { p_email: email });
  if (!gateErr && !allowed) redirect(`/${locale}/login?error=notfound`);
  const { error } = await s.auth.signInWithOtp({
    email, options: { shouldCreateUser: true, emailRedirectTo: `${await siteUrl()}/auth/callback?next=/${locale}/app` },
  });
  if (error) redirect(`/${locale}/login?error=${error.status === 429 ? "rate" : "send"}`);
  (await cookies()).set(LOGIN_COOKIE, email, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 30, secure: process.env.NODE_ENV === "production" });
  redirect(`/${locale}/login?step=code`);
}

/** Step 2: verify the code and start the session. */
export async function verifyLoginCode(f: FormData) {
  const locale = loc(f);
  const email = (await cookies()).get(LOGIN_COOKIE)?.value ?? "";
  const token = str(f, "code").replace(/\D/g, "");
  if (!email) redirect(`/${locale}/login`);
  const s = await supabaseServer();
  const { data, error } = await s.auth.verifyOtp({ email, token, type: "email" });
  if (error || !data.user) redirect(`/${locale}/login?step=code&error=code`);
  (await cookies()).delete(LOGIN_COOKIE);
  const { data: me } = await s.from("profiles").select("role,status").eq("id", data.user.id).maybeSingle();
  redirect(`/${locale}/${me?.role === "admin" ? "admin" : "app"}`);
}

export async function resetLogin(f: FormData) {
  (await cookies()).delete(LOGIN_COOKIE);
  redirect(`/${loc(f)}/login`);
}

/** Google / LinkedIn sign-in through Supabase OAuth (PKCE). */
export async function oauthLogin(f: FormData) {
  const locale = loc(f);
  const provider = str(f, "provider") === "linkedin" ? "linkedin_oidc" : "google";
  const s = await supabaseServer();
  const { data, error } = await s.auth.signInWithOAuth({
    provider, options: { redirectTo: `${await siteUrl()}/auth/callback?next=/${locale}/app`, ...(provider === "google" ? { queryParams: { prompt: "select_account" } } : {}) },
  });
  if (error || !data.url) redirect(`/${locale}/login?error=oauth`);
  redirect(data.url);
}

/** Legacy password login (kept for admins who set a password in Supabase). */
export async function passwordLogin(f: FormData) {
  const locale = loc(f);
  const s = await supabaseServer();
  const { error } = await s.auth.signInWithPassword({ email: str(f, "email"), password: String(f.get("password") ?? "") });
  if (error) redirect(`/${locale}/login?error=1`);
  redirect(`/${locale}/app`);
}

export async function logout(f: FormData) {
  if (isDemo) (await cookies()).delete(DEMO_COOKIE);
  else await (await supabaseServer()).auth.signOut();
  redirect(`/${loc(f)}`);
}

// ---------- public forms ----------
const applicationSchema = z.object({
  full_name: z.string().min(2).max(120),
  email: z.email(),
  phone: z.string().min(7).max(20),
  city: z.string().max(80).nullable(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(["male", "female"]).nullable(),
  academic_title: z.string().max(80).nullable(),
  headline: z.string().min(2).max(120),
  company: z.string().max(120).nullable(),
  sector: z.string().max(80).nullable(),
  years_experience: z.number().int().min(0).max(60),
  is_manager: z.boolean().nullable(),
  mentoring_participated: z.boolean().nullable(),
  linkedin_url: z.string().max(300).nullable(),
  motivation: z.string().max(3000),
  referral_source: z.string().max(120).nullable(),
  age_confirmed: z.literal(true),
});

const YEARS: Record<string, number> = {
  "0-2": 1, "3-5": 4, "6-9": 7, "10-plus": 12,
  "من 0 إلى 2 سنوات": 1, "من 3 إلى 5 سنوات": 4, "من 6 إلى 9 سنوات": 7, "10 سنوات فأكثر": 12,
};
const yesNo = (f: FormData, k: string) => (["yes", "true"].includes(str(f, k)) ? true : ["no", "false"].includes(str(f, k)) ? false : null);
const ageOf = (dob: string) => {
  const d = new Date(`${dob}T00:00:00Z`);
  const n = new Date();
  let a = n.getUTCFullYear() - d.getUTCFullYear();
  if (n.getUTCMonth() < d.getUTCMonth() || (n.getUTCMonth() === d.getUTCMonth() && n.getUTCDate() < d.getUTCDate())) a--;
  return a;
};

export async function submitApplication(f: FormData) {
  const locale = loc(f);
  if (str(f, "website")) redirect(`/${locale}/application?ok=1`); // honeypot: bots fill hidden fields
  const yearsRaw = str(f, "years");
  const years = YEARS[yearsRaw] ?? (Number.isFinite(Number.parseInt(yearsRaw, 10)) ? Number.parseInt(yearsRaw, 10) : -1);
  const dob = str(f, "date_of_birth");
  const gender = str(f, "gender");
  const linkedin = opt(f, "linkedin_url");
  const parsed = applicationSchema.safeParse({
    full_name: str(f, "full_name"), email: str(f, "email").toLowerCase(), phone: str(f, "phone").replace(/[^\d+]/g, ""), city: opt(f, "city"),
    date_of_birth: dob, gender: gender === "male" || gender === "female" ? gender : null, academic_title: opt(f, "academic_title"),
    headline: str(f, "headline"), company: opt(f, "company"), sector: opt(f, "sector"), years_experience: years,
    is_manager: yesNo(f, "is_manager"), mentoring_participated: yesNo(f, "mentoring_participated"),
    linkedin_url: linkedin && !/^https?:\/\//i.test(linkedin) ? `https://${linkedin}` : linkedin,
    motivation: str(f, "motivation"), referral_source: opt(f, "referral_source"),
    age_confirmed: bool(f, "privacy") || bool(f, "age_confirmed"),
  });
  if (!parsed.success) {
    console.warn("[application] invalid", parsed.error.issues.map((i) => i.path.join(".")).join(", "));
    redirect(`/${locale}/application?error=1`);
  }
  if (ageOf(parsed.data.date_of_birth) < 18) redirect(`/${locale}/application?error=age`);
  const input = { ...parsed.data, locale, whatsapp_opt_in: bool(f, "whatsapp_opt_in"), sms_opt_in: bool(f, "sms_opt_in") };
  const res = await repo.createApplication(input);
  if (res === "duplicate") redirect(`/${locale}/application?error=dup`);
  // New values typed into the searchable lists become suggestions for admins to approve
  const known = new Set((await repo.listDropdowns().catch(() => [])).map((d) => `${d.type}:${d.key}`));
  for (const [type, v] of [["CITY", input.city], ["ORGANIZATION", input.company], ["WORK_SECTOR", input.sector]] as const) {
    if (v && !known.has(`${type}:${v}`)) await repo.suggestDropdown(type, v).catch(() => {});
  }
  await hooks.onApplicationSubmitted(input);
  redirect(`/${locale}/application?ok=1`);
}

export async function submitContact(f: FormData) {
  const locale = loc(f);
  const back = str(f, "from") === "home" ? `/${locale}#contact` : `/${locale}/contact`;
  if (str(f, "website")) redirect(`${back}?ok=1`);
  const email = str(f, "email");
  const name = str(f, "name").slice(0, 120);
  const message = str(f, "message").slice(0, 4000);
  if (!name || !z.email().safeParse(email).success || message.length < 2) redirect(`/${locale}/contact?error=1`);
  const m = { name, email, phone: opt(f, "phone"), subject: opt(f, "subject"), message };
  await repo.createContactMessage(m);
  await hooks.onContact({ ...m, locale });
  redirect(`/${locale}/contact?ok=1`);
}

// ---------- member: events ----------
export async function registerEvent(f: FormData) {
  const v = await requireMember(loc(f));
  await repo.registerForEvent(str(f, "event_id"), v.id);
  await hooks.onEventRegistered(str(f, "event_id"), v.id);
  revalidatePath("/", "layout");
  redirect(back(f, `/${loc(f)}/app/events/${str(f, "event_id")}`));
}
export async function cancelEvent(f: FormData) {
  const v = await requireMember(loc(f));
  const head = await hooks.waitlistHead(str(f, "event_id"));
  await repo.cancelRegistration(str(f, "event_id"), v.id);
  await hooks.onEventCancelled(str(f, "event_id"), head === v.id ? null : head);
  revalidatePath("/", "layout");
  redirect(back(f, `/${loc(f)}/app/events/${str(f, "event_id")}`));
}

// ---------- member: connections ----------
export async function requestConnection(f: FormData) {
  const v = await requireMember(loc(f));
  const msg = str(f, "message").slice(0, 600);
  if (msg.length >= 5) {
    await repo.requestConnection(v.id, str(f, "to"), msg);
    await hooks.onConnectionRequested(v.id, str(f, "to"), msg);
  }
  revalidatePath("/", "layout");
  redirect(back(f, `/${loc(f)}/app/members/${str(f, "to")}`));
}
export async function respondConnection(f: FormData) {
  const v = await requireMember(loc(f));
  await repo.respondConnection(str(f, "id"), v.id, str(f, "accept") === "1");
  await hooks.onConnectionResponded(str(f, "id"), v.id, str(f, "accept") === "1");
  revalidatePath("/", "layout");
  redirect(back(f, `/${loc(f)}/app/connections`));
}

// ---------- member: jobs ----------
const jobSchema = z.object({
  title: z.string().min(2).max(140),
  company: z.string().min(1).max(120),
  city: z.string().max(80).nullable(),
  job_type: z.enum(["full_time", "part_time", "contract", "freelance"]),
  work_mode: z.enum(["onsite", "hybrid", "remote"]),
  is_managerial: z.boolean(),
  description: z.string().min(10).max(6000),
  requirements: z.string().max(4000).nullable(),
  apply_url: z.string().max(400).nullable(),
  external_url: z.string().max(600).nullable(),
  location: z.string().max(120).nullable(),
  source: z.enum(["member", "link"]),
});
export async function createJob(f: FormData) {
  const locale = loc(f);
  const v = await requireMember(locale);
  const parsed = jobSchema.safeParse({
    title: str(f, "title"), company: str(f, "company"), city: opt(f, "city"), job_type: str(f, "job_type"), work_mode: str(f, "work_mode"),
    is_managerial: bool(f, "is_managerial"), description: str(f, "description"), requirements: opt(f, "requirements"), apply_url: opt(f, "apply_url"),
    external_url: opt(f, "external_url"), location: opt(f, "location"), source: opt(f, "external_url") ? "link" : "member",
  });
  if (!parsed.success) redirect(`/${locale}/app/jobs/new?error=1`);
  const id = await repo.createJob(v.id, { ...parsed.data, apply_url: parsed.data.apply_url ?? parsed.data.external_url });
  revalidatePath("/", "layout");
  redirect(`/${locale}/app/jobs/${id}?posted=1`);
}
export async function toggleJob(f: FormData) {
  const v = await requireMember(loc(f));
  await repo.setJobOpen(str(f, "id"), v.id, str(f, "open") === "1", v.role === "admin" && bool(f, "as_admin"));
  revalidatePath("/", "layout");
  redirect(back(f, `/${loc(f)}/app/jobs/${str(f, "id")}`));
}
export async function requestReferral(f: FormData) {
  const locale = loc(f);
  const v = await requireMember(locale);
  const msg = str(f, "message").slice(0, 1500);
  const jobId = str(f, "job_id");
  const insider = opt(f, "insider_id");
  if (msg.length < 5) redirect(`/${locale}/app/jobs/${jobId}?error=msg`);
  await repo.requestReferral(jobId, v.id, msg, opt(f, "cv_url") ?? v.cv_url ?? null, insider);
  await hooks.onReferralRequested(jobId, v.id, msg, insider);
  revalidatePath("/", "layout");
  redirect(`/${locale}/app/jobs/${jobId}?asked=1`);
}
export async function respondReferral(f: FormData) {
  const v = await requireMember(loc(f));
  const accept = str(f, "accept") === "1";
  const note = opt(f, "note")?.slice(0, 1200) ?? null;
  await repo.respondReferral(str(f, "id"), v.id, accept, note);
  await hooks.onReferralResponded(str(f, "id"), v.id, accept, note);
  revalidatePath("/", "layout");
  redirect(back(f, `/${loc(f)}/app/requests`));
}
export async function withdrawReferral(f: FormData) {
  const v = await requireMember(loc(f));
  await repo.withdrawReferral(str(f, "id"), v.id);
  revalidatePath("/", "layout");
  redirect(back(f, `/${loc(f)}/app/requests?tab=sent`));
}
export async function setReferralOutcome(f: FormData) {
  const v = await requireMember(loc(f));
  const o = str(f, "outcome");
  if (["interview", "offer", "hired", "no_news", "rejected"].includes(o)) await repo.referralOutcome(str(f, "id"), v.id, o as "hired");
  revalidatePath("/", "layout");
  redirect(back(f, `/${loc(f)}/app/requests?tab=sent`));
}

// ---------- member: companies ----------
const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\u0600-\u06FF\u0590-\u05FF]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || `c-${Date.now()}`;
export async function followCompany(f: FormData) {
  const v = await requireMember(loc(f));
  await repo.followCompany(v.id, str(f, "company_id"), str(f, "on") === "1");
  revalidatePath("/", "layout");
  redirect(back(f, `/${loc(f)}/app/companies`));
}
export async function addCompany(f: FormData) {
  const locale = loc(f);
  const v = await requireMember(locale);
  const name = str(f, "name").slice(0, 120);
  if (name.length < 2) redirect(`/${locale}/app/companies?error=1`);
  const existing = (await repo.listCompanies({ viewerId: v.id, q: name })).find((c) => c.name.toLowerCase() === name.toLowerCase() || c.aliases.includes(name.toLowerCase()));
  if (existing) redirect(`/${locale}/app/companies/${existing.slug}`);
  const website = opt(f, "website");
  const id = await repo.upsertCompany({
    slug: slugify(name), name, website: website && !/^https?:/i.test(website) ? `https://${website}` : website, careers_url: opt(f, "careers_url"),
    sector: opt(f, "sector"), aliases: [name.toLowerCase()], location_filter: "israel", sync_enabled: true,
  }, v.id);
  if (bool(f, "mine")) await repo.updateProfile(v.id, { company: name, company_id: id });
  const c = await repo.getCompany(id);
  if (c?.careers_url) { const { syncCompany } = await import("@/lib/careers/sync"); await syncCompany(c).catch(() => {}); }
  revalidatePath("/", "layout");
  redirect(`/${locale}/app/companies/${c?.slug ?? ""}`);
}

// ---------- member: asks & offers ----------
export async function createAsk(f: FormData) {
  const locale = loc(f);
  const v = await requireMember(locale);
  const title = str(f, "title").slice(0, 140);
  const kind = str(f, "kind") === "offer" ? "offer" : "ask";
  if (title.length < 5) redirect(`/${locale}/app/asks/new?kind=${kind}&error=1`);
  const id = await repo.createAsk(v.id, { kind, title, body: str(f, "body").slice(0, 3000), tags: list(str(f, "tags")).slice(0, 6) });
  revalidatePath("/", "layout");
  redirect(`/${locale}/app/asks/${id}`);
}
export async function closeAsk(f: FormData) {
  const v = await requireMember(loc(f));
  await repo.setAskStatus(str(f, "id"), v.id, str(f, "status") === "open" ? "open" : "closed");
  revalidatePath("/", "layout");
  redirect(`/${loc(f)}/app/asks/${str(f, "id")}`);
}
export async function replyAsk(f: FormData) {
  const v = await requireMember(loc(f));
  const msg = str(f, "message").slice(0, 1500);
  if (msg.length >= 2) {
    await repo.replyAsk(str(f, "ask_id"), v.id, msg);
    await hooks.onAskReply(str(f, "ask_id"), v.id, msg);
  }
  revalidatePath("/", "layout");
  redirect(`/${loc(f)}/app/asks/${str(f, "ask_id")}?replied=1`);
}

// ---------- admin: companies ----------
export async function saveCompany(f: FormData) {
  const locale = loc(f);
  const v = await requireAdmin(locale);
  const name = str(f, "name");
  await repo.upsertCompany({
    id: opt(f, "id") ?? undefined, slug: str(f, "slug") || slugify(name), name, name_ar: opt(f, "name_ar"), name_he: opt(f, "name_he"),
    aliases: [name, str(f, "name_ar"), str(f, "name_he"), ...list(str(f, "aliases"))].filter(Boolean), logo_url: opt(f, "logo_url"), website: opt(f, "website"),
    sector: opt(f, "sector"), careers_url: opt(f, "careers_url"), location_filter: str(f, "location_filter") === "all" ? "all" : "israel", sync_enabled: bool(f, "sync_enabled"),
  }, v.id);
  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/companies?saved=1`);
}
export async function deleteCompany(f: FormData) {
  await requireAdmin(loc(f));
  await repo.deleteCompany(str(f, "id"));
  revalidatePath("/", "layout");
  redirect(`/${loc(f)}/admin/companies`);
}
export async function syncCompanyNow(f: FormData) {
  const locale = loc(f);
  await requireAdmin(locale);
  const c = await repo.getCompany(str(f, "id"));
  const { syncCompany } = await import("@/lib/careers/sync");
  const r = c ? await syncCompany(c) : { ok: false, total: 0, added: 0, error: "not found" };
  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/companies?synced=${encodeURIComponent(c?.name ?? "")}&n=${r.total}&new=${r.added}${r.ok ? "" : `&err=${encodeURIComponent(r.error ?? "")}`}#${c?.slug ?? ""}`);
}

// ---------- member: notifications & profile ----------
export async function markNotificationsRead(f: FormData) {
  const v = await requireMember(loc(f));
  await repo.markAllRead(v.id);
  revalidatePath("/", "layout");
  redirect(`/${loc(f)}/app/notifications`);
}
export async function saveProfile(f: FormData) {
  const locale = loc(f);
  const v = await requireMember(locale);
  const phone = str(f, "phone").replace(/[^\d+]/g, "");
  const companyText = opt(f, "company");
  const t = companyText?.toLowerCase();
  const match = t ? (await repo.listCompanies({ viewerId: v.id, q: companyText! })).find((c) => c.name.toLowerCase() === t || c.aliases.includes(t) || c.name_ar?.toLowerCase() === t || c.name_he?.toLowerCase() === t) : undefined;
  await repo.updateProfile(v.id, {
    full_name_ar: str(f, "full_name_ar").slice(0, 120), full_name_en: str(f, "full_name_en").slice(0, 120),
    headline: opt(f, "headline"), company: match?.name ?? companyText, sector: opt(f, "sector"), city: opt(f, "city"),
    years_experience: int(f, "years_experience"), linkedin_url: opt(f, "linkedin_url"), avatar_url: opt(f, "avatar_url"),
    phone: phone || null, bio: opt(f, "bio"), career_goals: list(str(f, "career_goals")), interests: list(str(f, "interests")),
    open_to_mentoring: bool(f, "open_to_mentoring"), show_phone_to_connections: bool(f, "show_phone_to_connections"),
    company_id: match?.id ?? null, open_to_referrals: bool(f, "open_to_referrals"), open_to_chats: bool(f, "open_to_chats"),
    help_offers: list(str(f, "help_offers")).slice(0, 8), cv_url: opt(f, "cv_url"),
  });
  revalidatePath("/", "layout");
  redirect(`/${locale}/app/profile?saved=1`);
}

// ---------- member: notification channels ----------
const NOTIF = (l: Locale) => `/${l}/app/account/notifications`;
export async function saveNotificationPrefs(f: FormData) {
  const locale = loc(f);
  const v = await requireMember(locale);
  const prefs: NotifyPrefs = {};
  for (const c of CATEGORIES) prefs[c] = Object.fromEntries(CHANNELS.map((ch) => [ch, bool(f, `${c}.${ch}`)]));
  await repo.updateProfile(v.id, {
    notify_prefs: prefs, notify_email: bool(f, "notify_email"), notify_whatsapp: bool(f, "notify_whatsapp"),
    notify_sms: bool(f, "notify_sms") && !!v.phone_verified_at,
  });
  revalidatePath("/", "layout");
  redirect(`${NOTIF(locale)}?saved=1`);
}
const VERIFY_COOKIE = "mb_phone_verify";
const SIM_COOKIE = "mb_phone_sim";
export async function startPhoneVerify(f: FormData) {
  const locale = loc(f);
  await requireMember(locale);
  const phone = str(f, "phone").replace(/[^\d+]/g, "");
  const channel = str(f, "channel") === "sms" ? "sms" : "whatsapp";
  const r = await startPhoneVerification(phone, channel);
  if (!r.ok) redirect(`${NOTIF(locale)}?verify=invalid`);
  const jar = await cookies();
  const opts = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", maxAge: 600, path: "/" };
  jar.set(VERIFY_COOKIE, JSON.stringify({ token: r.token, phone, channel }), opts);
  if (r.provider === "simulated") jar.set(SIM_COOKIE, r.code, opts); else jar.delete(SIM_COOKIE);
  redirect(`${NOTIF(locale)}?verify=code`);
}
export async function confirmPhoneVerify(f: FormData) {
  const locale = loc(f);
  const v = await requireMember(locale);
  const jar = await cookies();
  let pending: { token: string; phone: string } | null = null;
  try { pending = JSON.parse(jar.get(VERIFY_COOKIE)?.value ?? "null"); } catch { pending = null; }
  if (!pending) redirect(`${NOTIF(locale)}?verify=expired`);
  const ok = await checkPhoneVerification(pending.token, str(f, "code"));
  if (!ok) redirect(`${NOTIF(locale)}?verify=bad`);
  const patch = { phone: pending.phone, phone_verified_at: new Date().toISOString() };
  const admin = isDemo ? null : supabaseAdmin();
  if (admin) await admin.from("profiles").update(patch).eq("id", v.id);
  else await repo.updateProfile(v.id, patch);
  jar.delete(VERIFY_COOKIE); jar.delete(SIM_COOKIE);
  revalidatePath("/", "layout");
  redirect(`${NOTIF(locale)}?verify=done`);
}
export async function cancelPhoneVerify(f: FormData) {
  const jar = await cookies();
  jar.delete(VERIFY_COOKIE); jar.delete(SIM_COOKIE);
  redirect(NOTIF(loc(f)));
}

// ---------- admin ----------
export async function reviewApplication(f: FormData) {
  await requireAdmin(loc(f));
  const status = str(f, "status") as "approved" | "rejected" | "pending";
  const reason = opt(f, "reject_reason");
  const before = await repo.getApplication(str(f, "id"));
  const app = await repo.reviewApplication(str(f, "id"), status, opt(f, "note"), reason);
  if (before?.status !== status && str(f, "silent") !== "1") await hooks.onApplicationReviewed(app, status, reason);
  revalidatePath("/", "layout");
  redirect(back(f, `/${loc(f)}/admin/applications`));
}
export async function adminUpdateMember(f: FormData) {
  const v = await requireAdmin(loc(f));
  const id = str(f, "id");
  const patch: { role?: "admin" | "member"; status?: "active" | "suspended" } = {};
  if (f.has("role") && id !== v.id) patch.role = str(f, "role") === "admin" ? "admin" : "member";
  if (f.has("status") && id !== v.id) patch.status = str(f, "status") === "suspended" ? "suspended" : "active";
  await repo.adminUpdateMember(id, patch);
  revalidatePath("/", "layout");
  redirect(back(f, `/${loc(f)}/admin/members`));
}
export async function saveEvent(f: FormData) {
  const locale = loc(f);
  await requireAdmin(locale);
  const e: EventItem = {
    id: str(f, "id"), title: l10n(f, "title"), description: l10n(f, "description"), location: l10n(f, "location"),
    cover_url: opt(f, "cover_url"), is_online: bool(f, "is_online"), online_url: opt(f, "online_url"),
    starts_at: fromLocalInput(str(f, "starts_at")), ends_at: fromLocalInput(str(f, "ends_at")), capacity: int(f, "capacity"),
    status: (str(f, "status") || "published") as EventItem["status"], members_only: bool(f, "members_only"), created_at: "",
  };
  if (Date.parse(e.ends_at) < Date.parse(e.starts_at)) e.ends_at = e.starts_at;
  const id = await repo.upsertEvent(e);
  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/events/${id}`);
}
export async function deleteEvent(f: FormData) {
  await requireAdmin(loc(f));
  await repo.deleteEvent(str(f, "id"));
  revalidatePath("/", "layout");
  redirect(`/${loc(f)}/admin/events`);
}
export async function checkinTicket(f: FormData) {
  const locale = loc(f);
  await requireAdmin(locale);
  const eventId = str(f, "event_id");
  const code = str(f, "code").split("/").pop() ?? "";
  const r = await repo.checkin(eventId, code);
  revalidatePath("/", "layout");
  const q = r.ok ? `result=${r.already ? "dup" : "ok"}&name=${encodeURIComponent(r.name)}` : "result=bad";
  redirect(`/${locale}/admin/events/${eventId}?${q}`);
}
export async function adminDeleteJob(f: FormData) {
  await requireAdmin(loc(f));
  await repo.deleteJob(str(f, "id"));
  revalidatePath("/", "layout");
  redirect(`/${loc(f)}/admin/jobs`);
}
export async function saveReview(f: FormData) {
  await requireAdmin(loc(f));
  const r: MemberReview = {
    id: str(f, "id"), name: l10n(f, "name"), role_title: l10n(f, "role"), organization: opt(f, "organization"),
    photo_url: opt(f, "photo_url"), quote: l10n(f, "quote"), sort_order: int(f, "sort_order") ?? 0, is_active: bool(f, "is_active"), created_at: "",
  };
  await repo.upsertReview(r);
  revalidatePath("/", "layout");
  redirect(`/${loc(f)}/admin/reviews`);
}
export async function deleteReview(f: FormData) {
  await requireAdmin(loc(f));
  await repo.deleteReview(str(f, "id"));
  revalidatePath("/", "layout");
  redirect(`/${loc(f)}/admin/reviews`);
}
export async function saveFaq(f: FormData) {
  await requireAdmin(loc(f));
  const q: Faq = { id: str(f, "id"), question: l10n(f, "question"), answer: l10n(f, "answer"), sort_order: int(f, "sort_order") ?? 0, is_active: bool(f, "is_active") };
  await repo.upsertFaq(q);
  revalidatePath("/", "layout");
  redirect(`/${loc(f)}/admin/faqs`);
}
export async function deleteFaq(f: FormData) {
  await requireAdmin(loc(f));
  await repo.deleteFaq(str(f, "id"));
  revalidatePath("/", "layout");
  redirect(`/${loc(f)}/admin/faqs`);
}
export async function saveProgram(f: FormData) {
  await requireAdmin(loc(f));
  const benefits = [0, 1, 2, 3, 4].map((i) => l10n(f, `benefit${i}`)).filter((b) => b.ar || b.en || b.he);
  const p: Program = {
    id: str(f, "id"), slug: str(f, "slug").toLowerCase().replace(/[^a-z0-9-]/g, "-"), title: l10n(f, "title"), summary: l10n(f, "summary"),
    body: l10n(f, "body"), benefits,
    target_audience: [0, 1, 2, 3, 4].map((i) => l10n(f, `aud${i}`)).filter((b) => b.ar || b.en || b.he),
    sessions_count: int(f, "sessions_count"), duration_months: int(f, "duration_months"),
    image_url: str(f, "image_url") || null, icon_url: str(f, "icon_url") || null,
    color: str(f, "color") || "#117286", icon: str(f, "icon") || "network", sort_order: int(f, "sort_order") ?? 0, is_active: bool(f, "is_active"),
  };
  await repo.upsertProgram(p);
  revalidatePath("/", "layout");
  redirect(`/${loc(f)}/admin/programs`);
}
export async function deleteProgram(f: FormData) {
  await requireAdmin(loc(f));
  await repo.deleteProgram(str(f, "id"));
  revalidatePath("/", "layout");
  redirect(`/${loc(f)}/admin/programs`);
}
export async function saveSettingJson(f: FormData) {
  const locale = loc(f);
  await requireAdmin(locale);
  const key = str(f, "key");
  let value: unknown;
  try { value = JSON.parse(String(f.get("value") ?? "")); } catch { redirect(`/${locale}/admin/settings?error=1&key=${key}#${key}`); }
  if (!/^[A-Z_]+$/.test(key)) redirect(`/${locale}/admin/settings?error=1`);
  await repo.saveSettings({ [key]: value } as Partial<SiteSettings>);
  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/settings?saved=1&key=${key}#${key}`);
}
export async function resetSetting(f: FormData) {
  const locale = loc(f);
  await requireAdmin(locale);
  const { defaultSettings } = await import("@/lib/content");
  const key = str(f, "key");
  if (key in defaultSettings) await repo.saveSettings({ [key]: defaultSettings[key] } as Partial<SiteSettings>);
  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/settings?saved=1&key=${key}#${key}`);
}
export async function seedDefaults(f: FormData) {
  await requireAdmin(loc(f));
  await repo.seedDefaults();
  revalidatePath("/", "layout");
  redirect(`/${loc(f)}/admin`);
}
export async function markMessageReplied(f: FormData) {
  await requireAdmin(loc(f));
  await repo.markMessageReplied(str(f, "id"));
  revalidatePath("/", "layout");
  redirect(`/${loc(f)}/admin/messages`);
}

// ---------- admin: notifications ----------
export async function sendTestEmail(f: FormData) {
  const v = await requireAdmin(loc(f));
  const { notify } = await import("@/lib/notify");
  const to = str(f, "to") || v.email;
  await notify((str(f, "template") || "application_approved") as "application_approved", { email: to, phone: opt(f, "phone"), name: displayNameOf(v, loc(f)), locale: str(f, "lang") || loc(f) }, {
    reason: "Example reason", from: "Lina Mansour", message: "Example message", job: "Product Manager", event: "Mashbak meetup", when: "Thursday 18:00", where: "Haifa", soon: "tomorrow",
    title: "Example", applicant: "Example applicant", headline: "Engineer", company: "Example", years: 5, email: to, phone: "+972500000000", subject: "Example", status: "Example status",
  });
  redirect(`/${loc(f)}/admin/notifications?tested=1`);
}

const displayNameOf = (p: { full_name_ar?: string | null; full_name_en?: string | null }, l: string) => (l === "en" ? p.full_name_en || p.full_name_ar : p.full_name_ar || p.full_name_en) ?? "";

export async function sendBroadcast(f: FormData) {
  const locale = loc(f);
  const v = await requireAdmin(locale);
  const title = str(f, "title").slice(0, 140);
  const message = str(f, "message").slice(0, 3000);
  if (title.length < 2 || message.length < 2) redirect(`/${locale}/admin/notifications?error=1`);
  const audience = str(f, "audience") || "all";
  const members = (await repo.listAllMembers()).filter((m) => m.status === "active" && (audience === "all" || (audience === "mentors" && m.open_to_mentoring) || m.sector === audience));
  const ids = members.map((m) => m.id);
  const channels = ["inapp", ...(bool(f, "email") ? ["email"] : []), ...(bool(f, "whatsapp") ? ["whatsapp"] : [])];
  await repo.addNotifications(ids, "system", { ar: title, en: title, he: title }, { ar: message, en: message, he: message }, opt(f, "link"));
  if (bool(f, "email") || bool(f, "whatsapp")) await hooks.broadcast({ memberIds: ids, title, message, email: bool(f, "email"), whatsapp: bool(f, "whatsapp") });
  const { recordBroadcast } = await import("@/lib/notify/store");
  await recordBroadcast({ title, body: message, channels, audience, recipients: ids.length, created_by: v.id });
  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/notifications?sent=${ids.length}`);
}

export async function saveNotificationTemplate(f: FormData) {
  await requireAdmin(loc(f));
  const { saveTemplateRow } = await import("@/lib/notify/store");
  await saveTemplateRow({
    key: str(f, "key"), subject: l10n(f, "subject"), body: l10n(f, "body"),
    whatsapp_template: { name: str(f, "wa_name") || undefined, lang: str(f, "wa_lang") || undefined },
    email_enabled: bool(f, "email_enabled"), whatsapp_enabled: bool(f, "whatsapp_enabled"),
  });
  redirect(`/${loc(f)}/admin/notifications?tab=templates&saved=1#${str(f, "key")}`);
}

export async function replyToMessage(f: FormData) {
  const locale = loc(f);
  await requireAdmin(locale);
  const msgs = await repo.listMessages();
  const m = msgs.find((x) => x.id === str(f, "id"));
  const body = str(f, "reply").slice(0, 5000);
  if (m && body.length > 1) {
    const { notify } = await import("@/lib/notify");
    await notify("contact_reply", { email: m.email, name: m.name, locale: str(f, "lang") || locale }, { message: body });
    await repo.markMessageReplied(m.id);
  }
  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/messages?replied=1`);
}

// ---------- admin: dropdown lists ----------
export async function saveDropdown(f: FormData) {
  await requireAdmin(loc(f));
  const type = str(f, "type");
  const keys = str(f, "keys") ? str(f, "keys").split(/\n/).map((x) => x.trim()).filter(Boolean) : [str(f, "key")].filter(Boolean);
  const id = int(f, "id");
  if (id) {
    await repo.upsertDropdown({ id, type, key: str(f, "key"), label: l10n(f, "label"), sort_order: int(f, "sort_order") ?? 0, is_active: bool(f, "is_active"), status: "approved" });
  } else {
    let order = int(f, "sort_order") ?? 0;
    for (const key of keys.slice(0, 500)) await repo.upsertDropdown({ type, key, label: {}, sort_order: order++, is_active: true, status: "approved" });
  }
  revalidatePath("/", "layout");
  redirect(`/${loc(f)}/admin/dropdowns?type=${encodeURIComponent(type)}`);
}
export async function approveDropdown(f: FormData) {
  await requireAdmin(loc(f));
  await repo.upsertDropdown({ id: int(f, "id")!, type: str(f, "type"), key: str(f, "key"), is_active: str(f, "approve") === "1", status: "approved" });
  if (str(f, "approve") !== "1") await repo.deleteDropdown(int(f, "id")!);
  revalidatePath("/", "layout");
  redirect(`/${loc(f)}/admin/dropdowns?type=${encodeURIComponent(str(f, "type"))}`);
}
export async function removeDropdown(f: FormData) {
  await requireAdmin(loc(f));
  await repo.deleteDropdown(int(f, "id")!);
  revalidatePath("/", "layout");
  redirect(`/${loc(f)}/admin/dropdowns?type=${encodeURIComponent(str(f, "type"))}`);
}
