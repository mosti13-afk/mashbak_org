import { BadgeCheck, Check } from "lucide-react";
import Link from "next/link";
import { submitApplication } from "@/app/actions";
import { Check as CheckBox, Field, Notice } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import { pageLocale, sp, type SearchParams } from "@/lib/page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { t } = await pageLocale(params);
  return { title: t.apply.title };
}

export default async function Apply({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  const q = await searchParams;

  if (sp(q.ok)) {
    return (
      <div className="container-x flex max-w-xl flex-col items-center py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-mint text-navy-ink"><BadgeCheck className="h-8 w-8" /></span>
        <h1 className="h-display mt-6 text-3xl">{t.apply.successTitle}</h1>
        <p className="mt-3 text-lg text-ink-2">{t.apply.successBody}</p>
        <Link href={`/${locale}`} className="btn btn-outline mt-8">{t.common.goHome}</Link>
      </div>
    );
  }

  const Section = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
    <fieldset className="border-t border-line pt-6 first:border-t-0 first:pt-0">
      <legend className="mb-4 flex items-center gap-2.5 text-lg font-black text-navy-ink">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-sm text-white">{n}</span>{title}
      </legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );

  return (
    <div className="container-x grid gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_1.6fr]">
      <div className="lg:sticky lg:top-24 lg:h-fit">
        <p className="eyebrow mb-3">{t.common.exclusive}</p>
        <h1 className="h-display text-4xl leading-tight">{t.apply.title}</h1>
        <p className="mt-4 text-lg text-ink-2">{t.apply.sub}</p>
        <div className="card mt-8 p-6">
          <p className="mb-3 font-black text-navy-ink">{t.apply.criteriaTitle}</p>
          <ul className="space-y-2.5">
            {t.about.criteria.map((c) => (
              <li key={c} className="flex items-center gap-2.5 text-ink-2"><Check className="h-4 w-4 shrink-0 text-green" />{c}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="card p-6 sm:p-8">
        {sp(q.error) ? <Notice tone="red">{t.apply.motivationHint}</Notice> : null}
        <form action={submitApplication} className="space-y-8">
          <input type="hidden" name="locale" value={locale} />
          <Section n={1} title={t.apply.sectionAbout}>
            <Field label={t.apply.fullName} className="sm:col-span-2"><input name="full_name" required minLength={2} className="input" autoComplete="name" /></Field>
            <Field label={t.common.email}><input name="email" type="email" required className="input" dir="ltr" autoComplete="email" /></Field>
            <Field label={t.common.phone}><input name="phone" type="tel" required minLength={7} className="input" dir="ltr" autoComplete="tel" placeholder="+972…" /></Field>
            <Field label={t.common.city}><input name="city" className="input" autoComplete="address-level2" /></Field>
            <Field label={`${t.common.linkedin} (${t.common.optional})`}><input name="linkedin_url" type="url" className="input" dir="ltr" placeholder="https://linkedin.com/in/…" /></Field>
          </Section>
          <Section n={2} title={t.apply.sectionCareer}>
            <Field label={t.common.headline}><input name="headline" required className="input" /></Field>
            <Field label={t.common.company}><input name="company" className="input" /></Field>
            <Field label={t.common.sector}><input name="sector" className="input" /></Field>
            <Field label={t.common.years}><input name="years_experience" type="number" min={0} max={60} required className="input" dir="ltr" /></Field>
          </Section>
          <Section n={3} title={t.apply.sectionWhy}>
            <Field label={t.apply.motivation} hint={t.apply.motivationHint} className="sm:col-span-2"><textarea name="motivation" required minLength={10} rows={5} className="textarea" /></Field>
            <Field label={`${t.apply.source} (${t.common.optional})`} className="sm:col-span-2"><input name="referral_source" className="input" /></Field>
            <div className="space-y-3 sm:col-span-2">
              <CheckBox name="age_confirmed" label={t.apply.age} required />
              <CheckBox name="terms" label={t.apply.terms} required />
            </div>
          </Section>
          <SubmitButton className="btn btn-primary btn-lg w-full sm:w-auto">{t.apply.submit}</SubmitButton>
        </form>
      </div>
    </div>
  );
}
