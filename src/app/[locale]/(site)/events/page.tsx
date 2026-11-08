import { PageHero } from "@/components/site/sections";
import { EmptyState, SectionTabs } from "@/components/shell/page";
import { EventRow } from "@/components/v2";
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
  const labels = { registered: t.events.registered, online: t.events.online, waitlist: t.events.waitlisted };
  return (
    <>
      <PageHero narrow a={t.events.title} sub={t.events.sub} />
      <section className="container-x max-w-3xl pb-16">
        <SectionTabs items={[
          { href: `/${locale}/events`, label: t.events.upcoming, active: when === "upcoming" },
          { href: `/${locale}/events?when=past`, label: t.events.past, active: when === "past" },
        ]} />
        {events.length ? (
          <div className="list">{events.map((e) => <EventRow key={e.id} e={e} locale={locale} href={`/${locale}/events/${e.id}`} labels={labels} />)}</div>
        ) : <EmptyState title={t.events.noEvents} />}
      </section>
    </>
  );
}
