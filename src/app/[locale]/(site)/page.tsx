import { ArrowRight, Bell, Briefcase, CalendarDays, Check, Handshake, MessageCircle, Search, Ticket, Users } from "lucide-react";
import Link from "next/link";
import { EventCard, ProgramCard, ReviewCard } from "@/components/cards";
import { Hero } from "@/components/site/Hero";
import { Avatar, SectionTitle } from "@/components/ui";
import { tr } from "@/i18n/config";
import { repo } from "@/lib/data";
import { pageLocale, type LocaleParams } from "@/lib/page";

const pillarIcons = [Handshake, MessageCircle, Ticket, Users];

export default async function Home({ params }: LocaleParams) {
  const { locale, t } = await pageLocale(params);
  const [settings, programs, reviews, events, faqs] = await Promise.all([
    repo.getSettings(),
    repo.listPrograms(),
    repo.listReviews(),
    repo.listEvents({ when: "upcoming", publicOnly: false }),
    repo.listFaqs(),
  ]);
  const [featured, ...restReviews] = reviews;

  return (
    <>
      <Hero locale={locale} t={t} settings={settings} />

      {/* Problem → pillars */}
      <section className="mesh relative overflow-hidden py-20 text-white sm:py-28">
        <div className="grid-lines absolute inset-0" aria-hidden />
        <div className="container-x relative">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-end">
            <SectionTitle eyebrow={t.home.problemEyebrow} title={t.home.problemTitle} light />
            <p className="mb-10 text-lg leading-relaxed text-white/75">{t.home.problemBody}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.home.pillars.map((p, i) => {
              const I = pillarIcons[i];
              return (
                <div key={p.title} className="rounded-[var(--radius-card)] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition hover:bg-white/[0.08]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint text-navy-ink"><I className="h-5 w-5" /></span>
                  <h3 className="mt-5 text-lg font-black">{p.title}</h3>
                  <p className="mt-2 text-white/70">{p.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* App preview */}
      <section className="py-20 sm:py-28">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionTitle eyebrow={t.common.tagline} title={t.home.appPreviewTitle} />
            <ul className="space-y-4">
              {t.home.appPreview.map((line, i) => {
                const I = [Search, Briefcase, Handshake, CalendarDays][i];
                return (
                  <li key={line} className="flex items-start gap-3.5">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint-soft text-green-deep"><I className="h-4 w-4" /></span>
                    <span className="pt-1.5 text-lg font-semibold text-ink">{line}</span>
                  </li>
                );
              })}
            </ul>
            <Link href={`/${locale}/apply`} className="btn btn-primary btn-lg mt-9">{t.common.apply} <ArrowRight className="flip-rtl h-4 w-4" /></Link>
          </div>
          <PhoneMock locale={locale} t={t} faces={settings.floatingAvatars} />
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-line bg-white py-20 sm:py-24">
        <div className="container-x">
          <SectionTitle eyebrow={t.home.howEyebrow} title={t.home.howTitle} center />
          <ol className="relative grid gap-8 md:grid-cols-4">
            <span className="absolute inset-x-[12%] top-7 hidden h-px bg-gradient-to-r from-transparent via-mint to-transparent md:block" aria-hidden />
            {t.home.steps.map((s, i) => (
              <li key={s.title} className="relative text-center">
                <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-navy text-xl font-black text-white shadow-[var(--shadow-card)]">{i + 1}</span>
                <h3 className="mt-4 text-lg font-black text-navy-ink">{s.title}</h3>
                <p className="mx-auto mt-1.5 max-w-[16rem] text-ink-2">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Programs */}
      {programs.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionTitle eyebrow={t.home.programsEyebrow} title={t.home.programsTitle} />
              <Link href={`/${locale}/programs`} className="btn btn-outline mb-10">{t.common.viewAll}</Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {programs.map((p) => <ProgramCard key={p.id} p={p} locale={locale} t={t} />)}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {featured && (
        <section className="bg-mint-soft/60 py-20 sm:py-28">
          <div className="container-x">
            <SectionTitle eyebrow={t.home.voicesEyebrow} title={t.home.voicesTitle} />
            <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr_1fr]">
              <ReviewCard r={featured} locale={locale} featured />
              {restReviews.slice(0, 4).map((r) => <ReviewCard key={r.id} r={r} locale={locale} />)}
            </div>
          </div>
        </section>
      )}

      {/* Events */}
      {events.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionTitle eyebrow={t.home.eventsEyebrow} title={t.home.eventsTitle} />
              <Link href={`/${locale}/events`} className="btn btn-outline mb-10">{t.common.viewAll}</Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {events.slice(0, 4).map((e) => <EventCard key={e.id} e={e} locale={locale} t={t} href={`/${locale}/events/${e.id}`} />)}
            </div>
          </div>
        </section>
      )}

      {/* FAQ preview */}
      {faqs.length > 0 && (
        <section className="border-t border-line bg-white py-20 sm:py-24">
          <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.6fr]">
            <div>
              <SectionTitle title={t.faq.title} sub={t.faq.sub} />
              <Link href={`/${locale}/faq`} className="btn btn-outline">{t.common.viewAll}</Link>
            </div>
            <div className="divide-y divide-line">
              {faqs.slice(0, 4).map((f) => (
                <details key={f.id} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-black text-navy-ink">
                    {tr(f.question, locale)}
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper text-navy transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-ink-2">{tr(f.answer, locale)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA band */}
      <section className="container-x py-20">
        <div className="mesh relative overflow-hidden rounded-[2rem] px-6 py-14 text-center text-white sm:px-12 sm:py-20">
          <div className="grid-lines absolute inset-0" aria-hidden />
          <div className="relative mx-auto max-w-2xl">
            <div className="mb-6 flex justify-center -space-x-3 rtl:space-x-reverse">
              {settings.floatingAvatars.slice(0, 5).map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" className="h-12 w-12 rounded-full object-cover ring-4 ring-navy" />
              ))}
            </div>
            <h2 className="h-display text-3xl text-white sm:text-5xl">{t.home.ctaTitle}</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/75">{t.home.ctaBody}</p>
            <Link href={`/${locale}/apply`} className="btn btn-mint btn-lg mt-8">{t.home.ctaApply} <ArrowRight className="flip-rtl h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}

/** A static illustration of the member app, not live data. */
function PhoneMock({ locale, t, faces }: { locale: "ar" | "en" | "he"; t: import("@/i18n").Dict; faces: string[] }) {
  const sample = locale === "ar"
    ? { name: "عمر خطيب", role: "Engineering Manager", job: "Engineering Manager, Infrastructure" }
    : locale === "he" ? { name: "עומר ח׳טיב", role: "Engineering Manager", job: "Engineering Manager, Infrastructure" }
    : { name: "Omar Khatib", role: "Engineering Manager", job: "Engineering Manager, Infrastructure" };
  return (
    <div className="relative mx-auto w-full max-w-[380px]" aria-hidden>
      <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-mint/30 to-teal/10 blur-2xl" />
      <div className="relative rounded-[2.6rem] border-[10px] border-navy-ink bg-paper p-4 shadow-[var(--shadow-lift)]">
        <div className="mx-auto mb-4 h-5 w-24 rounded-full bg-navy-ink" />
        <div className="mb-3 flex items-center justify-between">
          <span className="text-lg font-black text-navy">{t.app.nav.home}</span>
          <span className="relative"><Bell className="h-5 w-5 text-navy" /><span className="absolute -end-1 -top-1 h-2.5 w-2.5 rounded-full bg-mint ring-2 ring-paper" /></span>
        </div>
        <div className="card mb-3 p-3.5">
          <p className="mb-2 text-[11px] font-bold text-mist">{t.app.requests}</p>
          <div className="flex items-center gap-2.5">
            <Avatar src={faces[1]} name={sample.name} size={38} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black">{sample.name}</p>
              <p className="truncate text-xs text-mist">{sample.role}</p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint text-navy-ink"><Check className="h-4 w-4" /></span>
          </div>
        </div>
        <div className="card mb-3 p-3.5">
          <p className="mb-2 text-[11px] font-bold text-mist">{t.app.newJobs}</p>
          <p className="text-sm font-black" dir="ltr" style={{ textAlign: "start" }}>{sample.job}</p>
          <p className="text-xs text-mist">Wix · {t.app.jobs.modes.hybrid}</p>
          <span className="btn btn-primary btn-sm mt-3 w-full">{t.app.jobs.requestReferral}</span>
        </div>
        <div className="card flex items-center gap-3 p-3.5">
          <span className="flex h-10 w-10 flex-col items-center justify-center rounded-xl bg-navy text-white"><span className="text-sm font-black leading-none">17</span><span className="text-[9px] text-mint">NOV</span></span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black">{t.events.ticket}</p>
            <p className="truncate text-xs text-mist">{t.events.ticketHint}</p>
          </div>
          <Ticket className="h-5 w-5 text-green" />
        </div>
        <div className="mt-4 grid grid-cols-5 gap-1 border-t border-line pt-3 text-center text-[10px] font-bold text-mist">
          {[t.app.nav.home, t.app.nav.members, t.app.nav.jobs, t.app.nav.events, t.app.nav.profile].map((l, i) => (
            <span key={l} className={i === 0 ? "text-navy" : ""}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
