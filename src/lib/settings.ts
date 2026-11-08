import type { L10n, Locale } from "@/i18n/config";
import { tr } from "@/i18n/config";
import type { SiteSettings } from "./types";

/* Typed views over the live-style settings keys. Every text is a {ar,en,he} object. */

export interface Section {
  badgeText?: L10n;
  badgeIconSvg?: string;
  primaryColorTitle?: L10n;
  primaryColorTitle1?: L10n;
  secondaryColorTitle?: L10n;
  primaryColorTitle2?: L10n;
  description?: L10n;
}

export function txt(v: unknown, locale: Locale): string {
  if (v && typeof v === "object") return tr(v as L10n, locale);
  return typeof v === "string" ? v : "";
}

export function hero(s: SiteSettings) {
  const h = s.HERO_SECTION ?? {};
  return h as Section & {
    primaryButtonText?: L10n; secondaryButtonText?: L10n; statsNumber?: string | L10n; statsLabel?: L10n;
    statsAvatars?: string[]; floatingAvatars?: string[];
    slides?: { title: L10n; highlight: L10n; description: L10n }[];
  };
}

export function contact(s: SiteSettings) {
  return (s.CONTACT_INFO ?? {}) as {
    headOfficeAddress?: L10n; headOfficeLocationUrl?: string; phoneNumber?: string; email?: string;
    whatsappUrl?: string; linkedInUrl?: string; instagramUrl?: string;
  };
}

export function workingHours(s: SiteSettings) {
  return (s.WORKING_HOURS ?? []) as { title: L10n; value: L10n; valueHexColor?: string }[];
}

export function num(s: SiteSettings, key: string, fallback: number): number {
  const v = Number(s[key]);
  return Number.isFinite(v) ? v : fallback;
}

/** Splits "+450" into a display number that never contradicts itself across pages (bug report #1). */
export function memberCount(s: SiteSettings, live?: number, locale: Locale = "ar"): string {
  const fixed = txt(hero(s).statsNumber, locale);
  if (fixed) return fixed;
  return live ? `${live}` : "";
}
