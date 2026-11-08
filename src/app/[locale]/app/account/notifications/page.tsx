import clsx from "clsx";
import { AppWindow, BadgeCheck, Mail, MessageCircle, Smartphone } from "lucide-react";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { cancelPhoneVerify, confirmPhoneVerify, saveNotificationPrefs, startPhoneVerify } from "@/app/actions";
import { BackLink, PageTitle } from "@/components/shell/page";
import { Notice } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import type { Locale } from "@/i18n/config";
import { shellDict } from "@/i18n/shell";
import { CATEGORIES, CHANNELS, resolvePrefs, type Category, type Channel } from "@/lib/notify/prefs";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

const T: Record<Locale, {
  title: string; sub: string; phone: string; phoneSub: string; verified: string; notVerified: string; send: string; via: string; wa: string; sms: string;
  code: string; codeSent: string; confirm: string; cancel: string; sim: string; change: string; channels: string; email: string; emailSub: string;
  waSub: string; smsSub: string; smsNeeds: string; what: string; inapp: string; save: string; saved: string;
  cats: Record<Category, [string, string]>; ch: Record<Channel, string>; status: Record<string, string>; preview: string; previewMsg: string;
}> = {
  ar: {
    title: "الإشعارات", sub: "اختر ما يصلك، وعبر أي قناة.", phone: "رقم الهاتف", phoneSub: "نستخدمه لرسائل واتساب والرسائل النصية فقط، ولا يظهر للأعضاء إلا بموافقتك.",
    verified: "موثّق", notVerified: "غير موثّق", send: "أرسل رمز التحقق", via: "إرسال الرمز عبر", wa: "واتساب", sms: "رسالة نصية",
    code: "رمز التحقق", codeSent: "أرسلنا رمزًا مكوّنًا من 6 أرقام إلى", confirm: "تأكيد الرقم", cancel: "إلغاء", sim: "وضع تجريبي: خدمة الرسائل غير مربوطة بعد، لذلك يظهر الرمز هنا:", change: "تغيير الرقم",
    channels: "القنوات", email: "البريد الإلكتروني", emailSub: "قرارات الطلبات، الملخص الأسبوعي والرسائل المهمة",
    waSub: "طلبات التوصية والردود والتذكيرات", smsSub: "تذكيرات قصيرة لمن لا يستخدم واتساب", smsNeeds: "وثّق رقم هاتفك لتفعيل الرسائل النصية",
    what: "ماذا يصلك", inapp: "كل الإشعارات تظهر دائمًا داخل التطبيق أيضًا.", save: "حفظ التفضيلات", saved: "تم حفظ تفضيلاتك.",
    cats: {
      requests: ["طلبات موجّهة إليك", "طلب توصية أو محادثة من عضو آخر"],
      updates: ["تحديثات طلباتك", "قبول طلبك أو رفضه، ردود على ما نشرته"],
      events: ["الفعاليات", "تأكيد التسجيل، قائمة الانتظار وتذكير قبل الموعد"],
      digest: ["الملخص الأسبوعي", "وظائف جديدة في شركات تتابعها وأعضاء جدد"],
      news: ["أخبار المجتمع", "إعلانات من فريق مشبك"],
    },
    ch: { email: "البريد", whatsapp: "واتساب", sms: "SMS" },
    status: { invalid: "رقم الهاتف غير صالح.", bad: "الرمز غير صحيح أو انتهت صلاحيته.", expired: "انتهت صلاحية الطلب، أرسل رمزًا جديدًا.", done: "تم توثيق رقم هاتفك." },
    preview: "مثال على رسالة واتساب", previewMsg: "مشبك: مجد وافق على طلب التوصية لوظيفة مديرة منتج. تابع الطلب من هنا:",
  },
  en: {
    title: "Notifications", sub: "Choose what reaches you, and on which channel.", phone: "Phone number", phoneSub: "Used only for WhatsApp and text messages. Members see it only if you allow it.",
    verified: "Verified", notVerified: "Not verified", send: "Send verification code", via: "Send the code via", wa: "WhatsApp", sms: "Text message",
    code: "Verification code", codeSent: "We sent a 6-digit code to", confirm: "Confirm number", cancel: "Cancel", sim: "Test mode: the messaging service isn't connected yet, so the code is shown here:", change: "Change number",
    channels: "Channels", email: "Email", emailSub: "Application decisions, the weekly digest and important messages",
    waSub: "Referral requests, replies and reminders", smsSub: "Short reminders if you don't use WhatsApp", smsNeeds: "Verify your phone number to turn on text messages",
    what: "What reaches you", inapp: "Every notification also appears in the app.", save: "Save preferences", saved: "Your preferences were saved.",
    cats: {
      requests: ["Requests for you", "A referral or chat request from another member"],
      updates: ["Updates on your requests", "Accepted or declined requests, replies to your posts"],
      events: ["Events", "Registration confirmations, waitlist and reminders"],
      digest: ["Weekly digest", "New roles at companies you follow, and new members"],
      news: ["Community news", "Announcements from the Mashbak team"],
    },
    ch: { email: "Email", whatsapp: "WhatsApp", sms: "SMS" },
    status: { invalid: "That phone number isn't valid.", bad: "The code is wrong or has expired.", expired: "The request expired. Send a new code.", done: "Your phone number is verified." },
    preview: "Example WhatsApp message", previewMsg: "Mashbak: Majd accepted your referral request for the Product Manager role. Follow it here:",
  },
  he: {
    title: "התראות", sub: "בחרו מה מגיע אליכם ובאיזה ערוץ.", phone: "מספר טלפון", phoneSub: "משמש רק להודעות וואטסאפ ומסרונים. חברים יראו אותו רק באישורכם.",
    verified: "מאומת", notVerified: "לא מאומת", send: "שליחת קוד אימות", via: "שליחת הקוד דרך", wa: "וואטסאפ", sms: "מסרון",
    code: "קוד אימות", codeSent: "שלחנו קוד בן 6 ספרות אל", confirm: "אישור המספר", cancel: "ביטול", sim: "מצב בדיקה: שירות ההודעות עוד לא מחובר, לכן הקוד מוצג כאן:", change: "שינוי מספר",
    channels: "ערוצים", email: "מייל", emailSub: "החלטות על בקשות, הסיכום השבועי והודעות חשובות",
    waSub: "בקשות המלצה, תגובות ותזכורות", smsSub: "תזכורות קצרות למי שלא משתמש בוואטסאפ", smsNeeds: "אמתו את מספר הטלפון כדי להפעיל מסרונים",
    what: "מה מגיע אליכם", inapp: "כל ההתראות מופיעות תמיד גם באפליקציה.", save: "שמירת העדפות", saved: "ההעדפות נשמרו.",
    cats: {
      requests: ["בקשות אליכם", "בקשת המלצה או שיחה מחבר/ה אחר/ת"],
      updates: ["עדכונים על הבקשות שלכם", "אישור או דחייה, תגובות למה שפרסמתם"],
      events: ["אירועים", "אישור הרשמה, רשימת המתנה ותזכורת לפני המועד"],
      digest: ["סיכום שבועי", "משרות חדשות בחברות שאתם עוקבים אחריהן וחברים חדשים"],
      news: ["חדשות הקהילה", "הודעות מצוות משבק"],
    },
    ch: { email: "מייל", whatsapp: "וואטסאפ", sms: "SMS" },
    status: { invalid: "מספר הטלפון לא תקין.", bad: "הקוד שגוי או שפג תוקפו.", expired: "תוקף הבקשה פג. שלחו קוד חדש.", done: "מספר הטלפון אומת." },
    preview: "דוגמה להודעת וואטסאפ", previewMsg: "משבק: מג'ד אישר את בקשת ההמלצה לתפקיד מנהלת מוצר. אפשר לעקוב כאן:",
  },
};

function Switch({ name, on, disabled }: { name: string; on: boolean; disabled?: boolean }) {
  return (
    <span className="relative inline-flex shrink-0">
      <input type="checkbox" name={name} defaultChecked={on} disabled={disabled} className="peer sr-only" />
      <span className="relative h-7 w-12 rounded-full bg-haze transition-colors after:absolute after:start-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-navy peer-checked:after:start-6 peer-disabled:opacity-40 peer-focus-visible:ring-2 peer-focus-visible:ring-mint" />
    </span>
  );
}

function Row({ icon, title, sub, children }: { icon: ReactNode; title: string; sub: string; children: ReactNode }) {
  return (
    <label className="row cursor-pointer gap-3 py-3.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-mint-soft text-navy">{icon}</span>
      <span className="min-w-0 flex-1"><span className="block text-[15px] font-bold text-ink">{title}</span><span className="block text-[13px] leading-5 text-mist [overflow-wrap:anywhere]">{sub}</span></span>
      {children}
    </label>
  );
}

export default async function NotificationSettings({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale } = await pageLocale(params);
  const v = await requireMember(locale);
  const S = shellDict[locale];
  const L = T[locale];
  const q = await searchParams;
  const verify = sp(q.verify);
  const jar = await cookies();
  let pending: { phone: string; channel: string } | null = null;
  try { pending = JSON.parse(jar.get("mb_phone_verify")?.value ?? "null"); } catch { pending = null; }
  const simCode = jar.get("mb_phone_sim")?.value;
  const verified = !!v.phone_verified_at;
  const prefs = resolvePrefs(v.notify_prefs);
  const hidden = <input type="hidden" name="locale" value={locale} />;
  const icon: Record<Channel, ReactNode> = { email: <Mail className="h-4 w-4" />, whatsapp: <MessageCircle className="h-4 w-4" />, sms: <Smartphone className="h-4 w-4" /> };

  return (
    <div className="mx-auto max-w-2xl pb-24 lg:pb-0">
      <BackLink href={`/${locale}/app/account`} label={S.account} />
      <PageTitle title={L.title} sub={L.sub} />
      {sp(q.saved) && <Notice>{L.saved}</Notice>}
      {verify && L.status[verify] && <Notice>{L.status[verify]}</Notice>}

      {/* phone + verification */}
      <section>
        <h2 className="list-label">{L.phone}</h2>
        <div className="rounded-[20px] bg-white p-4 ring-1 ring-line sm:p-5">
          {verify === "code" && pending ? (
            <form action={confirmPhoneVerify} className="space-y-4">
              {hidden}
              <p className="text-[15px] text-ink-2">{L.codeSent} <b dir="ltr" className="text-ink">{pending.phone}</b></p>
              {simCode && <p className="rounded-[14px] bg-sand px-4 py-3 text-[14px] text-sand-ink">{L.sim} <b dir="ltr" className="tracking-widest">{simCode}</b></p>}
              <label className="block"><span className="label">{L.code}</span>
                <input name="code" required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} dir="ltr" className="input h-14 text-center text-[22px] tracking-[0.4em]" />
              </label>
              <div className="flex gap-2">
                <SubmitButton className="btn btn-primary flex-1 sm:flex-none">{L.confirm}</SubmitButton>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <span className="min-w-0 flex-1"><span className="block font-bold text-ink" dir="ltr" style={{ textAlign: "start" }}>{v.phone || "-"}</span><span className="block text-[13px] text-mist">{L.phoneSub}</span></span>
                <span className={clsx("badge shrink-0", verified ? "badge-mint" : "badge-gray")}>{verified && <BadgeCheck className="h-3.5 w-3.5" />}{verified ? L.verified : L.notVerified}</span>
              </div>
              <details className="group mt-4" open={!verified}>
                <summary className={clsx("cursor-pointer list-none text-[14px] font-bold text-navy", !verified && "hidden")}>{L.change}</summary>
                <form action={startPhoneVerify} className="mt-3 space-y-4">
                  {hidden}
                  <input name="phone" type="tel" required defaultValue={v.phone ?? ""} dir="ltr" placeholder="+972 5X XXX XXXX" className="input" />
                  <fieldset>
                    <legend className="label">{L.via}</legend>
                    <div className="seg w-full">
                      {[["whatsapp", L.wa], ["sms", L.sms]].map(([val, lab], i) => (
                        <label key={val} className="flex-1 cursor-pointer has-[:checked]:bg-white has-[:checked]:font-bold has-[:checked]:text-navy has-[:checked]:shadow-sm">
                          <input type="radio" name="channel" value={val} defaultChecked={i === 0} className="sr-only" />{lab}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <SubmitButton className="btn btn-outline w-full sm:w-auto">{L.send}</SubmitButton>
                </form>
              </details>
            </>
          )}
        </div>
        {verify === "code" && pending && (
          <form action={cancelPhoneVerify} className="mt-2">{hidden}<button className="h-10 text-[14px] text-mist hover:text-navy">{L.cancel}</button></form>
        )}
      </section>

      <form action={saveNotificationPrefs}>
        {hidden}
        <h2 className="list-label">{L.channels}</h2>
        <div className="list">
          <Row icon={<Mail className="h-5 w-5" />} title={L.email} sub={v.email}><Switch name="notify_email" on={v.notify_email !== false} /></Row>
          <Row icon={<MessageCircle className="h-5 w-5" />} title={L.wa} sub={L.waSub}><Switch name="notify_whatsapp" on={v.notify_whatsapp !== false} /></Row>
          <Row icon={<Smartphone className="h-5 w-5" />} title={L.sms} sub={verified ? L.smsSub : L.smsNeeds}><Switch name="notify_sms" on={!!v.notify_sms && verified} disabled={!verified} /></Row>
        </div>

        <h2 className="list-label">{L.what}</h2>
        <div className="list">
          {CATEGORIES.map((c) => (
            <fieldset key={c} className="px-4 py-4 sm:px-5">
              <legend className="sr-only">{L.cats[c][0]}</legend>
              <div className="sm:flex sm:items-center sm:gap-4">
                <div className="min-w-0 flex-1"><p className="text-[15px] font-bold text-ink">{L.cats[c][0]}</p><p className="text-[13px] leading-5 text-mist">{L.cats[c][1]}</p></div>
                <div className="mt-3 flex flex-wrap gap-2 sm:mt-0 sm:shrink-0">
                  {CHANNELS.map((ch) => (
                    <label key={ch} className={clsx("inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-line px-3 text-[13px] text-ink-2 transition-colors has-[:checked]:border-navy has-[:checked]:bg-navy has-[:checked]:text-white", ch === "sms" && !verified && "pointer-events-none opacity-40")}>
                      <input type="checkbox" name={`${c}.${ch}`} defaultChecked={prefs[c][ch] && (ch !== "sms" || verified)} disabled={ch === "sms" && !verified} className="sr-only" />
                      {icon[ch]}{L.ch[ch]}
                    </label>
                  ))}
                </div>
              </div>
            </fieldset>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-2 text-[13px] text-mist"><AppWindow className="h-4 w-4 shrink-0" />{L.inapp}</p>

        <section className="mt-6 rounded-[20px] bg-sky p-4 sm:p-5">
          <p className="text-[13px] font-bold text-mist">{L.preview}</p>
          <div className="mt-3 max-w-sm rounded-[18px] rounded-ss-[6px] bg-white p-3.5 text-[14px] leading-6 text-ink shadow-sm">
            {L.previewMsg} <span className="text-navy underline" dir="ltr">mashbak.org/app/activity</span>
            <span className="mt-1 block text-end text-[11px] text-mist" dir="ltr">09:41</span>
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-20 border-t border-line bg-white/95 p-3 backdrop-blur lg:static lg:mt-6 lg:border-0 lg:bg-transparent lg:p-0">
          <SubmitButton className="btn btn-primary btn-lg w-full lg:w-auto">{L.save}</SubmitButton>
        </div>
      </form>
    </div>
  );
}
