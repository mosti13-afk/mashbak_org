import Link from "next/link";
import type { Locale } from "@/i18n";
import { siteDict } from "@/i18n/site";
import { displayName } from "@/lib/format";
import { getViewer } from "@/lib/session";
import { Avatar, Logo } from "../ui";
import { HeaderShell, MobileMenu, SiteNav, StickyJoin } from "./HeaderClient";

/* Public header: logo, three links, log in + join. Language lives in the footer and the mobile menu. */
export async function Header({ locale }: { locale: Locale }) {
  const s = siteDict[locale];
  const viewer = await getViewer();
  const b = `/${locale}`;
  const links = [
    { href: `${b}/our_programs`, label: s.nav.programs },
    { href: `${b}/events`, label: s.nav.events },
    { href: `${b}/about`, label: s.nav.about },
  ];
  const join = { href: `${b}/application`, label: s.apply };
  const login = { href: `${b}/login`, label: locale === "ar" ? "دخول" : locale === "he" ? "כניסה" : "Log in" };
  const area = viewer ? `${b}/${viewer.role === "admin" ? "admin" : "app"}` : null;
  return (
    <>
      <HeaderShell>
        <div className="container-x flex h-16 items-center gap-4 md:h-[72px]">
          <Link href={b} className="shrink-0" aria-label="Mashbak"><Logo height={40} /></Link>
          <div className="flex flex-1 justify-center"><SiteNav links={links} /></div>
          {viewer && area ? (
            <Link href={area} className="flex items-center gap-2 rounded-full bg-sky p-1 pe-3 text-[14px] font-bold text-navy">
              <Avatar src={viewer.avatar_url} name={displayName(viewer, locale)} size={32} />
              <span className="hidden sm:inline">{viewer.role === "admin" ? (locale === "ar" ? "الإدارة" : locale === "he" ? "ניהול" : "Admin") : (locale === "ar" ? "حسابي" : locale === "he" ? "החשבון" : "My account")}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link href={login.href} className="btn btn-ghost px-3">{login.label}</Link>
              <Link href={join.href} className="btn btn-primary hidden md:inline-flex">{join.label}</Link>
              <MobileMenu links={links} locale={locale} join={join} login={login} menuLabel={s.nav.menu} />
            </div>
          )}
        </div>
      </HeaderShell>
      {!viewer && <StickyJoin href={join.href} label={join.label} />}
    </>
  );
}
