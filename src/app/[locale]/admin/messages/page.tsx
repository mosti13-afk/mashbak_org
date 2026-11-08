import { markMessageReplied } from "@/app/actions";
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
                  <form action={markMessageReplied}>
                    <input type="hidden" name="locale" value={locale} /><input type="hidden" name="id" value={m.id} />
                    <SubmitButton className="btn btn-outline btn-sm">{t.admin.messages.markReplied}</SubmitButton>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
