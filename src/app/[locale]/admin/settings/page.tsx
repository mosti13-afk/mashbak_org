import { saveSettings } from "@/app/actions";
import { L10nFields } from "@/components/admin/L10nFields";
import { Field, Notice, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import { repo } from "@/lib/data";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireAdmin } from "@/lib/session";

export default async function AdminSettings({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  await requireAdmin(locale);
  const s = await repo.getSettings();
  const S = t.admin.settings;
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t.admin.nav.settings} />
      {sp((await searchParams).saved) ? <Notice>{t.common.saved}</Notice> : null}
      <form action={saveSettings} className="space-y-6">
        <input type="hidden" name="locale" value={locale} />
        <section className="card space-y-4 p-6">
          <h2 className="text-lg font-black">{S.floating}</h2>
          <p className="-mt-2 text-sm text-ink-2">{S.floatingNote}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 text-center text-sm font-black text-mist">#{i + 1}</span>
                {s.floatingAvatars[i] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.floatingAvatars[i]} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-line" />
                ) : <span className="h-11 w-11 shrink-0 rounded-full bg-paper ring-2 ring-line" />}
                <input name={`avatar${i}`} defaultValue={s.floatingAvatars[i] ?? ""} className="input" dir="ltr" placeholder="https://…" />
              </div>
            ))}
          </div>
        </section>
        <section className="card space-y-4 p-6">
          <h2 className="text-lg font-black">{S.stats}</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label={t.home.statMembers}><input name="stat_members" type="number" defaultValue={s.stats.members} className="input" dir="ltr" /></Field>
            <Field label={t.home.statCompanies}><input name="stat_companies" type="number" defaultValue={s.stats.companies} className="input" dir="ltr" /></Field>
            <Field label={t.home.statEvents}><input name="stat_events" type="number" defaultValue={s.stats.events} className="input" dir="ltr" /></Field>
          </div>
        </section>
        <section className="card space-y-4 p-6">
          <h2 className="text-lg font-black">{S.hero}</h2>
          <p className="-mt-2 text-sm text-ink-2">{S.heroNote}</p>
          <L10nFields name="eyebrow" labels={["Eyebrow (AR)", "Eyebrow (EN)", "Eyebrow (HE)"]} value={s.hero.eyebrow} />
          <L10nFields name="title" labels={[t.admin.f.titleAr, t.admin.f.titleEn, t.admin.f.titleHe]} value={s.hero.title} />
          <L10nFields name="highlight" labels={["Highlight (AR)", "Highlight (EN)", "Highlight (HE)"]} value={s.hero.highlight} />
          <L10nFields name="sub" labels={[t.admin.f.descAr, t.admin.f.descEn, t.admin.f.descHe]} value={s.hero.sub} textarea rows={3} />
        </section>
        <section className="card grid gap-3 p-6 sm:grid-cols-2">
          <h2 className="text-lg font-black sm:col-span-2">{S.contact}</h2>
          <Field label={t.common.email}><input name="contact_email" defaultValue={s.contact.email} className="input" dir="ltr" /></Field>
          <Field label={S.whatsapp}><input name="contact_whatsapp" defaultValue={s.contact.whatsapp} className="input" dir="ltr" /></Field>
          <Field label={S.instagram}><input name="contact_instagram" defaultValue={s.contact.instagram} className="input" dir="ltr" /></Field>
          <Field label={S.linkedin}><input name="contact_linkedin" defaultValue={s.contact.linkedin} className="input" dir="ltr" /></Field>
        </section>
        <SubmitButton className="btn btn-primary btn-lg">{t.common.save}</SubmitButton>
      </form>
    </div>
  );
}
