import { Building2, Coffee, ExternalLink, MapPin, MessageCircle } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requestConnection } from "@/app/actions";
import { BackLink } from "@/components/shell/page";
import { Avatar } from "@/components/ui";
import { Dialog, SubmitButton } from "@/components/ui/client";
import { Badges, CompanyLogo, badgesFor, companyName, helpedCount } from "@/components/v2";
import { fmt, memberDict } from "@/i18n/member";
import { shellDict } from "@/i18n/shell";
import { repo } from "@/lib/data";
import { displayName, waLink } from "@/lib/format";
import { pageLocale } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function MemberPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, t } = await pageLocale(params);
  const M = memberDict[locale];
  const S = shellDict[locale];
  const v = await requireMember(locale);
  const { id } = await params;
  if (id === v.id) redirect(`/${locale}/app/profile`);
  const m = await repo.getMember(id, v.id);
  if (!m) notFound();
  const name = displayName(m, locale);
  const [stats, company] = await Promise.all([repo.memberStats([m.id]), m.company_id ? repo.getCompany(m.company_id) : Promise.resolve(null)]);
  const st = stats[m.id];
  const c = m.connection;
  let phone: string | null = null;
  if (c?.status === "accepted") phone = (await repo.listConnections(v.id)).find((x) => x.id === c.id)?.phone ?? null;
  const helped = helpedCount(st);
  const b = `/${locale}/app`;

  const primary = !c && m.open_to_chats !== false ? (
    <Dialog trigger={<><Coffee className="h-5 w-5" />{M.members.requestChat}</>} triggerClass="btn btn-primary btn-lg w-full sm:w-auto" title={M.members.requestChat}>
      <form action={requestConnection} className="space-y-4">
        <input type="hidden" name="locale" value={locale} /><input type="hidden" name="to" value={m.id} />
        <p className="text-[14px] leading-6 text-ink-2">{t.app.members.connectHint}</p>
        <textarea name="message" required minLength={5} maxLength={600} rows={5} className="textarea" placeholder={M.members.chatPh} dir="auto" />
        <SubmitButton className="btn btn-primary w-full">{M.members.sendChat}</SubmitButton>
      </form>
    </Dialog>
  ) : c?.status === "accepted" && phone ? (
    <a href={waLink(phone, t.app.connections.waText)} target="_blank" rel="noopener noreferrer" className="btn btn-lg w-full bg-[#25D366] text-white hover:bg-[#1ebe5a] sm:w-auto"><MessageCircle className="h-5 w-5" />{M.requests.whatsapp}</a>
  ) : c?.status === "pending" ? (
    <span className="btn btn-lg btn-secondary pointer-events-none w-full sm:w-auto">{M.members.pendingChat}</span>
  ) : c?.status === "accepted" ? <span className="btn btn-lg btn-secondary pointer-events-none w-full sm:w-auto">{M.members.connected}</span> : null;

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href={`${b}/members`} label={S.members} />
      <header className="text-center sm:text-start">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <Avatar src={m.avatar_url} name={name} size={96} />
          <div className="min-w-0">
            <h1 className="t-h1">{name}</h1>
            <p className="text-[16px] text-ink-2" dir="auto">{m.headline}</p>
            <p className="t-small mt-1 flex flex-wrap items-center justify-center gap-x-3 sm:justify-start">
              {company ? <Link href={`${b}/companies/${company.slug}`} className="inline-flex items-center gap-1.5 text-navy hover:underline"><CompanyLogo c={company} size={20} className="rounded-[6px]" />{companyName(company, locale)}</Link>
                : m.company && <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{m.company}</span>}
              {m.city && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{m.city}</span>}
              {m.years_experience != null && <span>{m.years_experience} {t.common.yearsShort}</span>}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <Badges keys={badgesFor(st, m.open_to_mentoring)} M={M} size="md" />
          {helped > 0 && <span className="text-[13px] text-mist">{fmt(M.members.helped, { n: helped })}</span>}
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {primary}
          {m.linkedin_url && <a href={m.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg w-full sm:w-auto"><ExternalLink className="h-4 w-4" />LinkedIn</a>}
        </div>
      </header>

      {!!m.help_offers?.length && (
        <section className="mt-7">
          <h2 className="list-label mt-0">{M.members.canHelp}</h2>
          <div className="flex flex-wrap gap-2">{m.help_offers.map((h) => <span key={h} className="chip h-9 border-mint/40 bg-mint-soft text-[14px] text-navy" dir="auto">{h}</span>)}</div>
        </section>
      )}
      {m.bio && (
        <section className="mt-7">
          <h2 className="list-label mt-0">{t.app.members.about}</h2>
          <p className="whitespace-pre-line rounded-[20px] bg-white p-5 text-[15px] leading-7 text-ink-2 ring-1 ring-line" dir="auto">{m.bio}</p>
        </section>
      )}
      {(m.career_goals.length > 0 || m.interests.length > 0) && (
        <section className="mt-7 grid gap-5 sm:grid-cols-2">
          {m.career_goals.length > 0 && <div><h2 className="list-label mt-0">{t.app.members.goals}</h2><div className="flex flex-wrap gap-1.5">{m.career_goals.map((g) => <span key={g} className="chip" dir="auto">{g}</span>)}</div></div>}
          {m.interests.length > 0 && <div><h2 className="list-label mt-0">{t.app.members.interests}</h2><div className="flex flex-wrap gap-1.5">{m.interests.map((g) => <span key={g} className="chip" dir="auto">{g}</span>)}</div></div>}
        </section>
      )}
    </div>
  );
}
