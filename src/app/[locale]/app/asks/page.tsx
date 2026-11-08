import { Plus } from "lucide-react";
import Link from "next/link";
import { CommunityTabs } from "@/components/shell/CommunityTabs";
import { EmptyState, FilterChips, PageTitle } from "@/components/shell/page";
import { AskRow } from "@/components/v2";
import { memberDict } from "@/i18n/member";
import { shellDict } from "@/i18n/shell";
import { repo } from "@/lib/data";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function Asks({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale } = await pageLocale(params);
  const M = memberDict[locale];
  const A = M.asks;
  const S = shellDict[locale];
  const v = await requireMember(locale);
  const f = sp((await searchParams).f) ?? "all";
  const list = await repo.listAsks({ viewerId: v.id, kind: f === "ask" || f === "offer" ? f : undefined, mine: f === "mine", includeClosed: f === "mine" });
  const b = `/${locale}/app`;
  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle title={S.community} action={<Link href={`${b}/asks/new`} className="btn btn-primary"><Plus className="h-5 w-5" /><span className="hidden sm:inline">{A.publish}</span></Link>} />
      <CommunityTabs base={b} S={S} active="asks" />
      <p className="t-small mb-3 px-1">{A.sub}</p>
      <FilterChips items={[
        { href: `${b}/asks`, label: M.jobs.all, on: f === "all" },
        { href: `${b}/asks?f=ask`, label: A.asks, on: f === "ask" },
        { href: `${b}/asks?f=offer`, label: A.offers, on: f === "offer" },
        { href: `${b}/asks?f=mine`, label: A.mine, on: f === "mine" },
      ]} />
      {list.length ? <div className="list">{list.map((a) => <AskRow key={a.id} a={a} locale={locale} M={M} />)}</div>
        : <EmptyState title={A.empty} action={<Link href={`${b}/asks/new`} className="btn btn-primary">{A.newAsk}</Link>} />}
    </div>
  );
}
