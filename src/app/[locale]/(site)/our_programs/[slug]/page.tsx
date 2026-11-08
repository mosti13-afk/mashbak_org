import { Check, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/site/sections";
import { tr } from "@/i18n/config";
import { siteDict } from "@/i18n/site";
import { repo } from "@/lib/data";
import { pageLocale } from "@/lib/page";

type P = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: P) {
  const { locale } = await pageLocale(params);
  const p = await repo.getProgram((await params).slug);
  return { title: p ? tr(p.title, locale) : undefined, description: p ? tr(p.summary, locale) : undefined };
}

export default async function ProgramPage({ params }: P) {
  const { locale } = await pageLocale(params);
  const t = siteDict[locale];
  const p = await repo.getProgram((await params).slug);
  if (!p) notFound();
  return (
    <>
      <PageHero a={tr(p.title, locale)} sub={tr(p.summary, locale)} back={{ href: `/${locale}/our_programs`, label: t.nav.programs }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p.image_url && <img src={p.image_url} alt="" className="h-24 w-auto object-contain" />}
      </PageHero>
      <section className="container-x grid gap-6 pb-28 lg:grid-cols-[1.6fr_1fr] lg:pb-16">
        <div className="rounded-[24px] border border-line bg-white p-5 sm:p-7">
          <p className="text-[17px] leading-8 text-ink-2">{tr(p.body, locale)}</p>
          {p.benefits.length > 0 && (
            <>
              <h2 className="mb-3 mt-8 t-h2">{t.programs.offers}</h2>
              <ul className="space-y-2">{p.benefits.map((x, i) => <li key={i} className="flex gap-2.5 text-[16px] text-ink-2"><Check className="mt-1.5 h-4 w-4 shrink-0 text-mint" />{tr(x, locale)}</li>)}</ul>
            </>
          )}
        </div>
        <aside className="h-fit space-y-4 rounded-[24px] bg-sky p-5 sm:p-6 lg:sticky lg:top-24">
          {p.target_audience.length > 0 && (
            <div>
              <p className="mb-2 font-bold text-ink">{t.programs.forWho}</p>
              <ul className="space-y-1.5">{p.target_audience.map((x, i) => <li key={i} className="flex gap-2 text-[15px] text-ink-2"><Check className="mt-1 h-4 w-4 shrink-0 text-green-deep" />{tr(x, locale)}</li>)}</ul>
            </div>
          )}
          {p.sessions_count ? <p className="flex items-center gap-2 text-[14px] text-ink-2"><Clock className="h-4 w-4" />{p.sessions_count} {t.programs.sessions}</p> : null}
          <Link href={`/${locale}/application`} className="btn btn-primary btn-lg w-full">{t.programs.join}</Link>
        </aside>
      </section>
    </>
  );
}
