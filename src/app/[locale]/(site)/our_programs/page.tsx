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
      <PageHero badge={t.programs.badge} a={t.programs.pageTitleA} b={t.programs.pageTitleB} sub={t.programs.pageSub} back={{ href: `/${locale}`, label: t.nav.back }} />
      <section className="container-x pb-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <article key={p.id} id={p.slug} className="flex flex-col overflow-hidden rounded-[20px] border border-line bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="grid h-40 place-items-center bg-gradient-to-b from-sky to-white p-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.image_url ? <img src={p.image_url} alt={tr(p.title, locale)} className="max-h-full max-w-[75%] object-contain" /> : p.icon_url ? <img src={p.icon_url} alt="" className="h-16 w-16 object-contain" /> : null}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <Link href={`/${locale}/our_programs/${p.slug}`} className="flex items-center gap-2 text-[20px] font-semibold text-ink hover:text-navy" dir="auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.icon_url && <img src={p.icon_url} alt="" className="h-6 w-6 rounded object-contain" />}{tr(p.title, locale)}
                </Link>
                <p className="line-clamp-4 text-[14px] leading-6 text-navy">{tr(p.summary, locale)}</p>
                {p.target_audience.length > 0 && (
                  <div className="border-t border-line pt-3">
                    <p className="mb-2 text-[13px] text-mist">{t.programs.forWho}</p>
                    <ul className="space-y-1.5">{p.target_audience.map((x, i) => <li key={i} className="flex gap-2 text-[14px] text-ink-2"><Check className="mt-1 h-3.5 w-3.5 shrink-0 text-mint" />{tr(x, locale)}</li>)}</ul>
                  </div>
                )}
                {p.benefits.length > 0 && (
                  <div>
                    <p className="mb-2 text-[13px] text-mist">{t.programs.offers}</p>
                    <ul className="space-y-1.5">{p.benefits.map((x, i) => <li key={i} className="flex gap-2 text-[14px] text-ink-2"><Check className="mt-1 h-3.5 w-3.5 shrink-0 text-mint" />{tr(x, locale)}</li>)}</ul>
                  </div>
                )}
                {p.sessions_count ? <p className="flex items-center gap-2 border-t border-line pt-3 text-[14px] font-semibold text-green-deep"><Clock className="h-4 w-4" />{p.sessions_count} {t.programs.sessions}</p> : null}
                <Link href={`/${locale}/application`} className="btn btn-outline mt-auto h-11">{t.programs.join}</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <CtaBand locale={locale} />
    </>
  );
}
