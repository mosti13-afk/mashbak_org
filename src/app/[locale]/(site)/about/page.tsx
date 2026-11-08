import { Check } from "lucide-react";
import Link from "next/link";
import { SectionTitle } from "@/components/ui";
import { repo } from "@/lib/data";
import { pageLocale, type LocaleParams } from "@/lib/page";

export async function generateMetadata({ params }: LocaleParams) {
  const { t } = await pageLocale(params);
  return { title: t.about.title };
}

export default async function About({ params }: LocaleParams) {
  const { locale, t } = await pageLocale(params);
  const s = await repo.getSettings();
  return (
    <>
      <section className="container-x grid gap-12 py-16 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:py-24">
        <div>
          <p className="eyebrow mb-4">{t.common.exclusive}</p>
          <h1 className="h-display text-4xl leading-tight sm:text-6xl">{t.about.title}</h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-ink-2">{t.about.lead}</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {s.floatingAvatars.slice(0, 6).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="" className={`aspect-square w-full rounded-3xl object-cover shadow-[var(--shadow-card)] ${i % 2 ? "translate-y-6" : ""}`} />
          ))}
        </div>
      </section>
      <section className="mesh py-20 text-white">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <SectionTitle eyebrow={t.about.missionTitle} title={t.home.problemTitle} light />
          <p className="text-lg leading-relaxed text-white/80">{t.about.missionBody}</p>
        </div>
      </section>
      <section className="container-x py-20">
        <SectionTitle title={t.about.valuesTitle} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.about.values.map((v, i) => (
            <div key={v.title} className="card p-6">
              <span className="text-4xl font-black text-mint">0{i + 1}</span>
              <h3 className="mt-3 text-lg font-black text-navy-ink">{v.title}</h3>
              <p className="mt-2 text-ink-2">{v.body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="border-t border-line bg-white py-20">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle title={t.about.whoTitle} sub={t.about.whoBody} />
            <Link href={`/${locale}/apply`} className="btn btn-primary btn-lg">{t.common.apply}</Link>
          </div>
          <ul className="card divide-y divide-line p-2">
            {t.about.criteria.map((c) => (
              <li key={c} className="flex items-center gap-3 p-4 text-lg font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint-soft text-green-deep"><Check className="h-4 w-4" /></span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
