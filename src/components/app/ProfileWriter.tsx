"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Locale } from "@/i18n/config";

const T = {
  ar: { open: "اقترح لي عنوانًا ونبذة", notes: "أضف ما تريد إبرازه (اختياري): مسؤولياتك، إنجازاتك، أو ملخص سيرتك الذاتية", go: "اقترح", use: "استخدم الاقتراح", again: "اقتراح آخر", hint: "اقتراح فقط: راجعه وعدّله قبل الحفظ.", headline: "العنوان المهني", bio: "النبذة" },
  en: { open: "Suggest a headline and bio", notes: "What would you like to highlight? (optional) Responsibilities, achievements or a CV summary", go: "Suggest", use: "Use this suggestion", again: "Try again", hint: "A suggestion only: review and edit it before saving.", headline: "Headline", bio: "Bio" },
  he: { open: "הצעה לכותרת ולתיאור", notes: "מה תרצו להדגיש? (אופציונלי) תחומי אחריות, הישגים או תקציר קורות חיים", go: "הצעה", use: "שימוש בהצעה", again: "הצעה נוספת", hint: "הצעה בלבד: עברו עליה וערכו לפני השמירה.", headline: "כותרת מקצועית", bio: "תיאור" },
};

/** Drafts a headline and bio with Mashbakni; fills the profile form fields only when the member chooses to. */
export function ProfileWriter({ locale }: { locale: Locale }) {
  const L = T[locale];
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<{ headline: string; bio: string } | null>(null);
  const field = (n: string) => document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`form#edit [name="${n}"]`);

  async function run() {
    setBusy(true);
    try {
      const r = await fetch("/api/mashbakni/profile", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, notes, headline: field("headline")?.value, company: field("company")?.value, sector: field("sector")?.value, years: field("years_experience")?.value }),
      });
      if (r.ok) setOut(await r.json());
    } finally { setBusy(false); }
  }
  function use() {
    if (!out) return;
    const h = field("headline"); const b = field("bio");
    if (h && out.headline) h.value = out.headline;
    if (b && out.bio) b.value = out.bio;
    setOpen(false); setOut(null);
  }

  if (!open) {
    return <button type="button" onClick={() => setOpen(true)} className="btn btn-secondary btn-sm"><Sparkles className="h-4 w-4" />{L.open}</button>;
  }
  return (
    <div className="space-y-3 rounded-[18px] bg-sky p-4">
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={2500} placeholder={L.notes} className="textarea bg-white" dir="auto" />
      {!out && <button type="button" onClick={run} disabled={busy} className="btn btn-primary btn-sm">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{L.go}</button>}
      {out && (
        <div className="space-y-3">
          <div className="rounded-[14px] bg-white p-3 ring-1 ring-line">
            <p className="text-[12px] font-bold text-mist">{L.headline}</p><p className="mt-1 font-bold text-ink" dir="auto">{out.headline}</p>
            <p className="mt-3 text-[12px] font-bold text-mist">{L.bio}</p><p className="mt-1 text-[15px] leading-7 text-ink-2" dir="auto">{out.bio}</p>
          </div>
          <p className="text-[12px] text-mist">{L.hint}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={use} className="btn btn-primary btn-sm">{L.use}</button>
            <button type="button" onClick={() => { setOut(null); run(); }} disabled={busy} className="btn btn-ghost btn-sm">{busy && <Loader2 className="h-4 w-4 animate-spin" />}{L.again}</button>
          </div>
        </div>
      )}
    </div>
  );
}
