import { CheckCircle2, Clock, ExternalLink, Inbox, MessageSquareText, Users, XCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requestReferral, toggleJob, withdrawReferral } from "@/app/actions";
import { ReferralBox, type InsiderView } from "@/components/app/ReferralBox";
import { BackLink } from "@/components/shell/page";
import { Notice } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import { CompanyLogo, companyName, helpedCount } from "@/components/v2";
import { fmt, memberDict } from "@/i18n/member";
import { shellDict } from "@/i18n/shell";
import { repo } from "@/lib/data";
import { displayName, fmtRelative } from "@/lib/format";
import { insiderSignal, rotateInsiders } from "@/lib/insiders";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";
import type { Insider } from "@/lib/types";

export default async function JobPage({ params, searchParams }: { params: Promise<{ locale: string; id: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  const M = memberDict[locale];
  const S = shellDict[locale];
  const v = await requireMember(locale);
  const { id } = await params;
  const q = await searchParams;
  const j = await repo.getJob(id, v.id);
  if (!j) notFound();
  const company = j.company_id ? await repo.getCompany(j.company_id) : null;
  const cname = company ? companyName(company, locale) : j.company;
  const mine = j.posted_by === v.id;
  const insidersRaw = j.company_id ? await repo.companyInsiders(j.company_id) : [];
  const poster = j.posted_by && j.posted_by !== v.id ? (insidersRaw.find((i) => i.id === j.posted_by) ?? (j.poster ? { ...j.poster, pending: 0, accepted: 0, answered: 0, total: 0, last_asked: null } as Insider : null)) : null;
  const ordered = [...(poster ? [poster] : []), ...rotateInsiders(insidersRaw, { viewerId: v.id, context: j.id, exclude: poster ? [poster.id] : [] })];
  const stats = await repo.memberStats(ordered.map((i) => i.id));
  const views: InsiderView[] = ordered.map((i) => {
    const h = helpedCount(stats[i.id]);
    return { id: i.id, name: displayName(i, locale), headline: i.headline, avatar: i.avatar_url, signal: M.job.signals[insiderSignal(i)], helped: h ? fmt(M.job.helped, { n: h }) : null, tag: poster && i.id === poster.id ? M.job.poster : null };
  });
  const my = j.my_referral;
  const nameOf = (rid?: string | null) => { const p = ordered.find((x) => x.id === rid); return p ? displayName(p, locale) : cname; };
  const apply = j.external_url || j.apply_url;
  const canAsk = !mine && j.is_open && (!my || my.status === "declined" || my.status === "withdrawn") && views.length > 0;
  const hidden = <input type="hidden" name="locale" value={locale} />;
  const b = `/${locale}/app`;
  const meta = [j.location || j.city, t.app.jobs.modes[j.work_mode], t.app.jobs.types[j.job_type]].filter(Boolean).join(" · ");

  return (
    <div>
      <BackLink href={`${b}/jobs`} label={S.opportunities} />
      {sp(q.asked) && <Notice>{M.job.sent}</Notice>}
      {sp(q.posted) && <Notice>{M.jobs.posted}</Notice>}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start [&>*]:min-w-0">
        <article>
          <div className="flex items-start gap-4">
            <CompanyLogo c={company ?? { name: j.company, name_ar: null, name_he: null }} size={64} className="rounded-[16px]" />
            <div className="min-w-0 flex-1">
              <h1 className="text-[24px] font-bold leading-snug text-navy-ink sm:text-[28px]" dir="auto">{j.title}</h1>
              <p className="mt-1 text-[15px]">
                {company ? <Link href={`${b}/companies/${company.slug}`} className="font-bold text-navy hover:underline">{cname}</Link> : <span className="font-bold">{j.company}</span>}
              </p>
              <p className="t-small" dir="auto">{meta} · {fmtRelative(j.created_at, locale)}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {j.is_managerial && <span className="badge badge-navy">{M.jobs.managerialTag}</span>}
            {j.source === "careers" && <span className="badge badge-gray">{M.jobs.fromCareers}</span>}
            {j.poster && <span className="badge badge-gray">{fmt(M.jobs.postedBy, { name: displayName(j.poster, locale) })}</span>}
            {!j.is_open && <span className="badge badge-red">{M.jobs.closed}</span>}
          </div>
          {apply && <a href={apply} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-5 w-full sm:w-auto"><ExternalLink className="h-4 w-4" />{M.jobs.apply}</a>}

          {(j.description || j.requirements) && (
            <details className="group mt-6 rounded-[20px] border border-line bg-white p-5" open={!views.length}>
              <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-ink">{M.jobs.details}<span className="text-[13px] font-normal text-navy group-open:hidden">+</span></summary>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-ink-2" dir="auto">{j.description}</p>
              {j.requirements && <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-ink-2" dir="auto">{j.requirements}</p>}
            </details>
          )}
          {mine && (
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href={`${b}/activity`} className="btn btn-primary"><Inbox className="h-4 w-4" />{M.job.manage}</Link>
              <form action={toggleJob}>{hidden}<input type="hidden" name="id" value={j.id} /><input type="hidden" name="open" value={j.is_open ? "0" : "1"} />
                <SubmitButton className="btn btn-outline">{j.is_open ? M.jobs.close : M.jobs.reopen}</SubmitButton>
              </form>
            </div>
          )}
        </article>

        {!mine && (
          <aside className="lg:sticky lg:top-8">
            {my && my.status !== "withdrawn" && (
              <div className="mb-5 rounded-[20px] bg-white p-5 ring-1 ring-line">
                <p className="t-small">{M.job.status}</p>
                <p className="mt-1 flex items-center gap-2 font-bold text-ink">
                  {my.status === "pending" && <><Clock className="h-5 w-5 text-sand-ink" />{fmt(M.job.waitingFor, { name: nameOf(my.insider_id) })}</>}
                  {my.status === "accepted" && <><CheckCircle2 className="h-5 w-5 text-mint" />{fmt(M.job.acceptedBy, { name: nameOf(my.insider_id) })}</>}
                  {my.status === "declined" && <><XCircle className="h-5 w-5 text-mist" />{fmt(M.job.declinedBy, { name: nameOf(my.insider_id) })}</>}
                </p>
                {my.insider_note && <p className="bubble mt-3 text-[14px] leading-6 text-ink-2" dir="auto">{my.insider_note}</p>}
                {my.status === "pending" && (
                  <form action={withdrawReferral} className="mt-3">{hidden}<input type="hidden" name="id" value={my.id} /><input type="hidden" name="redirect" value={`${b}/jobs/${j.id}`} />
                    <SubmitButton className="btn btn-ghost btn-sm">{M.job.withdraw}</SubmitButton>
                  </form>
                )}
                {my.status === "accepted" && <Link href={`${b}/activity?tab=sent`} className="mt-3 inline-flex text-[14px] text-navy">{M.requests.outcome}</Link>}
              </div>
            )}
            <h2 className="flex items-center gap-2 px-1 t-h2"><Users className="h-5 w-5 text-mint" />{fmt(M.job.insidersTitle, { company: cname })}</h2>
            {views.length ? (
              <>
                <p className="t-small mb-4 mt-1 px-1">{M.job.insidersSub}</p>
                {canAsk ? (
                  <ReferralBox action={requestReferral} locale={locale} jobId={j.id} insiders={views} cvUrl={v.cv_url ?? null}
                    copy={{ choose: M.job.choose, message: M.job.message, messagePh: M.job.messagePh, draft: M.job.draft, drafting: M.job.drafting, cv: M.job.cv, cvHint: M.job.cvHint, send: M.job.send, showMore: M.job.showMore }} />
                ) : (
                  <div className="list">{views.slice(0, 5).map((i) => <Link key={i.id} href={`${b}/members/${i.id}`} className="row"><span className="row-title">{i.name}</span><span className="row-sub" dir="auto">{i.headline}</span></Link>)}</div>
                )}
              </>
            ) : (
              <div className="mt-3 rounded-[20px] border border-dashed border-line bg-white p-5">
                <p className="text-[15px] text-ink-2">{fmt(M.job.none, { company: cname })}</p>
                <p className="t-small">{M.job.noneSub}</p>
                <Link href={`${b}/asks/new?kind=ask&title=${encodeURIComponent(`${j.title} @ ${cname}`)}`} className="btn btn-secondary mt-4"><MessageSquareText className="h-4 w-4" />{M.job.askCommunity}</Link>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
