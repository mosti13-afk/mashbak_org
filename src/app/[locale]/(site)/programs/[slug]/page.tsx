import { Check } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgramIcon } from "@/components/cards";
import { tr } from "@/i18n/config";
import { repo } from "@/lib/data";
import { pageLocale } from "@/lib/page";

type P = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: P) {
  const { locale } = await pageLocale(params);
  const p = await repo.getProgram((await params).slug);
  return { title: p ? tr(p.title, locale) : undefined };
}

export default async function ProgramPage({ params }: P) {
  const { locale, t } = await pageLocale(params);
  const p = await repo.getProgram((await params).slug);
  if (!p) notFound();
  return (
    <>
      <section className="relative overflow-hidden text-white" style={{ background: `linear-gradient(135deg, #06314d 0%, ${p.color} 140%)` }}>
        <div className="grid-lines absolute inset-0" aria-hidden />
        <div className="container-x relative py-16 sm:py-24">
          <Link href={`/${locale}/programs`} className="mb-6 inline-flex text-sm font-bold text-white/70 hover:text-white"><span className="flip-rtl me-1 inline-block">←</span>{t.programs.title}</Link>
          <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15"><ProgramIcon name={p.icon} className="h-7 w-7" /></span>
          <h1 className="h-display max-w-3xl text-4xl text-white sm:text-6xl">{tr(p.title, locale)}</h1>
          <p className="mt-5 max-w-2xl text-xl text-white/80">{tr(p.summary, locale)}</p>
        </div>
      </section>
      <section className="container-x grid gap-10 py-16 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="text-lg leading-relaxed text-ink-2">{tr(p.body, locale)}</p>
          {p.benefits.length > 0 && (
            <>
              <h2 className="h-display mb-4 mt-10 text-2xl">{t.programs.benefits}</h2>
              <ul className="space-y-3">
                {p.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-3 text-lg font-semibold">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ background: p.color }}><Check className="h-4 w-4" /></span>
                    {tr(b, locale)}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <aside className="card h-fit space-y-4 p-6">
          {[[t.programs.forWho, p.for_who], [t.programs.duration, p.duration], [t.programs.sessions, p.sessions]].map(([l, v]) => (
            <div key={String(l)}>
              <p className="text-xs font-bold text-mist">{String(l)}</p>
              <p className="font-black text-ink">{tr(v as Record<string, string>, locale)}</p>
            </div>
          ))}
          <Link href={`/${locale}/apply`} className="btn btn-primary w-full">{t.programs.cta}</Link>
        </aside>
      </section>
    </>
  );
}
