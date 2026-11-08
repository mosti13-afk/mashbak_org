import { CalendarDays, Clock, ExternalLink, MapPin, Users, Video } from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode";
import { cancelEvent, registerEvent } from "@/app/actions";
import type { Dict, Locale } from "@/i18n";
import { tr } from "@/i18n/config";
import { SITE_URL } from "@/lib/env";
import { fmtDate, fmtTime } from "@/lib/format";
import type { EventWithStats, Profile } from "@/lib/types";
import { SubmitButton } from "./ui/client";

export async function EventDetail({ e, locale, t, viewer, backHref }: { e: EventWithStats; locale: Locale; t: Dict; viewer: Profile | null; backHref: string }) {
  const past = Date.parse(e.ends_at) < Date.now();
  const left = e.capacity ? Math.max(0, e.capacity - e.registered_count) : null;
  const reg = e.my_registration;
  const isMember = viewer && (viewer.status === "active" || viewer.role === "admin");
  const here = `/${locale}/${viewer ? "app/" : ""}events/${e.id}`;
  const qr = reg && reg.status !== "waitlist"
    ? await QRCode.toDataURL(`${SITE_URL}/${locale}/admin/events/${e.id}?code=${reg.checkin_code}`, { margin: 1, width: 360, color: { dark: "#04223a", light: "#ffffff" } })
    : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      <article>
        <Link href={backHref} className="mb-4 inline-flex text-sm font-bold text-mist hover:text-navy">← {t.common.back}</Link>
        {e.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.cover_url} alt="" className="mb-6 aspect-[2/1] w-full rounded-[var(--radius-card)] object-cover" />
        )}
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className="badge badge-navy">{e.is_online ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}{e.is_online ? t.events.online : t.events.inPerson}</span>
          {e.members_only && <span className="badge badge-gray">{t.events.membersOnly}</span>}
        </div>
        <h1 className="h-display text-3xl sm:text-4xl">{tr(e.title, locale)}</h1>
        <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-ink-2">{tr(e.description, locale)}</p>
      </article>

      <aside className="space-y-4 lg:pt-10">
        <div className="card space-y-4 p-6">
          <Row icon={<CalendarDays className="h-5 w-5" />} label={t.events.when}>{fmtDate(e.starts_at, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</Row>
          <Row icon={<Clock className="h-5 w-5" />} label="">
            <span dir="ltr">{fmtTime(e.starts_at, locale)} – {fmtTime(e.ends_at, locale)}</span>
          </Row>
          <Row icon={<MapPin className="h-5 w-5" />} label={t.events.where}>{tr(e.location, locale)}</Row>
          {e.capacity != null && (
            <Row icon={<Users className="h-5 w-5" />} label={t.events.capacity}>
              {e.registered_count} / {e.capacity}
              {!past && <span className="ms-2 text-sm font-bold text-green">{left === 0 ? t.events.full : `${left} ${t.events.seatsLeft}`}</span>}
            </Row>
          )}
          {e.is_online && e.online_url && reg?.status === "registered" && (
            <a href={e.online_url} target="_blank" rel="noreferrer" className="btn btn-outline w-full"><ExternalLink className="h-4 w-4" />{t.events.joinOnline}</a>
          )}

          {!past && (
            <div className="border-t border-line pt-4">
              {!viewer ? (
                <Link href={`/${locale}/login`} className="btn btn-primary w-full">{t.events.loginToRegister}</Link>
              ) : !isMember ? null : reg ? (
                <form action={cancelEvent} className="space-y-3">
                  <p className="text-center font-black text-green-deep">{reg.status === "waitlist" ? t.events.waitlisted : t.events.registered}</p>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="event_id" value={e.id} />
                  <input type="hidden" name="redirect" value={here} />
                  <SubmitButton className="btn btn-ghost w-full text-sm">{t.events.cancel}</SubmitButton>
                </form>
              ) : (
                <form action={registerEvent}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="event_id" value={e.id} />
                  <input type="hidden" name="redirect" value={here} />
                  <SubmitButton className="btn btn-primary btn-lg w-full">{left === 0 ? t.events.joinWaitlist : t.events.register}</SubmitButton>
                </form>
              )}
            </div>
          )}
        </div>

        {qr && reg && (
          <div className="card overflow-hidden">
            <div className="bg-navy px-6 py-4 text-white">
              <p className="text-xs font-bold text-mint">{t.events.ticket}</p>
              <p className="font-black">{tr(e.title, locale)}</p>
            </div>
            <div className="relative flex flex-col items-center p-6">
              <span className="absolute -start-3 top-0 h-6 w-6 -translate-y-1/2 rounded-full bg-paper" />
              <span className="absolute -end-3 top-0 h-6 w-6 -translate-y-1/2 rounded-full bg-paper" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="QR" className="h-48 w-48" />
              <p className="mt-3 font-mono text-xs tracking-widest text-mist" dir="ltr">{reg.checkin_code}</p>
              <p className="mt-2 text-center text-sm text-ink-2">{reg.status === "attended" ? t.events.attended : t.events.ticketHint}</p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-green">{icon}</span>
      <div>
        {label && <p className="text-xs font-bold text-mist">{label}</p>}
        <p className="font-bold text-ink">{children}</p>
      </div>
    </div>
  );
}
