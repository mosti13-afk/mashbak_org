"use client";

import clsx from "clsx";
import { Bell, Briefcase, ChevronLeft, ChevronRight, Mail, MessageCircle, Smartphone, UserRound } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { submitApplication } from "@/app/actions";
import type { SiteDict } from "@/i18n/site";
import { SubmitButton } from "../ui/client";
import { Combobox, PhoneInput, type Opt } from "./Combobox";

type Lists = { city: Opt[]; academic: Opt[]; org: Opt[]; years: Opt[]; sector: Opt[] };

function Req() { return <span className="text-[#c0392b]"> *</span>; }

const CH = {
  ar: { step3: "التواصل", title: "كيف تفضّل أن نتواصل معك؟", sub: "سنبلغك بقرار طلبك عبر القنوات التي تختارها، ويمكنك تغييرها لاحقًا من إعدادات حسابك.",
    email: "البريد الإلكتروني", emailHint: "قرار الطلب وتفاصيل الدخول. لا يمكن إيقافه.", wa: "واتساب", waHint: "تحديثات الطلب، طلبات التوصية والتذكيرات.", sms: "رسائل نصية", smsHint: "تذكيرات قصيرة فقط، لمن لا يستخدم واتساب.",
    consent: "أوافق على تلقي رسائل من مشبك عبر القنوات التي اخترتها." },
  en: { step3: "Contact", title: "How would you like us to reach you?", sub: "We'll share the decision on the channels you choose. You can change them later in your account settings.",
    email: "Email", emailHint: "Application decision and sign-in details. Always on.", wa: "WhatsApp", waHint: "Application updates, referral requests and reminders.", sms: "Text messages", smsHint: "Short reminders only, if you don't use WhatsApp.",
    consent: "I agree to receive messages from Mashbak on the channels I selected." },
  he: { step3: "יצירת קשר", title: "איך נוח לך שניצור קשר?", sub: "נעדכן על ההחלטה בערוצים שתבחרו. אפשר לשנות אותם בהמשך בהגדרות החשבון.",
    email: "מייל", emailHint: "החלטה על הבקשה ופרטי כניסה. תמיד פעיל.", wa: "וואטסאפ", waHint: "עדכונים על הבקשה, בקשות המלצה ותזכורות.", sms: "מסרונים", smsHint: "תזכורות קצרות בלבד, למי שלא משתמש בוואטסאפ.",
    consent: "אני מסכים/ה לקבל הודעות ממשבק בערוצים שבחרתי." },
};

function Channel({ name, icon, title, hint, defaultChecked, locked }: { name: string; icon: React.ReactNode; title: string; hint: string; defaultChecked?: boolean; locked?: boolean }) {
  return (
    <label className={clsx("flex items-start gap-3 rounded-[18px] border border-line p-4 transition-colors has-[:checked]:border-navy has-[:checked]:bg-sky", locked ? "cursor-default" : "cursor-pointer")}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-mint-soft text-navy">{icon}</span>
      <span className="min-w-0 flex-1"><span className="block font-bold text-ink">{title}</span><span className="mt-0.5 block text-[13px] leading-6 text-mist">{hint}</span></span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} disabled={locked} className="mt-1 h-5 w-5 shrink-0 accent-navy" />
    </label>
  );
}
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
  const refs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const c = CH[(locale in CH ? locale : "ar") as keyof typeof CH];
  const go = (n: number) => {
    if (n > step) {
      const inputs = [...(refs[step - 1]?.current?.querySelectorAll("input,select,textarea") ?? [])] as HTMLInputElement[];
      const bad = inputs.find((i) => !i.checkValidity());
      if (bad) { bad.reportValidity(); return; }
    }
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const maxDob = new Date(Date.now() - 18 * 365.25 * 864e5).toISOString().slice(0, 10);
  const common = { searchPh: t.search, empty: t.noResults, addLabel: t.addNew };
  return (
    <div>
      <ol className="mb-6 grid grid-cols-3 gap-2" aria-label={`${step} / 3`}>
        {[t.step1, t.step2, c.step3].map((l, i) => (
          <li key={l} className="min-w-0">
            <span className={clsx("block h-1.5 rounded-full transition-colors", step >= i + 1 ? "bg-navy" : "bg-haze")} />
            <span className={clsx("mt-2 block truncate text-[13px]", step === i + 1 ? "font-bold text-navy" : step > i + 1 ? "text-ink-2" : "text-mist")}>{i + 1}. {l}</span>
          </li>
        ))}
      </ol>
      {error && <p role="alert" className="mb-5 rounded-[14px] bg-[#fdeceb] p-3 text-sm font-bold text-[#8f1e18]">{error}</p>}
      <form action={submitApplication} className="rounded-[24px] bg-white p-5 ring-1 ring-line sm:p-8">
        <input type="hidden" name="locale" value={locale} />
        <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
        <div ref={refs[0]} className={clsx(step !== 1 && "hidden")}>
          <h2 className="mb-6 flex items-center gap-3 t-h2"><span className="grid h-10 w-10 place-items-center rounded-[12px] bg-mint-soft text-navy"><UserRound className="h-5 w-5" /></span>{t.step1}</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block"><span className="label">{t.fullName}<Req /></span><input name="full_name" required minLength={2} maxLength={50} placeholder={t.fullNamePh} className="input" autoComplete="name" /></label>
            <label className="block"><span className="label">{t.email}<Req /></span><input name="email" type="email" required maxLength={80} placeholder={t.emailPh} className="input" dir="ltr" autoComplete="email" /></label>
            <label className="block"><span className="label">{t.phone}<Req /></span><PhoneInput name="phone" required placeholder={t.phonePh} /></label>
            <div><span className="label">{t.city}<Req /></span><Combobox name="city" options={lists.city} placeholder={t.cityPh} required allowAdd {...common} /></div>
            <label className="block"><span className="label">{t.dob}<Req /></span><input name="date_of_birth" type="date" required max={maxDob} min="1940-01-01" className="input" /></label>
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
            <button type="button" onClick={() => go(2)} className="btn btn-primary btn-lg">{t.next}<ChevronLeft className="h-4 w-4 ltr:rotate-180" /></button>
          </div>
        </div>

        <div ref={refs[1]} className={clsx(step !== 2 && "hidden")}>
          <h2 className="mb-6 flex items-center gap-3 t-h2"><span className="grid h-10 w-10 place-items-center rounded-[12px] bg-mint-soft text-navy"><Briefcase className="h-5 w-5" /></span>{t.step2}</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block"><span className="label">{t.jobTitle}<Req /></span><input name="headline" required={step === 2} maxLength={60} placeholder={t.jobTitlePh} className="input" dir="auto" /></label>
            <div><span className="label">{t.company}<Req /></span><Combobox name="company" options={lists.org} placeholder={t.companyPh} required={step === 2} allowAdd {...common} /></div>
            <div><span className="label">{t.years}<Req /></span><Combobox name="years" options={lists.years} placeholder={t.yearsPh} required={step === 2} {...common} /></div>
            <div><span className="label">{t.sector}<Req /></span><Combobox name="sector" options={lists.sector} placeholder={t.sectorPh} required={step === 2} allowAdd {...common} /></div>
            <div><span className="label">{t.isManager}<Req /></span><YesNo name="is_manager" yes={t.yes} no={t.no} /></div>
            <div><span className="label">{t.mentoring}<Req /></span><YesNo name="mentoring_participated" yes={t.yes} no={t.no} /></div>
            <label className="block sm:col-span-2"><span className="label">{t.linkedin} <span className="font-normal text-mist">({t.optional})</span></span><input name="linkedin_url" type="url" placeholder="https://www.linkedin.com/in/..." className="input" dir="ltr" /></label>
          </div>
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
            <button type="button" onClick={() => go(1)} className="btn btn-outline btn-lg"><ChevronRight className="h-4 w-4 ltr:rotate-180" />{t.prev}</button>
            <button type="button" onClick={() => go(3)} className="btn btn-primary btn-lg">{t.next}<ChevronLeft className="h-4 w-4 ltr:rotate-180" /></button>
          </div>
        </div>

        <div className={clsx(step !== 3 && "hidden")}>
          <h2 className="flex items-center gap-3 t-h2"><span className="grid h-10 w-10 place-items-center rounded-[12px] bg-mint-soft text-navy"><Bell className="h-5 w-5" /></span>{c.title}</h2>
          <p className="mt-2 text-[15px] leading-7 text-ink-2">{c.sub}</p>
          <div className="mt-5 grid gap-3">
            <Channel name="email_locked" icon={<Mail className="h-5 w-5" />} title={c.email} hint={c.emailHint} defaultChecked locked />
            <Channel name="whatsapp_opt_in" icon={<MessageCircle className="h-5 w-5" />} title={c.wa} hint={c.waHint} defaultChecked />
            <Channel name="sms_opt_in" icon={<Smartphone className="h-5 w-5" />} title={c.sms} hint={c.smsHint} />
          </div>
          <div className="mt-6 grid gap-5">
            <label className="block "><span className="label">{t.motivation} <span className="font-normal text-mist">({t.optional})</span></span><textarea name="motivation" rows={3} maxLength={1000} placeholder={t.motivationPh} className="textarea" /></label>
            <label className="flex items-center gap-2.5 text-[15px] ">
              <input type="checkbox" name="privacy" required={step === 3} className="h-4 w-4 accent-navy" />
              {t.privacy} <Link href={`/${locale}/policy`} target="_blank" className="font-semibold text-navy underline">{t.privacyLink}</Link><Req />
            </label>
            <label className="flex items-start gap-2.5 text-[15px]">
              <input type="checkbox" name="channels_consent" required={step === 3} className="mt-1 h-4 w-4 accent-navy" />
              <span>{c.consent}<Req /></span>
            </label>
          </div>
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
            <button type="button" onClick={() => go(2)} className="btn btn-outline btn-lg"><ChevronRight className="h-4 w-4 ltr:rotate-180" />{t.prev}</button>
            <SubmitButton className="btn btn-primary btn-lg">{t.submit}</SubmitButton>
          </div>
        </div>
      </form>
    </div>
  );
}
