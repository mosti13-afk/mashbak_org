import { Faq } from "@/components/site/interactive";
import { CtaBand, PageHero } from "@/components/site/sections";
import { tr } from "@/i18n/config";
import { siteDict } from "@/i18n/site";
import { repo } from "@/lib/data";
import { pageLocale, type LocaleParams } from "@/lib/page";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await pageLocale(params);
  return { title: siteDict[locale].faq.badge };
}

export default async function FaqPage({ params }: LocaleParams) {
  const { locale } = await pageLocale(params);
  const faqs = await repo.listFaqs();
  return (
    <>
      <PageHero narrow a={siteDict[locale].faq.titleA} />
      <section className="container-x max-w-3xl pb-6"><Faq items={faqs.map((f) => ({ q: tr(f.question, locale), a: tr(f.answer, locale) }))} /></section>
      <CtaBand locale={locale} />
    </>
  );
}
