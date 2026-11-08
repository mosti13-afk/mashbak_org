import type { ReactNode } from "react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { pageLocale } from "@/lib/page";

export default async function SiteLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale, t } = await pageLocale(params);
  return (
    <>
      <Header locale={locale} t={t} />
      <main>{children}</main>
      <Footer locale={locale} t={t} />
    </>
  );
}
