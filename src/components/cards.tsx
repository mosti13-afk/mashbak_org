import clsx from "clsx";
import { ArrowRight, Briefcase, Building2, CalendarDays, Cpu, Crown, MapPin, Network, Quote, Rocket, Sparkles, Users, Video } from "lucide-react";
import Link from "next/link";
import type { Dict, Locale } from "@/i18n";
import { tr } from "@/i18n/config";
import { displayName, fmtDayMonth, fmtRelative, fmtTime } from "@/lib/format";
import type { EventWithStats, JobWithPoster, MemberReview, Program } from "@/lib/types";
import type { MemberCard as MemberCardT } from "@/lib/data/repo";
import { Avatar } from "./ui";

const programIcons = { rocket: Rocket, crown: Crown, cpu: Cpu, sparkles: Sparkles, network: Network } as const;
export function ProgramIcon({ name, className }: { name: string; className?: string }) {
  const I = programIcons[name as keyof typeof programIcons] ?? Network;
  return <I className={className} strokeWidth={1.8} />;
}

export function ProgramCard({ p, locale, t }: { p: Program; locale: Locale; t: Dict }) {
  return (
    <Link href={`/${locale}/our_programs/${p.slug}`} className="card card-hover group relative flex flex-col overflow-hidden p-6">
      <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: p.color }} />
      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ background: p.color }}>
        <ProgramIcon name={p.icon} className="h-6 w-6" />
      </span>
      <h3 className="h-display text-xl">{tr(p.title, locale)}</h3>
      <p className="mt-2 flex-1 text-ink-2">{tr(p.summary, locale)}</p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-semibold text-mist">{p.sessions_count ? `${p.sessions_count} ${t.programs.sessions}` : ""}</span>
        <span className="flex items-center gap-1 whitespace-nowrap font-bold text-navy transition-all group-hover:gap-2">
          {t.common.learnMore} <ArrowRight className="flip-rtl h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

export function EventCard({ e, locale, t, href }: { e: EventWithStats; locale: Locale; t: Dict; href: string }) {
  const d = fmtDayMonth(e.starts_at, locale);
  const left = e.capacity ? Math.max(0, e.capacity - e.registered_count) : null;
  const past = Date.parse(e.ends_at) < Date.now();
  return (
    <Link href={href} className={clsx("card card-hover group flex gap-4 p-4 sm:p-5", past && "opacity-75")}>
      <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-navy py-3 text-white">
        <span className="text-2xl font-black leading-none">{d.day}</span>
        <span className="mt-1 text-xs font-bold text-mint">{d.month}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <span className="badge badge-navy">{e.is_online ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}{e.is_online ? t.events.online : t.events.inPerson}</span>
          {e.members_only && <span className="badge badge-gray">{t.events.membersOnly}</span>}
          {e.my_registration && <span className="badge badge-mint">{e.my_registration.status === "waitlist" ? t.events.waitlisted : e.my_registration.status === "attended" ? t.events.attended : t.events.registered}</span>}
        </div>
        <h3 className="truncate text-lg font-black text-navy-ink group-hover:text-navy">{tr(e.title, locale)}</h3>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-2">
          <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{d.weekday} · <span dir="ltr">{fmtTime(e.starts_at, locale)}</span></span>
          <span className="flex items-center gap-1 truncate"><MapPin className="h-3.5 w-3.5 shrink-0" />{tr(e.location, locale)}</span>
        </p>
        {!past && left !== null && (
          <p className={clsx("mt-2 text-xs font-bold", left === 0 ? "text-[#9b1c13]" : left <= 5 ? "text-[#7a5a00]" : "text-green")}>
            {left === 0 ? t.events.full : `${left} ${t.events.seatsLeft}`}
          </p>
        )}
      </div>
    </Link>
  );
}

export function ReviewCard({ r, locale, featured = false }: { r: MemberReview; locale: Locale; featured?: boolean }) {
  const name = tr(r.name, locale);
  return (
    <figure className={clsx("card relative flex h-full flex-col p-6", featured && "bg-navy text-white border-navy")}>
      <Quote className={clsx("h-8 w-8", featured ? "text-mint" : "text-mint")} strokeWidth={1.5} />
      <blockquote className={clsx("mt-3 flex-1 leading-relaxed", featured ? "text-lg text-white/90" : "text-ink-2", !featured && "line-clamp-[9]")}>
        {tr(r.quote, locale)}
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <Avatar src={r.photo_url} name={name} size={52} />
        <div className="min-w-0">
          <p className={clsx("font-black", featured ? "text-white" : "text-navy-ink")}>{name}</p>
          <p className={clsx("truncate text-sm", featured ? "text-white/65" : "text-mist")} dir="auto">
            {tr(r.role_title, locale)}{r.organization ? ` · ${r.organization}` : ""}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

export function MemberTile({ m, locale, t }: { m: MemberCardT; locale: Locale; t: Dict }) {
  const name = displayName(m, locale);
  const st = m.connection?.status;
  return (
    <Link href={`/${locale}/app/members/${m.id}`} className="card card-hover group flex flex-col p-5">
      <div className="flex items-start gap-3.5">
        <Avatar src={m.avatar_url} name={name} size={56} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-black text-navy-ink">{name}</p>
          <p className="truncate text-sm font-semibold text-ink-2" dir="auto">{m.headline}</p>
          {m.company && <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-mist"><Building2 className="h-3.5 w-3.5" />{m.company}</p>}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {m.sector && <span className="badge badge-gray">{m.sector}</span>}
        {m.years_experience != null && <span className="badge badge-gray">{m.years_experience} {t.common.yearsShort}</span>}
        {m.open_to_mentoring && <span className="badge badge-mint">{t.app.members.mentor}</span>}
        {st === "accepted" && <span className="badge badge-navy"><Users className="h-3 w-3" />{t.app.members.connected}</span>}
        {st === "pending" && <span className="badge badge-amber">{t.app.members.pending}</span>}
      </div>
    </Link>
  );
}

export function JobRow({ j, locale, t }: { j: JobWithPoster; locale: Locale; t: Dict }) {
  const poster = displayName(j.poster, locale);
  return (
    <Link href={`/${locale}/app/jobs/${j.id}`} className="card card-hover group flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mint-soft text-green-deep">
        <Briefcase className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-black text-navy-ink group-hover:text-navy" dir="auto">{j.title}</h3>
        <p className="text-sm text-ink-2">
          <span className="font-bold">{j.company}</span>
          {j.city && <> · {j.city}</>} · {t.app.jobs.modes[j.work_mode]} · {t.app.jobs.types[j.job_type]}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {j.is_managerial && <span className="badge badge-navy">{t.app.jobs.managerial}</span>}
          {!j.is_open && <span className="badge badge-gray">{t.app.jobs.closed}</span>}
          {j.my_referral && <span className="badge badge-mint">{j.my_referral.status === "accepted" ? t.app.jobs.referralAccepted : t.app.jobs.referralSent}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-mist sm:flex-col sm:items-end">
        <span className="flex items-center gap-2"><Avatar src={j.poster.avatar_url} name={poster} size={26} /><span className="font-semibold text-ink-2">{poster}</span></span>
        <span>{fmtRelative(j.created_at, locale)}</span>
      </div>
    </Link>
  );
}
