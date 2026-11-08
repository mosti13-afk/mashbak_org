import Link from "next/link";
import type { Dict, Locale } from "@/i18n";
import { getViewer } from "@/lib/session";
import { Logo } from "../ui";
import { LangSwitcher, MobileMenu } from "../ui/client";

export async function Header({ locale, t }: { locale: Locale; t: Dict }) {
  const viewer = await getViewer();
  const nav = [
    { href: `/${locale}/programs`, label: t.nav.programs },
    { href: `/${locale}/events`, label: t.nav.events },
    { href: `/${locale}/about`, label: t.nav.about },
    { href: `/${locale}/faq`, label: t.nav.faq },
    { href: `/${locale}/contact`, label: t.nav.contact },
  ];
  const account = viewer ? (
    <Link href={`/${locale}/${viewer.role === "admin" ? "admin" : "app"}`} className="btn btn-primary btn-sm">
      {viewer.role === "admin" ? t.common.admin : t.common.myArea}
    </Link>
  ) : (
    <>
      <Link href={`/${locale}/login`} className="btn btn-ghost btn-sm">{t.common.login}</Link>
      <Link href={`/${locale}/apply`} className="btn btn-primary btn-sm">{t.common.apply}</Link>
    </>
  );
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="container-x relative flex h-16 items-center justify-between gap-4">
        <Link href={`/${locale}`} className="shrink-0" aria-label={t.nav.home}>
          <Logo height={38} />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-full px-3.5 py-2 text-[0.95rem] font-bold text-ink-2 transition hover:bg-white hover:text-navy">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <LangSwitcher locale={locale} />
          {account}
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <LangSwitcher locale={locale} />
          <MobileMenu>
            <nav className="flex flex-col">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="border-b border-line/60 py-3 font-bold text-ink">{n.label}</Link>
              ))}
            </nav>
            <div className="mt-4 flex gap-2">{account}</div>
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
