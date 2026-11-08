import { ExternalLink, RefreshCw } from "lucide-react";
import { notFound } from "next/navigation";
import { followCompany } from "@/app/actions";
import { BackLink, EmptyState, SectionHeader } from "@/components/shell/page";
import { SubmitButton } from "@/components/ui/client";
import { CompanyLogo, JobRow, PersonRow, companyName } from "@/components/v2";
import { fmt, memberDict } from "@/i18n/member";
import { shellDict } from "@/i18n/shell";
import { repo } from "@/lib/data";
import { rotateInsiders } from "@/lib/insiders";
import { pageLocale } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function CompanyPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale } = await pageLocale(params);
  const M = memberDict[locale];
  const C = M.companies;
  const S = shellDict[locale];
  const v = await requireMember(locale);
  const { slug } = await params;
  const c = await repo.getCompany(decodeURIComponent(slug));
  if (!c) notFound();
  const [jobs, members, insiders, followed] = await Promise.all([
    repo.listJobs({ viewerId: v.id, companyId: c.id }), repo.listMembers({ viewerId: v.id, companyId: c.id }),
    repo.companyInsiders(c.id), repo.followedCompanyIds(v.id),
  ]);
  const order = rotateInsiders(insiders, { viewerId: v.id, context: `company:${c.id}` }).map((i) => i.id);
  const rank = (id: string) => (order.indexOf(id) < 0 ? 999 : order.indexOf(id));
  const people = [...members].sort((a, z) => rank(a.id) - rank(z.id));
  const stats = await repo.memberStats(people.map((p) => p.id));
  const following = followed.includes(c.id);
  const name = companyName(c, locale);
  const b = `/${locale}/app`;
  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href={`${b}/companies`} label={S.companies} />
      <header className="flex items-center gap-4">
        <CompanyLogo c={c} size={72} className="rounded-[20px]" />
        <div className="min-w-0 flex-1">
          <h1 className="t-h1">{name}</h1>
          <p className="t-small">{[c.sector, fmt(C.members, { n: members.length }), fmt(C.jobs, { n: jobs.length })].filter(Boolean).join(" · ")}</p>
        </div>
      </header>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <form action={followCompany}>
          <input type="hidden" name="locale" value={locale} /><input type="hidden" name="company_id" value={c.id} />
          <input type="hidden" name="on" value={following ? "0" : "1"} /><input type="hidden" name="redirect" value={`${b}/companies/${c.slug}`} />
          <SubmitButton className={following ? "btn btn-secondary" : "btn btn-primary"}>{following ? C.following : C.follow}</SubmitButton>
        </form>
        {c.careers_url && <a href={c.careers_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline"><ExternalLink className="h-4 w-4" />{C.careersPage}</a>}
        {!c.careers_url && c.website && <a href={c.website} target="_blank" rel="noopener noreferrer" className="btn btn-outline"><ExternalLink className="h-4 w-4" />{C.visit}</a>}
      </div>
      {c.careers_url && c.last_synced_at && <p className="t-small mt-2 flex items-center gap-1"><RefreshCw className="h-3.5 w-3.5" />{C.synced}</p>}

      <SectionHeader title={fmt(C.insiders, { company: name })} />
      {people.length ? (
        <>
          <div className="list">{people.map((m) => <PersonRow key={m.id} m={m} locale={locale} M={M} stats={stats[m.id]} />)}</div>
          <p className="t-small mt-2 px-1">{M.job.insidersSub}</p>
        </>
      ) : <EmptyState title={C.noMembers} />}

      <SectionHeader title={C.openJobs} />
      {jobs.length ? <div className="list">{jobs.map((j) => <JobRow key={j.id} j={j} locale={locale} M={M} />)}</div> : <EmptyState title={C.noJobs} />}
    </div>
  );
}
