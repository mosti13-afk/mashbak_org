import { Check as CheckIcon, Plus, Trash2, X } from "lucide-react";
import { approveDropdown, removeDropdown, saveDropdown } from "@/app/actions";
import { L10nFields } from "@/components/admin/L10nFields";
import { Check, Field, Notice, PageHeader, Tabs } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import type { Locale } from "@/i18n/config";
import { repo } from "@/lib/data";
import { labelOf } from "@/lib/dropdowns";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireAdmin } from "@/lib/session";

const TYPES: Record<string, Record<Locale, string>> = {
  CITY: { ar: "المدن", en: "Cities", he: "ערים" },
  WORK_SECTOR: { ar: "مجالات العمل", en: "Work sectors", he: "תחומי עבודה" },
  ORGANIZATION: { ar: "المؤسسات", en: "Organizations", he: "ארגונים" },
  INDUSTRY: { ar: "الصناعات", en: "Industries", he: "תעשיות" },
  ACADEMIC_TITLE: { ar: "الألقاب الأكاديمية", en: "Academic titles", he: "תארים" },
  YEARS_OF_EXPERIENCE: { ar: "سنوات الخبرة", en: "Years of experience", he: "שנות ניסיון" },
  CAREER_GOAL: { ar: "الأهداف المهنية", en: "Career goals", he: "מטרות קריירה" },
  CURRENT_INTERESTS: { ar: "الاهتمامات الحالية", en: "Current interests", he: "תחומי עניין" },
  TOP_CAREER_CHALLENGE: { ar: "التحديات المهنية", en: "Career challenges", he: "אתגרי קריירה" },
  INTERESTED_OPPORTUNITIES_ACTIVITIES: { ar: "الفرص والأنشطة", en: "Opportunities & activities", he: "הזדמנויות ופעילויות" },
  INTERESTED_IN_MENTORING: { ar: "الإرشاد", en: "Mentoring", he: "מנטורינג" },
};

const C = {
  ar: { pending: "اقتراحات بانتظار الموافقة", pendingHint: "قيم كتبها المتقدمون أو الأعضاء وليست في القائمة.", add: "إضافة قيم", addHint: "قيمة في كل سطر. يمكن لصق قائمة كاملة من Excel.", value: "القيمة", order: "الترتيب", active: "مفعّل", save: "حفظ", inactive: "غير مفعّل", total: "قيمة", seed: "هذه القوائم الافتراضية لم تُحفظ بعد في قاعدة البيانات. اضغط \"تثبيت المحتوى الافتراضي\" في صفحة النظرة العامة لتتمكن من تعديلها." },
  en: { pending: "Suggestions waiting for approval", pendingHint: "Values typed by applicants or members that are not in the list yet.", add: "Add values", addHint: "One value per line. You can paste a whole column from Excel.", value: "Value", order: "Order", active: "Active", save: "Save", inactive: "Inactive", total: "values", seed: "These are the built-in lists and are not saved in the database yet. Press \"Install defaults\" on the overview page to edit them." },
  he: { pending: "הצעות שממתינות לאישור", pendingHint: "ערכים שמועמדים או חברים הקלידו ועדיין לא ברשימה.", add: "הוספת ערכים", addHint: "ערך אחד בכל שורה. אפשר להדביק עמודה שלמה מאקסל.", value: "ערך", order: "סדר", active: "פעיל", save: "שמירה", inactive: "לא פעיל", total: "ערכים", seed: "אלה הרשימות המובנות והן עדיין לא נשמרו במסד הנתונים. לחצו על \"התקנת ברירות מחדל\" בעמוד הסקירה כדי לערוך אותן." },
};

export default async function AdminDropdowns({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  await requireAdmin(locale);
  const q = await searchParams;
  const L = C[locale];
  const all = await repo.listDropdowns();
  const types = [...new Set([...Object.keys(TYPES), ...all.map((d) => d.type)])];
  const type = sp(q.type) && types.includes(sp(q.type)!) ? sp(q.type)! : types[0];
  const b = `/${locale}/admin/dropdowns`;
  const pending = all.filter((d) => d.status === "pending");
  const items = all.filter((d) => d.type === type && d.status === "approved").sort((a, z) => a.sort_order - z.sort_order);
  const hidden = <><input type="hidden" name="locale" value={locale} /><input type="hidden" name="type" value={type} /></>;

  return (
    <>
      <PageHeader title={t.admin.nav.dropdowns} />
      {all.some((d) => d.id < 0) && <Notice tone="red">{L.seed}</Notice>}
      {pending.length > 0 && (
        <section className="card mb-5 p-5">
          <h2 className="font-black">{L.pending} <span className="badge badge-red ms-1">{pending.length}</span></h2>
          <p className="mb-3 text-xs text-mist">{L.pendingHint}</p>
          <ul className="divide-y divide-line">
            {pending.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-2 py-2">
                <span className="badge badge-gray">{TYPES[d.type]?.[locale] ?? d.type}</span>
                <span className="flex-1 font-semibold" dir="auto">{d.key}</span>
                {["1", "0"].map((a) => (
                  <form key={a} action={approveDropdown}>
                    <input type="hidden" name="locale" value={locale} /><input type="hidden" name="type" value={d.type} />
                    <input type="hidden" name="id" value={d.id} /><input type="hidden" name="key" value={d.key} /><input type="hidden" name="approve" value={a} />
                    <SubmitButton className={a === "1" ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}>{a === "1" ? <CheckIcon className="h-4 w-4" /> : <X className="h-4 w-4" />}</SubmitButton>
                  </form>
                ))}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Tabs items={types.map((ty) => ({ href: `${b}?type=${encodeURIComponent(ty)}`, label: TYPES[ty]?.[locale] ?? ty, active: ty === type, count: all.filter((d) => d.type === ty && d.status === "approved").length }))} />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <ul className="card divide-y divide-line overflow-hidden">
          {items.map((d) => (
            <li key={d.id}>
              <details>
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3">
                  <span className="w-8 text-xs text-mist">#{d.sort_order}</span>
                  <span className="flex-1 font-semibold" dir="auto">{labelOf(d, locale)}</span>
                  {!d.is_active && <span className="badge badge-gray">{L.inactive}</span>}
                </summary>
                <form action={saveDropdown} className="space-y-3 border-t border-line bg-paper/50 p-4">
                  {hidden}<input type="hidden" name="id" value={d.id} />
                  <div className="grid gap-3 sm:grid-cols-[1fr_100px]">
                    <Field label={L.value}><input name="key" defaultValue={d.key} className="input" dir="auto" /></Field>
                    <Field label={L.order}><input name="sort_order" type="number" defaultValue={d.sort_order} className="input" dir="ltr" /></Field>
                  </div>
                  <L10nFields name="label" labels={["AR", "EN", "HE"]} value={{ ar: d.label?.ar ?? "", en: d.label?.en ?? "", he: d.label?.he ?? "" }} />
                  <div className="flex items-center justify-between gap-3">
                    <Check name="is_active" label={L.active} defaultChecked={d.is_active} />
                    <SubmitButton className="btn btn-primary btn-sm">{L.save}</SubmitButton>
                  </div>
                </form>
                <form action={removeDropdown} className="bg-paper/50 px-4 pb-3 text-end">
                  {hidden}<input type="hidden" name="id" value={d.id} />
                  <SubmitButton className="btn btn-ghost btn-sm text-[#b3261e]" confirm={`${t.common.delete}?`}><Trash2 className="h-4 w-4" />{t.common.delete}</SubmitButton>
                </form>
              </details>
            </li>
          ))}
        </ul>

        <form action={saveDropdown} className="card h-fit space-y-3 p-5">
          {hidden}
          <h2 className="flex items-center gap-2 font-black"><Plus className="h-4 w-4" />{L.add}</h2>
          <textarea name="keys" rows={6} required className="textarea" dir="auto" />
          <p className="text-xs text-mist">{L.addHint}</p>
          <Field label={L.order}><input name="sort_order" type="number" defaultValue={(items.at(-1)?.sort_order ?? 0) + 1} className="input" dir="ltr" /></Field>
          <SubmitButton className="btn btn-primary w-full">{L.save}</SubmitButton>
        </form>
      </div>
    </>
  );
}
