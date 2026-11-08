import "server-only";
import { tr, type Locale } from "@/i18n/config";
import { repo } from "@/lib/data";
import type { Profile } from "@/lib/types";

/*
 * Mashbakni (مشبكني): the member assistant. It answers with live platform data: the member's own profile,
 * programs, upcoming events, open jobs and a compact member directory (only fields members already see
 * in the directory). It suggests people to meet, events to join and jobs to look at, and drafts messages.
 */

const LANG = { ar: "Arabic", en: "English", he: "Hebrew" } as const;
const clip = (s: string | null | undefined, n: number) => (s ?? "").replace(/\s+/g, " ").trim().slice(0, n);

export async function mashbakniSystem(viewer: Profile, locale: Locale) {
  const [programs, events, jobs, members, faqs] = await Promise.all([
    repo.listPrograms().catch(() => []),
    repo.listEvents({ when: "upcoming", viewerId: viewer.id }).catch(() => []),
    repo.listJobs({ viewerId: viewer.id }).catch(() => []),
    repo.listMembers({ viewerId: viewer.id }).catch(() => []),
    repo.listFaqs().catch(() => []),
  ]);
  const b = `/${locale}/app`;
  const me = [
    `Name: ${viewer.full_name_ar || viewer.full_name_en}`, `Title: ${clip(viewer.headline, 120)}`, `Company: ${viewer.company ?? ""}`,
    `Sector: ${viewer.sector ?? ""}`, `City: ${viewer.city ?? ""}`, `Years of experience: ${viewer.years_experience ?? ""}`,
    `Career goals: ${(viewer.career_goals ?? []).join(", ")}`, `Interests: ${(viewer.interests ?? []).join(", ")}`,
    `Current interests: ${(viewer.current_interests ?? []).join(", ")}`, `Career challenges: ${(viewer.top_career_challenges ?? []).join(", ")}`,
    `Open to mentoring others: ${viewer.open_to_mentoring ? "yes" : "no"}`, `Bio: ${clip(viewer.bio, 400)}`,
  ].join("\n");

  const progLines = programs.map((p) => `- ${tr(p.title, locale)}: ${clip(tr(p.summary, locale), 220)} (link: /${locale}/our_programs/${p.slug})`).join("\n");
  const eventLines = events.slice(0, 25).map((e) =>
    `- ${tr(e.title, locale)} | ${e.starts_at.slice(0, 16).replace("T", " ")} | ${e.is_online ? "online" : tr(e.location, locale)} | ${
      e.capacity ? `${Math.max(0, e.capacity - e.registered_count)} seats left` : "open"} | ${e.my_registration ? `member status: ${e.my_registration.status}` : "not registered"} | link: ${b}/events/${e.id}`,
  ).join("\n");
  const jobLines = jobs.filter((j) => j.is_open).slice(0, 40).map((j) =>
    `- ${j.title} at ${j.company}${j.city ? `, ${j.city}` : ""} | ${j.job_type}, ${j.work_mode}${j.is_managerial ? ", managerial" : ""} | ${clip(j.description, 160)} | link: ${b}/jobs/${j.id}`,
  ).join("\n");
  const memberLines = members.filter((m) => m.id !== viewer.id).slice(0, 250).map((m) => {
    const name = locale === "en" ? m.full_name_en || m.full_name_ar : m.full_name_ar || m.full_name_en;
    return `- ${name} | ${clip(m.headline, 80)} | ${m.company ?? ""} | ${m.sector ?? ""} | ${m.city ?? ""} | ${m.years_experience ?? "?"}y${
      m.open_to_mentoring ? " | open to mentoring" : ""}${m.connection ? ` | connection: ${m.connection.status}` : ""} | link: ${b}/members/${m.id}`;
  }).join("\n");
  const faqLines = faqs.map((f) => `Q: ${tr(f.question, locale)}\nA: ${clip(tr(f.answer, locale), 400)}`).join("\n");

  return `You are Mashbakni (مشبكني), the personal assistant inside Mashbak (مشبك), a curated professional community for Arab professionals in Israel run by Co-Impact. Members join to grow their careers through meaningful connections, programs, events and job referrals.

Your job: help this member get real value from the community. You can
1. Suggest specific members to connect with (explain in one line why each is relevant), and draft a short, warm connection request message.
2. Recommend upcoming events and programs that fit their goals.
3. Point out relevant open jobs posted by members and help write a referral request.
4. Give practical career advice (interviews, promotion, career change, salary conversations, LinkedIn), grounded in the Israeli job market and the Arab professional experience.
5. Answer questions about how Mashbak works using the FAQ below.

Rules:
- Reply in ${LANG[locale]} unless the member writes in another language, then use theirs. Arabic should be clear Modern Standard Arabic with a friendly tone.
- Be concise: short paragraphs or a short list. No long dashes.
- Only recommend people, events, jobs and programs that appear in the data below. Never invent members, companies or events. If nothing fits, say so and suggest a next step.
- When you mention a member, event, job or program, link it in markdown using its link exactly as given, for example [Name](${b}/members/ID).
- Do not reveal contact details (you don't have any) and do not share one member's private information with another beyond what is listed here.
- You cannot take actions (send requests, register). Tell the member which page to open and offer to draft the text.
- If asked something unrelated to careers, the community or professional growth, answer briefly and steer back.

## The member you are talking to
${me}

## Programs
${progLines || "(none)"}

## Upcoming events
${eventLines || "(none right now)"}

## Open jobs posted by members
${jobLines || "(none right now)"}

## Member directory (name | title | company | sector | city | years)
${memberLines || "(empty)"}

## FAQ
${faqLines}

Today is ${new Date().toISOString().slice(0, 10)}.`;
}
