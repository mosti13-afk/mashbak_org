import Link from "next/link";
import { VideoCard } from "@/components/site/interactive";
import { CtaBand, PageHero, SafeSvg, SectionHead, sectionHead } from "@/components/site/sections";
import { tr } from "@/i18n/config";
import { siteDict } from "@/i18n/site";
import { repo } from "@/lib/data";
import { txt } from "@/lib/settings";
import { pageLocale, type LocaleParams } from "@/lib/page";

type L = Record<string, string>;
const join = (...p: (string | undefined)[]) => p.filter(Boolean).join(" ");

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await pageLocale(params);
  return { title: siteDict[locale].footer.aboutLink };
}

export default async function About({ params }: LocaleParams) {
  const { locale } = await pageLocale(params);
  const t = siteDict[locale];
  const s = await repo.getSettings();
  const ab = s.ABOUT_PLATFORM_SECTION ?? {};
  const pr = s.PRINCIPLES_SECTION ?? {};
  const vm = s.VISION_MISSION_SECTION ?? {};
  const va = s.OUR_VALUES_SECTION ?? {};
  const why = s.WHY_MASHBEK_SECTION ?? {};
  const head = (x: typeof pr) => { const h = sectionHead(x, locale); return { a: join(h.a, h.b, h.c), desc: h.desc }; };
  return (
    <>
      <PageHero a={join(txt(ab.primaryColorTitle, locale), txt(ab.secondaryColorTitle, locale)) || t.about.titleA} sub={txt(ab.description, locale)}>
        <Link href={`/${locale}/application`} className="btn btn-primary btn-lg">{t.apply}</Link>
      </PageHero>

      <section className="container-x pb-16 md:pb-24">
        <div className="grid items-center gap-8 rounded-[32px] bg-sky p-4 sm:p-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
          <div className="px-2">
            <h2 className="t-h2">{t.about.cardTop}</h2>
            <p className="mt-3 text-[16px] leading-8 text-ink-2">{t.about.body}</p>
          </div>
          <VideoCard src="/videos/mashbek-intro.mp4" poster="/brand/about-mashbak.png" label={t.about.video} />
        </div>
      </section>

      {!!pr.cards?.length && (
        <section className="bg-white pb-16 md:pb-24">
          <div className="container-x">
            <SectionHead {...head(pr)} center={false} />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {pr.cards.map((c: { iconSvg?: string; title: L; description: L; subDescription: L }, i: number) => (
                <article key={i} className="rounded-[24px] border border-line bg-white p-6">
                  <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-mint-soft text-navy"><SafeSvg svg={c.iconSvg} className="h-6 w-6" /></span>
                  <h3 className="mt-5 text-[19px] font-bold text-navy-ink">{tr(c.title, locale)}</h3>
                  <p className="mt-2 text-[15px] leading-7 text-ink-2">{tr(c.description, locale)}</p>
                  {c.subDescription && <p className="mt-3 text-[14px] leading-6 text-mist">{tr(c.subDescription, locale)}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {!!vm.blocks?.length && (
        <section className="bg-sky py-16 md:py-24">
          <div className="container-x">
            <SectionHead {...head(vm)} center={false} />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {vm.blocks.map((bl: { key: string; iconSvg?: string; title: L; description: L; image?: string }, i: number) => (
                <article key={bl.key ?? i} className="overflow-hidden rounded-[24px] bg-white ring-1 ring-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {bl.image && <img src={bl.image} alt="" className="aspect-[2/1] w-full object-cover" loading="lazy" />}
                  <div className="p-6">
                    <h3 className="flex items-center gap-2.5 t-h2"><SafeSvg svg={bl.iconSvg} className="h-5 w-5 text-mint" />{tr(bl.title, locale)}</h3>
                    <p className="mt-3 text-[16px] leading-8 text-ink-2">{tr(bl.description, locale)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {!!why.cards?.length && (
        <section className="bg-white py-16 md:py-24">
          <div className="container-x">
            <SectionHead {...head(why)} center={false} />
            <div className="list mt-8 md:grid md:grid-cols-2 md:divide-y-0">
              {why.cards.map((c: { iconSvg?: string; title: L; description: L }, i: number) => (
                <div key={i} className="row items-start py-5 md:border-b md:border-line">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-mint-soft text-navy"><SafeSvg svg={c.iconSvg} className="h-5 w-5" /></span>
                  <span><span className="row-title">{tr(c.title, locale)}</span><span className="mt-1 block text-[15px] leading-7 text-ink-2">{tr(c.description, locale)}</span></span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {!!va.values?.length && (
        <section className="bg-white pb-8">
          <div className="container-x">
            <SectionHead {...head(va)} center={false} />
            <div className="mt-6 flex flex-wrap gap-2.5">
              {va.values.map((v: { iconSvg?: string; label: L }, i: number) => (
                <span key={i} className="inline-flex h-11 items-center gap-2 rounded-full bg-sky px-4 text-[15px] font-bold text-navy-ink">
                  <SafeSvg svg={v.iconSvg} className="h-4 w-4 text-mint" />{tr(v.label, locale)}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand locale={locale} />
    </>
  );
}
