"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight, UserRound, Briefcase } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { submitApplication } from "@/app/actions";
import type { SiteDict } from "@/i18n/site";
import { SubmitButton } from "../ui/client";
import { Combobox, PhoneInput, type Opt } from "./Combobox";

type Lists = { city: Opt[]; academic: Opt[]; org: Opt[]; years: Opt[]; sector: Opt[] };

function Req() { return <span className="text-[#f54e3f]"> *</span>; }
function YesNo({ name, yes, no }: { name: string; yes: string; no: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[["true", yes], ["false", no]].map(([v, l]) => (
        <label key={v} className="flex h-12 cursor-pointer items-center gap-3 rounded-[14px] border border-line px-4 text-[15px] has-[:checked]:border-navy has-[:checked]:bg-sky">
          <input type="radio" name={name} value={v} required className="h-4 w-4 accent-navy" />{l}
        </label>
      ))}
    </div>
  );
}

export function ApplicationForm({ t, locale, lists, error }: { t: SiteDict["application"]; locale: string; lists: Lists; error?: string }) {
  const [step, setStep] = useState(1);
  const step1 = useRef<HTMLDivElement>(null);
  const next = () => {
    const inputs = [...(step1.current?.querySelectorAll("input,select,textarea") ?? [])] as HTMLInputElement[];
    const bad = inputs.find((i) => !i.checkValidity());
    if (bad) { bad.reportValidity(); return; }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const maxDob = new Date(Date.now() - 18 * 365.25 * 864e5).toISOString().slice(0, 10);
  const common = { searchPh: t.search, empty: t.noResults, addLabel: t.addNew };
  return (
    <div>
      <ol className="mx-auto mb-8 flex max-w-xl items-center gap-3">
        {[t.step1, t.step2].map((l, i) => (
          <li key={l} className="flex flex-1 items-center gap-3">
            <span className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 text-[15px] font-bold", step >= i + 1 ? "border-mint bg-mint text-white" : "border-line text-mist")}>{i + 1}</span>
            <span className={clsx("text-[14px] font-semibold", step >= i + 1 ? "text-navy" : "text-mist")}>{l}</span>
            {i === 0 && <span className={clsx("h-[2px] flex-1 rounded", step > 1 ? "bg-mint" : "bg-line")} />}
          </li>
        ))}
      </ol>
      {error && <p className="mx-auto mb-5 max-w-3xl rounded-xl bg-[#fdeceb] p-3 text-center text-sm font-semibold text-[#8f1e18]">{error}</p>}
      <form action={submitApplication} className="mx-auto max-w-3xl rounded-[24px] border border-line bg-white p-5 shadow-[0_20px_50px_-30px_rgba(11,72,109,0.35)] sm:p-8">
        <input type="hidden" name="locale" value={locale} />
        <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
        <div ref={step1} className={clsx(step !== 1 && "hidden")}>
          <h2 className="mb-6 flex items-center gap-3 text-[22px] font-semibold text-ink"><span className="grid h-10 w-10 place-items-center rounded-full bg-sky text-navy"><UserRound className="h-5 w-5" /></span>{t.step1}</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block"><span className="label">{t.fullName}<Req /></span><input name="full_name" required minLength={2} maxLength={50} placeholder={t.fullNamePh} className="input h-12 rounded-[16px]" autoComplete="name" /></label>
            <label className="block"><span className="label">{t.email}<Req /></span><input name="email" type="email" required maxLength={80} placeholder={t.emailPh} className="input h-12 rounded-[16px]" dir="ltr" autoComplete="email" /></label>
            <label className="block"><span className="label">{t.phone}<Req /></span><PhoneInput name="phone" required placeholder={t.phonePh} /></label>
            <div><span className="label">{t.city}<Req /></span><Combobox name="city" options={lists.city} placeholder={t.cityPh} required allowAdd {...common} /></div>
            <label className="block"><span className="label">{t.dob}<Req /></span><input name="date_of_birth" type="date" required max={maxDob} min="1940-01-01" className="input h-12 rounded-[16px]" /></label>
            <div><span className="label">{t.academic}<Req /></span><Combobox name="academic_title" options={lists.academic} placeholder={t.academicPh} required {...common} /></div>
            <div className="sm:col-span-2">
              <span className="label">{t.gender}<Req /></span>
              <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
                {[["male", t.male], ["female", t.female]].map(([v, l]) => (
                  <label key={v} className="flex h-12 cursor-pointer items-center gap-3 rounded-[14px] border border-line px-4 has-[:checked]:border-navy has-[:checked]:bg-sky"><input type="radio" name="gender" value={v} required className="h-4 w-4 accent-navy" />{l}</label>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end border-t border-line pt-6">
            <button type="button" onClick={next} className="btn btn-primary h-12 px-7">{t.next}<ChevronLeft className="h-4 w-4 ltr:rotate-180" /></button>
          </div>
        </div>

        <div className={clsx(step !== 2 && "hidden")}>
          <h2 className="mb-6 flex items-center gap-3 text-[22px] font-semibold text-ink"><span className="grid h-10 w-10 place-items-center rounded-full bg-sky text-navy"><Briefcase className="h-5 w-5" /></span>{t.step2}</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block"><span className="label">{t.jobTitle}<Req /></span><input name="headline" required={step === 2} maxLength={60} placeholder={t.jobTitlePh} className="input h-12 rounded-[16px]" dir="auto" /></label>
            <div><span className="label">{t.company}<Req /></span><Combobox name="company" options={lists.org} placeholder={t.companyPh} required={step === 2} allowAdd {...common} /></div>
            <div><span className="label">{t.years}<Req /></span><Combobox name="years" options={lists.years} placeholder={t.yearsPh} required={step === 2} {...common} /></div>
            <div><span className="label">{t.sector}<Req /></span><Combobox name="sector" options={lists.sector} placeholder={t.sectorPh} required={step === 2} allowAdd {...common} /></div>
            <div><span className="label">{t.isManager}<Req /></span><YesNo name="is_manager" yes={t.yes} no={t.no} /></div>
            <div><span className="label">{t.mentoring}<Req /></span><YesNo name="mentoring_participated" yes={t.yes} no={t.no} /></div>
            <label className="block sm:col-span-2"><span className="label">{t.linkedin} <span className="font-normal text-mist">({t.optional})</span></span><input name="linkedin_url" type="url" placeholder="https://www.linkedin.com/in/..." className="input h-12 rounded-[16px]" dir="ltr" /></label>
            <label className="block sm:col-span-2"><span className="label">{t.motivation} <span className="font-normal text-mist">({t.optional})</span></span><textarea name="motivation" rows={3} maxLength={1000} placeholder={t.motivationPh} className="textarea rounded-[16px]" /></label>
            <label className="flex items-center gap-2.5 text-[15px] sm:col-span-2">
              <input type="checkbox" name="privacy" required={step === 2} className="h-4 w-4 accent-navy" />
              {t.privacy} <Link href={`/${locale}/policy`} target="_blank" className="font-semibold text-navy underline">{t.privacyLink}</Link><Req />
            </label>
          </div>
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
            <button type="button" onClick={() => setStep(1)} className="btn btn-outline h-12 px-6"><ChevronRight className="h-4 w-4 ltr:rotate-180" />{t.prev}</button>
            <SubmitButton className="btn btn-primary h-12 px-8">{t.submit}</SubmitButton>
          </div>
        </div>
      </form>
    </div>
  );
}
