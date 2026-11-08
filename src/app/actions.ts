"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isLocale, type Locale, type L10n } from "@/i18n/config";
import { repo } from "@/lib/data";
import { DEMO_ADMIN_ID, DEMO_MEMBER_ID } from "@/lib/data/demo-seed";
import { isDemo, SITE_URL } from "@/lib/env";
import { fromLocalInput } from "@/lib/format";
import { DEMO_COOKIE, requireAdmin, requireMember } from "@/lib/session";
import { supabaseServer } from "@/lib/supabase/server";
import type { EventItem, Faq, MemberReview, Program, SiteSettings } from "@/lib/types";

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

export async function passwordLogin(f: FormData) {
  const locale = loc(f);
  const s = await supabaseServer();
  const { error } = await s.auth.signInWithPassword({ email: str(f, "email"), password: String(f.get("password") ?? "") });
  if (error) redirect(`/${locale}/login?error=1`);
  redirect(`/${locale}/app`);
}

export async function magicLink(f: FormData) {
  const locale = loc(f);
  const s = await supabaseServer();
  await s.auth.signInWithOtp({ email: str(f, "email"), options: { emailRedirectTo: `${SITE_URL}/auth/callback?next=/${locale}/app` } });
  redirect(`/${locale}/login?sent=1`);
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
  headline: z.string().min(2).max(120),
  company: z.string().max(120).nullable(),
  sector: z.string().max(80).nullable(),
  years_experience: z.number().int().min(0).max(60),
  linkedin_url: z.string().max(300).nullable(),
  motivation: z.string().min(10).max(3000),
  referral_source: z.string().max(120).nullable(),
  age_confirmed: z.literal(true),
});

export async function submitApplication(f: FormData) {
  const locale = loc(f);
  const parsed = applicationSchema.safeParse({
    full_name: str(f, "full_name"), email: str(f, "email"), phone: str(f, "phone"), city: opt(f, "city"),
    headline: str(f, "headline"), company: opt(f, "company"), sector: opt(f, "sector"), years_experience: int(f, "years_experience") ?? -1,
    linkedin_url: opt(f, "linkedin_url"), motivation: str(f, "motivation"), referral_source: opt(f, "referral_source"),
    age_confirmed: bool(f, "age_confirmed"),
  });
  if (!parsed.success) redirect(`/${locale}/apply?error=1`);
  await repo.createApplication(parsed.data);
  redirect(`/${locale}/apply?ok=1`);
}

export async function submitContact(f: FormData) {
  const locale = loc(f);
  const email = str(f, "email");
  if (!str(f, "name") || !z.email().safeParse(email).success || str(f, "message").length < 2) redirect(`/${locale}/contact?error=1`);
  await repo.createContactMessage({ name: str(f, "name"), email, phone: opt(f, "phone"), subject: opt(f, "subject"), message: str(f, "message") });
  redirect(`/${locale}/contact?ok=1`);
}

// ---------- member: events ----------
export async function registerEvent(f: FormData) {
  const v = await requireMember(loc(f));
  await repo.registerForEvent(str(f, "event_id"), v.id);
  revalidatePath("/", "layout");
  redirect(back(f, `/${loc(f)}/app/events/${str(f, "event_id")}`));
}
export async function cancelEvent(f: FormData) {
  const v = await requireMember(loc(f));
  await repo.cancelRegistration(str(f, "event_id"), v.id);
  revalidatePath("/", "layout");
  redirect(back(f, `/${loc(f)}/app/events/${str(f, "event_id")}`));
}

// ---------- member: connections ----------
export async function requestConnection(f: FormData) {
  const v = await requireMember(loc(f));
  const msg = str(f, "message").slice(0, 600);
  if (msg.length >= 5) await repo.requestConnection(v.id, str(f, "to"), msg);
  revalidatePath("/", "layout");
  redirect(back(f, `/${loc(f)}/app/members/${str(f, "to")}`));
}
export async function respondConnection(f: FormData) {
  const v = await requireMember(loc(f));
  await repo.respondConnection(str(f, "id"), v.id, str(f, "accept") === "1");
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
});
export async function createJob(f: FormData) {
  const locale = loc(f);
  const v = await requireMember(locale);
  const parsed = jobSchema.safeParse({
    title: str(f, "title"), company: str(f, "company"), city: opt(f, "city"), job_type: str(f, "job_type"), work_mode: str(f, "work_mode"),
    is_managerial: bool(f, "is_managerial"), description: str(f, "description"), requirements: opt(f, "requirements"), apply_url: opt(f, "apply_url"),
  });
  if (!parsed.success) redirect(`/${locale}/app/jobs/new?error=1`);
  const id = await repo.createJob(v.id, parsed.data);
  revalidatePath("/", "layout");
  redirect(`/${locale}/app/jobs/${id}`);
}
export async function toggleJob(f: FormData) {
  const v = await requireMember(loc(f));
  await repo.setJobOpen(str(f, "id"), v.id, str(f, "open") === "1", v.role === "admin" && bool(f, "as_admin"));
  revalidatePath("/", "layout");
  redirect(back(f, `/${loc(f)}/app/jobs/${str(f, "id")}`));
}
export async function requestReferral(f: FormData) {
  const v = await requireMember(loc(f));
  const msg = str(f, "message").slice(0, 1500);
  if (msg.length >= 5) await repo.requestReferral(str(f, "job_id"), v.id, msg, opt(f, "cv_url"));
  revalidatePath("/", "layout");
  redirect(`/${loc(f)}/app/jobs/${str(f, "job_id")}`);
}
export async function respondReferral(f: FormData) {
  const v = await requireMember(loc(f));
  await repo.respondReferral(str(f, "id"), v.id, str(f, "accept") === "1");
  revalidatePath("/", "layout");
  redirect(`/${loc(f)}/app/jobs/${str(f, "job_id")}`);
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
  await repo.updateProfile(v.id, {
    full_name_ar: str(f, "full_name_ar").slice(0, 120), full_name_en: str(f, "full_name_en").slice(0, 120),
    headline: opt(f, "headline"), company: opt(f, "company"), sector: opt(f, "sector"), city: opt(f, "city"),
    years_experience: int(f, "years_experience"), linkedin_url: opt(f, "linkedin_url"), avatar_url: opt(f, "avatar_url"),
    phone: phone || null, bio: opt(f, "bio"), career_goals: list(str(f, "career_goals")), interests: list(str(f, "interests")),
    open_to_mentoring: bool(f, "open_to_mentoring"), show_phone_to_connections: bool(f, "show_phone_to_connections"),
  });
  revalidatePath("/", "layout");
  redirect(`/${locale}/app/profile?saved=1`);
}

// ---------- admin ----------
export async function reviewApplication(f: FormData) {
  await requireAdmin(loc(f));
  const status = str(f, "status") as "approved" | "rejected" | "pending";
  await repo.reviewApplication(str(f, "id"), status, opt(f, "note"));
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
    body: l10n(f, "body"), for_who: l10n(f, "for_who"), duration: l10n(f, "duration"), sessions: l10n(f, "sessions"), benefits,
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
export async function saveSettings(f: FormData) {
  await requireAdmin(loc(f));
  const patch: Partial<SiteSettings> = {
    hero: { eyebrow: l10n(f, "eyebrow"), title: l10n(f, "title"), highlight: l10n(f, "highlight"), sub: l10n(f, "sub") },
    floatingAvatars: [0, 1, 2, 3, 4, 5].map((i) => str(f, `avatar${i}`)).filter(Boolean),
    stats: { members: int(f, "stat_members") ?? 0, companies: int(f, "stat_companies") ?? 0, events: int(f, "stat_events") ?? 0 },
    contact: { email: str(f, "contact_email"), whatsapp: str(f, "contact_whatsapp"), instagram: str(f, "contact_instagram"), linkedin: str(f, "contact_linkedin") },
  };
  await repo.saveSettings(patch);
  revalidatePath("/", "layout");
  redirect(`/${loc(f)}/admin/settings?saved=1`);
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
