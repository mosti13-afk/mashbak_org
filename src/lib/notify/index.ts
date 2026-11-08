import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import nodemailer, { type Transporter } from "nodemailer";
import { isLocale, type L10n, type Locale } from "@/i18n/config";
import { repo } from "@/lib/data";
import { isDemo, SITE_URL } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/server";
import { emailHtml, fill } from "./render";
import { previewOnly } from "@/lib/preview";
import { wants, type NotifyPrefs, type TemplateCategory } from "./prefs";
import { TEMPLATES, waName, type Template, type TemplateKey } from "./templates";

/*
 * One entry point for every outgoing message: email (SMTP, sent from info@mashbak.org), WhatsApp and SMS.
 * Each member chooses, per category, which channels they want (lib/notify/prefs.ts).
 * Nothing here ever throws: a failed delivery is logged to message_log and the user flow continues.
 *
 * WhatsApp provider, first configured wins:
 *   Meta Cloud API  WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_API_VERSION (v21.0), approved templates
 *   Twilio          TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM (+972...)
 *   Simulated       nothing configured: the message is rendered and logged with status "simulated"
 * SMS provider: Twilio (TWILIO_SMS_FROM or TWILIO_MESSAGING_SERVICE_SID), otherwise simulated.
 * Phone verification: Twilio Verify (TWILIO_VERIFY_SERVICE_SID), otherwise a simulated 6-digit code.
 *
 * Email env: SMTP_HOST (smtp.gmail.com), SMTP_PORT (465), SMTP_USER, SMTP_PASS, EMAIL_FROM
 * Admin alerts: ADMIN_EMAILS (comma separated, default info@mashbak.org), ADMIN_LOCALE (ar)
 */

type Vars = Record<string, string | number | null | undefined>;
export interface Recipient {
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  locale?: string | null;
  memberId?: string | null;
  emailOk?: boolean;
  whatsappOk?: boolean;
  smsOk?: boolean;
  prefs?: NotifyPrefs | null;
}

const env = (k: string, d = "") => process.env[k]?.trim() || d;
const FROM = () => env("EMAIL_FROM", "Mashbak | مشبك <info@mashbak.org>");
const site = () => env("NEXT_PUBLIC_SITE_URL", SITE_URL).replace(/\/$/, "");
export const emailConfigured = () => !!(env("SMTP_USER") && env("SMTP_PASS"));
const twilioReady = () => !!(env("TWILIO_ACCOUNT_SID") && env("TWILIO_AUTH_TOKEN"));
export type Provider = "meta" | "twilio" | "simulated";
export const whatsappProvider = (): Provider =>
  env("WHATSAPP_TOKEN") && env("WHATSAPP_PHONE_NUMBER_ID") ? "meta" : twilioReady() && env("TWILIO_WHATSAPP_FROM") ? "twilio" : "simulated";
export const smsProvider = (): Provider => (twilioReady() && (env("TWILIO_SMS_FROM") || env("TWILIO_MESSAGING_SERVICE_SID")) ? "twilio" : "simulated");
export const verifyProvider = (): Provider => (twilioReady() && env("TWILIO_VERIFY_SERVICE_SID") ? "twilio" : "simulated");
export const whatsappConfigured = () => whatsappProvider() !== "simulated";

let transporter: Transporter | null = null;
function mailer() {
  if (!emailConfigured()) return null;
  if (!transporter) {
    const port = Number(env("SMTP_PORT", "465"));
    transporter = nodemailer.createTransport({
      host: env("SMTP_HOST", "smtp.gmail.com"), port, secure: port === 465,
      auth: { user: env("SMTP_USER"), pass: env("SMTP_PASS") },
      connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 12000,
    });
  }
  return transporter;
}

/* ---------- admin overrides (notification_templates) ---------- */
interface Override { subject: Partial<L10n>; body: Partial<L10n>; whatsapp_template: { name?: string; lang?: string }; email_enabled: boolean; whatsapp_enabled: boolean }
let cache: { at: number; rows: Map<string, Override> } | null = null;
async function overrides(): Promise<Map<string, Override>> {
  if (cache && Date.now() - cache.at < 60_000) return cache.rows;
  const rows = new Map<string, Override>();
  try {
    const db = supabaseAdmin();
    if (db) {
      const { data } = await db.from("notification_templates").select("*");
      for (const r of data ?? []) rows.set(r.key, r as Override);
    }
  } catch { /* table may not exist yet */ }
  cache = { at: Date.now(), rows };
  return rows;
}
export function clearTemplateCache() { cache = null; }

/* ---------- delivery log ---------- */
export type LogChannel = "email" | "whatsapp" | "sms";
export const demoLog: { at: string; channel: string; template: string; recipient: string; status: string; error?: string; subject?: string; body?: string; provider?: string }[] = [];
async function log(channel: LogChannel, template: string, recipient: string, memberId: string | null | undefined, status: string, error?: string, extra: { subject?: string; body?: string; provider?: string } = {}) {
  const body = channel === "email" ? extra.subject : extra.body;
  const row = { channel, template, recipient, member_id: memberId ?? null, status, error: error?.slice(0, 500) ?? null, body: body?.slice(0, 2000) ?? null, provider: extra.provider ?? null };
  if (isDemo) {
    demoLog.unshift({ at: new Date().toISOString(), channel, template, recipient, status, error, ...extra });
    demoLog.length = Math.min(demoLog.length, 200);
  }
  try {
    const db = supabaseAdmin();
    if (db) {
      const { error: e } = await db.from("message_log").insert(row);
      if (e) await db.from("message_log").insert({ channel: channel === "sms" ? "whatsapp" : channel, template, recipient, member_id: row.member_id, status, error: row.error });
    }
  } catch { /* best effort */ }
  if (status !== "sent") console.info(`[notify] ${channel} ${template} -> ${recipient}: ${status}${error ? ` (${error})` : ""}`);
}

/* ---------- channels ---------- */
export async function sendEmail(to: string, subject: string, html: string, text: string, replyTo?: string) {
  const m = mailer();
  if (!m) return { ok: false, status: "skipped", error: "SMTP not configured" };
  try {
    await m.sendMail({ from: FROM(), to, subject, html, text, replyTo: replyTo ?? env("EMAIL_REPLY_TO", "info@mashbak.org") });
    return { ok: true, status: "sent" };
  } catch (e) {
    return { ok: false, status: "failed", error: (e as Error).message };
  }
}

export function waNumber(phone: string) {
  let d = phone.replace(/[^\d]/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = `972${d.slice(1)}`;
  return d.length >= 10 ? d : null;
}

export function e164(phone: string) {
  const d = waNumber(phone);
  return d ? `+${d}` : null;
}

async function twilio(path: string, form: Record<string, string>, base = `https://api.twilio.com/2010-04-01/Accounts/${env("TWILIO_ACCOUNT_SID")}`) {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${env("TWILIO_ACCOUNT_SID")}:${env("TWILIO_AUTH_TOKEN")}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(form).toString(),
    signal: AbortSignal.timeout(10_000),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, json: json as Record<string, unknown>, error: res.ok ? undefined : `${res.status} ${String((json as { message?: string }).message ?? "").slice(0, 300)}` };
}

/** WhatsApp: Meta template message, Twilio text message, or a simulated send that is only logged. */
export async function sendWhatsApp(phone: string, name: string, lang: string, params: string[], text = "") {
  const provider = whatsappProvider();
  const to = waNumber(phone);
  if (!to) return { ok: false, status: "failed", error: "invalid phone", provider };
  if (provider === "simulated") return { ok: true, status: "simulated", provider };
  try {
    if (provider === "twilio") {
      const r = await twilio("/Messages.json", { From: `whatsapp:${e164(env("TWILIO_WHATSAPP_FROM"))}`, To: `whatsapp:+${to}`, Body: text.slice(0, 1500) });
      return r.ok ? { ok: true, status: "sent", provider } : { ok: false, status: "failed", error: r.error, provider };
    }
    const res = await fetch(`https://graph.facebook.com/${env("WHATSAPP_API_VERSION", "v21.0")}/${env("WHATSAPP_PHONE_NUMBER_ID")}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env("WHATSAPP_TOKEN")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp", to, type: "template",
        template: {
          name, language: { code: lang },
          ...(params.length ? { components: [{ type: "body", parameters: params.map((t) => ({ type: "text", text: (t || "-").slice(0, 300) })) }] } : {}),
        },
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return { ok: false, status: "failed", error: `${res.status} ${(await res.text()).slice(0, 300)}`, provider };
    return { ok: true, status: "sent", provider };
  } catch (e) {
    return { ok: false, status: "failed", error: (e as Error).message, provider };
  }
}

/** SMS via Twilio, or simulated. */
export async function sendSms(phone: string, text: string) {
  const provider = smsProvider();
  const to = e164(phone);
  if (!to) return { ok: false, status: "failed", error: "invalid phone", provider };
  if (provider === "simulated") return { ok: true, status: "simulated", provider };
  try {
    const from: Record<string, string> = env("TWILIO_MESSAGING_SERVICE_SID") ? { MessagingServiceSid: env("TWILIO_MESSAGING_SERVICE_SID") } : { From: e164(env("TWILIO_SMS_FROM")) ?? env("TWILIO_SMS_FROM") };
    const r = await twilio("/Messages.json", { ...from, To: to, Body: text.slice(0, 600) });
    return r.ok ? { ok: true, status: "sent", provider } : { ok: false, status: "failed", error: r.error, provider };
  } catch (e) {
    return { ok: false, status: "failed", error: (e as Error).message, provider };
  }
}

/* ---------- phone verification ---------- */
const secret = () => env("VERIFY_SECRET") || env("SUPABASE_SERVICE_ROLE_KEY") || "mashbak-local-verify";
const sign = (phone: string, code: string, exp: number) => createHmac("sha256", secret()).update(`${phone}|${code}|${exp}`).digest("hex");

/**
 * Starts a phone check. With Twilio Verify the code goes out by SMS or WhatsApp; otherwise a simulated
 * code is created and returned so the flow can be tried end to end. `token` must be kept (cookie) for checking.
 */
export async function startPhoneVerification(phone: string, channel: "sms" | "whatsapp") {
  const to = e164(phone);
  if (!to) return { ok: false as const, error: "invalid" };
  if (verifyProvider() === "twilio") {
    const r = await twilio("/Verifications", { To: to, Channel: channel }, `https://verify.twilio.com/v2/Services/${env("TWILIO_VERIFY_SERVICE_SID")}`);
    return r.ok ? { ok: true as const, provider: "twilio" as const, token: `twilio|${to}` } : { ok: false as const, error: r.error ?? "failed" };
  }
  const code = String(randomInt(100000, 1000000));
  const exp = Date.now() + 10 * 60_000;
  return { ok: true as const, provider: "simulated" as const, code, token: `sim|${to}|${exp}|${sign(to, code, exp)}` };
}

export async function checkPhoneVerification(token: string, code: string) {
  const parts = token.split("|");
  const clean = code.replace(/\D/g, "");
  if (parts[0] === "twilio" && parts[1]) {
    const r = await twilio("/VerificationCheck", { To: parts[1], Code: clean }, `https://verify.twilio.com/v2/Services/${env("TWILIO_VERIFY_SERVICE_SID")}`);
    return r.ok && r.json.status === "approved" ? parts[1] : null;
  }
  if (parts[0] === "sim" && parts.length === 4) {
    const [, to, expS, mac] = parts;
    const exp = Number(expS);
    if (!exp || exp < Date.now()) return null;
    const want = Buffer.from(sign(to, clean, exp));
    const got = Buffer.from(mac);
    return want.length === got.length && timingSafeEqual(want, got) ? to : null;
  }
  return null;
}

/** Short text used for WhatsApp (Twilio and simulated) and SMS: subject, then the link. */
function shortText(locale: Locale, subject: string, cta?: { label: string; url: string }) {
  const brand = { ar: "مشبك", en: "Mashbak", he: "משבק" }[locale];
  return cta ? `${brand}: ${subject}\n${cta.url}` : `${brand}: ${subject}`;
}

/* ---------- main entry ---------- */
function pick(o: Partial<L10n> | undefined, base: L10n, l: Locale) {
  const v = o?.[l]?.trim();
  return v || base[l] || base.ar || base.en || "";
}

export const TEMPLATE_CATEGORY: Record<TemplateKey, TemplateCategory> = {
  application_received: "account", application_approved: "account", application_rejected: "account",
  contact_received: "account", contact_reply: "account", admin_new_application: "account", admin_new_contact: "account",
  connection_request: "requests", job_application: "requests",
  connection_accepted: "updates", job_application_update: "updates", ask_reply: "updates",
  event_registered: "events", event_waitlisted: "events", event_promoted: "events", event_reminder: "events",
  weekly_digest: "digest", broadcast: "news",
};

export async function notify(key: TemplateKey, to: Recipient, vars: Vars = {}) {
  if (await previewOnly().catch(() => false)) return; // private preview: never send real messages
  try {
    const t: Template = TEMPLATES[key];
    const ov = (await overrides()).get(key);
    const locale: Locale = isLocale(to.locale ?? "") ? (to.locale as Locale) : "ar";
    const all: Vars = { name: to.name ?? "", ...vars };
    const cat = TEMPLATE_CATEGORY[key] ?? "updates";
    const tasks: Promise<unknown>[] = [];
    const subject = fill(pick(ov?.subject, t.subject, locale), all);
    const text = fill(pick(ov?.body, t.body, locale), all);
    const cta = t.cta ? { label: t.cta.label[locale] ?? t.cta.label.en ?? "", url: `${site()}/${locale}${fill(t.cta.path, all)}` } : undefined;
    const short = shortText(locale, subject, cta);

    const emailOn = ov ? ov.email_enabled : true;
    if (emailOn && to.email && to.emailOk !== false && wants(to.prefs, cat, "email")) {
      const html = emailHtml({ locale, subject, body: text, cta, site: site() });
      const plain = cta ? `${text}\n\n${cta.label}: ${cta.url}` : text;
      tasks.push(sendEmail(to.email, subject, html, plain, typeof vars.replyTo === "string" ? vars.replyTo : undefined)
        .then((r) => log("email", key, to.email!, to.memberId, r.status, r.error, { subject, provider: "smtp" })));
    }

    const waOn = ov ? ov.whatsapp_enabled : !!t.wa;
    if (waOn && t.wa && to.phone && to.whatsappOk !== false && wants(to.prefs, cat, "whatsapp")) {
      const name = ov?.whatsapp_template?.name || waName(key);
      const lang = ov?.whatsapp_template?.lang || locale;
      const params = t.wa.map((k) => String(all[k] ?? ""));
      tasks.push(sendWhatsApp(to.phone, name, lang, params, short).then((r) => log("whatsapp", key, to.phone!, to.memberId, r.status, r.error, { body: short, provider: r.provider })));
    }

    if (to.phone && to.smsOk && wants(to.prefs, cat, "sms")) {
      tasks.push(sendSms(to.phone, short).then((r) => log("sms", key, to.phone!, to.memberId, r.status, r.error, { body: short, provider: r.provider })));
    }
    await Promise.allSettled(tasks);
  } catch (e) {
    console.error("[notify] unexpected", key, e);
  }
}

/** Looks up a member's contact details and preferences, then notifies them. */
export async function notifyMember(key: TemplateKey, memberId: string, vars: Vars = {}) {
  const r = await memberRecipient(memberId);
  if (r) await notify(key, r, vars);
}

export async function memberRecipient(memberId: string): Promise<Recipient | null> {
  try {
    const db = supabaseAdmin();
    const p = db
      ? (await db.from("profiles").select("*").eq("id", memberId).maybeSingle()).data
      : await repo.getProfile(memberId);
    if (!p) return null;
    const locale = p.locale ?? "ar";
    return {
      memberId, email: p.email, phone: p.phone, locale,
      name: (locale === "en" ? p.full_name_en || p.full_name_ar : p.full_name_ar || p.full_name_en) ?? "",
      emailOk: p.notify_email !== false, whatsappOk: p.notify_whatsapp !== false,
      smsOk: p.notify_sms === true && !!p.phone_verified_at, prefs: p.notify_prefs ?? null,
    };
  } catch {
    return null;
  }
}

export function displayName(p: { full_name_ar?: string | null; full_name_en?: string | null }, locale: string) {
  return (locale === "en" ? p.full_name_en || p.full_name_ar : p.full_name_ar || p.full_name_en) ?? "";
}

/** Sends an admin alert to every address in ADMIN_EMAILS (default info@mashbak.org). */
export async function notifyAdmins(key: TemplateKey, vars: Vars = {}) {
  const emails = env("ADMIN_EMAILS", "info@mashbak.org").split(",").map((s) => s.trim()).filter(Boolean);
  const locale = env("ADMIN_LOCALE", "ar");
  await Promise.allSettled(emails.map((email) => notify(key, { email, locale, name: "" }, vars)));
}

export { TEMPLATES, type TemplateKey } from "./templates";
