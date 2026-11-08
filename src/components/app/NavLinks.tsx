"use client";

import clsx from "clsx";
import {
  Bell, Briefcase, CalendarDays, FileText, Handshake, HelpCircle, Home, Inbox, LayoutDashboard, Layers, Mail, Settings, Star, UserRound, Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const icons = { home: Home, members: Users, connections: Handshake, jobs: Briefcase, events: CalendarDays, bell: Bell, profile: UserRound,
  dashboard: LayoutDashboard, inbox: Inbox, star: Star, help: HelpCircle, layers: Layers, settings: Settings, mail: Mail, file: FileText } as const;

export type NavItem = { href: string; label: string; icon: keyof typeof icons; badge?: number; exact?: boolean };

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
              <Link href={i.href} className={clsx("relative flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-bold", active ? "text-navy" : "text-mist")}>
                <span className={clsx("flex h-8 w-12 items-center justify-center rounded-full transition", active && "bg-mint-soft")}><I className="h-5 w-5" /></span>
                <span className="truncate">{i.label}</span>
                {i.badge ? <span className="absolute end-[22%] top-1.5 h-2.5 w-2.5 rounded-full bg-[#d64545] ring-2 ring-white" /> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }
  return (
    <ul className="space-y-1">
      {items.map((i) => {
        const I = icons[i.icon];
        const active = isActive(i);
        return (
          <li key={i.href}>
            <Link href={i.href} className={clsx("flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold transition", active ? "bg-navy text-white" : "text-ink-2 hover:bg-paper hover:text-navy")}>
              <I className="h-[18px] w-[18px]" />
              <span className="flex-1">{i.label}</span>
              {i.badge ? <span className={clsx("rounded-full px-2 py-0.5 text-[11px]", active ? "bg-white/20" : "bg-mint text-navy-ink")}>{i.badge}</span> : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
