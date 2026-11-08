import { ExternalLink, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { reviewApplication } from "@/app/actions";
import { Empty, PageHeader, StatusBadge, Tabs } from "@/components/ui";
import { repo } from "@/lib/data";
import { labelFor } from "@/lib/dropdowns";
import { fmtDate, fmtRelative } from "@/lib/format";
import type { ApplicationStatus } from "@/lib/types";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireAdmin } from "@/lib/session";

export default async function Applications({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  await requireAdmin(locale);
  const q = await searchParams;
  const status = (sp(q.status) ?? "pending") as ApplicationStatus | "all";
  const [all, dd] = await Promise.all([repo.listApplications(), repo.listDropdowns().catch(() => [])]);
  const age = (dob: string | null) => (dob ? Math.floor((Date.now() - Date.parse(dob)) / (365.25 * 864e5)) : null);
  const yn = (v: boolean | null | undefined) => (v === true ? "✓" : v === false ? "✗" : "-");
  const L = {
    ar: { age: "العمر", gender: "الجنس", male: "ذكر", female: "أنثى", degree: "اللقب الأكاديمي", manager: "يشغل منصبًا إداريًا", mentoring: "شارك في برنامج إرشاد", reason: "سبب الرفض (يُرسل للمتقدم)", silent: "لا ترسل إشعارًا للمتقدم", notifyHint: "عند القبول أو الرفض يصل المتقدم بريد إلكتروني ورسالة واتساب تلقائيًا.", flagged: "مُعلَّم" },
    en: { age: "Age", gender: "Gender", male: "Male", female: "Female", degree: "Academic title", manager: "In a managerial role", mentoring: "Took part in mentoring", reason: "Rejection reason (sent to the applicant)", silent: "Don't notify the applicant", notifyHint: "On approve or reject, the applicant automatically gets an email and a WhatsApp message.", flagged: "Flagged" },
    he: { age: "גיל", gender: "מגדר", male: "זכר", female: "נקבה", degree: "תואר אקדמי", manager: "בתפקיד ניהולי", mentoring: "השתתף/ה בתוכנית מנטורינג", reason: "סיבת הדחייה (נשלחת למועמד/ת)", silent: "לא לשלוח הודעה למועמד/ת", notifyHint: "באישור או דחייה המועמד/ת מקבל/ת מייל והודעת וואטסאפ אוטומטית.", flagged: "מסומן" },
  }[locale];
  const list = status === "all" ? all : all.filter((a) => a.status === status);
  const selected = all.find((a) => a.id === sp(q.id)) ?? list[0];
  const b = `/${locale}/admin/applications`;
  const S = t.admin.statuses;
  const count = (s: ApplicationStatus) => all.filter((a) => a.status === s).length;
  return (
    <>
      <PageHeader title={t.admin.nav.applications} />
      <Tabs items={[
        { href: b, label: S.pending, active: status === "pending", count: count("pending") },
        { href: `${b}?status=approved`, label: S.approved, active: status === "approved", count: count("approved") },
        { href: `${b}?status=rejected`, label: S.rejected, active: status === "rejected", count: count("rejected") },
        { href: `${b}?status=all`, label: t.common.all, active: status === "all" },
      ]} />
      {list.length === 0 && !selected ? <Empty>{t.common.none}</Empty> : (
        <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
          <ul className="card h-fit divide-y divide-line overflow-hidden">
            {list.map((a) => (
              <li key={a.id}>
                <Link href={`${b}?status=${status}&id=${a.id}`} className={`block p-4 transition hover:bg-sky ${selected?.id === a.id ? "bg-mint-soft/60" : ""}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-bold">{a.full_name}</p>
                    <span className="shrink-0 text-xs text-mist">{fmtRelative(a.created_at, locale)}</span>
                  </div>
                  <p className="truncate text-sm text-ink-2" dir="auto">{a.headline}{a.company ? ` · ${a.company}` : ""}</p>
                </Link>
              </li>
            ))}
          </ul>
          {selected && (
            <article className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="h-display text-2xl">{selected.full_name}</h2>
                  <p className="text-ink-2" dir="auto">{selected.headline}{selected.company ? ` · ${selected.company}` : ""}</p>
                </div>
                <StatusBadge status={selected.status} label={S[selected.status]} />
              </div>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-mist" /><a href={`mailto:${selected.email}`} className="font-semibold hover:underline" dir="ltr">{selected.email}</a></div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-mist" /><a href={`tel:${selected.phone}`} className="font-semibold" dir="ltr">{selected.phone}</a></div>
                <div><dt className="text-xs text-mist">{t.common.years}</dt><dd className="font-bold">{selected.years_experience}</dd></div>
                <div><dt className="text-xs text-mist">{L.age}</dt><dd className="font-bold">{age(selected.date_of_birth) ?? "-"}{selected.date_of_birth ? <span className="ms-2 text-xs font-normal text-mist" dir="ltr">{selected.date_of_birth}</span> : null}</dd></div>
                <div><dt className="text-xs text-mist">{L.gender}</dt><dd className="font-bold">{selected.gender ? L[selected.gender] : "-"}</dd></div>
                <div><dt className="text-xs text-mist">{L.degree}</dt><dd className="font-bold">{labelFor(dd, "ACADEMIC_TITLE", selected.academic_title, locale) || "-"}</dd></div>
                <div><dt className="text-xs text-mist">{t.common.sector}</dt><dd className="font-bold">{labelFor(dd, "WORK_SECTOR", selected.sector, locale) || "-"}</dd></div>
                <div><dt className="text-xs text-mist">{t.common.city}</dt><dd className="font-bold">{labelFor(dd, "CITY", selected.city, locale) || "-"}</dd></div>
                <div><dt className="text-xs text-mist">{L.manager}</dt><dd className="font-bold">{yn(selected.is_manager)}</dd></div>
                <div><dt className="text-xs text-mist">{L.mentoring}</dt><dd className="font-bold">{yn(selected.mentoring_participated)}</dd></div>
                <div><dt className="text-xs text-mist">{t.apply.source}</dt><dd className="font-bold">{selected.referral_source ?? "-"}</dd></div>
                {selected.linkedin_url && <div className="sm:col-span-2"><a href={selected.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-navy"><ExternalLink className="h-4 w-4" />LinkedIn</a></div>}
              </dl>
              <div className="mt-5 rounded-xl bg-sky p-4">
                <p className="mb-1 text-xs font-bold text-mist">{t.apply.motivation}</p>
                <p className="whitespace-pre-line leading-relaxed" dir="auto">{selected.motivation}</p>
              </div>
              <p className="mt-3 text-xs text-mist">{fmtDate(selected.created_at, locale)}{selected.age_confirmed ? " · 18+ ✓" : ""}</p>
              <form action={reviewApplication} className="mt-5 space-y-3 border-t border-line pt-5">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="id" value={selected.id} />
                <input type="hidden" name="redirect" value={`${b}?status=${status}`} />
                <label className="block"><span className="label">{t.admin.note}</span><textarea name="note" rows={2} defaultValue={selected.review_note ?? ""} className="textarea min-h-0" /></label>
                <label className="block"><span className="label">{L.reason}</span><textarea name="reject_reason" rows={2} defaultValue={selected.reject_reason ?? ""} className="textarea min-h-0" /></label>
                <p className="text-xs text-mist">{L.notifyHint}</p>
                <label className="flex items-center gap-2 text-sm text-ink-2"><input type="checkbox" name="silent" value="1" className="h-4 w-4 accent-navy" />{L.silent}</label>
                <div className="flex flex-wrap gap-2">
                  <button name="status" value="approved" className="btn btn-primary">{t.admin.approve}</button>
                  <button name="status" value="rejected" className="btn btn-outline">{t.admin.reject}</button>
                  {selected.status !== "pending" && <button name="status" value="pending" className="btn btn-ghost">{S.pending}</button>}
                </div>
              </form>
            </article>
          )}
        </div>
      )}
    </>
  );
}
