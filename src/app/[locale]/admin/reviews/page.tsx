import { Plus } from "lucide-react";
import { deleteReview, saveReview } from "@/app/actions";
import { L10nFields } from "@/components/admin/L10nFields";
import { Avatar, Check, Field, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import type { Dict, Locale } from "@/i18n";
import { tr } from "@/i18n/config";
import { repo } from "@/lib/data";
import type { MemberReview } from "@/lib/types";
import { pageLocale, type LocaleParams } from "@/lib/page";
import { requireAdmin } from "@/lib/session";

function ReviewForm({ r, locale, t, next }: { r?: MemberReview; locale: Locale; t: Dict; next: number }) {
  const F = t.admin.f;
  return (
    <form action={saveReview} className="space-y-4 border-t border-line p-5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={r?.id ?? ""} />
      <L10nFields name="name" labels={[F.nameAr, F.nameEn, F.nameHe]} value={r?.name} required />
      <L10nFields name="role" labels={[F.roleAr, F.roleEn, F.roleHe]} value={r?.role_title} />
      <div className="grid gap-3 sm:grid-cols-[1fr_2fr_120px]">
        <Field label={F.org}><input name="organization" defaultValue={r?.organization ?? ""} className="input" dir="auto" /></Field>
        <Field label={F.photo}><input name="photo_url" defaultValue={r?.photo_url ?? ""} className="input" dir="ltr" placeholder="https://…" /></Field>
        <Field label={t.common.order}><input name="sort_order" type="number" defaultValue={r?.sort_order ?? next} className="input" dir="ltr" /></Field>
      </div>
      <L10nFields name="quote" labels={[F.quoteAr, F.quoteEn, F.quoteHe]} value={r?.quote} textarea rows={6} required />
      <Check name="is_active" label={t.common.active} defaultChecked={r?.is_active ?? true} />
      <SubmitButton className="btn btn-primary">{t.common.save}</SubmitButton>
    </form>
  );
}

export default async function AdminReviews({ params }: LocaleParams) {
  const { locale, t } = await pageLocale(params);
  await requireAdmin(locale);
  const reviews = await repo.listReviews({ all: true });
  const next = (reviews.at(-1)?.sort_order ?? 0) + 1;
  return (
    <>
      <PageHeader title={t.admin.nav.reviews} />
      <div className="space-y-3">
        {reviews.map((r) => (
          <details key={r.id} className="card group overflow-hidden">
            <summary className="flex cursor-pointer list-none items-center gap-4 p-4">
              <Avatar src={r.photo_url} name={tr(r.name, locale)} size={48} />
              <div className="min-w-0 flex-1">
                <p className="font-bold">{tr(r.name, locale)} {!r.is_active && <span className="badge badge-gray ms-1">{t.common.inactive}</span>}</p>
                <p className="truncate text-sm text-ink-2">{tr(r.quote, locale)}</p>
              </div>
              <span className="text-sm font-bold text-mist">#{r.sort_order}</span>
            </summary>
            <ReviewForm r={r} locale={locale} t={t} next={next} />
            <form action={deleteReview} className="px-5 pb-5 text-end">
              <input type="hidden" name="locale" value={locale} /><input type="hidden" name="id" value={r.id} />
              <SubmitButton className="btn btn-ghost btn-sm text-[#b3261e]" confirm={`${t.common.delete}?`}>{t.common.delete}</SubmitButton>
            </form>
          </details>
        ))}
        <details className="card overflow-hidden border-dashed">
          <summary className="flex cursor-pointer list-none items-center gap-2 p-4 font-bold text-navy"><Plus className="h-4 w-4" />{t.common.add}</summary>
          <ReviewForm locale={locale} t={t} next={next} />
        </details>
      </div>
    </>
  );
}
