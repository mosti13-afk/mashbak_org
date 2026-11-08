import { ArrowLeft, Briefcase, Building2, CheckCircle2, Circle, FileText, HandHelping, Inbox, MessageSquareText, Sparkles } from "lucide-react";
import Link from "next/link";
import { EventCard } from "@/components/cards";
import { Avatar } from "@/components/ui";
import { JobCard, MemberCardV2, Section } from "@/components/v2";
import { fmt, memberDict } from "@/i18n/member";
import { repo } from "@/lib/data";
import { displayName, fmtRelative } from "@/lib/format";
import { pageLocale, type LocaleParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

function dayHash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 4294967296;
}

export default async function Home({ params }: LocaleParams) {
  const { locale, t } = await pageLocale(params);
  const M = memberDict[locale];
  const v = await requireMember(locale);
  const b = `/${locale}/app`;
  const followed = await repo.followedCompanyIds(v.id);
  const [jobsFollow, jobsLatest, refs, cons, members, asks, events, pulse] = await Promise.all([
    followed.length ? repo.listJobs({ viewerId: v.id, companyIds: followed, limit: 6 }) : Promise.resolve([]),
    repo.listJobs({ viewerId: v.id, limit: 6 }),
    repo.listMyReferrals(v.id),
    repo.listConnections(v.id),
    repo.listMembers({ viewerId: v.id, chats: true }),
    repo.listAsks({ viewerId: v.id }),
    repo.listEvents({ when: "upcoming", viewerId: v.id }),
    repo.platformStats().catch(() => null),
  ]);
  const jobs = (jobsFollow.length ? jobsFollow : jobsLatest).slice(0, 4);
  const waitingRefs = refs.filter((r) => r.direction === "incoming" && r.status === "pending");
  const waitingChats = cons.filter((c) => c.direction === "incoming" && c.status === "pending");
  const day = new Date().toISOString().slice(0, 10);
  const people = members
    .filter((m) => !m.connection)
    .map((m) => ({ m, k: dayHash(`${v.id}|${day}|${m.id}`) * (m.sector && m.sector === v.sector ? 1.6 : 1) * (m.company_id && m.company_id !== v.company_id ? 1.2 : 1) * (m.help_offers?.length ? 1.3 : 1) }))
    .sort((a, z) => z.k - a.k).slice(0, 4).map((x) => x.m);
  const stats = await repo.memberStats(people.map((p) => p.id));
  const otherAsks = asks.filter((a) => a.member_id !== v.id && !a.my_reply).slice(0, 3);
  const first = displayName(v, locale).split(" ")[0];
  const steps = [
    { done: !!v.company_id, label: M.home.stepCompany, icon: Building2 },
    { done: !!v.help_offers?.length, label: M.home.stepHelp, icon: HandHelping },
    { done: !!v.cv_url, label: M.home.stepCv, icon: FileText },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="mx-auto max-w-5xl">
      <header className="relative overflow-hidden rounded-[24px] bg-navy px-5 py-6 text-white sm:px-8 sm:py-8">
        <span className="pointer-events-none absolute -end-16 -top-16 h-56 w-56 rounded-full bg-mint/25 blur-2xl" aria-hidden />
        <p className="relative text-[13px] text-white/70">{new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : locale === "he" ? "he-IL" : "en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</p>
        <h1 className="relative mt-1 text-[26px] font-bold sm:text-[32px]">{fmt(M.home.hello, { name: first })}</h1>
        <p className="relative mt-1 max-w-xl text-[15px] leading-7 text-white/85">{M.home.sub}</p>
        <div className="relative mt-5 flex flex-wrap gap-2">
          <Link href={`${b}/jobs`} className="inline-flex items-center gap-2 rounded-[14px] bg-white px-4 py-2.5 text-[14px] font-semibold text-navy"><Briefcase className="h-4 w-4" />{M.nav.jobs}</Link>
          <Link href={`${b}/mashbakni`} className="inline-flex items-center gap-2 rounded-[14px] bg-white/10 px-4 py-2.5 text-[14px] font-semibold text-white ring-1 ring-white/25 hover:bg-white/15"><Sparkles className="h-4 w-4 text-mint" />{M.nav.mashbakni}</Link>
          <Link href={`${b}/asks/new?kind=ask`} className="inline-flex items-center gap-2 rounded-[14px] bg-white/10 px-4 py-2.5 text-[14px] font-semibold text-white ring-1 ring-white/25 hover:bg-white/15"><MessageSquareText className="h-4 w-4 text-mint" />{M.asks.newAsk}</Link>
        </div>
      </header>

      {doneCount < 3 && (
        <section className="card mt-5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-ink">{M.home.setup}</h2>
              <p className="text-[13px] text-mist">{M.home.setupSub}</p>
            </div>
            <span className="text-[13px] font-semibold text-navy">{doneCount}/3</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-haze"><div className="h-full rounded-full bg-mint" style={{ width: `${(doneCount / 3) * 100}%` }} /></div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-3">
            {steps.map((s) => (
              <li key={s.label}>
                <Link href={`${b}/profile#edit`} className="flex items-center gap-2 rounded-[14px] border border-line px-3 py-2.5 text-[14px] hover:border-navy">
                  {s.done ? <CheckCircle2 className="h-5 w-5 shrink-0 text-mint" /> : <Circle className="h-5 w-5 shrink-0 text-line" />}
                  <span className={s.done ? "text-mist line-through" : "text-ink"}>{s.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(waitingRefs.length > 0 || waitingChats.length > 0) && (
        <Section title={M.home.waiting} sub={M.home.waitingSub} href={`${b}/requests`} more={M.home.seeAll}>
          <ul className="grid gap-3 md:grid-cols-2">
            {[...waitingRefs.map((r) => ({ id: r.id, who: r.requester, kind: M.requests.referral, what: `${r.job.title} · ${r.job.company}`, at: r.created_at })),
              ...waitingChats.map((c) => ({ id: c.id, who: c.other, kind: M.requests.chat, what: c.message, at: c.created_at }))].slice(0, 4).map((x) => (
              <li key={x.id}>
                <Link href={`${b}/requests`} className="card card-hover flex items-center gap-3 border-s-4 border-s-mint p-4">
                  <Avatar src={x.who.avatar_url} name={displayName(x.who, locale)} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-green-deep"><Inbox className="me-1 inline h-3.5 w-3.5" />{x.kind} · {fmtRelative(x.at, locale)}</p>
                    <p className="truncate font-semibold text-ink">{displayName(x.who, locale)}</p>
                    <p className="truncate text-[13px] text-ink-2" dir="auto">{x.what}</p>
                  </div>
                  <ArrowLeft className="h-4 w-4 shrink-0 text-mist ltr:rotate-180" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title={jobsFollow.length ? M.home.jobsFollow : M.home.jobsLatest} sub={jobsFollow.length ? undefined : M.home.noFollow} href={`${b}/jobs${jobsFollow.length ? "?tab=following" : ""}`} more={M.home.seeAll}>
        <div className="grid gap-3 md:grid-cols-2">{jobs.map((j) => <JobCard key={j.id} j={j} locale={locale} M={M} t={t} compact />)}</div>
      </Section>

      {people.length > 0 && (
        <Section title={M.home.meet} sub={M.home.meetSub} href={`${b}/members`} more={M.home.seeAll}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{people.map((m) => <MemberCardV2 key={m.id} m={m} locale={locale} M={M} stats={stats[m.id]} />)}</div>
        </Section>
      )}

      {otherAsks.length > 0 && (
        <Section title={M.home.asks} href={`${b}/asks`} more={M.home.seeAll}>
          <ul className="grid gap-3 md:grid-cols-3">
            {otherAsks.map((a) => (
              <li key={a.id}>
                <Link href={`${b}/asks/${a.id}`} className="card card-hover flex h-full flex-col p-4">
                  <span className={`badge self-start ${a.kind === "ask" ? "badge-amber" : "badge-mint"}`}>{a.kind === "ask" ? M.asks.asks : M.asks.offers}</span>
                  <p className="mt-2 line-clamp-2 font-semibold leading-6 text-ink" dir="auto">{a.title}</p>
                  <p className="mt-auto flex items-center gap-2 pt-3 text-[12px] text-mist"><Avatar src={a.author.avatar_url} name={displayName(a.author, locale)} size={22} />{displayName(a.author, locale)} · {fmtRelative(a.created_at, locale)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {events.length > 0 && (
        <Section title={M.home.events} href={`${b}/events`} more={M.home.seeAll}>
          <div className="grid gap-3 md:grid-cols-2">{events.slice(0, 2).map((e) => <EventCard key={e.id} e={e} locale={locale} t={t} href={`${b}/events/${e.id}`} />)}</div>
        </Section>
      )}

      {pulse && (
        <Section title={M.home.pulse}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[[pulse.members, M.home.members], [pulse.companies ?? 0, M.home.companies], [pulse.jobs_open, M.home.jobsOpen], [pulse.referrals ?? 0, M.home.referrals], [pulse.hires ?? 0, M.home.hires]].map(([n, l]) => (
              <div key={String(l)} className="rounded-[18px] bg-mint-soft p-4 text-center">
                <p className="text-[26px] font-bold text-navy" dir="ltr">{n}</p>
                <p className="text-[12px] text-ink-2">{l}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
