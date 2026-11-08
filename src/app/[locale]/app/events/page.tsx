import { CommunityTabs } from "@/components/shell/CommunityTabs";
import { EmptyState, FilterChips, PageTitle } from "@/components/shell/page";
import { EventRow } from "@/components/v2";
import { shellDict } from "@/i18n/shell";
import { repo } from "@/lib/data";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function AppEvents({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  const S = shellDict[locale];
  const v = await requireMember(locale);
  const f = sp((await searchParams).f) ?? "upcoming";
  const events = await repo.listEvents({ when: f === "past" ? "past" : "upcoming", viewerId: v.id });
  const list = f === "mine" ? events.filter((e) => e.my_registration) : events;
  const b = `/${locale}/app`;
  const labels = { registered: t.events.registered, online: t.events.online, waitlist: t.events.waitlisted };
  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle title={S.community} />
      <CommunityTabs base={b} S={S} active="events" />
      <FilterChips items={[
        { href: `${b}/events`, label: t.events.upcoming, on: f === "upcoming" },
        { href: `${b}/events?f=mine`, label: t.events.registered, on: f === "mine" },
        { href: `${b}/events?f=past`, label: t.events.past, on: f === "past" },
      ]} />
      {list.length ? <div className="list">{list.map((e) => <EventRow key={e.id} e={e} locale={locale} href={`${b}/events/${e.id}`} labels={labels} />)}</div>
        : <EmptyState title={t.events.noEvents} />}
    </div>
  );
}
