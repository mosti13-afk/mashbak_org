import { FaqSection, ProgramsSection, ReviewsSection } from "@/components/site/sections";
import { Features, FinalCta, FitStrip, Hero, HowToJoin } from "@/components/site/landing";
import { landingDict } from "@/i18n/landing";
import { repo } from "@/lib/data";
import { pageLocale, type LocaleParams } from "@/lib/page";
import { hero, memberCount } from "@/lib/settings";

/* Lean home: what Mashbak is, how it fits, what you do inside, how to join, proof, then one call to action. */
export default async function Home({ params }: LocaleParams) {
  const { locale } = await pageLocale(params);
  const L = landingDict[locale];
  const [settings, programs, reviews, faqs, pulse] = await Promise.all([
    repo.getSettings(), repo.listPrograms(), repo.listReviews(), repo.listFaqs(), repo.platformStats().catch(() => null),
  ]);
  const h = hero(settings);
  const faces = (h.statsAvatars?.length ? h.statsAvatars : reviews.map((r) => r.photo_url).filter(Boolean) as string[]);
  const members = memberCount(settings, pulse?.members, locale) || "+450";

  return (
    <>
      <Hero locale={locale} L={L} faces={faces} members={members} />
      <FitStrip L={L} />
      <Features L={L} />
      <HowToJoin L={L} locale={locale} />
      <ReviewsSection reviews={reviews} locale={locale} />
      {programs.length > 0 && <ProgramsSection programs={programs} locale={locale} limit={3} />}
      <FaqSection faqs={faqs} locale={locale} limit={5} more />
      <FinalCta L={L} locale={locale} />
    </>
  );
}
