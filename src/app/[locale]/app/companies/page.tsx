import { Plus } from "lucide-react";
import Link from "next/link";
import { addCompany, followCompany } from "@/app/actions";
import { EmptyState, PageTitle, SearchBox, SectionTabs } from "@/components/shell/page";
import { Dialog, SubmitButton } from "@/components/ui/client";
import { CompanyLogo, companyName } from "@/components/v2";
import { fmt, memberDict } from "@/i18n/member";
import { shellDict } from "@/i18n/shell";
import { repo } from "@/lib/data";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function Companies({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale } = await pageLocale(params);
  const M = memberDict[locale];
  const C = M.companies;
  const S = shellDict[locale];
  const v = await requireMember(locale);
  const query = sp((await searchParams).q) ?? "";
  const list = await repo.listCompanies({ viewerId: v.id, q: query });
  const sorted = [...list].sort((a, z) => Number(z.id === v.company_id) - Number(a.id === v.company_id) || Number(z.following) - Number(a.following) || z.members - a.members || z.jobs - a.jobs);
  const b = `/${locale}/app`;
  const add = (
    <Dialog title={C.add} triggerClass="btn btn-outline" trigger={<><Plus className="h-5 w-5" /><span className="hidden sm:inline">{C.add}</span></>}>
      <p className="mb-4 text-[14px] leading-6 text-ink-2">{C.addSub}</p>
      <form action={addCompany} className="space-y-3">
        <input type="hidden" name="locale" value={locale} />
        <label className="block"><span className="label">{C.name}</span><input name="name" required minLength={2} className="input" dir="auto" defaultValue={query} /></label>
        <label className="block"><span className="label">{C.website}</span><input name="website" className="input" dir="ltr" placeholder="company.com" /></label>
        <label className="block"><span className="label">{C.careers}</span><input name="careers_url" type="url" className="input" dir="ltr" placeholder="https://" /></label>
        <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" name="mine" className="h-4 w-4 accent-navy" />{C.mine}</label>
        <SubmitButton className="btn btn-primary w-full">{C.save}</SubmitButton>
      </form>
    </Dialog>
  );
  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle title={S.opportunities} action={add} />
      <SectionTabs items={[{ href: `${b}/jobs`, label: S.jobs, active: false }, { href: `${b}/companies`, label: S.companies, active: true }]} />
      <SearchBox defaultValue={query} placeholder={C.search} />
      <p className="t-small mb-3 px-1">{C.sub}</p>
      {sorted.length === 0 ? <EmptyState title={C.empty} action={add} /> : (
        <div className="list">
          {sorted.map((c) => (
            <div key={c.id} className="row relative">
              <Link href={`${b}/companies/${c.slug}`} className="absolute inset-0" aria-label={c.name} />
              <CompanyLogo c={c} size={46} />
              <span className="min-w-0 flex-1">
                <span className="row-title block">{companyName(c, locale)}</span>
                <span className="row-sub block">{c.id === v.company_id ? `${C.yourCompany} · ` : ""}{fmt(C.members, { n: c.members })} · {fmt(C.jobs, { n: c.jobs })}</span>
              </span>
              <form action={followCompany} className="relative z-10">
                <input type="hidden" name="locale" value={locale} /><input type="hidden" name="company_id" value={c.id} />
                <input type="hidden" name="on" value={c.following ? "0" : "1"} /><input type="hidden" name="redirect" value={`${b}/companies${query ? `?q=${encodeURIComponent(query)}` : ""}`} />
                <SubmitButton className={c.following ? "btn btn-sm btn-secondary" : "btn btn-sm btn-outline"}>{c.following ? C.following : C.follow}</SubmitButton>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
