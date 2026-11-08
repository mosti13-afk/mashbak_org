import { HandHelping, MessageSquareText } from "lucide-react";
import Link from "next/link";
import { Avatar, Empty, Tabs } from "@/components/ui";
import { fmt, memberDict } from "@/i18n/member";
import { repo } from "@/lib/data";
import { displayName, fmtRelative } from "@/lib/format";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function Asks({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale } = await pageLocale(params);
  const M = memberDict[locale];
  const A = M.asks;
  const v = await requireMember(locale);
  const tab = sp((await searchParams).tab) ?? "ask";
  const list = await repo.listAsks({ viewerId: v.id, kind: tab === "mine" ? undefined : (tab as "ask" | "offer"), mine: tab === "mine", includeClosed: tab === "mine" });
  const b = `/${locale}/app/asks`;
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold text-ink">{A.title}</h1>
          <p className="max-w-xl text-[14px] leading-6 text-ink-2">{A.sub}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`${b}/new?kind=ask`} className="btn btn-primary"><MessageSquareText className="h-4 w-4" />{A.newAsk}</Link>
          <Link href={`${b}/new?kind=offer`} className="btn btn-outline"><HandHelping className="h-4 w-4" />{A.newOffer}</Link>
        </div>
      </div>
      <Tabs items={[
        { href: b, label: A.asks, active: tab === "ask" },
        { href: `${b}?tab=offer`, label: A.offers, active: tab === "offer" },
        { href: `${b}?tab=mine`, label: A.mine, active: tab === "mine" },
      ]} />
      {list.length === 0 ? <Empty>{A.empty}</Empty> : (
        <ul className="grid gap-3 md:grid-cols-2">
          {list.map((a) => (
            <li key={a.id}>
              <Link href={`${b}/${a.id}`} className="card card-hover flex h-full flex-col p-4">
                <div className="flex items-center gap-2">
                  <span className={`badge ${a.kind === "ask" ? "badge-amber" : "badge-mint"}`}>{a.kind === "ask" ? A.asks : A.offers}</span>
                  {a.status === "closed" && <span className="badge badge-gray">{A.closed}</span>}
                  {a.my_reply && <span className="badge badge-navy">{A.youReplied}</span>}
                  <span className="ms-auto text-[12px] text-mist">{fmtRelative(a.created_at, locale)}</span>
                </div>
                <p className="mt-2 font-bold leading-6 text-ink" dir="auto">{a.title}</p>
                {a.body && <p className="mt-1 line-clamp-2 text-[14px] leading-6 text-ink-2" dir="auto">{a.body}</p>}
                {!!a.tags.length && <div className="mt-2 flex flex-wrap gap-1">{a.tags.map((t) => <span key={t} className="rounded-full bg-sky px-2 py-0.5 text-[11px] text-navy ring-1 ring-line" dir="auto">{t}</span>)}</div>}
                <p className="mt-auto flex items-center gap-2 pt-3 text-[12px] text-mist">
                  <Avatar src={a.author.avatar_url} name={displayName(a.author, locale)} size={22} />{displayName(a.author, locale)}
                  <span className="ms-auto">{fmt(A.replies, { n: a.replies })}</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
