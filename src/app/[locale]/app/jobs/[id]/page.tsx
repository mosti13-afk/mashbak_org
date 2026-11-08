import { ArrowRight, CheckCircle2, Clock, ExternalLink, Inbox, MessageSquareText, Users, XCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requestReferral, toggleJob, withdrawReferral } from "@/app/actions";
import { ReferralBox, type InsiderView } from "@/components/app/ReferralBox";
import { Notice } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import { CompanyLogo, LocationLine, companyName, helpedCount } from "@/components/v2";
import { fmt, memberDict } from "@/i18n/member";
import { repo } from "@/lib/data";
import { displayName, fmtRelative } from "@/lib/format";
import { insiderSignal, rotateInsiders } from "@/lib/insiders";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";
import type { Insider } from "@/lib/types";

export default async function JobPage({ params, searchParams }: { params: Promise<{ locale: string; id: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  const M = memberDict[locale];
  const v = await requireMember(locale);
  const { id } = await params;
  const q = await searchParams;
  const j = await repo.getJob(id, v.id);
  if (!j) notFound();
  const company = j.company_id ? await repo.getCompany(j.company_id) : null;
  const cname = company ? companyName(company, locale) : j.company;
  const mine = j.posted_by === v.id;
  const insidersRaw = j.company_id ? await repo.companyInsiders(j.company_id) : [];
  // the member who posted the job is the natural first contact; everyone else rotates fairly
  const poster = j.posted_by && j.posted_by !== v.id ? (insidersRaw.find((i) => i.id === j.posted_by) ?? (j.poster ? { ...j.poster, pending: 0, accepted: 0, answered: 0, total: 0, last_asked: null } as Insider : null)) : null;
  const rotated = rotateInsiders(insidersRaw, { viewerId: v.id, context: j.id, exclude: poster ? [poster.id] : [] });
  const ordered = [...(poster ? [poster] : []), ...rotated];
  const stats = await repo.memberStats(ordered.map((i) => i.id));
  const views: InsiderView[] = ordered.map((i) => {
    const h = helpedCount(stats[i.id]);
    return { id: i.id, name: displayName(i, locale), headline: i.headline, avatar: i.avatar_url, signal: M.job.signals[insiderSignal(i)],
      helped: h ? fmt(M.job.helped, { n: h }) : null, tag: poster && i.id === poster.id ? M.job.poster : null };
  });
  const my = j.my_referral;
  const insiderName = (rid?: string | null) => { const p = ordered.find((x) => x.id === rid); return p ? displayName(p, locale) : ""; };
  const apply = j.external_url || j.apply_url;
  const canAsk = !mine && j.is_open && (!my || my.status === "declined" || my.status === "withdrawn") && views.length > 0;
  const hidden = <input type="hidden" name="locale" value={locale} />;

  return (
    <div className="mx-auto max-w-5xl">
      <Link href={`/${locale}/app/jobs`} className="mb-4 inline-flex items-center gap-1 text-[13px] font-semibold text-mist hover:text-navy"><ArrowRight className="h-4 w-4 ltr:rotate-180" />{M.jobs.title}</Link>
      {sp(q.asked) && <Notice>{M.job.sent}</Notice>}
      {sp(q.posted) && <Notice>{M.jobs.posted}</Notice>}
      <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <article className="card p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <CompanyLogo c={company ?? { name: j.company, name_ar: null, name_he: null }} size={60} />
            <div className="min-w-0 flex-1">
              <h1 className="text-[24px] font-bold leading-snug text-ink sm:text-[28px]" dir="auto">{j.title}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-ink-2">
                {company ? <Link href={`/${locale}/app/companies/${company.slug}`} className="font-semibold text-navy hover:underline">{cname}</Link> : <span className="font-semibold">{j.company}</span>}
                <LocationLine text={j.location || j.city} />
                <span className="text-mist">{fmtRelative(j.created_at, locale)}</span>
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {j.is_managerial && <span className="badge badge-navy">{M.jobs.managerialTag}</span>}
            <span className="badge badge-gray">{t.app.jobs.types[j.job_type]}</span>
            <span className="badge badge-gray">{t.app.jobs.modes[j.work_mode]}</span>
            {j.source === "careers" && <span className="badge badge-gray">{M.jobs.fromCareers}</span>}
            {j.poster && <span className="badge badge-gray">{fmt(M.jobs.postedBy, { name: displayName(j.poster, locale) })}</span>}
            {!j.is_open && <span className="badge badge-red">{M.jobs.closed}</span>}
          </div>
          {apply && (
            <a href={apply} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-5 w-full sm:w-auto"><ExternalLink className="h-4 w-4" />{M.jobs.apply}</a>
          )}
          {(j.description || j.requirements) && (
            <div className="mt-6 border-t border-line pt-5">
              <h2 className="mb-2 font-bold text-ink">{M.jobs.details}</h2>
              <p className="whitespace-pre-line text-[15px] leading-7 text-ink-2" dir="auto">{j.description}</p>
              {j.requirements && <p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-ink-2" dir="auto">{j.requirements}</p>}
            </div>
          )}
          {mine && (
            <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
              <Link href={`/${locale}/app/requests`} className="btn btn-primary btn-sm"><Inbox className="h-4 w-4" />{M.job.manage}</Link>
              <form action={toggleJob}>{hidden}<input type="hidden" name="id" value={j.id} /><input type="hidden" name="open" value={j.is_open ? "0" : "1"} />
                <SubmitButton className="btn btn-ghost btn-sm">{j.is_open ? M.jobs.close : M.jobs.reopen}</SubmitButton>
              </form>
            </div>
          )}
        </article>

        <aside className="space-y-4">
          {my && my.status !== "withdrawn" && (
            <div className="card p-5">
              <p className="text-[13px] font-semibold text-mist">{M.job.status}</p>
              <p className="mt-1 flex items-center gap-2 font-semibold text-ink">
                {my.status === "pending" && <><Clock className="h-5 w-5 text-[#b7860b]" />{fmt(M.job.waitingFor, { name: insiderName(my.insider_id) || cname })}</>}
                {my.status === "accepted" && <><CheckCircle2 className="h-5 w-5 text-mint" />{fmt(M.job.acceptedBy, { name: insiderName(my.insider_id) })}</>}
                {my.status === "declined" && <><XCircle className="h-5 w-5 text-mist" />{fmt(M.job.declinedBy, { name: insiderName(my.insider_id) })}</>}
              </p>
              {my.insider_note && <p className="mt-2 rounded-[14px] bg-sky p-3 text-[14px] leading-6 text-ink-2" dir="auto">“{my.insider_note}”</p>}
              {my.status === "pending" && (
                <form action={withdrawReferral} className="mt-3">{hidden}<input type="hidden" name="id" value={my.id} /><input type="hidden" name="redirect" value={`/${locale}/app/jobs/${j.id}`} />
                  <SubmitButton className="btn btn-ghost btn-sm">{M.job.withdraw}</SubmitButton>
                </form>
              )}
              {my.status === "accepted" && <Link href={`/${locale}/app/requests?tab=sent`} className="mt-3 inline-flex text-[13px] font-semibold text-navy">{M.requests.outcome}</Link>}
            </div>
          )}

          {!mine && (
            <div className="card p-5">
              <h2 className="flex items-center gap-2 font-bold text-ink"><Users className="h-5 w-5 text-mint" />{fmt(M.job.insidersTitle, { company: cname })}</h2>
              {views.length > 0 ? (
                <>
                  <p className="mb-4 mt-1 text-[12px] leading-5 text-mist">{M.job.insidersSub}</p>
                  {canAsk ? (
                    <ReferralBox action={requestReferral} locale={locale} jobId={j.id} insiders={views} cvUrl={v.cv_url ?? null}
                      copy={{ choose: M.job.choose, message: M.job.message, messagePh: M.job.messagePh, draft: M.job.draft, drafting: M.job.drafting, cv: M.job.cv, cvHint: M.job.cvHint, send: M.job.send, showMore: M.job.showMore }} />
                  ) : (
                    <ul className="space-y-2">
                      {views.slice(0, 5).map((i) => (
                        <li key={i.id}><Link href={`/${locale}/app/members/${i.id}`} className="flex items-center gap-3 rounded-[14px] p-2 hover:bg-sky">
                          <span className="font-semibold text-ink">{i.name}</span><span className="truncate text-[12px] text-mist" dir="auto">{i.headline}</span>
                        </Link></li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <div className="mt-2">
                  <p className="text-[14px] text-ink-2">{fmt(M.job.none, { company: cname })}</p>
                  <p className="text-[13px] text-mist">{M.job.noneSub}</p>
                  <Link href={`/${locale}/app/asks/new?kind=ask&title=${encodeURIComponent(`${j.title} @ ${cname}`)}`} className="btn btn-outline btn-sm mt-3"><MessageSquareText className="h-4 w-4" />{M.job.askCommunity}</Link>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
