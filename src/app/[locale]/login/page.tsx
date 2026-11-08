import { ArrowRight, Mail, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { demoLogin, logout, oauthLogin, resetLogin, sendLoginCode, verifyLoginCode } from "@/app/actions";
import { SocialIcon } from "@/components/site/Social";
import { Logo } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import { siteDict } from "@/i18n/site";
import { demoActive } from "@/lib/preview";
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

  const social = (
    <div className="grid gap-3">
      <form action={oauthLogin}>{hidden}<input type="hidden" name="provider" value="google" />
        <SubmitButton className="btn btn-outline btn-lg w-full"><GoogleG />{L.google}</SubmitButton></form>
      <form action={oauthLogin}>{hidden}<input type="hidden" name="provider" value="linkedin" />
        <SubmitButton className="btn btn-outline btn-lg w-full"><span className="text-[#0A66C2]"><SocialIcon name="linkedin" className="h-5 w-5" /></span>{L.linkedin}</SubmitButton></form>
    </div>
  );

  return (
    <main className="flex min-h-dvh flex-col bg-sky">
      <header className="container-x flex h-16 items-center justify-between">
        <Link href={`/${locale}`} aria-label={N.backHome}><Logo height={40} /></Link>
        <Link href={`/${locale}`} className="inline-flex h-10 items-center gap-1.5 text-[14px] text-mist hover:text-navy"><ArrowRight className="h-4 w-4 ltr:rotate-180" />{N.back}</Link>
      </header>

      <div className="flex flex-1 items-start justify-center px-4 pb-10 pt-4 sm:items-center sm:pt-0">
        <section className="w-full max-w-[440px] rounded-[28px] bg-white p-6 ring-1 ring-line sm:p-8">
          <h1 className="t-h1">{L.heading}</h1>

          {viewer && viewer.status !== "active" && (
            <div className="mt-5 rounded-[18px] bg-mint-soft p-4">
              <p className="font-bold text-navy">{L.pendingTitle}</p>
              <p className="mt-1 text-[15px] text-ink-2">{L.pendingBody}</p>
              <form action={logout} className="mt-3">{hidden}<SubmitButton className="btn btn-outline btn-sm">{t.common.logout}</SubmitButton></form>
            </div>
          )}

          <div className="mt-6">
            {errText && <p role="alert" className="mb-4 rounded-[14px] bg-[#fdecea] px-4 py-3 text-[14px] text-[#b3261e]">{errText}</p>}

            {(await demoActive()) ? (
              <div className="grid gap-3">
                <form action={demoLogin}>{hidden}<input type="hidden" name="as" value="member" />
                  <SubmitButton className="btn btn-primary btn-lg w-full"><UserRound className="h-4 w-4" />{t.login.demoMember}</SubmitButton></form>
                <form action={demoLogin}>{hidden}<input type="hidden" name="as" value="admin" />
                  <SubmitButton className="btn btn-outline btn-lg w-full"><ShieldCheck className="h-4 w-4" />{t.login.demoAdmin}</SubmitButton></form>
              </div>
            ) : step === "email" ? (
              <>
                {social}
                <div className="my-6 flex items-center gap-3 text-[13px] text-mist"><span className="h-px flex-1 bg-line" />{L.or}<span className="h-px flex-1 bg-line" /></div>
                <form action={sendLoginCode} className="space-y-4">
                  {hidden}
                  <label className="block">
                    <span className="label">{L.email}</span>
                    <span className="relative block">
                      <Mail className="pointer-events-none absolute start-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-mist" />
                      <input name="email" type="email" required autoComplete="email" inputMode="email" dir="ltr" placeholder={L.emailPh} className="input ps-11 rtl:text-right" />
                    </span>
                  </label>
                  <SubmitButton className="btn btn-primary btn-lg w-full">{L.sendCode}</SubmitButton>
                </form>
              </>
            ) : (
              <>
                <p className="text-[15px] leading-7 text-ink-2">{L.codeSent} <b dir="ltr" className="text-ink">{pendingEmail}</b></p>
                <form action={verifyLoginCode} className="mt-5 space-y-4">
                  {hidden}
                  <label className="block">
                    <span className="label">{L.code}</span>
                    <input name="code" required autoFocus inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,10}" maxLength={10} dir="ltr" placeholder={L.codePh}
                      className="input h-14 text-center text-[24px] tracking-[0.5em] placeholder:text-[15px] placeholder:tracking-normal" />
                  </label>
                  <SubmitButton className="btn btn-primary btn-lg w-full">{L.verify}</SubmitButton>
                </form>
                <div className="mt-4 flex items-center justify-center gap-5 text-[14px]">
                  <form action={sendLoginCode}>{hidden}<input type="hidden" name="email" value={pendingEmail} /><button className="h-10 font-bold text-navy">{L.resend}</button></form>
                  <form action={resetLogin}>{hidden}<button className="h-10 text-ink-2">{L.change}</button></form>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 border-t border-line pt-5 text-[14px] text-ink-2">
            <p>{L.notMember} <Link href={`/${locale}/application`} className="font-bold text-navy hover:underline">{siteDict[locale].apply}</Link></p>
            <p className="mt-2">{L.trouble} <Link href={`/${locale}/contact`} className="text-navy hover:underline">{L.support}</Link></p>
          </div>
        </section>
      </div>
    </main>
  );
}
