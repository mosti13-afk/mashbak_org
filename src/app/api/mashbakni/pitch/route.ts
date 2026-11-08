import Anthropic from "@anthropic-ai/sdk";
import { isLocale, type Locale } from "@/i18n/config";
import { repo } from "@/lib/data";
import { getViewer } from "@/lib/session";

export const dynamic = "force-dynamic";

const name = (p: { full_name_ar?: string | null; full_name_en?: string | null }, l: Locale) => (l === "en" ? p.full_name_en || p.full_name_ar : p.full_name_ar || p.full_name_en) ?? "";

/** Drafts a short, specific referral request for a job, addressed to the chosen insider. */
export async function POST(req: Request) {
  const v = await getViewer();
  if (!v || (v.status !== "active" && v.role !== "admin")) return new Response("unauthorized", { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { jobId?: string; insiderId?: string; locale?: string };
  const locale: Locale = isLocale(body.locale ?? "") ? (body.locale as Locale) : "ar";
  const job = body.jobId ? await repo.getJob(body.jobId, v.id) : null;
  if (!job) return Response.json({ text: "" });
  const insider = body.insiderId ? await repo.getProfile(body.insiderId) : null;
  const first = insider ? name(insider, locale).split(" ")[0] : "";
  const fallback = {
    ar: `مرحبًا ${first}،\nأنا ${name(v, locale)}، ${v.headline ?? ""}${v.company ? ` في ${v.company}` : ""}. رأيت وظيفة "${job.title}" في ${job.company} وأظن أن خبرتي (${v.years_experience ?? ""} سنوات) تناسبها.\nهل تستطيع توصيتي أو مشاركتي بنصيحة عن الفريق؟ أرفقت سيرتي الذاتية. شكرًا جزيلًا!`,
    en: `Hi ${first},\nI'm ${name(v, locale)}, ${v.headline ?? ""}${v.company ? ` at ${v.company}` : ""}. I saw the "${job.title}" role at ${job.company} and I think my ${v.years_experience ?? ""} years of experience fit it well.\nWould you be open to referring me, or sharing a tip about the team? My CV is attached. Thank you!`,
    he: `שלום ${first},\nאני ${name(v, locale)}, ${v.headline ?? ""}${v.company ? ` ב-${v.company}` : ""}. ראיתי את המשרה "${job.title}" ב-${job.company} ואני חושב/ת שהניסיון שלי (${v.years_experience ?? ""} שנים) מתאים לה.\nתוכל/י להמליץ עליי או לשתף טיפ על הצוות? צירפתי קורות חיים. תודה רבה!`,
  }[locale];
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ text: fallback });
  try {
    const client = new Anthropic({ apiKey: key });
    const res = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5", max_tokens: 400,
      system: `You write short referral requests between members of Mashbak, a community of Arab professionals. Write in ${locale === "ar" ? "Arabic" : locale === "he" ? "Hebrew" : "English"}. 4 to 6 short lines, warm and specific, no flattery, no long dashes, no emojis. Mention one concrete reason the member fits the role. End by asking for a referral or a quick tip. Output only the message.`,
      messages: [{ role: "user", content: `Insider (recipient): ${insider ? `${name(insider, locale)}, ${insider.headline ?? ""} at ${insider.company ?? job.company}` : "a member at the company"}
Member (sender): ${name(v, locale)}; title: ${v.headline ?? ""}; company: ${v.company ?? ""}; sector: ${v.sector ?? ""}; years: ${v.years_experience ?? ""}; goals: ${(v.career_goals ?? []).join(", ")}; bio: ${(v.bio ?? "").slice(0, 400)}
Job: ${job.title} at ${job.company}; location: ${job.location ?? job.city ?? ""}; managerial: ${job.is_managerial ? "yes" : "no"}; description: ${(job.description ?? "").slice(0, 1200)}` }],
    });
    const text = res.content.map((c) => (c.type === "text" ? c.text : "")).join("").trim();
    return Response.json({ text: text || fallback });
  } catch {
    return Response.json({ text: fallback });
  }
}
