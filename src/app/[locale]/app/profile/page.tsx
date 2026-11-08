import Link from "next/link";
import { saveProfile } from "@/app/actions";
import { Avatar, Check, Field, Notice, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import { displayName } from "@/lib/format";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function Profile({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  const v = await requireMember(locale);
  const P = t.app.profile;
  const N = {
    ar: { title: "الإشعارات", email: "أرسلوا لي إشعارات بالبريد الإلكتروني", wa: "أرسلوا لي إشعارات عبر واتساب", hint: "طلبات التواصل، الوظائف، الفعاليات والتذكيرات. الإشعارات داخل المنصة تبقى دائمًا." },
    en: { title: "Notifications", email: "Send me email notifications", wa: "Send me WhatsApp notifications", hint: "Connection requests, jobs, events and reminders. In-app notifications always stay on." },
    he: { title: "התראות", email: "שלחו לי התראות במייל", wa: "שלחו לי התראות בוואטסאפ", hint: "בקשות קשר, משרות, אירועים ותזכורות. ההתראות במערכת תמיד פעילות." },
  }[locale];
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={P.title} sub={P.sub} />
      {sp((await searchParams).saved) ? <Notice>{t.common.saved}</Notice> : null}
      <form action={saveProfile} className="space-y-6">
        <input type="hidden" name="locale" value={locale} />
        <div className="card flex flex-wrap items-center gap-5 p-6">
          <Avatar src={v.avatar_url} name={displayName(v, locale)} size={88} />
          <Field label={P.avatar} className="min-w-60 flex-1" hint="https://…"><input name="avatar_url" defaultValue={v.avatar_url ?? ""} className="input" dir="ltr" /></Field>
        </div>
        <div className="card grid gap-4 p-6 sm:grid-cols-2">
          <Field label={P.nameAr}><input name="full_name_ar" defaultValue={v.full_name_ar} className="input" dir="rtl" /></Field>
          <Field label={P.nameEn}><input name="full_name_en" defaultValue={v.full_name_en} className="input" dir="ltr" /></Field>
          <Field label={t.common.headline}><input name="headline" defaultValue={v.headline ?? ""} className="input" dir="auto" /></Field>
          <Field label={t.common.company}><input name="company" defaultValue={v.company ?? ""} className="input" dir="auto" /></Field>
          <Field label={t.common.sector}><input name="sector" defaultValue={v.sector ?? ""} className="input" dir="auto" /></Field>
          <Field label={t.common.city}><input name="city" defaultValue={v.city ?? ""} className="input" /></Field>
          <Field label={t.common.years}><input name="years_experience" type="number" min={0} max={60} defaultValue={v.years_experience ?? ""} className="input" dir="ltr" /></Field>
          <Field label={t.common.linkedin}><input name="linkedin_url" type="url" defaultValue={v.linkedin_url ?? ""} className="input" dir="ltr" /></Field>
          <Field label={P.bio} className="sm:col-span-2"><textarea name="bio" rows={4} defaultValue={v.bio ?? ""} className="textarea" dir="auto" /></Field>
          <Field label={P.goals} hint={P.goalsHint}><input name="career_goals" defaultValue={v.career_goals.join(", ")} className="input" dir="auto" /></Field>
          <Field label={P.interests}><input name="interests" defaultValue={v.interests.join(", ")} className="input" dir="auto" /></Field>
        </div>
        <div className="card grid gap-4 p-6">
          <Field label={t.common.phone} hint={P.phoneHint}><input name="phone" type="tel" defaultValue={v.phone ?? ""} className="input" dir="ltr" /></Field>
          <Check name="show_phone_to_connections" label={P.showPhone} defaultChecked={v.show_phone_to_connections} />
          <Check name="open_to_mentoring" label={P.mentoring} defaultChecked={v.open_to_mentoring} />
        </div>
        <div className="card grid gap-3 p-6">
          <p className="font-black">{N.title}</p>
          <Check name="notify_email" label={N.email} defaultChecked={v.notify_email !== false} />
          <Check name="notify_whatsapp" label={N.wa} defaultChecked={v.notify_whatsapp !== false} />
          <p className="text-xs text-mist">{N.hint}</p>
        </div>
        <div className="flex gap-2">
          <SubmitButton className="btn btn-primary btn-lg">{t.common.save}</SubmitButton>
          <Link href={`/${locale}/app`} className="btn btn-ghost btn-lg">{t.common.cancel}</Link>
        </div>
      </form>
    </div>
  );
}
