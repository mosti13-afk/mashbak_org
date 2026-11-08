"use client";

import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { locales, localeMeta, type Locale } from "@/i18n/config";

export function SubmitButton({ children, className = "btn btn-primary", pendingText, confirm }: { children: ReactNode; className?: string; pendingText?: string; confirm?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
          {pendingText ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function LangSwitcher({ locale, light = false }: { locale: Locale; light?: boolean }) {
  const path = usePathname();
  const router = useRouter();
  const go = (l: Locale) => {
    const parts = path.split("/");
    parts[1] = l;
    router.push(parts.join("/") + window.location.search);
  };
  return (
    <div className={clsx("flex items-center rounded-full border p-0.5 text-xs font-bold", light ? "border-white/20" : "border-line bg-white")}>
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => go(l)}
          aria-label={localeMeta[l].label}
          aria-pressed={l === locale}
          className={clsx(
            "min-w-8 rounded-full px-2 py-1.5 transition",
            l === locale ? (light ? "bg-white text-navy" : "bg-navy text-white") : light ? "text-white/70 hover:text-white" : "text-ink-2 hover:text-navy",
          )}
        >
          {localeMeta[l].short}
        </button>
      ))}
    </div>
  );
}

/** Native <dialog> wrapper with a trigger button. */
export function Dialog({ trigger, triggerClass = "btn btn-primary", title, children, openInitially = false }: { trigger: ReactNode; triggerClass?: string; title: string; children: ReactNode; openInitially?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (openInitially) ref.current?.showModal();
  }, [openInitially]);
  return (
    <>
      <button type="button" className={triggerClass} onClick={() => ref.current?.showModal()}>
        {trigger}
      </button>
      <dialog
        ref={ref}
        className="m-auto w-[min(92vw,520px)] rounded-[var(--radius-card)] border border-line p-0 shadow-[var(--shadow-lift)] backdrop:bg-navy-ink/40 backdrop:backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
      >
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 className="h-display text-xl">{title}</h2>
            <button type="button" onClick={() => ref.current?.close()} className="-m-1 rounded-full p-1 text-mist hover:bg-paper hover:text-ink" aria-label="close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          {children}
        </div>
      </dialog>
    </>
  );
}

export function MobileMenu({ children, light = false }: { children: ReactNode; light?: boolean }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  return (
    <div className="lg:hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="menu" className={clsx("rounded-full p-2", light ? "text-white hover:bg-white/10" : "text-navy hover:bg-navy/5")}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
      </button>
      {open && <div className="absolute inset-x-0 top-full z-50 border-b border-line bg-white px-4 pb-5 pt-2 shadow-[var(--shadow-lift)]">{children}</div>}
    </div>
  );
}

export function CopyButton({ text, label, done }: { text: string; label: string; done: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" className="btn btn-outline btn-sm" onClick={() => navigator.clipboard.writeText(text).then(() => { setOk(true); setTimeout(() => setOk(false), 1600); })}>
      {ok ? done : label}
    </button>
  );
}
