import Image from "next/image";
import Link from "next/link";
import { EventCard } from "@/components/cards";
import { Hero } from "@/components/site/Hero";
import { VideoCard } from "@/components/site/interactive";
import { ContactSection, FaqSection, JoinSteps, Pillars, ProgramsSection, ReviewsSection, SectionHead } from "@/components/site/sections";
import { siteDict } from "@/i18n/site";
import { repo } from "@/lib/data";
import { pageLocale, type LocaleParams } from "@/lib/page";

export default async function Home({ params }: LocaleParams) {
  const { locale, t } = await pageLocale(params);
  const s = siteDict[locale];
  const [settings, programs, reviews, faqs, events] = await Promise.all([
    repo.getSettings(), repo.listPrograms(), repo.listReviews(), repo.listFaqs(), repo.listEvents({ when: "upcoming", publicOnly: false }),
  ]);
  return (
    <>
      <Hero locale={locale} s={settings} />

      {/* About + intro video */}
      <section className="bg-sky py-12 md:py-20">
        <div className="container-x grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <SectionHead badge={s.about.badge} b={s.about.titleA} c={s.about.titleB} desc={s.about.body} center={false} />
          <div className="relative">
            <div className="absolute -inset-3 rotate-[-4deg] rounded-[24px] bg-gradient-to-b from-navy/15 to-mint/25" />
            <div className="relative"><VideoCard src="/videos/mashbek-intro.mp4" poster="/brand/about-mashbak.png" label={s.about.video} /></div>
            <div className="absolute -bottom-5 start-6 flex items-center gap-3 rounded-[14px] bg-white px-4 py-3 shadow-[0_10px_30px_-10px_rgba(11,72,109,0.35)]">
              <Image src="/brand/star.png" alt="" width={28} height={28} />
              <span className="text-start leading-tight"><span className="block text-[12px] text-mist">{s.about.cardTop}</span><span className="block text-[14px] font-semibold text-ink">{s.about.cardBottom}</span></span>
            </div>
          </div>
        </div>
      </section>

      <Pillars s={settings} locale={locale} />
      <JoinSteps locale={locale} />
      {programs.length > 0 && <ProgramsSection programs={programs} locale={locale} />}

      {events.length > 0 && (
        <section className="bg-white pb-16 md:pb-24">
          <div className="container-x">
            <SectionHead badge={s.events.badge} a={s.events.titleA} b={s.events.titleB} desc={s.events.body} />
            <div className="mt-10 grid gap-4 md:grid-cols-2">{events.slice(0, 4).map((e) => <EventCard key={e.id} e={e} locale={locale} t={t} href={`/${locale}/events/${e.id}`} />)}</div>
            <div className="mt-8 flex justify-center"><Link href={`/${locale}/events`} className="btn btn-outline h-11 px-5">{s.events.all}</Link></div>
          </div>
        </section>
      )}

      <ReviewsSection reviews={reviews} locale={locale} />
      <FaqSection faqs={faqs} locale={locale} />
      <ContactSection s={settings} locale={locale} />
    </>
  );
}
