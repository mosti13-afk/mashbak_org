import { ArrowLeft, LogIn } from "lucide-react";
import Link from "next/link";
import { Badge, CtaBand, SafeSvg, SectionHead, sectionHead } from "@/components/site/sections";
import { tr } from "@/i18n/config";
import { siteDict } from "@/i18n/site";
import { repo } from "@/lib/data";
import { hero, txt } from "@/lib/settings";
import { pageLocale, type LocaleParams } from "@/lib/page";

type L = Record<string, string>;

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
  const cta = s.JOIN_CTA_SECTION ?? {};
  const h = hero(s);
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-sky to-white pb-14 pt-8 md:pt-12">
        <div className="container-x">
          <Link href={`/${locale}`} className="mb-6 inline-flex items-center gap-2 text-[15px] text-ink-2 hover:text-navy"><span className="grid h-8 w-8 place-items-center rounded-full border border-line"><ArrowLeft className="h-4 w-4 rtl:rotate-180" /></span>{t.nav.backHome}</Link>
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
            <Badge icon={ab.badgeIconSvg}>{txt(ab.badgeText, locale)}</Badge>
            <h1 className="text-[34px] font-semibold text-ink md:text-[52px]">{txt(ab.primaryColorTitle, locale)} <span className="text-mint">{txt(ab.secondaryColorTitle, locale)}</span></h1>
            <p className="text-balance text-[17px] leading-8 text-ink-2 md:text-[20px] md:leading-9">{txt(ab.description, locale)}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <Link href={`/${locale}/application`} className="btn btn-primary h-12 px-6">{t.nav.register}<ArrowLeft className="h-4 w-4 ltr:rotate-180" /></Link>
              <Link href={`/${locale}/login`} className="btn btn-outline h-12 px-6"><LogIn className="flip-rtl h-4 w-4" />{t.nav.login}</Link>
            </div>
          </div>
          {ab.mainImage && (
            <div className="relative mx-auto mt-10 max-w-4xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ab.mainImage} alt={txt(ab.badgeText, locale)} className="aspect-[16/9] w-full rounded-[24px] object-cover shadow-[0_30px_60px_-30px_rgba(11,72,109,0.45)]" />
              <div className="absolute -bottom-6 start-6 flex items-center gap-3 rounded-[16px] bg-white px-4 py-3 shadow-[0_14px_30px_-12px_rgba(11,72,109,0.4)]">
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {(h.statsAvatars ?? []).slice(0, 3).map((src: string, i: number) => <img key={i} src={src} alt="" className="h-9 w-9 rounded-full border-2 border-white object-cover" />)}
                </div>
                <div className="leading-tight">
                  <p className="font-bold text-mint" dir="auto">{txt(ab.primaryColorSubtitle, locale)} <span className="text-ink">{txt(ab.secondaryColorSubtitle, locale)}</span></p>
                  <p className="text-[13px] text-ink-2">{txt(ab.subDescription, locale)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Principles */}
      <section className="bg-gradient-to-b from-haze/70 to-white py-16 md:py-24">
        <div className="container-x">
          <SectionHead {...sectionHead(pr, locale)} />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {(pr.cards ?? []).map((c: { iconSvg?: string; badge?: string; title: L; description: L; subDescription: L }, i: number) => (
              <article key={i} className="flex flex-col gap-3 rounded-[20px] border border-line bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-sky text-mint"><SafeSvg svg={c.iconSvg} className="h-6 w-6" /></span>
                  {c.badge && <span className="badge badge-mint">{typeof c.badge === "string" ? c.badge : tr(c.badge, locale)}</span>}
                </div>
                <h3 className="text-[20px] font-semibold text-ink">{tr(c.title, locale)}</h3>
                <p className="text-[15px] leading-7 text-ink-2">{tr(c.description, locale)}</p>
                <p className="mt-auto border-t border-line pt-3 text-[13px] leading-6 text-mist">{tr(c.subDescription, locale)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & mission */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-x">
          <SectionHead {...sectionHead(vm, locale)} />
          <div className="mt-10 space-y-5">
            {(vm.blocks ?? []).map((bl: { key: string; iconSvg?: string; title: L; description: L; image?: string; imagePosition?: string }, i: number) => (
              <div key={bl.key ?? i} className={`grid items-stretch gap-5 md:grid-cols-[1.4fr_1fr] ${bl.imagePosition === "left" ? "md:[&>*:first-child]:order-2" : ""}`}>
                <article className="flex flex-col justify-center rounded-[20px] border border-line bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-[14px] bg-sky text-mint"><SafeSvg svg={bl.iconSvg} className="h-5 w-5" /></span><h3 className="text-[24px] font-semibold text-ink">{tr(bl.title, locale)}</h3></div>
                  <p className="mt-4 text-[16px] leading-8 text-ink-2">{tr(bl.description, locale)}</p>
                </article>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {bl.image ? <img src={bl.image} alt="" className="h-full min-h-[200px] w-full rounded-[20px] object-cover" /> : <div className="rounded-[20px] bg-sky" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Mashbak */}
      {why.cards && (
        <section className="bg-sky py-16 md:py-24">
          <div className="container-x">
            <SectionHead {...sectionHead(why, locale)} />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {why.cards.map((c: { iconSvg?: string; title: L; description: L }, i: number) => (
                <article key={i} className="leaf border border-line bg-white p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-mint-soft text-green-deep"><SafeSvg svg={c.iconSvg} className="h-5 w-5" /></span>
                  <h3 className="mt-4 text-[18px] font-semibold text-ink">{tr(c.title, locale)}</h3>
                  <p className="mt-2 text-[14px] leading-6 text-ink-2">{tr(c.description, locale)}</p>
                </article>
              ))}
            </div>
            {why.cta && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-[17px] font-semibold text-ink">
                {tr(why.cta.prompt, locale)}
                <Link href={`/${locale}/application`} className="btn btn-primary h-11 px-5">{tr(why.cta.buttonText, locale)}</Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Values */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-x">
          <SectionHead badge={txt(va.badgeText, locale)} a={txt(va.primaryColorTitle, locale)} b={txt(va.secondaryColorTitle, locale)} desc={txt(va.description, locale)} />
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {(va.values ?? []).map((v: { iconSvg?: string; label: L }, i: number) => (
              <span key={i} className="inline-flex items-center gap-2 rounded-[14px] border border-line bg-white px-5 py-3 text-[16px] font-semibold text-ink shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                <SafeSvg svg={v.iconSvg} className="h-4 w-4 text-mint" />{tr(v.label, locale)}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="container-x pb-16">
        <div className="rounded-[24px] bg-mint-soft px-6 py-12 text-center sm:py-16">
          <p className="text-[16px] font-semibold text-green-deep">{txt(cta.preTitle, locale)}</p>
          <h2 className="mt-2 text-balance text-[26px] font-semibold text-ink md:text-[40px]">{txt(cta.primaryColorTitle1, locale)}<span className="text-mint">{txt(cta.secondaryColorTitle, locale)}</span>{txt(cta.primaryColorTitle2, locale)}</h2>
          <p className="mx-auto mt-3 max-w-xl text-[16px] text-ink-2 md:text-[18px]">{txt(cta.description, locale)}</p>
          <Link href={`/${locale}/application`} className="btn btn-outline mt-7 h-12 px-6 text-[16px]">{txt(cta.buttonText, locale) || t.apply}</Link>
        </div>
      </section>
    </>
  );
}
