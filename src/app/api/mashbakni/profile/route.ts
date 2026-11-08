import Anthropic from "@anthropic-ai/sdk";
import { isLocale, type Locale } from "@/i18n/config";
import { getViewer } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Drafts a professional headline and a short bio from the member's profile and optional notes
 * (e.g. a pasted CV summary). Returns a suggestion only: the member reviews and saves it themselves.
 */
export async function POST(req: Request) {
  const v = await getViewer();
  if (!v || (v.status !== "active" && v.role !== "admin")) return new Response("unauthorized", { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { locale?: string; notes?: string; headline?: string; company?: string; sector?: string; years?: string };
  const locale: Locale = isLocale(body.locale ?? "") ? (body.locale as Locale) : "ar";
  const headline = (body.headline || v.headline || "").slice(0, 120);
  const company = (body.company || v.company || "").slice(0, 120);
  const sector = (body.sector || v.sector || "").slice(0, 80);
  const years = body.years || (v.years_experience != null ? String(v.years_experience) : "");
  const notes = (body.notes ?? "").slice(0, 2500);
  const goals = (v.career_goals ?? []).join(", ");

  const fallback = {
    ar: { headline: [headline, company && `في ${company}`].filter(Boolean).join(" "), bio: `${headline || "مهني"}${company ? ` في ${company}` : ""}${years ? ` بخبرة ${years} سنوات` : ""}${sector ? ` في مجال ${sector}` : ""}.${goals ? ` أعمل حاليًا على: ${goals}.` : ""} يسعدني التواصل مع الأعضاء لتبادل الخبرات والمساعدة في التوصيات.` },
    en: { headline: [headline, company && `at ${company}`].filter(Boolean).join(" "), bio: `${headline || "Professional"}${company ? ` at ${company}` : ""}${years ? ` with ${years} years of experience` : ""}${sector ? ` in ${sector}` : ""}.${goals ? ` Currently focused on: ${goals}.` : ""} Happy to connect with members, share experience and help with referrals.` },
    he: { headline: [headline, company && `ב-${company}`].filter(Boolean).join(" "), bio: `${headline || "איש/אשת מקצוע"}${company ? ` ב-${company}` : ""}${years ? ` עם ${years} שנות ניסיון` : ""}${sector ? ` בתחום ${sector}` : ""}.${goals ? ` כרגע מתמקד/ת ב: ${goals}.` : ""} אשמח ליצור קשר עם חברים, לשתף ניסיון ולעזור בהמלצות.` },
  }[locale];

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ ...fallback, ai: false });
  try {
    const client = new Anthropic({ apiKey: key });
    const res = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5", max_tokens: 500,
      system: `You help members of Mashbak, a community of Arab professionals, write their profile. Write in ${locale === "ar" ? "Modern Standard Arabic" : locale === "he" ? "Hebrew" : "English"}, professional and concrete, first person for the bio, no flattery, no emojis, no long dashes. Never invent employers, titles, degrees or numbers that are not in the input. Return JSON only: {"headline": "max 70 characters", "bio": "2 to 4 sentences, max 420 characters"}.`,
      messages: [{ role: "user", content: `Current title: ${headline}\nCompany: ${company}\nSector: ${sector}\nYears of experience: ${years}\nCareer goals: ${goals}\nHelp they offer: ${(v.help_offers ?? []).join(", ")}\nCurrent bio: ${(v.bio ?? "").slice(0, 600)}\nNotes from the member: ${notes}` }],
    });
    const text = res.content.map((c) => (c.type === "text" ? c.text : "")).join("").trim();
    const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as { headline?: string; bio?: string };
    return Response.json({ headline: (json.headline || fallback.headline).slice(0, 90), bio: (json.bio || fallback.bio).slice(0, 600), ai: true });
  } catch {
    return Response.json({ ...fallback, ai: false });
  }
}
