import { Plus, RefreshCw } from "lucide-react";
import { deleteCompany, saveCompany, syncCompanyNow } from "@/app/actions";
import { Check, Field, Notice, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import type { Locale } from "@/i18n/config";
import { companyLogo } from "@/lib/companies-seed";
import { repo } from "@/lib/data";
import { fmtRelative } from "@/lib/format";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireAdmin } from "@/lib/session";
import type { Company } from "@/lib/types";

const C: Record<Locale, Record<string, string>> = {
  ar: { intro: "الشركات تربط الأعضاء العاملين فيها بالوظائف المفتوحة. أضف رابط صفحة الوظائف (Workday, Greenhouse, Lever, SmartRecruiters, Ashby, Comeet أو أي صفحة تنشر بيانات الوظائف) واضغط «مزامنة الآن». المزامنة التلقائية تعمل يوميًا.",
    name: "الاسم", nameAr: "الاسم بالعربية", nameHe: "الاسم بالعبرية", aliases: "أسماء أخرى (مفصولة بفواصل)", website: "الموقع", careers: "رابط صفحة الوظائف", logo: "رابط الشعار (اختياري)",
    sector: "القطاع", filter: "الوظائف المستوردة", israel: "في إسرائيل فقط", all: "كل المواقع", sync: "مزامنة تلقائية", syncNow: "مزامنة الآن", save: "حفظ", add: "إضافة شركة",
    members: "أعضاء", jobs: "وظائف", never: "لم تتم مزامنة بعد", synced: "تمت مزامنة {c}: {n} وظيفة ({new} جديدة).", failed: "فشلت المزامنة: {e}", saved: "تم الحفظ." },
  en: { intro: "Companies connect the members who work there with open jobs. Add the careers page link (Workday, Greenhouse, Lever, SmartRecruiters, Ashby, Comeet or any page that publishes job data) and press Sync now. Automatic sync runs daily.",
    name: "Name", nameAr: "Arabic name", nameHe: "Hebrew name", aliases: "Other spellings (comma separated)", website: "Website", careers: "Careers page link", logo: "Logo URL (optional)",
    sector: "Sector", filter: "Imported jobs", israel: "Israel only", all: "All locations", sync: "Automatic sync", syncNow: "Sync now", save: "Save", add: "Add company",
    members: "members", jobs: "jobs", never: "Not synced yet", synced: "Synced {c}: {n} jobs ({new} new).", failed: "Sync failed: {e}", saved: "Saved." },
  he: { intro: "החברות מחברות בין החברים שעובדים בהן לבין משרות פתוחות. הוסיפו קישור לעמוד המשרות (Workday, Greenhouse, Lever, SmartRecruiters, Ashby, Comeet או כל עמוד שמפרסם נתוני משרות) ולחצו \"סנכרון עכשיו\". סנכרון אוטומטי רץ פעם ביום.",
    name: "שם", nameAr: "שם בערבית", nameHe: "שם בעברית", aliases: "איותים נוספים (מופרדים בפסיקים)", website: "אתר", careers: "קישור לעמוד המשרות", logo: "קישור ללוגו (אופציונלי)",
    sector: "תחום", filter: "משרות מיובאות", israel: "בישראל בלבד", all: "כל המיקומים", sync: "סנכרון אוטומטי", syncNow: "סנכרון עכשיו", save: "שמירה", add: "הוספת חברה",
    members: "חברים", jobs: "משרות", never: "טרם סונכרן", synced: "סונכרן {c}: {n} משרות ({new} חדשות).", failed: "הסנכרון נכשל: {e}", saved: "נשמר." },
};

function Form({ c, locale, L }: { c?: Company; locale: Locale; L: Record<string, string> }) {
  return (
    <form action={saveCompany} className="space-y-3 border-t border-line p-5">
      <input type="hidden" name="locale" value={locale} /><input type="hidden" name="id" value={c?.id ?? ""} /><input type="hidden" name="slug" value={c?.slug ?? ""} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label={L.name}><input name="name" required defaultValue={c?.name ?? ""} className="input" dir="auto" /></Field>
        <Field label={L.nameAr}><input name="name_ar" defaultValue={c?.name_ar ?? ""} className="input" dir="rtl" /></Field>
        <Field label={L.nameHe}><input name="name_he" defaultValue={c?.name_he ?? ""} className="input" dir="rtl" /></Field>
      </div>
      <Field label={L.careers}><input name="careers_url" type="url" defaultValue={c?.careers_url ?? ""} className="input" dir="ltr" placeholder="https://company.wd3.myworkdayjobs.com/Careers" /></Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label={L.website}><input name="website" defaultValue={c?.website ?? ""} className="input" dir="ltr" /></Field>
        <Field label={L.sector}><input name="sector" defaultValue={c?.sector ?? ""} className="input" dir="auto" /></Field>
        <Field label={L.filter}>
          <select name="location_filter" defaultValue={c?.location_filter ?? "israel"} className="select"><option value="israel">{L.israel}</option><option value="all">{L.all}</option></select>
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={L.aliases}><input name="aliases" defaultValue={(c?.aliases ?? []).join(", ")} className="input" dir="auto" /></Field>
        <Field label={L.logo}><input name="logo_url" defaultValue={c?.logo_url ?? ""} className="input" dir="ltr" /></Field>
      </div>
      <Check name="sync_enabled" label={L.sync} defaultChecked={c?.sync_enabled ?? true} />
      <SubmitButton className="btn btn-primary btn-sm">{L.save}</SubmitButton>
    </form>
  );
}

export default async function AdminCompanies({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  const v = await requireAdmin(locale);
  const q = await searchParams;
  const L = C[locale];
  const list = await repo.listCompanies({ viewerId: v.id });
  const hidden = <input type="hidden" name="locale" value={locale} />;
  return (
    <>
      <PageHeader title={t.admin.nav.companies} />
      <p className="mb-4 text-sm leading-6 text-ink-2">{L.intro}</p>
      {sp(q.saved) && <Notice>{L.saved}</Notice>}
      {sp(q.synced) !== undefined && (sp(q.err)
        ? <Notice tone="red">{L.failed.replace("{e}", sp(q.err)!)}</Notice>
        : <Notice>{L.synced.replace("{c}", sp(q.synced)!).replace("{n}", sp(q.n) ?? "0").replace("{new}", sp(q.new) ?? "0")}</Notice>)}
      <div className="space-y-2">
        <details className="card overflow-hidden border-dashed">
          <summary className="flex cursor-pointer list-none items-center gap-2 p-4 font-bold text-navy"><Plus className="h-4 w-4" />{L.add}</summary>
          <Form locale={locale} L={L} />
        </details>
        {list.map((c) => {
          const logo = companyLogo(c);
          const err = c.last_sync_status?.startsWith("error");
          return (
            <details key={c.id} id={c.slug} className="card overflow-hidden">
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {logo ? <img src={logo} alt="" className="h-7 w-7 object-contain" /> : <span className="font-bold text-navy">{c.name[0]}</span>}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-black">{c.name} {c.name_ar && <span className="font-normal text-mist">· {c.name_ar}</span>}</span>
                  <span className="block text-xs text-mist">{c.members} {L.members} · {c.jobs} {L.jobs} · {c.last_synced_at ? `${fmtRelative(c.last_synced_at, locale)} · ${c.last_sync_status ?? ""}` : c.careers_url ? L.never : "-"}</span>
                </span>
                {err && <span className="badge badge-red">!</span>}
                {c.careers_url && (
                  <form action={syncCompanyNow}>{hidden}<input type="hidden" name="id" value={c.id} />
                    <SubmitButton className="btn btn-outline btn-sm"><RefreshCw className="h-3.5 w-3.5" />{L.syncNow}</SubmitButton>
                  </form>
                )}
              </summary>
              <Form c={c} locale={locale} L={L} />
              <form action={deleteCompany} className="px-5 pb-5 text-end">{hidden}<input type="hidden" name="id" value={c.id} />
                <SubmitButton className="btn btn-ghost btn-sm text-[#b3261e]" confirm={`${t.common.delete}?`}>{t.common.delete}</SubmitButton>
              </form>
            </details>
          );
        })}
      </div>
    </>
  );
}
