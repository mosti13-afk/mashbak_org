import { CommunityTabs } from "@/components/shell/CommunityTabs";
import { EmptyState, FilterChips, PageTitle, SearchBox } from "@/components/shell/page";
import { PersonRow } from "@/components/v2";
import { memberDict } from "@/i18n/member";
import { shellDict } from "@/i18n/shell";
import { repo } from "@/lib/data";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

function dayHash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 4294967296;
}

export default async function Members({ params, searchParams }: { params: Promise<{ locale: string }> ; searchParams: SearchParams }) {
  const { locale } = await pageLocale(params);
  const M = memberDict[locale];
  const S = shellDict[locale];
  const v = await requireMember(locale);
  const q = await searchParams;
  const query = sp(q.q) ?? "";
  const f = sp(q.f) ?? "all";
  const members = await repo.listMembers({ viewerId: v.id, q: query, mentor: f === "mentors", chats: f === "chats", companyId: f === "company" && v.company_id ? v.company_id : undefined });
  const sameSector = f === "sector" ? members.filter((m) => m.sector && m.sector === v.sector) : members;
  const day = new Date().toISOString().slice(0, 10);
  const sorted = query ? sameSector : [...sameSector].sort((a, z) => dayHash(`${v.id}|${day}|${z.id}`) - dayHash(`${v.id}|${day}|${a.id}`));
  const stats = await repo.memberStats(sorted.slice(0, 150).map((m) => m.id));
  const b = `/${locale}/app`;
  const href = (ff: string) => `${b}/members?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(ff !== "all" ? { f: ff } : {}) })}`;
  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle title={S.community} />
      <CommunityTabs base={b} S={S} active="members" />
      <SearchBox defaultValue={query} placeholder={M.members.search} hidden={f !== "all" ? { f } : undefined} />
      <FilterChips items={[
        { href: href("all"), label: M.jobs.all, on: f === "all" },
        { href: href("chats"), label: M.members.chats, on: f === "chats" },
        { href: href("mentors"), label: M.members.mentors, on: f === "mentors" },
        ...(v.sector ? [{ href: href("sector"), label: v.sector, on: f === "sector" }] : []),
        ...(v.company_id ? [{ href: href("company"), label: M.companies.yourCompany, on: f === "company" }] : []),
      ]} />
      {sorted.length ? <div className="list">{sorted.map((m) => <PersonRow key={m.id} m={m} locale={locale} M={M} stats={stats[m.id]} />)}</div>
        : <EmptyState title={M.members.empty} />}
    </div>
  );
}
