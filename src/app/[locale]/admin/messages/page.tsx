import { markMessageReplied, replyToMessage } from "@/app/actions";
import { Empty, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import { repo } from "@/lib/data";
import { fmtRelative } from "@/lib/format";
import { pageLocale, type LocaleParams } from "@/lib/page";
import { requireAdmin } from "@/lib/session";

export default async function AdminMessages({ params }: LocaleParams) {
  const { locale, t } = await pageLocale(params);
  await requireAdmin(locale);
  const msgs = await repo.listMessages();
  const R = { ar: { ph: "اكتب ردًا يصل إلى بريد المرسل من info@mashbak.org", send: "إرسال الرد" }, en: { ph: "Write a reply, it is emailed from info@mashbak.org", send: "Send reply" }, he: { ph: "כתבו תשובה שתישלח במייל מ-info@mashbak.org", send: "שליחת תשובה" } }[locale];
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t.admin.nav.messages} />
      {msgs.length === 0 ? <Empty>{t.common.none}</Empty> : (
        <ul className="space-y-3">
          {msgs.map((m) => (
            <li key={m.id} className={`card p-5 ${m.replied_at ? "opacity-70" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-black">{m.name} {m.subject && <span className="font-semibold text-ink-2">· {m.subject}</span>}</p>
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent(m.subject ?? "Mashbak")}`} className="text-sm font-semibold text-navy hover:underline" dir="ltr">{m.email}</a>
                  {m.phone && <span className="ms-3 text-sm text-mist" dir="ltr">{m.phone}</span>}
                </div>
                <span className="text-xs text-mist">{fmtRelative(m.created_at, locale)}</span>
              </div>
              <p className="mt-3 whitespace-pre-line text-ink-2" dir="auto">{m.message}</p>
              <div className="mt-4 text-end">
                {m.replied_at ? <span className="badge badge-mint">{t.admin.messages.replied}</span> : (
                  <div className="space-y-3 text-start">
                    <form action={replyToMessage} className="space-y-2">
                      <input type="hidden" name="locale" value={locale} /><input type="hidden" name="id" value={m.id} />
                      <textarea name="reply" rows={3} required className="textarea min-h-0" placeholder={R.ph} dir="auto" />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <select name="lang" defaultValue={/[\u0590-\u05FF]/.test(m.message) ? "he" : /[\u0600-\u06FF]/.test(m.message) ? "ar" : "en"} className="select h-9 w-auto py-0 text-sm">
                          <option value="ar">العربية</option><option value="en">English</option><option value="he">עברית</option>
                        </select>
                        <SubmitButton className="btn btn-primary btn-sm">{R.send}</SubmitButton>
                      </div>
                    </form>
                    <form action={markMessageReplied} className="text-end">
                      <input type="hidden" name="locale" value={locale} /><input type="hidden" name="id" value={m.id} />
                      <SubmitButton className="btn btn-ghost btn-sm">{t.admin.messages.markReplied}</SubmitButton>
                    </form>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
