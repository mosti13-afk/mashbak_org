import { Check, Clock } from "lucide-react";
import Link from "next/link";
import { CtaBand, PageHero } from "@/components/site/sections";
import { tr } from "@/i18n/config";
import { siteDict } from "@/i18n/site";
import { repo } from "@/lib/data";
import { pageLocale, type LocaleParams } from "@/lib/page";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await pageLocale(params);
  return { title: siteDict[locale].nav.programs };
}

export default async function Programs({ params }: LocaleParams) {
  const { locale } = await pageLocale(params);
  const t = siteDict[locale];
  const programs = await repo.listPrograms();
  return (
    <>
      <PageHero a={t.programs.pageTitleA} b={t.programs.pageTitleB} sub={t.programs.pageSub} />
      <section className="container-x pb-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <article key={p.id} id={p.slug} className="flex flex-col rounded-[24px] border border-line bg-white p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-[16px] bg-sky p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.icon_url ? <img src={p.icon_url} alt="" className="max-h-full max-w-full object-contain" /> : null}
                </span>
                <Link href={`/${locale}/our_programs/${p.slug}`} className="text-[19px] font-bold leading-6 text-navy-ink hover:text-navy" dir="auto">{tr(p.title, locale)}</Link>
              </div>
              <p className="mt-4 line-clamp-4 text-[15px] leading-7 text-ink-2">{tr(p.summary, locale)}</p>
              {p.target_audience.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-[13px] font-bold text-mist">{t.programs.forWho}</p>
                  <ul className="space-y-1.5">{p.target_audience.slice(0, 3).map((x, i) => <li key={i} className="flex gap-2 text-[14px] leading-6 text-ink-2"><Check className="mt-1 h-4 w-4 shrink-0 text-mint" />{tr(x, locale)}</li>)}</ul>
                </div>
              )}
              <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                {p.sessions_count ? <span className="flex items-center gap-1.5 text-[13px] text-mist"><Clock className="h-4 w-4" />{p.sessions_count} {t.programs.sessions}</span> : <span />}
                <Link href={`/${locale}/our_programs/${p.slug}`} className="btn btn-outline btn-sm">{t.programs.more}</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <CtaBand locale={locale} />
    </>
  );
}
