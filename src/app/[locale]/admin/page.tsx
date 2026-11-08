import { ArrowRight, Briefcase, CalendarDays, Handshake, Inbox, Send, Users } from "lucide-react";
import Link from "next/link";
import { seedDefaults } from "@/app/actions";
import { EventCard } from "@/components/cards";
import { SubmitButton } from "@/components/ui/client";
import { PageHeader, StatusBadge } from "@/components/ui";
import { repo } from "@/lib/data";
import { fmtRelative } from "@/lib/format";
import { pageLocale, type LocaleParams } from "@/lib/page";
import { requireAdmin } from "@/lib/session";

export default async function AdminHome({ params }: LocaleParams) {
  const { locale, t } = await pageLocale(params);
  await requireAdmin(locale);
  const [s, apps, events, programs, faqs, reviews] = await Promise.all([repo.adminStats(), repo.listApplications(), repo.listEvents({ when: "upcoming", includeDrafts: true }),
    repo.listPrograms({ all: true }), repo.listFaqs({ all: true }), repo.listReviews({ all: true })]);
  const cmsEmpty = !programs.length && !faqs.length && !reviews.length;
  const b = `/${locale}/admin`;
  const cards = [
    { n: s.members, l: t.admin.stats.members, I: Users, href: `${b}/members` },
    { n: s.pending, l: t.admin.stats.pending, I: Inbox, href: `${b}/applications`, hot: s.pending > 0 },
    { n: s.events, l: t.admin.stats.events, I: CalendarDays, href: `${b}/events` },
    { n: s.jobs, l: t.admin.stats.jobs, I: Briefcase, href: `${b}/jobs` },
    { n: s.connections, l: t.admin.stats.connections, I: Handshake, href: `${b}/members` },
    { n: s.referrals, l: t.admin.stats.referrals, I: Send, href: `${b}/jobs` },
  ];
  return (
    <>
      <PageHeader title={t.admin.nav.overview} />
      {cmsEmpty && (
        <form action={seedDefaults} className="card mb-6 flex flex-wrap items-center justify-between gap-4 border-mint bg-mint-soft/60 p-5">
          <input type="hidden" name="locale" value={locale} />
          <div className="max-w-xl"><p className="font-black text-navy-ink">{t.admin.seedTitle}</p><p className="text-sm text-ink-2">{t.admin.seedBody}</p></div>
          <SubmitButton className="btn btn-primary">{t.admin.seedCta}</SubmitButton>
        </form>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map(({ n, l, I, href, hot }) => (
          <Link key={l} href={href} className={`card card-hover p-5 ${hot ? "border-mint bg-mint-soft/50" : ""}`}>
            <I className="h-5 w-5 text-green" />
            <p className="mt-3 text-3xl font-black text-navy-ink">{n}</p>
            <p className="text-sm font-semibold text-ink-2">{l}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black">{t.admin.recentApps}</h2>
            <Link href={`${b}/applications`} className="flex items-center gap-1 text-sm font-bold text-navy">{t.common.viewAll}<ArrowRight className="flip-rtl h-4 w-4" /></Link>
          </div>
          <ul className="card divide-y divide-line">
            {apps.slice(0, 6).map((a) => (
              <li key={a.id}>
                <Link href={`${b}/applications?id=${a.id}`} className="flex items-center gap-3 p-4 hover:bg-paper">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{a.full_name}</p>
                    <p className="truncate text-sm text-ink-2" dir="auto">{a.headline}{a.company ? ` · ${a.company}` : ""} · {a.years_experience} {t.common.yearsShort}</p>
                  </div>
                  <span className="text-xs text-mist">{fmtRelative(a.created_at, locale)}</span>
                  <StatusBadge status={a.status} label={t.admin.statuses[a.status]} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black">{t.admin.stats.events}</h2>
            <Link href={`${b}/events/new`} className="btn btn-primary btn-sm">{t.admin.newEvent}</Link>
          </div>
          <div className="space-y-3">{events.slice(0, 4).map((e) => <EventCard key={e.id} e={e} locale={locale} t={t} href={`${b}/events/${e.id}`} />)}</div>
        </section>
      </div>
    </>
  );
}
