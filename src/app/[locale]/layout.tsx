import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../globals.css";
import "../mashbakni.css";
import { getDict, isLocale, localeMeta, type Locale } from "@/i18n";
import { ServiceWorker } from "@/components/pwa";
import { isDemo } from "@/lib/env";
import { demoActive } from "@/lib/preview";

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
    applicationName: t.common.brand,
    appleWebApp: { capable: true, title: t.common.brand, statusBarStyle: "default" },
    icons: { icon: [{ url: "/icons/favicon-32.png", sizes: "32x32" }, { url: "/icons/icon-192.png", sizes: "192x192" }], apple: "/icons/apple-touch-icon.png" },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = { themeColor: "#0a476d", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "ar";
  const t = getDict(locale);
  return (
    <html lang={locale} dir={localeMeta[locale].dir}>
      <body className="min-h-dvh">
        {isDemo ? (
          <div className="bg-navy-ink px-4 py-1.5 text-center text-[11px] font-semibold tracking-wide text-white/80">{t.common.demoBanner}</div>
        ) : (await demoActive()) ? (
          <div className="bg-navy-ink px-4 py-1.5 text-center text-[12px] text-white/85">
            {{ ar: "وضع المعاينة: بيانات تجريبية فقط، ولا تُرسل أي رسائل.", en: "Preview mode: demo data only, no messages are sent.", he: "מצב תצוגה מקדימה: נתוני הדגמה בלבד, לא נשלחות הודעות." }[locale]}{" "}
            <a href={`/${locale}/preview/exit`} className="font-bold text-mint underline underline-offset-2">{{ ar: "خروج", en: "Exit", he: "יציאה" }[locale]}</a>
          </div>
        ) : null}
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
