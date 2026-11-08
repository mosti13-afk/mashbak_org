import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { Empty, Tabs } from "@/components/ui";
import { JobCard } from "@/components/v2";
import { memberDict } from "@/i18n/member";
import { repo } from "@/lib/data";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function Jobs({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  const M = memberDict[locale];
  const v = await requireMember(locale);
  const q = await searchParams;
  const tab = sp(q.tab) ?? "all";
  const query = sp(q.q) ?? "";
  const mgr = sp(q.mgr) === "1";
  const followed = tab === "following" ? await repo.followedCompanyIds(v.id) : undefined;
  const jobs = await repo.listJobs({
    viewerId: v.id, q: query, managerialOnly: mgr, companyIds: followed, includeClosed: tab === "mine",
    source: tab === "members" ? "member" : tab === "careers" ? "careers" : undefined, mine: tab === "mine",
  });
  // Jobs where a member can help come first, then newest
  const sorted = tab === "mine" ? jobs : [...jobs].sort((a, z) => Number((z.insiders_count ?? 0) > 0) - Number((a.insiders_count ?? 0) > 0) || z.created_at.localeCompare(a.created_at));
  const b = `/${locale}/app/jobs`;
  const qs = (o: Record<string, string>) => { const p = new URLSearchParams({ ...(query ? { q: query } : {}), ...(mgr ? { mgr: "1" } : {}), tab, ...o }); return `${b}?${p}`; };
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold text-ink">{M.jobs.title}</h1>
          <p className="max-w-2xl text-[14px] leading-6 text-ink-2">{M.jobs.sub}</p>
        </div>
        <Link href={`${b}/new`} className="btn btn-primary"><Plus className="h-4 w-4" />{M.jobs.share}</Link>
      </div>
      <form className="mb-4 flex flex-wrap items-center gap-2">
        <input type="hidden" name="tab" value={tab} />
        <label className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
          <input name="q" defaultValue={query} placeholder={M.jobs.search} className="input h-11 ps-9" />
        </label>
        <label className="flex h-11 items-center gap-2 rounded-[14px] border border-line px-3 text-[14px] text-ink-2">
          <input type="checkbox" name="mgr" value="1" defaultChecked={mgr} className="h-4 w-4 accent-navy" />{M.jobs.managerial}
        </label>
        <button className="btn btn-outline h-11">{t.common.search}</button>
      </form>
      <Tabs items={[
        { href: qs({ tab: "all" }), label: M.jobs.all, active: tab === "all" },
        { href: qs({ tab: "following" }), label: M.jobs.following, active: tab === "following" },
        { href: qs({ tab: "members" }), label: M.jobs.members, active: tab === "members" },
        { href: qs({ tab: "careers" }), label: M.jobs.careers, active: tab === "careers" },
        { href: qs({ tab: "mine" }), label: M.jobs.mine, active: tab === "mine" },
      ]} />
      {sorted.length === 0 ? <Empty>{tab === "following" ? M.home.noFollow : M.jobs.empty}</Empty> : (
        <div className="grid gap-3 md:grid-cols-2">{sorted.map((j) => <JobCard key={j.id} j={j} locale={locale} M={M} t={t} />)}</div>
      )}
    </div>
  );
}
