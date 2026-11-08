import type { Locale } from "@/i18n/config";
import type { Profile, MiniProfile } from "./types";

const TZ = "Asia/Jerusalem";
const intlLocale: Record<Locale, string> = { ar: "ar-u-nu-latn", en: "en-GB", he: "he-IL" };

export function fmtDate(iso: string, locale: Locale, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) {
  return new Intl.DateTimeFormat(intlLocale[locale], { timeZone: TZ, ...opts }).format(new Date(iso));
}
export function fmtTime(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(intlLocale[locale], { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}
export function fmtDayMonth(iso: string, locale: Locale) {
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat(intlLocale[locale], { timeZone: TZ, day: "numeric" }).format(d);
  const month = new Intl.DateTimeFormat(intlLocale[locale], { timeZone: TZ, month: "short" }).format(d);
  const weekday = new Intl.DateTimeFormat(intlLocale[locale], { timeZone: TZ, weekday: "long" }).format(d);
  return { day, month, weekday };
}
export function fmtRelative(iso: string, locale: Locale) {
  const diff = (Date.parse(iso) - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(intlLocale[locale], { numeric: "auto" });
  const abs = Math.abs(diff);
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), "day");
  return fmtDate(iso, locale);
}
/** datetime-local input value in Israel time */
export function toLocalInput(iso: string) {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })
    .formatToParts(d).reduce<Record<string, string>>((a, p) => ((a[p.type] = p.value), a), {});
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour === "24" ? "00" : parts.hour}:${parts.minute}`;
}
/** Parse a datetime-local value as Israel time */
export function fromLocalInput(v: string) {
  const guess = new Date(`${v}:00Z`);
  const offsetMin = (Date.parse(toLocalInput(guess.toISOString()) + ":00Z") - guess.getTime()) / 60000;
  return new Date(guess.getTime() - offsetMin * 60000).toISOString();
}

export function displayName(p: Pick<Profile, "full_name_ar" | "full_name_en"> | MiniProfile, locale: Locale) {
  return locale === "ar" ? p.full_name_ar || p.full_name_en : p.full_name_en || p.full_name_ar;
}
export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("");
}
export function waLink(phone: string, text: string) {
  return `https://wa.me/${phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(text)}`;
}
export function profileStrength(p: Profile) {
  const fields = [p.avatar_url, p.headline, p.company, p.sector, p.city, p.bio, p.phone, p.linkedin_url, p.career_goals.length ? 1 : null, p.years_experience];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}
