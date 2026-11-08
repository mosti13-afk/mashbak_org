import { notFound } from "next/navigation";
import { getDict, isLocale, type Locale } from "@/i18n";

export type LocaleParams = { params: Promise<{ locale: string }> };
export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function pageLocale(params: Promise<{ locale: string }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return { locale: locale as Locale, t: getDict(locale as Locale) };
}

export function sp(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}
