"use client";

import clsx from "clsx";
import { Bell, Check, RefreshCw, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MashbakniButton, type MashbakniState } from "@/components/app/MashbakniButton";
import type { LandingDict } from "@/i18n/landing";

/*
 * The hero's one orchestrated moment: a member asks Mashbakni who can help, Mashbakni finds
 * colleagues, a referral request goes out and comes back accepted. Loops while visible.
 * Step timeline (ms): 1 question, 2 thinking, 3 answer, 4 request sent, 5 accepted.
 */
const TIMELINE = [0, 500, 1700, 3500, 6200, 7600];
const LOOP = 12500;
const TONES = ["bg-[#4e8c74]", "bg-navy", "bg-[#6795a8]"];

export function HeroDemo({ D }: { D: LandingDict["demo"] }) {
  const [step, setStep] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setStep(5); return; }
    let timers: ReturnType<typeof setTimeout>[] = [];
    let running = false;
    const clear = () => { timers.forEach(clearTimeout); timers = []; };
    const run = () => {
      clear();
      setStep(0);
      TIMELINE.forEach((t, i) => { if (i) timers.push(setTimeout(() => setStep(i), t)); });
      timers.push(setTimeout(run, LOOP));
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; run(); }
      else if (!e.isIntersecting && running) { running = false; clear(); setStep(5); }
    }, { threshold: 0.35 });
    if (ref.current) io.observe(ref.current);
    return () => { io.disconnect(); clear(); };
  }, []);

  const mbk: MashbakniState = step === 1 ? "listening" : step === 2 ? "thinking" : step >= 3 ? "answered" : "idle";
  const show = (n: number) => clsx("transition-all duration-500 ease-out motion-reduce:transition-none", step >= n ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0");

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[460px]" aria-hidden>
      <div className="relative min-h-[640px] overflow-hidden rounded-[32px] bg-sky p-4 ring-1 ring-line sm:min-h-[600px] sm:p-5">
        {/* header: Mashbakni */}
        <div className="flex items-center gap-3">
          <MashbakniButton size={46} state={mbk} className="mbk--soft shrink-0" />
          <div className="leading-tight">
            <p className="font-bold text-navy-ink">{D.mbk}</p>
            <p className={clsx("text-[12px] transition-colors", step === 2 ? "text-green-deep" : "text-mist")}>{step === 2 ? D.thinking : " "}</p>
          </div>
        </div>

        {/* question */}
        <div className={clsx("mt-5 flex justify-end", show(1))}>
          <p className="bubble bubble-me max-w-[88%] text-[14px] leading-7 sm:text-[15px]">{D.q}</p>
        </div>

        {/* thinking dots */}
        <div className={clsx("absolute start-5 top-[190px] transition-opacity duration-300", step === 2 ? "opacity-100" : "opacity-0")}>
          <span className="bubble inline-flex gap-1.5 bg-white px-4 py-3.5 ring-1 ring-line">
            {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-mint" style={{ animationDelay: `${i * 140}ms` }} />)}
          </span>
        </div>

        {/* answer */}
        <div className={clsx("mt-5", show(3))}>
          <div className="bubble bg-white p-4 ring-1 ring-line">
            <p className="text-[14px] font-bold text-navy-ink sm:text-[15px]">{D.a}</p>
            <ul className="mt-2 divide-y divide-line">
              {D.people.map((p, i) => (
                <li key={p.n} className={clsx("flex items-center gap-3 py-2.5 transition-all duration-500", step >= 3 ? "opacity-100" : "opacity-0")} style={{ transitionDelay: step >= 3 ? `${200 + i * 160}ms` : "0ms" }}>
                  <span className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-full text-[15px] font-bold text-white", TONES[i])}>{p.n.slice(0, 1)}</span>
                  <span className="min-w-0 flex-1"><span className="block font-bold leading-5 text-ink">{p.n}</span><span className="block truncate text-[13px] text-mist">{p.r}</span></span>
                  <span className="hidden shrink-0 rounded-full bg-mint-soft px-2 py-0.5 text-[11px] font-bold text-green-deep sm:inline">{D.open}</span>
                </li>
              ))}
            </ul>
            <span className={clsx("btn mt-3 w-full transition-colors duration-300", step >= 4 ? "bg-mint-soft text-green-deep" : "btn-primary")}>
              {step >= 4 ? <><Check className="h-4 w-4" />{D.sent}</> : <><Send className="h-4 w-4 rtl:-scale-x-100" />{D.ask}</>}
            </span>
            <p className="mt-3 flex items-center gap-1.5 text-[12px] text-mist"><RefreshCw className="h-3.5 w-3.5 shrink-0" />{D.fair}</p>
          </div>
        </div>

        {/* accepted notification */}
        <div className={clsx("absolute inset-x-4 bottom-4 sm:inset-x-5 sm:bottom-5", show(5))}>
          <div className="flex items-center gap-3 rounded-[20px] bg-navy-deep p-3.5 text-white shadow-[0_18px_40px_-18px_rgba(6,42,64,0.7)]">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-white/10 text-mint"><Bell className="h-5 w-5" /></span>
            <span className="min-w-0">
              <span className="block text-[14px] font-bold">{D.toast}</span>
              <span className="block truncate text-[12px] text-white/70">{D.toastSub}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
