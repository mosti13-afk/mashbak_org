import "server-only";
import { tr, type Locale } from "@/i18n/config";
import { repo } from "@/lib/data";
import type { ApplicationInput } from "@/lib/data/repo";
import type { Application, EventItem } from "@/lib/types";
import { supabaseAdmin } from "@/lib/supabase/server";
import { displayName, memberRecipient, notify, notifyAdmins, notifyMember } from "./index";

/* Business events -> notifications. Each hook is safe to await; failures are swallowed and logged. */

const fmtWhen = (iso: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : locale === "he" ? "he-IL" : "en-GB", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jerusalem",
  }).format(new Date(iso));

const where = (e: EventItem, locale: Locale) => (e.is_online ? (locale === "ar" ? "أونلاين" : locale === "he" ? "אונליין" : "Online") : tr(e.location, locale));

export async function onApplicationSubmitted(a: ApplicationInput) {
  await Promise.allSettled([
    notify("application_received", { email: a.email, phone: a.phone, name: a.full_name, locale: a.locale }),
    notifyAdmins("admin_new_application", {
      applicant: a.full_name, headline: a.headline, company: a.company ?? "-", years: a.years_experience, email: a.email, phone: a.phone,
    }),
  ]);
}

export async function onApplicationReviewed(app: Application | null, status: string, reason?: string | null) {
  if (!app || (status !== "approved" && status !== "rejected")) return;
  const to = { email: app.email, phone: app.phone, name: app.full_name, locale: app.locale ?? "ar" };
  if (status === "approved") await notify("application_approved", to);
  else await notify("application_rejected", to, { reason: reason ?? "" });
}

export async function onContact(m: { name: string; email: string; phone: string | null; subject: string | null; message: string; locale: Locale }) {
  await Promise.allSettled([
    notify("contact_received", { email: m.email, name: m.name, locale: m.locale }),
    notifyAdmins("admin_new_contact", { from: m.name, email: m.email, phone: m.phone ?? "-", subject: m.subject ?? "-", message: m.message, replyTo: m.email }),
  ]);
}

export async function onConnectionRequested(fromId: string, toId: string, message: string) {
  const [from, to] = await Promise.all([memberRecipient(fromId), memberRecipient(toId)]);
  if (!to) return;
  const fromName = from ? (await repo.getProfile(fromId).then((p) => (p ? displayName(p, to.locale ?? "ar") : from.name)).catch(() => from.name)) : "";
  await notify("connection_request", to, { from: fromName, message, fromId });
}

export async function onConnectionResponded(connectionId: string, viewerId: string, accept: boolean) {
  if (!accept) return;
  const c = (await repo.listConnections(viewerId)).find((x) => x.id === connectionId);
  if (!c) return;
  const me = await repo.getProfile(viewerId);
  const r = await memberRecipient(c.other.id);
  if (!r || !me) return;
  await notify("connection_accepted", r, { from: displayName(me, r.locale ?? "ar"), fromId: viewerId });
}

export async function onReferralRequested(jobId: string, viewerId: string, message: string) {
  const job = await repo.getJob(jobId, viewerId);
  const me = await repo.getProfile(viewerId);
  if (!job || !me) return;
  const poster = await memberRecipient(job.posted_by);
  if (!poster) return;
  await notify("job_application", poster, { from: displayName(me, poster.locale ?? "ar"), job: job.title, jobId, message });
}

const REF_STATUS = {
  accepted: { ar: "خبر رائع! صاحب الوظيفة قبل طلبك وسيتواصل معك قريبًا.", en: "Great news! The job poster accepted your application and will be in touch soon.", he: "חדשות מעולות! מפרסם/ת המשרה אישר/ה את המועמדות ויצור/תיצור קשר בקרוב." },
  declined: { ar: "للأسف لم يتم قبول طلبك هذه المرة. لا تتردد في التقديم لوظائف أخرى على المنصة.", en: "Unfortunately your application was not accepted this time. Keep an eye on other jobs on the platform.", he: "לצערנו המועמדות לא התקבלה הפעם. כדאי להמשיך לעקוב אחרי משרות נוספות במערכת." },
};

export async function onReferralResponded(referralId: string, jobId: string, viewerId: string, accept: boolean) {
  const r = (await repo.listReferralsForJob(jobId)).find((x) => x.id === referralId);
  const job = await repo.getJob(jobId, viewerId);
  if (!r || !job) return;
  const to = await memberRecipient(r.requester_id);
  if (!to) return;
  const l = (to.locale ?? "ar") as Locale;
  await notify("job_application_update", to, { job: job.title, jobId, status: REF_STATUS[accept ? "accepted" : "declined"][l] });
}

export async function onEventRegistered(eventId: string, viewerId: string) {
  const e = await repo.getEvent(eventId, viewerId);
  const to = await memberRecipient(viewerId);
  if (!e || !to) return;
  const l = (to.locale ?? "ar") as Locale;
  const vars = { event: tr(e.title, l), when: fmtWhen(e.starts_at, l), where: where(e, l), eventId };
  await notify(e.my_registration?.status === "waitlist" ? "event_waitlisted" : "event_registered", to, vars);
}

/** Returns the member who is first on the waitlist, so we can tell them if cancelling promotes them. */
export async function waitlistHead(eventId: string): Promise<string | null> {
  const db = supabaseAdmin();
  if (!db) return null;
  const { data } = await db.from("registrations").select("member_id").eq("event_id", eventId).eq("status", "waitlist").order("created_at").limit(1);
  return data?.[0]?.member_id ?? null;
}

export async function onEventCancelled(eventId: string, headBefore: string | null) {
  if (!headBefore) return;
  const db = supabaseAdmin();
  if (!db) return;
  const { data } = await db.from("registrations").select("status").eq("event_id", eventId).eq("member_id", headBefore).maybeSingle();
  if (data?.status !== "registered") return;
  const e = await repo.getEvent(eventId, headBefore);
  const to = await memberRecipient(headBefore);
  if (!e || !to) return;
  const l = (to.locale ?? "ar") as Locale;
  await notify("event_promoted", to, { event: tr(e.title, l), when: fmtWhen(e.starts_at, l), eventId });
}

/** Called by the scheduler endpoint: 24h and 2h reminders for registered members. */
export async function sendEventReminders() {
  const db = supabaseAdmin();
  if (!db) return { sent: 0, note: "SUPABASE_SERVICE_ROLE_KEY missing" };
  const now = Date.now();
  let sent = 0;
  const { data: events } = await db.from("events").select("*").eq("status", "published")
    .gt("starts_at", new Date(now).toISOString()).lt("starts_at", new Date(now + 25 * 3600_000).toISOString());
  for (const e of (events ?? []) as (EventItem & { send_24h_reminder?: boolean; send_2h_reminder?: boolean; reminded_24h_at?: string | null; reminded_2h_at?: string | null })[]) {
    const left = Date.parse(e.starts_at) - now;
    const kind = left <= 2.5 * 3600_000 && e.send_2h_reminder && !e.reminded_2h_at ? "2h"
      : left <= 24.5 * 3600_000 && left > 2.5 * 3600_000 && e.send_24h_reminder !== false && !e.reminded_24h_at ? "24h" : null;
    if (!kind) continue;
    await db.from("events").update(kind === "2h" ? { reminded_2h_at: new Date().toISOString() } : { reminded_24h_at: new Date().toISOString() }).eq("id", e.id);
    const { data: regs } = await db.from("registrations").select("member_id").eq("event_id", e.id).eq("status", "registered");
    for (const r of regs ?? []) {
      const to = await memberRecipient(r.member_id);
      if (!to) continue;
      const l = (to.locale ?? "ar") as Locale;
      const soon = kind === "2h" ? { ar: "بعد ساعتين", en: "in 2 hours", he: "בעוד שעתיים" }[l] : { ar: "غدًا", en: "tomorrow", he: "מחר" }[l];
      await notify("event_reminder", to, { event: tr(e.title, l), when: fmtWhen(e.starts_at, l), where: where(e, l), soon, eventId: e.id });
      sent++;
    }
  }
  return { sent };
}

export async function broadcast(opts: { memberIds: string[]; title: string; message: string; email: boolean; whatsapp: boolean }) {
  let n = 0;
  for (const id of opts.memberIds) {
    const r = await memberRecipient(id);
    if (!r) continue;
    await notify("broadcast", { ...r, phone: opts.whatsapp ? r.phone : null, email: opts.email ? r.email : null }, { title: opts.title, message: opts.message });
    n++;
  }
  return n;
}

export { notifyMember };
