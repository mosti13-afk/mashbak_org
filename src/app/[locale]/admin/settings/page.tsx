import { RotateCcw } from "lucide-react";
import { resetSetting, saveSettingJson } from "@/app/actions";
import { Notice, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import { defaultSettings } from "@/lib/content";
import { repo } from "@/lib/data";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireAdmin } from "@/lib/session";

const C = {
  ar: { intro: "كل نصوص الموقع وإعداداته مخزّنة هنا بثلاث لغات (ar / en / he). عدّل القيمة ثم احفظ. تظهر التغييرات فورًا في الموقع.", save: "حفظ", reset: "استرجاع الافتراضي", saved: "تم الحفظ.", bad: "صيغة JSON غير صحيحة، لم يتم الحفظ.", custom: "معدّل" },
  en: { intro: "All site texts and settings live here in three languages (ar / en / he). Edit a value and save. Changes show on the site right away.", save: "Save", reset: "Restore default", saved: "Saved.", bad: "Invalid JSON, nothing was saved.", custom: "Edited" },
  he: { intro: "כל הטקסטים וההגדרות של האתר נמצאים כאן בשלוש שפות (ar / en / he). ערכו ושמרו. השינויים מופיעים באתר מיד.", save: "שמירה", reset: "שחזור ברירת מחדל", saved: "נשמר.", bad: "JSON לא תקין, לא נשמר.", custom: "נערך" },
};

export default async function AdminSettings({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  await requireAdmin(locale);
  const q = await searchParams;
  const L = C[locale];
  const settings = await repo.getSettings();
  const keys = [...new Set([...Object.keys(defaultSettings), ...Object.keys(settings)])].filter((k) => /^[A-Z_]+$/.test(k)).sort();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t.admin.nav.settings} />
      <p className="mb-4 text-sm text-ink-2">{L.intro}</p>
      {sp(q.saved) && <Notice>{L.saved}</Notice>}
      {sp(q.error) && <Notice tone="red">{L.bad}</Notice>}
      <div className="space-y-2">
        {keys.map((k) => {
          const val = settings[k];
          const changed = JSON.stringify(val) !== JSON.stringify(defaultSettings[k]);
          return (
            <details key={k} id={k} open={sp(q.key) === k} className="card overflow-hidden">
              <summary className="flex cursor-pointer list-none items-center gap-2 p-4">
                <code className="flex-1 text-sm font-bold" dir="ltr">{k}</code>
                {changed && <span className="badge badge-mint">{L.custom}</span>}
              </summary>
              <form action={saveSettingJson} className="space-y-3 border-t border-line p-4">
                <input type="hidden" name="locale" value={locale} /><input type="hidden" name="key" value={k} />
                <textarea name="value" defaultValue={JSON.stringify(val, null, 2)} rows={Math.min(28, JSON.stringify(val, null, 2).split("\n").length + 1)}
                  className="textarea font-mono text-[12.5px] leading-5" dir="ltr" spellCheck={false} />
                <div className="flex justify-between gap-2">
                  <SubmitButton className="btn btn-primary btn-sm">{L.save}</SubmitButton>
                </div>
              </form>
              {changed && k in defaultSettings && (
                <form action={resetSetting} className="px-4 pb-4">
                  <input type="hidden" name="locale" value={locale} /><input type="hidden" name="key" value={k} />
                  <SubmitButton className="btn btn-ghost btn-sm" confirm={`${L.reset}?`}><RotateCcw className="h-4 w-4" />{L.reset}</SubmitButton>
                </form>
              )}
            </details>
          );
        })}
      </div>
    </div>
  );
}
