import { Bell } from "lucide-react";
import Link from "next/link";
import { markNotificationsRead } from "@/app/actions";
import { Empty, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import { tr } from "@/i18n/config";
import { repo } from "@/lib/data";
import { fmtRelative } from "@/lib/format";
import { pageLocale, type LocaleParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function Notifications({ params }: LocaleParams) {
  const { locale, t } = await pageLocale(params);
  const v = await requireMember(locale);
  const list = await repo.listNotifications(v.id);
  const unread = list.some((n) => !n.read_at);
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t.app.notifications.title} actions={unread ? (
        <form action={markNotificationsRead}><input type="hidden" name="locale" value={locale} /><SubmitButton className="btn btn-outline btn-sm">{t.app.notifications.markAll}</SubmitButton></form>
      ) : null} />
      {list.length === 0 ? <Empty>{t.app.notifications.empty}</Empty> : (
        <ul className="card divide-y divide-line overflow-hidden">
          {list.map((n) => (
            <li key={n.id}>
              <Link href={n.link ? `/${locale}${n.link}` : "#"} className={`flex items-start gap-4 p-5 transition hover:bg-paper ${n.read_at ? "" : "bg-mint-soft/40"}`}>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${n.read_at ? "bg-paper text-mist" : "bg-mint text-navy-ink"}`}><Bell className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-ink">{tr(n.title, locale)}</span>
                  {tr(n.body, locale) && <span className="mt-1 line-clamp-2 block text-sm text-ink-2">{tr(n.body, locale)}</span>}
                  <span className="mt-1 block text-xs text-mist">{fmtRelative(n.created_at, locale)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
