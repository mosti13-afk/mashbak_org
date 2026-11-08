import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { createJob } from "@/app/actions";
import { ShareJobForm } from "@/components/app/ShareJobForm";
import { Notice } from "@/components/ui";
import { memberDict } from "@/i18n/member";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function NewJob({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  const M = memberDict[locale];
  const v = await requireMember(locale);
  const S = M.share;
  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/${locale}/app/jobs`} className="mb-4 inline-flex items-center gap-1 text-[13px] font-semibold text-mist hover:text-navy"><ArrowRight className="h-4 w-4 ltr:rotate-180" />{M.jobs.title}</Link>
      <h1 className="text-[26px] font-bold text-ink">{S.title}</h1>
      <p className="mb-5 text-[14px] leading-6 text-ink-2">{S.sub}</p>
      {sp((await searchParams).error) ? <Notice tone="red">{S.description}: 10+</Notice> : null}
      <ShareJobForm action={createJob} locale={locale} types={t.app.jobs.types} modes={t.app.jobs.modes} defaultCompany={v.company ?? ""}
        copy={{ link: S.link, fetch: S.fetch, fetching: S.fetching, fetched: S.fetched, failed: S.failed, manual: S.manual, jobTitle: S.jobTitle, company: S.company,
          location: S.location, type: S.type, mode: S.mode, managerial: S.managerial, description: S.description, requirements: S.requirements, apply: S.apply, publish: S.publish, note: S.note }} />
    </div>
  );
}
