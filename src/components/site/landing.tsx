import clsx from "clsx";
import { Building2, CheckCircle2, Globe2, HandHelping, MessageCircle, RefreshCw, Send, Users } from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/i18n";
import type { LandingDict } from "@/i18n/landing";

/* Landing building blocks. The hero conversation uses illustrative names only. */

const TONES = ["bg-[#4e8c74]", "bg-navy", "bg-[#6795a8]"];
const Initial = ({ name, tone, size = 40 }: { name: string; tone: number; size?: number }) => (
  <span className={clsx("grid shrink-0 place-items-center rounded-full font-bold text-white", TONES[tone % 3])} style={{ width: size, height: size, fontSize: size * 0.38 }}>{name.slice(0, 1)}</span>
);

export function Hero({ locale, L, faces, members }: { locale: Locale; L: LandingDict; faces: string[]; members: string }) {
  const H = L.hero;
  const C = L.convo;
  return (
    <section className="bg-white">
      <div className="container-x grid items-center gap-10 pb-14 pt-8 sm:pt-12 lg:grid-cols-[1fr_minmax(0,500px)] lg:gap-16 lg:pb-24 lg:pt-20">
        <div className="text-start">
          <h1 className="text-balance text-[38px] font-bold leading-[1.18] text-navy-ink sm:text-[52px] xl:text-[62px]">{H.title}</h1>
          <p className="mt-5 max-w-xl text-[17px] leading-8 text-ink-2 sm:text-[19px]">{H.sub}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href={`/${locale}/application`} className="btn btn-primary btn-lg">{H.apply}</Link>
            <Link href={`/${locale}/login`} className="btn btn-ghost btn-lg">{H.login}</Link>
          </div>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-3 rtl:space-x-reverse">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {faces.slice(0, 4).map((src, i) => <img key={i} src={src} alt="" className="h-10 w-10 rounded-full border-2 border-white object-cover" />)}
            </div>
            <p className="text-[15px] text-ink-2"><span className="font-bold text-navy-ink" dir="ltr">{members}</span> {H.members}</p>
          </div>
        </div>

        {/* The conversation: the one moment of motion on the page */}
        <div className="relative rounded-[32px] bg-sky p-4 sm:p-6" aria-hidden>
          <div className="flex justify-end motion-safe:animate-rise">
            <p className="bubble bubble-me max-w-[86%] text-[15px] leading-7">{C.q}</p>
          </div>
          <div className="mt-6 flex items-end gap-2.5 motion-safe:animate-rise motion-safe:[animation-delay:350ms]">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mint text-white"><Users className="h-[18px] w-[18px]" /></span>
            <div className="bubble min-w-0 flex-1 bg-white p-4 ring-1 ring-line">
              <p className="font-bold text-navy-ink">{C.a}</p>
              <ul className="mt-3 divide-y divide-line">
                {C.people.map((p, i) => (
                  <li key={p.n} className="flex items-center gap-3 py-2.5">
                    <Initial name={p.n} tone={i} />
                    <span className="min-w-0"><span className="block font-bold leading-5 text-ink">{p.n}</span><span className="block truncate text-[13px] text-mist">{p.r}</span></span>
                  </li>
                ))}
              </ul>
              <span className="btn btn-primary mt-3 w-full"><Send className="h-4 w-4 rtl:-scale-x-100" />{C.ask}</span>
              <p className="mt-3 flex items-center gap-1.5 text-[12px] text-mist"><RefreshCw className="h-3.5 w-3.5 shrink-0" />{C.fair}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-center motion-safe:animate-rise motion-safe:[animation-delay:900ms]">
            <span className="inline-flex items-center gap-2 rounded-full bg-mint-soft px-4 py-2 text-[14px] font-bold text-green-deep"><CheckCircle2 className="h-4 w-4" />{C.reply}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FitStrip({ L }: { L: LandingDict }) {
  const icon = { linkedin: Globe2, whatsapp: MessageCircle, mashbak: Users } as const;
  return (
    <section className="border-y border-line bg-white">
      <div className="container-x py-10 md:py-12">
        <h2 className="text-[20px] font-bold text-navy-ink md:text-[22px]">{L.fit.title}</h2>
        <ul className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_1.4fr]">
          {L.fit.items.map((it) => {
            const I = icon[it.k as keyof typeof icon];
            const me = it.k === "mashbak";
            return (
              <li key={it.k} className={clsx("flex items-center gap-3 rounded-[20px] p-4", me ? "bg-navy text-white" : "bg-sky")}>
                <span className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-[12px]", me ? "bg-white/10 text-mint" : "bg-white text-mist")}><I className="h-5 w-5" /></span>
                <span className="min-w-0"><span className={clsx("block font-bold", me ? "text-white" : "text-ink")}>{it.t}</span><span className={clsx("block text-[14px] leading-6", me ? "text-white/80" : "text-ink-2")}>{it.d}</span></span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function Features({ L }: { L: LandingDict }) {
  const icon = { companies: Building2, referral: Send, asks: HandHelping } as const;
  return (
    <section className="bg-sky py-16 md:py-24">
      <div className="container-x">
        <h2 className="max-w-2xl text-balance text-[28px] font-bold leading-[1.3] text-navy-ink md:text-[40px]">{L.features.title}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {L.features.items.map((f) => {
            const I = icon[f.k as keyof typeof icon];
            return (
              <article key={f.k} className="flex flex-col rounded-[24px] bg-white p-6 ring-1 ring-line">
                <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-mint-soft text-navy"><I className="h-6 w-6" /></span>
                <h3 className="mt-5 text-[20px] font-bold text-navy-ink">{f.t}</h3>
                <p className="mt-2 flex-1 text-[15px] leading-7 text-ink-2">{f.d}</p>
                {"steps" in f && f.steps && (
                  <ol className="mt-5 flex items-center gap-1.5" aria-label={f.t}>
                    {f.steps.map((s, i) => (
                      <li key={s} className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <span className={clsx("h-1.5 rounded-full", i < 3 ? "bg-mint" : "bg-haze")} />
                        <span className={clsx("truncate text-[12px]", i < 3 ? "font-bold text-green-deep" : "text-mist")}>{s}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </article>
            );
          })}
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
      <div className="rounded-[32px] bg-navy-deep px-6 py-12 text-center text-white sm:px-12 sm:py-16">
        <h2 className="mx-auto max-w-2xl text-balance text-[28px] font-bold leading-[1.3] md:text-[40px]">{L.cta.title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-[16px] leading-7 text-white/75 md:text-[18px]">{L.cta.sub}</p>
        <Link href={`/${locale}/application`} className="btn btn-light btn-lg mt-8">{L.cta.apply}</Link>
      </div>
    </section>
  );
}
