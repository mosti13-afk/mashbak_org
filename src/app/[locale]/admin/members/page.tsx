import { Search } from "lucide-react";
import Link from "next/link";
import { adminUpdateMember } from "@/app/actions";
import { Avatar, PageHeader, StatusBadge } from "@/components/ui";
import { repo } from "@/lib/data";
import { displayName, fmtDate } from "@/lib/format";
import { pageLocale, sp, type SearchParams } from "@/lib/page";
import { requireAdmin } from "@/lib/session";

export default async function AdminMembers({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, t } = await pageLocale(params);
  const me = await requireAdmin(locale);
  const query = (sp((await searchParams).q) ?? "").toLowerCase();
  const all = await repo.listAllMembers();
  const list = all.filter((m) => !query || [m.full_name_ar, m.full_name_en, m.email, m.company, m.headline].some((s) => s?.toLowerCase().includes(query)));
  const S = t.admin.statuses;
  return (
    <>
      <PageHeader title={t.admin.nav.members} sub={`${all.filter((m) => m.status === "active").length} ${t.admin.stats.members}`} />
      <form className="card mb-5 flex gap-2 p-2">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
          <input name="q" defaultValue={query} placeholder={`${t.common.search}…`} className="input border-0 ps-10 focus:ring-0" />
        </label>
        <button className="btn btn-primary">{t.common.search}</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="table min-w-[760px]">
          <thead><tr><th>{t.common.name}</th><th>{t.common.headline}</th><th>{t.admin.role}</th><th>{t.common.status}</th><th>{t.common.date}</th><th>{t.common.actions}</th></tr></thead>
          <tbody>
            {list.map((m) => {
              const name = displayName(m, locale);
              const self = m.id === me.id;
              return (
                <tr key={m.id}>
                  <td>
                    <Link href={`/${locale}/app/members/${m.id}`} className="flex items-center gap-3">
                      <Avatar src={m.avatar_url} name={name} size={36} />
                      <span className="min-w-0"><span className="block font-bold">{name}</span><span className="block text-xs text-mist" dir="ltr">{m.email}</span></span>
                    </Link>
                  </td>
                  <td className="text-ink-2" dir="auto">{m.headline}{m.company ? ` · ${m.company}` : ""}</td>
                  <td>{m.role === "admin" ? <span className="badge badge-navy">{t.common.admin}</span> : <span className="text-ink-2">—</span>}</td>
                  <td><StatusBadge status={m.status} label={S[m.status]} /></td>
                  <td className="whitespace-nowrap text-ink-2">{fmtDate(m.created_at, locale, { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td>
                    {!self && (
                      <form action={adminUpdateMember} className="flex gap-1.5">
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="id" value={m.id} />
                        <button name="status" value={m.status === "active" ? "suspended" : "active"} className="btn btn-outline btn-sm">{m.status === "active" ? t.admin.suspend : t.admin.activate}</button>
                        <button name="role" value={m.role === "admin" ? "member" : "admin"} className="btn btn-ghost btn-sm">{m.role === "admin" ? t.admin.makeMember : t.admin.makeAdmin}</button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
