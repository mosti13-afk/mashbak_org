import { Plus } from "lucide-react";
import Link from "next/link";
import { EmptyState, FilterChips, PageTitle, SearchBox, SectionTabs } from "@/components/shell/page";
import { JobRow } from "@/components/v2";
import { memberDict } from "@/i18n/member";
import { shellDict } from "@/i18n/shell";
import { repo } from "@/lib/data";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function Jobs({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale } = await pageLocale(params);
  const M = memberDict[locale];
  const S = shellDict[locale];
  const v = await requireMember(locale);
  const q = await searchParams;
  const f = sp(q.f) ?? "all";
  const query = sp(q.q) ?? "";
  const followed = f === "following" ? await repo.followedCompanyIds(v.id) : undefined;
  const jobs = await repo.listJobs({
    viewerId: v.id, q: query, managerialOnly: f === "mgr", companyIds: followed, includeClosed: f === "mine",
    source: f === "members" ? "member" : f === "careers" ? "careers" : undefined, mine: f === "mine",
  });
  const sorted = f === "mine" ? jobs : [...jobs].sort((a, z) => Number((z.insiders_count ?? 0) > 0) - Number((a.insiders_count ?? 0) > 0) || z.created_at.localeCompare(a.created_at));
  const b = `/${locale}/app`;
  const href = (ff: string) => `${b}/jobs?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(ff !== "all" ? { f: ff } : {}) })}`;
  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle title={S.opportunities} action={<Link href={`${b}/jobs/new`} className="btn btn-primary"><Plus className="h-5 w-5" /><span className="hidden sm:inline">{M.jobs.share}</span></Link>} />
      <SectionTabs items={[{ href: `${b}/jobs`, label: S.jobs, active: true }, { href: `${b}/companies`, label: S.companies, active: false }]} />
      <SearchBox defaultValue={query} placeholder={M.jobs.search} hidden={f !== "all" ? { f } : undefined} />
      <FilterChips items={[
        { href: href("all"), label: M.jobs.all, on: f === "all" },
        { href: href("following"), label: M.jobs.following, on: f === "following" },
        { href: href("mgr"), label: M.jobs.managerial, on: f === "mgr" },
        { href: href("members"), label: M.jobs.members, on: f === "members" },
        { href: href("careers"), label: M.jobs.careers, on: f === "careers" },
        { href: href("mine"), label: M.jobs.mine, on: f === "mine" },
      ]} />
      {sorted.length ? <div className="list">{sorted.map((j) => <JobRow key={j.id} j={j} locale={locale} M={M} />)}</div>
        : <EmptyState title={f === "following" ? M.home.noFollow : M.jobs.empty} action={<Link href={`${b}/companies`} className="btn btn-secondary">{S.companies}</Link>} />}
    </div>
  );
}
