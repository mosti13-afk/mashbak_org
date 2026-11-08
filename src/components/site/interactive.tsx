"use client";

import clsx from "clsx";
import { ChevronDown, ChevronLeft, ChevronRight, Play, Quote } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Rotating hero headlines, like the live site's slider (auto-advances, pauses on hover, swipeable dots). */
export function HeroSlider({ slides, underline }: { slides: { title: string; highlight: string; description: string }[]; underline?: boolean }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [paused, slides.length]);
  const s = slides[i];
  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div key={i} className="animate-rise min-h-[11rem] sm:min-h-[12rem] md:min-h-[15rem]">
        <h1 className="text-balance text-[26px] font-semibold leading-snug text-ink sm:text-[30px] md:text-[42px] md:leading-[1.3] xl:text-[48px]">{s.title}</h1>
        <p className="relative mx-auto mt-1 inline-block text-balance text-[24px] font-bold leading-snug text-mint sm:text-[28px] md:text-[42px] xl:text-[48px]">
          {s.highlight}
          {underline && (
            <svg className="absolute -bottom-3 start-[8%] w-[84%] text-[#E3B341]" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden>
              <path d="M3 8 C 80 2, 200 2, 297 7" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
            </svg>
          )}
        </p>
        <p className="mx-auto mt-5 max-w-[40rem] text-balance text-[16px] leading-relaxed text-ink-2 md:text-[20px] md:leading-[33px]">{s.description}</p>
      </div>
      {slides.length > 1 && (
        <div className="mt-6 flex justify-center gap-1.5" role="tablist">
          {slides.map((_, k) => (
            <button key={k} type="button" role="tab" aria-selected={k === i} aria-label={`${k + 1}`} onClick={() => setI(k)}
              className={clsx("h-1.5 rounded-full transition-all", k === i ? "w-8 bg-navy" : "w-3 bg-haze")} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Horizontal carousel with arrows and snap scrolling (testimonials, programs). */
export function Carousel({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState<{ start: boolean; end: boolean }>({ start: true, end: false });
  const update = () => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft);
    setEdge({ start: pos < 8, end: pos > max - 8 });
  };
  useEffect(update, []);
  const go = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    el.scrollBy({ left: dir * (rtl ? -1 : 1) * el.clientWidth * 0.85, behavior: "smooth" });
  };
  return (
    <div>
      <div ref={ref} onScroll={update} aria-label={label}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-6 pt-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      <div className="mt-2 flex items-center justify-center gap-4">
        <button type="button" onClick={() => go(-1)} disabled={edge.start} aria-label="previous"
          className="grid h-9 w-9 place-items-center rounded-full border-2 border-navy text-navy transition disabled:border-line disabled:text-line">
          <ChevronRight className="h-5 w-5 ltr:rotate-180" />
        </button>
        <button type="button" onClick={() => go(1)} disabled={edge.end} aria-label="next"
          className="grid h-9 w-9 place-items-center rounded-full border-2 border-navy text-navy transition disabled:border-line disabled:text-line">
          <ChevronLeft className="h-5 w-5 ltr:rotate-180" />
        </button>
      </div>
    </div>
  );
}

export function ReviewCard({ name, role, quote, photo, more, less }: { name: string; role: string; quote: string; photo: string | null; more: string; less: string }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="relative flex w-[85%] shrink-0 snap-center flex-col rounded-[20px] border border-[#F3F4F6] bg-white px-6 pb-6 pt-14 shadow-[0_1px_3px_rgba(0,0,0,0.08)] sm:w-[380px]">
      <span className="absolute -top-10 start-1/2 h-20 w-20 -translate-x-1/2 overflow-hidden rounded-full border-4 border-mint bg-white rtl:translate-x-1/2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {photo && <img src={photo} alt={name} className="h-full w-full object-cover" loading="lazy" />}
      </span>
      <Quote className="absolute start-5 top-5 h-7 w-7 text-haze" />
      <blockquote className={clsx("flex-1 text-[15px] leading-7 text-ink-2", !open && "line-clamp-6")}>{quote}</blockquote>
      {quote.length > 260 && (
        <button type="button" onClick={() => setOpen((o) => !o)} className="mt-2 self-start text-sm font-semibold text-navy">{open ? less : more}</button>
      )}
      <footer className="mt-4 border-t border-line pt-4">
        <p className="font-bold text-ink">{name}</p>
        <p className="text-[13px] text-mist" dir="auto">{role}</p>
      </footer>
    </article>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {items.map((f, i) => (
        <div key={i} className="rounded-[12px] border border-line bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <button type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}
            className="flex w-full items-center justify-between gap-4 px-4 py-4 text-start">
            <span className="flex items-center gap-3 text-[16px] font-semibold text-ink">
              <span className="h-6 w-[3px] rounded-full bg-navy" />{f.q}
            </span>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-navy text-white">
              <ChevronDown className={clsx("h-4 w-4 transition", open === i && "rotate-180")} />
            </span>
          </button>
          {open === i && <p className="px-5 pb-5 text-[15px] leading-7 text-ink-2">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}

export function VideoCard({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative overflow-hidden rounded-[20px] bg-navy shadow-[0_20px_25px_-5px_rgba(0,0,0,0.12)]">
      <video ref={ref} src={src} poster={poster} controls={playing} playsInline preload="none" className="aspect-video w-full object-contain"
        onPlay={() => setPlaying(true)} aria-label={label} />
      {!playing && (
        <button type="button" onClick={() => ref.current?.play()} aria-label={label}
          className="absolute inset-0 grid place-items-center bg-navy/10 transition hover:bg-navy/0">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-navy text-white shadow-[0_10px_30px_rgba(11,72,109,0.45)]"><Play className="ms-1 h-7 w-7" fill="currentColor" /></span>
        </button>
      )}
    </div>
  );
}
