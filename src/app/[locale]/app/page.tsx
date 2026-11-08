import { CircleUserRound, Inbox } from "lucide-react";
import Link from "next/link";
import { Chevron, EmptyState, SectionHeader } from "@/components/shell/page";
import { Avatar } from "@/components/ui";
import { EventRow, JobRow, PersonRow } from "@/components/v2";
import { fmt, memberDict } from "@/i18n/member";
import { shellDict } from "@/i18n/shell";
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
  const S = shellDict[locale];
  const v = await requireMember(locale);
  const b = `/${locale}/app`;
  const followed = await repo.followedCompanyIds(v.id);
  const [jobsFollow, jobsAll, refs, cons, members, events] = await Promise.all([
    followed.length ? repo.listJobs({ viewerId: v.id, companyIds: followed, limit: 8 }) : Promise.resolve([]),
    repo.listJobs({ viewerId: v.id, limit: 30 }),
    repo.listMyReferrals(v.id),
    repo.listConnections(v.id),
    repo.listMembers({ viewerId: v.id, chats: true }),
    repo.listEvents({ when: "upcoming", viewerId: v.id }),
  ]);
  // opportunities: followed companies first, otherwise jobs where a member can help
  const jobs = (jobsFollow.length ? jobsFollow : [...jobsAll].sort((a, z) => (z.insiders_count ?? 0) - (a.insiders_count ?? 0))).slice(0, 3);
  const waiting = [
    ...refs.filter((r) => r.direction === "incoming" && r.status === "pending").map((r) => ({ id: r.id, who: r.requester, kind: M.requests.referral, what: `${r.job.title} · ${r.job.company}`, at: r.created_at })),
    ...cons.filter((c) => c.direction === "incoming" && c.status === "pending").map((c) => ({ id: c.id, who: c.other, kind: M.requests.chat, what: c.message, at: c.created_at })),
  ];
  const day = new Date().toISOString().slice(0, 10);
  const people = members.filter((m) => !m.connection)
    .map((m) => ({ m, k: dayHash(`${v.id}|${day}|${m.id}`) * (m.sector && m.sector === v.sector ? 1.6 : 1) * (m.help_offers?.length ? 1.3 : 1) }))
    .sort((a, z) => z.k - a.k).slice(0, 3).map((x) => x.m);
  const stats = await repo.memberStats(people.map((p) => p.id));
  const next = events[0];
  const first = displayName(v, locale).split(" ")[0];
  const missing = [!v.company_id, !v.help_offers?.length, !v.cv_url].filter(Boolean).length;

  return (
    <div>
      <header className="mb-6">
        <h1 className="t-h1">{fmt(M.home.hello, { name: first })}</h1>
        <p className="mt-1 text-[15px] text-ink-2">{M.home.sub}</p>
      </header>

      {missing > 0 && (
        <Link href={`${b}/profile#edit`} className="mb-6 flex items-center gap-3 rounded-[18px] bg-navy p-4 text-white">
          <CircleUserRound className="h-9 w-9 shrink-0 text-mint" strokeWidth={1.6} />
          <span className="min-w-0 flex-1">
            <span className="block font-bold">{M.home.setup}</span>
            <span className="block text-[13px] text-white/75">{[!v.company_id && M.home.stepCompany, !v.help_offers?.length && M.home.stepHelp, !v.cv_url && M.home.stepCv].filter(Boolean).join(" · ")}</span>
          </span>
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[13px] font-bold">{3 - missing}/3</span>
        </Link>
      )}

      <div className="grid gap-x-8 lg:grid-cols-[1.35fr_1fr] [&>*]:min-w-0">
        <div>
          {waiting.length > 0 && (
            <>
              <SectionHeader title={S.needsYou} href={`${b}/activity`} more={M.home.seeAll} />
              <div className="list mb-2">
                {waiting.slice(0, 3).map((x) => (
                  <Link key={x.id} href={`${b}/activity`} className="row">
                    <Avatar src={x.who.avatar_url} name={displayName(x.who, locale)} size={44} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-[12px] text-green-deep"><Inbox className="h-3.5 w-3.5" />{x.kind} · {fmtRelative(x.at, locale)}</span>
                      <span className="row-title block">{displayName(x.who, locale)}</span>
                      <span className="row-sub block" dir="auto">{x.what}</span>
                    </span>
                    <Chevron />
                  </Link>
                ))}
              </div>
            </>
          )}

          <SectionHeader title={jobsFollow.length ? M.home.jobsFollow : M.jobs.title} href={`${b}/jobs`} more={M.home.seeAll} />
          {jobs.length ? <div className="list">{jobs.map((j) => <JobRow key={j.id} j={j} locale={locale} M={M} />)}</div>
            : <EmptyState title={M.jobs.empty} />}
        </div>

        <div>
          {next && (
            <>
              <SectionHeader title={M.home.events} href={`${b}/events`} more={M.home.seeAll} />
              <div className="list">
                <EventRow e={next} locale={locale} href={`${b}/events/${next.id}`} labels={{ registered: t.events.registered, online: t.events.online, waitlist: t.events.waitlisted }} />
              </div>
            </>
          )}
          {people.length > 0 && (
            <>
              <SectionHeader title={M.home.meet} href={`${b}/members`} more={M.home.seeAll} />
              <div className="list">{people.map((m) => <PersonRow key={m.id} m={m} locale={locale} M={M} stats={stats[m.id]} />)}</div>
              <p className="t-small mt-2 px-1">{M.home.meetSub}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
