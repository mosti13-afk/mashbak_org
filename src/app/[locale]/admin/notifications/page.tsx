import { CheckCircle2, CircleAlert, Mail, MessageCircle, Sparkles } from "lucide-react";
import { saveNotificationTemplate, sendBroadcast, sendTestEmail } from "@/app/actions";
import { L10nFields } from "@/components/admin/L10nFields";
import { Check, Field, Notice, PageHeader, Tabs } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import type { Locale } from "@/i18n/config";
import { repo } from "@/lib/data";
import { fmtRelative } from "@/lib/format";
import { emailConfigured, whatsappConfigured } from "@/lib/notify";
import { listLog, listTemplateRows } from "@/lib/notify/store";
import { TEMPLATES, TEMPLATE_KEYS, waName, type Template } from "@/lib/notify/templates";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireAdmin } from "@/lib/session";

const C: Record<Locale, Record<string, string>> = {
  ar: {
    channels: "قنوات الإرسال", email: "البريد الإلكتروني", wa: "واتساب للأعمال", ai: "مشبكني (ذكاء اصطناعي)", on: "مفعّل", off: "غير مفعّل",
    emailHint: "يُرسل من info@mashbak.org عبر SMTP. أضف SMTP_USER و SMTP_PASS في Cloud Run.", waHint: "WhatsApp Cloud API. أضف WHATSAPP_TOKEN و WHATSAPP_PHONE_NUMBER_ID، وأنشئ القوالب في Meta.", aiHint: "أضف ANTHROPIC_API_KEY في Cloud Run.",
    test: "إرسال تجربة", testTo: "إلى بريد", testPhone: "رقم واتساب (اختياري)", template: "القالب", lang: "اللغة", tested: "تم إرسال التجربة. راجع سجل الإرسال أدناه.",
    broadcast: "رسالة جماعية للأعضاء", bTitle: "العنوان", bMsg: "نص الرسالة", bLink: "رابط داخلي (اختياري)", audience: "الجمهور", all: "كل الأعضاء الفعّالين", mentors: "المستعدون للإرشاد",
    inapp: "تصل دائمًا كإشعار داخل المنصة.", alsoEmail: "أرسل بالبريد أيضًا", alsoWa: "أرسل بواتساب أيضًا", sendB: "إرسال", sent: "تم الإرسال إلى {n} عضو.",
    overview: "نظرة عامة", templates: "القوالب", log: "سجل الإرسال", emailOn: "إرسال بريد", waOn: "إرسال واتساب", waName: "اسم قالب واتساب في Meta", waLang: "لغة القالب (اتركه فارغًا للغة العضو)",
    subject: "الموضوع", body: "النص", vars: "متغيرات متاحة", overrideHint: "اترك الحقل فارغًا لاستخدام النص الافتراضي.", save: "حفظ", saved: "تم الحفظ.", empty: "لا توجد رسائل بعد.",
    when: "الوقت", channel: "القناة", to: "إلى", status: "الحالة",
  },
  en: {
    channels: "Delivery channels", email: "Email", wa: "WhatsApp Business", ai: "Mashbakni (AI)", on: "On", off: "Off",
    emailHint: "Sent from info@mashbak.org over SMTP. Add SMTP_USER and SMTP_PASS in Cloud Run.", waHint: "WhatsApp Cloud API. Add WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID and create the templates in Meta.", aiHint: "Add ANTHROPIC_API_KEY in Cloud Run.",
    test: "Send a test", testTo: "To email", testPhone: "WhatsApp number (optional)", template: "Template", lang: "Language", tested: "Test sent. Check the delivery log below.",
    broadcast: "Broadcast to members", bTitle: "Title", bMsg: "Message", bLink: "Internal link (optional)", audience: "Audience", all: "All active members", mentors: "Open to mentoring",
    inapp: "Always delivered as an in-app notification.", alsoEmail: "Also send by email", alsoWa: "Also send on WhatsApp", sendB: "Send", sent: "Sent to {n} members.",
    overview: "Overview", templates: "Templates", log: "Delivery log", emailOn: "Send email", waOn: "Send WhatsApp", waName: "WhatsApp template name in Meta", waLang: "Template language (empty = member's language)",
    subject: "Subject", body: "Body", vars: "Available variables", overrideHint: "Leave empty to use the default text.", save: "Save", saved: "Saved.", empty: "No messages yet.",
    when: "When", channel: "Channel", to: "To", status: "Status",
  },
  he: {
    channels: "ערוצי שליחה", email: "אימייל", wa: "וואטסאפ עסקי", ai: "משבקני (AI)", on: "פעיל", off: "כבוי",
    emailHint: "נשלח מ-info@mashbak.org דרך SMTP. הוסיפו SMTP_USER ו-SMTP_PASS ב-Cloud Run.", waHint: "WhatsApp Cloud API. הוסיפו WHATSAPP_TOKEN ו-WHATSAPP_PHONE_NUMBER_ID וצרו את התבניות ב-Meta.", aiHint: "הוסיפו ANTHROPIC_API_KEY ב-Cloud Run.",
    test: "שליחת בדיקה", testTo: "לאימייל", testPhone: "מספר וואטסאפ (אופציונלי)", template: "תבנית", lang: "שפה", tested: "הבדיקה נשלחה. בדקו את יומן השליחה למטה.",
    broadcast: "הודעה לכל החברים", bTitle: "כותרת", bMsg: "תוכן", bLink: "קישור פנימי (אופציונלי)", audience: "קהל", all: "כל החברים הפעילים", mentors: "פתוחים למנטורינג",
    inapp: "תמיד נשלח גם כהתראה במערכת.", alsoEmail: "לשלוח גם במייל", alsoWa: "לשלוח גם בוואטסאפ", sendB: "שליחה", sent: "נשלח ל-{n} חברים.",
    overview: "סקירה", templates: "תבניות", log: "יומן שליחה", emailOn: "שליחת מייל", waOn: "שליחת וואטסאפ", waName: "שם תבנית הוואטסאפ ב-Meta", waLang: "שפת התבנית (ריק = שפת החבר/ה)",
    subject: "נושא", body: "תוכן", vars: "משתנים זמינים", overrideHint: "השאירו ריק כדי להשתמש בטקסט ברירת המחדל.", save: "שמירה", saved: "נשמר.", empty: "אין הודעות עדיין.",
    when: "מתי", channel: "ערוץ", to: "אל", status: "סטטוס",
  },
};

export default async function AdminNotifications({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  await requireAdmin(locale);
  const q = await searchParams;
  const L = C[locale];
  const tab = sp(q.tab) ?? "overview";
  const b = `/${locale}/admin/notifications`;
  const [rows, log, members] = await Promise.all([listTemplateRows(), listLog(), repo.listAllMembers()]);
  const sectors = [...new Set(members.filter((m) => m.status === "active" && m.sector).map((m) => m.sector!))].sort();
  const status = [
    { icon: Mail, label: L.email, on: emailConfigured(), hint: L.emailHint },
    { icon: MessageCircle, label: L.wa, on: whatsappConfigured(), hint: L.waHint },
    { icon: Sparkles, label: L.ai, on: !!process.env.ANTHROPIC_API_KEY, hint: L.aiHint },
  ];
  const hidden = <input type="hidden" name="locale" value={locale} />;

  return (
    <>
      <PageHeader title={t.admin.nav.notifications} />
      <Tabs items={[
        { href: b, label: L.overview, active: tab === "overview" },
        { href: `${b}?tab=templates`, label: L.templates, active: tab === "templates" },
        { href: `${b}?tab=log`, label: L.log, active: tab === "log", count: log.filter((r) => r.status === "failed").length || undefined },
      ]} />
      {sp(q.tested) && <Notice>{L.tested}</Notice>}
      {sp(q.sent) && <Notice>{L.sent.replace("{n}", sp(q.sent)!)}</Notice>}
      {sp(q.saved) && <Notice>{L.saved}</Notice>}

      {tab === "overview" && (
        <div className="space-y-5">
          <section className="grid gap-3 md:grid-cols-3">
            {status.map((s) => (
              <div key={s.label} className="card p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint-soft text-navy"><s.icon className="h-5 w-5" /></span>
                  <p className="flex-1 font-bold">{s.label}</p>
                  {s.on ? <span className="badge badge-mint"><CheckCircle2 className="h-3.5 w-3.5" />{L.on}</span> : <span className="badge badge-gray"><CircleAlert className="h-3.5 w-3.5" />{L.off}</span>}
                </div>
                {!s.on && <p className="mt-3 text-xs leading-5 text-mist">{s.hint}</p>}
              </div>
            ))}
          </section>

          <div className="grid gap-5 lg:grid-cols-2">
            <form action={sendBroadcast} className="card space-y-3 p-5">
              {hidden}
              <h2 className="font-bold">{L.broadcast}</h2>
              <Field label={L.bTitle}><input name="title" required maxLength={140} className="input" dir="auto" /></Field>
              <Field label={L.bMsg}><textarea name="message" required rows={4} className="textarea" dir="auto" /></Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={L.audience}>
                  <select name="audience" className="select">
                    <option value="all">{L.all}</option><option value="mentors">{L.mentors}</option>
                    {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label={L.bLink}><input name="link" className="input" dir="ltr" placeholder="/app/events" /></Field>
              </div>
              <p className="text-xs text-mist">{L.inapp}</p>
              <div className="flex flex-wrap gap-4"><Check name="email" label={L.alsoEmail} /><Check name="whatsapp" label={L.alsoWa} /></div>
              <SubmitButton className="btn btn-primary" confirm={`${L.sendB}?`}>{L.sendB}</SubmitButton>
            </form>

            <form action={sendTestEmail} className="card h-fit space-y-3 p-5">
              {hidden}
              <h2 className="font-bold">{L.test}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={L.template}>
                  <select name="template" className="select">{TEMPLATE_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}</select>
                </Field>
                <Field label={L.lang}>
                  <select name="lang" defaultValue={locale} className="select"><option value="ar">العربية</option><option value="en">English</option><option value="he">עברית</option></select>
                </Field>
              </div>
              <Field label={L.testTo}><input name="to" type="email" className="input" dir="ltr" placeholder="info@mashbak.org" /></Field>
              <Field label={L.testPhone}><input name="phone" className="input" dir="ltr" placeholder="+9725..." /></Field>
              <SubmitButton className="btn btn-outline">{L.test}</SubmitButton>
            </form>
          </div>
        </div>
      )}

      {tab === "templates" && (
        <div className="space-y-3">
          {TEMPLATE_KEYS.map((k) => {
            const def: Template = TEMPLATES[k];
            const row = rows.find((r) => r.key === k);
            const vars = [...new Set([...(def.body.ar ?? "").matchAll(/\{(\w+)\}/g), ...(def.subject.ar ?? "").matchAll(/\{(\w+)\}/g)].map((m) => `{${m[1]}}`))];
            return (
              <details key={k} id={k} className="card overflow-hidden">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 p-4">
                  <span className="flex-1 font-bold">{def.subject[locale]}</span>
                  <code className="text-xs text-mist" dir="ltr">{k}</code>
                  {(row ? row.email_enabled : true) && <span className="badge badge-navy"><Mail className="h-3 w-3" /></span>}
                  {(row ? row.whatsapp_enabled : !!def.wa) && def.wa && <span className="badge badge-mint"><MessageCircle className="h-3 w-3" /></span>}
                </summary>
                <form action={saveNotificationTemplate} className="space-y-3 border-t border-line p-5">
                  {hidden}<input type="hidden" name="key" value={k} />
                  <div className="flex flex-wrap gap-5">
                    <Check name="email_enabled" label={L.emailOn} defaultChecked={row ? row.email_enabled : true} />
                    {def.wa && <Check name="whatsapp_enabled" label={L.waOn} defaultChecked={row ? row.whatsapp_enabled : true} />}
                  </div>
                  {def.wa && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label={L.waName}><input name="wa_name" defaultValue={row?.whatsapp_template?.name ?? ""} placeholder={waName(k)} className="input" dir="ltr" /></Field>
                      <Field label={L.waLang}><input name="wa_lang" defaultValue={row?.whatsapp_template?.lang ?? ""} placeholder="ar / en / he" className="input" dir="ltr" /></Field>
                    </div>
                  )}
                  <p className="text-xs text-mist">{L.vars}: <span dir="ltr">{vars.join(" ")}</span> · {L.overrideHint}</p>
                  <L10nFields name="subject" labels={[`${L.subject} (AR)`, "EN", "HE"]} value={{ ar: row?.subject?.ar ?? "", en: row?.subject?.en ?? "", he: row?.subject?.he ?? "" }} />
                  <L10nFields name="body" labels={[`${L.body} (AR)`, "EN", "HE"]} value={{ ar: row?.body?.ar ?? "", en: row?.body?.en ?? "", he: row?.body?.he ?? "" }} textarea rows={5} />
                  <details className="rounded-xl bg-sky p-3 text-sm text-ink-2">
                    <summary className="cursor-pointer font-bold">Default</summary>
                    <p className="mt-2 whitespace-pre-line" dir="auto">{def.body[locale]}</p>
                  </details>
                  <SubmitButton className="btn btn-primary">{L.save}</SubmitButton>
                </form>
              </details>
            );
          })}
        </div>
      )}

      {tab === "log" && (
        log.length === 0 ? <p className="card p-6 text-center text-mist">{L.empty}</p> : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-sky text-start text-xs text-mist">
                <tr><th className="p-3 text-start">{L.when}</th><th className="p-3 text-start">{L.channel}</th><th className="p-3 text-start">{L.template}</th><th className="p-3 text-start">{L.to}</th><th className="p-3 text-start">{L.status}</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {log.map((r, i) => (
                  <tr key={r.id ?? i}>
                    <td className="whitespace-nowrap p-3 text-mist">{fmtRelative(r.created_at, locale)}</td>
                    <td className="p-3">{r.channel === "email" ? <Mail className="h-4 w-4 text-navy" /> : <MessageCircle className="h-4 w-4 text-mint" />}</td>
                    <td className="p-3"><code className="text-xs">{r.template}</code></td>
                    <td className="p-3" dir="ltr">{r.recipient}</td>
                    <td className="p-3">
                      <span className={`badge ${r.status === "sent" ? "badge-mint" : r.status === "failed" ? "badge-red" : "badge-gray"}`}>{r.status}</span>
                      {r.error && <p className="mt-1 max-w-xs truncate text-xs text-mist" title={r.error}>{r.error}</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </>
  );
}
