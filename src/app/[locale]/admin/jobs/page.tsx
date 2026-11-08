import Link from "next/link";
import { adminDeleteJob, toggleJob } from "@/app/actions";
import { PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/ui/client";
import { repo } from "@/lib/data";
import { fmtRelative } from "@/lib/format";
import { pageLocale, type LocaleParams } from "@/lib/page";
import { requireAdmin } from "@/lib/session";

export default async function AdminJobs({ params }: LocaleParams) {
  const { locale, t } = await pageLocale(params);
  await requireAdmin(locale);
  const jobs = await repo.listAllJobs();
  const J = t.app.jobs;
  return (
    <>
      <PageHeader title={t.admin.nav.jobs} sub={J.newSub} />
      <div className="card overflow-x-auto">
        <table className="table min-w-[760px]">
          <thead><tr><th>{J.fTitle}</th><th>{J.postedBy}</th><th>{J.requests}</th><th>{t.common.status}</th><th>{t.common.actions}</th></tr></thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td><Link href={`/${locale}/app/jobs/${j.id}`} className="font-bold hover:underline" dir="auto">{j.title}</Link><span className="block text-xs text-mist">{j.company} · {fmtRelative(j.created_at, locale)}</span></td>
                <td className="text-ink-2">{j.poster_name}</td>
                <td className="font-bold">{j.referral_count}</td>
                <td>{j.is_open ? <span className="badge badge-mint">{t.common.active}</span> : <span className="badge badge-gray">{J.closed}</span>}</td>
                <td>
                  <div className="flex gap-1.5">
                    <form action={toggleJob}>
                      <input type="hidden" name="locale" value={locale} /><input type="hidden" name="id" value={j.id} />
                      <input type="hidden" name="open" value={j.is_open ? "0" : "1"} /><input type="hidden" name="as_admin" value="true" />
                      <input type="hidden" name="redirect" value={`/${locale}/admin/jobs`} />
                      <SubmitButton className="btn btn-outline btn-sm">{j.is_open ? J.closeRole : J.reopen}</SubmitButton>
                    </form>
                    <form action={adminDeleteJob}>
                      <input type="hidden" name="locale" value={locale} /><input type="hidden" name="id" value={j.id} />
                      <SubmitButton className="btn btn-ghost btn-sm text-[#b3261e]" confirm={`${t.common.delete}?`}>{t.common.delete}</SubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
