import { ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { demoLogin, logout, magicLink, passwordLogin } from "@/app/actions";
import { Field, Logo, Notice } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import { isDemo } from "@/lib/env";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { getViewer } from "@/lib/session";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { t } = await pageLocale(params);
  return { title: t.login.title };
}

export default async function Login({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  const q = await searchParams;
  const viewer = await getViewer();
  if (viewer && (viewer.status === "active" || viewer.role === "admin")) redirect(`/${locale}/${viewer.role === "admin" ? "admin" : "app"}`);

  return (
    <div className="container-x flex justify-center py-16 sm:py-24">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo height={56} className="mx-auto" />
          <h1 className="h-display mt-6 text-3xl">{t.login.title}</h1>
          <p className="mt-2 text-ink-2">{t.login.sub}</p>
        </div>

        {viewer && viewer.status !== "active" && (
          <div className="card mb-5 p-6 text-center">
            <p className="font-black text-navy-ink">{t.login.pendingTitle}</p>
            <p className="mt-1 text-ink-2">{t.login.pendingBody}</p>
            <form action={logout} className="mt-4"><input type="hidden" name="locale" value={locale} /><SubmitButton className="btn btn-outline btn-sm">{t.common.logout}</SubmitButton></form>
          </div>
        )}

        {isDemo ? (
          <div className="card p-6">
            <p className="font-black text-navy-ink">{t.login.demoTitle}</p>
            <p className="mb-5 mt-1 text-sm text-ink-2">{t.login.demoSub}</p>
            <div className="grid gap-3">
              <form action={demoLogin}>
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="as" value="member" />
                <SubmitButton className="btn btn-primary btn-lg w-full"><UserRound className="h-4 w-4" />{t.login.demoMember}</SubmitButton>
              </form>
              <form action={demoLogin}>
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="as" value="admin" />
                <SubmitButton className="btn btn-outline btn-lg w-full"><ShieldCheck className="h-4 w-4" />{t.login.demoAdmin}</SubmitButton>
              </form>
            </div>
          </div>
        ) : (
          <div className="card p-6">
            {sp(q.error) ? <Notice tone="red">{t.login.error}</Notice> : null}
            {sp(q.sent) ? <Notice>{t.login.magicSent}</Notice> : null}
            <form action={passwordLogin} className="space-y-4">
              <input type="hidden" name="locale" value={locale} />
              <Field label={t.common.email}><input name="email" type="email" required className="input" dir="ltr" autoComplete="email" /></Field>
              <Field label={t.login.password}><input name="password" type="password" required className="input" dir="ltr" autoComplete="current-password" /></Field>
              <SubmitButton className="btn btn-primary btn-lg w-full">{t.login.submit}</SubmitButton>
            </form>
            <div className="my-5 flex items-center gap-3 text-xs text-mist"><span className="h-px flex-1 bg-line" />·<span className="h-px flex-1 bg-line" /></div>
            <form action={magicLink} className="flex gap-2">
              <input type="hidden" name="locale" value={locale} />
              <input name="email" type="email" required className="input" dir="ltr" placeholder={t.common.email} />
              <SubmitButton className="btn btn-outline shrink-0">{t.login.magic}</SubmitButton>
            </form>
          </div>
        )}

        <p className="mt-6 text-center text-ink-2">
          {t.login.notMember} <Link href={`/${locale}/apply`} className="font-bold text-navy hover:underline">{t.common.apply}</Link>
        </p>
      </div>
    </div>
  );
}
