import { PageHeader } from "@/components/ui";
import { pageLocale, type LocaleParams } from "@/lib/page";

const copy = {
  ar: ["نجمع فقط المعلومات التي تقدّمها لنا: بيانات طلب العضوية، ملفك المهني، وتسجيلك في الفعاليات.", "يرى الأعضاء النشطون ملفك المهني. رقم هاتفك لا يظهر إلا لمن قبلت طلب تواصله، وفقط إذا فعّلت ذلك.", "لا نبيع بياناتك ولا نشاركها مع جهات خارجية لأغراض تسويقية.", "يمكنك طلب تعديل أو حذف بياناتك في أي وقت عبر صفحة تواصل معنا."],
  en: ["We only collect what you give us: your application, your professional profile and your event registrations.", "Active members can see your profile. Your phone number is only shown to members whose connection request you accepted, and only if you enable it.", "We never sell your data or share it with third parties for marketing.", "You can ask us to correct or delete your data at any time through the contact page."],
  he: ["אנחנו אוספים רק את מה שאתם מוסרים: הבקשה, הפרופיל המקצועי וההרשמות לאירועים.", "חברים פעילים רואים את הפרופיל שלכם. מספר הטלפון מוצג רק למי שאישרתם את בקשת הקשר שלו, ורק אם הפעלתם זאת.", "איננו מוכרים את המידע ואיננו משתפים אותו עם צדדים שלישיים לשיווק.", "אפשר לבקש תיקון או מחיקה של המידע בכל עת דרך עמוד צור קשר."],
};

export default async function Privacy({ params }: LocaleParams) {
  const { locale, t } = await pageLocale(params);
  return (
    <div className="container-x max-w-3xl py-14 sm:py-20">
      <PageHeader title={t.common.privacy} />
      <div className="card space-y-4 p-8 text-lg leading-relaxed text-ink-2">
        {copy[locale].map((p) => <p key={p}>{p}</p>)}
      </div>
    </div>
  );
}
