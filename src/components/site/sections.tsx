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
    <span className="eyebrow">
      {icon && <SafeSvg svg={icon} className="h-4 w-4" />}
      {children}
    </span>
  );
}

export function SectionHead({ a, b, c, desc, center = true, className }: { badge?: string; a?: string; b?: string; c?: string; desc?: string; center?: boolean; className?: string }) {
  return (
    <div className={clsx("flex flex-col gap-3", center ? "items-center text-center" : "items-start text-start", className)}>
      <h2 className="max-w-3xl text-balance text-[28px] font-bold leading-[1.3] text-navy-ink md:text-[40px]">{[a, b, c].filter(Boolean).join(" ")}</h2>
      {desc && <p className="max-w-2xl text-balance text-[16px] leading-8 text-ink-2 md:text-[18px]">{desc}</p>}
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
    <Link href={`/${locale}/our_programs/${p.slug}`} className="group flex h-full flex-col rounded-[24px] border border-line bg-white p-5 transition-colors hover:border-navy/40">
      <span className="grid h-16 w-16 place-items-center overflow-hidden rounded-[18px] bg-sky p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p.icon_url ? <img src={p.icon_url} alt="" className="max-h-full max-w-full object-contain" /> : <Sparkles className="h-7 w-7 text-mint" />}
      </span>
      <h3 className="mt-4 text-[19px] font-bold text-navy-ink" dir="auto">{tr(p.title, locale)}</h3>
      <p className="mt-1.5 line-clamp-3 flex-1 text-[15px] leading-7 text-ink-2">{tr(p.summary, locale)}</p>
      {(p.sessions_count || p.duration_months) && (
        <p className="mt-4 flex items-center gap-2 text-[13px] text-mist">
          <Clock className="h-4 w-4" />
          {p.sessions_count ? `${p.sessions_count} ${t.sessions}` : ""}{p.sessions_count && p.duration_months ? " · " : ""}{p.duration_months ? `${p.duration_months} ${t.months}` : ""}
        </p>
      )}
    </Link>
  );
}

export function ProgramsSection({ programs, locale, limit = 6 }: { programs: Program[]; locale: Locale; limit?: number }) {
  const t = siteDict[locale].programs;
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead a={t.titleA} b={t.titleB} desc={t.body} center={false} />
          <Link href={`/${locale}/our_programs`} className="btn btn-outline">{t.all}</Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{programs.slice(0, limit).map((p) => <ProgramTile key={p.id} p={p} locale={locale} />)}</div>
      </div>
    </section>
  );
}

export function ReviewsSection({ reviews, locale }: { reviews: MemberReview[]; locale: Locale }) {
  const t = siteDict[locale].reviews;
  if (!reviews.length) return null;
  return (
    <section className="overflow-x-clip bg-sky py-16 md:py-24">
      <div className="container-x">
        <SectionHead a={t.titleA} b={t.titleB} c={t.titleC} desc={t.body} center={false} />
        <div className="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
          {reviews.slice(0, 3).map((r) => (
            <figure key={r.id} className="flex w-[85%] shrink-0 snap-center flex-col md:w-auto">
              <blockquote className="bubble flex-1 bg-white p-5 text-[15px] leading-7 text-ink-2 ring-1 ring-line"><p className="line-clamp-6">{tr(r.quote, locale)}</p></blockquote>
              <figcaption className="mt-5 flex items-center gap-3 px-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {r.photo_url ? <img src={r.photo_url} alt="" className="h-11 w-11 rounded-full object-cover" loading="lazy" /> : <span className="h-11 w-11 rounded-full bg-haze" />}
                <span className="min-w-0"><span className="block font-bold text-ink">{tr(r.name, locale)}</span><span className="block truncate text-[13px] text-mist" dir="auto">{[tr(r.role_title, locale), r.organization].filter(Boolean).join(" · ")}</span></span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSection({ faqs, locale, limit, more }: { faqs: FaqT[]; locale: Locale; limit?: number; more?: boolean }) {
  const t = siteDict[locale].faq;
  if (!faqs.length) return null;
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container-x max-w-3xl">
        <SectionHead a={t.titleA} b={t.titleB} center={false} />
        <div className="mt-8"><Faq items={faqs.slice(0, limit ?? faqs.length).map((f) => ({ q: tr(f.question, locale), a: tr(f.answer, locale) }))} /></div>
        {more && limit && faqs.length > limit && <div className="mt-6 text-center"><Link href={`/${locale}/faq`} className="btn btn-outline">{t.all}</Link></div>}
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
      <section className="rounded-[24px] bg-white p-5 ring-1 ring-line sm:p-7 lg:col-span-7">
        <h3 className="t-h2">{t.formTitle}</h3>
        {sent && <p className="mt-4 rounded-xl bg-mint-soft p-3 text-sm font-semibold text-green-deep">{t.sent}</p>}
        {error && <p className="mt-4 rounded-xl bg-[#fdeceb] p-3 text-sm font-semibold text-[#8f1e18]">{t.error}</p>}
        <form action={submitContact} className="mt-5 space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
          <label className="block"><span className="label">{t.name} <span className="text-[#f54e3f]">*</span></span><input name="name" required maxLength={50} placeholder={t.namePh} className="input" /></label>
          <label className="block"><span className="label">{t.email} <span className="text-[#f54e3f]">*</span></span><input name="email" type="email" required maxLength={80} placeholder={t.emailPh} className="input" dir="ltr" /></label>
          <label className="block"><span className="label">{t.message} <span className="text-[#f54e3f]">*</span></span><textarea name="message" required maxLength={500} rows={5} placeholder={t.messagePh} className="textarea" /></label>
          <SubmitButton className="btn btn-primary btn-lg w-full sm:w-auto">{t.send}</SubmitButton>
        </form>
      </section>
      <aside className="space-y-3 lg:col-span-5">
        <h3 className="t-h2">{t.info}</h3>
        {[
          c.phoneNumber && { icon: <Phone className="h-5 w-5" />, label: t.phone, value: c.phoneNumber, href: `tel:${c.phoneNumber}`, ltr: true },
          c.email && { icon: <Mail className="h-5 w-5" />, label: t.email, value: c.email, href: `mailto:${c.email}`, ltr: true },
          c.headOfficeAddress && { icon: <MapPin className="h-5 w-5" />, label: t.office, value: tr(c.headOfficeAddress, locale), href: c.headOfficeLocationUrl, ltr: false },
        ].filter(Boolean).map((r) => {
          const x = r as { icon: ReactNode; label: string; value: string; href?: string; ltr: boolean };
          return (
            <a key={x.label} href={x.href} target={x.href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex min-w-0 items-center gap-3 rounded-[18px] bg-white p-4 ring-1 ring-line">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-mint-soft text-navy">{x.icon}</span>
              <span className="min-w-0"><span className="block text-[13px] text-mist">{x.label}</span><span className="block break-all font-bold text-ink" dir={x.ltr ? "ltr" : undefined}>{x.value}</span></span>
            </a>
          );
        })}
        {hours.length > 0 && (
          <div className="rounded-[18px] bg-white p-4 ring-1 ring-line">
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
    <section className="bg-sky py-16 md:py-24">
      <div className="container-x">
        <SectionHead a={t.titleA} b={t.titleB} c={t.titleC} />
        <div className="mt-10"><ContactBlock s={s} locale={locale} /></div>
      </div>
    </section>
  );
}

export function CtaBand({ locale }: { locale: Locale }) {
  const t = siteDict[locale].cta;
  return (
    <section className="container-x py-14">
      <div className="relative overflow-hidden rounded-[28px] bg-navy-deep px-6 py-12 text-center text-white sm:px-12 sm:py-14">
        <h2 className="mx-auto max-w-2xl text-balance text-[26px] font-bold md:text-[36px]">{[t.a, t.b, t.c].filter(Boolean).join(" ")}</h2>
        <p className="mx-auto mt-3 max-w-xl text-[16px] leading-7 text-white/75 md:text-[18px]">{t.body}</p>
        <Link href={`/${locale}/application`} className="btn btn-light btn-lg mt-7">{t.button}</Link>
      </div>
    </section>
  );
}

export function PageHero({ a, b, sub, children, back, narrow }: { badge?: string; a: string; b?: string; sub?: string; children?: ReactNode; back?: { href: string; label: string }; narrow?: boolean }) {
  return (
    <section className="bg-white pb-6 pt-6 md:pb-10 md:pt-12">
      <div className={clsx("container-x", narrow && "max-w-3xl")}>
        {back && <Link href={back.href} className="mb-4 inline-flex h-9 items-center gap-1 text-[14px] text-mist hover:text-navy"><ArrowLeft className="h-4 w-4 rtl:rotate-180" />{back.label}</Link>}
        <div className="max-w-3xl">
          <h1 className="text-balance text-[32px] font-bold leading-[1.25] text-navy-ink md:text-[48px]">{[a, b].filter(Boolean).join(" ")}</h1>
          {sub && <p className="mt-3 text-balance text-[17px] leading-8 text-ink-2 md:text-[19px]">{sub}</p>}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </section>
  );
}

