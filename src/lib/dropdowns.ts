import type { Locale } from "@/i18n/config";
import type { DropdownOption } from "./types";

// Readable labels for the few English keys the old platform stored (bug report #22)
const KNOWN: Record<string, Record<Locale, string>> = {
  bachelor: { ar: "بكالوريوس", en: "Bachelor's", he: "תואר ראשון" },
  master: { ar: "ماجستير", en: "Master's", he: "תואר שני" },
  phd: { ar: "دكتوراه", en: "PhD", he: "דוקטורט" },
  "0-2": { ar: "0-2 سنوات", en: "0-2 years", he: "0-2 שנים" },
  "من 0 إلى 2 سنوات": { ar: "من 0 إلى 2 سنوات", en: "0 to 2 years", he: "0 עד 2 שנים" },
  "من 3 إلى 5 سنوات": { ar: "من 3 إلى 5 سنوات", en: "3 to 5 years", he: "3 עד 5 שנים" },
  "من 6 إلى 9 سنوات": { ar: "من 6 إلى 9 سنوات", en: "6 to 9 years", he: "6 עד 9 שנים" },
  "10 سنوات فأكثر": { ar: "10 سنوات فأكثر", en: "10+ years", he: "10 שנים ומעלה" },
  "شهادة مهنية / دبلوم": { ar: "شهادة مهنية / دبلوم", en: "Professional certificate / diploma", he: "תעודה מקצועית / דיפלומה" },
  "بدون لقب أكاديمي": { ar: "بدون لقب أكاديمي", en: "No academic degree", he: "ללא תואר אקדמי" },
  "لقب أول (بكالوريوس)": { ar: "لقب أول (بكالوريوس)", en: "Bachelor's degree", he: "תואר ראשון" },
  "لقب ثانٍ (ماجستير)": { ar: "لقب ثانٍ (ماجستير)", en: "Master's degree", he: "תואר שני" },
  "لقب ثان (ماجستير)": { ar: "لقب ثانٍ (ماجستير)", en: "Master's degree", he: "תואר שני" },
  "لقب ثالث (دكتوراه)": { ar: "لقب ثالث (دكتوراه)", en: "Doctorate (PhD)", he: "תואר שלישי (דוקטורט)" },
};

export function labelOf(o: Pick<DropdownOption, "key" | "label">, locale: Locale): string {
  return o.label?.[locale] || KNOWN[o.key]?.[locale] || o.label?.ar || o.key;
}

export function optionsFor(all: DropdownOption[], type: string, locale: Locale) {
  return all
    .filter((o) => o.type === type && o.is_active && o.status === "approved")
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((o) => ({ value: o.key, label: labelOf(o, locale) }));
}

export function labelFor(all: DropdownOption[], type: string, key: string | null | undefined, locale: Locale): string {
  if (!key) return "";
  const o = all.find((x) => x.type === type && x.key === key);
  return o ? labelOf(o, locale) : key;
}
