import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { JobRow } from "@/components/cards";
import { Empty, PageHeader, Tabs } from "@/components/ui";
import { repo } from "@/lib/data";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function Jobs({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  const v = await requireMember(locale);
  const q = await searchParams;
  const query = sp(q.q) ?? "";
  const tab = sp(q.tab) ?? "all";
  const managerialOnly = sp(q.m) === "1";
  const jobs = await repo.listJobs({ viewerId: v.id, q: query, managerialOnly, includeClosed: tab === "mine" });
  const list = tab === "mine" ? jobs.filter((j) => j.posted_by === v.id) : tab === "referrals" ? jobs.filter((j) => j.my_referral) : jobs;
  const b = `/${locale}/app/jobs`;
  return (
    <>
      <PageHeader title={t.app.jobs.title} sub={t.app.jobs.sub} actions={<Link href={`${b}/new`} className="btn btn-primary"><Plus className="h-4 w-4" />{t.app.jobs.post}</Link>} />
      <Tabs items={[
        { href: b, label: t.common.all, active: tab === "all" },
        { href: `${b}?tab=referrals`, label: t.app.jobs.referralSent, active: tab === "referrals" },
        { href: `${b}?tab=mine`, label: t.app.jobs.yours, active: tab === "mine" },
      ]} />
      <form className="card mb-6 flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <input type="hidden" name="tab" value={tab} />
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
          <input name="q" defaultValue={query} placeholder={`${t.common.search}…`} className="input border-0 ps-10 focus:ring-0" />
        </label>
        <label className="flex items-center gap-2 whitespace-nowrap px-2 text-sm font-bold text-ink-2">
          <input type="checkbox" name="m" value="1" defaultChecked={managerialOnly} className="h-4 w-4 accent-navy" />{t.app.jobs.onlyManagerial}
        </label>
        <button className="btn btn-primary">{t.common.search}</button>
      </form>
      {list.length ? <div className="space-y-3">{list.map((j) => <JobRow key={j.id} j={j} locale={locale} t={t} />)}</div> : <Empty action={<Link href={`${b}/new`} className="btn btn-outline btn-sm">{t.app.jobs.post}</Link>}>{t.app.jobs.empty}</Empty>}
    </>
  );
}
