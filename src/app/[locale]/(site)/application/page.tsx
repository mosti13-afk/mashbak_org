import { BadgeCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { PageHero } from "@/components/site/sections";
import { siteDict } from "@/i18n/site";
import { repo } from "@/lib/data";
import { optionsFor } from "@/lib/dropdowns";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { getViewer } from "@/lib/session";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await pageLocale(params);
  return { title: siteDict[locale].apply };
}

export default async function Application({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale } = await pageLocale(params);
  const t = siteDict[locale];
  const q = await searchParams;
  const viewer = await getViewer();
  if (viewer && (viewer.status === "active" || viewer.role === "admin")) redirect(`/${locale}/app`); // bug report #8

  if (sp(q.ok)) {
    return (
      <div className="container-x flex max-w-xl flex-col items-center py-24 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-mint text-white"><BadgeCheck className="h-8 w-8" /></span>
        <h1 className="mt-6 t-h1">{t.application.successTitle}</h1>
        <p className="mt-3 text-[17px] leading-8 text-ink-2">{t.application.successBody}</p>
        <Link href={`/${locale}`} className="btn btn-outline mt-8">{t.nav.backHome}</Link>
      </div>
    );
  }
  const dd = await repo.listDropdowns();
  const lists = {
    city: optionsFor(dd, "CITY", locale), academic: optionsFor(dd, "ACADEMIC_TITLE", locale), org: optionsFor(dd, "ORGANIZATION", locale),
    years: optionsFor(dd, "YEARS_OF_EXPERIENCE", locale), sector: optionsFor(dd, "WORK_SECTOR", locale),
  };
  const err = sp(q.error);
  const error = err === "age" ? t.application.ageError : err === "dup" ? t.application.duplicate : err ? t.application.error : undefined;
  return (
    <>
      <PageHero narrow a={t.application.titleA} b={t.application.titleB} sub={t.application.sub} />
      <section className="container-x max-w-3xl pb-16"><ApplicationForm t={t.application} locale={locale} lists={lists} error={error} /></section>
    </>
  );
}
