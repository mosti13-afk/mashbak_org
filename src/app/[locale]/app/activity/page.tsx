import { Bell, Briefcase, Coffee, ExternalLink, FileText, MessageCircle } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { markNotificationsRead, respondConnection, respondReferral, setReferralOutcome, withdrawReferral } from "@/app/actions";
import { EmptyState, PageTitle, SectionTabs } from "@/components/shell/page";
import { Avatar } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import { tr, type Locale } from "@/i18n/config";
import { memberDict, type MemberDict } from "@/i18n/member";
import { shellDict } from "@/i18n/shell";
import { repo } from "@/lib/data";
import { displayName, fmtRelative, waLink } from "@/lib/format";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";
import type { MiniProfile, ReferralOutcome } from "@/lib/types";

const STATUS: Record<string, string> = { pending: "badge-amber", accepted: "badge-mint", declined: "badge-gray", withdrawn: "badge-gray" };

function Item({ who, locale, kind, icon, when, status, M, children }: { who: MiniProfile | null; locale: Locale; kind: string; icon: ReactNode; when: string; status: string; M: MemberDict; children: ReactNode }) {
  const name = who ? displayName(who, locale) : "";
  return (
    <li className="px-4 py-4">
      <div className="flex items-start gap-3">
        {who && <Link href={`/${locale}/app/members/${who.id}`}><Avatar src={who.avatar_url} name={name} size={44} /></Link>}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2">
            <span className="row-title">{name}</span>
            <span className={`badge ${STATUS[status] ?? "badge-gray"}`}>{M.requests[status as "pending"] ?? status}</span>
          </div>
          <p className="t-small flex items-center gap-1">{icon}{kind} · {fmtRelative(when, locale)}</p>
          {children}
        </div>
      </div>
    </li>
  );
}

export default async function Activity({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale } = await pageLocale(params);
  const M = memberDict[locale];
  const R = M.requests;
  const S = shellDict[locale];
  const v = await requireMember(locale);
  const tab = sp((await searchParams).tab) ?? "needs";
  const [refs, cons, notes] = await Promise.all([repo.listMyReferrals(v.id), repo.listConnections(v.id), repo.listNotifications(v.id)]);
  const b = `/${locale}/app/activity`;
  const incoming = { refs: refs.filter((r) => r.direction === "incoming" && r.status === "pending"), cons: cons.filter((c) => c.direction === "incoming" && c.status === "pending") };
  const sent = { refs: refs.filter((r) => r.direction === "outgoing"), cons: cons.filter((c) => c.direction === "outgoing") };
  const nIn = incoming.refs.length + incoming.cons.length;
  const unread = notes.filter((n) => !n.read_at).length;
  const hidden = (redirect: string) => <><input type="hidden" name="locale" value={locale} /><input type="hidden" name="redirect" value={redirect} /></>;
  const job = (r: (typeof refs)[number]) => (
    <Link href={`/${locale}/app/jobs/${r.job.id}`} className="mt-2 flex items-center gap-2 rounded-[12px] bg-sky px-3 py-2 text-[13px] text-navy">
      <Briefcase className="h-4 w-4 shrink-0" /><span className="truncate" dir="auto">{r.job.title} · {r.job.company}</span>
    </Link>
  );
  const outcomes = Object.entries(R.outcomes) as [ReferralOutcome, string][];
  const list = tab === "sent" ? sent : incoming;

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle title={S.activity} />
      <SectionTabs items={[
        { href: b, label: S.needsYou, active: tab === "needs", count: nIn },
        { href: `${b}?tab=sent`, label: S.sent, active: tab === "sent" },
        { href: `${b}?tab=updates`, label: S.updates, active: tab === "updates", count: unread },
      ]} />

      {tab === "updates" ? (
        notes.length === 0 ? <EmptyState title={R.empty} /> : (
          <>
            {unread > 0 && (
              <form action={markNotificationsRead} className="mb-3 flex justify-end"><input type="hidden" name="locale" value={locale} />
                <SubmitButton className="btn btn-ghost btn-sm">{locale === "ar" ? "تعليم الكل كمقروء" : locale === "he" ? "סימון הכל כנקרא" : "Mark all as read"}</SubmitButton>
              </form>
            )}
            <div className="list">
              {notes.map((n) => (
                <Link key={n.id} href={n.link ? `/${locale}${n.link}` : "#"} className={`row items-start py-4 ${n.read_at ? "" : "bg-mint-soft/60"}`}>
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${n.read_at ? "bg-haze text-mist" : "bg-navy text-white"}`}><Bell className="h-[18px] w-[18px]" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-bold leading-6 text-ink">{tr(n.title, locale)}</span>
                    {tr(n.body, locale) && <span className="line-clamp-2 block text-[14px] text-ink-2">{tr(n.body, locale)}</span>}
                    <span className="t-small block">{fmtRelative(n.created_at, locale)}</span>
                  </span>
                </Link>
              ))}
            </div>
          </>
        )
      ) : (list.refs.length + list.cons.length === 0) ? (
        <EmptyState title={R.empty} text={tab === "needs" ? M.home.waitingSub : undefined} />
      ) : (
        <ul className="list">
          {list.refs.map((r) => (
            <Item key={r.id} who={r.direction === "incoming" ? r.requester : r.insider} locale={locale} M={M} status={r.status} when={r.created_at}
              kind={r.direction === "outgoing" ? `${R.referral} · ${R.to}` : R.referral} icon={<Briefcase className="h-3.5 w-3.5" />}>
              {job(r)}
              {r.direction === "incoming" && <p className="bubble mt-3 whitespace-pre-line text-[14px] leading-6 text-ink-2" dir="auto">{r.message}</p>}
              {r.cv_url && <a href={r.cv_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-[13px] text-navy"><FileText className="h-4 w-4" />{R.cv}<ExternalLink className="h-3 w-3" /></a>}
              {r.insider_note && <p className="bubble mt-3 bg-mint-soft text-[14px] leading-6 text-ink-2" dir="auto">{r.insider_note}</p>}
              {r.direction === "incoming" && r.status === "pending" && (
                <form action={respondReferral} className="mt-4 space-y-2">
                  {hidden(b)}<input type="hidden" name="id" value={r.id} />
                  <textarea name="note" rows={2} placeholder={R.notePh} aria-label={R.note} className="textarea min-h-0 text-[14px]" dir="auto" />
                  <div className="flex gap-2">
                    <button name="accept" value="1" className="btn btn-primary flex-1">{R.accept}</button>
                    <button name="accept" value="0" className="btn btn-outline flex-1">{R.decline}</button>
                  </div>
                </form>
              )}
              {r.direction === "outgoing" && r.status === "pending" && (
                <form action={withdrawReferral} className="mt-2">{hidden(`${b}?tab=sent`)}<input type="hidden" name="id" value={r.id} /><SubmitButton className="btn btn-ghost btn-sm -ms-3">{M.job.withdraw}</SubmitButton></form>
              )}
              {r.direction === "outgoing" && r.status === "declined" && <Link href={`/${locale}/app/jobs/${r.job.id}`} className="btn btn-secondary btn-sm mt-3">{M.job.askAnother}</Link>}
              {r.direction === "outgoing" && r.status === "accepted" && (
                <div className="mt-3">
                  <p className="text-[14px] font-bold text-ink">{R.outcome}</p>
                  <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto">
                    {outcomes.map(([k, l]) => (
                      <form key={k} action={setReferralOutcome}>{hidden(`${b}?tab=sent`)}<input type="hidden" name="id" value={r.id} /><input type="hidden" name="outcome" value={k} />
                        <button aria-pressed={r.outcome === k} className="chip">{l}</button>
                      </form>
                    ))}
                  </div>
                </div>
              )}
            </Item>
          ))}
          {list.cons.map((c) => (
            <Item key={c.id} who={c.other} locale={locale} M={M} status={c.status} when={c.created_at}
              kind={c.direction === "outgoing" ? `${R.chat} · ${R.to}` : R.chat} icon={<Coffee className="h-3.5 w-3.5" />}>
              <p className="bubble mt-3 whitespace-pre-line text-[14px] leading-6 text-ink-2" dir="auto">{c.message}</p>
              {c.direction === "incoming" && c.status === "pending" && (
                <form action={respondConnection} className="mt-4 flex gap-2">{hidden(b)}<input type="hidden" name="id" value={c.id} />
                  <button name="accept" value="1" className="btn btn-primary flex-1">{R.accept}</button>
                  <button name="accept" value="0" className="btn btn-outline flex-1">{R.decline}</button>
                </form>
              )}
              {c.status === "accepted" && c.phone && (
                <a href={waLink(c.phone, "")} target="_blank" rel="noopener noreferrer" className="btn mt-3 bg-[#25D366] text-white hover:bg-[#1ebe5a]"><MessageCircle className="h-4 w-4" />{R.whatsapp}</a>
              )}
            </Item>
          ))}
        </ul>
      )}
    </div>
  );
}
