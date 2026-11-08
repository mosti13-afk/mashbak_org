import { Mail, MessageCircle } from "lucide-react";
import { submitContact } from "@/app/actions";
import { Field, Notice, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import { repo } from "@/lib/data";
import { waLink } from "@/lib/format";
import { pageLocale, sp, type SearchParams } from "@/lib/page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { t } = await pageLocale(params);
  return { title: t.nav.contact };
}

export default async function Contact({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  const q = await searchParams;
  const s = await repo.getSettings();
  return (
    <div className="container-x grid gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_1.3fr]">
      <div>
        <PageHeader title={t.contact.title} sub={t.contact.sub} />
        <div className="space-y-3">
          {s.contact.email && (
            <a href={`mailto:${s.contact.email}`} className="card card-hover flex items-center gap-4 p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mint-soft text-green-deep"><Mail className="h-5 w-5" /></span>
              <span><span className="block text-xs font-bold text-mist">{t.contact.emailUs}</span><span className="font-black" dir="ltr">{s.contact.email}</span></span>
            </a>
          )}
          {s.contact.whatsapp && (
            <a href={waLink(s.contact.whatsapp, "")} target="_blank" rel="noreferrer" className="card card-hover flex items-center gap-4 p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mint-soft text-green-deep"><MessageCircle className="h-5 w-5" /></span>
              <span><span className="block text-xs font-bold text-mist">WhatsApp</span><span className="font-black" dir="ltr">{s.contact.whatsapp}</span></span>
            </a>
          )}
        </div>
      </div>
      <div className="card p-6 sm:p-8">
        {sp(q.ok) ? <Notice>{t.contact.sent}</Notice> : null}
        {sp(q.error) ? <Notice tone="red">{t.apply.motivationHint}</Notice> : null}
        <form action={submitContact} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="locale" value={locale} />
          <Field label={t.common.name}><input name="name" required className="input" autoComplete="name" /></Field>
          <Field label={t.common.email}><input name="email" type="email" required className="input" dir="ltr" autoComplete="email" /></Field>
          <Field label={`${t.common.phone} (${t.common.optional})`}><input name="phone" type="tel" className="input" dir="ltr" autoComplete="tel" /></Field>
          <Field label={t.contact.subject}><input name="subject" className="input" /></Field>
          <Field label={t.common.message} className="sm:col-span-2"><textarea name="message" required rows={6} className="textarea" /></Field>
          <div className="sm:col-span-2"><SubmitButton className="btn btn-primary btn-lg">{t.common.send}</SubmitButton></div>
        </form>
      </div>
    </div>
  );
}
