import { EventCard } from "@/components/cards";
import { Empty, PageHeader, Tabs } from "@/components/ui";
import { repo } from "@/lib/data";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function AppEvents({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  const v = await requireMember(locale);
  const tab = sp((await searchParams).tab) ?? "upcoming";
  const events = await repo.listEvents({ when: tab === "past" ? "past" : "upcoming", viewerId: v.id });
  const list = tab === "mine" ? events.filter((e) => e.my_registration) : events;
  const b = `/${locale}/app/events`;
  return (
    <>
      <PageHeader title={t.events.title} sub={t.events.sub} />
      <Tabs items={[
        { href: b, label: t.events.upcoming, active: tab === "upcoming" },
        { href: `${b}?tab=mine`, label: t.events.registered, active: tab === "mine" },
        { href: `${b}?tab=past`, label: t.events.past, active: tab === "past" },
      ]} />
      {list.length ? (
        <div className="grid gap-4 lg:grid-cols-2">{list.map((e) => <EventCard key={e.id} e={e} locale={locale} t={t} href={`${b}/${e.id}`} />)}</div>
      ) : <Empty>{t.events.noEvents}</Empty>}
    </>
  );
}
