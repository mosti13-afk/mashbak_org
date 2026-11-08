import { Search } from "lucide-react";
import { Empty } from "@/components/ui";
import { MemberCardV2 } from "@/components/v2";
import { memberDict } from "@/i18n/member";
import { repo } from "@/lib/data";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

function dayHash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 4294967296;
}

export default async function Members({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  const M = memberDict[locale];
  const v = await requireMember(locale);
  const q = await searchParams;
  const query = sp(q.q) ?? "";
  const sector = sp(q.sector) ?? "";
  const mentor = sp(q.mentor) === "1";
  const chats = sp(q.chats) === "1";
  const [members, all] = await Promise.all([
    repo.listMembers({ viewerId: v.id, q: query, sector: sector || undefined, mentor, chats }),
    repo.listMembers({ viewerId: v.id }),
  ]);
  // daily rotation so the directory doesn't always show the same faces first
  const day = new Date().toISOString().slice(0, 10);
  const sorted = query ? members : [...members].sort((a, z) => dayHash(`${v.id}|${day}|${z.id}`) - dayHash(`${v.id}|${day}|${a.id}`));
  const stats = await repo.memberStats(sorted.slice(0, 120).map((m) => m.id));
  const sectors = [...new Set(all.map((m) => m.sector).filter(Boolean))].sort() as string[];
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-[26px] font-bold text-ink">{M.members.title}</h1>
      <p className="mb-5 text-[14px] text-ink-2">{M.members.sub}</p>
      <form className="mb-6 flex flex-wrap items-center gap-2">
        <label className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
          <input name="q" defaultValue={query} placeholder={M.members.search} className="input h-11 ps-9" />
        </label>
        <select name="sector" defaultValue={sector} className="select h-11 w-auto">
          <option value="">{t.common.sector}: {t.common.all}</option>
          {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <label className="flex h-11 items-center gap-2 rounded-[14px] border border-line px-3 text-[14px] text-ink-2"><input type="checkbox" name="chats" value="1" defaultChecked={chats} className="h-4 w-4 accent-navy" />{M.members.chats}</label>
        <label className="flex h-11 items-center gap-2 rounded-[14px] border border-line px-3 text-[14px] text-ink-2"><input type="checkbox" name="mentor" value="1" defaultChecked={mentor} className="h-4 w-4 accent-navy" />{M.members.mentors}</label>
        <button className="btn btn-primary h-11">{t.common.search}</button>
      </form>
      {sorted.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{sorted.map((m) => <MemberCardV2 key={m.id} m={m} locale={locale} M={M} stats={stats[m.id]} />)}</div>
      ) : <Empty>{M.members.empty}</Empty>}
    </div>
  );
}
