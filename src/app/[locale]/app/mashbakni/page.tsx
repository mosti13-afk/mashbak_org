import { Mashbakni, type MashbakniCopy } from "@/components/app/Mashbakni";
import type { Locale } from "@/i18n/config";
import { pageLocale } from "@/lib/page";
import { requireMember } from "@/lib/session";

const COPY: Record<Locale, MashbakniCopy> = {
  ar: {
    title: "مشبكني", sub: "مساعدك الذكي في مشبك: أشخاص، فعاليات، وظائف ونصائح مهنية", placeholder: "اسأل مشبكني أي شيء عن مسيرتك…",
    send: "إرسال", stop: "إيقاف", reset: "محادثة جديدة", hello: "أهلًا {name}، كيف أقدر أساعدك اليوم؟",
    disclaimer: "مشبكني يعتمد على الذكاء الاصطناعي وقد يخطئ. تحقق من التفاصيل المهمة.",
    suggestions: ["مع مين يستحق أتواصل في المجتمع حسب مجالي؟", "أي فعالية قادمة تناسب أهدافي؟", "في وظائف مناسبة لي؟ ساعدني أكتب طلب توصية", "كيف أتحضّر لمقابلة لوظيفة إدارية؟"],
  },
  en: {
    title: "Mashbakni", sub: "Your Mashbak assistant: people, events, jobs and career advice", placeholder: "Ask Mashbakni anything about your career…",
    send: "Send", stop: "Stop", reset: "New chat", hello: "Hi {name}, how can I help today?",
    disclaimer: "Mashbakni uses AI and can make mistakes. Double-check important details.",
    suggestions: ["Who in the community should I connect with?", "Which upcoming event fits my goals?", "Any jobs that fit me? Help me write a referral request", "How do I prepare for a management interview?"],
  },
  he: {
    title: "משבקני", sub: "העוזר החכם שלך במשבק: אנשים, אירועים, משרות וייעוץ קריירה", placeholder: "שאלו את משבקני כל דבר על הקריירה…",
    send: "שליחה", stop: "עצירה", reset: "שיחה חדשה", hello: "שלום {name}, איך אפשר לעזור היום?",
    disclaimer: "משבקני מבוסס בינה מלאכותית ועלול לטעות. כדאי לבדוק פרטים חשובים.",
    suggestions: ["עם מי בקהילה כדאי לי ליצור קשר?", "איזה אירוע קרוב מתאים למטרות שלי?", "יש משרות שמתאימות לי? עזרו לי לכתוב בקשת המלצה", "איך להתכונן לראיון לתפקיד ניהולי?"],
  },
};

export const metadata = { title: "Mashbakni" };

export default async function MashbakniPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await pageLocale(params);
  const v = await requireMember(locale);
  const full = (locale === "en" ? v.full_name_en || v.full_name_ar : v.full_name_ar || v.full_name_en) || "";
  return <Mashbakni locale={locale} copy={COPY[locale]} firstName={full.split(" ")[0]} />;
}
