"use client";

import clsx from "clsx";
import { CalendarDays, HelpCircle, Home, Info, Layers, LayoutGrid, LogIn, Mail, Send, Shield, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Item = { href: string; label: string; icon: "home" | "programs" | "events" | "about" };
type MoreLink = { href: string; label: string; icon: "faq" | "contact" | "privacy" | "login" | "apply" | "account" };

const icons = { home: Home, programs: Layers, events: CalendarDays, about: Info, faq: HelpCircle, contact: Mail, privacy: Shield, login: LogIn, apply: Send, account: UserRound };

/** App-style bottom navigation for the public site on phones. */
export function SiteTabBar({ items, more, moreLabel, home }: { items: Item[]; more: MoreLink[]; moreLabel: string; home: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const active = (href: string) => (href === home ? path === home : path === href || path.startsWith(href + "/"));
  const moreActive = more.some((m) => active(m.href));

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-navy-ink/40 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-0 animate-rise rounded-t-[1.75rem] bg-white px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-3 shadow-[var(--shadow-lift)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-line" />
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="font-black text-navy-ink">{moreLabel}</span>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1.5 text-mist hover:bg-paper" aria-label="close"><X className="h-5 w-5" /></button>
            </div>
            <ul className="grid grid-cols-3 gap-2">
              {more.map((m) => {
                const I = icons[m.icon];
                return (
                  <li key={m.href}>
                    <Link href={m.href} className={clsx("flex flex-col items-center gap-2 rounded-2xl border p-3 text-center text-xs font-bold transition active:scale-95",
                      m.icon === "apply" ? "border-navy bg-navy text-white" : "border-line bg-paper text-ink")}>
                      <I className="h-5 w-5" />{m.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="main">
        <ul className="grid grid-cols-5">
          {items.map((i) => {
            const I = icons[i.icon];
            const on = active(i.href);
            return (
              <li key={i.href}>
                <Link href={i.href} className={clsx("flex min-w-0 flex-col items-center gap-1 py-2 text-[10.5px] font-bold transition active:scale-95", on ? "text-navy" : "text-mist")}>
                  <span className={clsx("flex h-8 w-12 items-center justify-center rounded-full transition", on && "bg-mint-soft")}><I className="h-5 w-5" /></span>
                  <span className="w-full truncate px-0.5 text-center">{i.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
              className={clsx("flex w-full flex-col items-center gap-1 py-2 text-[10.5px] font-bold transition active:scale-95", open || moreActive ? "text-navy" : "text-mist")}>
              <span className={clsx("flex h-8 w-12 items-center justify-center rounded-full transition", (open || moreActive) && "bg-mint-soft")}><LayoutGrid className="h-5 w-5" /></span>
              <span className="w-full truncate px-0.5 text-center">{moreLabel}</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
