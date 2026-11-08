import { LogOut } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/app/actions";
import type { Dict, Locale } from "@/i18n";
import { displayName } from "@/lib/format";
import type { Profile } from "@/lib/types";
import { Avatar, Logo } from "../ui";
import { LanguageSeg, SubmitButton } from "../ui/client";
import { AdminMenu, NavLinks, type NavItem } from "./NavLinks";

/** Admin area shell. Grouped sidebar on desktop, a menu sheet on phones. Language lives in the sidebar footer, not the top bar. */
export function Shell({ locale, t, viewer, items, children }: {
  locale: Locale; t: Dict; viewer: Profile; items: NavItem[]; mobileItems?: NavItem[]; children: ReactNode; area?: "admin";
}) {
  const name = displayName(viewer, locale);
  const footer = (
    <div className="space-y-3">
      <Link href={`/${locale}/app`} className="btn btn-outline btn-sm w-full">{t.common.myArea}</Link>
      <div className="flex items-center gap-3">
        <Avatar src={viewer.avatar_url} name={name} size={36} />
        <p className="min-w-0 flex-1 truncate text-[14px] font-bold text-ink">{name}</p>
        <form action={logout}>
          <input type="hidden" name="locale" value={locale} />
          <SubmitButton className="grid h-10 w-10 place-items-center rounded-full text-mist hover:bg-sky hover:text-navy"><LogOut className="flip-rtl h-4 w-4" aria-label={t.common.logout} /></SubmitButton>
        </form>
      </div>
      <LanguageSeg locale={locale} />
    </div>
  );
  return (
    <div className="min-h-dvh bg-sky lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="no-scrollbar sticky top-0 hidden h-dvh flex-col overflow-y-auto border-e border-line bg-white lg:flex">
        <div className="flex h-16 items-center gap-2 px-5">
          <Link href={`/${locale}/admin`}><Logo height={36} /></Link>
          <span className="badge badge-navy">{t.common.admin}</span>
        </div>
        <div className="flex-1 px-3 py-3"><NavLinks items={items} /></div>
        <div className="mt-4 border-t border-line p-4">{footer}</div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white/95 px-2 backdrop-blur lg:hidden">
          <AdminMenu items={items} label={t.common.admin} footer={footer} />
          <Link href={`/${locale}/admin`} className="flex items-center gap-2"><Logo height={30} /><span className="badge badge-navy">{t.common.admin}</span></Link>
          <span className="w-11" />
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-8 lg:pt-10">{children}</main>
      </div>
    </div>
  );
}
