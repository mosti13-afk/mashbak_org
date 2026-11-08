import { ArrowRight, Briefcase, Search } from "lucide-react";
import Link from "next/link";
import { EventCard, JobRow } from "@/components/cards";
import { Avatar, Empty } from "@/components/ui";
import { tr } from "@/i18n/config";
import { repo } from "@/lib/data";
import { displayName, fmtRelative, profileStrength } from "@/lib/format";
import { pageLocale, type LocaleParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function Dashboard({ params }: LocaleParams) {
  const { locale, t } = await pageLocale(params);
  const v = await requireMember(locale);
  const [events, jobs, cons, notes] = await Promise.all([
    repo.listEvents({ when: "upcoming", viewerId: v.id }),
    repo.listJobs({ viewerId: v.id }),
    repo.listConnections(v.id),
    repo.listNotifications(v.id),
  ]);
  const mine = events.filter((e) => e.my_registration);
  const others = events.filter((e) => !e.my_registration);
  const incoming = cons.filter((c) => c.direction === "incoming" && c.status === "pending");
  const myJobs = jobs.filter((j) => j.posted_by === v.id && j.referral_count > 0);
  const strength = profileStrength(v);
  const first = displayName(v, locale).split(" ")[0];

  return (
    <div className="space-y-8">
      <section className="mesh relative overflow-hidden rounded-[1.75rem] p-6 text-white sm:p-8">
        <div className="grid-lines absolute inset-0" aria-hidden />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <h1 className="h-display text-3xl text-white sm:text-4xl">{t.app.hello}{locale === "ar" ? "،" : ","} {first}</h1>
            <p className="mt-1 text-white/70">{t.app.dashSub}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={`/${locale}/app/members`} className="btn btn-mint btn-sm"><Search className="h-4 w-4" />{t.app.findMembers}</Link>
              <Link href={`/${locale}/app/jobs/new`} className="btn btn-sm border border-white/25 text-white hover:bg-white/10"><Briefcase className="h-4 w-4" />{t.app.postJob}</Link>
            </div>
          </div>
          <Link href={`/${locale}/app/profile`} className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur hover:bg-white/15">
            <div className="relative h-16 w-16">
              <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgb(255 255 255 / .15)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#78bf98" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${strength * 0.974} 100`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-black">{strength}%</span>
            </div>
            <div>
              <p className="text-xs font-bold text-mint">{t.app.profileStrength}</p>
              <p className="font-black">{strength < 100 ? t.app.completeProfile : t.common.saved}</p>
            </div>
          </Link>
        </div>
      </section>

      {(incoming.length > 0 || myJobs.length > 0) && (
        <section>
          <h2 className="mb-3 text-lg font-black text-navy-ink">{t.app.requests}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {incoming.map((c) => (
              <Link key={c.id} href={`/${locale}/app/connections`} className="card card-hover flex items-center gap-3 p-4">
                <Avatar src={c.other.avatar_url} name={displayName(c.other, locale)} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-black">{displayName(c.other, locale)}</p>
                  <p className="truncate text-sm text-ink-2">{c.message}</p>
                </div>
                <span className="badge badge-amber">{t.app.connections.pending}</span>
              </Link>
            ))}
            {myJobs.map((j) => (
              <Link key={j.id} href={`/${locale}/app/jobs/${j.id}`} className="card card-hover flex items-center gap-3 p-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mint-soft text-green-deep"><Briefcase className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-black" dir="auto">{j.title}</p>
                  <p className="text-sm text-ink-2">{t.app.jobs.requests}: {j.referral_count}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black text-navy-ink">{t.app.newJobs}</h2>
            <Link href={`/${locale}/app/jobs`} className="flex items-center gap-1 text-sm font-bold text-navy">{t.common.viewAll}<ArrowRight className="flip-rtl h-4 w-4" /></Link>
          </div>
          <div className="space-y-3">
            {jobs.filter((j) => j.posted_by !== v.id).slice(0, 4).map((j) => <JobRow key={j.id} j={j} locale={locale} t={t} />)}
          </div>
        </section>
        <section className="space-y-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-black text-navy-ink">{t.app.upcoming}</h2>
              <Link href={`/${locale}/app/events`} className="flex items-center gap-1 text-sm font-bold text-navy">{t.common.viewAll}<ArrowRight className="flip-rtl h-4 w-4" /></Link>
            </div>
            <div className="space-y-3">
              {mine.length ? mine.slice(0, 3).map((e) => <EventCard key={e.id} e={e} locale={locale} t={t} href={`/${locale}/app/events/${e.id}`} />)
                : <Empty action={<Link href={`/${locale}/app/events`} className="btn btn-outline btn-sm">{t.events.title}</Link>}>{t.app.nothingUpcoming}</Empty>}
              {others.slice(0, mine.length ? 1 : 2).map((e) => <EventCard key={e.id} e={e} locale={locale} t={t} href={`/${locale}/app/events/${e.id}`} />)}
            </div>
          </div>
          {notes.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-black text-navy-ink">{t.app.nav.notifications}</h2>
              <ul className="card divide-y divide-line">
                {notes.slice(0, 4).map((n) => (
                  <li key={n.id}>
                    <Link href={n.link ? `/${locale}${n.link}` : "#"} className="flex items-start gap-3 p-4 hover:bg-paper">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read_at ? "bg-line" : "bg-mint"}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold">{tr(n.title, locale)}</span>
                        <span className="text-xs text-mist">{fmtRelative(n.created_at, locale)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
