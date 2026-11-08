import clsx from "clsx";
import { Award, Briefcase, Handshake, HeartHandshake, MapPin, Star, Users } from "lucide-react";
import Link from "next/link";
import { LogoImg } from "@/components/LogoImg";
import { Chevron } from "@/components/shell/page";
import { Avatar } from "@/components/ui";
import type { Locale } from "@/i18n";
import { tr } from "@/i18n/config";
import { fmt, type MemberDict } from "@/i18n/member";
import { companyLogo } from "@/lib/companies-seed";
import type { MemberCard as MemberCardT } from "@/lib/data/repo";
import { displayName, fmtRelative } from "@/lib/format";
import type { AskWithAuthor, Company, EventWithStats, JobWithPoster, MemberStats } from "@/lib/types";

/* Rows and small pieces shared by member-app screens. Rows over cards: scannable, calm, one tap target each. */

type CompanyLike = Pick<Company, "name" | "name_ar" | "name_he"> & { logo_url?: string | null; website?: string | null };

export function companyName(c: CompanyLike, locale: Locale) {
  return (locale === "ar" ? c.name_ar : locale === "he" ? c.name_he : null) || c.name;
}

export function CompanyLogo({ c, size = 44, className }: { c: CompanyLike | null | undefined; size?: number; className?: string }) {
  const src = c ? companyLogo({ ...c, name: c.name }) : null;
  return (
    <span className={clsx("grid shrink-0 place-items-center overflow-hidden rounded-[12px] border border-line bg-white", className)} style={{ width: size, height: size }}>
      {src ? <LogoImg src={src} letter={(c?.name ?? "?").slice(0, 1).toUpperCase()} size={size} />
        : c ? <span className="font-bold text-navy" style={{ fontSize: size * 0.4 }}>{c.name.slice(0, 1).toUpperCase()}</span> : <Briefcase className="h-5 w-5 text-mist" />}
    </span>
  );
}

export function JobRow({ j, locale, M }: { j: JobWithPoster; locale: Locale; M: MemberDict }) {
  const c = j.company_ref ?? { name: j.company, name_ar: null, name_he: null, logo_url: null };
  const where = j.location || j.city;
  const st = j.my_referral?.status;
  const n = j.insiders_count ?? 0;
  return (
    <Link href={`/${locale}/app/jobs/${j.id}`} className="row items-start py-4">
      <CompanyLogo c={c} size={46} />
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 block text-[15px] font-bold leading-6 text-ink" dir="auto">{j.title}</span>
        <span className="row-sub block">{j.company_ref ? companyName(j.company_ref, locale) : j.company}{where ? ` · ${where}` : ""}</span>
        <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {n > 0 && <span className="badge badge-mint"><Users className="h-3 w-3" />{fmt(M.jobs.insiders, { n })}</span>}
          {j.is_managerial && <span className="badge badge-navy">{M.jobs.managerialTag}</span>}
          {st === "pending" && <span className="badge badge-amber">{M.jobs.asked}</span>}
          {st === "accepted" && <span className="badge badge-mint">{M.jobs.accepted}</span>}
          {!j.is_open && <span className="badge badge-gray">{M.jobs.closed}</span>}
          <span className="text-[12px] text-mist">{fmtRelative(j.created_at, locale)}</span>
        </span>
      </span>
      <Chevron />
    </Link>
  );
}

export function PersonRow({ m, locale, M, stats, right }: { m: MemberCardT; locale: Locale; M: MemberDict; stats?: MemberStats; right?: React.ReactNode }) {
  const name = displayName(m, locale);
  const helped = helpedCount(stats);
  const st = m.connection?.status;
  return (
    <Link href={`/${locale}/app/members/${m.id}`} className="row">
      <Avatar src={m.avatar_url} name={name} size={48} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="row-title">{name}</span>
          {st === "accepted" && <span className="badge badge-navy shrink-0 py-0">{M.members.connected}</span>}
        </span>
        <span className="row-sub block" dir="auto">{[m.headline, m.company].filter(Boolean).join(" · ")}</span>
        {(!!m.help_offers?.length || helped > 0) && (
          <span className="mt-0.5 block truncate text-[12px] text-green-deep" dir="auto">
            {m.help_offers?.length ? `${M.members.canHelp}: ${m.help_offers.slice(0, 2).join("، ")}` : fmt(M.members.helped, { n: helped })}
          </span>
        )}
      </span>
      {right ?? <Chevron />}
    </Link>
  );
}

export function AskRow({ a, locale, M }: { a: AskWithAuthor; locale: Locale; M: MemberDict }) {
  return (
    <Link href={`/${locale}/app/asks/${a.id}`} className="row items-start py-4">
      <Avatar src={a.author.avatar_url} name={displayName(a.author, locale)} size={40} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className={`badge ${a.kind === "ask" ? "badge-amber" : "badge-mint"}`}>{a.kind === "ask" ? M.asks.asks : M.asks.offers}</span>
          {a.status === "closed" && <span className="badge badge-gray">{M.asks.closed}</span>}
          <span className="text-[12px] text-mist">{displayName(a.author, locale).split(" ")[0]} · {fmtRelative(a.created_at, locale)}</span>
        </span>
        <span className="mt-1 line-clamp-2 block text-[15px] font-bold leading-6 text-ink" dir="auto">{a.title}</span>
        <span className="t-small block">{fmt(M.asks.replies, { n: a.replies })}{a.my_reply ? ` · ${M.asks.youReplied}` : ""}</span>
      </span>
      <Chevron />
    </Link>
  );
}

export function EventRow({ e, locale, href, labels }: { e: EventWithStats; locale: Locale; href: string; labels: { registered: string; online: string; waitlist: string } }) {
  const d = new Date(e.starts_at);
  const day = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : locale === "he" ? "he-IL" : "en-GB", { day: "numeric", timeZone: "Asia/Jerusalem" }).format(d);
  const mon = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : locale === "he" ? "he-IL" : "en-GB", { month: "short", timeZone: "Asia/Jerusalem" }).format(d);
  const time = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : locale === "he" ? "he-IL" : "en-GB", { weekday: "long", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jerusalem" }).format(d);
  const st = e.my_registration?.status;
  return (
    <Link href={href} className="row py-4">
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[16px] bg-navy text-white">
        <span className="text-center leading-none"><span className="block text-[20px] font-bold">{day}</span><span className="block text-[11px] text-white/80">{mon}</span></span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 block text-[15px] font-bold leading-6 text-ink">{tr(e.title, locale)}</span>
        <span className="row-sub flex items-center gap-1"><MapPin className="h-3.5 w-3.5 shrink-0" />{e.is_online ? labels.online : tr(e.location, locale)} · {time}</span>
        {st && <span className={`badge mt-1 ${st === "waitlist" ? "badge-amber" : "badge-mint"}`}>{st === "waitlist" ? labels.waitlist : labels.registered}</span>}
      </span>
      <Chevron />
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
          <span key={k} className={clsx("inline-flex items-center gap-1 rounded-full", k === "hire" ? "bg-sand text-sand-ink" : "bg-mint-soft text-green-deep",
            size === "md" ? "px-3 py-1 text-[13px]" : "px-2 py-0.5 text-[11px]")}>
            <I className={size === "md" ? "h-3.5 w-3.5" : "h-3 w-3"} />{M.badges[k]}
          </span>
        );
      })}
    </span>
  );
}
export const helpedCount = (s?: MemberStats) => (s ? s.referrals + s.chats + s.answers : 0);

export function LocationLine({ text }: { text?: string | null }) {
  if (!text) return null;
  return <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /><span dir="auto">{text}</span></span>;
}
