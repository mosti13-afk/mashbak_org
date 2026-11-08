import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { Dict, Locale } from "@/i18n";
import { tr } from "@/i18n/config";
import type { SiteSettings } from "@/lib/types";

// Node positions (percent of the square stage) for the six floating faces
const NODES = [
  { x: 22, y: 16, s: 92 },
  { x: 76, y: 12, s: 76 },
  { x: 90, y: 50, s: 96 },
  { x: 70, y: 86, s: 80 },
  { x: 22, y: 82, s: 98 },
  { x: 8, y: 48, s: 72 },
];
const EDGES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 2], [1, 4], [5, 3]];

export function Hero({ locale, t, settings }: { locale: Locale; t: Dict; settings: SiteSettings }) {
  const h = settings.hero;
  const eyebrow = tr(h.eyebrow, locale) || t.home.eyebrow;
  const title = tr(h.title, locale) || t.home.title1;
  const highlight = tr(h.highlight, locale) || t.home.titleHighlight;
  const sub = tr(h.sub, locale) || t.home.sub;
  const faces = settings.floatingAvatars.slice(0, 6);
  const fmt = new Intl.NumberFormat("en");

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 end-[-10%] h-[520px] w-[520px] rounded-full bg-mint/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute bottom-[-30%] start-[-10%] h-[420px] w-[420px] rounded-full bg-teal/10 blur-3xl" aria-hidden />
      <div className="container-x relative grid items-center gap-12 pb-16 pt-12 lg:grid-cols-[1.1fr_1fr] lg:pb-24 lg:pt-20">
        <div className="animate-rise">
          <span className="chip mb-6"><ShieldCheck className="h-3.5 w-3.5 text-green" />{eyebrow}</span>
          <h1 className="h-display text-[2.6rem] leading-[1.08] sm:text-6xl lg:text-[4.2rem]">
            {title}{" "}
            <span className="text-navy [box-decoration-break:clone] bg-[linear-gradient(transparent_68%,rgb(120_191_152_/_0.55)_68%,rgb(120_191_152_/_0.55)_92%,transparent_92%)] px-1">{highlight}</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-2 sm:text-xl">{sub}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href={`/${locale}/apply`} className="btn btn-primary btn-lg">
              {t.home.ctaApply} <ArrowRight className="flip-rtl h-4 w-4" />
            </Link>
            <Link href={`/${locale}/programs`} className="btn btn-outline btn-lg">{t.home.ctaPrograms}</Link>
          </div>
          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6">
            {[
              [settings.stats.members, t.home.statMembers],
              [settings.stats.companies, t.home.statCompanies],
              [settings.stats.events, t.home.statEvents],
            ].map(([n, l]) => (
              <div key={String(l)}>
                <dt className="text-3xl font-black text-navy" dir="ltr" style={{ textAlign: "start" }}>{fmt.format(Number(n))}+</dt>
                <dd className="mt-1 text-sm font-semibold text-mist">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Constellation of members */}
        <div className="relative mx-auto aspect-square w-full max-w-[520px]" aria-hidden>
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {EDGES.map(([a, b], i) => (
              <line key={i} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y} stroke="#78bf98" strokeOpacity={0.55} strokeWidth={0.35} strokeDasharray="1.2 1.4" vectorEffect="non-scaling-stroke" />
            ))}
            {NODES.map((n, i) => (
              <line key={`c${i}`} x1={n.x} y1={n.y} x2={50} y2={50} stroke="#0a476d" strokeOpacity={0.14} strokeWidth={0.3} />
            ))}
          </svg>
          <div className="absolute left-1/2 top-1/2 flex h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-navy text-center text-white shadow-[var(--shadow-lift)]">
            <div className="absolute inset-0 rounded-full ring-[14px] ring-navy/10" />
            <span className="text-3xl font-black sm:text-4xl" dir="ltr">{fmt.format(settings.stats.members)}+</span>
            <span className="mt-1 px-4 text-xs font-bold text-mint sm:text-sm">{t.home.statMembers}</span>
          </div>
          {faces.map((src, i) => {
            const n = NODES[i];
            return (
              <div
                key={i}
                className="absolute animate-drift"
                style={{ left: `${n.x}%`, top: `${n.y}%`, width: `${n.s / 5.2}%`, animationDelay: `${i * -1.4}s`, translate: "-50% -50%" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="aspect-square w-full rounded-full object-cover shadow-[var(--shadow-lift)] ring-4 ring-white" />
                {i % 2 === 0 && <span className="absolute bottom-[6%] end-[4%] h-[18%] w-[18%] rounded-full bg-mint ring-[3px] ring-white" />}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
