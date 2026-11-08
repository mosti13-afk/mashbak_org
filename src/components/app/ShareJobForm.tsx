"use client";

import { Link2, Loader2 } from "lucide-react";
import { useState } from "react";
import { SubmitButton } from "@/components/ui/client";

type Copy = Record<"link" | "fetch" | "fetching" | "fetched" | "failed" | "manual" | "jobTitle" | "company" | "location" | "type" | "mode" | "managerial" | "description" | "requirements" | "apply" | "publish" | "note", string>;
interface Prefill { title: string; company: string | null; location: string | null; description?: string | null; url: string; job_type?: string; work_mode?: string; is_managerial?: boolean }

/** Paste a job link, we read the page (JobPosting data) and prefill; or fill in by hand. */
export function ShareJobForm({ action, locale, copy, types, modes, defaultCompany }: {
  action: (f: FormData) => Promise<void>; locale: string; copy: Copy; types: Record<string, string>; modes: Record<string, string>; defaultCompany: string;
}) {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "fail">("idle");
  const [p, setP] = useState<Prefill | null>(null);
  const [k, setK] = useState(0); // remount fields after prefill

  async function load() {
    if (!/^https:\/\//i.test(url)) return;
    setState("loading");
    try {
      const r = await fetch(`/api/jobs/preview?url=${encodeURIComponent(url)}`);
      const j = (await r.json()) as { ok: boolean; job?: Prefill };
      if (j.ok && j.job) { setP({ ...j.job, url }); setK((x) => x + 1); setState("ok"); } else setState("fail");
    } catch { setState("fail"); }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[20px] bg-white p-4 ring-1 ring-line sm:p-5">
        <label className="mb-1.5 block text-[14px] font-semibold text-ink">{copy.link}</label>
        <div className="flex gap-2">
          <span className="relative flex-1">
            <Link2 className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
            <input value={url} onChange={(e) => setUrl(e.target.value)} type="url" dir="ltr" placeholder="https://careers.company.com/jobs/123" className="input ps-10" />
          </span>
          <button type="button" onClick={load} disabled={state === "loading"} className="btn btn-secondary h-12 shrink-0">
            {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{state === "loading" ? copy.fetching : copy.fetch}
          </button>
        </div>
        {state === "ok" && <p className="mt-2 text-[13px] text-green-deep">{copy.fetched}</p>}
        {state === "fail" && <p className="mt-2 text-[13px] text-[#b3261e]">{copy.failed}</p>}
      </div>
      <p className="text-center text-[13px] text-mist">{copy.manual}</p>
      <form key={k} action={action} className="grid gap-4 rounded-[20px] bg-white p-4 ring-1 ring-line sm:grid-cols-2 sm:p-6">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="external_url" value={p?.url ?? ""} />
        <label className="sm:col-span-2"><span className="label">{copy.jobTitle}</span><input name="title" required minLength={2} defaultValue={p?.title ?? ""} className="input" dir="auto" /></label>
        <label><span className="label">{copy.company}</span><input name="company" required defaultValue={p?.company ?? defaultCompany} className="input" dir="auto" /></label>
        <label><span className="label">{copy.location}</span><input name="location" defaultValue={p?.location ?? ""} className="input" dir="auto" /></label>
        <label><span className="label">{copy.type}</span>
          <select name="job_type" className="select" defaultValue={p?.job_type ?? "full_time"}>{Object.entries(types).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        <label><span className="label">{copy.mode}</span>
          <select name="work_mode" className="select" defaultValue={p?.work_mode ?? "hybrid"}>{Object.entries(modes).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        <label className="flex items-center gap-2 text-[14px] text-ink sm:col-span-2"><input type="checkbox" name="is_managerial" defaultChecked={p?.is_managerial ?? false} className="h-4 w-4 accent-navy" />{copy.managerial}</label>
        <label className="sm:col-span-2"><span className="label">{copy.description}</span><textarea name="description" required minLength={10} rows={7} defaultValue={p?.description ?? ""} className="textarea" dir="auto" /></label>
        <label className="sm:col-span-2"><span className="label">{copy.requirements}</span><textarea name="requirements" rows={3} className="textarea" dir="auto" /></label>
        {!p && <label className="sm:col-span-2"><span className="label">{copy.apply}</span><input name="apply_url" type="url" className="input" dir="ltr" /></label>}
        <p className="text-[12px] text-mist sm:col-span-2">{copy.note}</p>
        <div className="sm:col-span-2"><SubmitButton className="btn btn-primary btn-lg">{copy.publish}</SubmitButton></div>
      </form>
    </div>
  );
}
