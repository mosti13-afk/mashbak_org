"use client";

import clsx from "clsx";
import { Check, ChevronDown, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type Opt = { value: string; label: string };

/** Searchable select (Arabic-friendly search). With `allowAdd`, unknown values can be typed in; they're
 * saved as suggestions that an admin approves before they appear for everyone (bug report #7). */
export function Combobox({ name, options, placeholder, required, allowAdd, defaultValue, searchPh, empty, addLabel, multiple, max }: {
  name: string; options: Opt[]; placeholder: string; required?: boolean; allowAdd?: boolean; defaultValue?: string | string[];
  searchPh: string; empty: string; addLabel: string; multiple?: boolean; max?: number;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const init = Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : [];
  const [vals, setVals] = useState<string[]>(init);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const norm = (s: string) => s.toLowerCase().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").trim();
  const list = useMemo(() => options.filter((o) => !q || norm(o.label).includes(norm(q)) || norm(o.value).includes(norm(q))), [options, q]);
  const exact = options.some((o) => norm(o.label) === norm(q));
  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v;
  const pick = (v: string) => {
    if (multiple) setVals((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : max && cur.length >= max ? cur : [...cur, v]));
    else { setVals([v]); setOpen(false); }
    setQ("");
  };
  return (
    <div ref={box} className="relative">
      {multiple ? vals.map((v) => <input key={v} type="hidden" name={name} value={v} />) : <input type="hidden" name={name} value={vals[0] ?? ""} />}
      {required && <input tabIndex={-1} aria-hidden className="pointer-events-none absolute inset-0 opacity-0" required value={vals.length ? "1" : ""} onChange={() => {}} />}
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="input flex h-12 items-center justify-between gap-2 rounded-[16px] text-start">
        <span className={clsx("truncate", !vals.length && "text-mist")}>{vals.length ? vals.map(labelOf).join("، ") : placeholder}</span>
        <ChevronDown className={clsx("h-4 w-4 shrink-0 text-mist transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-30 mt-1 rounded-[14px] border border-line bg-white p-2 shadow-[0_20px_40px_-20px_rgba(11,72,109,0.4)]">
          <label className="relative block">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPh} className="input h-10 ps-9" />
          </label>
          <ul className="mt-1 max-h-60 overflow-y-auto" role="listbox">
            {list.map((o) => (
              <li key={o.value}>
                <button type="button" onClick={() => pick(o.value)} className="flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-start text-[15px] hover:bg-sky">
                  {o.label}{vals.includes(o.value) && <Check className="h-4 w-4 text-mint" />}
                </button>
              </li>
            ))}
            {allowAdd && q.trim() && !exact ? (
              <li><button type="button" onClick={() => pick(q.trim())} className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-start text-[15px] font-semibold text-navy hover:bg-sky"><Plus className="h-4 w-4" />{addLabel}: {q.trim()}</button></li>
            ) : !list.length ? <li className="px-3 py-2 text-sm text-mist">{empty}</li> : null}
          </ul>
        </div>
      )}
    </div>
  );
}

const PRIORITY = [["972", "Israel · إسرائيل"], ["970", "Palestine · فلسطين"], ["962", "Jordan · الأردن"]];
const OTHERS = [["20", "Egypt"], ["971", "UAE"], ["966", "Saudi Arabia"], ["974", "Qatar"], ["965", "Kuwait"], ["973", "Bahrain"], ["968", "Oman"], ["961", "Lebanon"], ["49", "Germany"], ["44", "United Kingdom"], ["1", "USA / Canada"], ["33", "France"], ["31", "Netherlands"], ["90", "Türkiye"]];

/** Phone with country code; +972 and +970 first, codes shown left-to-right (bug report #6). */
export function PhoneInput({ name, placeholder, required, defaultValue }: { name: string; placeholder: string; required?: boolean; defaultValue?: string }) {
  const [code, setCode] = useState("972");
  const [num, setNum] = useState(defaultValue ?? "");
  const full = num ? `+${code}${num.replace(/\D/g, "").replace(/^0/, "")}` : "";
  return (
    <div className="flex gap-2" dir="ltr">
      <input type="hidden" name={name} value={full} />
      <select value={code} onChange={(e) => setCode(e.target.value)} className="select h-12 w-28 shrink-0 rounded-[16px]" aria-label="country code">
        {[...PRIORITY, ...OTHERS].map(([c, n]) => <option key={c + n} value={c}>+{c} {n.split(" · ")[0]}</option>)}
      </select>
      <input type="tel" inputMode="tel" required={required} value={num} onChange={(e) => setNum(e.target.value)} placeholder={placeholder} className="input h-12 rounded-[16px]" autoComplete="tel-national" />
    </div>
  );
}
