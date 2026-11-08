import { Bell, LogOut } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/app/actions";
import type { Dict, Locale } from "@/i18n";
import { displayName } from "@/lib/format";
import type { Profile } from "@/lib/types";
import { Avatar, Logo } from "../ui";
import { LangSwitcher, SubmitButton } from "../ui/client";
import { NavLinks, type NavItem } from "./NavLinks";
import { InstallButton } from "../pwa";

export function Shell({ locale, t, viewer, items, mobileItems, children, area }: {
  locale: Locale; t: Dict; viewer: Profile; items: NavItem[]; mobileItems: NavItem[]; children: ReactNode; area: "app" | "admin";
}) {
  const name = displayName(viewer, locale);
  const bell = items.find((i) => i.icon === "bell");
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-e border-line bg-white lg:flex">
        <div className="flex h-16 items-center px-5">
          <Link href={`/${locale}`}><Logo height={36} /></Link>
          {area === "admin" && <span className="badge badge-navy ms-2">{t.common.admin}</span>}
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavLinks items={items} />
        </div>
        <div className="border-t border-line p-4">
          <div className="mb-3"><InstallButton label={t.common.install} iosHint={t.common.installHint} /></div>
          {viewer.role === "admin" && (
            <Link href={`/${locale}/${area === "admin" ? "app" : "admin"}`} className="btn btn-outline btn-sm mb-3 w-full">
              {area === "admin" ? t.common.myArea : t.common.admin}
            </Link>
          )}
          <div className="flex items-center gap-3">
            <Avatar src={viewer.avatar_url} name={name} size={38} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black">{name}</p>
              <p className="truncate text-xs text-mist" dir="auto">{viewer.headline}</p>
            </div>
            <form action={logout}>
              <input type="hidden" name="locale" value={locale} />
              <SubmitButton className="rounded-full p-2 text-mist hover:bg-paper hover:text-navy"><LogOut className="flip-rtl h-4 w-4" aria-label={t.common.logout} /></SubmitButton>
            </form>
          </div>
          <div className="mt-3 flex justify-center"><LangSwitcher locale={locale} /></div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur lg:hidden">
          <Link href={`/${locale}/${area}`}><Logo height={30} /></Link>
          <div className="flex items-center gap-1.5">
            <LangSwitcher locale={locale} />
            {bell && (
              <Link href={bell.href} aria-label={bell.label} className="relative grid h-9 w-9 place-items-center rounded-full text-ink-2 hover:bg-haze/50">
                <Bell className="h-5 w-5" />
                {!!bell.badge && <span className="absolute end-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#e53935] px-1 text-[10px] font-bold text-white">{bell.badge}</span>}
              </Link>
            )}
            {area === "app" && <Link href={`/${locale}/app/profile`} aria-label={name}><Avatar src={viewer.avatar_url} name={name} size={30} /></Link>}
            {viewer.role === "admin" && <Link href={`/${locale}/${area === "admin" ? "app" : "admin"}`} className="btn btn-outline btn-sm">{area === "admin" ? t.common.myArea : t.common.admin}</Link>}
            <form action={logout}><input type="hidden" name="locale" value={locale} /><SubmitButton className="rounded-full p-2 text-mist"><LogOut className="flip-rtl h-4 w-4" /></SubmitButton></form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-8 lg:pb-12 lg:pt-10">
          <div className="mb-4 lg:hidden"><InstallButton label={t.common.install} iosHint={t.common.installHint} className="btn btn-mint btn-sm w-full" /></div>
          {children}
        </main>
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
          <NavLinks items={mobileItems} mobile />
        </nav>
      </div>
    </div>
  );
}
