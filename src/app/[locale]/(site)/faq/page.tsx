import { CtaBand, FaqSection } from "@/components/site/sections";
import { siteDict } from "@/i18n/site";
import { repo } from "@/lib/data";
import { pageLocale, type LocaleParams } from "@/lib/page";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await pageLocale(params);
  return { title: siteDict[locale].faq.badge };
}

export default async function FaqPage({ params }: LocaleParams) {
  const { locale } = await pageLocale(params);
  return (<><FaqSection faqs={await repo.listFaqs()} locale={locale} /><CtaBand locale={locale} /></>);
}
