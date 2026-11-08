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
    notify("application_received", { email: a.email, phone: a.phone, name: a.full_name, locale: a.locale, whatsappOk: a.whatsapp_opt_in !== false }),
    notifyAdmins("admin_new_application", {
      applicant: a.full_name, headline: a.headline, company: a.company ?? "-", years: a.years_experience, email: a.email, phone: a.phone,
    }),
  ]);
}

export async function onApplicationReviewed(app: Application | null, status: string, reason?: string | null) {
  if (!app || (status !== "approved" && status !== "rejected")) return;
  const to = { email: app.email, phone: app.phone, name: app.full_name, locale: app.locale ?? "ar", whatsappOk: (app as { whatsapp_opt_in?: boolean }).whatsapp_opt_in !== false };
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

export async function onReferralRequested(jobId: string, viewerId: string, message: string, insiderId: string | null) {
  const job = await repo.getJob(jobId, viewerId);
  const me = await repo.getProfile(viewerId);
  const target = insiderId ?? job?.posted_by ?? null;
  if (!job || !me || !target) return;
  const to = await memberRecipient(target);
  if (!to) return;
  await notify("job_application", to, { from: displayName(me, to.locale ?? "ar"), job: `${job.title} · ${job.company}`, jobId, message });
}

const REF_STATUS = {
  accepted: { ar: "خبر رائع! وافق على تقديم توصية لك وسيتواصل معك قريبًا.", en: "Great news! They agreed to refer you and will be in touch soon.", he: "חדשות מעולות! הסכימו להמליץ עליך ויצרו קשר בקרוב." },
  declined: { ar: "لم يتمكن من تقديم توصية هذه المرة. يمكنك طلبها من عضو آخر في نفس الشركة.", en: "They couldn't refer you this time. You can ask another member at the same company.", he: "לא יכלו להמליץ הפעם. אפשר לבקש מחבר/ה אחר/ת באותה חברה." },
};

export async function onReferralResponded(referralId: string, viewerId: string, accept: boolean, note: string | null) {
  const r = (await repo.listMyReferrals(viewerId)).find((x) => x.id === referralId);
  if (!r) return;
  const to = await memberRecipient(r.requester_id);
  if (!to) return;
  const l = (to.locale ?? "ar") as Locale;
  const status = REF_STATUS[accept ? "accepted" : "declined"][l] + (note ? `\n\n“${note}”` : "");
  await notify("job_application_update", to, { job: `${r.job.title} · ${r.job.company}`, jobId: r.job.id, status });
}

export async function onAskReply(askId: string, viewerId: string, message: string) {
  const a = await repo.getAsk(askId, viewerId);
  const me = await repo.getProfile(viewerId);
  if (!a || !me) return;
  const to = await memberRecipient(a.ask.member_id);
  if (!to) return;
  await notify("ask_reply", to, { from: displayName(me, to.locale ?? "ar"), title: a.ask.title, message, askId });
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

/** Weekly digest: new jobs at the companies you follow (or work at), requests waiting for you, open asks, next event. */
export async function sendWeeklyDigest() {
  const db = supabaseAdmin();
  if (!db) return { sent: 0, note: "SUPABASE_SERVICE_ROLE_KEY missing" };
  const since = new Date(Date.now() - 7 * 864e5).toISOString();
  const [{ data: members }, { data: follows }, { data: jobs }, { data: pendingRefs }, { data: pendingChats }, { data: asks }, { data: events }] = await Promise.all([
    db.from("profiles").select("id, company_id, locale, notify_email").eq("status", "active"),
    db.from("company_follows").select("member_id, company_id"),
    db.from("jobs").select("id, title, company, company_id").eq("is_open", true).gt("created_at", since).limit(2000),
    db.from("referral_requests").select("insider_id").eq("status", "pending"),
    db.from("connections").select("recipient_id").eq("status", "pending"),
    db.from("asks").select("id, member_id").eq("status", "open").gt("created_at", since),
    db.from("events").select("id, title, starts_at").eq("status", "published").gt("starts_at", new Date().toISOString()).order("starts_at").limit(1),
  ]);
  const T = {
    ar: { jobs: "وظائف جديدة في شركات تتابعها:", waiting: "طلبات بانتظار ردك: {n}", asks: "منشورات جديدة في «بدّي / بقدر»: {n}", event: "الفعالية القادمة: {e}" },
    en: { jobs: "New jobs at companies you follow:", waiting: "Requests waiting for your reply: {n}", asks: "New posts on Asks & offers: {n}", event: "Next event: {e}" },
    he: { jobs: "משרות חדשות בחברות שאת/ה עוקב/ת:", waiting: "בקשות שמחכות לתשובה שלך: {n}", asks: "פוסטים חדשים בבקשות והצעות: {n}", event: "האירוע הבא: {e}" },
  };
  let sent = 0;
  for (const m of members ?? []) {
    if (m.notify_email === false) continue;
    const l = (m.locale ?? "ar") as Locale;
    const mine = new Set([...(follows ?? []).filter((f) => f.member_id === m.id).map((f) => f.company_id), m.company_id].filter(Boolean));
    const myJobs = (jobs ?? []).filter((j) => j.company_id && mine.has(j.company_id)).slice(0, 6);
    const waiting = (pendingRefs ?? []).filter((r) => r.insider_id === m.id).length + (pendingChats ?? []).filter((c) => c.recipient_id === m.id).length;
    const newAsks = (asks ?? []).filter((a) => a.member_id !== m.id).length;
    const lines: string[] = [];
    if (waiting) lines.push(T[l].waiting.replace("{n}", String(waiting)));
    if (myJobs.length) lines.push(`${T[l].jobs}\n${myJobs.map((j) => `• ${j.title} · ${j.company}`).join("\n")}`);
    if (newAsks) lines.push(T[l].asks.replace("{n}", String(newAsks)));
    const e = events?.[0] as { title: Record<string, string>; starts_at: string } | undefined;
    if (e) lines.push(T[l].event.replace("{e}", `${e.title[l] || e.title.ar} (${fmtWhen(e.starts_at, l)})`));
    if (!waiting && !myJobs.length && !newAsks) continue; // nothing worth an email this week
    const to = await memberRecipient(m.id);
    if (!to) continue;
    await notify("weekly_digest", { ...to, phone: null }, { digest: lines.join("\n\n") });
    sent++;
  }
  return { sent };
}
