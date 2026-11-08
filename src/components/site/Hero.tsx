import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/i18n";
import { tr } from "@/i18n/config";
import { siteDict } from "@/i18n/site";
import { hero, txt } from "@/lib/settings";
import type { SiteSettings } from "@/lib/types";
import { HeroSlider } from "./interactive";
import { SafeSvg } from "./sections";

// Same arrangement as the live hero: three faces on each side (desktop only)
const SPOTS = [
  "right-[5%] top-[60px]", "right-[0%] top-[300px]", "right-[11%] top-[540px]",
  "left-[5%] top-[100px]", "left-[0%] top-[340px]", "left-[9%] top-[560px]",
];

export function Hero({ locale, s }: { locale: Locale; s: SiteSettings }) {
  const h = hero(s);
  const t = siteDict[locale];
  const slides = (h.slides?.length ? h.slides : [{ title: h.primaryColorTitle ?? {}, highlight: h.secondaryColorTitle ?? {}, description: h.description ?? {} }])
    .map((x) => ({ title: tr(x.title, locale), highlight: tr(x.highlight, locale), description: tr(x.description, locale) }));
  const faces = (h.floatingAvatars ?? []).slice(0, 6);
  const stats = (h.statsAvatars ?? []).slice(0, 3);
  const statsNumber = txt(h.statsNumber, locale);
  return (
    <section className="relative w-full overflow-x-clip bg-white">
      <div className="pointer-events-none absolute -top-16 end-[-10%] h-[260px] w-[260px] rounded-full bg-sky opacity-90 blur-[48px]" />
      <div className="pointer-events-none absolute -bottom-24 start-[-15%] h-[260px] w-[260px] rounded-full bg-mint-soft opacity-90 blur-[48px]" />
      <div className="container-x relative py-8 sm:py-12 lg:py-16">
        <div className="pointer-events-none absolute inset-0 hidden xl:block" aria-hidden>
          {faces.map((src, i) => (
            <div key={i} className={`absolute ${SPOTS[i]} animate-drift`} style={{ animationDelay: `${i * -1.3}s` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-[100px] w-[100px] rounded-full border-4 border-white object-cover shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]" />
            </div>
          ))}
        </div>
        <div className="relative z-10 mx-auto max-w-[900px] text-center">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-4 py-1.5 text-[12px] font-medium text-navy-deep sm:text-[14px]">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-mint-soft text-mint"><SafeSvg svg={h.badgeIconSvg} className="h-3.5 w-3.5" /></span>
            {txt(h.badgeText, locale)}
          </span>
          <div className="mt-6 lg:mt-9"><HeroSlider slides={slides} underline /></div>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 px-4 sm:flex-row sm:items-center">
            <Link href={`/${locale}/application`} className="btn btn-primary h-[52px] min-w-[210px] px-6 text-[16px] md:text-[18px]">
              {txt(h.primaryButtonText, locale) || t.apply}<ArrowLeft className="h-5 w-5 text-mint ltr:rotate-180" />
            </Link>
            <Link href={`/${locale}/our_programs`} className="btn btn-outline h-[52px] min-w-[190px] px-6 text-[16px]">{txt(h.secondaryButtonText, locale) || t.programs.all}</Link>
          </div>
          {statsNumber && (
            <div className="mt-7 flex items-center justify-center gap-3">
              <div className="flex -space-x-3 rtl:space-x-reverse">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {stats.map((src, i) => <img key={i} src={src} alt="" className="h-10 w-10 rounded-full border-2 border-white object-cover" />)}
              </div>
              <div className="text-start leading-tight">
                <p className="text-[16px] font-bold text-mint" dir="ltr" style={{ textAlign: "inherit" }}>{statsNumber}</p>
                <p className="text-[13px] text-mist md:text-[15px]">{txt(h.statsLabel, locale)}</p>
              </div>
            </div>
          )}
        </div>
        {/* phones and tablets: faces in a row under the hero */}
        <div className="mt-8 flex justify-center -space-x-2 xl:hidden rtl:space-x-reverse" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {faces.map((src, i) => <img key={i} src={src} alt="" className="h-12 w-12 rounded-full border-[3px] border-white object-cover shadow-md sm:h-14 sm:w-14" />)}
        </div>
      </div>
    </section>
  );
}
