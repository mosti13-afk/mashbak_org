import { Download, QrCode } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { checkinTicket } from "@/app/actions";
import { EventForm } from "@/components/admin/EventForm";
import { Avatar, Notice, PageHeader, StatusBadge, Tabs } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import { tr } from "@/i18n/config";
import { repo } from "@/lib/data";
import { displayName, fmtDate } from "@/lib/format";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireAdmin } from "@/lib/session";

export default async function AdminEvent({ params, searchParams }: { params: Promise<{ locale: string; id: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  await requireAdmin(locale);
  const { id } = await params;
  const q = await searchParams;
  const e = await repo.getEvent(id);
  if (!e) notFound();
  const tab = sp(q.tab) ?? (sp(q.code) || sp(q.result) ? "checkin" : "attendees");
  const att = await repo.listAttendees(id);
  const active = att.filter((a) => a.status !== "cancelled");
  const checked = att.filter((a) => a.checked_in_at).length;
  const b = `/${locale}/admin/events/${id}`;
  const result = sp(q.result);
  const S = t.admin.statuses;
  const csv = "data:text/csv;charset=utf-8," + encodeURIComponent(
    "﻿name,email,status,checked_in\n" + active.map((a) => [displayName(a.member, locale), a.member.email, a.status, a.checked_in_at ?? ""].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n"),
  );
  return (
    <>
      <Link href={`/${locale}/admin/events`} className="mb-4 inline-flex text-sm font-bold text-mist hover:text-navy"><span className="flip-rtl me-1 inline-block">←</span>{t.admin.nav.events}</Link>
      <PageHeader title={tr(e.title, locale)} sub={`${fmtDate(e.starts_at, locale, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })} · ${e.registered_count}${e.capacity ? ` / ${e.capacity}` : ""} · ${checked} ${t.admin.checkedIn}`}
        actions={<Link href={`/${locale}/app/events/${id}`} className="btn btn-outline btn-sm">{t.common.learnMore}</Link>} />
      <Tabs items={[
        { href: `${b}?tab=attendees`, label: t.admin.attendees, active: tab === "attendees", count: active.length },
        { href: `${b}?tab=checkin`, label: t.admin.checkin, active: tab === "checkin" },
        { href: `${b}?tab=edit`, label: t.common.edit, active: tab === "edit" },
      ]} />

      {tab === "edit" && <EventForm e={e} locale={locale} t={t} />}

      {tab === "checkin" && (
        <div className="mx-auto max-w-lg">
          {result === "ok" && <Notice>✓ {t.admin.checkinOk}: {sp(q.name)}</Notice>}
          {result === "dup" && <Notice tone="amber">{t.admin.checkinDup}: {sp(q.name)}</Notice>}
          {result === "bad" && <Notice tone="red">{t.admin.checkinBad}</Notice>}
          <form action={checkinTicket} className="card space-y-4 p-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-white"><QrCode className="h-7 w-7" /></span>
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="event_id" value={id} />
            <input name="code" required autoFocus defaultValue={sp(q.code) ?? ""} placeholder={t.admin.checkinPh} className="input text-center font-mono" dir="ltr" />
            <SubmitButton className="btn btn-primary btn-lg w-full">{t.admin.checkin}</SubmitButton>
            <p className="text-sm text-mist">{checked} / {active.length} {t.admin.checkedIn}</p>
          </form>
        </div>
      )}

      {tab === "attendees" && (
        <>
          <div className="mb-3 flex justify-end"><a href={csv} download={`attendees-${id}.csv`} className="btn btn-outline btn-sm"><Download className="h-4 w-4" />CSV</a></div>
          <div className="card overflow-x-auto">
            <table className="table min-w-[560px]">
              <thead><tr><th>{t.common.name}</th><th>{t.common.status}</th><th>{t.admin.checkin}</th></tr></thead>
              <tbody>
                {att.map((a) => {
                  const n = displayName(a.member, locale);
                  return (
                    <tr key={a.id}>
                      <td><span className="flex items-center gap-3"><Avatar src={a.member.avatar_url} name={n} size={34} /><span><span className="block font-bold">{n}</span><span className="text-xs text-mist" dir="ltr">{a.member.email}</span></span></span></td>
                      <td><StatusBadge status={a.status} label={S[a.status]} /></td>
                      <td className="text-ink-2">{a.checked_in_at ? fmtDate(a.checked_in_at, locale, { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
