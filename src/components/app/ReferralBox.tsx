"use client";

import clsx from "clsx";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";

export interface InsiderView { id: string; name: string; headline: string | null; avatar: string | null; signal: string; helped: string | null; tag?: string | null }
export interface ReferralCopy { choose: string; message: string; messagePh: string; draft: string; drafting: string; cv: string; cvHint: string; send: string; showMore: string }

/** Pick an insider, write (or draft with Mashbakni) a short request, attach a CV link, send. */
export function ReferralBox({ action, locale, jobId, insiders, copy, cvUrl }: {
  action: (f: FormData) => Promise<void>; locale: string; jobId: string; insiders: InsiderView[]; copy: ReferralCopy; cvUrl: string | null;
}) {
  const [picked, setPicked] = useState(insiders[0]?.id ?? "");
  const [all, setAll] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const shown = all ? insiders : insiders.slice(0, 3);

  async function draft() {
    setBusy(true);
    try {
      const r = await fetch("/api/mashbakni/pitch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId, insiderId: picked, locale }) });
      const j = (await r.json()) as { text?: string };
      if (j.text) setMsg(j.text);
    } finally { setBusy(false); }
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="job_id" value={jobId} />
      <input type="hidden" name="insider_id" value={picked} />
      <fieldset>
        <legend className="mb-2 px-1 text-[14px] font-bold text-ink">{copy.choose}</legend>
        <div className="list" role="radiogroup">
          {shown.map((i) => (
            <button key={i.id} type="button" role="radio" aria-checked={picked === i.id} onClick={() => setPicked(i.id)}
              className={clsx("row w-full text-start", picked === i.id && "bg-mint-soft")}>
              <Avatar src={i.avatar} name={i.name} size={44} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5"><span className="row-title">{i.name}</span>{i.tag && <span className="badge badge-navy shrink-0 py-0">{i.tag}</span>}</span>
                <span className="row-sub block" dir="auto">{i.headline}</span>
                <span className="block text-[12px] text-green-deep">{i.signal}{i.helped ? ` · ${i.helped}` : ""}</span>
              </span>
              <span className={clsx("grid h-6 w-6 shrink-0 place-items-center rounded-full border-2", picked === i.id ? "border-navy bg-navy text-white" : "border-line bg-white")}>
                {picked === i.id && <Check className="h-3.5 w-3.5" />}
              </span>
            </button>
          ))}
        </div>
        {insiders.length > 3 && !all && (
          <button type="button" onClick={() => setAll(true)} className="mt-2 flex h-9 items-center gap-1 px-1 text-[14px] text-navy">
            <ChevronDown className="h-4 w-4" />{copy.showMore} ({insiders.length - 3})
          </button>
        )}
      </fieldset>
      <label className="block">
        <span className="mb-1.5 flex items-center justify-between gap-2 px-1">
          <span className="text-[14px] font-bold text-ink">{copy.message}</span>
          <button type="button" onClick={draft} disabled={busy || !picked} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-mint-soft px-3 text-[13px] text-navy disabled:opacity-60">
            <Sparkles className={clsx("h-3.5 w-3.5", busy && "animate-spin")} />{busy ? copy.drafting : copy.draft}
          </button>
        </span>
        <textarea name="message" required minLength={5} rows={6} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={copy.messagePh} className="textarea" dir="auto" />
      </label>
      <label className="block">
        <span className="label px-1">{copy.cv}</span>
        <input name="cv_url" type="url" defaultValue={cvUrl ?? ""} className="input" dir="ltr" placeholder="https://drive.google.com/..." />
        <span className="hint px-1">{copy.cvHint}</span>
      </label>
      <SubmitButton className="btn btn-primary btn-lg w-full">{copy.send}</SubmitButton>
    </form>
  );
}
