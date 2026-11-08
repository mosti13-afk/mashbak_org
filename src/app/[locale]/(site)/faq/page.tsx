import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { tr } from "@/i18n/config";
import { repo } from "@/lib/data";
import { pageLocale, type LocaleParams } from "@/lib/page";

export async function generateMetadata({ params }: LocaleParams) {
  const { t } = await pageLocale(params);
  return { title: t.faq.title };
}

export default async function Faq({ params }: LocaleParams) {
  const { locale, t } = await pageLocale(params);
  const faqs = await repo.listFaqs();
  return (
    <div className="container-x max-w-3xl py-14 sm:py-20">
      <PageHeader title={t.faq.title} sub={t.faq.sub} />
      <div className="card divide-y divide-line px-6">
        {faqs.map((f, i) => (
          <details key={f.id} className="group py-5" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-black text-navy-ink">
              {tr(f.question, locale)}
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper text-navy transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 leading-relaxed text-ink-2">{tr(f.answer, locale)}</p>
          </details>
        ))}
      </div>
      <Link href={`/${locale}/contact`} className="btn btn-outline mt-8">{t.nav.contact}</Link>
    </div>
  );
}
