import { EventCard } from "@/components/cards";
import { Empty, PageHeader, Tabs } from "@/components/ui";
import { repo } from "@/lib/data";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { getViewer } from "@/lib/session";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { t } = await pageLocale(params);
  return { title: t.events.title };
}

export default async function Events({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  const when = sp((await searchParams).when) === "past" ? "past" : "upcoming";
  const viewer = await getViewer();
  const events = await repo.listEvents({ when, viewerId: viewer?.id });
  return (
    <div className="container-x py-14 sm:py-20">
      <PageHeader eyebrow={t.home.eventsEyebrow} title={t.events.title} sub={t.events.sub} />
      <Tabs items={[
        { href: `/${locale}/events`, label: t.events.upcoming, active: when === "upcoming" },
        { href: `/${locale}/events?when=past`, label: t.events.past, active: when === "past" },
      ]} />
      {events.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((e) => <EventCard key={e.id} e={e} locale={locale} t={t} href={`/${locale}/events/${e.id}`} />)}
        </div>
      ) : <Empty>{t.events.noEvents}</Empty>}
    </div>
  );
}
