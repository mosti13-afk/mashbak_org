export const locales = ["ar", "en", "he"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";

export const localeMeta: Record<Locale, { label: string; short: string; dir: "rtl" | "ltr" }> = {
  ar: { label: "العربية", short: "ع", dir: "rtl" },
  en: { label: "English", short: "EN", dir: "ltr" },
  he: { label: "עברית", short: "עב", dir: "rtl" },
};

export function isLocale(v: string | undefined | null): v is Locale {
  return !!v && (locales as readonly string[]).includes(v);
}

export type L10n = Partial<Record<Locale, string>>;

/** Pick the best string from a localized jsonb value. */
export function tr(v: L10n | null | undefined, locale: Locale): string {
  if (!v) return "";
  return v[locale] || v.ar || v.en || v.he || "";
}
