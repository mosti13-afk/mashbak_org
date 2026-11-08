import clsx from "clsx";
import { Award, Briefcase, Building2, ChevronLeft, Handshake, HeartHandshake, MapPin, Sparkles, Star, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { LogoImg } from "@/components/LogoImg";
import { Avatar } from "@/components/ui";
import type { Dict, Locale } from "@/i18n";
import { fmt, type MemberDict } from "@/i18n/member";
import { companyLogo } from "@/lib/companies-seed";
import type { MemberCard as MemberCardT } from "@/lib/data/repo";
import { displayName, fmtRelative } from "@/lib/format";
import type { Company, JobWithPoster, MemberStats } from "@/lib/types";

type CompanyLike = Pick<Company, "name" | "name_ar" | "name_he"> & { logo_url?: string | null; website?: string | null };

export function companyName(c: CompanyLike, locale: Locale) {
  return (locale === "ar" ? c.name_ar : locale === "he" ? c.name_he : null) || c.name;
}

export function CompanyLogo({ c, size = 44, className }: { c: CompanyLike | null | undefined; size?: number; className?: string }) {
  const src = c ? companyLogo({ ...c, name: c.name }) : null;
  return (
    <span className={clsx("grid shrink-0 place-items-center overflow-hidden rounded-[14px] border border-line bg-white", className)} style={{ width: size, height: size }}>
      {src ? <LogoImg src={src} letter={(c?.name ?? "?").slice(0, 1).toUpperCase()} size={size} />
        : c ? <span className="font-bold text-navy" style={{ fontSize: size * 0.4 }}>{c.name.slice(0, 1).toUpperCase()}</span> : <Briefcase className="h-5 w-5 text-mist" />}
    </span>
  );
}

export function Section({ title, sub, href, more, children, className }: { title: string; sub?: string; href?: string; more?: string; children: ReactNode; className?: string }) {
  return (
    <section className={clsx("mt-8", className)}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[19px] font-bold text-ink">{title}</h2>
          {sub && <p className="text-[13px] text-mist">{sub}</p>}
        </div>
        {href && more && <Link href={href} className="flex shrink-0 items-center gap-0.5 text-[13px] font-semibold text-navy hover:underline">{more}<ChevronLeft className="h-4 w-4 ltr:rotate-180" /></Link>}
      </div>
      {children}
    </section>
  );
}

export function JobCard({ j, locale, M, t, compact = false }: { j: JobWithPoster; locale: Locale; M: MemberDict; t: Dict; compact?: boolean }) {
  const c = j.company_ref ?? { name: j.company, name_ar: null, name_he: null, logo_url: null };
  const where = j.location || j.city;
  const st = j.my_referral?.status;
  return (
    <Link href={`/${locale}/app/jobs/${j.id}`} className="card card-hover group flex gap-3.5 p-4">
      <CompanyLogo c={c} size={compact ? 42 : 48} />
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-[16px] font-bold leading-6 text-ink group-hover:text-navy" dir="auto">{j.title}</h3>
        <p className="mt-0.5 truncate text-[13px] text-ink-2">
          <span className="font-semibold">{j.company_ref ? companyName(j.company_ref, locale) : j.company}</span>
          {where && <> · <span dir="auto">{where}</span></>}
          {!compact && <> · {t.app.jobs.modes[j.work_mode]}</>}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {(j.insiders_count ?? 0) > 0
            ? <span className="badge badge-mint"><Users className="h-3 w-3" />{fmt(M.jobs.insiders, { n: j.insiders_count! })}</span>
            : !compact && <span className="badge badge-gray">{M.jobs.noInsiders}</span>}
          {j.is_managerial && <span className="badge badge-navy">{M.jobs.managerialTag}</span>}
          {st === "pending" && <span className="badge badge-amber">{M.jobs.asked}</span>}
          {st === "accepted" && <span className="badge badge-mint">{M.jobs.accepted}</span>}
          {!j.is_open && <span className="badge badge-gray">{M.jobs.closed}</span>}
          <span className="ms-auto text-[12px] text-mist">{j.source === "careers" ? M.jobs.fromCareers : j.poster ? fmt(M.jobs.postedBy, { name: displayName(j.poster, locale).split(" ")[0] }) : ""} · {fmtRelative(j.created_at, locale)}</span>
        </div>
      </div>
    </Link>
  );
}

export type BadgeKey = "referrer" | "connector" | "helper" | "hire" | "mentor";
export function badgesFor(s: MemberStats | undefined, mentor?: boolean): BadgeKey[] {
  const out: BadgeKey[] = [];
  if (s?.hires) out.push("hire");
  if ((s?.referrals ?? 0) >= 1) out.push("referrer");
  if ((s?.chats ?? 0) >= 3) out.push("connector");
  if ((s?.answers ?? 0) >= 2) out.push("helper");
  if (mentor) out.push("mentor");
  return out;
}
const BADGE_ICON = { referrer: Handshake, connector: Users, helper: HeartHandshake, hire: Star, mentor: Award } as const;
export function Badges({ keys, M, size = "sm" }: { keys: BadgeKey[]; M: MemberDict; size?: "sm" | "md" }) {
  if (!keys.length) return null;
  return (
    <span className="flex flex-wrap gap-1.5">
      {keys.map((k) => {
        const I = BADGE_ICON[k];
        return (
          <span key={k} className={clsx("inline-flex items-center gap-1 rounded-full border font-semibold",
            k === "hire" ? "border-[#E3B341]/50 bg-[#FFF8E6] text-[#8a6100]" : "border-mint/40 bg-mint-soft text-green-deep",
            size === "md" ? "px-2.5 py-1 text-[13px]" : "px-2 py-0.5 text-[11px]")}>
            <I className={size === "md" ? "h-3.5 w-3.5" : "h-3 w-3"} />{M.badges[k]}
          </span>
        );
      })}
    </span>
  );
}
export const helpedCount = (s?: MemberStats) => (s ? s.referrals + s.chats + s.answers : 0);

export function MemberCardV2({ m, locale, M, stats }: { m: MemberCardT; locale: Locale; M: MemberDict; stats?: MemberStats }) {
  const name = displayName(m, locale);
  const st = m.connection?.status;
  const helped = helpedCount(stats);
  return (
    <Link href={`/${locale}/app/members/${m.id}`} className="card card-hover group flex flex-col p-4">
      <div className="flex items-start gap-3">
        <Avatar src={m.avatar_url} name={name} size={52} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-bold text-ink">{name}</p>
          <p className="truncate text-[13px] text-ink-2" dir="auto">{m.headline}</p>
          {m.company && <p className="mt-0.5 flex items-center gap-1 truncate text-[12px] text-mist"><Building2 className="h-3 w-3" />{m.company}</p>}
        </div>
      </div>
      {!!m.help_offers?.length && (
        <div className="mt-3">
          <p className="mb-1 text-[11px] font-semibold text-mist">{M.members.canHelp}</p>
          <div className="flex flex-wrap gap-1">{m.help_offers.slice(0, 3).map((h) => <span key={h} className="rounded-full bg-sky px-2 py-0.5 text-[12px] text-navy ring-1 ring-line" dir="auto">{h}</span>)}</div>
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
        <Badges keys={badgesFor(stats, m.open_to_mentoring)} M={M} />
        {helped > 0 && <span className="text-[11px] text-mist">{fmt(M.members.helped, { n: helped })}</span>}
        {st === "accepted" && <span className="badge badge-navy ms-auto"><Users className="h-3 w-3" />{M.members.connected}</span>}
        {st === "pending" && <span className="badge badge-amber ms-auto">{M.members.pendingChat}</span>}
        {!st && m.open_to_chats !== false && <span className="ms-auto flex items-center gap-1 text-[11px] font-semibold text-green-deep"><Sparkles className="h-3 w-3" />{M.members.chats}</span>}
      </div>
    </Link>
  );
}

export function LocationLine({ text }: { text?: string | null }) {
  if (!text) return null;
  return <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /><span dir="auto">{text}</span></span>;
}
