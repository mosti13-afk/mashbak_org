import { Building2, ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requestReferral, respondReferral, toggleJob } from "@/app/actions";
import { Avatar, Empty, StatusBadge } from "@/components/ui";
import { Dialog, SubmitButton } from "@/components/ui/client";
import { repo } from "@/lib/data";
import { displayName, fmtRelative } from "@/lib/format";
import { pageLocale } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function JobPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, t } = await pageLocale(params);
  const v = await requireMember(locale);
  const { id } = await params;
  const j = await repo.getJob(id, v.id);
  if (!j) notFound();
  const J = t.app.jobs;
  const mine = j.posted_by === v.id;
  const refs = mine ? await repo.listReferralsForJob(j.id) : [];
  const poster = displayName(j.poster, locale);
  const refLabel = { pending: J.referralSent, accepted: J.referralAccepted, declined: J.referralDeclined };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <article>
        <Link href={`/${locale}/app/jobs`} className="mb-4 inline-flex text-sm font-bold text-mist hover:text-navy"><span className="flip-rtl me-1 inline-block">←</span>{J.title}</Link>
        <div className="card p-6 sm:p-8">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {j.is_managerial && <span className="badge badge-navy">{J.managerial}</span>}
            <span className="badge badge-gray">{J.types[j.job_type]}</span>
            <span className="badge badge-gray">{J.modes[j.work_mode]}</span>
            {!j.is_open && <span className="badge badge-red">{J.closed}</span>}
          </div>
          <h1 className="h-display text-3xl" dir="auto">{j.title}</h1>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-ink-2">
            <span className="flex items-center gap-1.5 font-bold"><Building2 className="h-4 w-4" />{j.company}</span>
            {j.city && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{j.city}</span>}
            <span className="text-mist">{fmtRelative(j.created_at, locale)}</span>
          </p>
          <div className="mt-6 space-y-6 border-t border-line pt-6">
            <section>
              <h2 className="mb-2 font-black text-navy-ink">{J.fDescription}</h2>
              <p className="whitespace-pre-line leading-relaxed text-ink-2" dir="auto">{j.description}</p>
            </section>
            {j.requirements && (
              <section>
                <h2 className="mb-2 font-black text-navy-ink">{J.fRequirements}</h2>
                <p className="whitespace-pre-line leading-relaxed text-ink-2" dir="auto">{j.requirements}</p>
              </section>
            )}
          </div>
        </div>

        {mine && (
          <section className="mt-6">
            <h2 className="mb-3 text-lg font-black text-navy-ink">{J.requests} ({refs.length})</h2>
            {refs.length === 0 ? <Empty>{J.noRequests}</Empty> : (
              <ul className="space-y-3">
                {refs.map((r) => {
                  const n = displayName(r.requester, locale);
                  return (
                    <li key={r.id} className="card p-5">
                      <div className="flex flex-wrap items-start gap-4">
                        <Link href={`/${locale}/app/members/${r.requester.id}`}><Avatar src={r.requester.avatar_url} name={n} size={48} /></Link>
                        <div className="min-w-0 flex-1">
                          <Link href={`/${locale}/app/members/${r.requester.id}`} className="font-black hover:underline">{n}</Link>
                          <p className="text-sm text-ink-2" dir="auto">{r.requester.headline}{r.requester.company ? ` · ${r.requester.company}` : ""}</p>
                          <p className="mt-3 whitespace-pre-line rounded-xl bg-paper p-3 text-sm leading-relaxed text-ink-2" dir="auto">{r.message}</p>
                          {r.cv_url && <a href={r.cv_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-navy"><ExternalLink className="h-3.5 w-3.5" />{J.cvUrl}</a>}
                        </div>
                        {r.status === "pending" ? (
                          <div className="flex w-full gap-2 sm:w-auto sm:flex-col">
                            {[["1", t.app.connections.accept, "btn btn-primary btn-sm"], ["0", t.app.connections.decline, "btn btn-outline btn-sm"]].map(([a, l, cls]) => (
                              <form key={a} action={respondReferral} className="flex-1">
                                <input type="hidden" name="locale" value={locale} />
                                <input type="hidden" name="id" value={r.id} />
                                <input type="hidden" name="job_id" value={j.id} />
                                <input type="hidden" name="accept" value={a} />
                                <SubmitButton className={`${cls} w-full`}>{l}</SubmitButton>
                              </form>
                            ))}
                          </div>
                        ) : <StatusBadge status={r.status} label={refLabel[r.status]} />}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}
      </article>

      <aside className="space-y-4 lg:pt-10">
        <div className="card p-6">
          <p className="mb-3 text-xs font-bold text-mist">{J.postedBy}</p>
          <Link href={mine ? `/${locale}/app/profile` : `/${locale}/app/members/${j.poster.id}`} className="flex items-center gap-3">
            <Avatar src={j.poster.avatar_url} name={poster} size={52} />
            <div className="min-w-0">
              <p className="font-black">{poster}</p>
              <p className="truncate text-sm text-ink-2" dir="auto">{j.poster.headline}{j.poster.company ? ` · ${j.poster.company}` : ""}</p>
            </div>
          </Link>
          <div className="mt-5 border-t border-line pt-5">
            {mine ? (
              <div className="space-y-2">
                <p className="text-center text-sm font-bold text-green-deep">{J.yours}</p>
                <form action={toggleJob}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="id" value={j.id} />
                  <input type="hidden" name="open" value={j.is_open ? "0" : "1"} />
                  <SubmitButton className="btn btn-outline w-full">{j.is_open ? J.closeRole : J.reopen}</SubmitButton>
                </form>
              </div>
            ) : j.my_referral ? (
              <div className="text-center"><StatusBadge status={j.my_referral.status} label={refLabel[j.my_referral.status]} /></div>
            ) : j.is_open ? (
              <Dialog trigger={J.requestReferral} triggerClass="btn btn-primary btn-lg w-full" title={J.referralTitle}>
                <p className="mb-4 text-sm text-ink-2">{J.referralHint}</p>
                <form action={requestReferral} className="space-y-4">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="job_id" value={j.id} />
                  <textarea name="message" required minLength={5} rows={5} className="textarea" placeholder={J.referralPh} dir="auto" />
                  <input name="cv_url" type="url" className="input" dir="ltr" placeholder={`${J.cvUrl} (${t.common.optional})`} />
                  <SubmitButton className="btn btn-primary w-full">{t.common.send}</SubmitButton>
                </form>
              </Dialog>
            ) : null}
            {j.apply_url && <a href={j.apply_url} target="_blank" rel="noreferrer" className="btn btn-ghost mt-2 w-full"><ExternalLink className="h-4 w-4" />{J.applyLink}</a>}
          </div>
        </div>
      </aside>
    </div>
  );
}
