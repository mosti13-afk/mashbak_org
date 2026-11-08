"use client";

import clsx from "clsx";
import { CalendarDays, House, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MashbakniButton } from "./MashbakniButton";

/* Bottom bar from the Mashbakni button spec: الرئيسية · الأعضاء · مشبكني (raised) · الفعاليات · حسابي */
export function AppBottomNav({ base, labels, notify }: { base: string; labels: { home: string; members: string; mashbakni: string; events: string; profile: string }; notify?: boolean }) {
  const path = usePathname();
  const on = (href: string, exact = false) => (exact ? path === href : path === href || path.startsWith(`${href}/`));
  const Tab = ({ href, label, Icon, exact }: { href: string; label: string; Icon: typeof House; exact?: boolean }) => (
    <Link href={href} aria-current={on(href, exact) ? "page" : undefined}
      className={clsx("flex flex-col items-center gap-1 text-[12px] leading-tight", on(href, exact) ? "font-bold text-navy" : "text-[#7A8C99]")}>
      <Icon className="h-6 w-6" strokeWidth={on(href, exact) ? 2.2 : 1.8} />{label}
    </Link>
  );
  const mbk = `${base}/mashbakni`;
  return (
    <nav aria-label="التنقل الرئيسي" className="fixed inset-x-0 bottom-0 z-30 grid h-[calc(64px+env(safe-area-inset-bottom))] grid-cols-5 items-center rounded-t-[22px] bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_rgba(10,40,70,0.08)] lg:hidden">
      <Tab href={base} label={labels.home} Icon={House} exact />
      <Tab href={`${base}/members`} label={labels.members} Icon={Users} />
      <div className="relative self-stretch">
        <MashbakniButton href={mbk} state={notify ? "notify" : "idle"} active={on(mbk)} label={labels.mashbakni}
          className="!absolute start-1/2 top-[-24px] ms-[-30px]" />
        <span className="absolute inset-x-0 bottom-[10px] text-center text-[12px] font-bold leading-tight text-navy">{labels.mashbakni}</span>
      </div>
      <Tab href={`${base}/events`} label={labels.events} Icon={CalendarDays} />
      <Tab href={`${base}/profile`} label={labels.profile} Icon={UserRound} />
    </nav>
  );
}
