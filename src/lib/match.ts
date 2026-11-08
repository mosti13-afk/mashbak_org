import type { Locale } from "@/i18n/config";
import type { JobWithPoster, Profile } from "./types";

/*
 * Transparent, rule-based matching for "why this fits you". No AI call: the reasons are facts the
 * member can verify (a company they follow, a managerial role matching a stated goal, colleagues inside).
 */
const MGMT = /manag|lead|head|director|إدار|مدير|قياد|ניהול|מנהל|הובל|ראש צוות/i;
const R = {
  ar: { follow: "في شركة تتابعها", mgmt: "دور إداري يلائم هدفك", sector: "في مجالك", insiders: "زملاء من مشبك يعملون هناك" },
  en: { follow: "At a company you follow", mgmt: "A management role that matches your goal", sector: "In your field", insiders: "Mashbak colleagues work there" },
  he: { follow: "בחברה שאתם עוקבים אחריה", mgmt: "תפקיד ניהולי שמתאים למטרה שלכם", sector: "בתחום שלכם", insiders: "עמיתים ממשבק עובדים שם" },
};

export function fit(j: JobWithPoster, v: Profile, followed: string[], locale: Locale) {
  // stated goal, or experienced and not yet in a management title
  const wantsMgmt = (v.career_goals ?? []).some((g) => MGMT.test(g)) || (!MGMT.test(v.headline ?? "") && (v.years_experience ?? 0) >= 6);
  const sector = (v.sector ?? "").toLowerCase();
  const reasons: string[] = [];
  let score = 0;
  if (j.company_id && followed.includes(j.company_id)) { reasons.push(R[locale].follow); score += 3; }
  if (j.is_managerial && wantsMgmt) { reasons.push(R[locale].mgmt); score += 2; }
  if (sector && `${j.title} ${j.description ?? ""}`.toLowerCase().includes(sector)) { reasons.push(R[locale].sector); score += 1; }
  const n = Math.min(j.insiders_count ?? 0, 3);
  if (n && reasons.length < 2) reasons.push(R[locale].insiders);
  score += n;
  return { score, reason: reasons.slice(0, 2).join(locale === "ar" ? "، " : ", ") };
}
