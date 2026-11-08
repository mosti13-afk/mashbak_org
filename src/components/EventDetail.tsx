import { CalendarDays, ExternalLink, MapPin, Users, Video } from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode";
import type { ReactNode } from "react";
import { cancelEvent, registerEvent } from "@/app/actions";
import { BackLink } from "@/components/shell/page";
import type { Dict, Locale } from "@/i18n";
import { tr } from "@/i18n/config";
import { siteUrl } from "@/lib/site-url";
import { fmtDate, fmtTime } from "@/lib/format";
import type { EventWithStats, Profile } from "@/lib/types";
import { SubmitButton } from "./ui/client";

function Fact({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return <div className="row min-h-[56px]"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-sky text-navy">{icon}</span><span className="text-[15px] text-ink">{children}</span></div>;
}

export async function EventDetail({ e, locale, t, viewer, backHref }: { e: EventWithStats; locale: Locale; t: Dict; viewer: Profile | null; backHref: string }) {
  const past = Date.parse(e.ends_at) < Date.now();
  const left = e.capacity ? Math.max(0, e.capacity - e.registered_count) : null;
  const reg = e.my_registration;
  const isMember = viewer && (viewer.status === "active" || viewer.role === "admin");
  const inApp = backHref.includes("/app/");
  const here = `/${locale}/${inApp ? "app/" : ""}events/${e.id}`;
  const qr = reg && reg.status !== "waitlist"
    ? await QRCode.toDataURL(`${await siteUrl()}/${locale}/admin/events/${e.id}?code=${reg.checkin_code}`, { margin: 1, width: 360, color: { dark: "#062a40", light: "#ffffff" } })
    : null;
  const hidden = <><input type="hidden" name="locale" value={locale} /><input type="hidden" name="event_id" value={e.id} /><input type="hidden" name="redirect" value={here} /></>;

  const action = past ? null : !viewer ? (
    <Link href={`/${locale}/login`} className="btn btn-primary btn-lg w-full">{t.events.loginToRegister}</Link>
  ) : !isMember ? null : reg ? (
    <form action={cancelEvent} className="flex items-center gap-3">{hidden}
      <span className="flex-1 font-bold text-green-deep">{reg.status === "waitlist" ? t.events.waitlisted : t.events.registered}</span>
      <SubmitButton className="btn btn-ghost btn-sm">{t.events.cancel}</SubmitButton>
    </form>
  ) : (
    <form action={registerEvent}>{hidden}<SubmitButton className="btn btn-primary btn-lg w-full">{left === 0 ? t.events.joinWaitlist : t.events.register}</SubmitButton></form>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href={backHref} label={t.common.back} />
      {e.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={e.cover_url} alt="" className="mb-5 aspect-[2/1] w-full rounded-[24px] object-cover" />
      )}
      <div className="mb-2 flex flex-wrap gap-1.5">
        <span className="badge badge-navy">{e.is_online ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}{e.is_online ? t.events.online : t.events.inPerson}</span>
        {e.members_only && <span className="badge badge-gray">{t.events.membersOnly}</span>}
      </div>
      <h1 className="t-h1">{tr(e.title, locale)}</h1>

      <div className="list mt-5">
        <Fact icon={<CalendarDays className="h-[18px] w-[18px]" />}>
          {fmtDate(e.starts_at, locale, { weekday: "long", day: "numeric", month: "long" })} · <span dir="ltr">{fmtTime(e.starts_at, locale)} - {fmtTime(e.ends_at, locale)}</span>
        </Fact>
        <Fact icon={e.is_online ? <Video className="h-[18px] w-[18px]" /> : <MapPin className="h-[18px] w-[18px]" />}>{e.is_online ? t.events.online : tr(e.location, locale)}</Fact>
        {e.capacity != null && (
          <Fact icon={<Users className="h-[18px] w-[18px]" />}>
            {e.registered_count} / {e.capacity}{!past && <span className="ms-2 text-[13px] text-green-deep">{left === 0 ? t.events.full : `${left} ${t.events.seatsLeft}`}</span>}
          </Fact>
        )}
      </div>
      {e.is_online && e.online_url && reg?.status === "registered" && (
        <a href={e.online_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-3 w-full"><ExternalLink className="h-4 w-4" />{t.events.joinOnline}</a>
      )}

      {action && <div className="mt-5 hidden lg:block">{action}</div>}

      <p className="mt-6 whitespace-pre-line text-[16px] leading-8 text-ink-2">{tr(e.description, locale)}</p>

      {qr && reg && (
        <div className="mx-auto mt-8 max-w-sm overflow-hidden rounded-[24px] bg-white ring-1 ring-line">
          <div className="bg-navy px-6 py-4 text-white">
            <p className="text-[12px] text-mint">{t.events.ticket}</p>
            <p className="font-bold">{tr(e.title, locale)}</p>
          </div>
          <div className="flex flex-col items-center p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="QR" className="h-52 w-52" />
            <p className="mt-3 text-[13px] tracking-widest text-mist" dir="ltr">{reg.checkin_code}</p>
            <p className="mt-2 text-center text-[14px] text-ink-2">{reg.status === "attended" ? t.events.attended : t.events.ticketHint}</p>
          </div>
        </div>
      )}

      {action && (
        <div className={`fixed inset-x-0 z-20 border-t border-line bg-white/95 p-3 backdrop-blur lg:hidden ${inApp ? "bottom-[calc(64px+env(safe-area-inset-bottom))]" : "bottom-0 pb-[calc(12px+env(safe-area-inset-bottom))]"}`}>{action}</div>
      )}
    </div>
  );
}
