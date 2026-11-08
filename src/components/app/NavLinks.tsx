"use client";

import clsx from "clsx";
import {
  Bell, Menu, X, Briefcase, CalendarDays, FileText, Handshake, HelpCircle, Home, Sparkles, Building2, Inbox as InboxIcon, MessagesSquare, Inbox, LayoutDashboard, Layers, Mail, Settings, Star, UserRound, Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MashbakniMark } from "./MashbakniButton";

const icons = { home: Home, members: Users, connections: Handshake, jobs: Briefcase, events: CalendarDays, bell: Bell, profile: UserRound, sparkles: MashbakniMark, building: Building2, requests: InboxIcon, asks: MessagesSquare,
  dashboard: LayoutDashboard, inbox: Inbox, star: Star, help: HelpCircle, layers: Layers, settings: Settings, mail: Mail, file: FileText } as const;

export type NavItem = { href: string; label: string; icon: keyof typeof icons; badge?: number; exact?: boolean; group?: string };

export function NavLinks({ items, mobile = false }: { items: NavItem[]; mobile?: boolean }) {
  const path = usePathname();
  const isActive = (i: NavItem) => (i.exact ? path === i.href : path === i.href || path.startsWith(i.href + "/"));
  if (mobile) {
    return (
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((i) => {
          const I = icons[i.icon];
          const active = isActive(i);
          return (
            <li key={i.href}>
              <Link href={i.href} className={clsx("relative flex min-w-0 flex-col items-center gap-1 py-2.5 text-[10.5px] font-bold", active ? "text-navy" : "text-mist")}>
                <span className={clsx("flex h-8 w-12 items-center justify-center rounded-full transition", active && "bg-mint-soft")}><I className="h-5 w-5" /></span>
                <span className="w-full truncate px-0.5 text-center">{i.label}</span>
                {i.badge ? <span className="absolute end-[22%] top-1.5 h-2.5 w-2.5 rounded-full bg-[#d64545] ring-2 ring-white" /> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }
  const groups: { name?: string; items: NavItem[] }[] = [];
  for (const it of items) {
    const g = groups.at(-1);
    if (g && g.name === it.group) g.items.push(it); else groups.push({ name: it.group, items: [it] });
  }
  return (
    <div className="space-y-5">
      {groups.map((g, gi) => (
        <div key={gi}>
          {g.name && <p className="mb-1.5 px-3 text-[12px] font-bold text-mist">{g.name}</p>}
          <ul className="space-y-0.5">
            {g.items.map((i) => {
              const I = icons[i.icon];
              const active = isActive(i);
              return (
                <li key={i.href}>
                  <Link href={i.href} aria-current={active ? "page" : undefined} className={clsx("flex min-h-[44px] items-center gap-3 rounded-[12px] px-3 text-[15px] transition lg:min-h-[40px]", active ? "bg-mint-soft font-bold text-navy" : "text-ink-2 hover:bg-sky hover:text-navy")}>
                    <I className="h-[18px] w-[18px] shrink-0" />
                    <span className="flex-1">{i.label}</span>
                    {i.badge ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-navy px-1.5 text-[11px] font-bold text-white">{i.badge}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Phone menu for the admin area: a sheet with every section, grouped. */
export function AdminMenu({ items, label, footer }: { items: NavItem[]; label: string; footer?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  const total = items.reduce((n, i) => n + (i.badge ?? 0), 0);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={label} aria-expanded={open} className="relative grid h-11 w-11 place-items-center rounded-full text-ink hover:bg-sky lg:hidden">
        <Menu className="h-6 w-6" />
        {total > 0 && <span className="absolute end-2 top-2 h-2.5 w-2.5 rounded-full bg-[#d64545] ring-2 ring-white" />}
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={label}>
          <button type="button" aria-label="close" className="absolute inset-0 bg-navy-deep/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 start-0 flex w-[86%] max-w-[340px] flex-col bg-white shadow-[var(--shadow-float)]">
            <div className="flex h-14 items-center justify-between px-4">
              <span className="font-bold text-ink">{label}</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="close" className="grid h-11 w-11 place-items-center rounded-full hover:bg-sky"><X className="h-6 w-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-4"><NavLinks items={items} /></div>
            {footer && <div className="border-t border-line p-4">{footer}</div>}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
