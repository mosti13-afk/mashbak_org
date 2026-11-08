"use client";

import clsx from "clsx";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/i18n";
import { LanguageSeg } from "../ui/client";

/** Sticky header shadow on scroll, active link, and the mobile menu sheet. */
export function SiteNav({ links }: { links: { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <nav className="hidden items-center gap-1 md:flex">
      {links.map((l) => {
        const on = path === l.href || path.startsWith(`${l.href}/`);
        return <Link key={l.href} href={l.href} aria-current={on ? "page" : undefined}
          className={clsx("rounded-full px-3.5 py-2 text-[15px] transition-colors", on ? "bg-mint-soft font-bold text-navy" : "text-ink-2 hover:text-navy")}>{l.label}</Link>;
      })}
    </nav>
  );
}

export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return <header className={clsx("sticky top-0 z-40 bg-white/95 backdrop-blur transition-shadow", scrolled && "shadow-[0_1px_0_#e3e9ee]")}>{children}</header>;
}

export function MobileMenu({ links, locale, join, login, menuLabel }: { links: { href: string; label: string }[]; locale: Locale; join: { href: string; label: string }; login: { href: string; label: string }; menuLabel: string }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={menuLabel} aria-expanded={open} className="grid h-11 w-11 place-items-center rounded-full text-ink hover:bg-sky md:hidden">
        <Menu className="h-6 w-6" />
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label={menuLabel}>
          <button type="button" aria-label="close" className="absolute inset-0 bg-navy-deep/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 top-0 rounded-b-[28px] bg-white p-4 pb-6 shadow-[var(--shadow-float)]">
            <div className="flex justify-end">
              <button type="button" onClick={() => setOpen(false)} aria-label="close" className="grid h-11 w-11 place-items-center rounded-full hover:bg-sky"><X className="h-6 w-6" /></button>
            </div>
            <nav className="list mt-1">
              {links.map((l) => <Link key={l.href} href={l.href} className="row min-h-[56px] text-[17px] text-ink">{l.label}</Link>)}
            </nav>
            <div className="mt-4"><LanguageSeg locale={locale} /></div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link href={login.href} className="btn btn-outline btn-lg">{login.label}</Link>
              <Link href={join.href} className="btn btn-primary btn-lg">{join.label}</Link>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

/** Mobile-only sticky "Apply" bar that appears once the visitor scrolls past the first screen. */
export function StickyJoin({ href, label }: { href: string; label: string }) {
  const [show, setShow] = useState(false);
  const path = usePathname();
  useEffect(() => {
    const on = () => setShow(window.scrollY > window.innerHeight * 0.7);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  if (/\/(application|login)/.test(path)) return null;
  return (
    <div className={clsx("fixed inset-x-0 bottom-0 z-30 p-3 pb-[calc(12px+env(safe-area-inset-bottom))] transition-transform duration-300 md:hidden", show ? "translate-y-0" : "translate-y-full")}>
      <Link href={href} className="btn btn-primary btn-lg w-full shadow-[var(--shadow-float)]">{label}</Link>
    </div>
  );
}
