import { ArrowRight, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { followCompany } from "@/app/actions";
import { Empty } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import { CompanyLogo, JobCard, MemberCardV2, Section, companyName } from "@/components/v2";
import { fmt, memberDict } from "@/i18n/member";
import { repo } from "@/lib/data";
import { rotateInsiders } from "@/lib/insiders";
import { pageLocale } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function CompanyPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, t } = await pageLocale(params);
  const M = memberDict[locale];
  const C = M.companies;
  const v = await requireMember(locale);
  const { slug } = await params;
  const c = await repo.getCompany(decodeURIComponent(slug));
  if (!c) notFound();
  const [jobs, members, insiders, followed] = await Promise.all([
    repo.listJobs({ viewerId: v.id, companyId: c.id }),
    repo.listMembers({ viewerId: v.id, companyId: c.id }),
    repo.companyInsiders(c.id),
    repo.followedCompanyIds(v.id),
  ]);
  // members open to referrals rotate fairly at the top; the rest follow
  const order = rotateInsiders(insiders, { viewerId: v.id, context: `company:${c.id}` }).map((i) => i.id);
  const people = [...members].sort((a, z) => (order.indexOf(a.id) < 0 ? 999 : order.indexOf(a.id)) - (order.indexOf(z.id) < 0 ? 999 : order.indexOf(z.id)));
  const stats = await repo.memberStats(people.map((p) => p.id));
  const following = followed.includes(c.id);
  const name = companyName(c, locale);
  return (
    <div className="mx-auto max-w-5xl">
      <Link href={`/${locale}/app/companies`} className="mb-4 inline-flex items-center gap-1 text-[13px] font-semibold text-mist hover:text-navy"><ArrowRight className="h-4 w-4 ltr:rotate-180" />{C.title}</Link>
      <header className="card flex flex-wrap items-center gap-4 p-5 sm:p-6">
        <CompanyLogo c={c} size={72} />
        <div className="min-w-0 flex-1">
          <h1 className="text-[26px] font-bold text-ink">{name}</h1>
          <p className="text-[14px] text-ink-2">{[c.sector, fmt(C.members, { n: members.length }), fmt(C.jobs, { n: jobs.length })].filter(Boolean).join(" · ")}</p>
          <p className="mt-1 flex flex-wrap gap-3 text-[13px]">
            {c.website && <a href={c.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-navy hover:underline"><ExternalLink className="h-3.5 w-3.5" />{C.visit}</a>}
            {c.careers_url && <a href={c.careers_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-navy hover:underline"><ExternalLink className="h-3.5 w-3.5" />{C.careersPage}</a>}
            {c.careers_url && c.last_synced_at && <span className="inline-flex items-center gap-1 text-mist"><RefreshCw className="h-3.5 w-3.5" />{C.synced}</span>}
          </p>
        </div>
        <form action={followCompany}>
          <input type="hidden" name="locale" value={locale} /><input type="hidden" name="company_id" value={c.id} />
          <input type="hidden" name="on" value={following ? "0" : "1"} /><input type="hidden" name="redirect" value={`/${locale}/app/companies/${c.slug}`} />
          <SubmitButton className={following ? "btn btn-ghost text-green-deep" : "btn btn-primary"}>{following ? C.following : C.follow}</SubmitButton>
        </form>
      </header>

      <Section title={fmt(C.insiders, { company: name })} sub={people.length ? M.job.insidersSub : undefined}>
        {people.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{people.map((m) => <MemberCardV2 key={m.id} m={m} locale={locale} M={M} stats={stats[m.id]} />)}</div>
          : <Empty>{C.noMembers}</Empty>}
      </Section>

      <Section title={C.openJobs}>
        {jobs.length ? <div className="grid gap-3 md:grid-cols-2">{jobs.map((j) => <JobCard key={j.id} j={j} locale={locale} M={M} t={t} compact />)}</div> : <Empty>{C.noJobs}</Empty>}
      </Section>
    </div>
  );
}
