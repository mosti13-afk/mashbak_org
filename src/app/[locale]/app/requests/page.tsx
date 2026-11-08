import { Briefcase, Coffee, ExternalLink, FileText, MessageCircle } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { respondConnection, respondReferral, setReferralOutcome, withdrawReferral } from "@/app/actions";
import { Avatar, Empty, Tabs } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import { memberDict, type MemberDict } from "@/i18n/member";
import { repo } from "@/lib/data";
import { displayName, fmtRelative, waLink } from "@/lib/format";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";
import type { MiniProfile, ReferralOutcome } from "@/lib/types";
import type { Locale } from "@/i18n/config";

const STATUS_BADGE: Record<string, string> = { pending: "badge-amber", accepted: "badge-mint", declined: "badge-gray", withdrawn: "badge-gray" };

function Row({ who, locale, kind, icon, when, children, status, M }: { who: MiniProfile | null; locale: Locale; kind: string; icon: ReactNode; when: string; children: ReactNode; status: string; M: MemberDict }) {
  const name = who ? displayName(who, locale) : "";
  return (
    <li className="card p-4 sm:p-5">
      <div className="flex items-start gap-3">
        {who && <Link href={`/${locale}/app/members/${who.id}`}><Avatar src={who.avatar_url} name={name} size={46} /></Link>}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-mist">{icon}{kind}</span>
            <span className={`badge ${STATUS_BADGE[status] ?? "badge-gray"}`}>{M.requests[status as "pending"] ?? status}</span>
            <span className="ms-auto text-[12px] text-mist">{fmtRelative(when, locale)}</span>
          </div>
          {who && <Link href={`/${locale}/app/members/${who.id}`} className="mt-0.5 block font-semibold text-ink hover:text-navy">{name}</Link>}
          {who?.headline && <p className="truncate text-[12px] text-ink-2" dir="auto">{who.headline}{who.company ? ` · ${who.company}` : ""}</p>}
          {children}
        </div>
      </div>
    </li>
  );
}

export default async function Requests({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale } = await pageLocale(params);
  const M = memberDict[locale];
  const R = M.requests;
  const v = await requireMember(locale);
  const tab = sp((await searchParams).tab) ?? "incoming";
  const [refs, cons] = await Promise.all([repo.listMyReferrals(v.id), repo.listConnections(v.id)]);
  const b = `/${locale}/app/requests`;
  const inc = { refs: refs.filter((r) => r.direction === "incoming" && r.status === "pending"), cons: cons.filter((c) => c.direction === "incoming" && c.status === "pending") };
  const sent = { refs: refs.filter((r) => r.direction === "outgoing"), cons: cons.filter((c) => c.direction === "outgoing") };
  const hist = { refs: refs.filter((r) => r.direction === "incoming" && r.status !== "pending"), cons: cons.filter((c) => c.direction === "incoming" && c.status !== "pending") };
  const hidden = (redirect: string) => <><input type="hidden" name="locale" value={locale} /><input type="hidden" name="redirect" value={redirect} /></>;
  const jobLine = (r: (typeof refs)[number]) => (
    <Link href={`/${locale}/app/jobs/${r.job.id}`} className="mt-2 flex items-center gap-2 rounded-[12px] bg-sky px-3 py-2 text-[13px] text-navy hover:underline">
      <Briefcase className="h-4 w-4 shrink-0" /><span className="truncate" dir="auto">{r.job.title} · {r.job.company}</span>
    </Link>
  );
  const quote = (text: string) => <p className="mt-2 whitespace-pre-line text-[14px] leading-6 text-ink-2" dir="auto">“{text}”</p>;
  const outcomes = Object.entries(R.outcomes) as [ReferralOutcome, string][];

  const list = tab === "sent" ? sent : tab === "history" ? hist : inc;
  const empty = !list.refs.length && !list.cons.length;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-[26px] font-bold text-ink">{R.title}</h1>
      <p className="mb-5 text-[14px] text-ink-2">{R.sub}</p>
      <Tabs items={[
        { href: b, label: R.incoming, active: tab === "incoming", count: inc.refs.length + inc.cons.length },
        { href: `${b}?tab=sent`, label: R.sent, active: tab === "sent" },
        { href: `${b}?tab=history`, label: R.history, active: tab === "history" },
      ]} />
      {empty ? <Empty>{R.empty}</Empty> : (
        <ul className="space-y-3">
          {list.refs.map((r) => {
            const other = r.direction === "incoming" ? r.requester : r.insider;
            return (
              <Row key={r.id} who={other} locale={locale} kind={`${R.referral}${r.direction === "outgoing" ? ` · ${R.to}` : ""}`} icon={<Briefcase className="h-3.5 w-3.5" />} when={r.created_at} status={r.status} M={M}>
                {jobLine(r)}
                {r.direction === "incoming" && quote(r.message)}
                {r.cv_url && <a href={r.cv_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-navy"><FileText className="h-4 w-4" />{R.cv}<ExternalLink className="h-3 w-3" /></a>}
                {r.insider_note && <p className="mt-2 rounded-[12px] bg-mint-soft px-3 py-2 text-[13px] text-ink-2" dir="auto">“{r.insider_note}”</p>}
                {r.direction === "incoming" && r.status === "pending" && (
                  <form action={respondReferral} className="mt-3 space-y-2">
                    {hidden(b)}<input type="hidden" name="id" value={r.id} />
                    <textarea name="note" rows={2} placeholder={R.notePh} aria-label={R.note} className="textarea min-h-0 text-[14px]" dir="auto" />
                    <div className="flex gap-2">
                      <button name="accept" value="1" className="btn btn-primary btn-sm flex-1">{R.accept}</button>
                      <button name="accept" value="0" className="btn btn-outline btn-sm flex-1">{R.decline}</button>
                    </div>
                  </form>
                )}
                {r.direction === "outgoing" && r.status === "pending" && (
                  <form action={withdrawReferral} className="mt-2">{hidden(`${b}?tab=sent`)}<input type="hidden" name="id" value={r.id} />
                    <SubmitButton className="btn btn-ghost btn-sm">{M.job.withdraw}</SubmitButton>
                  </form>
                )}
                {r.direction === "outgoing" && r.status === "declined" && (
                  <Link href={`/${locale}/app/jobs/${r.job.id}`} className="btn btn-outline btn-sm mt-2">{M.job.askAnother}</Link>
                )}
                {r.direction === "outgoing" && r.status === "accepted" && (
                  <div className="mt-3 rounded-[14px] border border-line p-3">
                    <p className="text-[13px] font-semibold text-ink">{R.outcome}</p>
                    <p className="text-[12px] text-mist">{R.outcomeSub}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {outcomes.map(([k, l]) => (
                        <form key={k} action={setReferralOutcome}>{hidden(`${b}?tab=sent`)}<input type="hidden" name="id" value={r.id} /><input type="hidden" name="outcome" value={k} />
                          <button className={`rounded-full border px-3 py-1 text-[12px] font-semibold ${r.outcome === k ? "border-navy bg-navy text-white" : "border-line text-ink-2 hover:border-navy"}`}>{l}</button>
                        </form>
                      ))}
                    </div>
                  </div>
                )}
              </Row>
            );
          })}
          {list.cons.map((c) => (
            <Row key={c.id} who={c.other} locale={locale} kind={`${R.chat}${c.direction === "outgoing" ? ` · ${R.to}` : ""}`} icon={<Coffee className="h-3.5 w-3.5" />} when={c.created_at} status={c.status} M={M}>
              {quote(c.message)}
              {c.direction === "incoming" && c.status === "pending" && (
                <form action={respondConnection} className="mt-3 flex gap-2">
                  {hidden(b)}<input type="hidden" name="id" value={c.id} />
                  <button name="accept" value="1" className="btn btn-primary btn-sm flex-1">{R.accept}</button>
                  <button name="accept" value="0" className="btn btn-outline btn-sm flex-1">{R.decline}</button>
                </form>
              )}
              {c.status === "accepted" && c.phone && (
                <a href={waLink(c.phone, "")} target="_blank" rel="noopener noreferrer" className="btn btn-sm mt-3 bg-[#25D366] text-white hover:bg-[#1ebe5a]"><MessageCircle className="h-4 w-4" />{R.whatsapp}</a>
              )}
            </Row>
          ))}
        </ul>
      )}
    </div>
  );
}
