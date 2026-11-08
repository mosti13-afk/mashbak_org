import { Plus } from "lucide-react";
import { deleteProgram, saveProgram } from "@/app/actions";
import { L10nFields } from "@/components/admin/L10nFields";
import { ProgramIcon } from "@/components/cards";
import { Check, Field, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import type { Dict, Locale } from "@/i18n";
import { tr } from "@/i18n/config";
import { repo } from "@/lib/data";
import type { Program } from "@/lib/types";
import { pageLocale, type LocaleParams } from "@/lib/page";
import { requireAdmin } from "@/lib/session";

const COLORS = ["#117286", "#4e8c74", "#6795a8", "#80a69e", "#a5b683", "#0a476d"];
const ICONS = ["rocket", "crown", "cpu", "sparkles", "network"];

function ProgramForm({ p, locale, t, next }: { p?: Program; locale: Locale; t: Dict; next: number }) {
  const F = t.admin.f;
  const P = t.programs;
  return (
    <form action={saveProgram} className="space-y-4 border-t border-line p-5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={p?.id ?? ""} />
      <div className="grid gap-3 sm:grid-cols-4">
        <Field label={F.slug}><input name="slug" required defaultValue={p?.slug ?? ""} className="input" dir="ltr" pattern="[a-z0-9-]+" /></Field>
        <Field label={F.color}>
          <select name="color" defaultValue={p?.color ?? COLORS[0]} className="select">{COLORS.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        </Field>
        <Field label="Icon">
          <select name="icon" defaultValue={p?.icon ?? "network"} className="select">{ICONS.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        </Field>
        <Field label={t.common.order}><input name="sort_order" type="number" defaultValue={p?.sort_order ?? next} className="input" dir="ltr" /></Field>
      </div>
      <L10nFields name="title" labels={[F.titleAr, F.titleEn, F.titleHe]} value={p?.title} required />
      <L10nFields name="summary" labels={[F.sumAr, F.sumEn, F.sumHe]} value={p?.summary} textarea rows={2} />
      <L10nFields name="body" labels={[F.descAr, F.descEn, F.descHe]} value={p?.body} textarea rows={4} />
      <div className="grid gap-3 sm:grid-cols-4">
        <Field label={P.sessions}><input name="sessions_count" type="number" min={0} defaultValue={p?.sessions_count ?? ""} className="input" dir="ltr" /></Field>
        <Field label={`${P.duration} (months)`}><input name="duration_months" type="number" min={0} defaultValue={p?.duration_months ?? ""} className="input" dir="ltr" /></Field>
        <Field label="Image URL"><input name="image_url" defaultValue={p?.image_url ?? ""} className="input" dir="ltr" /></Field>
        <Field label="Icon URL"><input name="icon_url" defaultValue={p?.icon_url ?? ""} className="input" dir="ltr" /></Field>
      </div>
      {[0, 1, 2, 3, 4].map((i) => (
        <L10nFields key={`a${i}`} name={`aud${i}`} labels={[`${P.forWho} ${i + 1} (AR)`, "EN", "HE"]} value={p?.target_audience?.[i]} />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <L10nFields key={i} name={`benefit${i}`} labels={[`${P.benefits} ${i + 1} (AR)`, "EN", "HE"]} value={p?.benefits[i]} />
      ))}
      <Check name="is_active" label={t.common.active} defaultChecked={p?.is_active ?? true} />
      <SubmitButton className="btn btn-primary">{t.common.save}</SubmitButton>
    </form>
  );
}

export default async function AdminPrograms({ params }: LocaleParams) {
  const { locale, t } = await pageLocale(params);
  await requireAdmin(locale);
  const programs = await repo.listPrograms({ all: true });
  const next = (programs.at(-1)?.sort_order ?? 0) + 1;
  return (
    <>
      <PageHeader title={t.admin.nav.programs} />
      <div className="space-y-3">
        {programs.map((p) => (
          <details key={p.id} className="card overflow-hidden">
            <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: p.color }}><ProgramIcon name={p.icon} className="h-5 w-5" /></span>
              <span className="flex-1 font-bold">{tr(p.title, locale)}</span>
              {!p.is_active && <span className="badge badge-gray">{t.common.inactive}</span>}
              <span className="text-sm font-bold text-mist">#{p.sort_order}</span>
            </summary>
            <ProgramForm p={p} locale={locale} t={t} next={next} />
            <form action={deleteProgram} className="px-5 pb-5 text-end">
              <input type="hidden" name="locale" value={locale} /><input type="hidden" name="id" value={p.id} />
              <SubmitButton className="btn btn-ghost btn-sm text-[#b3261e]" confirm={`${t.common.delete}?`}>{t.common.delete}</SubmitButton>
            </form>
          </details>
        ))}
        <details className="card overflow-hidden border-dashed">
          <summary className="flex cursor-pointer list-none items-center gap-2 p-4 font-bold text-navy"><Plus className="h-4 w-4" />{t.common.add}</summary>
          <ProgramForm locale={locale} t={t} next={next} />
        </details>
      </div>
    </>
  );
}
