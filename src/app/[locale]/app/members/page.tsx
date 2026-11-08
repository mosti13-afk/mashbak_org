import { Search } from "lucide-react";
import { MemberTile } from "@/components/cards";
import { Empty, PageHeader } from "@/components/ui";
import { repo } from "@/lib/data";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function Members({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  const v = await requireMember(locale);
  const q = await searchParams;
  const query = sp(q.q) ?? "";
  const sector = sp(q.sector) ?? "";
  const mentor = sp(q.mentor) === "1";
  const [members, all] = await Promise.all([
    repo.listMembers({ viewerId: v.id, q: query, sector: sector || undefined, mentor }),
    repo.listMembers({ viewerId: v.id }),
  ]);
  const sectors = [...new Set(all.map((m) => m.sector).filter(Boolean))].sort() as string[];
  return (
    <>
      <PageHeader title={t.app.members.title} sub={t.app.members.sub} />
      <form className="card mb-6 flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
          <input name="q" defaultValue={query} placeholder={t.app.members.searchPh} className="input border-0 ps-10 focus:ring-0" />
        </label>
        <select name="sector" defaultValue={sector} className="select sm:w-48">
          <option value="">{t.common.sector}: {t.common.all}</option>
          {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <label className="flex items-center gap-2 whitespace-nowrap px-2 text-sm font-bold text-ink-2">
          <input type="checkbox" name="mentor" value="1" defaultChecked={mentor} className="h-4 w-4 accent-navy" />{t.app.members.mentor}
        </label>
        <button className="btn btn-primary">{t.common.search}</button>
      </form>
      {members.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {members.map((m) => <MemberTile key={m.id} m={m} locale={locale} t={t} />)}
        </div>
      ) : <Empty>{t.app.members.empty}</Empty>}
    </>
  );
}
