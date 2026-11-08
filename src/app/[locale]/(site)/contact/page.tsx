import { ContactBlock, CtaBand, PageHero } from "@/components/site/sections";
import { siteDict } from "@/i18n/site";
import { repo } from "@/lib/data";
import { pageLocale, sp, type SearchParams } from "@/lib/page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await pageLocale(params);
  return { title: siteDict[locale].nav.contact };
}

export default async function Contact({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale } = await pageLocale(params);
  const t = siteDict[locale];
  const q = await searchParams;
  const s = await repo.getSettings();
  return (
    <>
      <PageHero a={t.contact.pageTitleA} b={t.contact.pageTitleB} sub={t.contact.pageSub} back={{ href: `/${locale}`, label: t.nav.back }} />
      <section className="container-x pb-14"><ContactBlock s={s} locale={locale} sent={!!sp(q.ok)} error={!!sp(q.error)} /></section>
      <CtaBand locale={locale} />
    </>
  );
}
