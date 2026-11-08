import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { addCompany, followCompany } from "@/app/actions";
import { Empty } from "@/components/ui";
import { Dialog, SubmitButton } from "@/components/ui/client";
import { CompanyLogo, companyName } from "@/components/v2";
import { fmt, memberDict } from "@/i18n/member";
import { repo } from "@/lib/data";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function Companies({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale } = await pageLocale(params);
  const M = memberDict[locale];
  const C = M.companies;
  const v = await requireMember(locale);
  const q = await searchParams;
  const query = sp(q.q) ?? "";
  const list = await repo.listCompanies({ viewerId: v.id, q: query });
  // your company first, then followed, then where members are, then open jobs
  const sorted = [...list].sort((a, z) => Number(z.id === v.company_id) - Number(a.id === v.company_id) || Number(z.following) - Number(a.following) || z.members - a.members || z.jobs - a.jobs);
  const b = `/${locale}/app/companies`;
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold text-ink">{C.title}</h1>
          <p className="text-[14px] leading-6 text-ink-2">{C.sub}</p>
        </div>
        <Dialog title={C.add} triggerClass="btn btn-outline" trigger={<><Plus className="h-4 w-4" />{C.add}</>}>
          <p className="mb-4 text-[13px] text-ink-2">{C.addSub}</p>
          <form action={addCompany} className="space-y-3">
            <input type="hidden" name="locale" value={locale} />
            <label className="block"><span className="label">{C.name}</span><input name="name" required minLength={2} className="input" dir="auto" defaultValue={query} /></label>
            <label className="block"><span className="label">{C.website}</span><input name="website" className="input" dir="ltr" placeholder="company.com" /></label>
            <label className="block"><span className="label">{C.careers}</span><input name="careers_url" type="url" className="input" dir="ltr" placeholder="https://..." /></label>
            <label className="block"><span className="label">{C.sector}</span><input name="sector" className="input" dir="auto" /></label>
            <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" name="mine" className="h-4 w-4 accent-navy" />{C.mine}</label>
            <SubmitButton className="btn btn-primary w-full">{C.save}</SubmitButton>
          </form>
        </Dialog>
      </div>
      <form className="mb-5">
        <label className="relative block">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
          <input name="q" defaultValue={query} placeholder={C.search} className="input h-11 ps-9" />
        </label>
      </form>
      {sorted.length === 0 ? <Empty>{C.empty}</Empty> : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((c) => (
            <li key={c.id} className="card card-hover relative flex items-center gap-3 p-4">
              <Link href={`${b}/${c.slug}`} className="absolute inset-0 rounded-[inherit]" aria-label={c.name} />
              <CompanyLogo c={c} size={48} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-ink">{companyName(c, locale)}</p>
                <p className="text-[12px] text-mist">
                  {c.id === v.company_id ? <span className="font-semibold text-green-deep">{C.yourCompany} · </span> : null}
                  {fmt(C.members, { n: c.members })} · {fmt(C.jobs, { n: c.jobs })}
                </p>
              </div>
              <form action={followCompany} className="relative z-10">
                <input type="hidden" name="locale" value={locale} /><input type="hidden" name="company_id" value={c.id} />
                <input type="hidden" name="on" value={c.following ? "0" : "1"} /><input type="hidden" name="redirect" value={`${b}${query ? `?q=${encodeURIComponent(query)}` : ""}`} />
                <SubmitButton className={c.following ? "btn btn-ghost btn-sm text-green-deep" : "btn btn-outline btn-sm"}>{c.following ? C.following : C.follow}</SubmitButton>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
