import clsx from "clsx";
import { AppWindow, Bell, Building2, Check, Mail, MessageCircle, MessageSquareText, Send, ShieldCheck, Smartphone, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { MashbakniButton } from "@/components/app/MashbakniButton";
import type { Locale } from "@/i18n";
import type { LandingDict } from "@/i18n/landing";
import { HeroDemo } from "./HeroDemo";

/* Landing building blocks. Mock content uses illustrative names only. */

export function Hero({ locale, L, faces, members, companies }: { locale: Locale; L: LandingDict; faces: string[]; members: string; companies: number }) {
  const H = L.hero;
  const stats = [
    { n: members, l: H.stats.members },
    ...(companies >= 5 ? [{ n: `+${companies}`, l: H.stats.companies }] : []),
    { n: "2017", l: H.stats.since },
  ];
  return (
    <section className="overflow-x-clip bg-white">
      <div className="container-x grid items-center gap-10 pb-14 pt-8 sm:pt-12 lg:grid-cols-[1fr_minmax(0,460px)] lg:gap-16 lg:pb-24 lg:pt-16">
        <div className="text-start">
          <h1 className="text-balance text-[38px] font-bold leading-[1.18] text-navy-ink sm:text-[52px] xl:text-[60px]">{H.title}</h1>
          <p className="mt-5 max-w-xl text-[17px] leading-8 text-ink-2 sm:text-[19px] sm:leading-9">{H.sub}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href={`/${locale}/application`} className="btn btn-primary btn-lg">{H.apply}</Link>
            <Link href={`/${locale}/login`} className="btn btn-outline btn-lg">{H.login}</Link>
          </div>
          <div className="mt-9 flex items-center gap-4">
            {faces.length > 0 && (
              <div className="flex shrink-0 -space-x-3 rtl:space-x-reverse">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {faces.slice(0, 4).map((src, i) => <img key={i} src={src} alt="" className="h-10 w-10 rounded-full border-2 border-white object-cover" />)}
              </div>
            )}
            <dl className="flex flex-wrap gap-x-5 gap-y-2">
              {stats.map((s) => (
                <div key={s.l} className="leading-tight">
                  <dt className="sr-only">{s.l}</dt>
                  <dd className="text-[18px] font-bold text-navy-ink" dir="ltr" style={{ textAlign: "start" }}>{s.n}</dd>
                  <dd className="text-[13px] text-mist">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <HeroDemo D={L.demo} />
      </div>
    </section>
  );
}

function UseCard({ icon, title, desc, children, className }: { icon: ReactNode; title: string; desc: string; children?: ReactNode; className?: string }) {
  return (
    <article className={clsx("flex flex-col rounded-[28px] bg-white p-6 ring-1 ring-line sm:p-7", className)}>
      <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-mint-soft text-navy">{icon}</span>
      <h3 className="mt-5 text-[20px] font-bold text-navy-ink">{title}</h3>
      <p className="mt-2 text-[15px] leading-7 text-ink-2">{desc}</p>
      {children && <div className="mt-6 flex flex-1 items-end">{children}</div>}
    </article>
  );
}

export function UseCases({ L }: { L: LandingDict }) {
  const U = L.uses;
  return (
    <section className="bg-sky py-16 md:py-24">
      <div className="container-x">
        <div className="max-w-2xl">
          <h2 className="text-balance text-[28px] font-bold leading-[1.3] text-navy-ink md:text-[40px]">{U.title}</h2>
          <p className="mt-3 text-[16px] leading-8 text-ink-2 md:text-[18px]">{U.sub}</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <UseCard icon={<Building2 className="h-6 w-6" />} title={U.companies.t} desc={U.companies.d}>
            <div className="flex w-full items-center gap-3 rounded-[18px] bg-sky p-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-white font-bold text-navy ring-1 ring-line">{U.companies.co.slice(0, 1)}</span>
              <span className="min-w-0 flex-1"><span className="block font-bold text-ink">{U.companies.co}</span><span className="block text-[13px] text-mist">{U.companies.members}</span></span>
              <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[12px] font-bold text-navy ring-1 ring-line">{U.companies.jobs}</span>
            </div>
          </UseCard>
          <UseCard icon={<Send className="h-6 w-6 rtl:-scale-x-100" />} title={U.referral.t} desc={U.referral.d}>
            <ol className="flex w-full items-start gap-1.5" aria-label={U.referral.t}>
              {U.referral.steps.map((s, i) => (
                <li key={s} className="flex min-w-0 flex-1 flex-col gap-2">
                  <span className={clsx("h-1.5 rounded-full", i < 3 ? "bg-mint" : "bg-haze")} />
                  <span className={clsx("flex items-center gap-1 truncate text-[12px]", i < 3 ? "font-bold text-green-deep" : "text-mist")}>{i < 3 && <Check className="h-3 w-3 shrink-0" />}{s}</span>
                </li>
              ))}
            </ol>
          </UseCard>
          <UseCard icon={<Users className="h-6 w-6" />} title={U.asks.t} desc={U.asks.d}>
            <div className="w-full rounded-[18px] bg-sky p-3.5">
              <span className="rounded-full bg-sand px-2.5 py-0.5 text-[11px] font-bold text-sand-ink">{U.asks.tag}</span>
              <p className="mt-2 font-bold text-ink">{U.asks.text}</p>
              <p className="mt-1 flex items-center gap-1.5 text-[13px] text-mist"><MessageSquareText className="h-3.5 w-3.5" />{U.asks.replies}</p>
            </div>
          </UseCard>
          <UseCard icon={<Bell className="h-6 w-6" />} title={U.notify.t} desc={U.notify.d}>
            <ul className="flex flex-wrap gap-2">
              {U.notify.channels.map((c, i) => {
                const I = [AppWindow, Mail, MessageCircle, Smartphone][i];
                return <li key={c} className="inline-flex h-10 items-center gap-2 rounded-full bg-sky px-3.5 text-[14px] font-bold text-navy-ink"><I className="h-4 w-4 text-green-deep" />{c}</li>;
              })}
            </ul>
          </UseCard>
        </div>
      </div>
    </section>
  );
}

export function MashbakniBand({ L }: { L: LandingDict }) {
  const M = L.mbk;
  return (
    <section className="bg-navy-deep py-16 text-white md:py-24">
      <div className="container-x grid items-center gap-12 lg:grid-cols-[minmax(0,440px)_1fr] lg:gap-16">
        {/* character + sample exchange */}
        <div className="relative mx-auto w-full max-w-[440px]">
          <div className="flex justify-center"><MashbakniButton size={128} label={L.demo.mbk} /></div>
          <div className="mt-10 space-y-4">
            <div className="flex justify-end"><p className="bubble bubble-me max-w-[88%] bg-navy text-[14px] leading-7 text-white">{M.q}</p></div>
            <div className="flex"><p className="bubble max-w-[92%] bg-white text-[14px] leading-7 text-ink">{M.a}</p></div>
          </div>
        </div>
        <div>
          <h2 className="text-balance text-[28px] font-bold leading-[1.3] md:text-[40px]">{M.title}</h2>
          <p className="mt-3 max-w-2xl text-[16px] leading-8 text-white/75 md:text-[18px]">{M.sub}</p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {M.can.map((c) => (
              <li key={c} className="flex gap-3 rounded-[18px] bg-white/[0.06] p-4 text-[15px] leading-7 text-white/90">
                <Check className="mt-1 h-5 w-5 shrink-0 text-mint" />{c}
              </li>
            ))}
          </ul>
          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="flex items-center gap-2 font-bold text-mint"><ShieldCheck className="h-5 w-5" />{M.limitsTitle}</p>
            <ul className="mt-3 space-y-2">{M.limits.map((x) => <li key={x} className="text-[15px] leading-7 text-white/75">{x}</li>)}</ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowToJoin({ L, locale }: { L: LandingDict; locale: Locale }) {
  return (
    <section id="how" className="bg-white py-16 md:py-24">
      <div className="container-x">
        <h2 className="text-balance text-[28px] font-bold leading-[1.3] text-navy-ink md:text-[40px]">{L.how.title}</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
          {L.how.steps.map((s, i) => (
            <li key={i} className="relative flex gap-4 md:flex-col">
              {i < L.how.steps.length - 1 && <span className="absolute start-5 top-12 h-[calc(100%-8px)] w-px bg-line md:start-14 md:top-5 md:h-px md:w-[calc(100%-40px)]" aria-hidden />}
              <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-[16px] font-bold text-white">{i + 1}</span>
              <span className="min-w-0">
                <span className="block text-[18px] font-bold text-navy-ink">{s.t}</span>
                <span className="mt-1 block text-[15px] leading-7 text-ink-2">{s.d}</span>
              </span>
            </li>
          ))}
        </ol>
        <Link href={`/${locale}/application`} className="btn btn-primary btn-lg mt-10">{L.hero.apply}</Link>
      </div>
    </section>
  );
}

export function FinalCta({ L, locale }: { L: LandingDict; locale: Locale }) {
  return (
    <section className="container-x pb-16 pt-4 md:pb-24">
      <div className="rounded-[32px] bg-mint-soft px-6 py-12 text-center sm:px-12 sm:py-16">
        <h2 className="mx-auto max-w-2xl text-balance text-[28px] font-bold leading-[1.3] text-navy-ink md:text-[40px]">{L.cta.title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-[16px] leading-7 text-ink-2 md:text-[18px]">{L.cta.sub}</p>
        <Link href={`/${locale}/application`} className="btn btn-primary btn-lg mt-8">{L.cta.apply}</Link>
      </div>
    </section>
  );
}
