import { Plus } from "lucide-react";
import Link from "next/link";
import { EventCard } from "@/components/cards";
import { Empty, PageHeader, Tabs } from "@/components/ui";
import { repo } from "@/lib/data";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireAdmin } from "@/lib/session";

export default async function AdminEvents({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  await requireAdmin(locale);
  const when = sp((await searchParams).when) === "past" ? "past" : "upcoming";
  const events = await repo.listEvents({ when, includeDrafts: true });
  const b = `/${locale}/admin/events`;
  return (
    <>
      <PageHeader title={t.admin.nav.events} actions={<Link href={`${b}/new`} className="btn btn-primary"><Plus className="h-4 w-4" />{t.admin.newEvent}</Link>} />
      <Tabs items={[{ href: b, label: t.events.upcoming, active: when === "upcoming" }, { href: `${b}?when=past`, label: t.events.past, active: when === "past" }]} />
      {events.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {events.map((e) => (
            <div key={e.id} className="relative">
              <EventCard e={e} locale={locale} t={t} href={`${b}/${e.id}`} />
              {e.status !== "published" && <span className="badge badge-amber absolute end-3 top-3">{t.admin.statuses[e.status === "draft" ? "draft" : "cancelled"]}</span>}
            </div>
          ))}
        </div>
      ) : <Empty>{t.events.noEvents}</Empty>}
    </>
  );
}
