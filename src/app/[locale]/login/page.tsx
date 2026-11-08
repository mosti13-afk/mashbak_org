import { ArrowRight, LogIn, Mail, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { demoLogin, logout, oauthLogin, resetLogin, sendLoginCode, verifyLoginCode } from "@/app/actions";
import { SocialIcon } from "@/components/site/Social";
import { SubmitButton } from "@/components/ui/client";
import { siteDict } from "@/i18n/site";
import { isDemo } from "@/lib/env";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { getViewer } from "@/lib/session";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await pageLocale(params);
  return { title: siteDict[locale].login.title };
}

const GoogleG = () => (
  <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" />
  </svg>
);

export default async function Login({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  const L = siteDict[locale].login;
  const N = siteDict[locale].nav;
  const q = await searchParams;
  const viewer = await getViewer();
  if (viewer && (viewer.status === "active" || viewer.role === "admin")) redirect(`/${locale}/${viewer.role === "admin" ? "admin" : "app"}`);
  const pendingEmail = (await cookies()).get("mb_login_email")?.value;
  const step = sp(q.step) === "code" && pendingEmail ? "code" : "email";
  const err = sp(q.error);
  const errText = err === "notfound" ? L.notFound : err === "code" ? L.badCode : err ? t.login.error : null;
  const hidden = <input type="hidden" name="locale" value={locale} />;

  return (
    <main className="min-h-dvh bg-white pb-16">
      <div className="container-x flex items-center justify-between py-4">
        <Link href={`/${locale}`} className="flex items-center gap-3 text-[15px] text-ink-2 hover:text-navy">
          <span className="grid h-8 w-8 place-items-center rounded-full border border-mint text-navy"><ArrowRight className="h-4 w-4 ltr:rotate-180" /></span>
          {N.back}
        </Link>
      </div>

      <div className="container-x mx-auto max-w-[830px] pt-6 text-center sm:pt-12">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-navy-deep/60 bg-mint-soft px-3.5 py-1 text-[15px] text-navy-deep">
          <ShieldCheck className="h-4 w-4 text-mint" />{L.badge}
        </span>
        <h1 className="mt-6 text-[34px] font-semibold text-ink sm:text-[44px]">{L.heading}</h1>

        <section className="relative mt-10 overflow-hidden rounded-[32px] border border-[#F3F4F6] bg-white px-5 py-10 text-start shadow-[0_10px_30px_rgba(0,0,0,0.05)] sm:px-12">
          <span className="pointer-events-none absolute -end-10 -top-10 h-32 w-32 rounded-full bg-haze/50" aria-hidden />
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-[20px] bg-mint-soft text-mint"><LogIn className="h-8 w-8 rtl:rotate-180" strokeWidth={1.8} /></span>
          <h2 className="mt-5 text-center text-[24px] font-semibold text-ink">{L.title}</h2>

          {viewer && viewer.status !== "active" && (
            <div className="mx-auto mt-6 max-w-md rounded-2xl bg-mint-soft p-5 text-center">
              <p className="font-bold text-navy">{L.pendingTitle}</p>
              <p className="mt-1 text-[15px] text-ink-2">{L.pendingBody}</p>
              <form action={logout} className="mt-3">{hidden}<SubmitButton className="btn btn-outline btn-sm">{t.common.logout}</SubmitButton></form>
            </div>
          )}

          <div className="mx-auto mt-6 max-w-[460px]">
            {errText && <p role="alert" className="mb-4 rounded-xl bg-[#fdecea] px-4 py-3 text-[14px] text-[#b3261e]">{errText}</p>}

            {isDemo ? (
              <div className="grid gap-3">
                <form action={demoLogin}>{hidden}<input type="hidden" name="as" value="member" />
                  <SubmitButton className="btn btn-primary btn-lg w-full"><UserRound className="h-4 w-4" />{t.login.demoMember}</SubmitButton></form>
                <form action={demoLogin}>{hidden}<input type="hidden" name="as" value="admin" />
                  <SubmitButton className="btn btn-outline btn-lg w-full"><ShieldCheck className="h-4 w-4" />{t.login.demoAdmin}</SubmitButton></form>
              </div>
            ) : step === "email" ? (
              <>
                <div className="my-2 flex items-center gap-3 text-[13px] text-mist"><span className="h-px flex-1 bg-line" />{L.viaEmail}<span className="h-px flex-1 bg-line" /></div>
                <form action={sendLoginCode} className="mt-5 space-y-5">
                  {hidden}
                  <label className="block">
                    <span className="mb-2 block text-[16px] text-ink">{L.email} <span className="text-[#e53935]">*</span></span>
                    <span className="flex items-center gap-2 rounded-[14px] border border-line px-3 focus-within:border-navy">
                      <Mail className="h-5 w-5 shrink-0 text-mist" />
                      <input name="email" type="email" required autoComplete="email" inputMode="email" dir="ltr" placeholder={L.emailPh}
                        className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-mist rtl:text-right" />
                    </span>
                  </label>
                  <SubmitButton className="btn btn-primary btn-lg mx-auto flex w-full sm:w-[300px]">{L.sendCode}</SubmitButton>
                </form>
                <div className="my-6 flex items-center gap-3 text-[13px] text-mist"><span className="h-px flex-1 bg-line" />{L.or}<span className="h-px flex-1 bg-line" /></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <form action={oauthLogin}>{hidden}<input type="hidden" name="provider" value="google" />
                    <SubmitButton className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-line bg-white text-[15px] font-medium text-ink transition hover:border-navy"><GoogleG />{L.google}</SubmitButton></form>
                  <form action={oauthLogin}>{hidden}<input type="hidden" name="provider" value="linkedin" />
                    <SubmitButton className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-line bg-white text-[15px] font-medium text-ink transition hover:border-navy"><span className="text-[#0A66C2]"><SocialIcon name="linkedin" className="h-5 w-5" /></span>{L.linkedin}</SubmitButton></form>
                </div>
              </>
            ) : (
              <>
                <p className="text-center text-[15px] text-ink-2">{L.codeSent} <b dir="ltr" className="text-ink">{pendingEmail}</b></p>
                <form action={verifyLoginCode} className="mt-6 space-y-5">
                  {hidden}
                  <label className="block">
                    <span className="mb-2 block text-[16px] text-ink">{L.code}</span>
                    <input name="code" required autoFocus inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,10}" maxLength={10} dir="ltr" placeholder={L.codePh}
                      className="h-14 w-full rounded-[14px] border border-line text-center text-[24px] tracking-[0.5em] outline-none placeholder:text-[15px] placeholder:tracking-normal placeholder:text-mist focus:border-navy" />
                  </label>
                  <SubmitButton className="btn btn-primary btn-lg mx-auto flex w-full sm:w-[300px]">{L.verify}</SubmitButton>
                </form>
                <div className="mt-4 flex items-center justify-center gap-5 text-[14px]">
                  <form action={sendLoginCode}>{hidden}<input type="hidden" name="email" value={pendingEmail} /><button className="font-medium text-navy underline underline-offset-4">{L.resend}</button></form>
                  <form action={resetLogin}>{hidden}<button className="text-ink-2 underline underline-offset-4">{L.change}</button></form>
                </div>
              </>
            )}

            <p className="mt-7 flex items-center justify-center gap-1.5 text-[14px] text-ink-2">
              <ShieldCheck className="h-4 w-4 text-mist" />{L.trouble}
              <Link href={`/${locale}/contact`} className="font-medium text-navy underline underline-offset-4">{L.support}</Link>
            </p>
          </div>
        </section>

        <section className="relative mx-auto mt-14 max-w-[390px] overflow-hidden rounded-[20px] border border-[#F3F4F6] bg-white p-6 shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
          <span className="pointer-events-none absolute -end-12 -top-12 h-36 w-36 rounded-full bg-haze/40" aria-hidden />
          <h3 className="relative text-[24px] font-semibold text-ink">{L.notMember}</h3>
          <Link href={`/${locale}/application`} className="relative mt-5 flex h-14 items-center justify-center gap-2 rounded-[14px] border border-navy text-[18px] font-medium text-navy transition hover:bg-mint-soft">
            {N.register}<ArrowRight className="h-5 w-5 rtl:rotate-180" />
          </Link>
        </section>
      </div>
    </main>
  );
}
