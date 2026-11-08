import { Mail, Phone } from "lucide-react";
import { PageHero } from "@/components/site/sections";
import type { Locale } from "@/i18n";
import { siteDict } from "@/i18n/site";
import { repo } from "@/lib/data";
import { contact } from "@/lib/settings";
import { pageLocale, type LocaleParams } from "@/lib/page";

type Sec = { h: string; p?: string; li?: string[] };
const content: Record<Locale, Sec[]> = {
  ar: [
    { h: "المعلومات التي نجمعها", p: "نجمع المعلومات اللازمة لتزويدك بتجربة مهنية متكاملة في مشبك:", li: ["الاسم الكامل", "البريد الإلكتروني", "رقم الهاتف", "السيرة الذاتية (إن رفعتها)", "المعلومات المهنية والخبرات", "بيانات الاستخدام داخل المنصة"] },
    { h: "كيف نستخدم المعلومات", li: ["مراجعة طلب العضوية والتواصل معك بشأنه", "تخصيص تجربتك واقتراح فعاليات وبرامج ملائمة", "إبلاغك بالفعاليات واللقاءات والبرامج الجديدة", "تسهيل التواصل بين الأعضاء بموافقتهم", "الحفاظ على سلامة المنصة وأمانها"] },
    { h: "مشاركة المعلومات", p: "يرى الأعضاء المعتمدون اسمك ومسمّاك الوظيفي وشركتك فقط. رقم هاتفك لا يظهر إلا لمن قبلت طلب تواصله، وإذا فعّلت ذلك. نشارك البيانات مع مزوّدي خدمة موثوقين لتشغيل المنصة فقط، أو عند طلب قانوني. لا نبيع بياناتك ولا نشاركها لأغراض تسويقية." },
    { h: "مدة الاحتفاظ بالمعلومات", p: "نحتفظ بالمعلومات للمدة اللازمة لتحقيق الأغراض التي جُمعت من أجلها، أو وفقًا لمتطلبات القانون. قد نحتفظ ببيانات مجهّلة الهوية لأغراض إحصائية." },
    { h: "أمن المعلومات", p: "نستخدم تشفيرًا وصلاحيات وصول دقيقة لحماية بياناتك. ومع ذلك لا يمكن ضمان حماية مطلقة لأي نظام." },
    { h: "حقوقكم", li: ["الاطلاع على المعلومات المحفوظة عنكم", "طلب تصحيح المعلومات غير الدقيقة", "طلب حذف حسابكم ومعلوماتكم", "إيقاف رسائل البريد والواتساب من إعدادات الحساب"] },
    { h: "ملفات تعريف الارتباط (Cookies)", p: "نستخدم ملفات تعريف الارتباط الضرورية لتسجيل الدخول وحفظ اللغة. يمكنكم تعطيلها من إعدادات المتصفح، لكن ذلك قد يؤثر على عمل المنصة." },
    { h: "تحديثات السياسة", p: "قد نحدّث هذه السياسة من وقت لآخر. عند إجراء تغييرات جوهرية سنعلمكم عبر البريد أو داخل المنصة." },
  ],
  en: [
    { h: "Information we collect", p: "We collect what we need to give you a complete professional experience at Mashbak:", li: ["Full name", "Email", "Phone number", "CV (if you upload one)", "Professional information and experience", "Usage data inside the platform"] },
    { h: "How we use it", li: ["Reviewing your membership application and contacting you about it", "Personalising your experience and suggesting relevant events and programs", "Letting you know about new events, meetups and programs", "Helping members connect, with their consent", "Keeping the platform safe and secure"] },
    { h: "Sharing", p: "Approved members only see your name, job title and company. Your phone number is shown only to members whose connection request you accepted, and only if you allow it. We share data with trusted service providers that run the platform, or when required by law. We never sell your data or share it for marketing." },
    { h: "Retention", p: "We keep information for as long as needed for the purposes it was collected for, or as required by law. Anonymised data may be kept for statistics." },
    { h: "Security", p: "We use encryption and strict access controls to protect your data. No system can be guaranteed to be completely secure." },
    { h: "Your rights", li: ["See the information we hold about you", "Ask us to correct inaccurate information", "Ask us to delete your account and data", "Turn off email and WhatsApp messages in your account settings"] },
    { h: "Cookies", p: "We use essential cookies for login and language. You can disable them in your browser, but parts of the platform may stop working." },
    { h: "Updates", p: "We may update this policy from time to time. We'll let you know by email or in the platform about significant changes." },
  ],
  he: [
    { h: "המידע שאנחנו אוספים", p: "אנחנו אוספים את מה שנדרש כדי לתת לכם חוויה מקצועית מלאה במשבק:", li: ["שם מלא", "אימייל", "מספר טלפון", "קורות חיים (אם העליתם)", "מידע מקצועי וניסיון", "נתוני שימוש בפלטפורמה"] },
    { h: "איך אנחנו משתמשים במידע", li: ["בדיקת בקשת החברות ויצירת קשר בנושא", "התאמה אישית והמלצה על אירועים ותוכניות", "עדכונים על אירועים, מפגשים ותוכניות חדשות", "חיבור בין חברים, בהסכמתם", "שמירה על בטיחות ואבטחת הפלטפורמה"] },
    { h: "שיתוף מידע", p: "חברים מאושרים רואים רק את שמכם, התפקיד והחברה. מספר הטלפון מוצג רק למי שאישרתם את בקשת הקשר שלו, ורק אם בחרתם בכך. אנחנו משתפים מידע עם ספקי שירות מהימנים להפעלת הפלטפורמה או לפי דרישת חוק. איננו מוכרים מידע ואיננו משתפים אותו לשיווק." },
    { h: "שמירת מידע", p: "המידע נשמר כל עוד הוא נדרש למטרות שלשמן נאסף, או לפי דרישות החוק. מידע אנונימי עשוי להישמר לצרכים סטטיסטיים." },
    { h: "אבטחת מידע", p: "אנחנו משתמשים בהצפנה ובהרשאות גישה מוקפדות. אין מערכת שאבטחתה מובטחת לחלוטין." },
    { h: "הזכויות שלכם", li: ["לעיין במידע השמור עליכם", "לבקש תיקון של מידע שגוי", "לבקש מחיקת החשבון והמידע", "לכבות הודעות אימייל ווואטסאפ בהגדרות החשבון"] },
    { h: "עוגיות (Cookies)", p: "אנחנו משתמשים בעוגיות חיוניות לכניסה ולשמירת השפה. אפשר לכבות אותן בדפדפן, אך חלק מהפלטפורמה עלול להפסיק לעבוד." },
    { h: "עדכונים", p: "ייתכן שנעדכן את המדיניות מעת לעת. על שינויים מהותיים נעדכן במייל או בפלטפורמה." },
  ],
};

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await pageLocale(params);
  return { title: siteDict[locale].policy.title };
}

export default async function Policy({ params }: LocaleParams) {
  const { locale } = await pageLocale(params);
  const t = siteDict[locale];
  const c = contact(await repo.getSettings());
  const secs = content[locale];
  return (
    <>
      <PageHero a={t.policy.title} sub={t.policy.sub} back={{ href: `/${locale}`, label: t.nav.back }}>
        <p className="text-sm text-mist">{t.policy.updated}: 08/11/2026</p>
      </PageHero>
      <section className="container-x grid gap-8 pb-16 lg:grid-cols-[260px_1fr]">
        <nav className="h-fit rounded-[16px] bg-mint-soft p-5 lg:sticky lg:top-28">
          <p className="mb-3 font-semibold text-ink">{t.policy.toc}</p>
          <ol className="space-y-2 text-[14px]">{secs.map((x, i) => <li key={i}><a href={`#s${i + 1}`} className="flex gap-2 text-ink-2 hover:text-navy"><span className="font-semibold text-mint">{String(i + 1).padStart(2, "0")}</span>{x.h}</a></li>)}</ol>
        </nav>
        <div className="space-y-5">
          {secs.map((x, i) => (
            <article key={i} id={`s${i + 1}`} className="scroll-mt-28 rounded-[16px] border border-line bg-white p-6">
              <h2 className="text-[20px] font-semibold text-ink">{i + 1}. {x.h}</h2>
              {x.p && <p className="mt-3 leading-8 text-ink-2">{x.p}</p>}
              {x.li && <ul className="mt-3 list-inside list-disc space-y-1.5 text-ink-2 marker:text-mint">{x.li.map((l) => <li key={l}>{l}</li>)}</ul>}
            </article>
          ))}
          <article className="rounded-[16px] bg-navy-deep p-6 text-white">
            <h2 className="text-[20px] font-semibold">{t.policy.question}</h2>
            <p className="mt-1 text-white/75">{t.policy.questionSub}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {c.email && <a href={`mailto:${c.email}`} className="inline-flex items-center gap-2 rounded-[12px] bg-white/10 px-4 py-2" dir="ltr"><Mail className="h-4 w-4" />{c.email}</a>}
              {c.phoneNumber && <a href={`tel:${c.phoneNumber}`} className="inline-flex items-center gap-2 rounded-[12px] bg-white/10 px-4 py-2" dir="ltr"><Phone className="h-4 w-4" />{c.phoneNumber}</a>}
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
