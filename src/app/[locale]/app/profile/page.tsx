import type { ReactNode } from "react";
import { saveProfile } from "@/app/actions";
import Link from "next/link";
import { BackLink, Chevron, PageTitle } from "@/components/shell/page";
import { Avatar, Notice } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import { ProfileWriter } from "@/components/app/ProfileWriter";
import { memberDict } from "@/i18n/member";
import { shellDict } from "@/i18n/shell";
import { repo } from "@/lib/data";
import { displayName } from "@/lib/format";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="list-label">{title}</h2>
      <div className="space-y-4 rounded-[20px] bg-white p-4 ring-1 ring-line sm:p-5">{children}</div>
    </section>
  );
}
function F({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="block"><span className="label">{label}</span>{children}{hint && <span className="hint block">{hint}</span>}</label>;
}
function Toggle({ name, label, on }: { name: string; label: string; on: boolean }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span className="text-[15px] text-ink">{label}</span>
      <input type="checkbox" name={name} defaultChecked={on} className="peer sr-only" />
      <span className="relative h-7 w-12 shrink-0 rounded-full bg-haze transition-colors after:absolute after:start-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:bg-navy peer-checked:after:start-6 peer-focus-visible:ring-2 peer-focus-visible:ring-mint" />
    </label>
  );
}

export default async function Profile({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  const P = t.app.profile;
  const M = memberDict[locale];
  const S = shellDict[locale];
  const v = await requireMember(locale);
  const companies = await repo.listCompanies({ viewerId: v.id });
  const G = {
    ar: { basics: "الأساسيات", work: "العمل", help: "كيف تساعد الآخرين", about: "عنك", contact: "التواصل", notify: "الإشعارات", email: "إشعارات بالبريد الإلكتروني", wa: "إشعارات عبر واتساب", save: "حفظ التغييرات" },
    en: { basics: "Basics", work: "Work", help: "How you help others", about: "About you", contact: "Contact", notify: "Notifications", email: "Email notifications", wa: "WhatsApp notifications", save: "Save changes" },
    he: { basics: "פרטים בסיסיים", work: "עבודה", help: "איך את/ה עוזר/ת לאחרים", about: "עליך", contact: "יצירת קשר", notify: "התראות", email: "התראות במייל", wa: "התראות בוואטסאפ", save: "שמירת שינויים" },
  }[locale];
  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href={`/${locale}/app/account`} label={S.account} />
      <PageTitle title={S.acc.editProfile} sub={P.sub} />
      {sp((await searchParams).saved) ? <Notice>{t.common.saved}</Notice> : null}
      <form action={saveProfile} id="edit" className="pb-24 lg:pb-0">
        <input type="hidden" name="locale" value={locale} />
        <Group title={G.basics}>
          <div className="flex items-center gap-4">
            <Avatar src={v.avatar_url} name={displayName(v, locale)} size={64} />
            <div className="flex-1"><F label={P.avatar}><input name="avatar_url" defaultValue={v.avatar_url ?? ""} className="input" dir="ltr" placeholder="https://" /></F></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label={P.nameAr}><input name="full_name_ar" defaultValue={v.full_name_ar} className="input" dir="rtl" /></F>
            <F label={P.nameEn}><input name="full_name_en" defaultValue={v.full_name_en} className="input" dir="ltr" /></F>
          </div>
        </Group>
        <Group title={G.work}>
          <F label={t.common.headline}><input name="headline" defaultValue={v.headline ?? ""} className="input" dir="auto" /></F>
          <F label={M.profile.company} hint={M.profile.companyHint}>
            <input name="company" list="mb-companies" defaultValue={v.company ?? ""} className="input" dir="auto" autoComplete="off" />
            <datalist id="mb-companies">{companies.map((c) => <option key={c.id} value={c.name}>{[c.name_ar, c.name_he].filter(Boolean).join(" · ")}</option>)}</datalist>
          </F>
          <div className="grid gap-4 sm:grid-cols-3">
            <F label={t.common.sector}><input name="sector" defaultValue={v.sector ?? ""} className="input" dir="auto" /></F>
            <F label={t.common.city}><input name="city" defaultValue={v.city ?? ""} className="input" dir="auto" /></F>
            <F label={t.common.years}><input name="years_experience" type="number" min={0} max={60} defaultValue={v.years_experience ?? ""} className="input" dir="ltr" /></F>
          </div>
          <F label={t.common.linkedin}><input name="linkedin_url" type="url" defaultValue={v.linkedin_url ?? ""} className="input" dir="ltr" placeholder="https://linkedin.com/in/" /></F>
          <F label={M.profile.cv}><input name="cv_url" type="url" defaultValue={v.cv_url ?? ""} className="input" dir="ltr" placeholder="https://drive.google.com/" /></F>
        </Group>
        <Group title={G.help}>
          <F label={M.profile.help} hint={M.profile.helpHint}><input name="help_offers" defaultValue={(v.help_offers ?? []).join(", ")} className="input" dir="auto" /></F>
          <Toggle name="open_to_referrals" label={M.profile.referrals} on={v.open_to_referrals !== false} />
          <Toggle name="open_to_chats" label={M.profile.chats} on={v.open_to_chats !== false} />
          <Toggle name="open_to_mentoring" label={P.mentoring} on={v.open_to_mentoring} />
        </Group>
        <Group title={G.about}>
          <ProfileWriter locale={locale} />
          <F label={P.bio}><textarea name="bio" rows={4} defaultValue={v.bio ?? ""} className="textarea" dir="auto" /></F>
          <F label={P.goals} hint={P.goalsHint}><input name="career_goals" defaultValue={v.career_goals.join(", ")} className="input" dir="auto" /></F>
          <F label={P.interests}><input name="interests" defaultValue={v.interests.join(", ")} className="input" dir="auto" /></F>
        </Group>
        <Group title={G.contact}>
          <F label={t.common.phone} hint={P.phoneHint}><input name="phone" type="tel" defaultValue={v.phone ?? ""} className="input" dir="ltr" /></F>
          <Toggle name="show_phone_to_connections" label={P.showPhone} on={v.show_phone_to_connections} />
        </Group>
        <Link href={`/${locale}/app/account/notifications`} className="row mt-6 rounded-[20px] bg-white ring-1 ring-line">
          <span className="min-w-0 flex-1"><span className="row-title">{G.notify}</span></span><Chevron />
        </Link>
        <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-20 border-t border-line bg-white/95 p-3 backdrop-blur lg:static lg:mt-6 lg:border-0 lg:bg-transparent lg:p-0">
          <SubmitButton className="btn btn-primary btn-lg w-full lg:w-auto">{G.save}</SubmitButton>
        </div>
      </form>
    </div>
  );
}
