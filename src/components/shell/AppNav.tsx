"use client";

import clsx from "clsx";
import { Bell, Briefcase, House, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Logo } from "@/components/ui";
import { MashbakniButton, MashbakniMark } from "@/components/app/MashbakniButton";
import type { ShellDict } from "@/i18n/shell";

/* Member-app navigation. Four sections plus Mashbakni (which lives in exactly one place per layout). */
const SECTIONS = (b: string) => ({
  home: { href: b, match: (p: string) => p === b },
  opportunities: { href: `${b}/jobs`, match: (p: string) => p.startsWith(`${b}/jobs`) || p.startsWith(`${b}/companies`) },
  community: { href: `${b}/members`, match: (p: string) => ["/members", "/asks", "/events"].some((x) => p.startsWith(`${b}${x}`)) },
  account: { href: `${b}/account`, match: (p: string) => ["/account", "/profile", "/connections"].some((x) => p.startsWith(`${b}${x}`)) },
  activity: { href: `${b}/activity`, match: (p: string) => ["/activity", "/requests", "/notifications"].some((x) => p.startsWith(`${b}${x}`)) },
  mashbakni: { href: `${b}/mashbakni`, match: (p: string) => p.startsWith(`${b}/mashbakni`) },
});

export function Sidebar({ base, S, me, badge }: { base: string; S: ShellDict; me: { name: string; avatar: string | null; headline: string | null }; badge: number }) {
  const path = usePathname();
  const s = SECTIONS(base);
  const item = (key: "home" | "opportunities" | "community" | "activity", Icon: typeof House, count?: number) => {
    const on = s[key].match(path);
    return (
      <Link href={s[key].href} aria-current={on ? "page" : undefined}
        className={clsx("flex h-12 items-center gap-3 rounded-[14px] px-3.5 text-[15px] transition-colors", on ? "bg-navy text-white font-bold" : "text-ink-2 hover:bg-sky")}>
        <Icon className="h-[22px] w-[22px]" strokeWidth={on ? 2.1 : 1.8} />
        <span className="flex-1">{S[key]}</span>
        {!!count && <span className="dot">{count}</span>}
      </Link>
    );
  };
  const mb = s.mashbakni.match(path);
  const acc = s.account.match(path);
  return (
    <aside className="sticky top-0 hidden h-dvh w-[260px] shrink-0 flex-col border-e border-line bg-white px-4 py-5 lg:flex">
      <Link href={base} className="mb-7 px-2"><Logo height={38} /></Link>
      <nav className="flex flex-col gap-1">
        {item("home", House)}
        {item("opportunities", Briefcase)}
        {item("community", Users)}
        {item("activity", Bell, badge)}
      </nav>
      <Link href={s.mashbakni.href} aria-current={mb ? "page" : undefined}
        className={clsx("mt-6 flex items-center gap-3 rounded-[18px] p-3 transition-colors", mb ? "bg-navy text-white" : "bg-mint-soft text-navy hover:bg-[#dcefe4]")}>
        <MashbakniButton size={40} />
        <span className="leading-tight"><span className="block text-[15px] font-bold">{S.mashbakni}</span></span>
      </Link>
      <Link href={s.account.href} aria-current={acc ? "page" : undefined}
        className={clsx("mt-auto flex items-center gap-3 rounded-[16px] p-2.5 transition-colors", acc ? "bg-sky" : "hover:bg-sky")}>
        <Avatar src={me.avatar} name={me.name} size={40} />
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[14px] font-bold text-ink">{me.name}</span>
          <span className="block truncate text-[12px] text-mist" dir="auto">{S.account}</span>
        </span>
      </Link>
    </aside>
  );
}

export function TopBar({ base, S, badge }: { base: string; S: ShellDict; badge: number }) {
  const path = usePathname();
  const on = SECTIONS(base).activity.match(path);
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line/70 bg-white/90 px-4 backdrop-blur lg:hidden">
      <Link href={base}><Logo height={28} /></Link>
      <Link href={`${base}/activity`} aria-label={S.activity} aria-current={on ? "page" : undefined}
        className={clsx("relative grid h-10 w-10 place-items-center rounded-full", on ? "bg-navy text-white" : "text-ink-2 hover:bg-sky")}>
        <Bell className="h-[22px] w-[22px]" strokeWidth={1.8} />
        {!!badge && <span className="dot absolute -end-0.5 -top-0.5">{badge}</span>}
      </Link>
    </header>
  );
}

export function BottomBar({ base, S }: { base: string; S: ShellDict }) {
  const path = usePathname();
  const s = SECTIONS(base);
  const Tab = ({ k, Icon }: { k: "home" | "opportunities" | "community" | "account"; Icon: typeof House }) => {
    const on = s[k].match(path);
    return (
      <Link href={s[k].href} aria-current={on ? "page" : undefined} className={clsx("flex flex-col items-center gap-1 text-[12px] leading-tight", on ? "font-bold text-navy" : "text-mist")}>
        <Icon className="h-6 w-6" strokeWidth={on ? 2.2 : 1.7} />{S[k]}
      </Link>
    );
  };
  const mb = s.mashbakni.match(path);
  return (
    <nav aria-label={S.home} className="fixed inset-x-0 bottom-0 z-30 grid h-[calc(64px+env(safe-area-inset-bottom))] grid-cols-5 items-center rounded-t-[22px] bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_rgba(10,40,70,0.08)] lg:hidden">
      <Tab k="home" Icon={House} />
      <Tab k="opportunities" Icon={Briefcase} />
      <div className="relative self-stretch">
        <MashbakniButton href={s.mashbakni.href} active={mb} label={S.mashbakni} className="!absolute start-1/2 top-[-24px] ms-[-30px]" />
        <span className={clsx("absolute inset-x-0 bottom-[10px] text-center text-[12px] leading-tight", mb ? "font-bold text-navy" : "text-mist")}>{S.mashbakni}</span>
      </div>
      <Tab k="community" Icon={Users} />
      <Tab k="account" Icon={UserRound} />
    </nav>
  );
}

export { MashbakniMark };
