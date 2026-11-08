import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { isLocale, type L10n, type Locale } from "@/i18n/config";
import { repo } from "@/lib/data";
import { isDemo, SITE_URL } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/server";
import { emailHtml, fill } from "./render";
import { TEMPLATES, waName, type Template, type TemplateKey } from "./templates";

/*
 * One entry point for every outgoing message: email (SMTP, sent from info@mashbak.org) and
 * WhatsApp (Meta WhatsApp Business Cloud API, approved templates). Nothing here ever throws:
 * a failed delivery is logged to message_log and the user flow continues.
 *
 * Env:
 *   SMTP_HOST (default smtp.gmail.com), SMTP_PORT (465), SMTP_USER, SMTP_PASS, EMAIL_FROM ("Mashbak <info@mashbak.org>")
 *   ADMIN_EMAILS (comma separated, default info@mashbak.org), ADMIN_LOCALE (ar)
 *   WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_API_VERSION (v21.0)
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
}

const env = (k: string, d = "") => process.env[k]?.trim() || d;
const FROM = () => env("EMAIL_FROM", "Mashbak | مشبك <info@mashbak.org>");
const site = () => env("NEXT_PUBLIC_SITE_URL", SITE_URL).replace(/\/$/, "");
export const emailConfigured = () => !!(env("SMTP_USER") && env("SMTP_PASS"));
export const whatsappConfigured = () => !!(env("WHATSAPP_TOKEN") && env("WHATSAPP_PHONE_NUMBER_ID"));

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
export const demoLog: { at: string; channel: string; template: string; recipient: string; status: string; error?: string; subject?: string }[] = [];
async function log(channel: "email" | "whatsapp", template: string, recipient: string, memberId: string | null | undefined, status: string, error?: string, subject?: string) {
  const row = { channel, template, recipient, member_id: memberId ?? null, status, error: error?.slice(0, 500) ?? null };
  if (isDemo) {
    demoLog.unshift({ at: new Date().toISOString(), channel, template, recipient, status, error, subject });
    demoLog.length = Math.min(demoLog.length, 200);
  }
  try { await supabaseAdmin()?.from("message_log").insert(row); } catch { /* best effort */ }
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

export async function sendWhatsApp(phone: string, name: string, lang: string, params: string[]) {
  if (!whatsappConfigured()) return { ok: false, status: "skipped", error: "WhatsApp not configured" };
  const to = waNumber(phone);
  if (!to) return { ok: false, status: "failed", error: "invalid phone" };
  try {
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
    if (!res.ok) return { ok: false, status: "failed", error: `${res.status} ${(await res.text()).slice(0, 300)}` };
    return { ok: true, status: "sent" };
  } catch (e) {
    return { ok: false, status: "failed", error: (e as Error).message };
  }
}

/* ---------- main entry ---------- */
function pick(o: Partial<L10n> | undefined, base: L10n, l: Locale) {
  const v = o?.[l]?.trim();
  return v || base[l] || base.ar || base.en || "";
}

export async function notify(key: TemplateKey, to: Recipient, vars: Vars = {}) {
  try {
    const t: Template = TEMPLATES[key];
    const ov = (await overrides()).get(key);
    const locale: Locale = isLocale(to.locale ?? "") ? (to.locale as Locale) : "ar";
    const all: Vars = { name: to.name ?? "", ...vars };
    const tasks: Promise<unknown>[] = [];

    const emailOn = ov ? ov.email_enabled : true;
    if (emailOn && to.email && to.emailOk !== false) {
      const subject = fill(pick(ov?.subject, t.subject, locale), all);
      const text = fill(pick(ov?.body, t.body, locale), all);
      const cta = t.cta ? { label: t.cta.label[locale] ?? t.cta.label.en ?? "", url: `${site()}/${locale}${fill(t.cta.path, all)}` } : undefined;
      const html = emailHtml({ locale, subject, body: text, cta, site: site() });
      const plain = cta ? `${text}\n\n${cta.label}: ${cta.url}` : text;
      tasks.push(sendEmail(to.email, subject, html, plain, typeof vars.replyTo === "string" ? vars.replyTo : undefined)
        .then((r) => log("email", key, to.email!, to.memberId, r.status, r.error, subject)));
    }

    const waOn = ov ? ov.whatsapp_enabled : !!t.wa;
    if (waOn && t.wa && to.phone && to.whatsappOk !== false) {
      const name = ov?.whatsapp_template?.name || waName(key);
      const lang = ov?.whatsapp_template?.lang || locale;
      const params = t.wa.map((k) => String(all[k] ?? ""));
      tasks.push(sendWhatsApp(to.phone, name, lang, params).then((r) => log("whatsapp", key, to.phone!, to.memberId, r.status, r.error)));
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
      ? (await db.from("profiles").select("id,email,phone,full_name_ar,full_name_en,locale,notify_email,notify_whatsapp").eq("id", memberId).maybeSingle()).data
      : await repo.getProfile(memberId);
    if (!p) return null;
    const locale = p.locale ?? "ar";
    return {
      memberId, email: p.email, phone: p.phone, locale,
      name: (locale === "en" ? p.full_name_en || p.full_name_ar : p.full_name_ar || p.full_name_en) ?? "",
      emailOk: p.notify_email !== false, whatsappOk: p.notify_whatsapp !== false,
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
