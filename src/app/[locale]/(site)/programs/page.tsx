import { ProgramCard } from "@/components/cards";
import { PageHeader } from "@/components/ui";
import { repo } from "@/lib/data";
import { pageLocale, type LocaleParams } from "@/lib/page";

export async function generateMetadata({ params }: LocaleParams) {
  const { t } = await pageLocale(params);
  return { title: t.programs.title };
}

export default async function Programs({ params }: LocaleParams) {
  const { locale, t } = await pageLocale(params);
  const programs = await repo.listPrograms();
  return (
    <div className="container-x py-14 sm:py-20">
      <PageHeader eyebrow={t.home.programsEyebrow} title={t.programs.title} sub={t.programs.sub} />
      <div className="grid gap-5 sm:grid-cols-2">
        {programs.map((p) => <ProgramCard key={p.id} p={p} locale={locale} t={t} />)}
      </div>
    </div>
  );
}
