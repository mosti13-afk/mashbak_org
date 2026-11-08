import Link from "next/link";
import type { Dict, Locale } from "@/i18n";
import { displayName } from "@/lib/format";
import { getViewer } from "@/lib/session";
import { Avatar, Logo } from "../ui";
import { LangSwitcher } from "../ui/client";
import { SiteTabBar } from "./TabBar";

export async function Header({ locale, t }: { locale: Locale; t: Dict }) {
  const viewer = await getViewer();
  const b = `/${locale}`;
  const nav = [
    { href: `${b}/programs`, label: t.nav.programs },
    { href: `${b}/events`, label: t.nav.events },
    { href: `${b}/about`, label: t.nav.about },
    { href: `${b}/faq`, label: t.nav.faq },
    { href: `${b}/contact`, label: t.nav.contact },
  ];
  const area = viewer ? `${b}/${viewer.role === "admin" ? "admin" : "app"}` : null;
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="container-x relative flex h-14 items-center justify-between gap-4 lg:h-16">
          <Link href={b} className="shrink-0" aria-label={t.nav.home}>
            <Logo height={34} />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-full px-3.5 py-2 text-[0.95rem] font-bold text-ink-2 transition hover:bg-white hover:text-navy">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <LangSwitcher locale={locale} />
            {viewer && area ? (
              <Link href={area} className="flex items-center gap-2 rounded-full border border-line bg-white p-0.5 pe-3 text-sm font-bold text-navy" aria-label={t.common.myArea}>
                <Avatar src={viewer.avatar_url} name={displayName(viewer, locale)} size={30} />
                <span className="hidden sm:inline">{viewer.role === "admin" ? t.common.admin : t.common.myArea}</span>
              </Link>
            ) : (
              <>
                <Link href={`${b}/login`} className="btn btn-ghost btn-sm hidden lg:inline-flex">{t.common.login}</Link>
                <Link href={`${b}/apply`} className="btn btn-primary btn-sm">{t.common.apply}</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <SiteTabBar
        home={b}
        moreLabel={locale === "ar" ? "المزيد" : locale === "he" ? "עוד" : "More"}
        items={[
          { href: b, label: t.nav.home, icon: "home" },
          { href: `${b}/programs`, label: t.nav.programs, icon: "programs" },
          { href: `${b}/events`, label: t.nav.events, icon: "events" },
          { href: `${b}/about`, label: t.nav.about, icon: "about" },
        ]}
        more={[
          viewer && area ? { href: area, label: t.common.myArea, icon: "account" as const } : { href: `${b}/login`, label: t.common.login, icon: "login" as const },
          ...(viewer ? [] : [{ href: `${b}/apply`, label: t.common.apply, icon: "apply" as const }]),
          { href: `${b}/faq`, label: t.nav.faq, icon: "faq" as const },
          { href: `${b}/contact`, label: t.nav.contact, icon: "contact" as const },
          { href: `${b}/privacy`, label: t.common.privacy, icon: "privacy" as const },
        ]}
      />
    </>
  );
}
