import { BadgeCheck, Check, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { PageHero } from "@/components/site/sections";
import { siteDict } from "@/i18n/site";
import { repo } from "@/lib/data";
import { optionsFor } from "@/lib/dropdowns";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { getViewer } from "@/lib/session";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await pageLocale(params);
  return { title: siteDict[locale].apply };
}

export default async function Application({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale } = await pageLocale(params);
  const t = siteDict[locale];
  const q = await searchParams;
  const viewer = await getViewer();
  if (viewer && (viewer.status === "active" || viewer.role === "admin")) redirect(`/${locale}/app`); // bug report #8

  if (sp(q.ok)) {
    const S = {
      ar: { steps: ["استلمنا طلبك", "يراجع فريق مشبك الطلب خلال أيام العمل القريبة", "نبلغك بالقرار وبتفاصيل الدخول"], preview: "هكذا ستصلك رسائلنا", wa: "واتساب", now: "الآن", msg: "مشبك: استلمنا طلب انضمامك وسنبلغك بالقرار قريبًا." },
      en: { steps: ["We received your application", "The Mashbak team reviews it in the coming working days", "We share the decision and your sign-in details"], preview: "How our messages will reach you", wa: "WhatsApp", now: "now", msg: "Mashbak: we received your application and will share the decision soon." },
      he: { steps: ["קיבלנו את הבקשה", "צוות משבק בודק אותה בימי העבודה הקרובים", "נעדכן על ההחלטה ועל פרטי הכניסה"], preview: "כך יגיעו אליך ההודעות שלנו", wa: "וואטסאפ", now: "עכשיו", msg: "משבק: קיבלנו את בקשת ההצטרפות ונעדכן על ההחלטה בקרוב." },
    }[locale];
    return (
      <div className="container-x max-w-3xl py-10 sm:py-16">
        <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-mint-soft text-green-deep"><BadgeCheck className="h-7 w-7" /></span>
        <h1 className="mt-5 t-h1">{t.application.successTitle}</h1>
        <p className="mt-2 text-[17px] leading-8 text-ink-2">{t.application.successBody}</p>
        <ol className="mt-8 space-y-0">
          {S.steps.map((x, i) => (
            <li key={x} className="relative flex gap-4 pb-6 last:pb-0">
              {i < S.steps.length - 1 && <span className="absolute start-[15px] top-8 h-[calc(100%-24px)] w-px bg-line" aria-hidden />}
              <span className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full text-[14px] font-bold ${i === 0 ? "bg-mint text-white" : "bg-haze text-mist"}`}>{i === 0 ? <Check className="h-4 w-4" /> : i + 1}</span>
              <span className={`pt-1 text-[16px] ${i === 0 ? "font-bold text-ink" : "text-ink-2"}`}>{x}</span>
            </li>
          ))}
        </ol>
        <section className="mt-10 rounded-[24px] bg-sky p-5 sm:p-6">
          <h2 className="text-[16px] font-bold text-navy-ink">{S.preview}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[18px] bg-white p-4 ring-1 ring-line">
              <p className="flex items-center gap-2 text-[13px] text-mist"><Mail className="h-4 w-4" />info@mashbak.org</p>
              <p className="mt-2 font-bold text-ink">{t.application.successTitle}</p>
            </div>
            <div className="rounded-[18px] bg-white p-4 ring-1 ring-line">
              <p className="flex items-center justify-between text-[13px] text-mist"><span className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-green-deep" />{S.wa}</span><span>{S.now}</span></p>
              <p className="mt-2 text-[14px] leading-6 text-ink">{S.msg}</p>
            </div>
          </div>
        </section>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/${locale}/our_programs`} className="btn btn-primary">{t.nav.programs}</Link>
          <Link href={`/${locale}`} className="btn btn-ghost">{t.nav.backHome}</Link>
        </div>
      </div>
    );
  }
  const dd = await repo.listDropdowns();
  const lists = {
    city: optionsFor(dd, "CITY", locale), academic: optionsFor(dd, "ACADEMIC_TITLE", locale), org: optionsFor(dd, "ORGANIZATION", locale),
    years: optionsFor(dd, "YEARS_OF_EXPERIENCE", locale), sector: optionsFor(dd, "WORK_SECTOR", locale),
  };
  const err = sp(q.error);
  const error = err === "age" ? t.application.ageError : err === "dup" ? t.application.duplicate : err ? t.application.error : undefined;
  return (
    <>
      <PageHero narrow a={t.application.titleA} b={t.application.titleB} sub={t.application.sub} />
      <section className="container-x max-w-3xl pb-16"><ApplicationForm t={t.application} locale={locale} lists={lists} error={error} /></section>
    </>
  );
}
