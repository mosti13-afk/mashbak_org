import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../globals.css";
import { getDict, isLocale, localeMeta, type Locale } from "@/i18n";
import { isDemo } from "@/lib/env";

// Content comes from the database and the session, so every page renders on request
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(isLocale(locale) ? locale : "ar");
  return {
    title: { default: `${t.common.brand} | ${t.home.eyebrow}`, template: `%s · ${t.common.brand}` },
    description: t.home.sub,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://mashbak.org"),
    openGraph: { title: t.common.brand, description: t.home.sub, images: ["/logo_color.png"] },
    alternates: { languages: { ar: "/ar", en: "/en", he: "/he" } },
  };
}

export const viewport: Viewport = { themeColor: "#0a476d" };

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "ar";
  const t = getDict(locale);
  return (
    <html lang={locale} dir={localeMeta[locale].dir}>
      <body className="min-h-dvh">
        {isDemo && (
          <div className="bg-navy-ink px-4 py-1.5 text-center text-[11px] font-semibold tracking-wide text-white/80">{t.common.demoBanner}</div>
        )}
        {children}
      </body>
    </html>
  );
}
