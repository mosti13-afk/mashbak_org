import { LogIn, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n";
import { siteDict } from "@/i18n/site";
import { displayName } from "@/lib/format";
import { getViewer } from "@/lib/session";
import { Avatar } from "../ui";
import { LangSwitcher } from "../ui/client";
import { NavPill } from "./NavPill";
import { SiteTabBar } from "./TabBar";

function JoinButton({ href, label, small = false }: { href: string; label: string; small?: boolean }) {
  return (
    <Link href={href} className={`btn btn-primary ${small ? "h-9 px-3 text-[12px]" : "h-11 px-4 text-[14px]"}`}>
      {label}
      <span className="inline-flex rounded-[5px] bg-white p-0.5 text-navy"><UserRound className={small ? "h-3 w-3" : "h-3.5 w-3.5"} /></span>
    </Link>
  );
}

export async function Header({ locale }: { locale: Locale }) {
  const s = siteDict[locale];
  const viewer = await getViewer();
  const b = `/${locale}`;
  const area = viewer ? `${b}/${viewer.role === "admin" ? "admin" : "app"}` : null;
  const nav = [
    { href: b, label: s.nav.home },
    { href: `${b}/our_programs`, label: s.nav.programs },
    { href: `${b}/events`, label: s.nav.events },
    { href: `${b}/about`, label: s.nav.about },
    { href: `${b}/contact`, label: s.nav.contact },
  ];
  const account = viewer && area ? (
    <Link href={area} className="flex items-center gap-2 rounded-[14px] border-[1.5px] border-navy bg-white p-0.5 pe-3 text-[13px] font-semibold text-navy">
      <Avatar src={viewer.avatar_url} name={displayName(viewer, locale)} size={30} />
      <span className="hidden sm:inline">{viewer.role === "admin" ? (locale === "ar" ? "لوحة الإدارة" : locale === "he" ? "ניהול" : "Admin") : (locale === "ar" ? "حسابي" : locale === "he" ? "החשבון שלי" : "My account")}</span>
    </Link>
  ) : null;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-haze/80 bg-white/90 pt-[env(safe-area-inset-top)] shadow-[0_4px_20px_rgba(11,72,109,0.06)] backdrop-blur-md">
        <nav className="container-x">
          {/* phones */}
          <div className="flex items-center justify-between gap-2 py-2 lg:hidden">
            <Link href={b} aria-label={s.nav.home}><Image src="/brand/nav_logo.png" alt="مشبك" width={88} height={46} className="h-9 w-auto" priority /></Link>
            <div className="flex items-center gap-2">
              <LangSwitcher locale={locale} />
              {account ?? <JoinButton href={`${b}/application`} label={s.nav.register} small />}
            </div>
          </div>
          {/* desktop */}
          <div className="hidden lg:block">
            <div className="grid h-[80px] grid-cols-[1fr_auto_1fr] items-center">
              <div className="justify-self-start"><LangSwitcher locale={locale} /></div>
              <Link href={b} aria-label={s.nav.home}><Image src="/brand/nav_logo.png" alt="مشبك" width={108} height={56} className="h-14 w-auto" priority /></Link>
              <div className="flex items-center gap-3 justify-self-end">
                {account ?? (
                  <>
                    <Link href={`${b}/login`} className="btn btn-outline h-11 px-4 text-[14px]"><LogIn className="flip-rtl h-4 w-4" />{s.nav.login}</Link>
                    <JoinButton href={`${b}/application`} label={s.nav.register} />
                  </>
                )}
              </div>
            </div>
            <div className="pb-3"><NavPill items={nav} home={b} /></div>
          </div>
        </nav>
      </header>
      <SiteTabBar
        home={b}
        moreLabel={s.nav.more}
        items={[
          { href: b, label: s.nav.home, icon: "home" },
          { href: `${b}/our_programs`, label: s.nav.programs, icon: "programs" },
          { href: `${b}/events`, label: s.nav.events, icon: "events" },
          { href: `${b}/about`, label: s.nav.about, icon: "about" },
        ]}
        more={[
          viewer && area ? { href: area, label: locale === "ar" ? "حسابي" : locale === "he" ? "החשבון שלי" : "My account", icon: "account" as const } : { href: `${b}/login`, label: s.nav.login, icon: "login" as const },
          ...(viewer ? [] : [{ href: `${b}/application`, label: s.apply, icon: "apply" as const }]),
          { href: `${b}/contact`, label: s.nav.contact, icon: "contact" as const },
          { href: `${b}/faq`, label: siteDict[locale].faq.badge, icon: "faq" as const },
          { href: `${b}/policy`, label: s.footer.policy, icon: "privacy" as const },
        ]}
      />
    </>
  );
}
