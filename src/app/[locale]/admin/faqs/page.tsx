import { Plus } from "lucide-react";
import { deleteFaq, saveFaq } from "@/app/actions";
import { L10nFields } from "@/components/admin/L10nFields";
import { Check, Field, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import type { Dict, Locale } from "@/i18n";
import { tr } from "@/i18n/config";
import { repo } from "@/lib/data";
import type { Faq } from "@/lib/types";
import { pageLocale, type LocaleParams } from "@/lib/page";
import { requireAdmin } from "@/lib/session";

function FaqForm({ f, locale, t, next }: { f?: Faq; locale: Locale; t: Dict; next: number }) {
  const F = t.admin.f;
  return (
    <form action={saveFaq} className="space-y-4 border-t border-line p-5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={f?.id ?? ""} />
      <L10nFields name="question" labels={[F.qAr, F.qEn, F.qHe]} value={f?.question} required />
      <L10nFields name="answer" labels={[F.aAr, F.aEn, F.aHe]} value={f?.answer} textarea rows={4} required />
      <div className="flex flex-wrap items-end gap-6">
        <Field label={t.common.order} className="w-28"><input name="sort_order" type="number" defaultValue={f?.sort_order ?? next} className="input" dir="ltr" /></Field>
        <div className="pb-3"><Check name="is_active" label={t.common.active} defaultChecked={f?.is_active ?? true} /></div>
      </div>
      <SubmitButton className="btn btn-primary">{t.common.save}</SubmitButton>
    </form>
  );
}

export default async function AdminFaqs({ params }: LocaleParams) {
  const { locale, t } = await pageLocale(params);
  await requireAdmin(locale);
  const faqs = await repo.listFaqs({ all: true });
  const next = (faqs.at(-1)?.sort_order ?? 0) + 1;
  return (
    <>
      <PageHeader title={t.admin.nav.faqs} />
      <div className="space-y-3">
        {faqs.map((f) => (
          <details key={f.id} className="card overflow-hidden">
            <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
              <span className="text-sm font-bold text-mist">#{f.sort_order}</span>
              <span className="flex-1 font-black">{tr(f.question, locale)}</span>
              {!f.is_active && <span className="badge badge-gray">{t.common.inactive}</span>}
            </summary>
            <FaqForm f={f} locale={locale} t={t} next={next} />
            <form action={deleteFaq} className="px-5 pb-5 text-end">
              <input type="hidden" name="locale" value={locale} /><input type="hidden" name="id" value={f.id} />
              <SubmitButton className="btn btn-ghost btn-sm text-[#b3261e]" confirm={`${t.common.delete}?`}>{t.common.delete}</SubmitButton>
            </form>
          </details>
        ))}
        <details className="card overflow-hidden border-dashed">
          <summary className="flex cursor-pointer list-none items-center gap-2 p-4 font-bold text-navy"><Plus className="h-4 w-4" />{t.common.add}</summary>
          <FaqForm locale={locale} t={t} next={next} />
        </details>
      </div>
    </>
  );
}
