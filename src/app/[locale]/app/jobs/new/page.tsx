import Link from "next/link";
import { createJob } from "@/app/actions";
import { Check, Field, Notice, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function NewJob({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  const v = await requireMember(locale);
  const J = t.app.jobs;
  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/${locale}/app/jobs`} className="mb-4 inline-flex text-sm font-bold text-mist hover:text-navy">← {J.title}</Link>
      <PageHeader title={J.newTitle} sub={J.newSub} />
      {sp((await searchParams).error) ? <Notice tone="red">{J.fDescription}: 10+</Notice> : null}
      <form action={createJob} className="card grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
        <input type="hidden" name="locale" value={locale} />
        <Field label={J.fTitle} className="sm:col-span-2"><input name="title" required minLength={2} className="input" dir="auto" /></Field>
        <Field label={t.common.company}><input name="company" required defaultValue={v.company ?? ""} className="input" dir="auto" /></Field>
        <Field label={t.common.city}><input name="city" className="input" /></Field>
        <Field label={J.fType}>
          <select name="job_type" className="select" defaultValue="full_time">
            {Object.entries(J.types).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </Field>
        <Field label={J.fMode}>
          <select name="work_mode" className="select" defaultValue="hybrid">
            {Object.entries(J.modes).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </Field>
        <div className="sm:col-span-2"><Check name="is_managerial" label={J.fManagerial} defaultChecked /></div>
        <Field label={J.fDescription} className="sm:col-span-2"><textarea name="description" required minLength={10} rows={6} className="textarea" dir="auto" /></Field>
        <Field label={`${J.fRequirements} (${t.common.optional})`} className="sm:col-span-2"><textarea name="requirements" rows={4} className="textarea" dir="auto" /></Field>
        <Field label={`${J.applyLink} (${t.common.optional})`} className="sm:col-span-2"><input name="apply_url" type="url" className="input" dir="ltr" /></Field>
        <div className="sm:col-span-2"><SubmitButton className="btn btn-primary btn-lg">{J.publish}</SubmitButton></div>
      </form>
    </div>
  );
}
