import { Building2, ExternalLink, MapPin, MessageCircle } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requestConnection } from "@/app/actions";
import { Avatar } from "@/components/ui";
import { Dialog, SubmitButton } from "@/components/ui/client";
import { repo } from "@/lib/data";
import { displayName, waLink } from "@/lib/format";
import { pageLocale } from "@/lib/page";
import { requireMember } from "@/lib/session";

export default async function MemberPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, t } = await pageLocale(params);
  const v = await requireMember(locale);
  const { id } = await params;
  if (id === v.id) redirect(`/${locale}/app/profile`);
  const m = await repo.getMember(id, v.id);
  if (!m) notFound();
  const name = displayName(m, locale);
  const c = m.connection;
  let phone: string | null = null;
  if (c?.status === "accepted") phone = (await repo.listConnections(v.id)).find((x) => x.id === c.id)?.phone ?? null;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/${locale}/app/members`} className="mb-4 inline-flex text-sm font-bold text-mist hover:text-navy">← {t.app.members.title}</Link>
      <div className="card overflow-hidden">
        <div className="mesh h-28" />
        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            <Avatar src={m.avatar_url} name={name} size={104} ring />
            <div className="flex gap-2">
              {m.linkedin_url && <a href={m.linkedin_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm"><ExternalLink className="h-4 w-4" />LinkedIn</a>}
              {!c && (
                <Dialog trigger={<><MessageCircle className="h-4 w-4" />{t.app.members.connect}</>} triggerClass="btn btn-primary btn-sm" title={t.app.members.connectTitle}>
                  <p className="mb-4 text-sm text-ink-2">{t.app.members.connectHint}</p>
                  <form action={requestConnection} className="space-y-4">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="to" value={m.id} />
                    <textarea name="message" required minLength={5} maxLength={600} rows={5} className="textarea" placeholder={t.app.members.connectPh} />
                    <SubmitButton className="btn btn-primary w-full">{t.app.members.send}</SubmitButton>
                  </form>
                </Dialog>
              )}
              {c?.status === "pending" && <span className="badge badge-amber px-3 py-2">{c.recipient_id === v.id ? t.app.connections.pending : t.app.members.pending}</span>}
              {c?.status === "accepted" && phone && (
                <a href={waLink(phone, t.app.connections.waText)} target="_blank" rel="noreferrer" className="btn btn-sm bg-[#25d366] text-white hover:bg-[#1fb457]">
                  <MessageCircle className="h-4 w-4" />{t.app.connections.whatsapp}
                </a>
              )}
              {c?.status === "accepted" && !phone && <span className="badge badge-navy px-3 py-2">{t.app.members.connected}</span>}
            </div>
          </div>
          <h1 className="h-display mt-4 text-3xl">{name}</h1>
          <p className="mt-1 text-lg font-semibold text-ink-2" dir="auto">{m.headline}</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-mist">
            {m.company && <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" />{m.company}</span>}
            {m.city && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{m.city}</span>}
            {m.years_experience != null && <span>{m.years_experience} {t.common.yearsShort}</span>}
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {m.sector && <span className="badge badge-gray">{m.sector}</span>}
            {m.open_to_mentoring && <span className="badge badge-mint">{t.app.members.mentor}</span>}
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-[1.5fr_1fr]">
        {m.bio && (
          <section className="card p-6">
            <h2 className="mb-2 font-black text-navy-ink">{t.app.members.about}</h2>
            <p className="whitespace-pre-line leading-relaxed text-ink-2">{m.bio}</p>
          </section>
        )}
        <section className="card space-y-5 p-6">
          {m.career_goals.length > 0 && (
            <div>
              <h2 className="mb-2 font-black text-navy-ink">{t.app.members.goals}</h2>
              <div className="flex flex-wrap gap-1.5">{m.career_goals.map((g) => <span key={g} className="chip">{g}</span>)}</div>
            </div>
          )}
          {m.interests.length > 0 && (
            <div>
              <h2 className="mb-2 font-black text-navy-ink">{t.app.members.interests}</h2>
              <div className="flex flex-wrap gap-1.5">{m.interests.map((g) => <span key={g} className="chip">{g}</span>)}</div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
