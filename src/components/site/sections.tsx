import clsx from "clsx";
import { ArrowLeft, CalendarDays, Clock, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { submitContact } from "@/app/actions";
import type { Locale } from "@/i18n";
import { tr } from "@/i18n/config";
import { siteDict } from "@/i18n/site";
import { contact, txt, workingHours, type Section } from "@/lib/settings";
import type { Faq as FaqT, MemberReview, Program, SiteSettings } from "@/lib/types";
import { SubmitButton } from "../ui/client";
import { Carousel, Faq, ReviewCard } from "./interactive";
import { SocialRow } from "./Social";

/** Admin-provided icons are plain SVG; drop anything scriptable before rendering. */
export function SafeSvg({ svg, className }: { svg?: string; className?: string }) {
  if (!svg || !svg.trim().startsWith("<svg") || /<script|on\w+=|javascript:/i.test(svg)) return null;
  return <span className={clsx("inline-flex [&_svg]:h-full [&_svg]:w-full", className)} dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function Badge({ children, icon }: { children: ReactNode; icon?: string }) {
  return (
    <span className="inline-flex min-h-[34px] items-center gap-1.5 rounded-full border border-navy-deep/40 bg-white px-3.5 py-1 text-[15px] font-medium text-navy-deep">
      {icon && <SafeSvg svg={icon} className="h-4 w-4 text-mint" />}
      {children}
    </span>
  );
}

/** Section heading in the live style: badge, dark title with a mint middle part, grey description. */
export function SectionHead({ badge, a, b, c, desc, center = true, className }: { badge?: string; a?: string; b?: string; c?: string; desc?: string; center?: boolean; className?: string }) {
  return (
    <div className={clsx("flex flex-col gap-4", center ? "items-center text-center" : "items-start text-start", className)}>
      {badge && <Badge>{badge}</Badge>}
      <h2 className="max-w-3xl text-balance text-[26px] font-semibold leading-snug text-ink md:text-[40px] md:leading-[1.6]">
        {a} {b && <span className="text-mint">{b}</span>} {c}
      </h2>
      {desc && <p className="max-w-2xl text-balance text-[16px] leading-relaxed text-ink-2 md:text-[20px] md:leading-[33px]">{desc}</p>}
    </div>
  );
}

export function sectionHead(sec: Section | undefined, locale: Locale) {
  if (!sec) return {};
  return {
    badge: txt(sec.badgeText, locale),
    a: txt(sec.primaryColorTitle1 ?? sec.primaryColorTitle, locale),
    b: txt(sec.secondaryColorTitle, locale),
    c: txt(sec.primaryColorTitle2, locale),
    desc: txt(sec.description, locale),
  };
}

export function Pillars({ s, locale }: { s: SiteSettings; locale: Locale }) {
  const sec = s.HOW_IT_WORKS_SECTION as Section & { steps?: { number: string; iconSvg?: string; title: Record<string, string>; description: Record<string, string> }[] };
  if (!sec) return null;
  return (
    <section className="relative overflow-hidden bg-white py-14 md:py-24">
      <div className="pointer-events-none absolute -end-40 top-10 h-80 w-80 rounded-full bg-sky blur-3xl" />
      <div className="container-x relative grid gap-10 lg:grid-cols-[0.9fr_1.6fr] lg:items-center">
        <SectionHead {...sectionHead(sec, locale)} center={false} />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {(sec.steps ?? []).map((st, i) => (
            <article key={st.number} className={clsx("leaf relative flex flex-col gap-3 border border-line bg-white p-6 shadow-[0_8px_30px_-12px_rgba(11,72,109,0.18)] transition hover:-translate-y-1",
              i % 3 === 1 && "xl:translate-y-10")}>
              <div className="flex items-start justify-between">
                <span className="text-[40px] font-semibold leading-none text-haze">{st.number}</span>
                <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-sky text-mint"><SafeSvg svg={st.iconSvg} className="h-6 w-6" /></span>
              </div>
              <h3 className="text-[22px] font-semibold text-ink">{tr(st.title, locale)}</h3>
              <p className="text-[15px] leading-7 text-ink-2">{tr(st.description, locale)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const stepIcons = [
  <path key="a" d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" />,
  <><circle key="b1" cx="12" cy="12" r="9" /><path key="b2" d="m8 12 3 3 5-6" /></>,
  <><rect key="c1" x="3" y="4" width="18" height="16" rx="2" /><circle key="c2" cx="12" cy="10" r="3" /><path key="c3" d="M7 18c1-2 3-3 5-3s4 1 5 3" /></>,
  <path key="d" d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09ZM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" />,
];

export function JoinSteps({ locale }: { locale: Locale }) {
  const j = siteDict[locale].join;
  return (
    <section className="bg-gradient-to-b from-haze to-mint-soft py-16 md:py-24">
      <div className="container-x">
        <SectionHead a={j.titleA} b={j.titleB} desc={j.body} />
        <ol className="relative mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          <span className="pointer-events-none absolute inset-x-[12%] top-8 hidden h-[2px] bg-[#E8E8E8] lg:block" />
          {j.steps.map((st, i) => (
            <li key={st.t} className="relative flex flex-col items-center text-center">
              <span className="relative grid h-16 w-16 place-items-center rounded-full border-4 border-mint bg-white text-navy shadow-[0_8px_20px_-8px_rgba(11,72,109,0.4)]">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{stepIcons[i]}</svg>
                <span className="absolute -top-1 -end-1 grid h-6 w-6 place-items-center rounded-full bg-navy text-[12px] font-bold text-white">{i + 1}</span>
              </span>
              <h3 className="mt-4 text-[18px] font-bold text-ink">{st.t}</h3>
              <p className="mt-1.5 max-w-[16rem] text-[14px] leading-6 text-ink-2">{st.d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex justify-center">
          <Link href={`/${locale}/application`} className="btn btn-primary h-[52px] px-6 text-[16px]">{j.cta}<ArrowLeft className="h-4 w-4 ltr:rotate-180" /></Link>
        </div>
      </div>
    </section>
  );
}

export function ProgramTile({ p, locale }: { p: Program; locale: Locale }) {
  const t = siteDict[locale].programs;
  return (
    <Link href={`/${locale}/our_programs/${p.slug}`} className="group flex h-full min-h-[292px] flex-col gap-3 rounded-[24px] border border-line bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(11,72,109,0.35)]">
      <span className="grid h-[82px] w-[82px] place-items-center overflow-hidden rounded-[16px] bg-sky p-2 shadow-[0_12px_16px_-12px_rgba(11,72,109,0.25)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p.icon_url ? <img src={p.icon_url} alt="" className="max-h-full max-w-full object-contain" /> : <Sparkles className="h-8 w-8 text-mint" />}
      </span>
      <h3 className="text-[21px] font-semibold text-ink" dir="auto">{tr(p.title, locale)}</h3>
      <p className="line-clamp-5 flex-1 text-[15px] leading-7 text-ink-2">{tr(p.summary, locale)}</p>
      {(p.sessions_count || p.duration_months) && (
        <p className="flex items-center gap-2 border-t border-line pt-3 text-[14px] font-semibold text-navy">
          <Clock className="h-4 w-4 text-mint" />
          {p.sessions_count ? `${p.sessions_count} ${t.sessions}` : ""}{p.sessions_count && p.duration_months ? " · " : ""}{p.duration_months ? `${p.duration_months} ${t.months}` : ""}
        </p>
      )}
    </Link>
  );
}

export function ProgramsSection({ programs, locale }: { programs: Program[]; locale: Locale }) {
  const t = siteDict[locale].programs;
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container-x">
        <SectionHead badge={t.badge} a={t.titleA} b={t.titleB} desc={t.body} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{programs.slice(0, 6).map((p) => <ProgramTile key={p.id} p={p} locale={locale} />)}</div>
        <div className="mt-10 flex justify-center"><Link href={`/${locale}/our_programs`} className="btn btn-outline h-11 px-5">{t.all}</Link></div>
      </div>
    </section>
  );
}

export function ReviewsSection({ reviews, locale }: { reviews: MemberReview[]; locale: Locale }) {
  const t = siteDict[locale].reviews;
  if (!reviews.length) return null;
  return (
    <section className="overflow-x-clip bg-sky py-14 md:py-24">
      <div className="container-x">
        <SectionHead badge={t.badge} a={t.titleA} b={t.titleB} c={t.titleC} desc={t.body} />
        <div className="mt-6">
          <Carousel label={t.badge}>
            {reviews.map((r) => (
              <ReviewCard key={r.id} name={tr(r.name, locale)} role={[tr(r.role_title, locale), r.organization].filter(Boolean).join(" · ")}
                quote={tr(r.quote, locale)} photo={r.photo_url} more={t.more} less={t.less} />
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
}

export function FaqSection({ faqs, locale, limit }: { faqs: FaqT[]; locale: Locale; limit?: number }) {
  const t = siteDict[locale].faq;
  if (!faqs.length) return null;
  return (
    <section className="bg-white py-14 md:py-20">
      <div className="container-x max-w-4xl">
        <SectionHead badge={t.badge} a={t.titleA} b={t.titleB} />
        <div className="mt-10"><Faq items={faqs.slice(0, limit ?? faqs.length).map((f) => ({ q: tr(f.question, locale), a: tr(f.answer, locale) }))} /></div>
      </div>
    </section>
  );
}

export function ContactBlock({ s, locale, sent, error }: { s: SiteSettings; locale: Locale; sent?: boolean; error?: boolean }) {
  const t = siteDict[locale].contact;
  const c = contact(s);
  const hours = workingHours(s);
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-12">
      <section className="rounded-[16px] border border-sky bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] sm:p-7 lg:col-span-7">
        <h3 className="text-[20px] font-medium text-ink">{t.formTitle}</h3>
        {sent && <p className="mt-4 rounded-xl bg-mint-soft p-3 text-sm font-semibold text-green-deep">{t.sent}</p>}
        {error && <p className="mt-4 rounded-xl bg-[#fdeceb] p-3 text-sm font-semibold text-[#8f1e18]">{t.error}</p>}
        <form action={submitContact} className="mt-5 space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
          <label className="block"><span className="label">{t.name} <span className="text-[#f54e3f]">*</span></span><input name="name" required maxLength={50} placeholder={t.namePh} className="input h-12 rounded-[16px]" /></label>
          <label className="block"><span className="label">{t.email} <span className="text-[#f54e3f]">*</span></span><input name="email" type="email" required maxLength={80} placeholder={t.emailPh} className="input h-12 rounded-[16px]" dir="ltr" /></label>
          <label className="block"><span className="label">{t.message} <span className="text-[#f54e3f]">*</span></span><textarea name="message" required maxLength={500} rows={5} placeholder={t.messagePh} className="textarea rounded-[16px]" /></label>
          <SubmitButton className="btn btn-primary h-12 w-full sm:w-44">{t.send}</SubmitButton>
        </form>
      </section>
      <aside className="space-y-3 rounded-[16px] bg-mint-soft p-5 sm:p-6 lg:col-span-5">
        <h3 className="text-[20px] font-medium text-ink">{t.info}</h3>
        {[
          c.phoneNumber && { icon: <Phone className="h-5 w-5" />, label: t.phone, value: c.phoneNumber, href: `tel:${c.phoneNumber}`, ltr: true },
          c.email && { icon: <Mail className="h-5 w-5" />, label: t.email, value: c.email, href: `mailto:${c.email}`, ltr: true },
          c.headOfficeAddress && { icon: <MapPin className="h-5 w-5" />, label: t.office, value: tr(c.headOfficeAddress, locale), href: c.headOfficeLocationUrl, ltr: false },
        ].filter(Boolean).map((r) => {
          const x = r as { icon: ReactNode; label: string; value: string; href?: string; ltr: boolean };
          return (
            <a key={x.label} href={x.href} target={x.href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex min-w-0 items-center gap-3 rounded-[16px] border border-[#E7E7E7] bg-white p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] bg-sky text-mint">{x.icon}</span>
              <span className="min-w-0"><span className="block text-[13px] text-mist">{x.label}</span><span className="block break-all font-semibold text-ink" dir={x.ltr ? "ltr" : undefined}>{x.value}</span></span>
            </a>
          );
        })}
        {hours.length > 0 && (
          <div className="rounded-[16px] border border-[#E7E7E7] bg-white p-4">
            <p className="mb-2 flex items-center gap-2 font-semibold text-ink"><CalendarDays className="h-4 w-4 text-mint" />{t.hours}</p>
            {hours.map((h, i) => (
              <p key={i} className="flex justify-between gap-3 py-1 text-[14px]"><span className="text-ink-2">{tr(h.title, locale)}</span><span className="font-semibold" style={{ color: h.valueHexColor === "#FF6B6B" ? "#d64545" : "#2f7d57" }}>{tr(h.value, locale)}</span></p>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between gap-3 pt-1 text-[14px] text-ink-2">{t.follow}<SocialRow c={c} className="text-navy" /></div>
      </aside>
    </div>
  );
}

export function ContactSection({ s, locale }: { s: SiteSettings; locale: Locale }) {
  const t = siteDict[locale].contact;
  return (
    <section className="bg-gradient-to-b from-haze/70 to-mint-soft/60 py-14 md:py-24">
      <div className="container-x">
        <SectionHead badge={t.badge} a={t.titleA} b={t.titleB} c={t.titleC} />
        <div className="mt-10"><ContactBlock s={s} locale={locale} /></div>
      </div>
    </section>
  );
}

export function CtaBand({ locale }: { locale: Locale }) {
  const t = siteDict[locale].cta;
  return (
    <section className="container-x py-14">
      <div className="relative overflow-hidden rounded-[24px] bg-mint-soft px-6 py-12 text-center sm:px-12 sm:py-16">
        <p className="text-[16px] font-semibold text-green-deep">{t.q}</p>
        <h2 className="mt-2 text-balance text-[26px] font-semibold text-ink md:text-[40px]">{t.a} <span className="text-mint">{t.b}</span> {t.c}</h2>
        <p className="mx-auto mt-3 max-w-xl text-[16px] text-ink-2 md:text-[18px]">{t.body}</p>
        <Link href={`/${locale}/application`} className="btn btn-primary mt-7 h-12 px-6 text-[16px]">{t.button}<ArrowLeft className="h-4 w-4 ltr:rotate-180" /></Link>
      </div>
    </section>
  );
}

export function PageHero({ badge, a, b, sub, children, back }: { badge?: string; a: string; b?: string; sub?: string; children?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky to-white pb-10 pt-8 md:pb-14 md:pt-12">
      <div className="pointer-events-none absolute start-[6%] top-6 text-mint/60"><Sparkles className="h-10 w-10" /></div>
      <div className="container-x relative">
        {back && <Link href={back.href} className="mb-6 inline-flex items-center gap-2 text-[15px] text-ink-2 hover:text-navy"><span className="grid h-8 w-8 place-items-center rounded-full border border-line"><ArrowLeft className="h-4 w-4 rtl:rotate-180" /></span>{back.label}</Link>}
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          {badge && <Badge>{badge}</Badge>}
          <h1 className="text-balance text-[30px] font-semibold text-ink md:text-[48px]">{a} {b && <span className="text-mint">{b}</span>}</h1>
          {sub && <p className="text-balance text-[17px] leading-relaxed text-ink-2 md:text-[20px] md:leading-[33px]">{sub}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}
