import { Bell, Globe, HelpCircle, Inbox, LayoutDashboard, LogOut, PencilLine, Shield, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/app/actions";
import { InstallRow } from "@/components/pwa";
import { Chevron, PageTitle } from "@/components/shell/page";
import { Avatar } from "@/components/ui";
import { LanguageSeg, SubmitButton } from "@/components/ui/client";
import { Badges, badgesFor, helpedCount } from "@/components/v2";
import { fmt, memberDict } from "@/i18n/member";
import { shellDict } from "@/i18n/shell";
import { repo } from "@/lib/data";
import { displayName } from "@/lib/format";
import { pageLocale, type LocaleParams } from "@/lib/page";
import { requireMember } from "@/lib/session";

function LinkRow({ href, icon, label, end }: { href: string; icon: ReactNode; label: string; end?: ReactNode }) {
  return (
    <Link href={href} className="row">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-sky text-navy">{icon}</span>
      <span className="flex-1 text-[15px] text-ink">{label}</span>
      {end}<Chevron />
    </Link>
  );
}

export default async function Account({ params }: LocaleParams) {
  const { locale, t } = await pageLocale(params);
  const M = memberDict[locale];
  const S = shellDict[locale];
  const A = S.acc;
  const v = await requireMember(locale);
  const [stats, cons] = await Promise.all([repo.memberStats([v.id]), repo.listConnections(v.id)]);
  const st = stats[v.id];
  const b = `/${locale}/app`;
  const name = displayName(v, locale);
  const network = cons.filter((c) => c.status === "accepted").length;
  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle title={S.account} />
      <section className="rounded-[24px] bg-white p-5 ring-1 ring-line">
        <div className="flex items-center gap-4">
          <Avatar src={v.avatar_url} name={name} size={68} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[19px] font-bold text-ink">{name}</p>
            <p className="row-sub" dir="auto">{[v.headline, v.company].filter(Boolean).join(" · ")}</p>
          </div>
        </div>
        {(helpedCount(st) > 0 || badgesFor(st, v.open_to_mentoring).length > 0) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
            {helpedCount(st) > 0 && <span className="text-[14px] text-ink-2">{A.impact}: <b className="text-navy">{fmt(M.members.helped, { n: helpedCount(st) })}</b></span>}
            <Badges keys={badgesFor(st, v.open_to_mentoring)} M={M} />
          </div>
        )}
        <Link href={`${b}/profile`} className="btn btn-secondary mt-4 w-full"><PencilLine className="h-4 w-4" />{A.editProfile}</Link>
      </section>

      <div className="list mt-5">
        <LinkRow href={`${b}/activity?tab=sent`} icon={<Inbox className="h-[18px] w-[18px]" />} label={A.requests} />
        <LinkRow href={`${b}/connections`} icon={<Users className="h-[18px] w-[18px]" />} label={A.network} end={network ? <span className="text-[14px] text-mist">{network}</span> : null} />
        <LinkRow href={`${b}/activity?tab=updates`} icon={<Bell className="h-[18px] w-[18px]" />} label={A.notifications} />
      </div>

      <p className="list-label flex items-center gap-2"><Globe className="h-4 w-4" />{A.language}</p>
      <LanguageSeg locale={locale} />

      <div className="list mt-5">
        <InstallRow label={A.install} iosHint={t.common.installHint} />
        {v.role === "admin" && <LinkRow href={`/${locale}/admin`} icon={<LayoutDashboard className="h-[18px] w-[18px]" />} label={A.admin} />}
        <LinkRow href={`/${locale}/contact`} icon={<HelpCircle className="h-[18px] w-[18px]" />} label={A.help} />
        <LinkRow href={`/${locale}/policy`} icon={<Shield className="h-[18px] w-[18px]" />} label={A.privacy} />
      </div>

      <form action={logout} className="mt-5"><input type="hidden" name="locale" value={locale} />
        <SubmitButton className="btn w-full bg-white text-[#b3261e] ring-1 ring-line hover:bg-[#fdf3f2]"><LogOut className="h-4 w-4 rtl:rotate-180" />{A.logout}</SubmitButton>
      </form>
    </div>
  );
}
